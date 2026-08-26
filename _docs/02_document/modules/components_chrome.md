# Module: components/chrome

**Paths:** `Header.tsx`, `TopBar.tsx`, `PageClientLayout.tsx`

## Purpose

Landing hero + sticky bar that appears after 400px scroll.

## Public interface

- `Header` — desktop/mobile hero, category anchors `#brooches` `#frames` `#felting` `#kits`, social icons, `#contact`
- `TopBar({ isVisible })` — fixed header, logo home link, same three socials, language switcher
- `PageClientLayout({ children })` — scroll listener → TopBar visibility

## Dependencies

`LanguageSwitcher`, `lib/translations`, `next/image`, `next/link`.

## Consumers

`app/page.tsx` wraps content in `PageClientLayout` and includes `Header`.

## Tests

None.
