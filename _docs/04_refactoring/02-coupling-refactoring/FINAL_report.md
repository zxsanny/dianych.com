# FINAL report — 02-coupling-refactoring

**Mode**: automatic  
**Input**: self-discovered (architecture baseline + Step 4 smells)  
**Date**: 2026-08-28  
**Phases**: 0–7 complete

## Metrics

| Metric | Baseline | Final |
|--------|----------|-------|
| Blackbox | 47/47 | 47/47 |
| First-party files | 45 | 46 (−2 dead, +3 lib) |
| F2/F3/F4 | open | closed |
| jimp | keep (live fallback) | keep |
| Wall | 331s | 346s |

## Changes

C01–C07: deleted empty `FrameCard.tsx` and unused `app/fonts.ts`; one `expandIfShort`; one `GALLERY_IDS`; shared `DEFAULT_FRAME_PRICES`; diskCache catch is non-empty; allow-list and `/manage` matcher unchanged.

Tracker: epic AZ-1580; tasks AZ-1581–1586 Done. Commit `b2a1604`.

## Remaining (deferred)

jimp stay; other empty cache/fs catches; REST twins for upload/delete; thumb-width drift; rate-limit / cache constants; UA/EN copy.

## Lessons

`restrictions.md` “jimp unused” was stale — dynamic import in `cache.ts`. Auth helper must stay `.js` so `hash-pw.js` can import it.
