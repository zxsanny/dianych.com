# List of Changes

**Run**: 02-coupling-refactoring  
**Mode**: automatic  
**Source**: self-discovered  
**Date**: 2026-08-28

## Summary

Delete two dead files, share `expandIfShort`, and one gallery-id catalog. No behavior change. jimp, silent cache catches, price defaults, and REST upload twins stay deferred.

## Changes

### C01: Delete empty FrameCard.tsx
- **File(s)**: `dianych-website/app/components/FrameCard.tsx`
- **Problem**: Zero-byte unused file; real card is inline in `Frames.tsx` (S07/S09)
- **Change**: Delete the file. Do not extract the inline card unless it is imported elsewhere (it is not).
- **Rationale**: Dead code
- **Constraint Fit**: Storefront AC unchanged
- **Risk**: low
- **Dependencies**: None

### C02: Delete unused app/fonts.ts
- **File(s)**: `dianych-website/app/fonts.ts`
- **Problem**: Exports `vinnytsiaSerif` from `.woff`; `layout.tsx` already loads `.woff2` inline. Nothing imports `fonts.ts` (S07)
- **Change**: Delete `app/fonts.ts`. Leave `layout.tsx` and `app/fonts/*.woff2` as they are.
- **Rationale**: Duplicate unused font helper
- **Constraint Fit**: Visual identity stays on layout’s woff2
- **Risk**: low
- **Dependencies**: None

### C03: Single expandIfShort helper
- **File(s)**: `dianych-website/app/api/login/route.ts`, `dianych-website/scripts/hash-pw.js`
- **Problem**: Same short-password expansion in two places (S06)
- **Change**: One shared helper (small `.ts` or `.js` both can call, or hash-pw imports the login-adjacent module). Behavior: length ≥32 unchanged; else `{pass}.{pass}.{pass}`.
- **Rationale**: Auth AC depends on this rule staying identical for hash and compare
- **Constraint Fit**: AC-AUTH-02/05; do not change the expansion formula
- **Risk**: medium
- **Dependencies**: None

### C04: Single gallery-id catalog
- **File(s)**: `app/actions.ts`, `app/api/image/route.ts`, `app/api/gallery-pack/invalidate/route.ts`, `app/manage/ManagePageClient.tsx`
- **Problem**: Five ids repeated; adding a folder is shotgun surgery (S16/S21)
- **Change**: One exported `GALLERY_IDS` (or equivalent) in shared-runtime; consumers import it. Manage `prices` tab is not a gallery id.
- **Rationale**: One SoT for AC-F1-02
- **Constraint Fit**: Set remains `{brooches, clothes, panel, felting, kits}`
- **Risk**: low
- **Dependencies**: None

### C05: Shared default frame prices
- **File(s)**: `app/components/Frames.tsx`, `app/manage/PricesManager.tsx`
- **Problem**: AC-PRICE-01 defaults duplicated (tech debt)
- **Change**: One exported default-prices object matching `expected_results/default_frame_prices.json`. Both UI sites import it. `prices/route.ts` keep-or-import same object if it inlines defaults.
- **Rationale**: Track A — one SoT for the four numbers
- **Constraint Fit**: values stay 450/500/600/700
- **Risk**: low
- **Dependencies**: None
- **Track**: Technical Debt
- **Effort**: 1

### C06: diskCache empty catch
- **File(s)**: `dianych-website/lib/diskCache.ts`
- **Problem**: S25 empty `catch {}` on cache trim (tech debt)
- **Change**: Keep best-effort behavior; catch and ignore with a one-line reason (or rethrow unexpected). Do not add verbose logs. Other empty catches stay deferred.
- **Rationale**: Track A — smallest S25 site that is shared-runtime
- **Constraint Fit**: cache cap still 500 MB; failures still do not crash requests
- **Risk**: low
- **Dependencies**: None
- **Track**: Technical Debt
- **Effort**: 1

### C07: Security verification after catalog move
- **File(s)**: `actions.ts`, `image/route.ts`, `invalidate/route.ts`, `middleware.ts`
- **Problem**: Track C — C04 must not widen allow-lists or open `/manage` matcher
- **Change**: No product API change. After C04, confirm allow-list is still exactly the five ids; middleware still `/manage` only; FT-N-12, NFT-SEC-01/02/04 still pass.
- **Rationale**: Shotgun id lists are a path-safety seam
- **Constraint Fit**: AC-UP-*, AC-IR-03
- **Risk**: low
- **Dependencies**: C04
- **Track**: Security Review
- **Severity**: Low (verification)
- **Effort**: 1

## Deferred (explicit)

| Item | Why |
|------|-----|
| Remove jimp | Live sharp fallback in `cache.ts` |
| Empty `catch {}` cache/fs (S25) | Best-effort I/O; logging would change ops noise |
| `DEFAULT_PRICES` / `DEFAULTS` duplication | Must stay exact vs `results_report.md`; not blocking |
| `FRAMES_PRICES_PATH` / `PW_FILE` env | Volume mount is enough |
| REST twins for upload/delete | Product surface; runner already scripts server actions |
| Thumb width 400/500/1200 (S30) | Perf/AC, not cleanup |
| Rate-limit / cache-byte constants | AC / resource policy |
| UA/EN copy and contact URLs | Content |
