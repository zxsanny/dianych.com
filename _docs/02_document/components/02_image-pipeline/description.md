# Image Pipeline

## 1. High-Level Overview

**Purpose**: Resize gallery rasters to WebP and serve them as JSON data-URLs (single image or whole-folder pack) with memory + tmp-disk caches.

**Architectural Pattern**: Pipeline + cache-aside.

**Upstream dependencies**: Shared Runtime (`diskCache`).

**Downstream consumers**: Storefront (carousel/modal), Content Admin (invalidate after write).

## 2. Internal Interfaces

### Interface: Pack generator

| Method | Input | Output | Async | Error Types |
|--------|-------|--------|-------|-------------|
| `regenerateGalleryPack` | galleryId, width, version | `GalleryPackPayload` | Yes | per-file skip + log |
| `invalidateCache` | galleryId, width, version | void | Yes | swallowed |

**Output DTOs**:
```
GalleryPackPayload:
  galleryId: string
  width: number
  version: number
  images: { name: string, dataUrl: string }[]
```

## 3. External API Specification

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/gallery-pack` | GET | Public | None | Pack of thumbs; `galleryId` allow-list; `size` breakpoint |
| `/api/gallery-pack/invalidate` | POST | Session | None | Drop+rebuild width=500 v1 only |
| `/api/image` | GET | Public | None | One resized image; allow-listed gallery + safe filename |

**Example** `GET /api/gallery-pack?galleryId=brooches&size=400`:
```json
{ "galleryId": "brooches", "width": 384, "version": 1, "images": [{ "name": "1.jpg", "dataUrl": "data:image/webp;base64,..." }] }
```

## 4. Data Access Patterns

### Queries

| Query | Frequency | Hot Path | Index Needed |
|-------|-----------|----------|--------------|
| Read originals under `public/images/<id>` | Cache miss | Yes | No |
| Read/write `os.tmpdir()` JSON | Every request path | Yes | No |

### Caching Strategy

| Data | Cache Type | TTL | Invalidation |
|------|-----------|-----|-------------|
| Pack / single image | Process Map + tmp JSON | HTTP 300s; memory until process exit | `invalidateCache` / upload-delete; disk LRU 500MB |
| Browser | localStorage | Until filename set drifts | Client compare |

### Storage Estimates

| Table/Collection | Est. Row Count (1yr) | Row Size | Total Size | Growth Rate |
|-----------------|---------------------|----------|------------|-------------|
| tmp pack JSON | #galleries × #widths | large (base64) | cap 500MB/dir | per upload |

### Data Management

**Seed data**: files already on volume. **Rollback**: delete tmp caches; originals remain.

## 5. Implementation Details

**Algorithmic Complexity**: O(n) images × resize per miss.

**State Management**: in-process Maps (lost on restart).

**Key Dependencies**:

| Library | Version | Purpose |
|---------|---------|---------|
| sharp | ^0.33.5 | resize/webp |
| jimp | ^0.22.12 | unused fallback (sharp always present) |

**Error Handling Strategy**: skip bad files; 400 invalid ids; 500 generate failure; empty catches on disk write.

## 6. Extensions and Helpers

None extracted. `ALLOWED_GALLERIES` copied in three route files.

## 7. Caveats & Edge Cases

**Known limitations**:
- Invalidate POST only clears 500/v1; carousel requests size 400
- Data-URLs inflate payload vs binary image routes
- Missing gallery → empty pack, not 404

**Potential race conditions**: two regenerations of the same key; last write wins.

**Performance bottlenecks**: first pack after upload is CPU-heavy; localStorage quota for large data-URLs.

## 8. Dependency Graph

**Must be implemented after**: Shared Runtime.

**Can be implemented in parallel with**: Auth, Ops.

**Blocks**: Storefront thumbs/modal; Admin invalidate.

## 9. Logging Strategy

| Log Level | When | Example |
|-----------|------|---------|
| ERROR | per-file process fail | `Error processing image 'x'` |

**Log format**: plaintext. **Log storage**: stdout.
