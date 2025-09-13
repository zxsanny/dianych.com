import fs from 'fs';
import path from 'path';

export const getImagePaths = (galleryId: string): string[] => {
    const imagesDirectory = path.join(process.cwd(), 'public', 'images', galleryId);
    try {
        const filenames = fs.readdirSync(imagesDirectory);

        const sortedFilenames = filenames.sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );

        // Build URLs that point to the dynamic API route, ensuring runtime-uploaded files are served
        // even in standalone deployments where the static file server can't see new files.
        return sortedFilenames.map((filename) => `/api/images/${galleryId}/${filename}`);
    } catch (error) {
        console.error(`Error reading directory for gallery '${galleryId}':`, error);
        return [];
    }
};