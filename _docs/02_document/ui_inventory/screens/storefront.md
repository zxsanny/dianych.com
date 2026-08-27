---
id: storefront
route: /
nav_parent: null
auth: public
copy_locale: uk
title: DIANYCH - Pet Portraits
regions:
  - id: header
    kind: chrome
  - id: hero
    kind: main
  - id: galleries
    kind: main
  - id: lightbox
    kind: modal
states:
  default:
    observed: true
  empty:
    observed: false
    omitted: "all five gallery folders had images in this environment"
  error:
    observed: false
    omitted: "no in-app form on the public page; order CTAs leave to Instagram (not followed)"
  loading:
    observed: false
    omitted: "no distinct loading UI after first paint; thumbs already present"
  denied:
    observed: false
    omitted: "public page; no role wall"
---

## Purpose

Public marketing landing: hero, four header tiles, five gallery sections, frames prices, contact links.

## Regions

- **header:** logo «DIANYCH» + «Портрети домашніх улюбленців»; Instagram/TikTok/Telegram; language UA/EN
- **hero:** author cutout; 2×2 tiles Вишивка / Рамки / Валяння / Схеми / набори; «Показати Всі Контакти»
- **galleries:** `#brooches` `#clothes` `#panel` `#frames` `#felting` `#kits` `#contact` (clothes/panel have headings, no header tiles)
- **lightbox:** full-size image, Previous/Next image, Close modal

## Controls

| Name | Type | Label (uk) | Action / destination |
|------|------|------------|----------------------|
| logo | link | DIANYCH | `/` |
| tile embroidery | link | Вишивка | `#brooches` |
| tile frames | link | Рамки | `#frames` |
| tile felting | link | Валяння | `#felting` |
| tile kits | link | Схеми / набори | `#kits` |
| show contacts | link | Показати Всі Контакти | `#contact` |
| language | button | UA / EN | locale only; `html lang` stays en |
| carousel prev/next | button | Previous slide / Next slide | embla |
| order embroidery | link | Замовити вишивку | instagram.com/dianych.ua |
| order frame | link | Замовити рамку | instagram.com/povne.kolo |
| order felting | link | Замовити фелтінг | instagram.com/dianych.ua |
| order kits | link | Замовити cхеми | instagram.com/dianych.ua |
| lightbox close | button | Close modal | dismiss |
| lightbox prev/next | button | Previous image / Next image | modal index |

## Copy

- DIANYCH
- Портрети домашніх улюбленців
- Вишивка / Рамки / Валяння / Схеми / набори
- Показати Всі Контакти
- Вишивка: Брошки / Шеврони
- Вишивка на одязі
- Панно
- Рамки — Маленька рама 8см / 10см; Середня рама 14см; Велика рама 19см
- Фелтінг (Вовна) — Портрет улюбленця, валяний з вовни. Доступний у 2D та 3D форматах.
- Схеми / набори
- Контактна інформація
- Замовити вишивку / Замовити рамку / Замовити фелтінг / Замовити cхеми
- EN: Pet Portraits, Embroidery, Frames, Felting, Schemes / Kits, Show All Contacts, Order Embroidery, Contacts

## Tokens

- colors.primary, colors.cream, typography.h1, typography.body-md, rounded.md, button-primary

## Scenarios

- default: opened `/` — cream hero, 2×2 tiles, UA
- hash `#brooches`: scrolled to «Вишивка: Брошки / Шеврони» carousel + Замовити вишивку
- primary modal: clicked first brooch thumb — lightbox, Close modal, Previous/Next image; closed via Close modal
- language: UA menu → EN (copy switched) → back to UA
- empty / error / loading / denied: see `states.omitted`

## Evidence

`evidence/storefront-default.png`
