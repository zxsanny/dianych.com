# Blackbox e2e

Isolated suite for the Dianych shop. Does not call Instagram or other social hosts.

## Run

From the repo root:

```
scripts/run-tests.sh
scripts/run-performance-tests.sh
```

`--unit-only` records unit SKIP (no app unit runner).

The runner builds `docker-compose.test.yml` (Next standalone on host port 13001), writes `test-results/report.csv`, then tears the stack down.

## Layout

- `fixtures/seed.jpg` — minimal JPEG copied into `brooches` for pack/image cases
- `tests/` — scenario IDs implemented by the runner (see `_docs/02_document/tests/`)
- Isolated password is generated per run; never the live admin secret
