# Storefront

## 1. High-Level Overview

**Purpose**: Public marketing site: hero, five galleries, frames catalog with live prices, contact/order links, UA/EN copy.

**Architectural Pattern**: Next.js App Router pages + client islands (carousel, modal, language).

**Upstream dependencies**: Shared Runtime (translations, listing), Image Pipeline (HTTP), Content Admin (prices GET, image files).

**Downstream consumers**: End users / browsers. Order CTAs leave the site (Instagram).

## 2. Internal Interfaces

Page composition only. No exported service API.

## 3. External API Specification

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/` | GET | Public | — | Landing |
| (consumes) `/api/gallery-pack`, `/api/image`, `/api/prices` | GET | Public | — | See other components |

## 4. Data Access Patterns

### Queries

| Query | Frequency | Hot Path | Index Needed |
|-------|-----------|----------|--------------|
| SSR `getImagePaths` | Every `/` | Yes | No |
| Client pack/image/prices fetch | First view | Yes | No |

### Caching Strategy

| Data | Cache Type | TTL | Invalidation |
|------|-----------|-----|-------------|
| Thumbs / modal images | localStorage | until name set changes | client |
| `/api/prices` | `cache: 'no-store'` | none | — |

### Storage Estimates

N/A.

### Data Management

Static design assets under `public/static-images/`. Galleries from volume.

## 5. Implementation Details

**State Management**: client language; carousel/modal index; fetched prices.

**Key Dependencies**:

| Library | Version | Purpose |
|---------|---------|---------|
| next | 15.5.2 | App Router, Image |
| embla-carousel-react | ^8.6.0 | Gallery swipe |
| tailwindcss | ^4 | Layout |

**Error Handling Strategy**: prices → defaults; pack fail → original URLs; modal pulse on missing dataUrl.

## 6. Extensions and Helpers

None.

## 7. Caveats & Edge Cases

**Known limitations**:
- Locale not persisted; `html lang` stays `en`
- Clothes section has no header nav tile (only `#brooches` `#frames` `#felting` `#kits`)
- Frames order goes to `instagram.com/povne.kolo/`, galleries to `dianych.ua`

**Potential race conditions**: stale localStorage vs server files until name-set check.

**Performance bottlenecks**: homepage SSR reads five directories; first-visit pack generation.

## 8. Dependency Graph

**Must be implemented after**: Shared Runtime, Image Pipeline (for thumbs).

**Can be implemented in parallel with**: Auth, Content Admin.

**Blocks**: none.

## 9. Logging Strategy

| Log Level | When | Example |
|-----------|------|---------|
| ERROR | prices fetch not ok | `Error loading prices in Frames` |

**Log format**: plaintext (browser + server). **Log storage**: stdout / console.
