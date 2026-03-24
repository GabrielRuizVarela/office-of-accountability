# Scratchpad

## 2026-03-24: Engine E2E tests completed

Filled the empty `e2e/engine/` directory with 5 spec files (57 tests total):
- `pipeline-run.spec.ts` (8 tests) — POST /run + GET /state
- `gate-review.spec.ts` (7 tests) — GET/POST /gate/:stageId
- `proposals.spec.ts` (9 tests) — GET/POST /proposals
- `orchestrator.spec.ts` (19 tests) — GET orchestrator status, CRUD tasks, GET/PUT focus
- `snapshots.spec.ts` (14 tests) — GET/POST/DELETE /snapshots + GET /audit

Pattern: follows compliance E2E conventions — 503 tolerance for Neo4j unavailability, success envelope validation, rate limit header checks, no stack trace exposure, seed helpers for data setup.

Tests compile clean (no TS errors in e2e/). Connection-refused failures expected when dev server not running — structurally identical to compliance tests.

Committed as `2230ada feat(m12): engine E2E test suite (57 tests, 5 specs)`.
