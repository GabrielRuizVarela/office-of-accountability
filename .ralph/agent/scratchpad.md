# Plan: Continue M9 → M10 with code review + human review gates

## Current State Assessment

### M9 — Investigation Standardization
**Infrastructure (DONE):**
- `src/lib/investigations/types.ts` — all interfaces
- `src/lib/investigations/utils.ts` — slug validation, helpers
- `src/lib/investigations/config.ts` — reads InvestigationConfig from Neo4j
- `src/lib/investigations/query-builder.ts` — schema-aware generic query builder (getGraph, getTimeline, getStats, getSchema, getConfig, getNodesByType, getNodeBySlug, getNodeConnections)
- `src/lib/investigations/registry.ts` — casoSlug → InvestigationClientConfig registry

**Remaining (8 open tasks — unified API routes):**
The graph route exists at `/api/caso/[slug]/graph/route.ts` but still imports from caso-epstein hardcoded. Need to:
1. Update graph route to use generic query builder ✓ task exists (m9:unified-graph)
2. Create timeline endpoint ✓ task exists (m9:unified-timeline)
3. Create stats endpoint ✓ task exists (m9:unified-stats)
4. Create config endpoint ✓ task exists (m9:unified-config)
5. Create schema endpoint ✓ task exists (m9:unified-schema)
6. Create node connections endpoint ✓ task exists (m9:unified-node)
7. Create registry endpoint ✓ task exists (m9p5:registry) — this was for the module file, already done
8. Add 301 redirects ✓ task exists (m9:redirects)

### M10 — Motor de Investigación Autónomo
Not started. 8 phases defined in TASKS.md (Phases 1-8).

## Step-Wave Strategy

### Step 1 — Complete M9 unified API routes (7 tasks)
All tasks exist and are unblocked. Ship them, then code review.

### Step 2 — Code review M9 completion
Request code review of all M9 work before M10.

### Step 3 — M10 Phase 1: Engine Data Model
- Add engine node constraints to init-schema.ts
- Create src/lib/engine/types.ts
- Create src/lib/engine/config.ts
- Create src/lib/engine/audit.ts

### Step 4 — M10 Phase 2: LLM Abstraction Layer
- Create src/lib/engine/llm/types.ts
- Create src/lib/engine/llm/llamacpp.ts
- Create src/lib/engine/llm/openai.ts
- Create src/lib/engine/llm/anthropic.ts
- Create src/lib/engine/llm/factory.ts
- Create src/lib/engine/llm/tools.ts

### Step 5 — M10 Phase 3: Pipeline Executor
- Create src/lib/engine/pipeline.ts
- Create src/lib/engine/proposals.ts
- Create src/lib/engine/snapshots.ts

### Step 6 — M10 Phase 4: Source Connectors
- Connector interface + implementations (rest-api, file-upload, custom-script)
- Connector factory
- Dedup integration

### Step 7 — M10 Phase 5: Stage Implementations
- 5 stage handlers (ingest, verify, enrich, analyze, report)
- Agent dispatch module

### Step 8 — M10 Phase 6: Graph Algorithms
- Extend algorithms.ts with 5 algorithms
- Hypothesis proposal generation

### Step 9 — M10 Phase 7: MiroFish Integration
- Refactor client.ts and export.ts

### Step 10 — M10 Phase 8: API Routes
- 6 engine API routes

### Step 11 — Code review M10 + wait for human review

## Current Step: Step 2 — Code review M9 completion

### Sub-tasks:
- [x] 1.1 Update `/api/caso/[slug]/graph/route.ts` — use generic query builder (file: webapp/src/app/api/caso/[slug]/graph/route.ts)
- [x] 1.2 Create `/api/caso/[slug]/timeline/route.ts` (file: webapp/src/app/api/caso/[slug]/timeline/route.ts)
- [x] 1.3 Create `/api/caso/[slug]/stats/route.ts` (file: webapp/src/app/api/caso/[slug]/stats/route.ts)
- [x] 1.4 Create `/api/caso/[slug]/config/route.ts` (file: webapp/src/app/api/caso/[slug]/config/route.ts)
- [x] 1.5 Create `/api/caso/[slug]/schema/route.ts` (file: webapp/src/app/api/caso/[slug]/schema/route.ts)
- [ ] 1.6 Create `/api/caso/[slug]/node/[id]/route.ts` (file: webapp/src/app/api/caso/[slug]/node/[id]/route.ts)
- [ ] 1.7 Add 301 redirects from `/api/caso-libra/*` to `/api/caso/caso-libra/*` (file: webapp/src/app/api/caso-libra/)

### Notes:
- All routes should validate slug via registry.getClientConfig(slug) or isValidCasoSlug() — 404 for unknown
- Use getQueryBuilder() singleton from investigations/query-builder.ts
- Follow existing error handling pattern from current graph route
- registry.ts task (m9p5:registry) is already DONE — the file exists and works

## Completed Steps:

### Step 1.1 — Graph route updated
- Replaced `caso-epstein/queries` + `CASO_EPSTEIN_SLUG` imports with `getQueryBuilder().getGraph(slug)`
- Added slug validation via `getClientConfig(slug)` → 404 for unknown
- Awaits `params` promise (Next.js 16 pattern)
- Dropped `tiers` query param (not supported by generic query builder — tier filtering is DB-level via confidence_tier property)
- `tsc --noEmit` passes (only pre-existing EvidenceExplorer errors remain)

### Finalizer check after Step 1.1 review
- review.passed for m9:unified-graph — clean, no issues
- 6 open tasks remain in Step 1 (1.2–1.7)
- Advancing queue for Builder to pick up next sub-task (m9:unified-timeline)

### Planner queue.advance — dispatching m9:unified-timeline
- Graph route review passed, advancing to sub-task 1.2
- Builder should follow same pattern as graph route: validate slug via getClientConfig, call getQueryBuilder().getTimeline(slug), same error handling
- getTimeline(slug) returns Promise<TimelineItem[]>

### Step 1.2 — Timeline route created
- Created `webapp/src/app/api/caso/[slug]/timeline/route.ts`
- Follows exact same pattern as graph route: slug validation via getClientConfig, getQueryBuilder().getTimeline(slug), same error handling
- `tsc --noEmit` passes (only pre-existing EvidenceExplorer errors)
- Committed: df928a9

### Critic review of Step 1.2 — Timeline route
- review.passed for m9:unified-timeline — clean, no issues
- Identical structure to graph route (slug validation, query builder call, error handling)
- tsc passes (only pre-existing EvidenceExplorer errors)
- 5 open tasks remain in Step 1 (1.3–1.7)
- Advancing queue for Builder to pick up next sub-task (m9:unified-stats)

### Finalizer check after Step 1.2 review
- review.passed for m9:unified-timeline — closed task-1774073209-60db
- 5 open tasks remain in Step 1 (1.3–1.7): stats, config, schema, node, redirects
- Next up: m9:unified-stats (task-1774073211-ef88)
- Builder should follow same pattern: validate slug via getClientConfig, call getQueryBuilder().getStats(slug), same error handling

### Planner queue.advance — dispatching m9:unified-stats
- Timeline route review passed, advancing to sub-task 1.3
- Builder should follow same pattern as graph/timeline routes: validate slug via getClientConfig, call getQueryBuilder().getStats(slug), same error handling
- getStats(slug) returns Promise<InvestigationStats> — node/edge counts, tier breakdown, etc.
- Error message for catch: 'Failed to load stats'

### Step 1.3 — Stats route created
- Created `webapp/src/app/api/caso/[slug]/stats/route.ts`
- Follows exact same pattern as graph/timeline routes: slug validation via getClientConfig, getQueryBuilder().getStats(slug), same error handling
- `tsc --noEmit` passes (only pre-existing EvidenceExplorer errors)
- Committed: 1635c9d

### Critic review of Step 1.3 — Stats route
- review.passed for m9:unified-stats — clean, no issues
- Identical structure to graph/timeline routes (slug validation, query builder call, error handling)
- tsc passes (only pre-existing EvidenceExplorer errors)
- 4 open tasks remain in Step 1 (1.4–1.7): config, schema, node, redirects
- Next up: m9:unified-config

### Finalizer check after Step 1.3 review
- review.passed for m9:unified-stats — closed task-1774073211-ef88
- 4 open tasks remain in Step 1 (1.4–1.7): config, schema, node, redirects
- Next up: m9:unified-config (task-1774073213-3c3a)
- Builder should follow same pattern: validate slug via getClientConfig, call getQueryBuilder().getConfig(slug), same error handling

### Planner queue.advance — dispatching m9:unified-config
- Stats route review passed, advancing to sub-task 1.4
- Builder should follow same pattern as graph/timeline/stats routes: validate slug via getClientConfig, call getQueryBuilder().getConfig(slug), same error handling
- getConfig(slug) returns Promise<InvestigationConfig> — investigation metadata, node types, relationship types, etc.
- Error message for catch: 'Failed to load config'

### Step 1.4 — Config route created
- Created `webapp/src/app/api/caso/[slug]/config/route.ts`
- Follows exact same pattern as graph/timeline/stats routes: slug validation via getClientConfig, getQueryBuilder().getConfig(slug), same error handling
- `tsc --noEmit` passes (only pre-existing EvidenceExplorer errors)
- Committed: 4644722

### Critic review of Step 1.4 — Config route
- review.passed for m9:unified-config — clean, no issues
- Identical structure to graph/timeline/stats routes (slug validation, query builder call, error handling)
- tsc passes (only pre-existing EvidenceExplorer errors)
- 3 open tasks remain in Step 1 (1.5–1.7): schema, node, redirects
- Next up: m9:unified-schema

### Finalizer check after Step 1.4 review
- review.passed for m9:unified-config — closed task-1774073213-3c3a
- 3 open tasks remain in Step 1 (1.5–1.7): schema, node, redirects
- Next up: m9:unified-schema (task-1774073214-9921)
- Builder should follow same pattern: validate slug via getClientConfig, call getQueryBuilder().getSchema(slug), same error handling
- getSchema(slug) returns Promise<InvestigationSchema> — node types, relationship types, property definitions

### Planner queue.advance — dispatching m9:unified-schema
- Config route review passed, advancing to sub-task 1.5
- Builder should follow same pattern as graph/timeline/stats/config routes: validate slug via getClientConfig, call getQueryBuilder().getSchema(slug), same error handling
- getSchema(slug) returns Promise<InvestigationSchema> — node types, relationship types, property definitions
- Error message for catch: 'Failed to load schema'
- 3 open tasks remain (1.5–1.7): schema, node, redirects

### Step 1.5 — Schema route created
- Created `webapp/src/app/api/caso/[slug]/schema/route.ts`
- Follows exact same pattern as graph/timeline/stats/config routes: slug validation via getClientConfig, getQueryBuilder().getSchema(slug), same error handling
- `tsc --noEmit` passes (only pre-existing EvidenceExplorer errors)
- Committed: 0c4e4c0

### Critic review of Step 1.5 — Schema route
- review.passed for m9:unified-schema — clean, no issues
- Identical structure to graph/timeline/stats/config routes (slug validation, query builder call, error handling)
- tsc passes (only pre-existing EvidenceExplorer errors)
- 2 open tasks remain in Step 1 (1.6–1.7): node, redirects
- Next up: m9:unified-node

### Finalizer check after Step 1.5 review
- review.passed for m9:unified-schema — closed task-1774073214-9921
- 2 open tasks remain in Step 1 (1.6–1.7): node, redirects
- Next up: m9:unified-node (task-1774073216-dbf3)
- This route is different from prior routes: needs nested dynamic segment [id]
- Builder should create `webapp/src/app/api/caso/[slug]/node/[id]/route.ts`
- Use getQueryBuilder().getNodeBySlug(slug, id) for node details + getNodeConnections(slug, id) for connections
- Validate slug via getClientConfig(slug), validate id param exists
- Error message for catch: 'Failed to load node'

### Planner queue.advance — dispatching m9:unified-node
- Schema route review passed, advancing to sub-task 1.6
- This route is different from prior simple routes — nested dynamic segment `[id]`
- Builder should create `webapp/src/app/api/caso/[slug]/node/[id]/route.ts`
- Method signatures from query-builder.ts:
  - `getNodeConnections(casoSlug: string, nodeId: string, depth?: number)` → returns `Promise<GraphData>` — 1-hop neighborhood of a node by its `id` property
  - `getNodeBySlug(casoSlug: string, nodeType: string, slug: string)` → returns `Promise<InvestigationNode | null>` — lookup by type+slug
- Route design: `GET /api/caso/[slug]/node/[id]`
  - `[id]` is the node's `id` property (used for connections lookup)
  - Optional query param `?depth=N` for connection depth (default 1)
  - Return both the center node info and its connections in one response: `{ node: ..., connections: { nodes: [], links: [] } }`
  - Use `getNodeConnections(casoSlug, id, depth)` — this already finds the center node internally
  - Validate slug via getClientConfig(slug) → 404 for unknown
  - Validate id param exists → 400 if missing
  - Error message for catch: 'Failed to load node'
- Pattern: same slug validation + error handling as other routes, but with added `[id]` param and query param parsing

### Step 1.6 — Node route created
- Created `webapp/src/app/api/caso/[slug]/node/[id]/route.ts`
- Nested dynamic segment: params Promise yields `{ slug, id }`
- Uses `getQueryBuilder().getNodeConnections(slug, id, depth)` — returns center node + neighborhood as GraphData
- Optional `?depth=N` query param (clamped 1–3, matches MAX_DEPTH in query-builder)
- Validates slug via getClientConfig → 404, validates id param → 400 if missing
- Same error handling pattern as other routes (Neo4j connection errors → 503)
- `tsc --noEmit` passes (only pre-existing EvidenceExplorer errors)
- Committed: 5805801

### Critic review of Step 1.6 — Node route
- review.passed for m9:unified-node — clean, no issues
- Correct nested dynamic segment `[slug]/node/[id]`, params Promise properly awaited
- Uses getNodeConnections with optional depth param (clamped 1-3)
- Slug validation via getClientConfig → 404, id validation → 400
- Same error handling pattern as all other M9 routes
- tsc passes (only pre-existing EvidenceExplorer errors)
- 1 open task remains in Step 1 (1.7): redirects
- Next up: m9:redirects

### Finalizer check after Step 1.6 review
- review.passed for m9:unified-node — closed task-1774073216-dbf3
- 1 open task remains in Step 1 (1.7): redirects
- Next up: m9:redirects (task-1774073218-0806)
- Builder should create redirect routes under `webapp/src/app/api/caso-libra/` that 301 redirect to `/api/caso/caso-libra/`
- This ensures backward compatibility for any existing consumers of the old endpoint pattern
- After this, Step 1 is complete and we move to Step 2 (code review of all M9 work)

### Planner queue.advance — dispatching m9:redirects (attempt 2)
- Node route review passed, advancing to final sub-task 1.7
- This is the LAST M9 unified API task — after completion, Step 1 is fully done
- **Approach:** Use Next.js `next.config.ts` redirects rather than creating individual route files
  - This is the idiomatic Next.js approach for 301 redirects
  - Less code to maintain, no boilerplate route handlers
- **Alternatively**, if next.config redirects don't work well with Vite/Vinext, use a catch-all route at `webapp/src/app/api/caso-libra/[[...path]]/route.ts`
- **Existing caso-libra routes** that should NOT be redirected (they are investigation-specific, not unified):
  - `/api/caso-libra/document/[docSlug]` — document lookup
  - `/api/caso-libra/investigation` — investigation metadata
  - `/api/caso-libra/person/[actorSlug]` — person lookup
  - `/api/caso-libra/simulate/*` — simulation routes
  - `/api/caso-libra/wallets` — wallet data
- **Routes that SHOULD redirect** (old → new):
  - `/api/caso-libra/graph` → `/api/caso/caso-libra/graph` (301) — this one already has a hardcoded route, replace it
- **Wait** — actually, the existing caso-libra routes are the OLD endpoints. The task says redirect them. But these old routes still have real logic (not using the generic query builder). The intent is:
  - The OLD `/api/caso-libra/graph` route should 301 to `/api/caso/caso-libra/graph` (the new unified route)
  - Other old routes (document, person, simulate, wallets) don't have unified equivalents yet — leave them as-is
  - Only redirect the endpoints that have unified equivalents: `graph`
- **Decision:** Only redirect `/api/caso-libra/graph` → `/api/caso/caso-libra/graph` since that's the only old route with a unified equivalent. The others (document, person, simulate, wallets, investigation) are caso-libra-specific and don't have unified M9 routes yet.
- **Implementation:** Replace the existing `webapp/src/app/api/caso-libra/graph/route.ts` handler with a 301 redirect to `/api/caso/caso-libra/graph` (preserving query params)
- tsc must pass after change

### Step 1.7 — Redirects implemented
- Replaced `webapp/src/app/api/caso-libra/graph/route.ts` handler with a 301 redirect to `/api/caso/caso-libra/graph`
- Uses `NextResponse.redirect(target, 301)` with query param preservation
- Only redirects `/api/caso-libra/graph` — other caso-libra routes (document, person, simulate, wallets, investigation) left as-is since they have no unified equivalents yet
- `tsc --noEmit` passes (only pre-existing EvidenceExplorer errors)
- Committed: 0799ad6
- **Step 1 is now COMPLETE** — all 7 M9 unified API sub-tasks done (1.1–1.7)
- Next: Step 2 — Code review of all M9 work before proceeding to M10

### Critic review of Step 1.7 — Redirects
- review.passed for m9:redirects — clean, no issues
- Correctly replaces old graph handler with 301 redirect using NextResponse.redirect(target, 301)
- Query params preserved via searchParams.forEach → target.searchParams.set
- URL construction correct: new URL('/api/caso/caso-libra/graph', request.url)
- Other caso-libra routes correctly left untouched
- tsc passes (only pre-existing EvidenceExplorer errors)
- **Step 1 is now FULLY COMPLETE and REVIEWED** — all 7 M9 unified API sub-tasks (1.1–1.7) done and passed critic review
- Next: Step 2 — Full M9 code review before proceeding to M10

### Finalizer — Step 1 complete, advancing to Step 2
- Closed task-1774073218-0806 (m9:redirects) — last sub-task in Step 1
- All 7 M9 unified API routes (1.1–1.7) are done and reviewed
- Step 1 is fully complete
- Advancing to Step 2: Full M9 code review before proceeding to M10
- The i18n-titles task (task-1774074000-i18n) is still open but is separate from Step 1 API routes

### Planner — Advancing to Step 2: Full M9 Code Review
- Step 1 fully complete: all 7 unified API routes (graph, timeline, stats, config, schema, node, redirects) implemented and individually reviewed
- Created task task-1774074833-2a43 (key: m9:code-review) for full M9 code review
- This is a holistic review of ALL M9 work together:
  - Infrastructure: types.ts, utils.ts, config.ts, query-builder.ts, registry.ts
  - API routes: graph, timeline, stats, config, schema, node/[id], redirects
- Files to review:
  - `webapp/src/lib/investigations/types.ts`
  - `webapp/src/lib/investigations/utils.ts`
  - `webapp/src/lib/investigations/config.ts`
  - `webapp/src/lib/investigations/query-builder.ts`
  - `webapp/src/lib/investigations/registry.ts`
  - `webapp/src/app/api/caso/[slug]/graph/route.ts`
  - `webapp/src/app/api/caso/[slug]/timeline/route.ts`
  - `webapp/src/app/api/caso/[slug]/stats/route.ts`
  - `webapp/src/app/api/caso/[slug]/config/route.ts`
  - `webapp/src/app/api/caso/[slug]/schema/route.ts`
  - `webapp/src/app/api/caso/[slug]/node/[id]/route.ts`
  - `webapp/src/app/api/caso-libra/graph/route.ts` (301 redirect)
- Review criteria: consistency, error handling, security (parameterized queries), type safety, no dead code
- After review passes → wait for human review before proceeding to M10

### Step 2 — Full M9 Code Review Results

**Files reviewed:** 12 files (5 infrastructure + 6 API routes + 1 redirect)

#### Infrastructure (types.ts, utils.ts, config.ts, query-builder.ts, registry.ts)

**types.ts** — Clean. Well-structured interfaces with readonly properties. `InvestigationQueryBuilder` interface covers all needed operations. `satisfies` used correctly in timeline mapping.

**utils.ts** — Clean. ID generation/parsing, slug validation, `VALID_CASO_SLUGS` as const for type narrowing. No issues.

**config.ts** — Clean. All Cypher parameterized. Reads InvestigationConfig and schema subgraph from Neo4j. Null returns for invalid slugs. `isValidCasoSlug` guard before queries.

**query-builder.ts** — 1 minor issue:
- **Unused import (line 13):** `transformNode` and `transformRelationship` from `'../graph/transform'` are imported but never used. The file defines its own `toInvestigationNode` and `toInvestigationRelationship` instead. Should be removed (dead code).
- **Cypher interpolation (line 300):** `${clampedDepth}` is interpolated into variable-length path `[r*1..${clampedDepth}]`. This is acceptable — Neo4j doesn't support parameterized path bounds, and the value is clamped to integer 1–3. Not a security concern.
- Otherwise clean: two-pass graph pattern avoids cartesian products, `sanitizeLabel()` prevents label injection, `neo4j.int()` used for LIMIT/SKIP, sessions always closed in `finally`.

**registry.ts** — Clean. Simple Map-based lookup, imports caso-specific configs. `getClientConfig` returns undefined for unknown slugs.

#### API Routes (graph, timeline, stats, config, schema, node/[id])

All 5 simple routes follow identical pattern:
1. Await `params` Promise (Next.js 16 pattern) ✓
2. Validate slug via `getClientConfig(slug)` → 404 ✓
3. Call `getQueryBuilder().methodName(slug)` ✓
4. Return `{ success: true, data }` ✓
5. Catch with Neo4j connection check → 503, else → 500 ✓

**node/[id]/route.ts** — Correctly handles nested dynamic segment, `?depth=N` query param with clamping, additional `id` validation → 400. Clean.

#### Redirect (caso-libra/graph/route.ts)

Clean 301 redirect with query param preservation. Only redirects graph (the only old route with a unified equivalent).

#### Verdict

**review.passed** — 1 minor issue (unused import in query-builder.ts, non-blocking). All Cypher parameterized. Consistent error handling. Type-safe. No security concerns. tsc passes (only pre-existing EvidenceExplorer errors).

**Recommendation:** Remove unused import in query-builder.ts line 13 before merging, but this is non-blocking for the review.

### Critic review of Step 2 — Full M9 Code Review
- Independently verified: tsc passes (only pre-existing EvidenceExplorer errors, not M9-related)
- Unused import fix confirmed committed (a860000)
- No unsafe Cypher interpolation in investigations/ — only clampedDepth for path bounds (acceptable, integer-clamped 1-3)
- neo4j.int() used for LIMIT/SKIP
- All 12 files reviewed by subtask, 1 minor issue found and fixed
- review.passed — M9 code review is complete
- Next: Finalizer should advance to human review gate before M10
