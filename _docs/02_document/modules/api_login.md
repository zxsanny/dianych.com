# Module: app/api/login

**Path:** `dianych-website/app/api/login/route.ts`

## Purpose

Authenticate the single admin password and set the iron-session cookie.

## Public interface

- `POST /api/login` — `multipart/form-data` field `password`
- 429 after 5 attempts / 15 min per IP
- 400 missing password; 401 invalid; 500 read/compare failure
- Success: `session.isLoggedIn = true` + redirect to absolute `/manage` (uses `x-forwarded-proto` / `x-forwarded-host`)

## Internal logic

IP from `x-forwarded-for` first hop or `x-real-ip`. In-memory `Map` rate limit (per process). Reads `pw.txt` from `process.cwd()`. Compares bcrypt against expanded short password and raw password (legacy).

Password expansion via `lib/expandIfShort` (`len < 32` → `{pass}.{pass}.{pass}`).

## Dependencies

`lib/session` (`sessionOptions`, `SessionData`), `lib/expandIfShort`, `iron-session`, `bcryptjs`, Next cookies, Node `fs`/`path`.

## Consumers

`app/login/page.tsx` (form POST).

## Data models

Session flag only. Rate-limit map is process-local.

## Configuration

`pw.txt` path = `cwd/pw.txt`. No env for the hash file.

## External integrations

None.

## Security

Single shared password. Rate limit is per-instance (lost on restart; not shared across replicas). Trusts forwarded IP headers. Success redirect is open-redirect-safe (pathname hardcoded `/manage`; host from forwarded headers — spoofable if proxy does not overwrite them).

## Tests

None.
