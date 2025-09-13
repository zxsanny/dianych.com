import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const galleryId = url.searchParams.get('galleryId') || '';
    const cwd = process.cwd();
    const imagesDirectory = path.join(cwd, 'public', 'images', galleryId);

    try {
        const exists = fs.existsSync(imagesDirectory);
        const files = exists ? fs.readdirSync(imagesDirectory) : [];
        return NextResponse.json({ cwd, imagesDirectory, exists, files });
    } catch (error) {
        return NextResponse.json({ cwd, imagesDirectory, error: String(error) }, { status: 500 });
    }
}