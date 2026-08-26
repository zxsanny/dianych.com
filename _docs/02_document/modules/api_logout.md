# Module: app/api/logout

**Path:** `dianych-website/app/api/logout/route.ts`

## Purpose

Destroy the admin session cookie.

## Public interface

- `POST /api/logout` → `{ message: 'Logged out' }` and expires `dianych-manage-session`

## Internal logic

`getIronSession` + `session.destroy()` then set cookie maxAge -1.

## Dependencies

`lib/session`, `iron-session`.

## Consumers

`app/logout/LogoutButton.tsx`.

## Data models

None.

## Configuration

Cookie name from `sessionOptions.cookieName`.

## External integrations

None.

## Security

No auth check (idempotent destroy). Unauthenticated POST is harmless.

## Tests

None.
