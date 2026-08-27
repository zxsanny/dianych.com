# Traceability Matrix

## Acceptance Criteria Coverage

| AC ID | Acceptance Criterion | Test IDs | Coverage |
|-------|---------------------|----------|----------|
| AC-F1-01 | Missing/empty gallery does not 500 | FT-P-02, NFT-RES-01 | Covered |
| AC-F1-02 | Public `/` lists only the five gallery ids | FT-P-01 | Covered |
| AC-F1-03 | UA and EN copy keys match | FT-P-03 | Covered |
| AC-AUTH-01 | Missing password → 400 | FT-N-01 | Covered |
| AC-AUTH-02 | Wrong password → 401 | FT-N-02 | Covered |
| AC-AUTH-03 | 6th login / 15 min → 429 | FT-N-03, NFT-SEC-03, NFT-RES-LIM-01 | Covered |
| AC-AUTH-04 | Unauthenticated `/manage` → `/login` | FT-N-04, FT-P-12, NFT-SEC-04, SM-04 | Covered |
| AC-AUTH-05 | Successful login → session + `/manage` | FT-P-07, FT-P-12 | Covered (input: env `TEST_ADMIN_PASSWORD`) |
| AC-IR-05 | Old session after container recreate | NFT-RES-04 | Covered (container mode; SKIP if not run) |
| AC-PRICE-01 | Missing prices file → defaults | FT-P-04, NFT-RES-02, SM-02 | Covered |
| AC-PRICE-02 | Unauthenticated POST prices → 401 | FT-N-05, NFT-SEC-01 | Covered |
| AC-PRICE-03 | Negative/non-finite price → 400 | FT-N-06 | Covered |
| AC-PRICE-04 | Valid POST prices echoes body | FT-P-05 | Covered |
| AC-IR-04 | GET prices after POST returns posted numbers | FT-P-06 | Covered |
| AC-IR-03 | Unauth upload/delete/prices/invalidate do not mutate | FT-N-05, FT-N-07, NFT-SEC-01 | Covered |
| AC-UP-01 | Bad folder upload | FT-N-08 | Covered |
| AC-UP-02 | Empty files upload | FT-N-09 | Covered |
| AC-UP-03 | Non-image type | FT-N-10 | Covered |
| AC-UP-04 | Bad magic bytes | FT-N-11 | Covered |
| AC-IR-02 | Traversal upload/delete rejected | FT-N-12, NFT-SEC-02 | Covered |
| AC-IMG-01 | Bad `galleryId` on pack → 400 | FT-N-13 | Covered |
| AC-IMG-02 | Missing image params → 400 | FT-N-14 | Covered |
| AC-IMG-03 | Invalid image params → 400 | FT-N-15, NFT-SEC-02 | Covered |
| AC-IMG-04 | Pack default width 500 | FT-P-08, NFT-PERF-02 | Covered |
| AC-IMG-05 | Image default width 1600 | FT-P-09 | Covered |
| AC-IMG-06 | Cache-Control 300s | FT-P-10 | Covered |
| AC-INV-01 | Unauthenticated invalidate → 401 | FT-N-07, NFT-SEC-05 | Covered |
| AC-IR-01 | New visitor sees updated file set after upload/delete | FT-P-11 | Covered (needs session + fixture JPEG) |
| AC-IR-06 | Image GET outside allow-list → 400 | FT-N-15, FT-N-16, NFT-SEC-02 | Covered |
| AC-IR-07 | Empty folder does not break carousel | FT-P-02, NFT-RES-01 | Covered |
| AC-IR-08 | nginx `/images/` bytes match app volume | SM-05 | Covered (prod/ops smoke; SKIP if host paths not comparable) |

## Restrictions Coverage

IDs assigned here (restrictions.md has no IDs).

| Restriction ID | Restriction | Test IDs | Coverage |
|---------------|-------------|----------|----------|
| RESTRICT-HW-01 | Single host; one container | — | NOT COVERED — topology fact; ops checklist |
| RESTRICT-HW-02 | Published port `3001` → `3000` | — | NOT COVERED — host bind; asserted only if `SUT_MODE=container` in environment.md |
| RESTRICT-HW-03 | Gallery volume `/var/www/dianych/images` → `/app/public/images` | SM-05 | Covered (identity of bytes, not the host path string) |
| RESTRICT-HW-04 | `/tmp` tmpfs 512m | NFT-RES-LIM-03 | Covered (process stays up; optional container) |
| RESTRICT-HW-05 | Thumb cache cap 500 MB | NFT-RES-LIM-03 | Covered (no crash; eviction not HTTP-visible) |
| RESTRICT-SW-01 | TypeScript 5 / Next 15.5.2 / React 19 | — | NOT COVERED — compile-time stack |
| RESTRICT-SW-02 | Tailwind 4 | — | NOT COVERED — compile-time stack |
| RESTRICT-SW-03 | iron-session, bcryptjs, sharp | FT-P-07, FT-P-09 | Covered (session + WebP `dataUrl` prefix) |
| RESTRICT-SW-04 | Node 20 bookworm-slim standalone | — | NOT COVERED — image build |
| RESTRICT-SW-05 | No database / ORM | FT-P-04, FT-P-01, environment.md (no test-db) | Covered |
| RESTRICT-SW-06 | No test runner in app package | — | NOT COVERED — repo fact; this spec is the runner |
| RESTRICT-SW-07 | `jimp` listed but unused | — | NOT COVERED — source inventory, not black-box |
| RESTRICT-ENV-01 | Local `next dev` port 3000 | SM-01 (default `BASE_URL`); Docker suite uses published `13001` | Covered |
| RESTRICT-ENV-02 | Production hostname `dianych.com` | SM-01 (when BASE_URL is prod) | Covered for smoke target only |
| RESTRICT-ENV-03 | Registry `docker.azaion.com/dianych` | — | NOT COVERED — publish path |
| RESTRICT-ENV-04 | `SECRET_COOKIE_PASSWORD` required | — | NOT COVERED — startup config; environment.md precondition |
| RESTRICT-ENV-05 | `pw.txt` in process cwd | NFT-RES-03 | Covered |
| RESTRICT-ENV-06 | No staging environment | — | NOT COVERED — process fact |
| RESTRICT-OPS-01 | No CI in repo | — | NOT COVERED — process fact |
| RESTRICT-OPS-02 | Manual Windows build+push | — | NOT COVERED — operator workflow |
| RESTRICT-OPS-03 | Container `--read-only` except images + `/tmp` | — | NOT COVERED — needs host docker inspect |
| RESTRICT-OPS-04 | New session secret on every recreate | NFT-RES-04 | Covered |
| RESTRICT-OPS-05 | Logs = container stdout only | — | NOT COVERED — no log API |
| RESTRICT-OPS-06 | nginx `/images/` alias ≠ volume path | SM-05 | Covered (byte identity; fail if trees differ) |
| RESTRICT-OPS-07 | Server Actions 20mb; nginx client 300M | NFT-RES-LIM-02 | Covered (20 MB local; nginx 300M not in `next dev`) |

## Coverage Summary

| Category | Total Items | Covered | Not Covered | Coverage % |
|----------|-----------|---------|-------------|-----------|
| Acceptance Criteria | 31 | 31 | 0 | 100% |
| Restrictions | 25 | 11 | 14 | 44% |
| **Total** | **56** | **42** | **14** | **75%** |

AC coverage is the Phase 2 / Phase 3 gate (canonical 75%). Restrictions include many stack/ops facts that are not runtime-observable.

## Uncovered Items Analysis

| Item | Reason Not Covered | Risk | Mitigation |
|------|-------------------|------|-----------|
| RESTRICT-HW-01, HW-02 | Host topology / publish ports | Wrong bind in prod | `restart.sh` / infra_topology; container mode in environment.md |
| RESTRICT-SW-01, SW-02, SW-04, SW-06, SW-07 | Compile-time or unused dep | Drift vs package.json | architecture baseline already flagged unused `jimp` |
| RESTRICT-ENV-03, ENV-04, ENV-06 | Registry / SECRET / staging absence | Mis-set secret or wrong host | environment.md required env; SECRET ≥ 32 chars |
| RESTRICT-OPS-01, OPS-02, OPS-03, OPS-05 | No CI, Windows build, read-only flag, logs | Deploy process mistakes | ops scripts; not black-box HTTP |

## Phase 2 notes (feed-forward)

- Golden WebP bytes remain out of scope; FT-P-09 asserts `width` and `data:image/webp` prefix only.
- `TEST_ADMIN_PASSWORD` must stay env-only. Do not copy into expected-results or commits.
- FT-P-11, NFT-RES-04, SM-05, NFT-RES-LIM-02 need isolated SUT or explicit SKIP — Phase 3 should not drop the AC row if a SKIP rule is documented, but must drop the scenario if input cannot be supplied at all.
- Runtime prices path drift (nested `dianych-website/data`) is exercised by FT-P-06 on the same process; no second consumer path.
