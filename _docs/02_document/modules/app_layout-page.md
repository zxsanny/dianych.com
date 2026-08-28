# Module: app/layout + page

**Paths:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

## Purpose

Root HTML + public landing composition.

## Public interface

- `layout.tsx` — metadata title `DIANYCH - Pet Portraits`; `LanguageProvider`; localFont `vinnytsia_serif.woff2` on `<html>` (`lang="en"` always)
- `page.tsx` — `PageClientLayout` → Header, Brooches, Clothes, Panel, Frames, Felting, Kits, Contact

## Dependencies

All storefront section modules + `LanguageContext` + `globals.css`.

## Configuration

`next.config.ts` `images.unoptimized`, remotePatterns `dianych.com/images/**`, standalone output.

## Tests

None.
