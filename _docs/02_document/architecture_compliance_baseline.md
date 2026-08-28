# Architecture Compliance Baseline

**Mode**: baseline (Phases 1 + 7)  
**Date**: 2026-08-27  
**Verdict**: PASS_WITH_WARNINGS

Existing-code scan of `dianych-website/` against `_docs/02_document/architecture.md`, `module-layout.md`, `_docs/00_problem/acceptance_criteria.md`, `_docs/00_problem/restrictions.md`, `_docs/01_solution/solution.md`. No task-batch spec. No `adr/` directory.

F2/F3/F4 (empty `FrameCard.tsx`, unused `app/fonts.ts`, duplicated `expandIfShort`) closed in `_docs/04_refactoring/02-coupling-refactoring/` (2026-08-28). Findings below are the original baseline snapshot.

## Phase 1 — Context

Documented system: filesystem galleries + JSON prices + iron-session admin; six components; layers 0–4 in `module-layout.md`. ACs IR-01–08 and auth/prices/upload already recorded. No inbound vendor contracts.

## Phase 7 — Architecture

| Check | Result |
|-------|--------|
| Layer direction | No first-party import of a strictly higher layer. `app/actions.ts` → `gallery-pack/cache` is layer 2 → 2/1 (allowed). |
| Public API | Storefront does not import manage internals. |
| Cycles | None in first-party imports (matches module-layout Verification Needed). |
| Duplicate symbols | `expandIfShort` duplicated in login route and `hash-pw.js` (documented helper candidate). |
| Cross-cutting | Session/locale live in shared-runtime as mapped. |
| ADRs | No `adr/` files; inferred ADRs in `architecture.md` §8 match the code (filesystem, data-URL packs, single password, standalone Docker). |

Documented ops/path drift (prices cwd, nginx alias, session-secret rotation, pack invalidate width) is already in `architecture.md` Vision and IR-01/04/05/08 — not new layer breaks.

## Findings

| # | Severity | Category | File:Line | Title |
|---|----------|----------|-----------|-------|
| 1 | Medium | Maintainability | `package.json` | unused `jimp` dependency |
| 2 | Low | Maintainability | `app/components/FrameCard.tsx` | empty unused file |
| 3 | Low | Maintainability | `app/fonts.ts` | unused export |
| 4 | Low | Maintainability | `app/api/login/route.ts` + `scripts/hash-pw.js` | duplicated `expandIfShort` |

### Finding Details

**F1: unused jimp** (Medium / Maintainability)
- Location: `dianych-website/package.json`
- Description: listed; no first-party import
- Suggestion: remove in a later cleanup (Step 8 if chosen)

**F2: empty FrameCard** (Low / Maintainability)
- Location: `dianych-website/app/components/FrameCard.tsx`
- Description: unused empty component
- Suggestion: delete when touching storefront

**F3: unused fonts.ts** (Low / Maintainability)
- Location: `dianych-website/app/fonts.ts`
- Description: layout loads the woff2 directly
- Suggestion: delete or wire

**F4: duplicated expandIfShort** (Low / Maintainability)
- Location: login route and hash-pw script
- Description: same short-password expansion in two places
- Suggestion: one shared helper if auth is touched

## Verdict notes

No Critical/High Architecture findings. High ops risks stay in interaction ACs for test-spec / later tasks, not this baseline fail gate.
