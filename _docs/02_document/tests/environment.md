# Test Environment

## Overview

**System under test**: Dianych Next.js shop (`dianych-website`). Public storefront, `/login`, `/manage`, and HTTP APIs on the same host.
**Consumer app purpose**: Standalone black-box runner that calls public HTTP routes and (for upload/delete) the manage forms. No imports from `dianych-website/`, no reads of the SUT process filesystem during a test.

**Default BASE_URL**: `http://localhost:3000` (local `next dev`). Production smoke uses `https://dianych.com` when that target is explicitly selected.

## Docker Environment

No suite compose exists in the repo (restriction: no CI, no staging). Tests run against one of two SUT modes.

### Services

| Service | Image / Build | Purpose | Ports |
|---------|--------------|---------|-------|
| system-under-test (local) | `dianych-website` via `npm run dev` | Fast functional suite | host `3000` |
| system-under-test (container) | `dianych-website/Dockerfile` (Node 20 standalone) | Session-secret / volume / read-only tests | host `13001` → container `3000` |
| e2e-consumer | host process (`scripts/run-tests.sh`) | Black-box HTTP + browser form posts | — |

No database, queue, or vendor mock services. Instagram/social links are outbound `<a href>` only and are not called.

### Networks

| Network | Services | Purpose |
|---------|----------|---------|
| host / default bridge | SUT + consumer | Consumer uses `BASE_URL` only |

### Volumes

| Volume | Mounted to | Purpose |
|--------|-----------|---------|
| fixture-images | container `/app/public/images` (prod-like) or `dianych-website/public/images` (local isolated copy) | Five gallery folders; one may be empty |
| (none for prices) | SUT cwd `dianych-website/data/framePrices.json` (runtime may also write nested `dianych-website/dianych-website/data/`) | Start missing or with known JSON |
| (none for pw) | SUT cwd `pw.txt` | bcrypt hash; never committed; test login uses env `TEST_ADMIN_PASSWORD` |

### docker-compose structure

```yaml
# Outline only — not runnable code
services:
  system-under-test:
    # local: next dev on :3000
    # container: Dockerfile, publish 13001:3000, SECRET_COOKIE_PASSWORD ≥32 chars,
    #            mount fixture-images → /app/public/images,
    #            mount prices dir → /app/dianych-website/data, tmpfs /tmp 512m
  e2e-consumer:
    # host runner; depends on SUT listening at BASE_URL
```

## Consumer Application

**Tech stack**: POSIX `sh` + `curl` for HTTP APIs; headed browser (Playwright or Cursor browser) only where the manage upload/delete form is the public interface.
**Entry point**: `scripts/run-tests.sh` (Phase 4). Performance: `scripts/run-performance-tests.sh`.

### Communication with system under test

| Interface | Protocol | Endpoint / Topic | Authentication |
|-----------|----------|-----------------|----------------|
| Storefront | HTTP GET | `{BASE_URL}/` | none |
| Login page | HTTP GET | `{BASE_URL}/login` | none |
| Login API | HTTP POST `application/x-www-form-urlencoded` or multipart | `{BASE_URL}/api/login` | password form field |
| Logout API | HTTP POST | `{BASE_URL}/api/logout` | session cookie optional |
| Manage page | HTTP GET | `{BASE_URL}/manage` | cookie `dianych-manage-session` |
| Prices | HTTP GET/POST JSON | `{BASE_URL}/api/prices` | POST requires session |
| Gallery pack | HTTP GET | `{BASE_URL}/api/gallery-pack` | none |
| Single image | HTTP GET | `{BASE_URL}/api/image` | none |
| Pack invalidate | HTTP POST | `{BASE_URL}/api/gallery-pack/invalidate` | session |
| Upload / delete | manage form POST (`folder`+`files`, or `imagePath`) | `{BASE_URL}/manage` | session |

### What the consumer does NOT have access to

- No SQL / no database
- No `import` from SUT source
- No assertion by listing the SUT host volume during a test (observe via `/`, `/api/gallery-pack`, `/api/image` instead)
- No reading `pw.txt` or writing secrets into `_docs/`

### Required environment (consumer)

| Variable | Required | Notes |
|----------|----------|-------|
| `BASE_URL` | no | default `http://localhost:3000` |
| `TEST_ADMIN_PASSWORD` | for authenticated write tests | never stored in repo or expected-results |
| `SUT_MODE` | no | `local` (default) or `container` |

SUT process still needs `SECRET_COOKIE_PASSWORD` (≥ 32 characters) and a `pw.txt` in its cwd.

## CI/CD Integration

**When to run**: locally before a release or after a host update. Repo has no CI pipeline.
**Pipeline stage**: none (manual / `scripts/run-tests.sh`).
**Gate behavior**: local fail blocks the operator; no merge gate in-repo.
**Timeout**: functional suite 10 minutes; performance suite 15 minutes.

## Reporting

**Format**: CSV
**Columns**: Test ID, Test Name, Execution Time (ms), Result (PASS/FAIL/SKIP), Error Message (if FAIL)
**Output path**: `./e2e-results/report.csv` (gitignored)

## Isolation rules

- Rate-limit tests (5 / 15 min / IP) need a dedicated SUT process or a unique `X-Forwarded-For` that no other test shares, then no further logins from that IP until the suite ends.
- Price write tests restore the four numbers they found (or delete the prices file so the next GET returns defaults).
- Upload tests use filename prefix `bbtest-` and delete those files via the manage delete form before exit.
- Do not run destructive manage tests against live `https://dianych.com` galleries.

## Test Execution

**Decision**: docker

**Hardware dependencies found**: none. Docs (`restrictions.md`, `solution.md`, `architecture.md`, `environment.md`) describe a single Node/Docker host, libvips/sharp on CPU, no GPU/ANE/TPU/sensors. Source scan found no CUDA, CoreML, OpenCL, TPU, camera, or `sys.platform` backend gates.

**Why not local-only**: Phase 4 default is Docker for non-hardware projects. The production image (`dianych-website/Dockerfile`) is the SUT. Host `next dev` remains a manual option (`BASE_URL=http://localhost:3000`) but `scripts/run-tests.sh` drives Compose.

### Docker mode (canonical)

1. Prerequisites: Docker Engine, Compose v2, Node 20 (to `npm ci` in `dianych-website` for bcrypt hash generation).
2. Command: `scripts/run-tests.sh` from the repo root. The script creates an isolated `pw.txt` + fixture galleries, builds `docker-compose.test.yml`, waits for `GET /` 200 on host port `13001`, runs HTTP blackbox cases, writes `test-results/report.csv`, then `compose down`.
3. Environment the script sets (not committed): `SECRET_COOKIE_PASSWORD` (≥ 32 chars), isolated admin password for that run, `TEST_PW_FILE`, `TEST_IMAGES_DIR`.
4. Optional: `TEST_ADMIN_PASSWORD` is unused when the isolated SUT is used. Do not point this suite at production.
5. `--unit-only`: no app unit runner exists; the script records unit as SKIP and exits 0 for that section.
6. Results: `test-results/report.csv`. Performance: `scripts/run-performance-tests.sh` (same Compose stack).

### Local mode (manual only)

1. `cd dianych-website && SECRET_COOKIE_PASSWORD='<≥32 chars>' npm run dev`
2. `BASE_URL=http://localhost:3000` plus a local `pw.txt` (gitignored).
3. Not started by the canonical runner.

### Both / CI

Repo has no CI. If CI is added later, run the Docker mode only.
