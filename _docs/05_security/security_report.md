# Security Audit Report

**Date**: 2026-08-28  
**Scope**: dianych.com / `dianych-website` (project mode)  
**Standard**: OWASP Top 10:2025  
**Verdict**: FAIL

App-level controls (bcrypt, session on mutations, gallery allow-list, path prefix checks, non-root read-only container, TLS at nginx) are real. They are not enough: Next.js 15.5.2 is remotely exploitable, and login abuse controls are bypassable with the current proxy headers.

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 3 |
| Medium   | 4 |
| Low      | 3 |

## OWASP Top 10 Assessment

| Category | Status | Findings |
|----------|--------|----------|
| A01 Broken Access Control | FAIL | F2, F5 |
| A02 Security Misconfiguration | FAIL | F2, F7 |
| A03 Software Supply Chain Failures | FAIL | F1, F2, F3 |
| A04 Cryptographic Failures | PASS | — |
| A05 Injection | FAIL | F1, F6 |
| A06 Insecure Design | FAIL | F4, F8 |
| A07 Authentication Failures | FAIL | F4 |
| A08 Software or Data Integrity Failures | FAIL | F1 |
| A09 Security Logging and Alerting Failures | FAIL | F11 |
| A10 Mishandling of Exceptional Conditions | FAIL | F3, F8, F9 |

## Findings

| # | Severity | Category | Location | Title |
|---|----------|----------|----------|-------|
| 1 | Critical | A03 / A08 | `dianych-website/package.json:18` | Next.js 15.5.2 unauthenticated RCE (React Flight) |
| 2 | High | A01 / A02 / A03 | `package.json:18` | Next.js 15.5.2 remaining DoS / middleware / RSC advisories |
| 3 | High | A03 / A10 | `package.json:17`, `app/api/image/route.ts:49` | sharp/libvips CVEs on user-uploaded images |
| 4 | High | A06 / A07 | `app/api/login/route.ts:32`, `install.sh:13` | Login rate limit bypass via `X-Forwarded-For` |
| 5 | Medium | A01 | `app/api/login/route.ts:10–13,61–62` | Login redirect host taken from `X-Forwarded-Host` |
| 6 | Medium | A05 | `app/actions.ts:16,29–31`, `install.sh:17–21` | SVG upload served as static `/images/` (stored XSS) |
| 7 | Medium | A02 | `next.config.ts`, `install.sh` | No CSP / clickjacking / nosniff headers |
| 8 | Medium | A06 / A10 | `next.config.ts:7`, `app/api/image/route.ts`, `app/actions.ts` | No rate limit on upload or public image generation |
| 9 | Low | A10 | `app/api/image/route.ts:110–112`, `app/actions.ts:137` | Exception text returned to clients |
| 10 | Low | A07 | `scripts/hash-pw.js:8,19` | bcrypt cost 10; password prompt is visible |
| 11 | Low | A09 | `app/actions.ts:89,132`, `app/api/image/route.ts:105` | Empty catches; no failed-login audit |

### Finding Details

**F1: Next.js 15.5.2 unauthenticated RCE (React Flight)** (Critical / A03 / A08)

- Location: `dianych-website/package.json:18` (`next`: `15.5.2`)
- Description: Installed Next is in range `>=15.5.0-canary.0 <15.5.7` for [GHSA-9qr9-h5gf-34mp](https://github.com/advisories/GHSA-9qr9-h5gf-34mp) (React Server Components Flight protocol unsafe deserialization). CVSS 10.0. Self-hosted `output: 'standalone'` (`next.config.ts:4`) is the affected deployment mode.
- Impact: Unauthenticated remote code execution on the Node process (read `pw.txt`, session secret, rewrite images, pivot to the host).
- Remediation: Upgrade `next` and `eslint-config-next` to **15.5.24** (or at least 15.5.7), rebuild and redeploy. Do not leave 15.5.2 on the public internet.

**F2: Next.js 15.5.2 remaining advisories** (High / A01 / A02 / A03)

- Location: same pin
- Description: `npm audit` also lists RSC DoS, server-action source exposure, middleware/proxy bypass, cache poisoning, SSRF, and XSS advisories fixed only in later 15.5.x. Middleware is the only `/manage` page gate (`middleware.ts:7–22`).
- Impact: DoS; possible `/manage` UI without a cookie (mutations still check session); source leakage of server actions.
- Remediation: Same version bump as F1. After upgrade, re-run `npm audit`.

**F3: sharp/libvips CVEs on uploads** (High / A03 / A10)

- Location: `package.json:17`; processing at `app/api/image/route.ts:49` and `app/api/gallery-pack/cache.ts:94`
- Description: [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) — sharp `<0.35.0` inherits libvips CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591. Anyone can hit `/api/image` or `/api/gallery-pack` on files under `public/images/`.
- Impact: Process crash or memory corruption from a crafted image (authenticated upload, or any file already on the volume).
- Remediation: Upgrade `sharp` to `0.35.4` and rebuild the image (Dockerfile already installs `libvips`). Re-test gallery pack + single-image routes.

**F4: Login rate limit bypass** (High / A06 / A07)

- Location: `app/api/login/route.ts:32`; `install.sh:13`
- Description: Limit is 5 / 15 min / IP in an in-process `Map`. IP is the first `X-Forwarded-For` hop. nginx sets `X-Forwarded-For $proxy_add_x_forwarded_for`, which prepends a client-supplied value.
- Impact: Unlimited password guesses; lockout of a fake IP does not slow a real attacker.
- Remediation: Key on `x-real-ip` (already set to `$remote_addr`) or the last trusted hop. In nginx, `proxy_set_header X-Forwarded-For $remote_addr;` (overwrite). Optionally fail2ban / nginx `limit_req` on `/api/login`.

**F5: Login redirect host from `X-Forwarded-Host`** (Medium / A01)

- Location: `app/api/login/route.ts:10–13,61–62`
- Description: Success is `302` to `${x-forwarded-proto}://${x-forwarded-host}/manage`. nginx does not set `X-Forwarded-Host`, so a client header wins. Path is fixed to `/manage`.
- Impact: Open redirect after a valid login; session cookie may be issued on a response the browser follows to an attacker host if cookie Domain is loose.
- Remediation: Redirect to a relative `/manage`, or allow-list the host (`dianych.com`). Ignore `X-Forwarded-Host` unless nginx overwrites it.

**F6: SVG upload → stored XSS** (Medium / A05)

- Location: `app/actions.ts:16,29–31`; `install.sh:17–21`
- Description: `.svg` is an allowed extension. Content check is substring `<svg` or `<?xml`. nginx aliases `/images/` to files on disk. `getImagePaths` lists every filename (`lib/galleryUtils.ts:13`).
- Impact: Script in an SVG runs if a user opens `https://dianych.com/images/<gallery>/<file>.svg`. Same-origin XSS can drive manage actions while an admin session is open.
- Remediation: Drop SVG from the upload allow-list (flags already live under `/images/flags/`). Or serve user images with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.

**F7: Missing security headers** (Medium / A02)

- Location: `dianych-website/next.config.ts` (no `headers()`); `install.sh` server block
- Description: No CSP, `X-Frame-Options` / `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`. HSTS depends on certbot defaults.
- Impact: Easier XSS impact, clickjacking of `/manage` or `/login`.
- Remediation: Add nginx `add_header` (or Next `headers()`) for those four; CSP at least `default-src 'self'` plus what the storefront needs.

**F8: No rate limit on upload or public image work** (Medium / A06 / A10)

- Location: `next.config.ts:7` (20mb actions); `app/actions.ts:42–84`; public `GET` handlers
- Description: Documented gap. nginx allows 300MB bodies. Pack/image routes do CPU-heavy `sharp` work per request.
- Impact: Authenticated disk fill; unauthenticated CPU / `/tmp` pressure (disk cache cap is 500MB in `lib/diskCache.ts:4`).
- Remediation: nginx `limit_req` on `/api/login`, `/api/image`, `/api/gallery-pack`; cap upload count/size in `uploadImages`.

**F9: Exception text to clients** (Low / A10)

- Location: `app/api/image/route.ts:110–112`; `app/api/gallery-pack/route.ts:63–65`; `app/actions.ts:137`
- Description: `error.message` / stringified error returned in JSON or form state.
- Impact: Path and library details aid further attacks.
- Remediation: Log server-side; return a generic error to the client.

**F10: Password hashing ops hygiene** (Low / A07)

- Location: `scripts/hash-pw.js:8,19`
- Description: bcrypt cost 10; interactive prompt is visible. Hash itself is written to gitignored `pw.txt`.
- Impact: Faster offline guess if `pw.txt` leaks; shoulder-surfing when rotating the password.
- Remediation: Cost 12+; use a hidden prompt (`readline` + `stdout.write` muted, or `read -s`).

**F11: Weak security logging** (Low / A09)

- Location: empty `catch` at `app/actions.ts:89,132`, `app/api/image/route.ts:105`; no success/fail login metric
- Description: Failed logins are not logged. Cache failures are swallowed.
- Impact: Brute force and cache sabotage leave no trail.
- Remediation: Log login failure with the trusted IP (no password). Do not swallow cache errors silently.

## Dependency Vulnerabilities

| Package | CVE / advisory | Severity | Fix Version |
|---------|----------------|----------|-------------|
| next | GHSA-9qr9-h5gf-34mp | Critical | 15.5.7+ (use 15.5.24) |
| next | GHSA-mwv6-3258-q52c and related 15.5.x list | High / Moderate | 15.5.24 |
| sharp | GHSA-f88m-g3jw-g9cj (CVE-2026-33327/33328/35590/35591) | High | 0.35.4 |
| jimp / file-type | GHSA-5v7r-6r5c-r473 | Moderate | jimp 1.6.1 |
| postcss (via next) | GHSA-6g55-p6wh-862q | High | arrives with next 15.5.24 |
| brace-expansion, flatted, js-yaml, nanoid, picomatch | see `dependency_scan.md` | High | `npm audit fix` |

## Recommendations

### Immediate (Critical/High)

1. Upgrade Next to 15.5.24 and redeploy — do this before any feature work.
2. Upgrade sharp to 0.35.4 and rebuild the container.
3. Fix login IP: trust `X-Real-IP` / overwrite `X-Forwarded-For` in nginx.

### Short-term (Medium)

4. Relative `/manage` redirect; stop reading `X-Forwarded-Host`.
5. Disallow SVG uploads.
6. Add security headers on nginx.
7. Rate-limit login, image, and pack routes.

### Long-term (Low / Hardening)

8. Generic client errors; login failure logs; bcrypt cost 12.
9. CI `npm audit` gate; pin base-image digest; container `HEALTHCHECK`.
10. This audit is static only — DAST / an authenticated manage walkthrough is still open.

## What is already in good shape

Folder allow-list and `resolve` prefix on upload/delete; magic-byte check for raster types; session check on every mutation; bcrypt + iron-session; `pw.txt` not in git or the image; non-root, read-only, `noexec` mounts; HTTPS redirect.
