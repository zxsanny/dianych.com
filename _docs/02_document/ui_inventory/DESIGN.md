---
version: "alpha"
name: DIANYCH
description: Visual identity sampled from the live UI (not a redesign).
colors:
  primary: "#A52A2A"
  secondary: "#EDEDED"
  tertiary: "#E11D48"
  cream: "#F5EDE4"
  neutral: "#FFFFFF"
  on-primary: "#FFFFFF"
  ink: "#0A0A0A"
typography:
  h1:
    fontFamily: vinnytsiaSerif
    fontSize: 1.5rem
    fontWeight: 700
  body-md:
    fontFamily: vinnytsiaSerif
    fontSize: 1rem
    fontWeight: 400
rounded:
  sm: 8px
  md: 12px
  full: 9999px
spacing:
  sm: 8px
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
  tile:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.md}"
  language-chip:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: 8px
---

## Overview

Public storefront is a cream hero with a maroon serif wordmark and a 2×2 photo-tile grid; galleries below use white cards, maroon headings, and a maroon order pill. Login is a small white card on gray with the same maroon heading/button and no storefront chrome.

## Colors

- **Primary:** `#A52A2A` — H1 «DIANYCH» and login heading/button
- **Secondary:** `#EDEDED` — body text on dark computed layers
- **Tertiary:** `#E11D48` — order / hover pink-red
- **Neutral:** `#FFFFFF` — cards, login panel

## Typography

vinnytsiaSerif on storefront body and H1 (24px / 700). Login heading used system-ui 24px / 500 on the 404 sample; login card heading is maroon serif in the painted UI.

## Layout

Full-bleed hero (author photo left, brand + tiles right). Header overlays with translucent cream. Sections are centered carousels. Login is a single centered card, no sidebar.

## Components

Primary CTA is a full-width or pill maroon button (Login / Замовити …). Tiles are rounded squares with captions. Language is a globe + UA/EN chip. Lightbox is a dim overlay with circular prev/next and Close modal.
