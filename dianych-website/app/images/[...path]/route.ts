import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Serve images from the filesystem so that runtime-added files are accessible even in standalone builds.
export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const parts = params.path || [];
    // Prevent directory traversal
    const safeParts = parts.filter((p) => !p.includes('..') && !path.isAbsolute(p));
    const relPath = safeParts.join(path.sep);

    const filePath = path.join(process.cwd(), 'public', 'images', relPath);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.png'
        ? 'image/png'
        : ext === '.webp'
        ? 'image/webp'
        : ext === '.gif'
        ? 'image/gif'
        : ext === '.svg'
        ? 'image/svg+xml'
        : 'application/octet-stream';

    const file = await fs.promises.readFile(filePath);
    const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    return new NextResponse(arrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Let browser cache but allow revalidation
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (err) {
    return new NextResponse('Internal Server Error: ' + err, { status: 500 });
  }
}
