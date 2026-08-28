# Smell scan S01–S32 — 02-coupling-refactoring

Scope: `dianych-website/` first-party TS/JS (exclude `node_modules`, `.next`).

| ID | Verdict | Evidence |
|----|---------|----------|
| S01 | not_found | No function ≫ ~80 LOC; `Frames.tsx` FrameCard+Frames is the longest UI file, still readable |
| S02 | not_found | No god object; largest files are `cache.ts` / `actions.ts` / `image/route.ts` with one concern each |
| S03 | not_found | Props lists stay small |
| S04 | not_found | Gallery ids are string unions in practice; acceptable for this size |
| S05 | not_found | Price four-tuple is a clump but is the product contract |
| S06 | found | `expandIfShort` in login + hash-pw; gallery-id lists in `actions.ts`, `image/route.ts`, `invalidate/route.ts`, manage folders. → C03, C04 |
| S07 | found | Empty `FrameCard.tsx`; unused `app/fonts.ts`. → C01, C02 |
| S08 | not_found | No unused abstraction layers |
| S09 | found | Empty `FrameCard.tsx` is a lazy/dead file. → C01 |
| S10 | n/a | No domain entity classes |
| S11 | not_found | Components use own props / HTTP |
| S12 | not_found | Baseline: no import cycles |
| S13 | not_found | No long message chains |
| S14 | not_found | Gallery wrappers are thin but are the public sections |
| S15 | not_found | Files already split by route |
| S16 | found | Adding a sixth gallery edits ≥4 files. → C04 |
| S17 | not_found | No type-code switches |
| S18 | not_found | — |
| S19 | n/a | No inheritance |
| S20 | found | Widths 400/500/1200, rate-limit 5 / 15 min — named in some files, still product policy. See S21 inventory |
| S21 | found | INV — `config_in_code_inventory.md` |
| S22 | n/a | No database / no SQL |
| S23 | not_found | Status strings are API contract (`success`/`error`) |
| S24 | found | In-process `loginAttempts` Map and thumb `memoryCache` — documented runtime caches, not durable SoT. Defer |
| S25 | found | Empty `catch {}` on cache/fs best-effort (`diskCache.ts`, `cache.ts`, `image/route.ts`, carousels). Defer — changing would alter noise/behavior |
| S26 | not_found | No cycles |
| S27 | not_found | No separate business layer to leak into |
| S28 | not_found | Secrets from `SECRET_COOKIE_PASSWORD` / isolated `pw.txt`; hash-pw reads argv |
| S29 | not_found | No deep boolean forests |
| S30 | found | Thumb width defaults 400 vs 500 vs 1200 per consumer. Defer — AC/perf, not this cleanup |
| S31 | not_found | INV empty — JSX/SFC only; `layout.tsx` `<html>` is the Next root, not string HTML |
| S32 | not_found | Filename safety is explicit regex + magic bytes, not hidden substring rules |
