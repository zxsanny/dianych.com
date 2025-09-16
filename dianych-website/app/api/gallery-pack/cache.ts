import fs from 'fs';
import path from 'path';

export interface GalleryPackPayload {
  galleryId: string;
  width: number;
  version: number;
  images: { name: string; dataUrl: string }[];
}

// In-memory cache: key -> { updatedAt, payload }
export const memoryCache = new Map<string, { updatedAt: number; payload: GalleryPackPayload }>();

export const CACHE_DIR = path.join(process.cwd(), '.cache', 'thumbnails');

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function buildCacheKey(galleryId: string, width = 500, version = 1) {
  return `${galleryId}|w${width}|v${version}`;
}

export function getDiskCachePath(galleryId: string, width = 500, version = 1) {
  ensureDir(CACHE_DIR);
  return path.join(CACHE_DIR, `${galleryId}_w${width}_v${version}.json`);
}

export function invalidateCache(galleryId: string, width = 500, version = 1) {
  // Memory cache
  memoryCache.delete(buildCacheKey(galleryId, width, version));

  // Disk cache
  const diskPath = getDiskCachePath(galleryId, width, version);
  try {
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
  } catch {
    // ignore
  }
}
