# Logical flow analysis

Documented flows read from `_docs/02_document/system-flows.md`, `architecture.md` Vision, `glossary.md`, `module-layout.md`. No `contracts/` directory.

| Flow | Code path | Finding |
|------|-----------|---------|
| Browse storefront | `page.tsx` → gallery sections → `GET /api/gallery-pack` / `/api/image` | matches docs |
| Empty gallery | `getImagePaths` `[]` | no 500 — matches AC-F1-01 |
| Login / rate limit | `login/route.ts` Map + `expandIfShort` | matches AC-AUTH-*; helper duplicated (S06) not a logic bug |
| Manage upload/delete | `actions.ts` session + folder allow-list + magic bytes | matches AC-UP-*; allow-list duplicated (S16) |
| Prices | `prices/route.ts` cwd JSON | matches AC-PRICE-* / IR-04 |
| Session after recreate | iron-session cookie + secret | AC-IR-05 — ops, not this run |
| Pack invalidate | session + `invalidateCache` | matches |

**Logic bugs**: none.  
**Silent data loss**: none on these flows.  
**Documentation drift**: baseline F1 “unused jimp” is stale — `cache.ts` still uses jimp as sharp fallback.  
**Vision**: filesystem galleries, single password, no DB — C01–C04 do not contradict.
