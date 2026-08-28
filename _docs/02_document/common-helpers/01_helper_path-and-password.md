# Shared helpers

## parseGalleryPath

**Purpose**: Split `/images/<galleryId>/<filename>`.

**Status**: still inline (Modal, GalleryCarousel, `deleteImage`).

**Used By**: Modal, GalleryCarousel, `deleteImage`.

## expandIfShort

**Purpose**: Repeat passwords shorter than 32 chars as `{p}.{p}.{p}` before bcrypt.

**Status**: extracted to `lib/expandIfShort.js`.

**Used By**: `api/login`, `scripts/hash-pw.js`.

## GALLERY_IDS

**Purpose**: `brooches | clothes | panel | felting | kits`.

**Status**: extracted to `lib/galleryIds.ts` (`isGalleryId`).

**Used By**: image route, gallery-pack GET/invalidate, actions, ManagePageClient.
