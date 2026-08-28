# Module: app/api/image

**Path:** `dianych-website/app/api/image/route.ts`

## Purpose

GET a single resized WebP (as JSON `dataUrl`) for a named gallery file, with memory + tmp-disk cache.

## Public interface

- `GET /api/image?galleryId=&name=&width=`
- 400 if missing/invalid params; 500 with `{ error }` on generate failure
- `Cache-Control: public, max-age=300, s-maxage=300`

## Internal logic

Gallery allow-list is `isGalleryId` (`GALLERY_IDS`). Filename must match `^[a-zA-Z0-9._-]+$`. Width clamped to `[256, 384, 512, 640, 828, 1080, 1200, 1600, 2000]` (default 1600). Cache key includes gallery, name, width, version=1. Disk dir `os.tmpdir()/gallery-single-images`. Generate: `sharp` rotate + resize + webp q82.

## Dependencies

`lib/diskCache`, `lib/galleryIds`, `sharp`, Node `fs`/`path`/`os`.

## Consumers

Public carousel/modal fetch (client). No first-party import of this module.

## Data models

JSON `{ galleryId, name, width, version, dataUrl }`.

## Configuration

`runtime = 'nodejs'`. Version hardcoded `1`.

## External integrations

None.

## Security

Gallery and filename allow-lists prevent path traversal. Unauthenticated (public).

## Tests

None.
