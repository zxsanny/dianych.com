# Ops

## 1. High-Level Overview

**Purpose**: Container image, registry publish, nginx TLS, host run/update of the Next standalone server.

**Architectural Pattern**: Multi-stage Docker + host shell (no compose, no CI).

**Upstream dependencies**: none (wraps the app).

**Downstream consumers**: Production host `dianych.com`.

## 2. Internal Interfaces

Operator CLI only (`build.cmd`, `install.sh`, `restart.sh`, `update.sh`).

## 3. External API Specification

Not an app API. Public site is `https://dianych.com` (nginx → `localhost:3001`).

## 4. Data Access Patterns

### Queries

Host bind mount `/var/www/dianych/images` → `/app/public/images`.

### Caching Strategy

nginx `/images/` alias in `install.sh` (path `/root/dianych/images/`) does not match the docker volume path.

### Storage Estimates

Image volume grows with uploads.

### Data Management

**Seed data**: copy gallery files onto the volume. **Rollback**: previous image tag (scripts always use `:latest`).

## 5. Implementation Details

**State Management**: container recreate; new `SECRET_COOKIE_PASSWORD` each run.

**Key Dependencies**: Docker, nginx, certbot, registry `docker.azaion.com`.

**Error Handling Strategy**: `chown`/`chmod` `|| true` in restart.

## 6. Extensions and Helpers

None.

## 7. Caveats & Edge Cases

**Known limitations**:
- No CI; Windows-only image build script
- Session secret rotation on every restart/update
- nginx images alias vs volume path mismatch
- Read-only container requires tmpfs for `/tmp` (sharp/cache)

**Potential race conditions**: two operators running update simultaneously.

**Performance bottlenecks**: full image rebuild locally; no layer cache documented.

## 8. Dependency Graph

**Must be implemented after**: none (hosts the built app).

**Can be implemented in parallel with**: Shared Runtime.

**Blocks**: production traffic.

## 9. Logging Strategy

| Log Level | When | Example |
|-----------|------|---------|
| INFO | script echo | `Done!` |

**Log format**: shell. **Log storage**: operator terminal / docker logs.
