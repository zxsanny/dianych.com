---
id: login
route: /login
nav_parent: null
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
    observed: true
  error:
    observed: true
  loading:
    observed: false
    omitted: "no distinct loading UI; instant render"
  denied:
    observed: false
    omitted: "login is public"
---

## Purpose

Single-password gate to `/manage`.

## Regions

- **main:** centered white card on light gray: heading, password field, Login button. No storefront chrome.

## Controls

| Name | Type | Label (copy_locale) | Action / destination |
|------|------|---------------------|----------------------|
| password | input | Password (EN on screen) | required |
| submit | button | Login | POST `/api/login` → `/manage` on success |

## Copy

Live strings are English on this page (not UA):

- Management Login
- Password
- Login

## Tokens

- colors.primary, colors.neutral, typography.h1, button-primary, rounded.sm

## Scenarios

- default / empty: opened `/login` with empty field
- error: clicked Login empty — browser `required` blocked submit (no server message; login errors are not shown in UI)
- denied for `/manage`: GET `/manage` without cookie redirected here
- success: submitted the walkthrough password → `/manage`

## Evidence

`evidence/login-default.png` (if present)
