# Expected Results

Maps inputs to quantifiable expected results. Non-`UNKNOWN` values cite a named file and line. Tests compare actual output to these rows.

## Result Format Legend

| Result Type | When to Use | Example |
|-------------|-------------|---------|
| Exact value | Output must match precisely | `status_code: 400` |
| Pattern match | String/regex | message contains `Invalid password` |
| File reference | Nested JSON | `default_frame_prices.json` |
| Set/count | Allow-lists | galleries ⊇ five names |

## Comparison Methods

`exact`, `substring`, `file_reference`, `set_contains`, `threshold_max`.

## Input → Expected Result Mapping

### Auth (`app/api/login/route.ts`)

| # | Input | Input Description | Expected Result | Comparison | Tolerance | Reference File |
|---|-------|-------------------|-----------------|------------|-----------|---------------|
| 1 | `POST /api/login` with empty `password` | Missing required field | status 400, message `Password is required` | exact | N/A | N/A |
| 2 | `POST /api/login` with wrong password, `pw.txt` present | Failed bcrypt | status 401, message `Invalid password` | exact | N/A | N/A |
| 3 | 6th `POST /api/login` in 15 min from same IP | Rate limit (`MAX_ATTEMPTS=5`, `WINDOW_MS=15*60*1000`) | status 429, message contains `Too many login attempts` | exact (status), substring (body) | N/A | N/A |
| 4 | `GET /manage` without session | Middleware gate | redirect to `/login` | exact (pathname) | N/A | N/A |
| 5 | `POST /api/login` with password matching `pw.txt` | Success path | `UNKNOWN — needs user input` (no committed `pw.txt` or recorded cookie) | — | — | N/A |

Evidence: `dianych-website/app/api/login/route.ts` L21–22, L38, L46–47, L68; `dianych-website/middleware.ts` L10–14.

### Prices (`app/api/prices/route.ts`)

| # | Input | Input Description | Expected Result | Comparison | Tolerance | Reference File |
|---|-------|-------------------|-----------------|------------|-----------|---------------|
| 1 | `GET /api/prices` when file missing | `readPrices` catch | JSON defaults 450/500/600/700 | file_reference | N/A | `expected_results/default_frame_prices.json` |
| 2 | `POST /api/prices` no session | Auth check | status 401, message `Unauthorized` | exact | N/A | N/A |
| 3 | `POST /api/prices` logged in, any price `< 0` or non-finite | Validation | status 400, message `All prices must be non-negative numbers.` | exact | N/A | N/A |
| 4 | `POST /api/prices` logged in, four finite ≥ 0 numbers | Write + echo | status 200, body equals posted object | exact | N/A | N/A |

Evidence: `dianych-website/app/api/prices/route.ts` L23–34, L58–59, L79–81, L84–85.

### Uploads / deletes (`app/actions.ts`)

| # | Input | Input Description | Expected Result | Comparison | Tolerance | Reference File |
|---|-------|-------------------|-----------------|------------|-----------|---------------|
| 1 | `uploadImages` no session | `requireAuth` | `{ status: 'error', message: 'Unauthorized.' }` | exact | N/A | N/A |
| 2 | `uploadImages` folder `frames` (or other non-allow-list) | Folder check | `{ status: 'error', message: 'Please select a valid folder.' }` | exact | N/A | N/A |
| 3 | `uploadImages` empty files | File check | `{ status: 'error', message: 'Please select at least one file to upload.' }` | exact | N/A | N/A |
| 4 | `uploadImages` `note.txt` | Extension filter | message contains `not an allowed image type` | substring | N/A | N/A |
| 5 | `uploadImages` `.jpg` with non-JPEG bytes | Magic bytes | message contains `file content is not a valid image` | substring | N/A | N/A |
| 6 | `deleteImage` path `../../etc/passwd` | Prefix check | `{ status: 'error', message: 'Unauthorized file path.' }` and no unlink outside `public/images` | exact | N/A | N/A |
| 7 | `getGalleryImages('not-a-gallery')` | Allow-list | `[]` | exact | N/A | N/A |
| 8 | Successful upload of a valid JPEG to `brooches` | Happy path | `UNKNOWN — needs user input` (no golden file set; live gallery contents change) | — | — | N/A |

Evidence: `dianych-website/app/actions.ts` L15, L39, L50–54, L63–71, L114–120, L95–97.

### Image pipeline

| # | Input | Input Description | Expected Result | Comparison | Tolerance | Reference File |
|---|-------|-------------------|-----------------|------------|-----------|---------------|
| 1 | `GET /api/gallery-pack` missing/invalid `galleryId` | Allow-list | status 400, `{ error: 'Invalid galleryId' }` | exact | N/A | N/A |
| 2 | `GET /api/image` missing `galleryId` or `name` | Required params | status 400, `{ error: 'galleryId and name are required' }` | exact | N/A | N/A |
| 3 | `GET /api/image?galleryId=brooches&name=../x` | `SAFE_FILENAME` | status 400, `{ error: 'Invalid parameters' }` | exact | N/A | N/A |
| 4 | `GET /api/gallery-pack?galleryId=brooches` (no size) | Default width | generated/cached pack uses width 500 | exact | N/A | N/A |
| 5 | Successful pack/image JSON `dataUrl` bytes | WebP payload | `UNKNOWN — needs user input` (no committed golden WebP) | — | — | N/A |
| 6 | `POST /api/gallery-pack/invalidate` no session | Auth | status 401, `{ error: 'Unauthorized' }` | exact | N/A | N/A |
| 7 | Response headers on pack/image cache hit | Cache-Control | `public, max-age=300, s-maxage=300` | exact | N/A | N/A |

Evidence: `dianych-website/app/api/gallery-pack/route.ts` L12–20; `dianych-website/app/api/image/route.ts` L55–70, L82; `dianych-website/app/api/gallery-pack/invalidate/route.ts` L12–13.

### Listing

| # | Input | Input Description | Expected Result | Comparison | Tolerance | Reference File |
|---|-------|-------------------|-----------------|------------|-----------|---------------|
| 1 | `getImagePaths` on missing directory | Unreadable/missing | `[]` (and `console.error`) | exact | N/A | N/A |
| 2 | Live filenames in each gallery folder | Current `public/images/*` | `UNKNOWN — needs user input` (assets change via admin uploads) | — | — | N/A |

Evidence: `_docs/02_document/modules/lib_galleryUtils.md`; `dianych-website/lib/galleryUtils.ts`.

## Gaps

| Input | Why UNKNOWN | Who fills |
|-------|-------------|-----------|
| Correct-password login cookie / redirect host | `pw.txt` is gitignored; no recorded session | Operator / test-spec Phase 1 |
| Exact WebP `dataUrl` for a named file | No golden/snapshot in repo | test-spec or a committed fixture image |
| Happy-path upload resulting file list | Gallery dirs are live content | test-spec with a fixture folder |
| Production nginx `/images/` vs volume identity | Host paths, not in-app | ops smoke (AC-IR-08) |

An empty Gaps section would mean full coverage. This list is the honest handoff to test-spec Phase 1/3.
