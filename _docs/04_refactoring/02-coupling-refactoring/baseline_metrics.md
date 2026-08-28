# Baseline metrics — 02-coupling-refactoring

**Date**: 2026-08-28  
**Mode**: Automatic  
**Goals**: clean deferred maintainability from Step 4 / architecture baseline; no behavior change.  
**Functional suite**: `_docs/06_metrics/testrun_2026-08-28_functional.md` — 47 passed, 0 failed, 0 skipped.

## Coverage

| Kind | Value | Notes |
|------|-------|-------|
| Unit | none | no `run-unit-tests.sh`; `--unit-only` is SKIP |
| Blackbox / functional | 47/47 PASS | `scripts/run-tests.sh` + Compose SUT `13001` |
| Overall (instrumented) | N/A | no coverage runner in repo |
| Critical paths | exercised | login, prices, upload/delete, pack/image, session recreate, rate-limit |

## Complexity

| Metric | Value | Notes |
|--------|-------|-------|
| First-party TS/JS LOC | 2533 | 45 files under `dianych-website/`, excluding `node_modules` / `.next` |
| Cyclomatic (tool) | N/A | no lizard/radon/eslint-complexity in the project |
| Tech debt ratio | N/A | no Sonar |

## Code smells (from baseline + re-check)

| # | Severity | Status | Item |
|---|----------|--------|------|
| F1 | Medium | **stale** | `jimp` is imported dynamically in `gallery-pack/cache.ts` as sharp fallback — do not remove without a replacement |
| F2 | Low | open | empty unused `app/components/FrameCard.tsx` (real card is inline in `Frames.tsx`) |
| F3 | Low | open | `app/fonts.ts` unused; layout loads the woff directly |
| F4 | Low | open | `expandIfShort` duplicated in `app/api/login/route.ts` and `scripts/hash-pw.js` |

No Critical/High Architecture findings (`architecture_compliance_baseline.md`).

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Functional wall | 331s | includes NFT-RES-LIM-03 300s soak |
| Perf suite | not re-run this step | `scripts/run-performance-tests.sh` exists; last implement batch recorded NFT-PERF-01–04 PASS |
| P50/P95/P99 | N/A this run | not collected in functional runner |

## Dependencies

| Metric | Value |
|--------|-------|
| Runtime | 8 (`next` 15.5.2, `react` 19.1.0, `sharp`, `jimp` fallback, `iron-session`, `bcryptjs`, `embla-carousel-react`) |
| Dev | 8 (eslint, tailwind 4, typescript, types) |
| Outdated / CVE scan | N/A this run (not `npm audit`) |

## Build

| Metric | Value |
|--------|-------|
| Image rebuild | cached this run |
| Test execution | 331470 ms (`run-tests.sh` 2026-08-28) |
| Deploy time | N/A (no deploy in this step) |

## Functionality inventory

| Area | Status | Coverage |
|------|--------|----------|
| Storefront galleries / UA copy | live | FT-P-01–03, SM-01, SM-03 |
| Frames + prices GET/POST | live | FT-P-04–06, SM-02 |
| Auth login / logout / manage gate | live | FT-N-01–04, FT-P-07, FT-P-12, SM-04 |
| Upload / delete manage actions | live | FT-P-11, FT-N-08–12 |
| Image / gallery-pack | live | FT-P-08–10, FT-N-13–16 |
| Resilience / resource | live | NFT-RES-01–05, NFT-RES-LIM-01–03 |
| Security mutations | live | NFT-SEC-01–06 |

## Repro

```bash
./scripts/run-tests.sh
# expect Passed=47 Failed=0 Skipped=0
```
