# Resilience and ops session

**Task**: AZ-1578_resilience_ops
**Name**: Resilience and ops session
**Description**: Cover missing pw.txt, container recreate session drop, rate-limit map reset
**Complexity**: 3 points
**Dependencies**: AZ-1570_test_infrastructure, AZ-1572_auth_blackbox
**Component**: Blackbox Tests
**Tracker**: AZ-1578
**Epic**: AZ-1569

## Problem

Ops faults (missing password file, new container secret, process restart) must not leave manage open on an old cookie or take down `/`.

## Outcome

- Scenarios PASS: NFT-RES-03, NFT-RES-04, NFT-RES-05

## Scope

### Included
- Isolated compose recreate with a new `SECRET_COOKIE_PASSWORD`
- Optional second SUT without `pw.txt`
- Process restart after FT-N-03

### Excluded
- Host nginx IR-08 beyond SM-05 (owned by image task)

## Acceptance Criteria

**AC-1: Missing pw.txt**
Given a SUT started without `pw.txt`
When login is POSTed
Then 500 `An internal server error occurred.` and GET `/` is still 200 (NFT-RES-03)

**AC-2: Recreate**
Given a cookie from instance A
When the container is recreated with a new session secret
Then old cookie GET `/manage` redirects `/login` and current isolated password still logs in (NFT-RES-04)

**AC-3: Limit map**
Given FT-N-03 already 429 on an IP
When the SUT process restarts
Then the next wrong-password POST from that IP is 401 (NFT-RES-05)

## System Under Test Boundary

Real container/process. Compare to AC-IR-05 and login catch message. SKIP only if the operator did not select container mode — do not fake a pass.

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-1 | NFT-RES-03 | 500 + storefront up |
| AC-2 | NFT-RES-04 | old session dead |
| AC-3 | NFT-RES-05 | 401 after restart |
