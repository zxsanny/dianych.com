# Security approach

Security code exists (authz, secrets, uploads, rate limit). Requirements below are what the code already implements, plus documented gaps.

## Authentication / authorization

- Single shared password: bcrypt compare against `pw.txt` (`app/api/login/route.ts`).
- Short passwords (`len < 32`) expanded as `{p}.{p}.{p}` before compare; raw compare kept for legacy hashes.
- Session cookie `dianych-manage-session` via iron-session; `isLoggedIn` is the only flag (`lib/session.ts`).
- `/manage` gated by middleware matcher `/manage/:path*` → redirect `/login`.
- Mutations also check session: `uploadImages`, `deleteImage`, `POST /api/prices`, `POST /api/gallery-pack/invalidate`.
- Logout destroys the cookie (`app/api/logout`).

## Abuse controls

- Login: 5 attempts / 15 minutes / IP (`MAX_ATTEMPTS`, `WINDOW_MS`). IP from `x-real-ip`, else last `x-forwarded-for` hop.
- Public `GET /api/image` and `GET /api/gallery-pack`: 180 cache-miss generations / 60 seconds / IP.
- Map is in-process only (lost on restart; not shared across replicas).

## Upload / path safety

- Folder allow-list: `brooches`, `clothes`, `panel`, `felting`, `kits`.
- Filename sanitized to `[a-zA-Z0-9._-]`; extension allow-list (no SVG) + magic bytes (WebP requires RIFF+WEBP).
- `resolve` + prefix check blocks path traversal on upload/delete.
- Image GET: same gallery allow-list + `SAFE_FILENAME`.

## Transport / host

- Cookie `secure` when `NODE_ENV === 'production'`.
- Production TLS via host nginx + certbot (`install.sh`).
- Container: non-root `node`, `--read-only`, noexec mounts (`Dockerfile`, `restart.sh`).

## Secrets

- `SECRET_COOKIE_PASSWORD` from env (generated per `docker run`).
- `pw.txt` dockerignored / gitignored.

## Gaps (not treated as requirements)

- No CSRF token beyond cookie SameSite defaults.
- Session secret rotated every container start (invalidates all sessions).
- Public `GET /api/prices`; `getGalleryImages` unauthenticated.
- No rate limit on upload/prices. Login redirect uses `Host` + `X-Forwarded-Proto` only (not `X-Forwarded-Host`). nginx snippet overwrites `X-Forwarded-For` with `$remote_addr`.
