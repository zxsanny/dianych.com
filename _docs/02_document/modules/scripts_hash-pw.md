# Module: scripts/hash-pw

**Path:** `dianych-website/scripts/hash-pw.js`

## Purpose

CLI to bcrypt-hash an admin password and write it to `pw.txt` (same expansion rule as login).

## Public interface

- `npm run hash-pw -- <password>` or interactive prompt (`Enter password to hash (visible input)`)
- Writes `<cwd>/pw.txt` with hash + newline

## Internal logic

`expandIfShort`: passwords shorter than 32 chars become `{pass}.{pass}.{pass}` before hash. Salt rounds = 10.

## Dependencies

Node `fs`, `path`, `readline`; `bcryptjs`.

## Consumers

Operator only. Login reads the file this script writes.

## Data models

None.

## Configuration

`PW_FILE = path.join(process.cwd(), 'pw.txt')`. Must be run with cwd = `dianych-website/`.

## External integrations

None.

## Security

Prompt echoes the password. File is dockerignored and matched by root `.gitignore` `pw.txt`. Hash only is stored.

## Tests

None.
