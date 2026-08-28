# Doc update log — 02-coupling-refactoring

**Date**: 2026-08-28

| Artifact | Action |
|----------|--------|
| `modules/app_fonts.md` | Removed (C02) |
| `modules/lib_galleryIds.md` | Added |
| `modules/lib_expandIfShort.md` | Added |
| `modules/lib_defaultFramePrices.md` | Added |
| `modules/components_Frames.md` | Drop FrameCard.tsx; import DEFAULT_FRAME_PRICES |
| `modules/api_login.md` | expandIfShort from lib |
| `modules/scripts_hash-pw.md` | same |
| `modules/app_actions.md` | GALLERY_IDS / isGalleryId |
| `modules/api_image.md` | isGalleryId |
| `modules/api_gallery-pack.md` | isGalleryId |
| `modules/api_prices.md` | DEFAULT_FRAME_PRICES |
| `modules/app_manage.md` | GALLERY_IDS + default prices |
| `modules/lib_diskCache.md` | best-effort catch (C06) |
| `modules/lib_galleryUtils.md` | isGalleryId callers |
| `modules/app_layout-page.md` | drop fonts.ts path |
| `modules/api_gallery-pack_cache.md` | jimp is live fallback |
| `module-layout.md` | new lib exports; fonts.ts out of Owns |
| `components/01–05 description.md` | shared helpers; dead files gone |
| `common-helpers/01_helper_path-and-password.md` | extracted status |
| `00_discovery.md` | tree, mermaid, topo, findings |
| `04_verification_log.md` | closed flags; 31 modules |
| `FINAL_report.md` | Low risks closed |
| `architecture_compliance_baseline.md` | F2/F3/F4 closed note (snapshot kept) |
| `00_problem/restrictions.md` | jimp is live fallback |
| `01_solution/solution.md` | unused fonts.ts limitation dropped |

Architecture Vision: not edited.
