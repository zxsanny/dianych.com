# DIANYCH website — Architecture

## 1. System Context

**Problem being solved**: Diana (Dianych) sells custom pet portraits (embroidery, felting, frames, kits). The site shows work, prices frames, and sends buyers to Instagram/social shops. Diana uploads new photos and edits frame prices without a developer.

**System boundaries**: Inside — Next.js app, session cookie, `pw.txt`, `public/images` volume, `framePrices.json`, tmp WebP caches. Outside — Instagram/Telegram/YouTube/Facebook/Etsy/TikTok, GitHub, docker.azaion.com, host nginx/certbot.

**External systems**:

| System | Integration Type | Direction | Purpose |
|--------|-----------------|-----------|---------|
| Instagram / Telegram / TikTok / YouTube / Facebook / Etsy | HTTPS links | Outbound | Order and social |
| docker.azaion.com | Docker registry | Outbound | Image push/pull |
| GitHub | git SSH | Both | Source |
| Let's Encrypt (certbot) | ACME | Inbound to nginx | TLS |
| Visitor / admin browsers | HTTPS | Both | UI + APIs |

No inbound webhooks or third-party APIs.

## 2. Technology Stack

| Layer | Technology | Version | Rationale (from code) |
|-------|-----------|---------|------------------------|
| Language | TypeScript | 5 | `package.json` |
| Framework | Next.js App Router + React | 15.5.2 / 19.1.0 | storefront + server actions |
| CSS | Tailwind | 4 | `globals.css` / postcss |
| Auth | iron-session + bcryptjs | 8.0.4 / 3.0.2 | cookie + `pw.txt` |
| Images | sharp | 0.33.5 | WebP thumbs |
| Carousel | embla-carousel-react | 8.6.0 | galleries |
| Database | none | — | filesystem JSON + images |
| Cache | process Map + `/tmp` JSON + localStorage | — | packs/singles |
| Hosting | Docker standalone on host + nginx | Node 20 | `Dockerfile`, `install.sh` |
| CI/CD | none | — | `build.cmd` + `update.sh` |

**Key constraints**:
- Container is `--read-only` except image volume and `/tmp`
- Session secret comes from env at `docker run`
- No test runner

## 3. Deployment Model

**Environments**: local `next dev` (port 3000); production `dianych.com` (nginx 443 → container 3001→3000). No staging in repo.

**Infrastructure**: single Docker container, host nginx TLS, bind-mount gallery images, registry `docker.azaion.com/dianych`.

**Environment-specific configuration**:

| Config | Development | Production |
|--------|-------------|------------|
| Images | `dianych-website/public/images` | `/var/www/dianych/images` mount |
| Secrets | unset / local env | `SECRET_COOKIE_PASSWORD` generated per recreate |
| Password hash | `pw.txt` in app cwd | same path in image/workdir (file dockerignored) |
| Logging | console | `docker logs` |

## 4. Data Model Overview

**Core entities**:

| Entity | Description | Owned By Component |
|--------|-------------|--------------------|
| GalleryImage | File in `public/images/<galleryId>/` | content-admin / ops volume |
| GalleryPack | Cached WebP data-URLs | image-pipeline |
| FramePrices | Four numeric prices | content-admin |
| Session | `isLoggedIn` cookie | auth |
| PasswordHash | bcrypt in `pw.txt` | auth |

**Key relationships**: GalleryImage folder ∈ {brooches, clothes, panel, felting, kits}. FramePrices independent of galleries.

**Data flow summary**:
- Disk originals → sharp → tmp JSON / memory → browser (and localStorage)
- Admin multipart → `public/images` → revalidate + invalidate pack
- Admin JSON → nested `framePrices.json` → public GET

## 5. Integration Points

Outbound `<a href>` only. No vendor SDKs. Image `remotePatterns` allow `https://dianych.com/images/**` (unused while `images.unoptimized`).

## 6. NFRs (evidenced)

| NFR | Evidence |
|-----|----------|
| Upload size | serverActions 20mb; nginx 300M |
| Thumb cache | 500MB tmp LRU; HTTP Cache-Control 300s |
| Login abuse | 5 attempts / 15 min / IP |
| Availability | `--restart always` |
| Image types | jpeg/png/webp/gif/bmp/tiff + svg (upload) |

## 7. Security architecture

- Cookie `dianych-manage-session`, `secure` in production
- `/manage` middleware + per-mutation session checks
- Path prefix checks + magic bytes on upload
- Rate-limited login
- Read-only container, non-root `node`, noexec mounts
- Gaps: rotating session secret; no CSRF token; public GET prices; `getGalleryImages` unauthenticated; forwarded-host trust

## 8. ADRs (inferred)

| ADR | Choice | Evidence |
|-----|--------|----------|
| Filesystem over DB | images + JSON on disk | no ORM/DB deps |
| Data-URL thumbs | JSON packs vs `/_next/image` | `unoptimized: true`, gallery-pack API |
| Single password | bcrypt file | no user table |
| Standalone Docker | `output: 'standalone'` | Dockerfile copy |
