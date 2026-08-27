# Resilience Tests

### NFT-RES-01: Empty or missing gallery folder

**Summary**: Browse survives a missing gallery directory.
**Traces to**: AC-F1-01, AC-IR-07

**Preconditions**:
- Isolated fixture: `kits` directory absent or empty; other galleries optional

**Fault injection**:
- Missing/unreadable gallery folder on the image mount

**Steps**:

| Step | Action | Expected Behavior |
|------|--------|------------------|
| 1 | `GET /` | 200, not 500 |
| 2 | Inspect kits section | omitted or empty; other sections still render if they have files |

**Pass criteria**: status 200; no 5xx.

### NFT-RES-02: Missing prices file

**Summary**: Prices API falls back to defaults instead of failing the storefront.
**Traces to**: AC-PRICE-01

**Preconditions**:
- Prices file renamed/removed

**Fault injection**:
- Absent `framePrices.json` at the process runtime path

**Steps**:

| Step | Action | Expected Behavior |
|------|--------|------------------|
| 1 | `GET /api/prices` | 200, body equals `default_frame_prices.json` |
| 2 | `GET /` | 200 (frames section still usable) |

**Pass criteria**: exact default object; storefront 200.

### NFT-RES-03: Missing password file

**Summary**: Login does not crash the process when `pw.txt` is absent.
**Traces to**: AC-AUTH-02 (failure path), RESTRICT-ENV-05

**Preconditions**:
- Isolated SUT started without `pw.txt` (or file temporarily moved)
- `SECRET_COOKIE_PASSWORD` still set

**Fault injection**:
- Missing `pw.txt`

**Steps**:

| Step | Action | Expected Behavior |
|------|--------|------------------|
| 1 | `POST /api/login` with any non-empty password | 500, `{message:'An internal server error occurred.'}` |
| 2 | `GET /` | still 200 |

**Pass criteria**: login 500 with that message; storefront remains up.

### NFT-RES-04: Container recreate drops old sessions

**Summary**: After recreate, an old session cookie cannot open `/manage`; current password still logs in.
**Traces to**: AC-IR-05, RESTRICT-OPS-04

**Preconditions**:
- `SUT_MODE=container`
- `TEST_ADMIN_PASSWORD` set
- Cookie captured from a successful login on instance A

**Fault injection**:
- Stop and start a new container (new `SECRET_COOKIE_PASSWORD` per `restart.sh` / `update.sh`)

**Steps**:

| Step | Action | Expected Behavior |
|------|--------|------------------|
| 1 | `GET /manage` with the pre-recreate cookie | redirect to `/login` |
| 2 | `POST /api/login` with current `TEST_ADMIN_PASSWORD` | redirect `/manage` + new cookie |
| 3 | `GET /manage` with new cookie | 200 |

**Pass criteria**: old cookie rejected; new login works. Skip if container mode is not available (record SKIP, do not treat as suite fail unless the operator selected container).

### NFT-RES-05: Rate-limit map is in-process only

**Summary**: After process restart, a previously limited IP can attempt login again.
**Traces to**: AC-AUTH-03, security_approach (map lost on restart)

**Preconditions**:
- Complete FT-N-03 on IP `203.0.113.10` (6th → 429)
- Operator can restart the SUT process

**Fault injection**:
- Process restart (dev server or container)

**Steps**:

| Step | Action | Expected Behavior |
|------|--------|------------------|
| 1 | Restart SUT | listen on same `BASE_URL` within 60s |
| 2 | `POST /api/login` wrong password from `203.0.113.10` | 401 `Invalid password` (not 429) |

**Pass criteria**: first post-restart attempt is 401. Skip if restart is not permitted in the run.
