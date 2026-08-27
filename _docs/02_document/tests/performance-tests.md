# Performance Tests

No product SLO exists in `acceptance_criteria.md`. Thresholds below are test-spec gates for regressions, not contractual latency.

### NFT-PERF-01: Storefront first HTML

**Summary**: Public `/` returns HTML within a fixed bound after one warm-up.
**Traces to**: AC-F1-01 (availability of the browse path)
**Metric**: time to first byte and time to complete response

**Preconditions**:
- SUT already running ≥ 30s
- One discarded `GET /` warm-up

**Steps**:

| Step | Consumer Action | Measurement |
|------|----------------|-------------|
| 1 | `GET {BASE_URL}/` × 10 sequential | TTFB and total time per request |

**Pass criteria**: each request status 200; p95 total time ≤ 3000 ms.
**Duration**: ~1 minute

### NFT-PERF-02: Gallery pack latency

**Summary**: Pack JSON for `brooches` stays under bound after cache fill.
**Traces to**: AC-IMG-04, AC-IMG-06
**Metric**: response time

**Preconditions**:
- `GET /api/gallery-pack?galleryId=brooches&size=400` once (cold, may generate WebP)
- Wait until that request completes

**Steps**:

| Step | Consumer Action | Measurement |
|------|----------------|-------------|
| 1 | Record cold duration | informational; fail only if > 15000 ms or non-200 |
| 2 | Repeat GET × 20 | p95 ≤ 800 ms; status 200; `Cache-Control` as FT-P-10 |

**Pass criteria**: cold ≤ 15000 ms; warm p95 ≤ 800 ms.
**Duration**: ~2 minutes

### NFT-PERF-03: Single-image latency

**Summary**: Lightbox-sized image JSON stays under bound after cache fill.
**Traces to**: AC-IMG-05, AC-IMG-06
**Metric**: response time

**Preconditions**:
- DS-KNOWN-IMAGE from pack; skip (not fail the suite) if `images` is empty

**Steps**:

| Step | Consumer Action | Measurement |
|------|----------------|-------------|
| 1 | Cold `GET /api/image?galleryId=brooches&name={n}&width=1200` | ≤ 15000 ms, 200 |
| 2 | Repeat × 20 | p95 ≤ 800 ms |

**Pass criteria**: same as NFT-PERF-02.
**Duration**: ~2 minutes

### NFT-PERF-04: Prices GET

**Summary**: Public prices read is cheap.
**Traces to**: AC-PRICE-01
**Metric**: response time

**Preconditions**: SUT up; prices file present or defaults

**Steps**:

| Step | Consumer Action | Measurement |
|------|----------------|-------------|
| 1 | Warm-up GET `/api/prices` | discard |
| 2 | GET × 30 | p95 ≤ 300 ms; 200; four numeric keys |

**Pass criteria**: p95 ≤ 300 ms.
**Duration**: ~30s
