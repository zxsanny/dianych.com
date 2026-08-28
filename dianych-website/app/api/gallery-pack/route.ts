import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { memoryCache, getDiskCachePath, buildCacheKey, regenerateGalleryPack } from './cache';
import { isGalleryId } from '@/lib/galleryIds';
import { clientIp, isRateLimited } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const galleryId = url.searchParams.get('galleryId');
    if (!galleryId || !isGalleryId(galleryId)) {
      return NextResponse.json({ error: 'Invalid galleryId' }, { status: 400 });
    }

    // Optional size parameter coming from GalleryCarousel
    const sizeParam = url.searchParams.get('size');
    const PACK_BREAKPOINTS = [128, 256, 384, 500, 640, 700];
    let width = Number.parseInt(sizeParam || '');
    if (!Number.isFinite(width)) width = 500;
    width = PACK_BREAKPOINTS.find(bp => bp >= width) ?? PACK_BREAKPOINTS[PACK_BREAKPOINTS.length - 1];

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

    if (isRateLimited(`pack:${clientIp(req)}`, 180, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const payload = await regenerateGalleryPack(galleryId, width, version);

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('gallery-pack GET', error);
    return NextResponse.json({ error: 'Failed to load gallery pack' }, { status: 500 });
  }
}
