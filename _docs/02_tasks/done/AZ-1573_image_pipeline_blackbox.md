# Image pipeline blackbox

**Task**: AZ-1573_image_pipeline_blackbox
**Name**: Image pipeline blackbox
**Description**: Cover pack/image defaults, Cache-Control, invalid params, static `/images/` readability
**Complexity**: 5 points
**Dependencies**: AZ-1570_test_infrastructure
**Component**: Blackbox Tests
**Tracker**: AZ-1573
**Epic**: AZ-1569

## Problem

Thumbs and lightbox must reject unsafe names and expose documented defaults without leaking other paths.

## Outcome

- Scenarios PASS: FT-P-08, FT-P-09, FT-P-10, FT-N-13, FT-N-14, FT-N-15, FT-N-16, NFT-SEC-02, SM-05

## Scope

### Included
- Pack and single-image GETs; static `/images/` read for SM-05
- Fixture `seed.jpg` in `brooches`

### Excluded
- Uploads, login

## Acceptance Criteria

**AC-1: Defaults**
Given `galleryId=brooches`
When pack is requested without `size` and image without `width`
Then JSON `width` is 500 and 1600 respectively; `dataUrl` starts with `data:image/webp` (FT-P-08, FT-P-09)

**AC-2: Cache-Control**
When pack (and image if present) is GET
Then `Cache-Control` is `public, max-age=300, s-maxage=300` (FT-P-10)

**AC-3: Invalid params**
When galleryId or name is missing/invalid/traversal
Then 400 with the documented error objects (FT-N-13–16, NFT-SEC-02)

**AC-4: Static bytes exist**
When GET `/images/brooches/seed.jpg`
Then 200 and non-empty body (SM-05 local identity)

## System Under Test Boundary

Real pack/image HTTP. Compare to `results_report.md` Image #1–4, #7. No golden WebP bytes. Do not read the SUT volume from the consumer.

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-1 | FT-P-08, FT-P-09 | width 500 / 1600 |
| AC-2 | FT-P-10 | Cache-Control exact |
| AC-3 | FT-N-13–16, NFT-SEC-02 | 400 |
| AC-4 | SM-05 | static 200 |
