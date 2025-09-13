import fs from 'fs';
import path from 'path';

export const getImagePaths = (galleryId: string): string[] => {
    const imagesDirectory = path.join(process.cwd(), 'public', 'images', galleryId);
    try {
        const filenames = fs.readdirSync(imagesDirectory);

        const sortedFilenames = filenames.sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );

        // Append a cache-busting query using the file's last modified time.
        // This ensures that if a file is replaced with the same name, clients fetch the new bytes.
        return sortedFilenames.map((filename) => {
            try {
                const filePath = path.join(imagesDirectory, filename);
                const stats = fs.statSync(filePath);
                const version = Math.floor(stats.mtimeMs);
                return `/images/${galleryId}/${filename}?v=${version}`;
            } catch {
                // If stat fails for any reason, fall back to the plain path.
                return `/images/${galleryId}/${filename}`;
            }
        });
    } catch (error) {
        console.error(`Error reading directory for gallery '${galleryId}':`, error);
        return [];
    }
};