# Content Admin

## 1. High-Level Overview

**Purpose**: Authenticated mutations for gallery files and frame prices; UA management UI.

**Architectural Pattern**: Server Actions + REST for prices; Next form actions.

**Upstream dependencies**: Shared Runtime, Auth, Image Pipeline (`invalidateCache`).

**Downstream consumers**: Storefront (reads resulting files/JSON).

## 2. Internal Interfaces

### Interface: Server Actions

| Method | Input | Output | Async | Error Types |
|--------|-------|--------|-------|-------------|
| `uploadImages` | FormData folder+files | `FormState` | Yes | auth/type/path |
| `deleteImage` | FormData imagePath | `FormState` | Yes | auth/path |
| `getGalleryImages` | folder | `string[]` | Yes | empty if bad folder |

**Input DTOs**:
```
FormState:
  message: string
  status: success | error | idle
```

## 3. External API Specification

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/prices` | GET | Public | None | Four frame prices |
| `/api/prices` | POST | Session | None | Replace prices JSON |
| `/manage` | GET | Cookie (middleware) | — | CMS UI |

Prices file path: `cwd/dianych-website/data/framePrices.json` (nested when cwd is the Next app).

## 4. Data Access Patterns

### Queries

| Query | Frequency | Hot Path | Index Needed |
|-------|-----------|----------|--------------|
| Write `public/images/<folder>/<file>` | Per upload | No | No |
| Read/write framePrices.json | Per GET/POST | No | No |

### Caching Strategy

| Data | Cache Type | TTL | Invalidation |
|------|-----------|-----|-------------|
| Next paths `/`, `/manage` | Next cache | — | `revalidatePath` |
| Gallery packs | Image Pipeline | — | `invalidateCache(..., 500, 1)` |

### Storage Estimates

| Table/Collection | Est. Row Count (1yr) | Row Size | Total Size | Growth Rate |
|-----------------|---------------------|----------|------------|-------------|
| gallery images | hundreds | 0.1–5 MB | volume-bound | per upload |
| framePrices.json | 1 | <1 KB | 1 KB | rare |

### Data Management

**Seed data**: `data/framePrices.json` defaults; gallery dirs. **Rollback**: restore files on volume + JSON.

## 5. Implementation Details

**State Management**: filesystem is source of truth.

**Key Dependencies**: Next server actions (`bodySizeLimit` 20mb).

**Error Handling Strategy**: `FormState` / HTTP 400/401/500. Cache invalidate failures swallowed.

## 6. Extensions and Helpers

`GALLERY_IDS` / `isGalleryId` and `DEFAULT_FRAME_PRICES` from Shared Runtime.

## 7. Caveats & Edge Cases

**Known limitations**:
- Frames gallery is not admin-uploadable (static assets)
- Prices path creates a nested `dianych-website/dianych-website/data/` at runtime
- `getGalleryImages` has no auth (folder allow-list only)

**Potential race conditions**: two uploads same filename — last write wins.

**Performance bottlenecks**: large multipart uploads; 20mb vs nginx 300M.

## 8. Dependency Graph

**Must be implemented after**: Shared Runtime, Auth, Image Pipeline.

**Can be implemented in parallel with**: Storefront (after shared).

**Blocks**: none (leaf).

## 9. Logging Strategy

| Log Level | When | Example |
|-----------|------|---------|
| ERROR | prices read/write fail | `Failed to read prices` |

**Log format**: plaintext. **Log storage**: stdout.
