import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { memoryCache, getDiskCachePath, buildCacheKey, regenerateGalleryPack } from './cache';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const galleryId = url.searchParams.get('galleryId');
    if (!galleryId) {
      return NextResponse.json({ error: 'galleryId is required' }, { status: 400 });
    }

    // Optional size parameter coming from GalleryCarousel
    const sizeParam = url.searchParams.get('size');
    let width = Number.parseInt(sizeParam || '');
    if (!Number.isFinite(width)) width = 500;
    // Clamp to reasonable bounds to prevent abuse
    width = Math.max(64, Math.min(700, width));

    const version = 1;

    const cacheKey = buildCacheKey(galleryId, width, version);

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
    const diskPath = getDiskCachePath(galleryId, width, version);
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

    // 3) Generate pack via shared generator
    const payload = await regenerateGalleryPack(galleryId, width, version);

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
