# Problem

## What

Diana (Dianych) sells custom pet portraits (embroidery, felting, frames, kits). Buyers need to see the work and frame prices; Diana needs to add photos and change prices without a developer. Orders happen on Instagram / social shops, not on this site.

## Who

- **Visitor** — public shopper on dianych.com (no account).
- **Admin / Diana** — single-password operator of `/manage`.
- **Operator** — host/Docker person (may be the same person).

## Why

A static brochure cannot stay current. A full shop/CMS is unnecessary: there is no cart, no accounts, no payments.

## What it does

- Public landing: five galleries, frames catalog, contact/order links, UA/EN copy.
- Admin: upload/delete gallery images; edit four frame prices.
- Production: one container at dianych.com behind nginx/TLS; gallery bytes on a host volume.

## What it does not do

- In-app checkout, inventory, or customer accounts.
- Inbound webhooks or third-party shop APIs.
- Multi-user roles or a database.
- Automated CI/CD (manual `build.cmd` / `update.sh`).
