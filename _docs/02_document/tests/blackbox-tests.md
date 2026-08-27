# Blackbox Tests

## Positive Scenarios

### FT-P-01: Public storefront lists the five gallery ids

**Summary**: `/` exposes only the five gallery section ids.
**Traces to**: AC-F1-02
**Category**: Storefront

**Preconditions**:
- SUT running at `BASE_URL`; at least one image may exist (empty folders still leave the section id contract)

**Input data**: DS-GALLERY-IDS

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `GET {BASE_URL}/` | 200, `text/html` |
| 2 | Parse `id` attributes | set contains `brooches`, `clothes`, `panel`, `felting`, `kits` |

**Expected outcome**: those five ids present; no sixth gallery folder id (frames is prices, not a gallery id).
**Max execution time**: 10s

### FT-P-02: Missing or empty gallery does not 500

**Summary**: A configured gallery with no readable folder degrades; the page still loads.
**Traces to**: AC-F1-01, AC-IR-07
**Category**: Storefront

**Preconditions**:
- Isolated image dir: one allow-listed folder (`kits`) missing or empty

**Input data**: DS-EMPTY-GALLERY

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `GET {BASE_URL}/` | status 200 (not 500) |
| 2 | Inspect `#kits` | omitted, or present with no carousel slides |

**Expected outcome**: status 200; no broken-carousel error page.
**Max execution time**: 10s

### FT-P-03: UA and EN copy occupy the same slots

**Summary**: Language toggle swaps the documented string pairs; slot count stays the same.
**Traces to**: AC-F1-03
**Category**: Storefront

**Preconditions**:
- `GET /` 200

**Input data**: DS-LOCALE-PAIRS (`test-data.md`)

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Open `/`, click UA | each UA string in the pair table is visible |
| 2 | Click EN | each EN string in the pair table is visible; matching UA strings for those slots are gone |

**Expected outcome**: all eight pairs match exactly; `<html lang>` may stay `en` (not a fail).
**Max execution time**: 15s

### FT-P-04: Missing prices file returns defaults

**Summary**: Public prices API serves the four default numbers when the file is absent.
**Traces to**: AC-PRICE-01
**Category**: Content admin / prices

**Preconditions**:
- Prices file not present at SUT runtime path (DS-EMPTY-PRICES)

**Input data**: `expected_results/default_frame_prices.json`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `GET {BASE_URL}/api/prices` | 200 JSON equals `{smallFrame8:450,smallFrame10:500,mediumFrame14:600,largeFrame19:700}` |

**Expected outcome**: exact match to the reference file `expected` object.
**Max execution time**: 5s

### FT-P-05: Valid price POST echoes the posted numbers

**Summary**: Authenticated POST writes and returns the four posted prices.
**Traces to**: AC-PRICE-04
**Category**: Content admin / prices

**Preconditions**:
- Session from FT-P-07 (or equivalent login)
- `TEST_ADMIN_PASSWORD` set

**Input data**: DS-POST-PRICES `{smallFrame8:111,smallFrame10:222,mediumFrame14:333,largeFrame19:444}`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `POST /api/prices` with session cookie and JSON body | 200, body equals the posted object |

**Expected outcome**: status 200; four numbers exact.
**Max execution time**: 5s

### FT-P-06: GET prices after POST returns the posted numbers

**Summary**: Same-process read-after-write for frame prices.
**Traces to**: AC-IR-04
**Category**: Content admin / prices

**Preconditions**:
- Immediate after FT-P-05 on the same SUT process

**Input data**: same body as FT-P-05

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `GET /api/prices` (no auth) | JSON equals the posted object from FT-P-05 |

**Expected outcome**: exact four-number match (IR-04 cwd).
**Max execution time**: 5s

### FT-P-07: Successful login sets session and redirects to manage

**Summary**: Correct password (from env) opens `/manage`.
**Traces to**: AC-AUTH-05
**Category**: Auth

**Preconditions**:
- SUT has `pw.txt` and `SECRET_COOKIE_PASSWORD`
- `TEST_ADMIN_PASSWORD` set (never committed)

**Input data**: DS-ADMIN-PASSWORD

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `POST /api/login` form field `password` = env value | 302 or 307 |
| 2 | Inspect headers | Location path is `/manage`; `Set-Cookie` includes `dianych-manage-session` |
| 3 | `GET /manage` with that cookie | 200 (not redirect to `/login`) |

**Expected outcome**: redirect + cookie name + manage 200.
**Max execution time**: 10s

### FT-P-08: Gallery pack default width is 500

**Summary**: Omitting `size` snaps the pack payload width to 500.
**Traces to**: AC-IMG-04
**Category**: Image pipeline

**Preconditions**:
- `brooches` allow-listed (folder may be empty)

**Input data**: `GET /api/gallery-pack?galleryId=brooches` (no `size`)

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | GET pack without `size` | 200 JSON; `galleryId` is `brooches`; `width` is `500` |

**Expected outcome**: `width === 500`.
**Max execution time**: 15s

### FT-P-09: Single-image default width is 1600

**Summary**: Omitting `width` on `/api/image` yields payload width 1600.
**Traces to**: AC-IMG-05
**Category**: Image pipeline

**Preconditions**:
- DS-KNOWN-IMAGE: a `name` from `GET /api/gallery-pack?galleryId=brooches` (skip if `images` is empty)

**Input data**: `GET /api/image?galleryId=brooches&name={known}` (no `width`)

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | GET image without `width` | 200 JSON; `width` is `1600`; `dataUrl` starts with `data:image/webp` |

**Expected outcome**: `width === 1600` (no golden WebP bytes required).
**Max execution time**: 15s

### FT-P-10: Pack and image send Cache-Control 300s

**Summary**: Cache-Control on pack/image responses is the documented triple.
**Traces to**: AC-IMG-06
**Category**: Image pipeline

**Preconditions**:
- Same as FT-P-08 / FT-P-09

**Input data**: pack GET; image GET for DS-KNOWN-IMAGE if present

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | GET `/api/gallery-pack?galleryId=brooches` | header `Cache-Control` exact `public, max-age=300, s-maxage=300` |
| 2 | Repeat GET (cache hit) | same header |
| 3 | If a known name exists, GET `/api/image?...` | same header |

**Expected outcome**: header exact on pack; on image when a file exists.
**Max execution time**: 15s

### FT-P-11: Upload appears to a new visitor in one load

**Summary**: After a successful upload, a client with empty localStorage sees the new filename in the pack.
**Traces to**: AC-IR-01
**Category**: Image pipeline + content admin

**Preconditions**:
- Logged-in session; isolated or disposable gallery file set
- `TEST_ADMIN_PASSWORD` set

**Input data**: DS-VALID-JPEG (`bbtest-upload.jpg`) to folder `brooches`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Submit manage upload form (`folder=brooches`, `files=bbtest-upload.jpg`) | success (no error message) |
| 2 | New client: `GET /api/gallery-pack?galleryId=brooches` with no cookies / empty storage | `images[].name` contains `bbtest-upload.jpg` |
| 3 | Delete via manage (`imagePath=/images/brooches/bbtest-upload.jpg`) | pack no longer lists that name |

**Expected outcome**: filename present after upload, absent after delete; both within one pack GET each.
**Max execution time**: 30s

### FT-P-12: Logout clears manage access

**Summary**: Logout destroys the session; `/manage` requires login again.
**Traces to**: AC-AUTH-04, AC-AUTH-05 (session lifecycle)
**Category**: Auth

**Preconditions**:
- Valid session cookie from FT-P-07

**Input data**: session cookie

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `POST /api/logout` | 200, body contains `Logged out` |
| 2 | `GET /manage` with the old cookie | redirect to `/login` |

**Expected outcome**: manage is gated after logout.
**Max execution time**: 5s

## Negative Scenarios

### FT-N-01: Login missing password

**Summary**: Empty password is rejected.
**Traces to**: AC-AUTH-01
**Category**: Auth

**Preconditions**: SUT up

**Input data**: DS-EMPTY-PASSWORD

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `POST /api/login` with empty `password` | 400, `{message:'Password is required'}` |

**Expected outcome**: exact status and message.
**Max execution time**: 5s

### FT-N-02: Login wrong password

**Summary**: Non-matching password is rejected.
**Traces to**: AC-AUTH-02
**Category**: Auth

**Preconditions**: `pw.txt` present

**Input data**: DS-WRONG-PASSWORD

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `POST /api/login` with `password=not-the-password` | 401, `{message:'Invalid password'}` |

**Expected outcome**: exact status and message.
**Max execution time**: 5s

### FT-N-03: Login rate limit

**Summary**: Sixth attempt from the same IP in 15 minutes is blocked.
**Traces to**: AC-AUTH-03
**Category**: Auth

**Preconditions**:
- Dedicated `X-Forwarded-For: 203.0.113.10` unused by other tests
- Isolated SUT or unused IP

**Input data**: DS-WRONG-PASSWORD, six times

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1–5 | POST login wrong password with that IP | 401 |
| 6 | Same POST | 429, message contains `Too many login attempts` |

**Expected outcome**: 5th is 401; 6th is 429.
**Max execution time**: 15s

### FT-N-04: Unauthenticated manage redirects to login

**Summary**: `/manage` without a session cookie sends the visitor to `/login`.
**Traces to**: AC-AUTH-04
**Category**: Auth

**Preconditions**: no `dianych-manage-session` cookie

**Input data**: none

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `GET /manage` | 307/302/308; Location path `/login` |

**Expected outcome**: pathname exact `/login`.
**Max execution time**: 5s

### FT-N-05: Unauthenticated price POST

**Summary**: Price write without session is unauthorized and does not change GET prices.
**Traces to**: AC-PRICE-02, AC-IR-03
**Category**: Auth + prices

**Preconditions**: record `GET /api/prices` baseline

**Input data**: JSON `{smallFrame8:1,smallFrame10:2,mediumFrame14:3,largeFrame19:4}` without cookie

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `POST /api/prices` no cookie | 401, `{message:'Unauthorized'}` |
| 2 | `GET /api/prices` | equals baseline |

**Expected outcome**: 401; prices unchanged.
**Max execution time**: 5s

### FT-N-06: Negative or non-finite price

**Summary**: Logged-in POST rejects invalid numbers.
**Traces to**: AC-PRICE-03
**Category**: Prices

**Preconditions**: session from FT-P-07

**Input data**: body with `smallFrame8: -1` (other fields valid)

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | `POST /api/prices` with session | 400, `{message:'All prices must be non-negative numbers.'}` |

**Expected outcome**: exact message; repeat with `NaN` / omit finite check as second case if the client can send `null`.
**Max execution time**: 5s

### FT-N-07: Unauthenticated upload, delete, and invalidate

**Summary**: Mutations without a session return unauthorized and do not change files or pack cache.
**Traces to**: AC-IR-03, AC-INV-01
**Category**: Auth + content admin

**Preconditions**: record pack `images` names for `brooches`

**Input data**: none (missing cookie)

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Submit upload form without cookie | `{status:'error', message:'Unauthorized.'}` |
| 2 | Submit delete without cookie | `{status:'error', message:'Unauthorized.'}` |
| 3 | `POST /api/gallery-pack/invalidate` no cookie | 401, `{error:'Unauthorized'}` |
| 4 | GET pack `brooches` | name set unchanged |

**Expected outcome**: exact messages; pack names unchanged.
**Max execution time**: 15s

### FT-N-08: Upload to a non-allow-listed folder

**Summary**: Folder `frames` is rejected.
**Traces to**: AC-UP-01
**Category**: Uploads

**Preconditions**: logged in

**Input data**: DS-BAD-FOLDER + DS-VALID-JPEG

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Upload `folder=frames` | `{status:'error', message:'Please select a valid folder.'}` |

**Expected outcome**: exact object; pack for real galleries unchanged.
**Max execution time**: 10s

### FT-N-09: Upload with empty files

**Summary**: No files selected is rejected.
**Traces to**: AC-UP-02
**Category**: Uploads

**Preconditions**: logged in

**Input data**: `folder=brooches`, empty `files`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Submit upload with no files | `{status:'error', message:'Please select at least one file to upload.'}` |

**Expected outcome**: exact object.
**Max execution time**: 10s

### FT-N-10: Upload non-image type

**Summary**: `note.txt` is rejected.
**Traces to**: AC-UP-03
**Category**: Uploads

**Preconditions**: logged in

**Input data**: DS-NOTE-TXT, `folder=brooches`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Upload `note.txt` | message contains `not an allowed image type` |

**Expected outcome**: substring match; no `note.txt` in pack names.
**Max execution time**: 10s

### FT-N-11: Upload image extension with bad magic bytes

**Summary**: `.jpg` that is not an image is rejected.
**Traces to**: AC-UP-04
**Category**: Uploads

**Preconditions**: logged in

**Input data**: DS-FAKE-JPEG

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Upload `bbtest-fake.jpg` | message contains `file content is not a valid image` |

**Expected outcome**: substring match; name absent from pack.
**Max execution time**: 10s

### FT-N-12: Path traversal on upload or delete

**Summary**: `../` folder, extra segments, or `../../etc/passwd` delete is rejected; no file appears outside ` /images/<allowedFolder>/ `.
**Traces to**: AC-IR-02
**Category**: Uploads / path safety

**Preconditions**: logged in

**Input data**: DS-TRAVERSAL

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | Upload `folder=../etc` | error (valid-folder or unauthorized path) |
| 2 | Delete `imagePath=../../etc/passwd` | `{status:'error', message:'Unauthorized file path.'}` |
| 3 | GET `/` and pack for five galleries | no new unexpected names; HTTP 200 |

**Expected outcome**: delete message exact; consumer observes only allow-listed gallery URLs (no escape via `/api/image`).
**Max execution time**: 15s

### FT-N-13: Invalid galleryId on pack

**Summary**: Pack API rejects unknown gallery ids.
**Traces to**: AC-IMG-01
**Category**: Image pipeline

**Preconditions**: none

**Input data**: `GET /api/gallery-pack` and `GET /api/gallery-pack?galleryId=not-a-gallery`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | GET pack missing `galleryId` | 400, `{error:'Invalid galleryId'}` |
| 2 | GET pack `galleryId=not-a-gallery` | 400, `{error:'Invalid galleryId'}` |

**Expected outcome**: exact JSON.
**Max execution time**: 5s

### FT-N-14: Image API missing required params

**Summary**: `/api/image` requires `galleryId` and `name`.
**Traces to**: AC-IMG-02
**Category**: Image pipeline

**Preconditions**: none

**Input data**: `GET /api/image`, `GET /api/image?galleryId=brooches`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | GET without both params | 400, `{error:'galleryId and name are required'}` |

**Expected outcome**: exact JSON.
**Max execution time**: 5s

### FT-N-15: Image API invalid parameters

**Summary**: Name outside the safe pattern is 400.
**Traces to**: AC-IMG-03, AC-IR-06
**Category**: Image pipeline

**Preconditions**: none

**Input data**: `GET /api/image?galleryId=brooches&name=../x`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | GET with `name=../x` | 400, `{error:'Invalid parameters'}` |

**Expected outcome**: exact JSON; body is not image bytes.
**Max execution time**: 5s

### FT-N-16: Image API reject other-path filename

**Summary**: A name that is not a safe filename does not read other paths.
**Traces to**: AC-IR-06
**Category**: Image pipeline

**Preconditions**: none

**Input data**: `name=..%2F..%2Fetc%2Fpasswd` or `name=foo/bar.jpg`

**Steps**:

| Step | Consumer Action | Expected System Response |
|------|----------------|------------------------|
| 1 | GET `/api/image?galleryId=brooches&name=...` | 400 `{error:'Invalid parameters'}` |

**Expected outcome**: 400 only.
**Max execution time**: 5s

## Production Smoke Tests

A narrow subset run against a **deployed** environment after a cut — read by `/test-run --smoke` and `/release` Phase 4. Keep it small enough to finish in a couple of minutes and safe to run against production.

| ID | Check | Target | Expected | Safe in prod |
|----|-------|--------|----------|--------------|
| SM-01 | Storefront up | `GET {BASE_URL}/` | 200 | yes |
| SM-02 | Prices readable | `GET {BASE_URL}/api/prices` | 200; keys `smallFrame8`, `smallFrame10`, `mediumFrame14`, `largeFrame19` all numbers | yes |
| SM-03 | Login page up | `GET {BASE_URL}/login` | 200 | yes |
| SM-04 | Manage gate | `GET {BASE_URL}/manage` no cookie | redirect to `/login` | yes |
| SM-05 | Gallery bytes identity | one public filename via `GET /api/image` vs `GET /images/{gallery}/{name}` on the same host | same Content-Length or digest (AC-IR-08) | yes (read-only) |

Rules:
- Every entry must be **non-destructive** or use a dedicated smoke fixture that is cleaned up. Never a write that mutates real user data.
- Cover the paths whose failure means "roll back now" — not broad functional coverage.
- An empty section is a **gap**, not a pass: `/release` Phase 4 STOPs when no smoke set exists.
