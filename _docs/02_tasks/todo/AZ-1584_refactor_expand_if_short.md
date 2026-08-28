# Share expandIfShort helper

**Task**: AZ-1584_refactor_expand_if_short
**Name**: Share expandIfShort
**Description**: One helper for login route and hash-pw.js
**Complexity**: 2 points
**Dependencies**: None
**Component**: auth
**Tracker**: AZ-1584
**Epic**: AZ-1580

## Problem

The short-password expansion is copied in two places. Drift would break login vs hash-pw.

## Outcome

- One implementation
- Formula unchanged: length ≥ 32 keep; else `{pass}.{pass}.{pass}`

## Scope

### Included
- Shared module both can call (TS consumed by login; hash-pw may use a `.js` export or compile step already used in repo)

### Excluded
- Changing the formula
- New auth features

## Acceptance Criteria

**AC-1: Single implementation**
Given the repo
When searching `expandIfShort`
Then the body exists in one module; callers import it

**AC-2: Login still works**
Given isolated SUT
When FT-N-01–03, FT-P-07 run
Then PASS

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-2 | FT-N-01, FT-N-02, FT-N-03, FT-P-07 | PASS |

## Constraints

- C03. Do not change expansion formula.
