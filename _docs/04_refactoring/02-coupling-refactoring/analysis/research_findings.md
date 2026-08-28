# Research findings — 02-coupling-refactoring

## Project constraint matrix

| Constraint | Source | Implication |
|------------|--------|-------------|
| No database / ORM | restrictions.md | No catalog tables; shared TS constants only |
| Next 15.5.2 / React 19 / Node 20 standalone | restrictions.md | Stay on current stack |
| Single password, `pw.txt`, iron-session | AC-AUTH, architecture | `expandIfShort` formula must not change |
| Five gallery ids | AC-F1-02 | C04 set is fixed |
| sharp + jimp fallback | cache.ts (restrictions.md “jimp unused” is stale) | Do not drop jimp |
| No new HTTP APIs this run | list-of-changes deferred | No REST twins |
| Tests: compose blackbox only | environment.md | Safety net is `run-tests.sh` |

## Current patterns

App Router routes + server actions; filesystem galleries; in-process caches. Strength: small, testable via HTTP. Weakness: duplicated catalogs and two dead files.

## Alternatives

No library/SDK replacement. Context7 / MVE / Restrictions×Mode matrix: N/A.

| Recommendation | Pinned mode | Status |
|----------------|-------------|--------|
| Delete dead files (C01, C02) | n/a | Selected |
| Shared helper + GALLERY_IDS (C03, C04) | n/a — first-party modules | Selected |
| Add REST upload API | n/a | Rejected — product surface, deferred |
| Remove jimp | n/a | Rejected — live fallback |
| New CMS/DB | n/a | Rejected — restrictions |

## Quick wins

C01, C02 (delete). Then C04, C03.
