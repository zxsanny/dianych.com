# Auth

## 1. High-Level Overview

**Purpose**: Single shared-password login, cookie session, `/manage` page gate, logout, and hash-file CLI.

**Architectural Pattern**: Cookie session gate (iron-session).

**Upstream dependencies**: Shared Runtime (`sessionOptions`, `expandIfShort`).

**Downstream consumers**: Content Admin (page + APIs), Image Pipeline invalidate.

## 2. Internal Interfaces

Uses Shared Runtime session helpers. Login compares bcrypt against `pw.txt`.

## 3. External API Specification

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/login` | POST | Public | 5 / 15 min / IP (in-memory) | Form `password`; redirect `/manage` |
| `/api/logout` | POST | Public | None | Destroy cookie |
| `/login` | GET | Public | — | Login page |
| `/manage` | GET | Cookie | — | Middleware redirect to `/login` if unset |

## 4. Data Access Patterns

### Queries

| Query | Frequency | Hot Path | Index Needed |
|-------|-----------|----------|--------------|
| Read `pw.txt` | Per login | Low | No |

### Caching Strategy

| Data | Cache Type | TTL | Invalidation |
|------|-----------|-----|-------------|
| Failed login counts | Process Map | 15 min | process restart |

### Storage Estimates

| Table/Collection | Est. Row Count (1yr) | Row Size | Total Size | Growth Rate |
|-----------------|---------------------|----------|------------|-------------|
| pw.txt | 1 | ~60 B | 60 B | on password change |

### Data Management

**Seed data**: run `npm run hash-pw` to create `pw.txt`. **Rollback**: restore previous hash file.

## 5. Implementation Details

**State Management**: cookie + per-process rate-limit map.

**Key Dependencies**:

| Library | Version | Purpose |
|---------|---------|---------|
| iron-session | ^8.0.4 | Cookie |
| bcryptjs | ^3.0.2 | Hash compare |

**Error Handling Strategy**: 400/401/429/500 JSON; login page does not surface API errors.

## 6. Extensions and Helpers

`expandIfShort` imported from Shared Runtime (`lib/expandIfShort.js`).

## 7. Caveats & Edge Cases

**Known limitations**:
- One password, no users/roles
- Rate limit not shared across replicas
- Ops scripts rotate `SECRET_COOKIE_PASSWORD` every container start
- Trusts `x-forwarded-*` for redirect host

**Potential race conditions**: none material.

**Performance bottlenecks**: bcrypt on each attempt (intentional).

## 8. Dependency Graph

**Must be implemented after**: Shared Runtime.

**Can be implemented in parallel with**: Image Pipeline, Ops.

**Blocks**: Content Admin UI and protected APIs.

## 9. Logging Strategy

| Log Level | When | Example |
|-----------|------|---------|
| ERROR | pw.txt missing / bcrypt fail | `Login error:` |

**Log format**: plaintext. **Log storage**: stdout.
