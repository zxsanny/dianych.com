'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

// Define a type for the form state to provide clear feedback
export interface FormState {
    message: string;
    status: 'success' | 'error' | 'idle';
}

export async function uploadImages(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const folder = formData.get('folder') as string;
    const files = formData.getAll('files') as File[];

    const allowedFolders = ['brooches', 'clothes', 'panel', 'felting', 'kits'];

    // --- Validation ---
    if (!folder || !allowedFolders.includes(folder)) {
        return { message: 'Please select a valid folder.', status: 'error' };
    }
    if (!files || files.length === 0 || files[0].size === 0) {
        return { message: 'Please select at least one file to upload.', status: 'error' };
    }
    // --- End Validation ---

    const uploadPath = join(process.cwd(), 'public', 'images', folder);
    let uploadedFileCount = 0;

    for (const file of files) {
        try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Sanitize filename to prevent security issues
            const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
            const path = join(uploadPath, sanitizedFilename);
            await writeFile(path, buffer);
            uploadedFileCount++;
        } catch (error) {
            console.error(`Failed to write file ${file.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                message: `Failed to upload ${file.name}. Reason: ${errorMessage}`,
                status: 'error',
            };
        }
    }

    // Revalidate the homepage to show the new images immediately
    revalidatePath('/');

    return {
        message: `Successfully uploaded ${uploadedFileCount} image(s) to the '${folder}' gallery.`,
        status: 'success',
    };
}