# Module: lib/galleryIds

**Path:** `dianych-website/lib/galleryIds.ts`

## Purpose

Single catalog of uploadable gallery folder ids (AC-F1-02).

## Public interface

- `GALLERY_IDS` — `readonly ['brooches', 'clothes', 'panel', 'felting', 'kits']`
- `GalleryId` — element of that tuple
- `isGalleryId(value: string): value is GalleryId`

`prices` and `frames` are not gallery ids.

## Internal logic

None.

## Dependencies

None.

## Consumers

`app/actions.ts`, `app/api/image/route.ts`, `app/api/gallery-pack/route.ts`, `app/api/gallery-pack/invalidate/route.ts`, `app/manage/ManagePageClient.tsx`.

## Security

Callers use `isGalleryId` as the path allow-list. Middleware matcher is unchanged (`/manage/:path*` only).

## Tests

Covered by FT-N-12, NFT-SEC-01/02/04 (allow-list unchanged).
