# Module: ops-scripts

**Paths:** `Dockerfile`, `build.cmd`, `install.sh`, `restart.sh`, `update.sh`, `.dockerignore`

## Purpose

Build a standalone Next image, publish to `docker.azaion.com/dianych`, terminate TLS in nginx, run the container on host port 3001.

## Public interface

| Script | Action |
|--------|--------|
| `build.cmd` | `docker build` in `dianych-website/` + login + push (Windows) |
| `install.sh` | nginx vhost `dianych.com` 443→`localhost:3001`, `/images/` alias `/root/dianych/images/`, certbot |
| `restart.sh` | stop/rm, `chown 1000` `/var/www/dianych/images`, run read-only + tmpfs + new `SECRET_COOKIE_PASSWORD` |
| `update.sh` | pull `:latest` then same run flags as restart |
| `Dockerfile` | node:20-bookworm-slim; npm ci; `npm run build`; copy standalone + sharp; `USER node`; `EXPOSE 3000`; `CMD node server.js` |

## Internal logic

Image volume: host `/var/www/dianych/images` → `/app/public/images`. Container `--read-only` except that mount and `/tmp`.

## Dependencies

Docker daemon, registry `docker.azaion.com`, host nginx/certbot (install).

## Consumers

Operator / host. No in-app import.

## Configuration

Ports and paths hardcoded. Session secret regenerated every recreate.

## Security

Read-only rootfs, noexec volume/tmpfs, non-root `node`. `SECRET_COOKIE_PASSWORD` rotation drops sessions. nginx `client_max_body_size 300M` vs app 20mb action limit.

## Tests

None.
