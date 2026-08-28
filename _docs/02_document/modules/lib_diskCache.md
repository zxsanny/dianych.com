# Module: lib/diskCache

**Path:** `dianych-website/lib/diskCache.ts`

## Purpose

Cap a thumbnail/cache directory at 500 MB by deleting oldest files first.

## Public interface

- `enforceCacheLimit(cacheDir: string): void` — no-op if dir missing; otherwise unlinks oldest files until total size ≤ 500 MB.

## Internal logic

Reads `readdirSync` + `statSync` for each entry; sums `size`; sorts by `mtimeMs` ascending; unlinks until under cap. Stat failures yield `null` and are dropped. Unlink failures continue the loop (best-effort; trim must not crash requests).

## Dependencies

Node `fs`, `path`. No first-party modules.

## Consumers

- `app/api/gallery-pack/cache.ts` (`regenerateGalleryPack`)
- `app/api/image/route.ts`

## Data models

None. Operates on filesystem metadata only.

## Configuration

`MAX_CACHE_BYTES = 500 * 1024 * 1024` (hardcoded).

## External integrations

None.

## Security

No path validation of `cacheDir` — caller must pass a dedicated cache directory (today: `os.tmpdir()/gallery-thumbnails`).

## Tests

None.
