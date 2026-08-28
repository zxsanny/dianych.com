# Code review — batch 1 — 02-coupling-refactoring

**Verdict**: PASS  
**Date**: 2026-08-28  
**Tasks**: AZ-1581–1586

No Critical/High findings. Dead files removed. `GALLERY_IDS` / `isGalleryId` used by actions, image, pack GET, invalidate, manage keys. `expandIfShort` lives in one `.js` so `hash-pw.js` can import it. Default prices match `default_frame_prices.json`. diskCache catches are non-empty. Middleware still `/manage/:path*` only. Suite 47/47 PASS.
