import { readFile, writeFile } from 'fs/promises';
import sharp from 'sharp';

export const GALLERY_MAX_EDGE = 1600;
export const JPEG_QUALITY = 82;
export const WEBP_QUALITY = 82;

function maxEdgeFor(filename: string): number {
    if (/^main_logo\./i.test(filename)) return 512;
    if (/_link\./i.test(filename)) return 256;
    if (/_icon\./i.test(filename)) return 256;
    if (/^phone_img\./i.test(filename)) return 768;
    return GALLERY_MAX_EDGE;
}

export async function optimizeImageBuffer(input: Buffer, filename: string): Promise<Buffer> {
    if (/\.(gif|bmp|tiff?|svg)$/i.test(filename)) {
        return input;
    }

    const max = maxEdgeFor(filename);
    const pipeline = sharp(input).rotate().resize({
        width: max,
        height: max,
        fit: 'inside',
        withoutEnlargement: true,
    });

    if (/\.webp$/i.test(filename)) {
        return pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    }
    if (/\.png$/i.test(filename)) {
        return pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer();
    }
    return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

export async function optimizeImageFile(filePath: string): Promise<{ before: number; after: number; wrote: boolean }> {
    const input = await readFile(filePath);
    const filename = filePath.split('/').pop() ?? filePath;
    const output = await optimizeImageBuffer(input, filename);
    const wrote = output.length < input.length;
    if (wrote) {
        await writeFile(filePath, output);
    }
    return { before: input.length, after: wrote ? output.length : input.length, wrote };
}
