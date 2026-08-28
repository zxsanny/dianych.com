# Shared default frame prices

**Task**: AZ-1585_refactor_default_prices
**Name**: Shared default prices
**Description**: One default-prices object for Frames, PricesManager, and prices route fallbacks
**Complexity**: 1 points
**Dependencies**: None
**Component**: content-admin / storefront
**Tracker**: AZ-1585
**Epic**: AZ-1580

## Problem

AC-PRICE-01 numbers are duplicated.

## Outcome

- One export matching `expected_results/default_frame_prices.json`
- Values remain 450/500/600/700

## Scope

### Included
- Shared constant; wire Frames.tsx, PricesManager.tsx, prices/route.ts fallbacks

### Excluded
- Changing the four numbers
- New price fields

## Acceptance Criteria

**AC-1: One SoT**
Given the export
When GET prices with missing file
Then body equals the shared object

**AC-2: Defaults still shown**
Given the SUT
When FT-P-04 runs
Then PASS

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-2 | FT-P-04 | PASS |

## Constraints

- C05. Exact AC-PRICE-01 values.
