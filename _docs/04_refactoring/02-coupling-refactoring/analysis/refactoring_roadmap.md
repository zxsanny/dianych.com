# Refactoring roadmap — 02-coupling-refactoring

Hardening tracks selected: Technical Debt (A), Security Review (C).

## Weak points

| Location | Impact | Solution | Status |
|----------|--------|----------|--------|
| Empty FrameCard.tsx | dead file | C01 delete | Selected |
| Unused fonts.ts | dead file | C02 delete | Selected |
| Duplicated expandIfShort | auth drift risk | C03 share | Selected |
| Repeated gallery ids | shotgun + path safety | C04 + C07 | Selected |
| Duplicated default prices | AC drift | C05 share | Selected |
| diskCache empty catch | S25 | C06 comment/narrow | Selected |

## Gap analysis

ACs already met (47/47). This run is hygiene only. No missing product behavior.

## Phases

1. C01, C02 (delete)
2. C04 then C07 (catalog + security check)
3. C03, C05, C06 (helpers / debt)

## Applicability

All C01–C07: constraint fit documented in list-of-changes; status **Selected**. Rejected items stay in the deferred table.
