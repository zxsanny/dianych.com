# Auth blackbox

**Task**: AZ-1572_auth_blackbox
**Name**: Auth blackbox
**Description**: Cover login errors, rate limit, manage gate, success login, logout
**Complexity**: 5 points
**Dependencies**: AZ-1570_test_infrastructure
**Component**: Blackbox Tests
**Tracker**: AZ-1572
**Epic**: AZ-1569

## Problem

Manage must stay closed without a valid session; login must reject bad input and lock after five failures.

## Outcome

- Scenarios PASS: FT-N-01, FT-N-02, FT-N-03, FT-N-04, FT-P-07, FT-P-12, NFT-SEC-03, NFT-SEC-04, NFT-SEC-06, NFT-RES-LIM-01, SM-04

## Scope

### Included
- Login form POST, `/manage` redirect, logout POST
- Isolated SUT password from the infrastructure run (never the live admin secret)

### Excluded
- Price writes, uploads, pack APIs

## Acceptance Criteria

**AC-1: Missing / wrong password**
Given the SUT has `pw.txt`
When password is empty or wrong
Then 400 `Password is required` or 401 `Invalid password` (FT-N-01, FT-N-02)

**AC-2: Rate limit**
Given dedicated `X-Forwarded-For: 203.0.113.10`
When the sixth failed login in 15 minutes is sent
Then 429 and message contains `Too many login attempts` (FT-N-03, NFT-SEC-03, NFT-RES-LIM-01)

**AC-3: Manage gate**
Given no session
When GET `/manage`
Then redirect path `/login` (FT-N-04, NFT-SEC-04, SM-04)

**AC-4: Success + logout**
Given the isolated admin password
When login succeeds then logout
Then redirect `/manage` + cookie `dianych-manage-session`, then manage redirects `/login` (FT-P-07, FT-P-12)

**AC-5: Public pages do not grant manage**
Given only `/` and `/login` were visited
When GET `/manage`
Then redirect `/login` (NFT-SEC-06)

## System Under Test Boundary

Real login/logout/manage HTTP. No stubbing auth. Compare to `results_report.md` Auth #1–5. Password stays in the runner process only.

## Blackbox Tests

| AC Ref | Initial Data/Conditions | What to Test | Expected Behavior | NFR References |
|--------|------------------------|-------------|-------------------|----------------|
| AC-1 | pw.txt present | FT-N-01, FT-N-02 | 400 / 401 exact messages | — |
| AC-2 | unused IP | FT-N-03 | 5×401 then 429 | — |
| AC-3 | no cookie | FT-N-04, SM-04 | `/login` | — |
| AC-4 | isolated password | FT-P-07, FT-P-12 | session then cleared | — |
| AC-5 | public cookies only | NFT-SEC-06 | `/login` | — |

## Constraints

- Rate-limit IP must not be reused by other suite cases
