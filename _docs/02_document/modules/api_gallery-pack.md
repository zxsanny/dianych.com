# Module: app/api/gallery-pack (routes)

**Paths:** `dianych-website/app/api/gallery-pack/route.ts`, `invalidate/route.ts`

## Purpose

Public GET of a gallery thumbnail pack; authenticated POST to invalidate+rebuild one pack.

## Public interface

- `GET /api/gallery-pack?galleryId=&size=` — allow-listed galleries; size snapped to `[128, 256, 384, 500, 640, 700]` (default 500); 300s cache headers
- `POST /api/gallery-pack/invalidate` — JSON `{ galleryId }` or query; 401 if not logged in; always invalidates width=500 version=1 only

## Internal logic

GET: `isGalleryId` then memory → disk → `regenerateGalleryPack`. POST: `getSessionFromRequest` then `isGalleryId` then `invalidateCache(galleryId, 500, 1)`.

## Dependencies

`./cache`, `lib/galleryIds`, `lib/session` (invalidate only).

## Consumers

`GalleryCarousel` (GET). Upload/delete actions call `invalidateCache` directly, not this POST.

## Data models

`GalleryPackPayload` from cache module.

## Configuration

`runtime = 'nodejs'`. Version always 1.

## External integrations

None.

## Security

GET allow-lists gallery id. Invalidate is session-gated. Only the 500px pack is dropped on POST; other widths can stay stale.

## Tests

None.
