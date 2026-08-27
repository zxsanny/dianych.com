# Restrictions

Derived from repo evidence (`package.json`, Dockerfile, ops scripts, Next config). Nothing invented.

## Hardware

| Restriction | Evidence |
|-------------|----------|
| Single host; one container | `restart.sh`, `update.sh` |
| Published port `3001` → container `3000` | `restart.sh` |
| Gallery volume `/var/www/dianych/images` → `/app/public/images` | `restart.sh` |
| `/tmp` tmpfs 512m | `restart.sh` |
| Thumb cache cap 500 MB | `lib/diskCache.ts` `MAX_CACHE_BYTES` |

## Software

| Restriction | Evidence |
|-------------|----------|
| TypeScript 5, Next.js 15.5.2 App Router, React 19 | `package.json` |
| Tailwind 4 | `package.json` |
| iron-session 8.0.4, bcryptjs 3.0.2, sharp 0.33.5 | `package.json` |
| Node 20 bookworm-slim standalone | `Dockerfile` |
| No database / ORM | no deps |
| No test runner | no `*.test.*` / test script |
| `jimp` listed but unused | `package.json` vs imports |

## Environment

| Restriction | Evidence |
|-------------|----------|
| Local: `next dev` port 3000 | Next default |
| Production hostname `dianych.com` | `install.sh`, `next.config.ts` |
| Registry `docker.azaion.com/dianych` | `build.cmd` |
| `SECRET_COOKIE_PASSWORD` required at runtime | `lib/session.ts` |
| `pw.txt` in process cwd (dockerignored) | login route, `.dockerignore` |
| No staging environment in repo | discovery |

## Operational

| Restriction | Evidence |
|-------------|----------|
| No CI in repo | no `.github/` / `.woodpecker/` / compose |
| Manual Windows build+push | `build.cmd` |
| Container `--read-only` except images + `/tmp` | `restart.sh` |
| New session secret on every recreate | `restart.sh`, `update.sh` |
| Logs = container stdout only | no metrics/tracing |
| nginx `/images/` alias `/root/dianych/images/` ≠ volume path | `install.sh` vs `restart.sh` |
| Server Actions body 20mb; nginx client max 300M | `next.config.ts`, `install.sh` |

## Regulatory / budget / timeline

None evidenced in code or config.
