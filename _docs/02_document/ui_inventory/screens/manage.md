---
id: manage
route: /manage
nav_parent: login
auth: required
copy_locale: uk
title: Менеджмент секцій
regions:
  - id: header
    kind: chrome
  - id: sidebar
    kind: chrome
  - id: main
    kind: main
states:
  default:
    observed: true
  empty:
    observed: false
    omitted: "gallery sections had images in this environment; empty copy exists in UI but was not shown"
  error:
    observed: true
  loading:
    observed: false
    omitted: "no distinct loading UI held after navigate; prices/galleries painted immediately"
  denied:
    observed: true
---

## Purpose

Authenticated CMS: pick a gallery section or frame prices, upload images, delete (hover), save prices, logout.

## Regions

- **header:** H1 «Менеджмент секцій»; Logout (top right)
- **sidebar:** «Секції» — six buttons
- **main:** empty prompt, or GalleryManager / PricesManager

## Controls

| Name | Type | Label (uk) | Action / destination |
|------|------|------------|----------------------|
| logout | button | Logout | POST `/api/logout` → `/login` |
| brooches | button | Вишивка: Брошки / Шеврони | main = gallery form |
| clothes | button | Вишивка на одязі | same template |
| panel | button | Панно | same template |
| felting | button | Фелтінг | same template |
| kits | button | Схеми/Набори | same template |
| prices | button | Ціни рамок | PricesManager |
| files | file | Оберіть картинки | required; not submitted this run |
| upload | button | Завантажити картинки | server action; empty → native required |
| delete | button | Видалити зображення | hover overlay; not clicked (destructive, no confirm) |
| price inputs | number | Мала/Середня/Велика рамка … | four fields |
| save prices | button | Зберегти | POST `/api/prices` |

## Copy

- Менеджмент секцій
- Секції
- Оберіть секцію зліва, щоб почати.
- Додати до: {folderName}
- Оберіть картинки
- Завантажити картинки / Завантаження...
- Керування: {folderName}
- Завантаження картинок...
- У цій секції ще немає картинок. (not shown this run)
- Керування цінами рамок
- Оновіть ціни і натисніть Зберегти.
- Мала рамка 8 см / 10 см; Середня рамка 14 см; Велика рамка 19 см
- Завантаження...
- Зберегти / Збереження...
- Ціни успішно збережено.
- Logout

## Tokens

- colors.primary, colors.tertiary, typography.h1, button-primary, rounded.md

## Scenarios

- denied (earlier): GET `/manage` without cookie → `/login`
- default: after login — sidebar + «Оберіть секцію зліва, щоб почати.»
- every section: opened all six sidebar items
- error: Завантажити картинки with no files — native `required` on file input
- create/save: Зберегти on prices with current numbers → «Ціни успішно збережено.»
- delete hover: not submitted
- file upload with a file: skipped (no disk file picked)

## Evidence

`evidence/manage-default.png`, `evidence/manage-prices-save.png`, per-section PNGs
