# Code Review Report
**Batch**: AZ-1574 prices, AZ-1575 upload/delete, AZ-1576 unauth mutations, AZ-1578 resilience | **Date**: 2026-08-27 | **Verdict**: PASS_WITH_WARNINGS

## Findings
| # | Severity | Category | File:Line | Title |
|---|----------|----------|-----------|-------|
| 1 | Low | Spec-Gap | scripts/run-tests.sh:375 | FT-N-07 omits manage form posts |

## Finding Details

**F1: FT-N-07 omits manage form posts** (Low / Spec-Gap)
- Location: `scripts/run-tests.sh` `ft_n_07`
- Description: AC asks for unauth upload/delete forms plus invalidate. The case asserts unauth prices POST, invalidate 401, and unchanged pack names. Upload/delete form POSTs are the same Next server-action surface as AZ-1575, which stays SKIP (`environment.md`: headed browser only).
- Suggestion: keep SKIP on FT-P-11 / FT-N-08–12 until a browser consumer exists; do not invent a `Next-Action` parser.
- Task: AZ-1576

## Phase notes

- Spec: AZ-1574 AC-1–4 all PASS (defaults, write/read, 401/400, SM-02).
- Spec: AZ-1575 AC-1–3 recorded as SKIP with reason (manage forms / Next server action). Matches `environment.md` consumer stack; Playwright not added.
- Spec: AZ-1578 AC-1–3 PASS — second container without `pw.txt` (13002), recreate drops old session and new login works, post-recreate login from `203.0.113.10` is 401.
- Quality: `wait_ready` / `pack_names` helpers; nopw container removed in `cleanup`.
- Security: no live admin secret; nopw SUT has no `pw.txt` mount.
- Architecture: shop source untouched.
