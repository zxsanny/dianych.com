# Input data parameters

No SQL. Inputs are HTTP form/JSON, filesystem images, and two small files.

## Gallery images

| Parameter | Type | Constraints | Source |
|-----------|------|-------------|--------|
| galleryId / folder | string | one of `brooches`, `clothes`, `panel`, `felting`, `kits` | actions, image, gallery-pack |
| filename | string | sanitized `[a-zA-Z0-9._-]`; image extensions | `app/actions.ts` |
| bytes | file | magic-byte or SVG head; serverActions ≤ 20mb | `actions.ts`, `next.config.ts` |
| imagePath (delete) | string | `/images/<galleryId>/<file>`, exactly two segments | `deleteImage` |

On disk: `public/images/<galleryId>/<filename>` (prod: volume `/var/www/dianych/images`).

## Frame prices

| Field | Type | Default | Constraints |
|-------|------|---------|-------------|
| smallFrame8 | number | 450 | finite, ≥ 0 |
| smallFrame10 | number | 500 | finite, ≥ 0 |
| mediumFrame14 | number | 600 | finite, ≥ 0 |
| largeFrame19 | number | 700 | finite, ≥ 0 |

Runtime file: `process.cwd()/dianych-website/data/framePrices.json`. Committed copies: `dianych-website/data/framePrices.json` and nested `dianych-website/dianych-website/data/framePrices.json` (same defaults).

## Auth

| Parameter | Type | Notes |
|-----------|------|-------|
| password | form field | required; compared to bcrypt in `cwd/pw.txt` |
| SECRET_COOKIE_PASSWORD | env | iron-session secret |
| cookie `dianych-manage-session` | iron-session | `{ isLoggedIn?: boolean }` |

## Image query params

| Param | Default | Snap / clamp |
|-------|---------|--------------|
| gallery-pack `size` | 500 | `[128, 256, 384, 500, 640, 700]` |
| image `width` | 1600 | `[256, 384, 512, 640, 828, 1080, 1200, 1600, 2000]` |
| version | 1 | hardcoded |

## Volumes / update frequency

- Gallery files: owner uploads; no schema version.
- Prices: owner POST; missing file rewritten to defaults.
- Packs: generated on miss; 500 MB tmp LRU.
