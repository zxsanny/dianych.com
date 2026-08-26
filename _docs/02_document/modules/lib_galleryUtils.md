# Module: lib/galleryUtils

**Path:** `dianych-website/lib/galleryUtils.ts`

## Purpose

List public gallery image URLs for a folder under `public/images/<galleryId>`.

## Public interface

- `getImagePaths(galleryId: string): string[]` — numeric-aware sort; returns `/images/<galleryId>/<filename>` paths. Missing/unreadable dir → `[]` and `console.error`.

## Internal logic

`path.join(process.cwd(), 'public', 'images', galleryId)` then `readdirSync`. No extension filter.

## Dependencies

Node `fs`, `path`.

## Consumers

- `app/components/Gallery.tsx`
- `app/actions.ts` (`getGalleryImages`)

## Data models

None.

## Configuration

Gallery root is always `public/images`. Caller supplies `galleryId`.

## External integrations

None.

## Security

`galleryId` is not sanitized. Callers that accept user input (`app/actions.ts`) must restrict to `allowedFolders`. SSR `Gallery` uses hardcoded section ids.

## Tests

None.
