# Deployment (from repo evidence)

## Container

- `dianych-website/Dockerfile`: deps → build → runner `node:20-bookworm-slim`, libvips, standalone + sharp, `USER node`, port 3000, `node server.js`
- `.dockerignore`: `node_modules`, `.next`, `.env*`, `pw.txt`, `*.md`

## Host

- `build.cmd`: build + push `docker.azaion.com/dianych` (Windows)
- `update.sh` / `restart.sh`: publish `3001:3000`, volume `/var/www/dianych/images` → `/app/public/images`, tmpfs `/tmp` 512m, `--read-only`, `--restart always`, new `SECRET_COOKIE_PASSWORD`
- `install.sh`: nginx `dianych.com` 443 → `localhost:3001`, HTTP→HTTPS, `/images/` alias `/root/dianych/images/` (does not match volume path)

## Observability

No metrics/tracing. Logs = container stdout.

## CI

None in repo.
