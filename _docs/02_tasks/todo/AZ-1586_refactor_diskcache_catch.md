# diskCache empty catch

**Task**: AZ-1586_refactor_diskcache_catch
**Name**: diskCache catch
**Description**: Make diskCache.ts empty catch explicit without changing best-effort behavior
**Complexity**: 1 points
**Dependencies**: None
**Component**: shared-runtime
**Tracker**: AZ-1586
**Epic**: AZ-1580

## Problem

`lib/diskCache.ts` uses empty `catch {}` (S25).

## Outcome

- Best-effort cache trim still never crashes the request
- Catch is explicit (one-line reason or rethrow unexpected)
- No new verbose logs

## Scope

### Included
- `lib/diskCache.ts` only

### Excluded
- Other empty catches in cache.ts / UI

## Acceptance Criteria

**AC-1: Explicit catch**
Given diskCache.ts
When reading catch sites
Then none are empty blocks without a reason

**AC-2: Soak still passes**
Given the SUT
When NFT-RES-LIM-03 or a shorter cache-using case (FT-P-08) runs
Then PASS

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-2 | FT-P-08 | PASS |

## Constraints

- C06. Other S25 sites stay deferred.
