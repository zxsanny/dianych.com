# Interaction Risks → Acceptance Criteria

Derived from `system-flows.md` / `architecture.md`. Draft ACs; Step 6c assigns stable ids.

| ID | Seam | Risk | Draft AC | Owner |
|----|------|------|----------|-------|
| IR-01 | F2 carousel → `/api/gallery-pack` | After upload/delete, thumbs stay stale (invalidate only w500; client size 400 + localStorage) | After a successful upload or delete in a gallery, a new visitor (empty localStorage) sees the updated file set in that section’s carousel within one page load | image-pipeline + content-admin |
| IR-02 | F4 actions → `public/images` | Path traversal or non-image upload writes outside allow-listed folders | Upload/delete with `../`, extra path segments, or non-image bytes is rejected and no file appears outside `public/images/<allowedFolder>/` | content-admin |
| IR-03 | F3 login → session cookie → F4 | Unauthenticated mutation succeeds if only `/manage` is gated | `uploadImages`, `deleteImage`, `POST /api/prices`, `POST /api/gallery-pack/invalidate` return unauthorized and do not change files/prices/cache when the session cookie is missing | auth + content-admin |
| IR-04 | F5 prices file path | UI edits a nested JSON file; committed `data/framePrices.json` is ignored | `GET /api/prices` after `POST` returns the posted numbers (same process cwd as production: app root `dianych-website/`) | content-admin |
| IR-05 | F7 ops → auth | New `SECRET_COOKIE_PASSWORD` on every container start | After container recreate, an old session cookie does not open `/manage`; login with current `pw.txt` still works | ops + auth |
| IR-06 | F2 modal → `/api/image` | Invalid `galleryId`/`name` reads arbitrary files | `GET /api/image` with a gallery or filename outside the allow-list / safe pattern returns 400 and does not read other paths | image-pipeline |
| IR-07 | F1 listing → F2 pack | Empty or missing folder | A configured section whose folder is missing or empty does not render a broken carousel (section omitted or empty, no 500) | storefront |
| IR-08 | nginx `/images/` vs docker volume | `install.sh` alias `/root/dianych/images` ≠ `/var/www/dianych/images` | Production gallery bytes served to the Next app are the same files the admin upload writes (`/app/public/images`) — nginx static alias must not serve a different tree | ops |

Rejected (wiring-only): “page imports Header” — no missing-call risk.

ASK: none — ACs are measurable without a product decision.
