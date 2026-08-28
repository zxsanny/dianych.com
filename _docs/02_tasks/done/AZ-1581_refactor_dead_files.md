# Delete dead FrameCard.tsx and fonts.ts

**Task**: AZ-1581_refactor_dead_files
**Name**: Delete dead files
**Description**: Remove empty FrameCard.tsx and unused app/fonts.ts
**Complexity**: 1 points
**Dependencies**: None
**Component**: storefront / shared-runtime
**Tracker**: AZ-1581
**Epic**: AZ-1580

## Problem

Dead files add noise. FrameCard.tsx is empty; fonts.ts is unused.

## Outcome

- `app/components/FrameCard.tsx` gone
- `app/fonts.ts` gone
- Inline FrameCard in Frames.tsx and layout.tsx woff2 unchanged

## Scope

### Included
- Delete the two files
- Confirm no remaining imports

### Excluded
- Extracting the inline FrameCard
- Changing font files under `app/fonts/`

## Acceptance Criteria

**AC-1: Files gone**
Given the repo
When searched
Then neither path exists and no import of `@/app/fonts` or `./FrameCard`

**AC-2: Storefront still builds**
Given the SUT
When FT-P-01 and SM-01 run
Then they PASS

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-2 | FT-P-01, SM-01 | PASS |

## Constraints

- C01 + C02 from `02-coupling-refactoring/list-of-changes.md`
