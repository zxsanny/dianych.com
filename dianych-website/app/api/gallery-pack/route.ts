import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { memoryCache, getDiskCachePath } from './cache';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const galleryId = url.searchParams.get('galleryId');
    if (!galleryId) {
      return NextResponse.json({ error: 'galleryId is required' }, { status: 400 });
    }

    const cacheKey = `${galleryId}|w500|v1`;

    // 1) Memory cache
    const mem = memoryCache.get(cacheKey as string);
    if (mem) {
      return NextResponse.json(mem.payload, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    // 2) Disk cache
    const diskPath = getDiskCachePath(galleryId);
    if (fs.existsSync(diskPath)) {
      try {
        const file = fs.readFileSync(diskPath, 'utf-8');
        const payload = JSON.parse(file);
        memoryCache.set(cacheKey, { updatedAt: Date.now(), payload });
        return NextResponse.json(payload, {
          headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=300',
          },
        });
      } catch {
        // If parsing fails, delete the broken cache file
        try { fs.unlinkSync(diskPath); } catch {}
      }
    }

    // 3) Generate pack
    const imagesDirectory = path.join(process.cwd(), 'public', 'images', galleryId);
    if (!fs.existsSync(imagesDirectory)) {
      return NextResponse.json({ error: `Gallery '${galleryId}' not found` }, { status: 404 });
    }

    const allFiles = fs.readdirSync(imagesDirectory);
    // Filter common image extensions
    const imageFiles = allFiles
      .filter((f) => /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    // Process sequentially to limit memory usage (could be parallel with Promise.allSettled if needed)
    // Try sharp first (fast, efficient). If unavailable on this Linux env, fall back to Jimp (pure JS, slower but portable)
    let useSharp = false;
    let sharp: any = null;
    try {
      if (!process.env.SHARP_BACKEND) {
        process.env.SHARP_BACKEND = 'wasm';
      }
      // dynamic import to avoid bundling native at eval time
      const mod: any = await import('sharp');
      sharp = mod.default ?? mod;
      useSharp = typeof sharp === 'function';
    } catch {
      useSharp = false;
    }

    // Lazy import Jimp only if sharp is not available
    let Jimp: any = null;
    if (!useSharp) {
      try {
        const mod: any = await import('jimp');
        Jimp = mod.Jimp ?? mod.default ?? mod;
      } catch (e) {
        return NextResponse.json({ error: `Image processing libs unavailable: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
      }
    }

    const entries: { name: string; dataUrl: string }[] = [];
    for (const filename of imageFiles) {
      const fullPath = path.join(imagesDirectory, filename);
      try {
        const input = fs.readFileSync(fullPath);
        let buf: Buffer;
        if (useSharp && sharp) {
          // Resize to width 500, keep aspect ratio, convert to webp
          buf = await sharp(input).rotate().resize({ width: 500 }).webp({ quality: 76 }).toBuffer();
        } else {
          // Jimp fallback (no native deps). Note: orientation metadata may not be auto-applied.
          const image = await Jimp.read(input);
          image.resize(500, Jimp.AUTO);
          // Set quality for webp if supported by this Jimp build
          if (typeof image.quality === 'function') {
            image.quality(76);
          }
          buf = await image.getBuffer('image/webp');
        }
        const b64 = buf.toString('base64');
        const dataUrl = `data:image/webp;base64,${b64}`;
        entries.push({ name: filename, dataUrl });
      } catch (e) {
        console.error(`Error processing image '${filename}':`, e);
      }
    }

    const payload = { galleryId, width: 500, version: 1, images: entries };

    try {
      fs.writeFileSync(diskPath, JSON.stringify(payload));
    } catch {}

    memoryCache.set(cacheKey, { updatedAt: Date.now(), payload });

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    const message = (error instanceof Error && error.message) ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
