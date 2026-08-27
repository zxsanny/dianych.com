# Thumb cache resource limit

**Task**: AZ-1579_resource_cache
**Name**: Thumb cache resource limit
**Description**: Cover sustained pack/image generation without process death
**Complexity**: 2 points
**Dependencies**: AZ-1570_test_infrastructure
**Component**: Blackbox Tests
**Tracker**: AZ-1579
**Epic**: AZ-1569

## Problem

Repeated width variants must not kill the SUT.

## Outcome

- Scenario PASS: NFT-RES-LIM-03

## Scope

### Included
- 5-minute GET sweep across documented clamp widths and pack sizes for `seed.jpg`
- Process still serving `GET /` and pack 200

### Excluded
- Measuring exact 500 MB eviction over HTTP

## Acceptance Criteria

**AC-1: Stays up**
Given fixture `seed.jpg`
When pack/image GETs run for 5 minutes across clamp widths
Then the SUT still returns 200 for `/` and a final pack GET (NFT-RES-LIM-03)

## System Under Test Boundary

Real image pipeline. No product stubs. Eviction size is not asserted.

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-1 | NFT-RES-LIM-03 | no crash; 200 |
