# Unauthenticated mutations

**Task**: AZ-1576_security_mutations_blackbox
**Name**: Unauthenticated mutations
**Description**: Cover unauth upload/delete/invalidate/price write leaving files and prices unchanged
**Complexity**: 2 points
**Dependencies**: AZ-1570_test_infrastructure, AZ-1572_auth_blackbox
**Component**: Blackbox Tests
**Tracker**: AZ-1576
**Epic**: AZ-1569

## Problem

Mutations without a session must not change prices, files, or pack cache.

## Outcome

- Scenarios PASS: FT-N-07, NFT-SEC-01, NFT-SEC-05

## Scope

### Included
- POST prices, POST invalidate, manage upload/delete without cookie
- Baseline GET prices and pack names

### Excluded
- Happy-path authenticated upload (separate task)

## Acceptance Criteria

**AC-1: Unauth writes**
Given recorded baselines
When prices POST, invalidate POST, and upload/delete forms run without a cookie
Then 401 / `Unauthorized` objects and baselines unchanged (FT-N-07, NFT-SEC-01, NFT-SEC-05)

## System Under Test Boundary

Real mutation HTTP/forms. Compare to `results_report.md` Prices #2, Upload #1, Image #6. No product stubs.

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-1 | FT-N-07, NFT-SEC-01, NFT-SEC-05 | reject + no mutate |
