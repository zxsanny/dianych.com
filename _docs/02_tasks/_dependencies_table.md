# Dependencies Table

**Date**: 2026-08-27
**Total Tasks**: 10
**Total Complexity Points**: 34
**Epic**: [AZ-1569](https://denyspopov.atlassian.net/browse/AZ-1569)

| Task | Name | Complexity | Dependencies | Epic |
|------|------|-----------|-------------|------|
| AZ-1570 | test_infrastructure | 3 | None | AZ-1569 |
| AZ-1571 | storefront_blackbox | 3 | AZ-1570 | AZ-1569 |
| AZ-1572 | auth_blackbox | 5 | AZ-1570 | AZ-1569 |
| AZ-1573 | image_pipeline_blackbox | 5 | AZ-1570 | AZ-1569 |
| AZ-1574 | prices_blackbox | 3 | AZ-1570, AZ-1572 | AZ-1569 |
| AZ-1575 | upload_delete_blackbox | 5 | AZ-1570, AZ-1572 | AZ-1569 |
| AZ-1576 | security_mutations_blackbox | 2 | AZ-1570, AZ-1572 | AZ-1569 |
| AZ-1577 | performance_tests | 3 | AZ-1570 | AZ-1569 |
| AZ-1578 | resilience_ops | 3 | AZ-1570, AZ-1572 | AZ-1569 |
| AZ-1579 | resource_cache | 2 | AZ-1570 | AZ-1569 |

Recommended order: AZ-1570 → (AZ-1571, AZ-1572, AZ-1573, AZ-1577, AZ-1579) → (AZ-1574, AZ-1575, AZ-1576, AZ-1578). No cycles.

All matrix scenarios map to exactly one owning task. Every blackbox task has a System Under Test Boundary (real HTTP/forms; expected-results comparison; no product-module stubs).
