# Module: lib/defaultFramePrices

**Path:** `dianych-website/lib/defaultFramePrices.ts`

## Purpose

One SoT for AC-PRICE-01 default amounts (450 / 500 / 600 / 700).

## Public interface

- `FramePrices` — `{ smallFrame8, smallFrame10, mediumFrame14, largeFrame19 }`
- `DEFAULT_FRAME_PRICES` — those four numbers

Must match `expected_results/default_frame_prices.json`.

## Dependencies

None.

## Consumers

`app/components/Frames.tsx`, `app/manage/PricesManager.tsx`, `app/api/prices/route.ts`.

## Tests

FT-P-04.
