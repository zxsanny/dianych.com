# Module: middleware

**Path:** `dianych-website/middleware.ts`

## Purpose

Redirect unauthenticated browsers away from `/manage`.

## Public interface

- Next.js middleware; `matcher: ['/manage/:path*']`
- If `!session.isLoggedIn` → redirect to `/login` (query stripped)

## Internal logic

`getIronSession` on `request.cookies` with `sessionOptions`. Other paths are not matched.

## Dependencies

`lib/session`, `iron-session`, `next/server`.

## Consumers

Next runtime (edge/node middleware). Does not protect `/api/*` by itself — each API/action checks session.

## Data models

`SessionData.isLoggedIn`.

## Configuration

Matcher only `/manage/:path*`.

## External integrations

None.

## Security

Page-level only. API routes and server actions must (and most do) check session independently. Login page is public.

## Tests

None.
