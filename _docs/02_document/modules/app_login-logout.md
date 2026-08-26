# Module: app/login + logout

**Paths:** `app/login/page.tsx`, `app/logout/LogoutButton.tsx`

## Purpose

Password form POST to `/api/login`; logout button POST `/api/logout` then `router.refresh()` (middleware sends user to `/login` if session gone).

## Public interface

- Login page: controlled password field, native form `action="/api/login" method="POST"`
- `LogoutButton`: no props

## Dependencies

`next/navigation` (logout). Login has no first-party imports.

## Consumers

`/login` route; Logout used by `app/manage/page.tsx`.

## Security

Login errors from API are not displayed (browser follows redirect or shows raw JSON). No CSRF token.

## Tests

None.
