# Infrastructure Topology

## Push targets

| Remote | URL | Role | Transport | Host kind | Notes |
|--------|-----|------|-----------|-----------|-------|
| origin | `git@github.com:zxsanny/dianych.com.git` | primary | SSH | github | Confirmed canonical. HTTPS token skipped (SSH keys configured). |

## Hosts

| Host | Kind | Roles | Evidence |
|------|------|-------|----------|
| (unconfirmed) | production | nginx TLS terminator + docker runtime | `install.sh`, `restart.sh`, `update.sh` |
| docker.azaion.com | image registry | build/push/pull | `build.cmd`, `update.sh` |

## Runtime (from scripts)

| Item | Value | Evidence |
|------|-------|----------|
| Public hostname | dianych.com | `install.sh`, `next.config.ts` remotePatterns |
| Container name | dianych.com | `restart.sh`, `update.sh` |
| Image | `docker.azaion.com/dianych` | `build.cmd`, `update.sh` |
| Host publish | `3001:3000` | `restart.sh` |
| Images volume | `/var/www/dianych/images` → `/app/public/images` | `restart.sh` (conflicts with `install.sh` nginx alias `/root/dianych/images/`) |
| Session secret | `SECRET_COOKIE_PASSWORD` (generated per `docker run`) | `restart.sh`, `update.sh` |
