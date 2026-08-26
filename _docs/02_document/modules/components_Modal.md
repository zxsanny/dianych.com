# Module: components/Modal

**Path:** `dianych-website/app/components/Modal.tsx`

## Purpose

Fullscreen lightbox for a list of image URLs. Gallery paths (`/images/<id>/<file>`) are fetched as 1200px WebP via `/api/image` and cached in `localStorage`. Static paths render as-is.

## Public interface

- `Modal({ isOpen, onClose, images, currentIndex, onNext, onPrev })`
- Keys: Escape close, arrows next/prev. Backdrop click closes.

## Internal logic

`parseGalleryInfo` splits `/images/...`. Prefetches neighbors. Loading/error state arrays exist but errors are not shown in UI (pulse placeholder).

## Dependencies

React, `next/image`. HTTP `/api/image`.

## Consumers

`GalleryCarousel`, `Frames` (inline `FrameCard`).

## Security

Writes large data-URLs to `localStorage` (quota failures swallowed). Fetches only same-origin `/api/image`.

## Tests

None.
