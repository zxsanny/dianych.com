# Module: components/GalleryCarousel

**Path:** `dianych-website/app/components/GalleryCarousel.tsx`

## Purpose

Embla carousel of gallery images with thumbnail pack, progress bar, optional order CTA, and Modal.

## Public interface

- `{ images, titleKey, descriptionKey?, buttonTextKey?, orderLink? }`
- Empty `images` → `null`. 2 slides on mobile, 3 desktop.

## Internal logic

Derives `galleryId` from first path. Fetches `/api/gallery-pack?galleryId=&size=400`. Caches pack in `localStorage`. Refetches if filename set differs. Fallback to original URLs on error; skeletons while loading.

## Dependencies

`embla-carousel-react`, `lib/translations`, `OrderButton`, `Modal`, `next/image`.

## Consumers

`Gallery`.

## Configuration

`GALLERY_PACK_THUMB_WIDTH = 400` (API snaps to 384 or 500). Version 1.

## Tests

None.
