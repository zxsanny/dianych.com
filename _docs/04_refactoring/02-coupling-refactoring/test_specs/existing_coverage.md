# Existing coverage — safety net

**Date**: 2026-08-28  
**Suite**: `_docs/06_metrics/testrun_2026-08-28_functional.md` — 47 passed, 0 failed, 0 skipped.

| Change | Paths | Blackbox cover |
|--------|-------|----------------|
| C01/C02 | FrameCard.tsx, fonts.ts | FT-P-01, SM-01 |
| C03 | login, hash-pw | FT-N-01–03, FT-P-07 |
| C04/C07 | gallery ids, middleware | FT-P-01, FT-N-08, FT-N-12, NFT-SEC-01/02/04 |
| C05 | default prices | FT-P-04 |
| C06 | diskCache.ts | FT-P-08 |

No instrumented line coverage (no unit runner). Critical-path floor: in-scope public APIs already have blackbox cases. No new tests in 3b.

**GATE**: existing suite PASS — proceed to Phase 4.
