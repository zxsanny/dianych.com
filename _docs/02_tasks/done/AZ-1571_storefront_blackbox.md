# Storefront blackbox

**Task**: AZ-1571_storefront_blackbox
**Name**: Storefront blackbox
**Description**: Cover public `/` gallery ids, empty-folder 200, default UA copy, and storefront/login smoke
**Complexity**: 3 points
**Dependencies**: AZ-1570_test_infrastructure
**Component**: Blackbox Tests
**Tracker**: AZ-1571
**Epic**: AZ-1569

## Problem

Visitors must see a working landing page even when a gallery folder is empty.

## Outcome

- Scenarios PASS: FT-P-01, FT-P-02, FT-P-03 (default UA slots; EN toggle if browser available), SM-01, SM-03, NFT-RES-01

## Scope

### Included
- `GET /` and `GET /login` against the isolated SUT
- HTML id set `{brooches, clothes, panel, felting, kits}`
- Empty `kits` still 200

### Excluded
- Auth, prices, uploads, image APIs

## Acceptance Criteria

**AC-1: Five gallery ids**
Given the isolated SUT is up
When the consumer GETs `/`
Then status is 200 and the HTML contains those five section ids (FT-P-01)

**AC-2: Empty gallery**
Given `kits` is empty
When the consumer GETs `/`
Then status is 200 not 500 (FT-P-02, NFT-RES-01)

**AC-3: Default UA copy**
Given the default locale
When the consumer GETs `/`
Then the UA strings in `test-data.md` DS-LOCALE-PAIRS are present (FT-P-03)

**AC-4: Smoke**
Given the SUT is up
When the consumer GETs `/` and `/login`
Then both are 200 (SM-01, SM-03)

## System Under Test Boundary

Drive the real shop over HTTP. No product-module stubs. Compare to `results_report.md` Listing #1 and AC-F1-*. Do not call Instagram.

## Blackbox Tests

| AC Ref | Initial Data/Conditions | What to Test | Expected Behavior | NFR References |
|--------|------------------------|-------------|-------------------|----------------|
| AC-1 | Isolated SUT | FT-P-01 | five ids present | — |
| AC-2 | empty kits | FT-P-02, NFT-RES-01 | 200 | — |
| AC-3 | default locale | FT-P-03 | UA strings | — |
| AC-4 | SUT up | SM-01, SM-03 | 200 | — |

## Constraints

- Isolated SUT only (`environment.md`)
