# S31 embedded HTML inventory

**Scan method**: ripgrep `<!DOCTYPE|<html|text/html` on first-party TS/JS.

| file | line | kind | served_as | change_id / deferral |
|------|------|------|-----------|----------------------|
| `app/layout.tsx` | 18 | JSX root | Next App Router document | not a hit — SFC, not string HTML |

No handler returns `text/html` string soup. Manage/storefront UI is React.
