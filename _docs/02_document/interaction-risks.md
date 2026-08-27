# Interaction Risks → Acceptance Criteria

Derived from `system-flows.md` / `architecture.md`. Stable ACs in `_docs/00_problem/acceptance_criteria.md`.

| ID | Seam | Risk | AC | Owner |
|----|------|------|----|-------|
| IR-01 | F2 carousel → `/api/gallery-pack` | After upload/delete, thumbs stay stale (invalidate only w500; client size 400 + localStorage) | AC-IR-01 | image-pipeline + content-admin |
| IR-02 | F4 actions → `public/images` | Path traversal or non-image upload writes outside allow-listed folders | AC-IR-02 | content-admin |
| IR-03 | F3 login → session cookie → F4 | Unauthenticated mutation succeeds if only `/manage` is gated | AC-IR-03 | auth + content-admin |
| IR-04 | F5 prices file path | UI edits a nested JSON file; committed `data/framePrices.json` is ignored | AC-IR-04 | content-admin |
| IR-05 | F7 ops → auth | New `SECRET_COOKIE_PASSWORD` on every container start | AC-IR-05 | ops + auth |
| IR-06 | F2 modal → `/api/image` | Invalid `galleryId`/`name` reads arbitrary files | AC-IR-06 | image-pipeline |
| IR-07 | F1 listing → F2 pack | Empty or missing folder | AC-IR-07 / AC-F1-01 | storefront |
| IR-08 | nginx `/images/` vs docker volume | `install.sh` alias `/root/dianych/images` ≠ `/var/www/dianych/images` | AC-IR-08 | ops |

Rejected (wiring-only): “page imports Header” — no missing-call risk.

ASK: none — ACs are measurable without a product decision.
