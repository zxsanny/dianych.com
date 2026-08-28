# Functional test run — 2026-08-28

**Runner**: `scripts/run-tests.sh` + `docker-compose.test.yml` (SUT `13001`)
**Result**: 47 passed, 0 failed, 0 skipped, 0 errors
**Reality gate**: PASS — real Next.js image; HTTP + manage server-action cases vs `results_report.md` / test-data; no product stubs.

Previously skipped manage-form cases (FT-P-11, FT-N-08–12, NFT-RES-LIM-02) now run via `scripts/invoke-manage-action.js`. NFT-SEC-03 / NFT-RES-LIM-01 are executed aliases of FT-N-03 (both PASS).
