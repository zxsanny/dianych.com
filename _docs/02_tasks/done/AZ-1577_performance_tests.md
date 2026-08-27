# Performance tests

**Task**: AZ-1577_performance_tests
**Name**: Performance tests
**Description**: Cover storefront, pack, image, and prices latency thresholds
**Complexity**: 3 points
**Dependencies**: AZ-1570_test_infrastructure
**Component**: Blackbox Tests
**Tracker**: AZ-1577
**Epic**: AZ-1569

## Problem

Regressions in first HTML and cached pack/image/prices should fail a dedicated performance run.

## Outcome

- Scenarios PASS: NFT-PERF-01, NFT-PERF-02, NFT-PERF-03, NFT-PERF-04 via `scripts/run-performance-tests.sh`

## Scope

### Included
- Thresholds from `performance-tests.md` (test-spec gates, not product SLOs)
- Warm-up then p95

### Excluded
- Functional asserts already owned by other tasks

## Acceptance Criteria

**AC-1: Storefront**
Given one warm-up GET `/`
When 10 sequential GETs
Then each 200 and p95 ≤ 3000 ms (NFT-PERF-01)

**AC-2: Pack / image**
Given fixture `seed.jpg`
When cold then 20 warm GETs
Then cold ≤ 15000 ms and warm p95 ≤ 800 ms (NFT-PERF-02, NFT-PERF-03)

**AC-3: Prices**
Given warm-up GET prices
When 30 GETs
Then p95 ≤ 300 ms (NFT-PERF-04)

## System Under Test Boundary

Real SUT HTTP. Thresholds in `performance-tests.md`. No product stubs.

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-1 | NFT-PERF-01 | p95 ≤ 3000 ms |
| AC-2 | NFT-PERF-02, NFT-PERF-03 | cold / warm bounds |
| AC-3 | NFT-PERF-04 | p95 ≤ 300 ms |
