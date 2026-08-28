# Single gallery-id catalog

**Task**: AZ-1582_refactor_gallery_ids
**Name**: Gallery id catalog
**Description**: One GALLERY_IDS export used by upload, image, invalidate, manage keys
**Complexity**: 2 points
**Dependencies**: None
**Component**: shared-runtime
**Tracker**: AZ-1582
**Epic**: AZ-1580

## Problem

Five gallery ids are copied in four files (S16/S21).

## Outcome

- One exported catalog in shared-runtime
- Set remains `{brooches, clothes, panel, felting, kits}`
- Manage `prices` tab is not in the catalog

## Scope

### Included
- Export + wire actions.ts, image/route.ts, invalidate/route.ts, ManagePageClient keys

### Excluded
- Adding/removing galleries
- REST upload API

## Acceptance Criteria

**AC-1: One SoT**
Given the catalog
When a sixth id is not added
Then the four consumers import the same array/set

**AC-2: Allow-list unchanged**
Given upload/image/invalidate
When folder is not one of the five
Then the same error/reject as today

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-2 | FT-P-01, FT-N-08, FT-N-12 | PASS |

## Constraints

- C04. AC-F1-02 set must not change.
