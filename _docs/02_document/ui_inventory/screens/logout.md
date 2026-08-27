---
id: logout
route: /logout
nav_parent: manage
auth: public
copy_locale: uk
title: Management Login
regions:
  - id: main
    kind: main
states:
  default:
    observed: true
  empty:
    observed: false
    omitted: "logout is a POST, not a list"
  error:
    observed: true
  loading:
    observed: false
    omitted: "instant redirect after POST"
  denied:
    observed: false
    omitted: "logout does not require a role check beyond having a session to destroy"
---

## Purpose

End the manage session. There is no GET page.

## Regions

- **GET `/logout`:** Next 404 («404» / «This page could not be found.»)
- **POST from manage:** button «Logout» → `/login`

## Controls

| Name | Type | Label (copy_locale) | Action / destination |
|------|------|---------------------|----------------------|
| logout | button | Logout | POST `/api/logout` then refresh → `/login` |

## Copy

- Logout (on manage)
- After POST: Management Login
- GET: 404 / This page could not be found.

## Tokens

- button-primary

## Scenarios

- GET `/logout` → 404
- POST from manage Logout → landed on `/login`

## Evidence

`evidence/logout-after.png`
