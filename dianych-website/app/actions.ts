'use server';

import { writeFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { revalidatePath } from 'next/cache';
import { getImagePaths } from '@/lib/galleryUtils';

export interface FormState {
    message: string;
    status: 'success' | 'error' | 'idle';
}

const allowedFolders = ['brooches', 'clothes', 'panel', 'felting', 'kits'];

export async function uploadImages(prevState: FormState, formData: FormData): Promise<FormState> {
    const folder = formData.get('folder') as string;
    const files = formData.getAll('files') as File[];

    if (!folder || !allowedFolders.includes(folder)) {
        return { message: 'Please select a valid folder.', status: 'error' };
    }
    if (!files || files.length === 0 || files[0].size === 0) {
        return { message: 'Please select at least one file to upload.', status: 'error' };
    }

    const uploadPath = join(process.cwd(), 'public', 'images', folder);
    let uploadedFileCount = 0;

    for (const file of files) {
        try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
            const path = join(uploadPath, sanitizedFilename);
            await writeFile(path, buffer);
            uploadedFileCount++;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { message: `Failed to upload ${file.name}. Reason: ${errorMessage}`, status: 'error' };
        }
    }

    revalidatePath('/');
    revalidatePath('/manage'); // Revalidate the manage page

    return { message: `Successfully uploaded ${uploadedFileCount} image(s) to the '${folder}' gallery.`, status: 'success' };
}

export async function getGalleryImages(folder: string): Promise<string[]> {
    if (!folder || !allowedFolders.includes(folder)) {
        return [];
    }
    return getImagePaths(folder);
}

export async function deleteImage(prevState: FormState, formData: FormData): Promise<FormState> {
    const imagePath = formData.get('imagePath') as string;
    if (!imagePath) {
        return { message: 'Invalid image path.', status: 'error' };
    }

    const basePath = resolve(process.cwd(), 'public');
    const fullPath = resolve(basePath, imagePath.substring(1));

    if (!fullPath.startsWith(basePath)) {
        return { message: 'Unauthorized file path.', status: 'error' };
    }

    try {
        await unlink(fullPath);
        revalidatePath('/');
        revalidatePath('/manage');
        return { message: `Successfully deleted ${imagePath}.`, status: 'success' };
    } catch (error) {
        return { message: 'Failed to delete file. Error' + error, status: 'error' };
    }
}