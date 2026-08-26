# Module: lib/translations

**Path:** `dianych-website/lib/translations.ts`

## Purpose

Static UA/EN copy for storefront chrome, gallery titles, frame sizes, and contact labels.

## Public interface

- `useTranslation()` — returns the string map for the current `useLanguage()` locale

## Internal logic

In-module `translations` object keyed by `'ua' | 'en'`. Same key set in both locales.

## Dependencies

`contexts/LanguageContext` (`useLanguage`).

## Consumers

`Header`, `TopBar`, `SectionLayout`, `Contact`, `GalleryCarousel`, `Frames`.

## Data models

Key set includes `petPortraits`, section titles, `order*` CTAs, frame size labels, `contactInfo`, `allContacts`, `dianychEmbroiders`.

## Configuration

None.

## External integrations

None.

## Security

None.

## Tests

None.
