# Module: app/manage

**Paths:** `page.tsx`, `ManagePageClient.tsx`, `GalleryManager.tsx`, `PricesManager.tsx`, `RemoveButton.tsx`

## Purpose

Authenticated CMS: pick a gallery folder or frame prices; upload/delete images; edit four prices.

## Public interface

- `page.tsx` — title «Менеджмент секцій» + LogoutButton + client shell
- Folders: brooches, clothes, panel, felting, kits, plus virtual `prices`
- `GalleryManager` — `useActionState(uploadImages/deleteImage)`, `getGalleryImages`
- `PricesManager` — GET/POST `/api/prices`, digit-only inputs
- `RemoveButton` — hidden `imagePath`, pending spinner

## Dependencies

`app/actions`, `LogoutButton`, `next/image`, `react-dom` form status.

## Consumers

Route `/manage` (middleware-gated).

## Security

Page gated by middleware; mutations gated in actions/API. UI copy is UA-only (not using `useTranslation`).

## Tests

None.
