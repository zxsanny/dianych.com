# Security verify after gallery catalog

**Task**: AZ-1583_refactor_sec_verify
**Name**: Security verify catalog
**Description**: Confirm C04 did not widen allow-lists or /manage matcher
**Complexity**: 1 points
**Dependencies**: AZ-1582_refactor_gallery_ids
**Component**: auth / content-admin / image-pipeline
**Tracker**: AZ-1583
**Epic**: AZ-1580

## Problem

Moving gallery ids is a path-safety seam (Track C).

## Outcome

- Allow-list still exactly five ids
- middleware still `/manage` only
- FT-N-12, NFT-SEC-01, NFT-SEC-02, NFT-SEC-04 PASS

## Scope

### Included
- Read-back of allow-lists and middleware matcher
- Re-run those four cases (or full suite)

### Excluded
- New APIs or auth redesign

## Acceptance Criteria

**AC-1: No widening**
Given AZ-1582 is done
When inspecting allow-lists
Then they equal the five ids only

**AC-2: Security cases**
Given the SUT
When FT-N-12 and NFT-SEC-01/02/04 run
Then PASS

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-2 | FT-N-12, NFT-SEC-01, NFT-SEC-02, NFT-SEC-04 | PASS |

## Constraints

- C07. No product API change.
