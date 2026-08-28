# Solution (this run)

Existing system: see `_docs/01_solution/solution.md`. This file is the refactor-run copy — project `solution.md` was not overwritten.

```mermaid
flowchart LR
  Visitor --> Storefront
  Admin --> Auth
  Admin --> ContentAdmin
  Storefront --> SharedRuntime
  Storefront --> ImagePipeline
  ContentAdmin --> ImagePipeline
  Auth --> SharedRuntime
```

This run only removes dead files and one duplicated helper / gallery-id catalog. No architecture change.
