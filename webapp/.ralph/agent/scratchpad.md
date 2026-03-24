# M10 Integration Fixes Scratchpad

## 2026-03-24 Iteration 1: task-m10fix-001 (iterate factory)

**Fixed:** Two bugs in iterate stage:
1. `stages/index.ts` — imported `IterateStageRunner` and returned it for `case 'iterate'` (was returning `AnalyzeStageRunner`)
2. `iterate.ts` — changed `STAGE_KIND` from `'analyze'` to `'iterate'`

**Committed:** `bb45612`

**Remaining:** 13 tasks (002-014) still open. All P1 critical backend/UI bugs, then P2 feature gaps.

**Next priorities:**
- task-m10fix-003: Fix synthesis.ts HAS_PROPOSAL relationship
- task-m10fix-004: Wire dedup into ingest stage
- task-m10fix-005: Sanitize dynamic labels in proposals.ts

## 2026-03-24 Iteration 2: task-m10fix-002 (LLM tool handlers)

**Fixed:** 5 silent no-op tool handlers in `shared.ts processToolCall`:
1. `read_graph` — executes read-only Cypher with write-keyword security check
2. `fetch_url` — HTTP fetch with 15s timeout, 100KB size cap, optional HTML text extraction
3. `extract_entities` — regex-based NER for persons/orgs, dates, locations
4. `run_algorithm` — maps LLM algorithm names to the existing centrality/community/anomaly/temporal factory
5. `compare_timelines` — queries temporal event associations, computes proximity overlaps within configurable window

**Design decisions:**
- Return type widened to `string | boolean` — data tools return JSON result strings (truthy, so callers' `if (created)` still works), proposal tools still return `true`
- All 5 stage runners updated to pass `casoSlug` (new optional 4th param)
- `handleReadGraph` rejects write keywords (CREATE, MERGE, SET, DELETE, etc.) for security

**Committed:** `e3b7a77`

**Remaining:** 12 tasks (003-014) still open.

## 2026-03-24 Iteration 3: task-m10fix-003 (synthesis HAS_PROPOSAL)

**Fixed:** `createProposal` in `proposals.ts` only created the Proposal node but never linked it to PipelineState. Synthesis queries in `synthesis.ts` traverse `(PipelineState)-[:HAS_PROPOSAL]->(Proposal)` so corroboration/contradiction/dedup all returned empty.

**Fix:** Switched `createProposal` from `writeQuery` to `withWriteTransaction` to atomically:
1. CREATE the Proposal node
2. MATCH the PipelineState by `pipeline_state_id` and CREATE the `HAS_PROPOSAL` relationship

**Committed:** `5fe3738`

**Remaining:** 11 tasks (004-014) still open.

**Next priorities:**
- task-m10fix-005: Sanitize dynamic labels in proposals.ts
- task-m10fix-006: Fix EngineDashboard bootstrap
- task-m10fix-007: Fix AuditLog.tsx response parse

## 2026-03-24 Iteration 4: task-m10fix-004 (dedup wiring)

**Fixed:** `ingest.ts` only used `normalizeName()` from dedup module. Now fully wired:
1. Calls `buildExistingMaps(casoSlug)` before processing records to load existing graph nodes
2. Runs `dedup()` on each named record: exact matches skip, fuzzy matches get lower confidence (0.3) with metadata
3. Updates maps within batch so later records dedup against earlier ones in same run
4. Added `duplicates_skipped` to `StageResult` (optional field in types.ts)

**Committed:** `04f3fe0`

**Remaining:** 10 tasks (005-014) still open.

## 2026-03-24 Iteration 5: task-m10fix-005 (label sanitization)

**Fixed:** `applyProposal` in `proposals.ts` passed LLM-generated label and relationship type strings directly into Cypher template literals — a Cypher injection vector.

**Fix:** Added two-layer defense:
1. Regex validation (`^[A-Za-z][A-Za-z0-9_]*$`) blocks injection payloads
2. Static whitelist of all known node labels (from schema.ts UNIQUE_CONSTRAINTS) and relationship types (from codebase queries) rejects unknown types

Validation applied to `create_node` (label), `create_relationship` (relType), and `delete_relationship` (relType).

**Committed:** `9640f20`

**Remaining:** 9 tasks (006-014) still open.

**Next priorities (P1):**
- task-m10fix-006: Fix EngineDashboard bootstrap (pipeline_id missing)
- task-m10fix-007: Fix AuditLog.tsx response parse
- task-m10fix-008: Add motor tab to InvestigationNav

## 2026-03-24 Iteration 6: task-m10fix-006 (dashboard bootstrap)

**Fixed:** `/api/casos/[casoSlug]/engine/state` required `pipeline_id` query param, but EngineDashboard bootstrap fetch didn't have one yet (always 400).

**Fix:**
1. Added `listByCasoSlug(casoSlug)` to `pipeline.ts` — queries PipelineState by `caso_slug` property
2. Made `pipeline_id` optional in route — when absent, falls back to `listByCasoSlug(casoSlug)`

Dashboard component already handled the response correctly (picks `json.data[0]`).

**Committed:** `e07b454`

**Remaining:** 8 tasks (007-014) still open.

**Next priorities (P1):**
- task-m10fix-007: Fix AuditLog.tsx response parse
- task-m10fix-008: Add motor tab to InvestigationNav
- task-m10fix-009: Fix motor page for static case routes

## 2026-03-24 Iteration 8: task-m10fix-008 (motor nav tab)

**Fixed:** InvestigationNav.tsx had no motor/engine tab in any case tab list.

**Fix:** Added `{ href: '/motor', label: { en: 'Engine', es: 'Motor' } }` to all four tab lists:
1. `caso-epstein`
2. `caso-libra`
3. `finanzas-politicas`
4. `DEFAULT_TABS`

Motor page already exists at `src/app/caso/[slug]/motor/page.tsx` for dynamic routes. Static routes (caso-epstein, finanzas-politicas) still need their own motor/page.tsx — that's task-m10fix-009.

**Committed:** `41e9783`

**Remaining:** 6 tasks (009-014) still open.

**Next priorities:**
- task-m10fix-010: LLM cost budgeting (P2)
- task-m10fix-011: Graph algorithms (P2)
- task-m10fix-012: Engine metrics (P2)

## 2026-03-24 Iteration 9: task-m10fix-009 (motor static routes)

**Fixed:** Static case routes (caso-epstein, finanzas-politicas) didn't have motor/page.tsx — the dynamic `[slug]/motor/page.tsx` only serves dynamic routes.

**Fix:** Added `motor/page.tsx` to both static route trees, each hardcoding the casoSlug and rendering `EngineDashboard` directly. No params needed since the slug is known at build time.

**Committed:** `92e39f0`

**Remaining:** 5 tasks (010-014) still open. All P2.

## 2026-03-24 Iteration 10: task-m10fix-014 (TypeScript errors in scripts/)

**Fixed:** 9 TypeScript errors across 5 scripts:
1. 5 `.ts` extension imports — removed `.ts` from `../src/lib/neo4j/client.ts` imports in add-media-persons, bridge-clusters, ingest-consolidation, ingest-deep-dive-findings, ingest-recent-scandals
2. 4 implicit any from indexing `QueryResult<never>` with `[0]` in ingest-consolidation.ts — cast to `(result as any).records[0]` since `executeWrite` returns `QueryResult<never>` but these queries do return records

**Committed:** `1eaa9e7`

**Remaining:** 4 tasks (010-013) still open. All P2.

**Next priorities:**
- task-m10fix-010: LLM cost budgeting
- task-m10fix-011: Graph algorithms
- task-m10fix-012: Engine metrics
- task-m10fix-013: Wire engine logger

## 2026-03-24 Iteration 11: task-m10fix-010 (LLM cost budgeting)

**Fixed:** `iterate.ts` ignored `response.usage` from every LLM call — no token tracking, no budget enforcement.

**Fix:**
1. Added `TokenUsage` interface to `stages/types.ts` (prompt_tokens, completion_tokens, total_tokens)
2. Added `tokens_used?: TokenUsage` to `StageResult`
3. In `iterate.ts`: accumulate usage from each `llm.complete()` response, check against configurable `token_budget` (default 100k from `stage.config?.token_budget`), break with error message when exceeded
4. Exported `TokenUsage` from barrel `stages/index.ts`

**Committed:** `7eb443c`

**Remaining:** 3 tasks (011-013) still open. All P2.

## 2026-03-24 Iteration 12: task-m10fix-011 (graph algorithms) — ALREADY DONE

Task description said "Only BFS exists" but all 4 algorithm kinds (centrality, community, anomaly, temporal) were already fully implemented in `src/lib/engine/algorithms/`. The factory in `index.ts` correctly instantiates all four, and `handleRunAlgorithm` in `shared.ts` maps LLM names to them. Closed as already complete.

## 2026-03-24 Iteration 12: task-m10fix-012 (engine metrics)

**Fixed:** No observability counters existed. Added in-memory counter module and API endpoint.

**Changes:**
1. New `metrics.ts` — in-memory counters: pipeline_runs_total, pipeline_runs_completed, pipeline_runs_failed, llm_calls_total, proposals_total, stages_executed_total
2. `pipeline.ts` — increment pipeline_runs_total on start, completed/failed on end, stages_executed_total on advance
3. `proposals.ts` — increment proposals_total in createProposal
4. `iterate.ts` — increment llm_calls_total after each llm.complete()
5. New `/api/casos/[casoSlug]/engine/metrics` GET endpoint

**Committed:** `d4df3cf`

**Remaining:** 1 task (013) still open. P2.

## 2026-03-24 Iteration 13: task-m10fix-013 (wire engine logger)

**Fixed:** `logger.ts` with `createEngineLogger` existed but was never imported anywhere. Wired it into pipeline.ts and all 6 stage runners.

**Changes:**
1. `pipeline.ts` — logger at start, advance, gate, resume, fail, complete (4 functions, ~10 log calls)
2. All 6 stage runners (ingest, verify, enrich, analyze, iterate, report) — logger at stage.start and stage.done with key metrics
3. iterate.ts — additional warn log on token budget exhaustion

**Committed:** `47672a1`

**All tasks complete.** Tasks 001-014 all closed.
