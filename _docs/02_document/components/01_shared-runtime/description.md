# Shared Runtime

## 1. High-Level Overview

**Purpose**: First-party primitives used by auth, image pipeline, admin, and storefront: session cookie, gallery directory listing, gallery-id catalog, password expand, default prices, disk cache cap, locale context + copy. Font files live under `app/fonts/*.woff2` (loaded in `layout.tsx`).

**Architectural Pattern**: Library / shared kernel (no HTTP of its own).

**Upstream dependencies**: None (first-party). Node + iron-session + React.

**Downstream consumers**: Auth, Image Pipeline, Content Admin, Storefront.

## 2. Internal Interfaces

### Interface: Session

| Method | Input | Output | Async | Error Types |
|--------|-------|--------|-------|-------------|
| `getSession` | cookies() | `IronSession<SessionData>` | Yes | iron-session password errors |
| `getSessionFromRequest` | `NextRequest` | same | Yes | same |

**Input DTOs**: none (env `SECRET_COOKIE_PASSWORD`).

**Output DTOs**:
```
SessionData:
  isLoggedIn: boolean (optional)
```

### Interface: Gallery listing

| Method | Input | Output | Async | Error Types |
|--------|-------|--------|-------|-------------|
| `getImagePaths` | `galleryId: string` | `string[]` | No | logs + `[]` |

### Interface: Disk cache

| Method | Input | Output | Async | Error Types |
|--------|-------|--------|-------|-------------|
| `enforceCacheLimit` | `cacheDir: string` | void | No | swallowed unlink/stat |

### Interface: Locale

| Method | Input | Output | Async | Error Types |
|--------|-------|--------|-------|-------------|
| `useLanguage` | — | `{ language, setLanguage }` | No | throws outside provider |
| `useTranslation` | — | string map | No | same |

## 3. External API Specification

Internal-only.

## 4. Data Access Patterns

### Queries

| Query | Frequency | Hot Path | Index Needed |
|-------|-----------|----------|--------------|
| `readdir` `public/images/<id>` | Per gallery SSR | Yes | No |
| tmp-dir walk in `enforceCacheLimit` | After cache writes | Medium | No |

### Caching Strategy

None in this component (callers cache).

### Storage Estimates

N/A (no owned DB).

### Data Management

**Seed data**: gallery folders under `public/images/`. **Rollback**: restore files on the image volume.

## 5. Implementation Details

**State Management**: Session in cookie; language in React state (not persisted); cache cap is stateless.

**Key Dependencies**:

| Library | Version | Purpose |
|---------|---------|---------|
| iron-session | ^8.0.4 | Encrypted cookie |
| react | 19.1.0 | Language context |

**Error Handling Strategy**: listing/cache failures log or no-op; `useLanguage` throws.

## 6. Extensions and Helpers

| Helper | Purpose | Used By |
|--------|---------|---------|
| `expandIfShort` | Pad short passwords before bcrypt | Auth + hash-pw |
| `GALLERY_IDS` / `isGalleryId` | Five uploadable folder ids | actions, image, pack, invalidate, manage |
| `DEFAULT_FRAME_PRICES` | AC-PRICE-01 defaults | Frames, PricesManager, prices route |
| parse `/images/<id>/<file>` (duplicated) | Gallery path split | Image Pipeline consumers + Admin |

## 7. Caveats & Edge Cases

**Known limitations**:
- `getImagePaths` does not sanitize `galleryId`
- Empty `SECRET_COOKIE_PASSWORD` is stored as `''`

**Potential race conditions**: concurrent `enforceCacheLimit` unlinks on shared tmp dir.

**Performance bottlenecks**: sync `readdir`/`stat` on every listing and cache trim.

## 8. Dependency Graph

**Must be implemented after**: none.

**Can be implemented in parallel with**: Ops.

**Blocks**: Auth, Image Pipeline, Content Admin, Storefront.

## 9. Logging Strategy

| Log Level | When | Example |
|-----------|------|---------|
| ERROR | gallery dir unreadable | `Error reading directory for gallery 'x'` |

**Log format**: plaintext `console.*`. **Log storage**: container stdout.
