# Module: lib/expandIfShort

**Paths:** `dianych-website/lib/expandIfShort.js`, `expandIfShort.d.ts`

## Purpose

One expansion rule for bcrypt hash and compare (AC-AUTH-02/05).

## Public interface

- `expandIfShort(pass)` — empty/falsy unchanged; length ≥ 32 unchanged; else `{pass}.{pass}.{pass}`

`.js` so `scripts/hash-pw.js` can import without a TS build.

## Internal logic

None beyond the length check.

## Dependencies

None.

## Consumers

`app/api/login/route.ts`, `scripts/hash-pw.js`.

## Security

Formula must stay identical for hash and compare. Do not change the expansion.

## Tests

FT-N-01–03, FT-P-07.
