# Module: app/fonts

**Path:** `dianych-website/app/fonts.ts`

## Purpose

Export a next/font local face for Vinnytsia Serif (`app/fonts/vinnytsia_serif.woff`, CSS variable `--font-vinnytsia-serif`).

## Public interface

- `vinnytsiaSerif` — `next/font/local` result (`display: 'swap'`)

## Internal logic

None beyond the font loader call.

## Dependencies

`next/font/local`.

## Consumers

**None in scanned imports.** `app/layout.tsx` constructs its own `localFont` from `vinnytsia_serif.woff2` and applies `className` on `<html>`. This module is currently unused.

## Data models

None.

## Configuration

Font file path `./fonts/vinnytsia_serif.woff` (woff, not the woff2 used by layout).

## External integrations

None.

## Security

None.

## Tests

None.
