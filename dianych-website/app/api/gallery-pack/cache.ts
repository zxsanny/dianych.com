import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

export interface GalleryPackPayload {
  galleryId: string;
  width: number;
  version: number;
  images: { name: string; dataUrl: string }[];
}

// In-memory cache: key -> { updatedAt, payload }
export const memoryCache = new Map<string, { updatedAt: number; payload: GalleryPackPayload }>();

export const CACHE_DIR = path.join(os.tmpdir(), 'gallery-thumbnails');

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

export async function regenerateGalleryPack(galleryId: string, width = 500, version = 1): Promise<GalleryPackPayload> {
  const cacheKey = buildCacheKey(galleryId, width, version);

  const imagesDirectory = path.join(process.cwd(), 'public', 'images', galleryId);
  if (!fs.existsSync(imagesDirectory)) {
    // Empty pack if not found
    const empty: GalleryPackPayload = { galleryId, width, version, images: [] };
    memoryCache.set(cacheKey, { updatedAt: Date.now(), payload: empty });
    const diskPathEmpty = getDiskCachePath(galleryId, width, version);
    try { fs.writeFileSync(diskPathEmpty, JSON.stringify(empty)); } catch {}
    return empty;
  }

  const allFiles = fs.readdirSync(imagesDirectory);
  const imageFiles = allFiles
    .filter((f) => /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const sharpFn = sharp;

  type JimpImage = {
    resize: (w: number, h: number) => JimpImage;
    getBuffer: (mime: string, cb: (err: Error | null, buffer?: Buffer) => void) => void;
    getBufferAsync?: (mime: string) => Promise<Buffer>;
    quality?: (q: number) => unknown;
  };
  type JimpStatic = {
    read: (input: Buffer | string | Uint8Array) => Promise<JimpImage>;
    AUTO: number;
  };
  let JimpCls: JimpStatic | undefined;
  if (!sharpFn) {
    try {
      const mod: unknown = await import('jimp');
      const candidate = (mod as { Jimp?: unknown; default?: unknown }).Jimp ?? (mod as { default?: unknown }).default ?? mod;
      if (
        candidate &&
        (typeof candidate === 'function' || typeof candidate === 'object') &&
        'read' in (candidate as object) &&
        'AUTO' in (candidate as object)
      ) {
        JimpCls = candidate as unknown as JimpStatic;
      }
    } catch {
      // If neither sharp nor Jimp, fallback to embedding originals (unsafe size-wise) but avoid throwing.
      JimpCls = undefined;
    }
  }

  const entries: { name: string; dataUrl: string }[] = [];
  for (const filename of imageFiles) {
    const fullPath = path.join(imagesDirectory, filename);
    try {
      const input = fs.readFileSync(fullPath);
      let buf: Buffer;
      if (sharpFn) {
        buf = await sharpFn(input).rotate().resize({ width: width }).webp({ quality: 76 }).toBuffer();
      } else if (JimpCls) {
        const image = await JimpCls.read(input);
        image.resize(width, JimpCls.AUTO);
        if (typeof image.quality === 'function') {
          image.quality(76);
        }
        if (typeof image.getBufferAsync === 'function') {
          buf = await image.getBufferAsync('image/webp');
        } else {
          buf = await new Promise<Buffer>((resolve, reject) => {
            image.getBuffer('image/webp', (err: Error | null, buffer?: Buffer) => {
              if (err || !buffer) return reject(err ?? new Error('Failed to get buffer'));
              resolve(buffer);
            });
          });
        }
      } else {
        // As a last resort, push original as webp data URL by passing through
        buf = input;
      }
      const b64 = buf.toString('base64');
      const dataUrl = `data:image/webp;base64,${b64}`;
      entries.push({ name: filename, dataUrl });
    } catch (e) {
      // Log and skip problematic files
      console.error(`Error processing image '${filename}' at '${fullPath}':`, e);
      // proceed to next file
    }
  }

  const payload: GalleryPackPayload = { galleryId, width, version, images: entries };

  // Save to disk cache (best-effort)
  try {
    const diskPath = getDiskCachePath(galleryId, width, version);
    fs.writeFileSync(diskPath, JSON.stringify(payload));
  } catch {}

  // Save to memory cache
  memoryCache.set(cacheKey, { updatedAt: Date.now(), payload });

  return payload;
}

export async function invalidateCache(galleryId: string, width = 500, version = 1) {
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

  // Immediately regenerate cache to keep UI responsive
  try {
    await regenerateGalleryPack(galleryId, width, version);
  } catch {
    // ignore regeneration errors
  }
}
