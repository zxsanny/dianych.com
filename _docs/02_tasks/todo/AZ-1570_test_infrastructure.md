# Test Infrastructure

**Task**: AZ-1570_test_infrastructure
**Name**: Test Infrastructure
**Description**: Scaffold the blackbox test project — runner, isolated Docker SUT, fixtures, reporting
**Complexity**: 3 points
**Dependencies**: None
**Component**: Blackbox Tests
**Tracker**: AZ-1570
**Epic**: AZ-1569

## Problem

The shop has no test runner or CI. Specs in `_docs/02_document/tests/` need a self-contained environment so later blackbox tasks can run against a real Next process without touching production galleries or the live admin password.

## Outcome

- `docker compose -f docker-compose.test.yml up` starts an isolated SUT on host port 3001
- `scripts/run-tests.sh` installs app deps if needed, waits for `GET /` 200, writes `test-results/report.csv`
- Fixture galleries + isolated `pw.txt` + writable prices dir are created per run and removed on exit
- No Instagram/social mocks (outbound links only; consumer does not follow them)

## Scope

### Included

- Test project folder layout under `e2e/` (fixtures + HTTP cases) aligned with existing `docker-compose.test.yml` and `scripts/run-tests.sh`
- Isolated SUT env: `SECRET_COOKIE_PASSWORD`, mounted `pw.txt`, `public/images`, prices path `cwd/dianych-website/data`
- CSV reporting columns from `environment.md`
- Data isolation (rate-limit IP, `bbtest-` uploads, restore prices)

### Excluded

- Individual scenario implementations (later tasks)
- Production `https://dianych.com` writes
- Vendor mock servers
- App unit tests (none in `package.json`)

## Test Project Folder Layout

```
e2e/
├── fixtures/
│   └── seed.jpg          # minimal valid JPEG
├── tests/                # HTTP cases invoked by the runner (or sourced by scripts/run-tests.sh)
└── README.md             # how to run; points at compose + scripts
docker-compose.test.yml   # repo root (already outlined)
scripts/run-tests.sh
scripts/run-performance-tests.sh
test-results/             # gitignored CSV
```

### Layout Rationale

Compose and runners already live at repo root (test-spec Phase 4). `e2e/` holds fixtures and case files so implement tasks do not grow the SUT tree. No mock service images.

## Mock Services

| Mock Service | Replaces | Endpoints | Behavior |
|-------------|----------|-----------|----------|
| — | Instagram / Telegram / TikTok / YouTube / Facebook / Etsy | not called | Order CTAs are `<a href>` only |

No `POST /mock/config` services.

## Docker Test Environment

### docker-compose.test.yml Structure

| Service | Image / Build | Purpose | Depends On |
|---------|--------------|---------|------------|
| system-under-test | `dianych-website/Dockerfile` | Production-like Next standalone | — |
| e2e-consumer | host `scripts/run-tests.sh` | Black-box HTTP | SUT on `:3001` |

### Networks and Volumes

Default compose network. Host binds:

| Mount | Host path | Container path | Mode |
|-------|-----------|----------------|------|
| Password hash | generated `pw.txt` | `/app/pw.txt` | `ro` |
| Galleries | fixture `images/` | `/app/public/images` | rw |
| Prices | empty `prices/` | `/app/dianych-website/data` | rw |
| Tmp | tmpfs 512m | `/tmp` | rw |

**Dev-fast source overlay:** not required on this local Docker path. Rebuild the SUT image when `dianych-website/Dockerfile` or lockfile changes.

## Test Runner Configuration

**Framework**: POSIX `bash` + `curl` + `python3` (no Jest/pytest in the app)
**Plugins**: none
**Entry point**: `scripts/run-tests.sh` (`--unit-only` records unit SKIP)

### Fixture Strategy

| Fixture | Scope | Purpose |
|---------|-------|---------|
| isolated password | session | bcrypt of a run-local password; never the live admin secret |
| seed.jpg | session | one file in `brooches` for image/pack tests |
| empty `kits` | session | empty-gallery 200 |
| prices dir | session | missing file → defaults; POST writes here |

## Test Data Fixtures

| Data Set | Source | Format | Used By |
|----------|--------|--------|---------|
| DS-GALLERY-IDS | inline | five ids | storefront |
| DS-DEFAULT-PRICES | `expected_results/default_frame_prices.json` | JSON | prices |
| DS-VALID-JPEG | `e2e/fixtures/seed.jpg` | JPEG | image pipeline |
| DS-WRONG-PASSWORD | inline | string | auth |
| Isolated admin password | generated in runner | env in-process only | login / prices POST |

### Data Isolation

Fresh Compose project `dianych-bbtest` per run; `trap` downs compose and deletes the work dir. Rate-limit tests use `X-Forwarded-For: 203.0.113.10`. Upload tests (later) use `bbtest-` names.

## Test Reporting

**Format**: CSV
**Columns**: Test ID, Test Name, Execution Time (ms), Result (PASS/FAIL/SKIP), Error Message (if FAIL)
**Output path**: `test-results/report.csv` (gitignored)

## Acceptance Criteria

**AC-1: Test environment starts**
Given `docker-compose.test.yml` and generated fixtures
When `scripts/run-tests.sh` starts the stack
Then `GET http://127.0.0.1:3001/` returns 200 within 180s after build

**AC-2: Mock services respond**
Given no vendor mocks are defined
When the consumer runs
Then it does not call Instagram or other social hosts

**AC-3: Test runner executes**
Given the SUT is up
When `scripts/run-tests.sh` continues
Then it records at least the smoke IDs SM-01–04 in the CSV (PASS or FAIL, not missing rows)

**AC-4: Test report generated**
Given the run finishes
When the process exits
Then `test-results/report.csv` exists with the documented columns

## Non-Functional Requirements

- Isolated SUT only; never write live `dianych.com` galleries
- Do not commit passwords, `pw.txt`, or session secrets

## System Under Test Boundary

Drive the real Next container through HTTP. Do not import `dianych-website` modules. Compare outputs to `_docs/00_problem/input_data/expected_results/results_report.md` and `default_frame_prices.json`.
