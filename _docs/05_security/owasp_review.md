# OWASP Top 10 Review

**Date**: 2026-08-28  
**Standard**: [OWASP Top 10:2025](https://owasp.org/Top10/2025/) (confirmed current at audit start)  
**Project requirements**: `_docs/00_problem/security_approach.md`

| # | Category | Status | Evidence |
|---|----------|--------|----------|
| A01 | Broken Access Control | FAIL | Mutations are session-checked. Middleware `/manage` can be skipped by Next advisories in 15.5.2 (GHSA-267c-6grr-h53f family). Login redirect host is header-controlled (`app/api/login/route.ts:10–13`). Public GETs for prices/images match documented intent. |
| A02 | Security Misconfiguration | FAIL | No CSP / `X-Frame-Options` / `X-Content-Type-Options` / `Referrer-Policy` in `next.config.ts` or nginx snippet. `client_max_body_size 300M` (`install.sh:7`). Next 15.5.2 ships with known default-protocol bugs. |
| A03 | Software Supply Chain Failures | FAIL | `npm audit`: Next 15.5.2 Critical RCE; sharp High; 13 vulns total. No CI dependency gate in-repo. |
| A04 | Cryptographic Failures | PASS | bcrypt for the admin password; iron-session for the cookie; TLS at nginx. Cookie `secure` in production. No plaintext password store. Cost 10 is acceptable, not a FAIL. |
| A05 | Injection | FAIL | No SQL/OS injection. SVG upload + static `/images/` is stored XSS (`app/actions.ts:29–31`, `install.sh:17–21`). Framework Flight RCE is unsafe deserialization (also A08). |
| A06 | Insecure Design | FAIL | Shared single password is accepted design. Rate limit is in-process and keyed on a spoofable IP (`app/api/login/route.ts:16–34`). No upload/image-generation rate limit. No CSRF token (relies on SameSite default). Documented in `security_approach.md` gaps. |
| A07 | Authentication Failures | FAIL | Brute-force control is bypassable via `X-Forwarded-For` (`app/api/login/route.ts:32` + `install.sh:13`). No lockout that survives restart. No MFA (accepted). Session secret rotated every `docker run` (`restart.sh:17`) — availability, not a bypass. |
| A08 | Software or Data Integrity Failures | FAIL | Unauthenticated RCE in React Flight / Next 15.5.2 (GHSA-9qr9-h5gf-34mp). No in-repo CI signing or deploy attestation. |
| A09 | Security Logging and Alerting Failures | FAIL | Failed logins return 401 with no audit trail beyond optional `console.error` on exceptions. Empty `catch {}` on cache paths (`app/actions.ts:89`, `132`; `app/api/image/route.ts:105`). No alerting. |
| A10 | Mishandling of Exceptional Conditions | FAIL | Client-visible exception strings (`app/api/image/route.ts:110–112`, `app/actions.ts:137`). Unbounded work on public image/pack routes can exhaust CPU/tmp (`app/api/image/route.ts`, `gallery-pack`). sharp CVEs on uploaded bytes. |

N/A: none — this is a public HTTPS web app.

## vs `security_approach.md`

Documented controls (bcrypt, iron-session, `/manage` matcher, mutation checks, gallery allow-list, filename sanitize, magic bytes, `resolve` prefix, cookie `secure`, non-root read-only container) are present in code.

Documented gaps (CSRF, in-process rate limit, public GETs, forwarded-host redirect) are confirmed. This audit adds: unpatched Next RCE, spoofable rate-limit IP given current nginx, SVG XSS, sharp CVEs, missing security headers, error leakage.
