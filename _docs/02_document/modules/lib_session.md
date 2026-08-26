# Module: lib/session

**Path:** `dianych-website/lib/session.ts`

## Purpose

iron-session cookie helpers for the `/manage` admin gate.

## Public interface

- `SessionData` — `{ isLoggedIn?: boolean }`
- `sessionOptions: SessionOptions` — cookie name `dianych-manage-session`; `password` from `SECRET_COOKIE_PASSWORD`; `secure` when `NODE_ENV === 'production'`
- `getSession()` — session from Next `cookies()` (Server Actions / RSC)
- `getSessionFromRequest(req: NextRequest)` — session from a `NextRequest` (route handlers)

## Internal logic

Empty `SECRET_COOKIE_PASSWORD` is passed through as `''` (iron-session will fail at runtime if used without a valid password).

## Dependencies

`iron-session`, `next/headers`, `next/server`.

## Consumers

- `middleware.ts`
- `app/api/login/route.ts` (uses `sessionOptions` + `getIronSession` directly)
- `app/api/logout/route.ts`
- `app/api/prices/route.ts`
- `app/api/gallery-pack/invalidate/route.ts` (`getSessionFromRequest`)
- `app/actions.ts` (`getSession`)

## Data models

`SessionData.isLoggedIn` is the only persisted flag.

## Configuration

- `SECRET_COOKIE_PASSWORD` (required at runtime; `restart.sh` / `update.sh` generate a new value per container recreate)
- `NODE_ENV` for cookie `secure`

## External integrations

None.

## Security

Cookie is the sole authz signal. Production must set a stable secret; rotating it on every `docker run` invalidates all sessions (and is what the ops scripts do today).

## Tests

None.
