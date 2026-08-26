# Module Layout

**Language**: typescript
**Layout Convention**: custom (Next.js App Router under `dianych-website/`)
**Root**: `dianych-website/`
**Last Updated**: 2026-08-26
**Status**: derived-from-code

## Layout Rules

1. This repo does not use one top-level directory per component. Ownership is by App Router / lib path globs below.
2. There is no `shared/` package. Shared Runtime is `lib/` + `contexts/`.
3. Cross-cutting session/locale live in Shared Runtime, not a separate package.
4. Public API = listed exports. Other files in the same glob are internal.
5. No first-party test tree.

## Per-Component Mapping

### Component: shared-runtime

- **Epic**: pending
- **Directory**: `dianych-website/lib/`, `dianych-website/contexts/`
- **Public API**:
  - `lib/session.ts` — `sessionOptions`, `SessionData`, `getSession`, `getSessionFromRequest`
  - `lib/galleryUtils.ts` — `getImagePaths`
  - `lib/diskCache.ts` — `enforceCacheLimit`
  - `lib/translations.ts` — `useTranslation`
  - `contexts/LanguageContext.tsx` — `LanguageProvider`, `useLanguage`
- **Internal**: `app/fonts.ts` (unused)
- **Owns**: `dianych-website/lib/**`, `dianych-website/contexts/**`, `dianych-website/app/fonts.ts`, `dianych-website/app/fonts/**`
- **Imports from**: (none first-party)
- **Consumed by**: image-pipeline, auth, content-admin, storefront

### Component: image-pipeline

- **Epic**: pending
- **Directory**: `dianych-website/app/api/gallery-pack/`, `dianych-website/app/api/image/`
- **Public API**:
  - `app/api/gallery-pack/cache.ts` — `regenerateGalleryPack`, `invalidateCache`, `memoryCache`, `buildCacheKey`, `getDiskCachePath`
  - HTTP `GET /api/gallery-pack`, `POST /api/gallery-pack/invalidate`, `GET /api/image`
- **Internal**: route handlers except cache.ts exports
- **Owns**: `dianych-website/app/api/gallery-pack/**`, `dianych-website/app/api/image/**`
- **Imports from**: shared-runtime
- **Consumed by**: storefront, content-admin

### Component: auth

- **Epic**: pending
- **Directory**: `app/api/login`, `app/api/logout`, `app/login`, `app/logout`, `middleware.ts`, `scripts/hash-pw.js`
- **Public API**: HTTP `/api/login`, `/api/logout`, `/login`; `middleware` matcher `/manage/:path*`
- **Internal**: rate-limit Map, `expandIfShort`, `hash-pw.js`
- **Owns**: `dianych-website/app/api/login/**`, `dianych-website/app/api/logout/**`, `dianych-website/app/login/**`, `dianych-website/app/logout/**`, `dianych-website/middleware.ts`, `dianych-website/scripts/hash-pw.js`
- **Imports from**: shared-runtime
- **Consumed by**: content-admin

### Component: content-admin

- **Epic**: pending
- **Directory**: `app/actions.ts`, `app/api/prices`, `app/manage`, `data/`
- **Public API**: `uploadImages`, `deleteImage`, `getGalleryImages`; HTTP `GET|POST /api/prices`; `/manage`
- **Internal**: manage UI files, `RemoveButton`
- **Owns**: `dianych-website/app/actions.ts`, `dianych-website/app/api/prices/**`, `dianych-website/app/manage/**`, `dianych-website/data/**`, `dianych-website/dianych-website/data/**`
- **Imports from**: shared-runtime, image-pipeline, auth (session cookie)
- **Consumed by**: storefront (files/prices)

### Component: storefront

- **Epic**: pending
- **Directory**: `app/components/`, `app/page.tsx`, `app/layout.tsx`
- **Public API**: `/` page tree (not imported elsewhere)
- **Internal**: all `app/components/**`
- **Owns**: `dianych-website/app/components/**`, `dianych-website/app/page.tsx`, `dianych-website/app/layout.tsx`, `dianych-website/app/globals.css`, `dianych-website/public/static-images/**`
- **Imports from**: shared-runtime, image-pipeline (HTTP), content-admin (HTTP GET prices + image files)
- **Consumed by**: (browsers)

### Component: ops

- **Epic**: pending
- **Directory**: repo root + `dianych-website/Dockerfile`
- **Public API**: operator scripts
- **Internal**: nginx snippet in `install.sh`
- **Owns**: `Dockerfile`, `.dockerignore`, `build.cmd`, `install.sh`, `restart.sh`, `update.sh`, `dianych-website/Dockerfile`, `dianych-website/.dockerignore`
- **Imports from**: (none)
- **Consumed by**: production host

## Shared / Cross-Cutting

No `shared/` package. Session, locale, disk cache, and gallery listing are Shared Runtime above.

## Allowed Dependencies (layering)

| Layer | Components | May import from |
|-------|------------|-----------------|
| 4. Entry / UI | storefront, content-admin, auth pages | 1, 2, 3 |
| 3. HTTP adapters | image-pipeline routes, auth routes, prices route | 1, 2 |
| 2. Domain services | image-pipeline `cache.ts`, actions | 1 |
| 1. Shared / Foundation | shared-runtime | (none) |
| 0. Host | ops | (none; wraps build output) |

## Verification Needed

None — exclusive Owns globs; no import-graph cycles; layers match the scanned imports.
