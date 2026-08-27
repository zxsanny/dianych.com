# Prices blackbox

**Task**: AZ-1574_prices_blackbox
**Name**: Prices blackbox
**Description**: Cover default prices, authenticated write/read-after-write, and invalid/unauth POST
**Complexity**: 3 points
**Dependencies**: AZ-1570_test_infrastructure, AZ-1572_auth_blackbox
**Component**: Blackbox Tests
**Tracker**: AZ-1574
**Epic**: AZ-1569

## Problem

Frame prices must default when the file is missing and only change after an authenticated valid POST.

## Outcome

- Scenarios PASS: FT-P-04, FT-P-05, FT-P-06, FT-N-05, FT-N-06, NFT-RES-02, SM-02

## Scope

### Included
- Public GET and authenticated POST of the four price fields
- Restore previous values after writes

### Excluded
- Uploads, gallery packs

## Acceptance Criteria

**AC-1: Defaults**
Given no prices file on the isolated SUT
When GET prices
Then body equals `default_frame_prices.json` (FT-P-04, NFT-RES-02)

**AC-2: Write + read**
Given a valid session
When POST four finite ≥ 0 numbers then GET
Then 200 echo and GET matches (FT-P-05, FT-P-06)

**AC-3: Rejects**
Given no session or a negative number while logged in
When POST
Then 401 `Unauthorized` or 400 `All prices must be non-negative numbers.` and GET unchanged on unauth (FT-N-05, FT-N-06)

**AC-4: Smoke keys**
Given the SUT is up
When GET prices
Then four numeric keys exist (SM-02)

## System Under Test Boundary

Real prices HTTP. Compare to `results_report.md` Prices #1–4 and `default_frame_prices.json`. No product stubs.

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-1 | FT-P-04, NFT-RES-02 | defaults 450/500/600/700 |
| AC-2 | FT-P-05, FT-P-06 | echo + persist |
| AC-3 | FT-N-05, FT-N-06 | 401 / 400 |
| AC-4 | SM-02 | four numbers |
