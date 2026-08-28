# Module: app/api/prices

**Path:** `dianych-website/app/api/prices/route.ts`

## Purpose

Public GET and authenticated POST for four frame prices stored as JSON.

## Public interface

- `GET /api/prices` — `{ smallFrame8, smallFrame10, mediumFrame14, largeFrame19 }` (unauthenticated)
- `POST /api/prices` — JSON body same keys; requires `session.isLoggedIn`; 401/400/500

## Internal logic

`DATA_FILE = path.join(process.cwd(), 'dianych-website', 'data', 'framePrices.json')`. With app cwd `dianych-website/`, this is the nested file `dianych-website/dianych-website/data/framePrices.json`, not `dianych-website/data/framePrices.json`. Missing file → `DEFAULT_FRAME_PRICES` and best-effort write. POST rejects non-finite or negative numbers.

## Dependencies

`lib/session`, `lib/defaultFramePrices`, `iron-session`, Next cookies, Node `fs`/`path`.

## Consumers

`app/components/Frames.tsx` (GET), `app/manage/PricesManager.tsx` (GET+POST).

## Data models

`FramePrices` four numeric fields (UAH amounts in UI copy, not labeled in JSON).

## Configuration

Hardcoded path; defaults from `DEFAULT_FRAME_PRICES`.

## External integrations

None.

## Security

GET is public. POST is session-gated. No CSRF token beyond SameSite cookie defaults.

## Tests

None.
