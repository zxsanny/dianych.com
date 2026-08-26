# Module: contexts/LanguageContext

**Path:** `dianych-website/contexts/LanguageContext.tsx`

## Purpose

Client-side UA/EN language toggle. Default `'ua'`. Not persisted.

## Public interface

- `LanguageProvider({ children })` — React context provider
- `useLanguage()` — `{ language: 'ua' | 'en'; setLanguage }` — throws if used outside provider

## Internal logic

`useState<Language>('ua')`. No `localStorage` / cookie.

## Dependencies

React (`createContext`, `useState`, `useContext`).

## Consumers

- `app/layout.tsx` (provider)
- `lib/translations.ts`
- `app/components/LanguageSwitcher.tsx`

## Data models

`Language = 'ua' | 'en'`.

## Configuration

None.

## External integrations

None.

## Security

None (UI locale only).

## Tests

None.
