# Codebase Discovery

Mode: Full. No FOCUS_DIR.

DOCUMENT_DIR: `_docs/02_document/`
SOLUTION_DIR: `_docs/01_solution/`
PROBLEM_DIR: `_docs/00_problem/`

## Directory tree (source and ops; excludes `node_modules`, `.git`, `.next`)

```
dianych.com/
├── build.cmd                 # Windows: docker build + push to docker.azaion.com
├── install.sh                # nginx TLS vhost + certbot for dianych.com
├── restart.sh                # recreate container, generate new session secret
├── update.sh                 # pull image + recreate container
├── package-lock.json         # empty root lock (name: dianych.com)
├── design/
│   ├── Dianych_v1.pdf
│   └── Site_mechanics.pdf
└── dianych-website/          # Next.js 15 App Router application
    ├── Dockerfile            # multi-stage standalone Node 20 + sharp/libvips
    ├── middleware.ts         # /manage session gate
    ├── app/
    │   ├── layout.tsx, page.tsx, globals.css, actions.ts
    │   ├── api/              # login, logout, prices, image, gallery-pack
    │   ├── components/       # public storefront sections + gallery
    │   ├── login/, logout/, manage/
    ├── contexts/LanguageContext.tsx
    ├── lib/                  # session, galleryUtils, diskCache, translations, galleryIds, expandIfShort, defaultFramePrices
    ├── data/framePrices.json
    ├── dianych-website/data/framePrices.json   # nested copy (cwd-relative path)
    ├── public/images/{brooches,clothes,panel,felting,kits,flags}
    ├── public/static-images/
    └── scripts/hash-pw.js
```

Binary / non-code: `design/*.pdf`, `public/**` images, `app/fonts/vinnytsia_serif.woff2`, `app/favicon.ico`. Nested `dianych-website/dianych-website/` is not a second app.

## Tech stack

| Area | Choice | Evidence |
|------|--------|----------|
| Language | TypeScript 5 | `package.json`, `tsconfig.json` |
| UI | Next.js 15.5.2 App Router, React 19, Tailwind 4 | `package.json`, `app/` |
| Session | iron-session cookie `dianych-manage-session` | `lib/session.ts` |
| Password | bcryptjs vs `pw.txt` hash | `app/api/login/route.ts`, `scripts/hash-pw.js` |
| Images | sharp + jimp (jimp is sharp fallback in pack cache), disk cache 500MB | `app/api/image`, `gallery-pack/cache.ts`, `lib/diskCache.ts` |
| Carousel | embla-carousel-react | `GalleryCarousel.tsx` |
| Runtime | Node 20 bookworm-slim, `output: 'standalone'` | `Dockerfile`, `next.config.ts` |
| Reverse proxy | nginx 443 → localhost:3001 | `install.sh` |
| Registry | docker.azaion.com | `build.cmd` |
| Tests | none | no `*.test.*` / `*.spec.*` / test runner script |
| CI | none | no `.github/`, `.woodpecker/`, or compose |

## Entry points

| Entry | Role |
|-------|------|
| `dianych-website/app/layout.tsx` | HTML shell, font, `LanguageProvider` |
| `dianych-website/app/page.tsx` | Public landing (galleries + contact) |
| `dianych-website/app/login/page.tsx` | Admin password form → `POST /api/login` |
| `dianych-website/app/manage/page.tsx` | Admin gallery + prices (middleware-protected) |
| `dianych-website/middleware.ts` | Redirect unauthenticated `/manage` → `/login` |
| `dianych-website/app/api/*/route.ts` | Route handlers |
| `dianych-website/app/actions.ts` | Server actions: upload / delete / list gallery |
| `dianych-website/scripts/hash-pw.js` | CLI to write bcrypt hash to `pw.txt` |
| `build.cmd` / `restart.sh` / `update.sh` / `install.sh` | Image + host ops |

## Existing docs

- `dianych-website/README.md` — stock create-next-app text (Geist/Vercel); does not describe this product.
- `design/Dianych_v1.pdf`, `design/Site_mechanics.pdf` — original design (binary; not parsed here).

## Test structure

None. No unit, integration, or e2e harness.

## Dependency graph

Leaves first. External libs omitted from edges.

```mermaid
flowchart BT
  diskCache[lib/diskCache]
  galleryUtils[lib/galleryUtils]
  session[lib/session]
  langCtx[contexts/LanguageContext]
  galleryIds[lib/galleryIds]
  expandIfShort[lib/expandIfShort]
  defaultPrices[lib/defaultFramePrices]
  hashPw[scripts/hash-pw]
  translations[lib/translations]
  packCache[api/gallery-pack/cache]
  apiImage[api/image]
  apiLogin[api/login]
  apiLogout[api/logout]
  apiPrices[api/prices]
  apiPack[api/gallery-pack]
  apiInv[api/gallery-pack/invalidate]
  mw[middleware]
  actions[app/actions]
  orderBtn[components/OrderButton]
  modal[components/Modal]
  langSw[components/LanguageSwitcher]
  section[components/SectionLayout]
  contact[components/Contact]
  carousel[components/GalleryCarousel]
  gallery[components/Gallery]
  frames[components/Frames]
  sections[Brooches Clothes Panel Felting Kits]
  header[components/Header]
  topbar[components/TopBar]
  pageLayout[components/PageClientLayout]
  loginPage[login/page]
  logoutBtn[logout/LogoutButton]
  manage[manage/*]
  home[app/page]
  root[app/layout]

  translations --> langCtx
  packCache --> diskCache
  apiImage --> diskCache
  apiLogin --> session
  apiLogout --> session
  apiPrices --> session
  apiPack --> packCache
  apiInv --> packCache
  apiInv --> session
  mw --> session
  actions --> galleryUtils
  actions --> packCache
  actions --> session
  langSw --> langCtx
  section --> translations
  contact --> translations
  carousel --> translations
  carousel --> orderBtn
  carousel --> modal
  gallery --> galleryUtils
  gallery --> carousel
  frames --> translations
  frames --> section
  frames --> modal
  frames --> orderBtn
  sections --> gallery
  header --> langSw
  header --> translations
  topbar --> langSw
  topbar --> translations
  pageLayout --> topbar
  manage --> actions
  manage --> logoutBtn
  loginPage --> apiLogin
  home --> header
  home --> sections
  home --> frames
  home --> contact
  home --> pageLayout
  actions --> galleryIds
  apiImage --> galleryIds
  apiPack --> galleryIds
  apiInv --> galleryIds
  manage --> galleryIds
  apiLogin --> expandIfShort
  hashPw --> expandIfShort
  frames --> defaultPrices
  apiPrices --> defaultPrices
  root --> langCtx
```

Cycles: none among first-party modules.

## Topological order (module docs)

1. `lib/diskCache`
2. `lib/galleryUtils`
3. `lib/session`
4. `contexts/LanguageContext`
5. `lib/galleryIds`
6. `lib/expandIfShort`
7. `lib/defaultFramePrices`
8. `scripts/hash-pw`
9. `lib/translations`
10. `app/api/gallery-pack/cache`
11. `app/api/image`
12. `app/api/login`
13. `app/api/logout`
14. `app/api/prices`
15. `app/api/gallery-pack` (route + invalidate)
16. `middleware`
17. `app/actions`
18. `components/OrderButton`
19. `components/Modal`
20. `components/LanguageSwitcher`
21. `components/SectionLayout`
22. `components/Contact`
23. `components/GalleryCarousel`
24. `components/Gallery`
25. `components/Frames`
26. `components/gallery-sections` (Brooches, Clothes, Panel, Felting, Kits)
27. `components/chrome` (Header, TopBar, PageClientLayout)
28. `app/login` + `app/logout`
29. `app/manage`
30. `app/layout` + `app/page`
31. `ops-scripts` (install/restart/update/build + Dockerfile)

## Leaf vs entry

| Kind | Modules |
|------|---------|
| Leaves | diskCache, galleryUtils, session, LanguageContext, galleryIds, expandIfShort, defaultFramePrices, hash-pw, OrderButton, Modal |
| Entries | layout/page, middleware, API routes, actions, ops-scripts |

## Notable findings (discovery only)

- Prices path is `process.cwd()/dianych-website/data/framePrices.json`. App cwd is `dianych-website/`, so runtime file is the nested copy.
- `FrameCard.tsx` and `app/fonts.ts` removed in `02-coupling-refactoring`.
- `jimp` is a live sharp fallback in `gallery-pack/cache.ts`.
- `restart.sh` / `update.sh` set a new `SECRET_COOKIE_PASSWORD` on every recreate (sessions drop).
- nginx image alias in `install.sh` (`/root/dianych/images/`) does not match the docker volume in `restart.sh` (`/var/www/dianych/images`).
- `pw.txt` is dockerignored; root `.gitignore` has `pw.txt` (not `dianych-website/pw.txt` unless matched by name — root pattern `pw.txt` matches any path named `pw.txt`).
