# Module: components/Frames

**Paths:** `dianych-website/app/components/Frames.tsx`; empty unused `FrameCard.tsx`

## Purpose

Storefront frames catalog: four size cards with static photos, live prices from `GET /api/prices`, Instagram order CTA (`povne.kolo`).

## Public interface

Default export. Inline `FrameCard` (not the empty file) opens `Modal` on static `/static-images/frames/*` paths.

## Internal logic

Defaults 450/500/600/700 UAH. Prices formatted `uk-UA` + ` UAH`. Fetch errors keep defaults.

## Dependencies

`SectionLayout`, `Modal`, `OrderButton`, `lib/translations`, `next/image`.

## Consumers

`app/page.tsx`.

## Tests

None.
