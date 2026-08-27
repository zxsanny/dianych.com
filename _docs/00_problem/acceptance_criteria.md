# Acceptance Criteria

Measurable criteria from code, configs, and `_docs/02_document/interaction-risks.md`. IDs are stable for test-spec.

## Storefront

| ID | Criterion | Measure |
|----|-----------|---------|
| AC-F1-01 | A configured gallery whose folder is missing or empty does not 500 | Section omitted or empty carousel; `getImagePaths` returns `[]` (`lib/galleryUtils.ts`) |
| AC-F1-02 | Public `/` lists only the five gallery ids | `{brooches, clothes, panel, felting, kits}` |
| AC-F1-03 | UA and EN copy keys match | `lib/translations.ts` same key set for `'ua' \| 'en'` |

## Auth

| ID | Criterion | Measure |
|----|-----------|---------|
| AC-AUTH-01 | Missing password | `POST /api/login` → 400, message `Password is required` |
| AC-AUTH-02 | Wrong password | `POST /api/login` → 401, message `Invalid password` |
| AC-AUTH-03 | Rate limit | 6th attempt in 15 min from same IP → 429, message contains `Too many login attempts` |
| AC-AUTH-04 | Unauthenticated `/manage` | Redirect to `/login` (`middleware.ts`) |
| AC-AUTH-05 | Successful login | Sets session `isLoggedIn` and redirects to `/manage` |
| AC-IR-05 | After container recreate, old session cookie does not open `/manage`; current `pw.txt` still logs in | ops + auth |

## Content admin / prices

| ID | Criterion | Measure |
|----|-----------|---------|
| AC-PRICE-01 | Missing prices file | `GET /api/prices` returns `{ smallFrame8: 450, smallFrame10: 500, mediumFrame14: 600, largeFrame19: 700 }` |
| AC-PRICE-02 | Unauthenticated POST | `POST /api/prices` → 401, message `Unauthorized` |
| AC-PRICE-03 | Negative or non-finite price | `POST /api/prices` (logged in) → 400, message `All prices must be non-negative numbers.` |
| AC-PRICE-04 | Valid POST | Response 200 with the posted four numbers |
| AC-IR-04 | `GET /api/prices` after `POST` returns the posted numbers (same process cwd as production: app root `dianych-website/`) | content-admin |
| AC-IR-03 | `uploadImages`, `deleteImage`, `POST /api/prices`, `POST /api/gallery-pack/invalidate` return unauthorized and do not change files/prices/cache when the session cookie is missing | auth + content-admin |

## Uploads / path safety

| ID | Criterion | Measure |
|----|-----------|---------|
| AC-UP-01 | Bad folder | `uploadImages` → `{ status: 'error', message: 'Please select a valid folder.' }` |
| AC-UP-02 | Empty files | `{ status: 'error', message: 'Please select at least one file to upload.' }` |
| AC-UP-03 | Non-image type | message matches `not an allowed image type` |
| AC-UP-04 | Bad magic bytes | message matches `file content is not a valid image` |
| AC-IR-02 | Upload/delete with `../`, extra path segments, or non-image bytes is rejected and no file appears outside `public/images/<allowedFolder>/` | content-admin |

## Image pipeline

| ID | Criterion | Measure |
|----|-----------|---------|
| AC-IMG-01 | Bad `galleryId` on pack | `GET /api/gallery-pack` → 400, `{ error: 'Invalid galleryId' }` |
| AC-IMG-02 | Missing image params | `GET /api/image` without `galleryId` or `name` → 400, `{ error: 'galleryId and name are required' }` |
| AC-IMG-03 | Invalid image params | `GET /api/image` with gallery/name outside allow-list / `SAFE_FILENAME` → 400, `{ error: 'Invalid parameters' }` |
| AC-IMG-04 | Pack default width | omitted `size` snaps to 500 (`gallery-pack/route.ts`) |
| AC-IMG-05 | Single-image default width | omitted `width` is 1600, then clamped to `[256, 384, 512, 640, 828, 1080, 1200, 1600, 2000]` |
| AC-IMG-06 | Cache-Control on pack/image hits | `public, max-age=300, s-maxage=300` |
| AC-INV-01 | Unauthenticated invalidate | `POST /api/gallery-pack/invalidate` → 401, `{ error: 'Unauthorized' }` |
| AC-IR-01 | After a successful upload or delete, a new visitor (empty localStorage) sees the updated file set in that section’s carousel within one page load | image-pipeline + content-admin |
| AC-IR-06 | `GET /api/image` with a gallery or filename outside the allow-list / safe pattern returns 400 and does not read other paths | image-pipeline |

## Ops

| ID | Criterion | Measure |
|----|-----------|---------|
| AC-IR-07 | Empty/missing folder does not render a broken carousel (section omitted or empty, no 500) | storefront — same as AC-F1-01 |
| AC-IR-08 | Production gallery bytes served to the Next app are the same files the admin upload writes (`/app/public/images`); nginx static alias must not serve a different tree | ops |

## Interaction risk map

| Risk | AC |
|------|-----|
| IR-01 | AC-IR-01 |
| IR-02 | AC-IR-02 |
| IR-03 | AC-IR-03 |
| IR-04 | AC-IR-04 |
| IR-05 | AC-IR-05 |
| IR-06 | AC-IR-06 |
| IR-07 | AC-IR-07 / AC-F1-01 |
| IR-08 | AC-IR-08 |
