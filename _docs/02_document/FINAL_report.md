# DIANYCH website — Documentation Report

Existing-code baseline (document skill Steps 0–7). Not a greenfield plan: no epics, no test suite.

## Executive Summary

The live site is a single Next.js 15 storefront plus one-password `/manage` CMS for Dianych pet portraits. Six components (shared-runtime, image-pipeline, auth, content-admin, storefront, ops) were documented from 29 modules. Orders leave to Instagram/social; persistence is filesystem images + JSON prices; production is one Docker container behind host nginx.

## Problem Statement

Diana needs visitors to see current work and frame prices, and to update photos/prices herself. The site is a brochure + CMS, not a shop: no cart, accounts, or payments.

## Architecture Overview

Confirmed vision: public Next.js shop; one Docker container on dianych.com; images on a host volume; no database. Principles: filesystem over DB; data-URL thumbs; single shared password; standalone Docker + nginx.

**Technology stack**: TypeScript 5, Next.js 15.5.2, React 19, Tailwind 4, iron-session, bcryptjs, sharp; no DB.

**Deployment**: local `next dev` :3000; production nginx 443 → container 3001; registry `docker.azaion.com/dianych`; no CI.

Full detail: `architecture.md`.

## Component Summary

| # | Component | Purpose | Dependencies | Epic |
|---|-----------|---------|--------------|------|
| 01 | shared-runtime | Session, gallery listing, disk-cache cap, UA/EN | — | pending |
| 02 | image-pipeline | WebP pack/single APIs + caches | 01 | pending |
| 03 | auth | `pw.txt` login, cookie, `/manage` gate | 01 | pending |
| 04 | content-admin | Upload/delete + frame prices | 01, 03, 02 | pending |
| 05 | storefront | Public landing, galleries, frames, contact | 01, 02, 04 | pending |
| 06 | ops | Docker, nginx, registry, host scripts | wraps all | pending |

**Implementation order** (already built; layering for later changes):
1. shared-runtime
2. image-pipeline, auth
3. content-admin, storefront
4. ops

## System Flows

| Flow | Description | Key Components |
|------|-------------|----------------|
| F1 Browse | GET `/` lists five galleries | storefront, shared-runtime |
| F2 Thumbs + lightbox | Pack + `/api/image` | storefront, image-pipeline |
| F3 Login | `POST /api/login` | auth |
| F4 Upload/delete | Manage forms | content-admin, image-pipeline |
| F5 Prices | GET/POST `/api/prices` | content-admin, storefront |
| F6 Logout | Destroy cookie | auth |
| F7 Host update | `update.sh` | ops |

See `system-flows.md`.

## Risk Summary

| Level | Count | Key Risks |
|-------|-------|-----------|
| Critical | 0 | — |
| High | 3 | Nested prices path (IR-04); session secret every recreate (IR-05); nginx alias ≠ volume (IR-08) |
| Medium | 2 | Stale thumbs after upload (IR-01); login errors not shown in UI |
| Low | 0 closed in 02-coupling-refactoring | `jimp` is live sharp fallback; `FrameCard.tsx` / `app/fonts.ts` deleted |

Entity verification: 0 unresolved hallucinations. Completeness 100% of scanned first-party source.

## Test Coverage

No test runner. ACs live in `_docs/00_problem/acceptance_criteria.md` (IR-01–08 plus auth/prices/upload/image). Expected-results Gaps: correct-password login, golden WebP, live gallery lists, nginx vs volume.

**Overall acceptance criteria coverage**: 0 / ~25 ACs have automated tests (0%).

## Epic Roadmap

Not created. Tracker still `unset`. Phase A test-spec / decompose will open the first epic.

## Key Decisions Made (inferred from code)

| # | Decision | Rationale | Alternatives Rejected |
|---|----------|-----------|----------------------|
| 1 | Filesystem + JSON | No ORM/DB deps | Database-backed CMS |
| 2 | Data-URL packs | `unoptimized` + gallery-pack API | Next `/_next/image` |
| 3 | Single password file | One operator | User table / OAuth |
| 4 | Standalone Docker + host nginx | One host, TLS at proxy | Vercel / compose / k8s |
| 5 | Off-site orders | Instagram CTAs | In-app checkout |

## Open Questions

| # | Question | Impact | Assigned To |
|---|----------|--------|-------------|
| 1 | Canonical prices file vs nested cwd path | AC-IR-04 / admin edits | Admin / later task |
| 2 | nginx `/root/dianych/images` vs `/var/www/dianych/images` | AC-IR-08 / wrong photos | Operator |
| 3 | Session secret rotation every restart | AC-IR-05 / logout-all | Operator |
| 4 | Pack invalidate width 500 vs carousel 400 | AC-IR-01 / stale thumbs | later task |
| 5 | Expected-results Gaps (password, golden WebP, live files) | test-spec Phase 1 | developer |

## Artifact Index

| File | Description |
|------|-------------|
| `00_discovery.md` | Tree, stack, dependency graph |
| `modules/*.md` | 29 module docs |
| `components/0{1-6}_*/description.md` | Component specs |
| `common-helpers/01_helper_path-and-password.md` | Shared helper candidates |
| `module-layout.md` | File ownership / layers |
| `architecture.md` | Architecture + confirmed Vision |
| `glossary.md` | Confirmed terminology |
| `system-flows.md` | F1–F7 |
| `interaction-risks.md` | IR-01–08 → AC ids |
| `data_model.md` | Filesystem entities |
| `deployment/overview.md` | Docker / nginx / no CI |
| `diagrams/components.md` | Component mermaid |
| `diagrams/flows/flow_browse.md` | Browse flow |
| `04_verification_log.md` | Entity verification |
| `_docs/01_solution/solution.md` | Retrospective solution |
| `_docs/00_problem/problem.md` | Problem statement |
| `_docs/00_problem/restrictions.md` | Constraints |
| `_docs/00_problem/acceptance_criteria.md` | Measurable ACs |
| `_docs/00_problem/input_data/` | Parameters + expected results |
| `_docs/00_problem/security_approach.md` | Auth / upload / secrets |
| `_docs/00_problem/infra_topology.md` | Push targets + hosts |
