# Testability Assessment

**Date**: 2026-08-27  
**Flow**: existing-code Step 4  
**Purpose**: enable tests to run at all on an existing codebase; deeper structural work belongs in Step 8 (Refactor)  
**Baseline**: `_docs/02_document/architecture_compliance_baseline.md` — PASS_WITH_WARNINGS, no High/Critical Architecture findings  
**Outcome**: Code is testable — no changes needed

## Scenarios reviewed

All IDs from `_docs/02_document/tests/traceability-matrix.md` and the Phase 2 scenario files.

| Family | IDs | Exercisable without code change? | Notes |
|--------|-----|----------------------------------|-------|
| Storefront | FT-P-01–03, FT-P-02 / NFT-RES-01 | Yes | `GET /` HTML; locale default UA in HTML; EN toggle is browser-only |
| Auth | FT-N-01–04, FT-P-07, FT-P-12, NFT-SEC-03–06 | Yes | `POST /api/login`, cookie, `/manage` redirect; isolated `pw.txt` + `SECRET_COOKIE_PASSWORD` |
| Prices | FT-P-04–06, FT-N-05–06, NFT-RES-02 | Yes | Public GET/POST; writable mount at `cwd/dianych-website/data` (see runner) |
| Image pipeline | FT-P-08–10, FT-N-13–16, NFT-SEC-02, NFT-PERF-02–03 | Yes | Query params + JSON `width` / `Cache-Control` / error objects |
| Invalidate | FT-N-07, NFT-SEC-01, NFT-SEC-05 | Yes | `POST /api/gallery-pack/invalidate` |
| Upload / delete | FT-P-11, FT-N-08–12, NFT-RES-LIM-02 | Yes (browser / manage forms) | Next server actions are not curl-scriptable; black-box via manage UI. No new HTTP API added here. |
| Ops / session recreate | NFT-RES-04, SM-05, NFT-RES-05 | Yes | Compose recreate + cookie; static `/images/` vs JSON image API |
| Resource | NFT-RES-LIM-01, NFT-RES-LIM-03 | Yes | Rate-limit HTTP; cache soak is duration not a seam |

## Isolation checks

| Concern | What the code does | Why tests still run |
|---------|--------------------|---------------------|
| `pw.txt` path | `process.cwd()/pw.txt` | Isolated file mounted in Compose |
| Prices path | `process.cwd()/dianych-website/data/framePrices.json` | `TEST_PRICES_DIR` mounted at that path (writable under `--read-only`) |
| Gallery bytes | `process.cwd()/public/images/<id>` | Fixture volume |
| Session secret | `SECRET_COOKIE_PASSWORD` env | Already injectable |
| Login rate-limit map | in-process `Map` | Dedicated `X-Forwarded-For` per suite |
| Thumb cache | `os.tmpdir()` | Container `/tmp` tmpfs |
| Instagram / social | outbound `<a href>` only | Not called |
| No DB / no vendor SDK | — | Nothing to stub |

## Baseline overlap

Unused `jimp`, empty `FrameCard.tsx`, unused `app/fonts.ts`, duplicated `expandIfShort` — Maintainability only. Deferred to Step 8 Refactor.

## Deferred to Step 8 Refactor

- Optional `FRAMES_PRICES_PATH` / `PW_FILE` env (nicety; volume mount is enough for blackbox)
- REST twins for `uploadImages` / `deleteImage` (would let `scripts/run-tests.sh` drop those SKIPs)
- Remove unused `jimp` / dead files
- Production `--read-only` vs nested prices write (IR-04) — product/ops, not a test seam

## Decision

No list-of-changes. No refactor skill run. Folder fallback: this file.
