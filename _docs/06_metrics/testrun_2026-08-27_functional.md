# Functional test run — 2026-08-27

**Runner**: `scripts/run-tests.sh` + `docker-compose.test.yml` (SUT `13001`)
**Result**: 38 passed, 0 failed, 9 skipped, 0 errors
**Reality gate**: PASS — real Next.js image; assertions vs `results_report.md` / test-data; no product stubs.

## Skips (all legitimate)

| ID | Reason | Class |
|----|--------|-------|
| FT-P-11 | manage form / Next server action | runner cannot POST server actions; `environment.md` requires a browser consumer |
| FT-N-08 | same | same |
| FT-N-09 | same | same |
| FT-N-10 | same | same |
| FT-N-11 | same | same |
| FT-N-12 | same | same |
| NFT-RES-LIM-02 | same | 20 MB body uses the same form |
| NFT-RES-LIM-01 | same run as FT-N-03 | alias; FT-N-03 PASS |
| NFT-SEC-03 | covered by FT-N-03 | alias; FT-N-03 PASS |
