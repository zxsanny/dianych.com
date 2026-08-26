# Module: app/actions

**Path:** `dianych-website/app/actions.ts`

## Purpose

Server Actions for admin gallery upload, delete, and list.

## Public interface

- `FormState` — `{ message, status: 'success' | 'error' | 'idle' }`
- `uploadImages(prevState, formData)` — fields `folder`, `files`
- `deleteImage(prevState, formData)` — field `imagePath` (`/images/<gallery>/<file>`)
- `getGalleryImages(folder)` — allow-listed folder → `getImagePaths`

## Internal logic

`allowedFolders` = brooches, clothes, panel, felting, kits (no `frames`). Upload: sanitize filename, extension allow-list, magic-byte check (SVG via `<svg`/`<?xml` in first 256 bytes), resolve-path prefix check, `writeFile`. Delete: strip `/images/`, prefix check, exactly two path segments, allow-listed folder. Both revalidate `/` and `/manage`, then `invalidateCache(folder, 500, 1)`.

`requireAuth` via `getSession()` — unauthenticated returns error `FormState`, not a throw.

## Dependencies

`lib/galleryUtils`, `lib/session`, `app/api/gallery-pack/cache`, `next/cache`, Node `fs/promises` + `path`.

## Consumers

`app/manage/GalleryManager.tsx`.

## Data models

`FormState` as above.

## Configuration

`next.config.ts` serverActions `bodySizeLimit: '20mb'`.

## External integrations

Writes into `public/images/<folder>` (bind-mounted in production).

## Security

Auth on upload/delete. Path traversal blocked by `resolve` + prefix. Magic bytes + extension filter. Empty `catch` on cache invalidate. `getGalleryImages` is unauthenticated but folder-allow-listed.

## Tests

None.
