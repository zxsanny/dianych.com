# Configuration & Infrastructure Review

**Date**: 2026-08-28  
**Artifacts**: `dianych-website/Dockerfile`, `restart.sh`, `install.sh`, `docker-compose.test.yml`, `dianych-website/next.config.ts`, `.gitignore`, `dianych-website/.dockerignore`

## Containers

| Check | Result |
|-------|--------|
| Non-root user | PASS — `USER node` (`Dockerfile:39`); no `--user` override in `restart.sh` |
| Minimal base | PASS — `node:20-bookworm-slim` (tag, not digest) |
| Secrets in build | PASS — `.dockerignore` excludes `pw.txt` and `.env*` |
| Read-only root | PASS — `restart.sh:16` `--read-only`; `/tmp` tmpfs `noexec,nosuid` |
| Volume flags | PASS — images mount `noexec,nosuid` (`restart.sh:14`) |
| Health check | FAIL — no `HEALTHCHECK` in Dockerfile |
| `pw.txt` at runtime | WARN — test compose mounts it (`docker-compose.test.yml:12`); `restart.sh` does not. Not a leak; login fails if the file is missing |

## CI/CD

No `.woodpecker/`, `.github/workflows/`, or `_docs/04_deploy/ci_cd_pipeline.md` in this tree. Image name `docker.azaion.com/dianych` (`restart.sh:18`) implies an external registry; nothing in-repo scans advisories, signs artifacts, or injects secrets.

| Check | Result |
|-------|--------|
| Secrets in pipeline files | N/A — no pipeline files |
| Dependency audit in CI | FAIL — none |
| Artifact signing | N/A / missing |

## Env / secrets

- `SECRET_COOKIE_PASSWORD` generated per `docker run` (`restart.sh:17`) — good entropy; all sessions die on restart (documented).
- `pw.txt` gitignored and dockerignored.
- Test compose passes `SECRET_COOKIE_PASSWORD` from the host environment.

## Network / HTTP

| Check | Result |
|-------|--------|
| TLS | PASS — certbot on nginx (`install.sh:35`); HTTP→HTTPS redirect (`install.sh:30`) |
| Proxy headers | FAIL — `X-Forwarded-For $proxy_add_x_forwarded_for` preserves client-supplied first hop (`install.sh:13`). `X-Forwarded-Host` not set, so client value is forwarded. `X-Real-IP $remote_addr` is correct but unused by login. |
| Body size | WARN — nginx `client_max_body_size 300M` vs Next server action limit `20mb` (`next.config.ts:7`) |
| Security headers | FAIL — none in Next or the nginx snippet (no CSP, frame deny, nosniff, HSTS is certbot-dependent) |
| CORS | PASS — no `Access-Control-Allow-Origin: *` in app code |
| Image optimizer | PASS — `images.unoptimized: true` (`next.config.ts:11`) |

## Self-verification

Docker/nginx/env reviewed. Missing CI noted, not invented.
