'use server';

import { writeFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { revalidatePath } from 'next/cache';
import { getImagePaths } from '@/lib/galleryUtils';
import { invalidateCache } from '@/app/api/gallery-pack/cache';
import { getSession } from '@/lib/session';
import { isGalleryId } from '@/lib/galleryIds';
import { optimizeImageBuffer } from '@/lib/optimizeImage';

export interface FormState {
    message: string;
    status: 'success' | 'error' | 'idle';
}

const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i;

const IMAGE_MAGIC: [number[], string][] = [
    [[0xFF, 0xD8, 0xFF], 'JPEG'],
    [[0x89, 0x50, 0x4E, 0x47], 'PNG'],
    [[0x47, 0x49, 0x46, 0x38], 'GIF'],
    [[0x49, 0x49, 0x2A, 0x00], 'TIFF'],
    [[0x4D, 0x4D, 0x00, 0x2A], 'TIFF'],
    [[0x42, 0x4D], 'BMP'],
];

function isImageBuffer(buf: Buffer, filename: string): boolean {
    if (/\.webp$/i.test(filename)) {
        return buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
            && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
    }
    return IMAGE_MAGIC.some(([magic]) => magic.every((b, i) => buf[i] === b));
}

async function requireAuth(): Promise<FormState | null> {
    const session = await getSession();
    if (!session.isLoggedIn) return { message: 'Unauthorized.', status: 'error' };
    return null;
}

export async function uploadImages(prevState: FormState, formData: FormData): Promise<FormState> {
    const authErr = await requireAuth();
    if (authErr) return authErr;

    const folder = formData.get('folder') as string;
    const files = formData.getAll('files') as File[];

    if (!folder || !isGalleryId(folder)) {
        return { message: 'Please select a valid folder.', status: 'error' };
    }
    if (!files || files.length === 0 || files[0].size === 0) {
        return { message: 'Please select at least one file to upload.', status: 'error' };
    }

    const basePath = resolve(process.cwd(), 'public', 'images', folder);
    let uploadedFileCount = 0;

    for (const file of files) {
        try {
            const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
            if (!ALLOWED_EXTENSIONS.test(sanitizedFilename)) {
                return { message: `Rejected '${file.name}': not an allowed image type.`, status: 'error' };
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            if (!isImageBuffer(buffer, sanitizedFilename)) {
                return { message: `Rejected '${file.name}': file content is not a valid image.`, status: 'error' };
            }

            const fullPath = resolve(basePath, sanitizedFilename);
            if (!fullPath.startsWith(basePath)) {
                return { message: 'Unauthorized file path.', status: 'error' };
            }

            const optimized = await optimizeImageBuffer(buffer, sanitizedFilename);
            await writeFile(fullPath, optimized);
            uploadedFileCount++;
        } catch (error) {
            console.error('uploadImages', error);
            return { message: `Failed to upload ${file.name}.`, status: 'error' };
        }
    }

    revalidatePath('/');
    revalidatePath('/manage');

    try {
        invalidateCache(folder, 500, 1);
    } catch (error) {
        console.error('invalidateCache', error);
    }

    return { message: `Successfully uploaded ${uploadedFileCount} image(s) to the '${folder}' gallery.`, status: 'success' };
}

export async function getGalleryImages(folder: string): Promise<string[]> {
    if (!folder || !isGalleryId(folder)) {
        return [];
    }
    return getImagePaths(folder);
}

export async function deleteImage(prevState: FormState, formData: FormData): Promise<FormState> {
    const authErr = await requireAuth();
    if (authErr) return authErr;

    const imagePath = formData.get('imagePath') as string;
    if (!imagePath) {
        return { message: 'Invalid image path.', status: 'error' };
    }

    const imagesBase = resolve(process.cwd(), 'public', 'images');
    const fullPath = resolve(imagesBase, imagePath.replace(/^\/images\//, ''));

    if (!fullPath.startsWith(imagesBase)) {
        return { message: 'Unauthorized file path.', status: 'error' };
    }

    const relParts = fullPath.substring(imagesBase.length + 1).split('/');
    if (relParts.length !== 2 || !isGalleryId(relParts[0])) {
        return { message: 'Can only delete images from gallery folders.', status: 'error' };
    }

    try {
        await unlink(fullPath);
        revalidatePath('/');
        revalidatePath('/manage');

        // Derive galleryId from /images/<galleryId>/<file>
        const parts = imagePath.split('/').filter(Boolean);
        const idx = parts.indexOf('images');
        const galleryId = idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : '';
        if (galleryId) {
            try {
                invalidateCache(galleryId, 500, 1);
            } catch (error) {
                console.error('invalidateCache', error);
            }
        }

        return { message: `Successfully deleted ${imagePath}.`, status: 'success' };
    } catch (error) {
        console.error('deleteImage', error);
        return { message: 'Failed to delete file.', status: 'error' };
    }
}