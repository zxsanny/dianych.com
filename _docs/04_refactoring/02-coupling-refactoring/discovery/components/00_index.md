# Components index

Source of truth for ownership: `_docs/02_document/module-layout.md`. This run does not re-document every method.

| # | Component | Path | Refactor relevance |
|---|-----------|------|--------------------|
| 01 | shared-runtime | `lib/`, `contexts/`, unused `app/fonts.ts` | C02 fonts.ts |
| 02 | image-pipeline | `app/api/gallery-pack/`, `app/api/image/` | C04 gallery ids; jimp fallback stays |
| 03 | auth | login/logout/middleware/`hash-pw.js` | C03 expandIfShort |
| 04 | content-admin | `actions.ts`, prices, `/manage` | C04 gallery ids |
| 05 | storefront | `app/components/`, `page.tsx`, `layout.tsx` | C01 empty FrameCard.tsx |
| 06 | ops | Dockerfile, scripts | none this run |
