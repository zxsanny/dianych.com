# Shared helper candidates (not extracted in code)

## parseGalleryPath

**Purpose**: Split `/images/<galleryId>/<filename>`.

**Used By**: Modal, GalleryCarousel, `deleteImage` (inline).

## expandIfShort

**Purpose**: Repeat passwords shorter than 32 chars as `{p}.{p}.{p}` before bcrypt.

**Used By**: `api/login`, `scripts/hash-pw.js`.

## ALLOWED_GALLERIES

**Purpose**: `brooches | clothes | panel | felting | kits`.

**Used By**: image route, gallery-pack GET/invalidate, actions `allowedFolders`.
