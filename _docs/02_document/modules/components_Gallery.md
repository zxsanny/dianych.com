# Module: components/Gallery

**Path:** `dianych-website/app/components/Gallery.tsx`

## Purpose

Server component: read `public/images/<id>` and render `GalleryCarousel`.

## Public interface

- `{ id, titleKey, descriptionKey?, buttonTextKey?, orderLink? }` — `id` is both DOM id and gallery folder.

## Dependencies

`lib/galleryUtils.getImagePaths`, `GalleryCarousel`.

## Consumers

Brooches, Clothes, Panel, Felting, Kits.

## Tests

None.
