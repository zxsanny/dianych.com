# Module: app/api/gallery-pack/cache

**Path:** `dianych-website/app/api/gallery-pack/cache.ts`

## Purpose

Build and cache a JSON pack of WebP data-URL thumbnails for one gallery folder.

## Public interface

- `GalleryPackPayload` — `{ galleryId, width, version, images: { name, dataUrl }[] }`
- `memoryCache: Map<string, { updatedAt, payload }>`
- `CACHE_DIR` — `os.tmpdir()/gallery-thumbnails`
- `ensureDir(dir)`, `buildCacheKey(galleryId, width=500, version=1)`, `getDiskCachePath(...)`
- `regenerateGalleryPack(galleryId, width=500, version=1): Promise<GalleryPackPayload>`
- `invalidateCache(galleryId, width=500, version=1)` — drop memory+disk, then regenerate

## Internal logic

Reads `public/images/<galleryId>`, filters raster extensions (no SVG), sorts numeric-aware. Prefers `sharp` resize+webp q76; live `jimp` fallback if sharp fails to load; last resort embeds original bytes as `data:image/webp`. Writes disk JSON and calls `enforceCacheLimit`. Missing folder → empty pack.

## Dependencies

`lib/diskCache`, Node `fs`/`path`/`os`, `sharp` (optional dynamic `jimp`).

## Consumers

- `app/api/gallery-pack/route.ts`
- `app/api/gallery-pack/invalidate/route.ts`
- `app/actions.ts` (`invalidateCache` after upload/delete)

## Data models

`GalleryPackPayload` as above. Cache key `${galleryId}|w${width}|v${version}`.

## Configuration

Default width 500, version 1. Disk names sanitized to `[a-zA-Z0-9._-]`.

## External integrations

None (local filesystem + process tmp).

## Security

Does not allow-list `galleryId` — callers must. `galleryId` is sanitized only for cache filenames, not for the images directory path.

## Tests

None.
