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
    let useSharp: boolean;
    let sharpFn: ((input?: string | Buffer | Uint8Array) => import('sharp').Sharp) | null = null;
    try {
      if (!process.env.SHARP_BACKEND) {
        process.env.SHARP_BACKEND = 'wasm';
      }
      // dynamic import to avoid bundling native at eval time
      const mod: unknown = await import('sharp');
      const candidate = (mod as { default?: unknown }).default ?? mod;
      if (typeof candidate === 'function') {
        sharpFn = candidate as (input?: string | Buffer | Uint8Array) => import('sharp').Sharp;
        useSharp = true;
      } else {
        useSharp = false;
      }
    } catch {
      useSharp = false;
    }

    // Lazy import Jimp only if sharp is not available
    type JimpClass = typeof import('jimp').Jimp;
    let JimpCls: JimpClass | undefined;
    if (!useSharp) {
      try {
        const mod: unknown = await import('jimp');
        const candidate = (mod as { Jimp?: unknown; default?: unknown }).Jimp ?? (mod as { default?: unknown }).default ?? mod;
        if (candidate && typeof candidate === 'function') {
          JimpCls = candidate as JimpClass;
        }
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
        if (useSharp && sharpFn) {
          // Resize to width 500, keep aspect ratio, convert to webp
          buf = await sharpFn(input).rotate().resize({ width: 500 }).webp({ quality: 76 }).toBuffer();
        } else {
          // Jimp fallback (no native deps). Note: orientation metadata may not be auto-applied.
          if (!JimpCls) {
            throw new Error('Jimp is unavailable');
          }
          const image = await JimpCls.read(input);
          image.resize(500, JimpCls.AUTO);
          // Set quality for webp if supported by this Jimp build
          type MaybeQuality = { quality?: (q: number) => unknown };
          const iq = image as unknown as MaybeQuality;
          if (typeof iq.quality === 'function') {
            iq.quality(76);
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
