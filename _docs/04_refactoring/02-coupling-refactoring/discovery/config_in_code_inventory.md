# S21 config-in-code inventory

Scan: all first-party `dianych-website/**/*.{ts,tsx,js}` except `node_modules` / `.next`. Method: ripgrep for module-level `const` + known catalogs.

| file | line/symbol | classification | notes | change_id / deferral |
|------|-------------|----------------|-------|----------------------|
| `app/actions.ts` | `allowedFolders` | business | five gallery ids | C04 |
| `app/api/image/route.ts` | `ALLOWED_GALLERIES` | business | same five ids | C04 |
| `app/api/gallery-pack/invalidate/route.ts` | `ALLOWED_GALLERIES` | business | same five ids | C04 |
| `app/manage/ManagePageClient.tsx` | `folders[].key` | business | five ids + `prices` tab | C04 (ids only; `prices` stays UI) |
| `app/api/prices/route.ts` | `DATA_FILE` | system | cwd-relative prices path | defer — IR-04 / volume mount |
| `lib/session.ts` | `SECRET_COOKIE_PASSWORD` | system | already env | code-ok |
| `app/api/login/route.ts` | `MAX_ATTEMPTS=5`, `WINDOW_MS` | business | AC-AUTH-03 | defer — AC literals |
| `lib/diskCache.ts` | `MAX_CACHE_BYTES` 500MB | system | resource limit | defer |
| `app/api/image/route.ts` | `WIDTH_BREAKPOINTS` | system | clamp table | defer |
| `app/components/GalleryCarousel.tsx` | `GALLERY_PACK_THUMB_WIDTH=400` | system | pack request | defer S30 |
| `app/api/gallery-pack/cache.ts` | default width `500` | system | pack regenerate | defer S30 |
| `app/components/Modal.tsx` | `MODAL_IMAGE_WIDTH=1200` | system | modal fetch | defer S30 |
| `app/components/Frames.tsx` | `DEFAULT_PRICES` | business | AC-PRICE-01 defaults | defer — must stay exact vs results_report |
| `app/manage/PricesManager.tsx` | `DEFAULTS` | business | same four numbers | defer — same |
| `app/actions.ts` | `ALLOWED_EXTENSIONS`, `IMAGE_MAGIC` | code-ok | file-type policy in code is correct | defer |
| `lib/translations.ts` | `translations` | business | UA/EN copy | defer — content, not this run |
| `app/components/Contact.tsx` | `contactLinks` | business | social URLs | defer |
