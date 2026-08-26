# Module: components/gallery-sections

**Paths:** `Brooches.tsx`, `Clothes.tsx`, `Panel.tsx`, `Felting.tsx`, `Kits.tsx`

## Purpose

Thin wrappers that bind a gallery folder + copy keys + Instagram order URL.

| Component | `id` | titleKey | extras | orderLink |
|-----------|------|----------|--------|-----------|
| Brooches | brooches | broochesTitle | orderEmbroidery | instagram.com/dianych.ua |
| Clothes | clothes | clothesTitle | orderEmbroidery | same |
| Panel | panel | panelTitle | orderEmbroidery | same |
| Felting | felting | feltingTitle | feltingDescription, orderFelting | same |
| Kits | kits | schemesKits | orderKits | same |

## Dependencies

`Gallery` only.

## Consumers

`app/page.tsx`.

## Tests

None.
