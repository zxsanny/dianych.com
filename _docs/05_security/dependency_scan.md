# Dependency Scan

**Date**: 2026-08-28  
**Tool**: `npm audit` in `dianych-website/` (lockfile + `package.json`)  
**Manifests**: `dianych-website/package.json`, `dianych-website/package-lock.json`  
**Result**: 13 vulnerable packages (1 critical, 7 high, 5 moderate)

## Direct dependencies

| Package | Installed | Advisory | Severity | Fix |
|---------|-----------|----------|----------|-----|
| `next` | 15.5.2 | [GHSA-9qr9-h5gf-34mp](https://github.com/advisories/GHSA-9qr9-h5gf-34mp) React Flight RCE | Critical | `15.5.7` minimum; audit recommends `15.5.24` |
| `next` | 15.5.2 | Multiple: RSC DoS, server-action source exposure, middleware/proxy bypass, cache poisoning, SSRF, XSS ([npm audit](https://github.com/advisories?query=next)) | High / Moderate | Same bump to `15.5.24` |
| `sharp` | ^0.33.5 | [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) libvips CVE-2026-33327/33328/35590/35591 | High | `0.35.4` (major) |
| `jimp` | ^0.22.12 | [GHSA-5v7r-6r5c-r473](https://github.com/advisories/GHSA-5v7r-6r5c-r473) `file-type` ASF infinite loop | Moderate | `jimp@1.6.1` (major) |

`next` is pinned at `15.5.2` in `package.json` line 18. That release is inside the RCE range `>=15.5.0-canary.0 <15.5.7`.

## Transitive (selected)

| Package | Severity | Advisory | Reachability | Fix |
|---------|----------|----------|--------------|-----|
| `brace-expansion` | High | GHSA-mh99-v99m-4gvg / GHSA-rgw5-rvv9-x895 ReDoS/OOM | Build / eslint / glob | `npm audit fix` |
| `flatted` | High | GHSA-rf6f-7fwh-wjgh prototype pollution | Transitive parse | `npm audit fix` |
| `js-yaml` | High | GHSA-52cp-r559-cp3m / GHSA-5p4m-2wfm-xmqj YAML DoS | Transitive | `npm audit fix` |
| `nanoid` | High | GHSA-28wg-ghj8-5hjv infinite loop | Transitive | `npm audit fix` |
| `picomatch` | High | GHSA-c2c7-rcm5-vvqj ReDoS | Transitive glob | `npm audit fix` |
| `postcss` | High | GHSA-6g55-p6wh-862q / GHSA-r28c-9q8g-f849 path traversal via source maps | Next / build | Comes with `next@15.5.24` |
| `follow-redirects` | Moderate | GHSA-r4q5-vmmm-2653 header leak | Transitive | `npm audit fix` |

## Notes

- No Python/Rust/.NET/Go manifests.
- `jimp` is a fallback in `app/api/gallery-pack/cache.ts` after `import sharp`; the sharp import succeeds in production, so the jimp advisory is lower practical risk than `next` / `sharp`.
- `images.unoptimized: true` in `next.config.ts` reduces Image Optimizer DoS (GHSA-9g9p-9gw9-jx7f) exposure; it does **not** mitigate Flight-protocol RCE.

## Self-verification

- All manifests scanned.
- Every row has an advisory URL.
- Critical/High rows have an upgrade path.
