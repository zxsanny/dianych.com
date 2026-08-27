# Glossary

**Status**: confirmed-by-user  
**Date**: 2026-08-26

| Term | Definition | source |
|------|------------|--------|
| Admin / Diana | Single-password operator who uploads photos and edits frame prices | `architecture.md` §1; `components/04_content-admin/description.md` |
| Auth | Shared-password login, cookie session, `/manage` gate, logout | `components/03_auth/description.md` |
| Brooches | Gallery folder `brooches` — embroidery brooches/chevrons | `modules/components_gallery-sections.md` |
| Clothes | Gallery folder `clothes` — embroidery on clothing | `modules/components_gallery-sections.md` |
| Content Admin | Authenticated upload/delete and frame-price edit (`/manage`) | `components/04_content-admin/description.md` |
| DIANYCH / Dianych | Public brand and hostname for the pet-portrait shop | `architecture.md` §1; `00_discovery.md` |
| docker.azaion.com | Private registry for the `dianych` image | `00_problem/infra_topology.md`; `modules/ops-scripts.md` |
| Felting | Gallery folder `felting` — wool portraits | `modules/components_gallery-sections.md` |
| FramePrices | Four hoop-size prices (8/10/14/19 cm) in UAH | `data_model.md`; `modules/api_prices.md` |
| GalleryImage | Raster file at `public/images/<galleryId>/<filename>` | `data_model.md` |
| gallery-pack / GalleryPack | Cached WebP data-URL set for one gallery + width | `data_model.md`; `modules/api_gallery-pack.md` |
| galleryId | Allow-listed folder name under `public/images/` | `data_model.md`; `modules/lib_galleryUtils.md` |
| Image Pipeline | Resize/cache APIs for thumbs and lightbox | `components/02_image-pipeline/description.md` |
| Kits | Gallery folder `kits` — schemes/kits | `modules/components_gallery-sections.md` |
| Locale | Storefront copy `ua` \| `en`; not persisted; `<html lang>` stays `en` | `modules/lib_translations.md`; `modules/contexts_LanguageContext.md` |
| Manage | `/manage` CMS (UA copy «Менеджмент секцій») | `modules/app_manage.md` |
| Operator | Host/Docker person running ops scripts (may be the same as Admin) | `components/06_ops/description.md` |
| Ops | Host Docker, nginx TLS, registry, run/update scripts | `components/06_ops/description.md` |
| Order | Leave-site CTA (Instagram / social shops), not in-app checkout | `modules/components_OrderButton.md`; `architecture.md` §5 |
| Panel | Gallery folder `panel` — painted panels | `modules/components_gallery-sections.md` |
| Pet portraits | Product category on the landing hero | `modules/lib_translations.md` |
| povne.kolo | Instagram used for frame orders | `modules/components_Frames.md` |
| pw.txt | bcrypt hash of the single admin password | `modules/scripts_hash-pw.md`; `modules/api_login.md` |
| SECRET_COOKIE_PASSWORD | iron-session secret; regenerated on each container start | `modules/lib_session.md`; `modules/ops-scripts.md` |
| Session | Cookie `dianych-manage-session` with optional `isLoggedIn` | `data_model.md`; `modules/lib_session.md` |
| Shared Runtime | Session helpers, gallery listing, disk-cache cap, locale | `components/01_shared-runtime/description.md` |
| Storefront | Public landing: galleries, frames, contact, UA/EN copy | `components/05_storefront/description.md` |
| Visitor | Public shopper on dianych.com (no account) | `architecture.md` §1; `system-flows.md` F1 |
