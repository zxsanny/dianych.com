# Static Analysis (SAST)

**Date**: 2026-08-28  
**Scope**: `dianych-website/` application source (not `node_modules`, not tests)

## Injection

- No SQL / shell / `eval` / `child_process` / `dangerouslySetInnerHTML` in first-party code.
- Path writes use allow-listed gallery ids + filename sanitization + `resolve` prefix checks (`app/actions.ts:49–76`, `101–120`).
- Image GET uses `isGalleryId` + `SAFE_FILENAME` (`app/api/image/route.ts:69–71`). Gallery pack same (`app/api/gallery-pack/route.ts:12–13`).
- **Finding**: SVG uploads accepted with a weak content check (`<svg` / `<?xml` in first 256 bytes) at `app/actions.ts:29–31`. nginx serves `/images/` as static files (`install.sh:17–21`). Stored XSS if a visitor opens the raw SVG URL.
- **Finding**: WEBP magic is only the RIFF header (`app/actions.ts:22`), so non-image RIFF files can pass and hit `sharp`.

## AuthN / AuthZ

- `/manage` gated in middleware (`middleware.ts:7–15`, matcher `/manage/:path*`).
- Mutations check session: `uploadImages` / `deleteImage` (`app/actions.ts:36–44`, `101–103`), `POST /api/prices` (`app/api/prices/route.ts:45–49`), `POST /api/gallery-pack/invalidate` (`invalidate/route.ts:10–13`).
- Public by design: `GET /api/prices`, `GET /api/image`, `GET /api/gallery-pack`, `getGalleryImages`.
- Single shared bcrypt password vs `pw.txt` (`app/api/login/route.ts:47–55`). No user id, no MFA. Matches `security_approach.md`.
- Session is a boolean `isLoggedIn` (`lib/session.ts:5–16`). Cookie `secure` only when `NODE_ENV === 'production'`.
- `SECRET_COOKIE_PASSWORD` from env; empty string if unset (`lib/session.ts:9–12`). Production `restart.sh:17` generates a 48-byte secret. Test compose requires the env var.
- **Finding**: Login rate limit keys on `x-forwarded-for` first hop (`app/api/login/route.ts:32`). nginx uses `$proxy_add_x_forwarded_for` (`install.sh:13`) and does not overwrite a client-supplied `X-Forwarded-For`, so the first hop is attacker-controlled.
- **Finding**: Success redirect host comes from `x-forwarded-host` then `host` (`app/api/login/route.ts:10–13`, `61–62`). nginx does not set `X-Forwarded-Host`, so a client header can redirect the browser (and the session cookie Set-Cookie on that response) to an attacker host.

## Crypto

- Passwords: bcryptjs compare; hash written by `scripts/hash-pw.js` (cost 10). Short passwords expanded (`lib/expandIfShort.js:1–4`).
- No hardcoded session secrets or API keys in source. `pw.txt` and `.env*` gitignored and dockerignored.
- TLS is host nginx + certbot (`install.sh:35`), not the Node process.

## Data exposure

- Login catch logs the error object (`app/api/login/route.ts:66–68`) but client body is generic.
- **Finding**: `/api/image` and `/api/gallery-pack` return `error.message` to the client (`app/api/image/route.ts:110–112`, `gallery-pack/route.ts:63–65`). `deleteImage` concatenates the exception (`app/actions.ts:137`).
- `hash-pw.js` echoes the prompt in cleartext (`scripts/hash-pw.js:19`) and prints the hash (hash is not secret-equivalent to the password, but the prompt is).

## Deserialization

- `JSON.parse` on disk cache files the process itself wrote (`app/api/image/route.ts:90`, `gallery-pack/route.ts:42`). Not untrusted network JSON except `POST /api/prices` which only reads four numeric fields.
- Next.js Flight / Server Actions protocol is framework-level untrusted deserialization — covered as GHSA-9qr9-h5gf-34mp in the dependency scan.

## Self-verification

- Source dirs scanned; each finding has path:line; test/comment-only hits excluded.
