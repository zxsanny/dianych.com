# Verification log

Compared Steps 1–3.5 docs to source on 2026-08-26.

## Verified (entity exists)

| Claim | Code |
|-------|------|
| `getImagePaths`, `enforceCacheLimit`, `sessionOptions`, `useLanguage`, `useTranslation` | `lib/*`, `contexts/LanguageContext.tsx` |
| `uploadImages`, `deleteImage`, `getGalleryImages` | `app/actions.ts` |
| Routes login/logout/prices/image/gallery-pack/invalidate | `app/api/**/route.ts` |
| Middleware matcher `/manage/:path*` | `middleware.ts` |
| Components listed in discovery | `app/components/*.tsx` except unused empty `FrameCard.tsx` |
| `vinnytsiaSerif` in layout from woff2; `app/fonts.ts` unused | `layout.tsx`, `fonts.ts` |
| Prices path `cwd/dianych-website/data/framePrices.json` | `api/prices/route.ts` L8 |
| ALLOWED galleries five names | actions + image + gallery-pack |
| Rate limit 5 / 15 min | `api/login/route.ts` |
| Docker standalone, port 3001, volume, read-only | Dockerfile, restart.sh |
| No tests | scan |

## Corrections applied

None after write — paths and signatures matched on re-read.

## Flagged (not hallucinations; product/ops gaps)

| Flag | Severity | Notes |
|------|----------|-------|
| Nested prices file vs `data/framePrices.json` | High | documented; IR-04 |
| Invalidate width ≠ carousel size | Medium | IR-01 |
| Session secret rotated every run | High | IR-05 |
| nginx image alias ≠ volume | High | IR-08 |
| `jimp` unused | Low | package.json only |
| Empty `FrameCard.tsx` | Low | dead file |
| `app/fonts.ts` unused | Low | dead export |
| Login errors not shown in UI | Medium | F3 |

## Completeness

- All 29 planned modules have a doc under `modules/`
- All six components mapped; module-layout Owns exclusive
- No inbound vendor contracts (gaps file empty of Verify rows)
- Open flags are behavioral/ops, not missing entities

**Completeness score**: 100% of scanned first-party source files assigned; 0 unresolved entity flags.

## Open flags for confirm

The four High/Medium ops/cache items are recorded as interaction ACs, not doc errors. No unresolved “entity not in code” flags.
