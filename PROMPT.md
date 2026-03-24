# Office of Accountability — Implementation Prompt

## Objective

Build a civic knowledge platform for investigative research as an interactive graph explorer. The platform links politicians, votes, legislation, donors, shell companies, and user-contributed research into a single explorable, queryable system powered by Neo4j. Three active investigations: Caso Libra (crypto), Caso Finanzas Políticas (Argentine political finance), Caso Epstein.

## Stack

- **Frontend + API + SSR:** Vinext (App Router, Server Components, Route Handlers) → Cloudflare Workers
- **Database:** Neo4j 5 Community (primary store for all data)
- **Neo4j Driver:** neo4j-driver-lite (Bolt over WebSocket) — browser/ESM build
- **Graph Visualization:** react-force-graph-2d
- **Rich Text Editor:** TipTap (investigation documents)
- **Auth:** Auth.js (@auth/core) with JWT sessions — email/password + Google OAuth
- **LLM:** Qwen 3.5 9B via llama.cpp (local GPU), OpenAI, Anthropic adapters
- **TypeScript, Zod 4**

## Completed Milestones (M0–M10)

| # | Name | Status |
|---|------|--------|
| 0 | Scaffolding | ✅ Vinext + Neo4j + Bolt/WS → Workers |
| 1 | Data Ingestion | ✅ Como Voto ETL |
| 2 | Graph API | ✅ All routes + pagination |
| 3 | Graph Explorer | ✅ react-force-graph-2d |
| 4 | Politician Profiles | ✅ SSR + SEO |
| 5 | Auth | ✅ Auth.js + CSRF + lockout + email verification |
| 6 | Investigations | ✅ TipTap + graph embeds + CRUD |
| 7 | Share & Distribution | ✅ OG images + WhatsApp |
| 8 | Seed Content | ✅ 3 casos seeded |
| 9 | Investigation Standardization | ✅ Generic labels, query builder, unified API |
| 10 | Motor de Investigación Autónomo | ⚠️ Code exists but integration is broken — see M10 Fix List below |

### M10 Engine — What Exists

The autonomous investigation engine has ~2,400 lines across 45 files. Individual modules are real implementations (not stubs), but the **integration layer is broken** — pieces don't wire together correctly, the UI can't bootstrap, and key code paths are dead.

- **LLM Abstraction** (`src/lib/engine/llm/`): llamacpp, openai, anthropic providers — real HTTP adapters, reasoning extraction, tool call parsing ✅
- **Pipeline** (`src/lib/engine/pipeline.ts`): PipelineState CRUD, stage runner, gate mechanism ✅
- **Stages** (`src/lib/engine/stages/`): ingest, verify, enrich, analyze, iterate, report — all have real implementations ⚠️ (iterate is dead code, tool execution is broken)
- **Connectors** (`src/lib/engine/connectors/`): rest-api, file-upload, custom-script ✅
- **Proposals** (`src/lib/engine/proposals.ts`): create, list, review, approve/reject ✅
- **Audit** (`src/lib/engine/audit.ts`): SHA-256 hash chain, append-only, validateChain ✅
- **Snapshots** (`src/lib/engine/snapshots.ts`): caso_slug namespaced graph copies ✅
- **Config** (`src/lib/engine/config.ts`): CRUD for 6 config node types ✅
- **Orchestrator** (`src/lib/engine/orchestrator/`): dispatch, synthesis, priority, diminishing returns ⚠️ (synthesis queries broken)
- **Research** (`src/lib/engine/`): research-program, gap-detector, research-metrics ✅ (but iterate stage that uses them is dead code)
- **API Routes** (`src/app/api/casos/[casoSlug]/engine/`): 9 routes ✅
- **UI Components** (`src/components/engine/`): Dashboard, PipelineStatus, ProposalReview, AuditLog, GateApproval, OrchestratorPanel ⚠️ (dashboard can't bootstrap, audit log parse broken, no navigation)

### M10 Fix List — MUST complete before M11

Fix these in order. Each fix is small and targeted. Do NOT re-implement modules — the underlying code is real, these are wiring/integration bugs.

#### Critical Backend Bugs

- [ ] **Fix iterate stage factory**: `src/lib/engine/stages/index.ts` — the `'iterate'` case returns `new AnalyzeStageRunner()`. Import `IterateStageRunner` from `./iterate` and return it instead. Also fix `iterate.ts` line 27 where `STAGE_KIND` is set to `'analyze'` — change to `'iterate'`.

- [ ] **Implement missing LLM tool handlers**: `src/lib/engine/stages/shared.ts` `processToolCall` — the LLM is told it can use `read_graph`, `fetch_url`, `extract_entities`, `run_algorithm`, `compare_timelines` but calling them is a silent no-op. Implement real handlers: `read_graph` should run a parameterized Cypher query against Neo4j, `fetch_url` should fetch and extract text, `extract_entities` should parse entities from text, `run_algorithm` should call `src/lib/graph/algorithms.ts`, `compare_timelines` should query and compare date-ordered events.

- [ ] **Fix synthesis relationship pattern**: `src/lib/engine/orchestrator/synthesis.ts` — queries use `(ps:PipelineState)-[:HAS_PROPOSAL]->(p:Proposal)` but this relationship is never written. Either: (a) update `proposals.ts` `createProposal` to also CREATE the `HAS_PROPOSAL` relationship from PipelineState to Proposal, or (b) rewrite synthesis queries to join via `p.pipeline_state_id = ps.id` property match.

- [ ] **Wire full dedup into ingest**: `src/lib/engine/stages/ingest.ts` only uses `normalizeName`. Wire `buildExistingMaps()` and fuzzy `dedup()` from `src/lib/ingestion/dedup.ts` to check proposals against existing Neo4j nodes before creating them.

- [ ] **Sanitize dynamic labels in proposals**: `src/lib/engine/proposals.ts` `applyProposal` uses template literals for Neo4j labels from LLM output. Add a whitelist check — only allow labels defined in the investigation's `SchemaDefinition` node types.

#### Critical UI Bugs

- [ ] **Fix dashboard bootstrap**: `src/components/engine/EngineDashboard.tsx` line 44 — initial fetch to `/engine/state` has no `pipeline_id` param, API returns 400. Either: (a) add a discovery step that first fetches available pipelines for the casoSlug, or (b) update the `/engine/state` route to support listing by `caso_slug` without requiring `pipeline_id`.

- [ ] **Fix AuditLog response parse**: `src/components/engine/AuditLog.tsx` line 93 — change `setEntries(json.data)` to `setEntries(json.data.entries)` to match the actual API response shape `{ data: { entries: [...] } }`.

- [ ] **Add motor page navigation**: `src/components/investigation/InvestigationNav.tsx` — add `{ href: '/motor', label: { en: 'Engine', es: 'Motor' } }` to the tab lists for all cases.

- [ ] **Fix motor page for static case routes**: Cases `caso-epstein` and `finanzas-politicas` use static route trees (`src/app/caso/caso-epstein/`, `src/app/caso/finanzas-politicas/`) that don't go through the dynamic `caso/[slug]/` layout. Either add `motor/page.tsx` within each static case directory, or migrate those cases to use the dynamic `[slug]` layout.

#### Remaining Feature Gaps

- [ ] **LLM cost budgeting**: `LLMResponse.usage` field is populated by all 3 adapters but never accumulated. Add a running token total per pipeline run in `iterate.ts`, with a configurable budget ceiling that stops iteration when exceeded.

- [ ] **Graph algorithms**: `src/lib/graph/algorithms.ts` only has BFS shortest path. Add degree centrality, betweenness centrality, community detection (label propagation), and anomaly detection (outlier scoring by property distribution).

- [ ] **Engine metrics**: Add `pipeline_runs_total`, `llm_calls_total`, `proposals_total` counters. Can be simple Neo4j counter nodes or in-memory counters exposed via a `/engine/metrics` endpoint.

- [ ] **Wire logger**: `src/lib/engine/logger.ts` exists but is never imported anywhere. Replace raw `console.error` calls in pipeline.ts, stages, and orchestrator with `createEngineLogger`.

- [ ] **Fix TypeScript errors**: 9 errors in `scripts/` files — 5 `.ts` extension imports (remove extensions) and 4 implicit `any` from indexing `QueryResult<never>` in `scripts/ingest-consolidation.ts`.

## Implementation Queue — Milestones 11–17

**Execute milestones in order. When a milestone is complete, move to the next one. Do NOT stop after finishing a single milestone — continue through the full queue. Mark each milestone ✅ in the Completed Milestones table as you finish it.**

**Full specs for all milestones:** See `TASKS.md`

---

### M11: Compliance Framework Engine ← START HERE

**Goal:** Per-investigation compliance framework engine. Researchers declare which international standards (FATF, UNCAC, SOC 2) govern their investigation. Machine-readable rules as mild pipeline gates, parallel auditor for warnings, manual attestations, Qwen LLM for qualitative analysis. Frameworks are swappable — adding a standard = adding a YAML file.

**Key decisions:**
- Gate rules are **mild** — they log + flag, don't crash the pipeline
- LLM check handler reuses M10's `LLMProvider` factory (not direct MiroFish calls)
- Compliance evaluations create `AuditEntry` nodes in the existing hash chain
- No framework attached → compliance checks skip entirely (zero overhead)

**Dependencies available:** M9 InvestigationConfig ✅, M10 pipeline executor + LLM abstraction ✅

---

### M12: Full-App E2E Test Suite (Playwright MCP)

**Goal:** Comprehensive end-to-end test suite covering every user-facing interaction. Tests run against live dev server + Neo4j. Playwright MCP tools for interactive verification; CI runs headless.

**Dependencies:** All previous milestones (M0–M11). Build incrementally — add specs per milestone as features land.

---

### M13: Investigation MCP Server (Cloudflare Workers)

**Goal:** Hosted MCP server on Cloudflare Workers exposing the investigation engine as tools. Any MCP-capable client (Claude Code, Claude Desktop, Cursor, custom agents) can create investigations, run pipelines, review proposals, query the graph, manage compliance, and orchestrate research via standard MCP protocol over SSE transport.

**Dependencies:** M9 (unified API routes), M10 (engine + pipeline), M11 (compliance). Thin layer over existing API routes.

---

### M14: MCP Client — External Data Source Connectors

**Goal:** The engine becomes an MCP *client* connecting to external MCP servers for data enrichment. Adding a new source = pointing at an MCP server URL. Engine discovers available tools, maps them to source connector operations, ingests through MCP protocol.

**Dependencies:** M10 (source connectors + pipeline), M13 (MCP protocol implementation to reuse)

---

### M15: MCP Prompts — Guided Investigation Workflows

**Goal:** MCP server (M13) exposes predefined investigation workflows as MCP prompts. Multi-step investigation recipes that orchestrate tool calls in sequence, with decision points for researcher input. Encodes domain expertise into reusable workflows.

**Dependencies:** M13 (MCP server with tools)

---

### M16: Federation — Multi-Instance Investigation Collaboration

**Goal:** Multiple instances connect via MCP for cross-instance graph queries, shared findings, and collaborative investigations without centralizing data. Each instance retains data sovereignty.

**Dependencies:** M13 (MCP server), M14 (MCP client). Each instance acts as both MCP server and MCP client.

---

### M17: Investigation Governance — Forks, Branches, Merge Requests & Coalitions

**Goal:** Git-like governance for investigations. Fork, branch, merge requests, coalitions with democratic governance. The investigation graph becomes a versioned, auditable, collaborative artifact.

**Key decisions:**
- Branches are lightweight refs to snapshots + delta (not full graph copies)
- Merge requests contain Proposals — reviewed at gates like pipeline proposals
- Coalitions govern shared investigations through consensus (configurable quorum)
- Builds on M10 snapshots + audit trail (both exist)

## Architecture Invariants

1. **All Neo4j queries use parameterized Cypher** — never interpolate user input
2. **LIMIT clauses need `neo4j.int(n)`** — JS numbers are floats
3. **Confidence tiers: gold > silver > bronze** — engine never auto-publishes gold
4. **caso_slug namespace isolation** — all investigation data scoped by `WHERE n.caso_slug = $casoSlug`
5. **LLM never writes directly** — all outputs are Proposal nodes reviewed at gates
6. **Zod validation on all inputs** — API routes, config, compliance rules
7. **Audit trail is append-only with SHA-256 hash chain** — tamper-evident
8. **Node IDs are prefixed**: `{caso_slug}:{local_id}` — Community Edition has no composite constraints
9. **Qwen mandatory thinking mode** — check `reasoning_content` field, not just `content`

## Key Directories

```
webapp/
  src/
    app/api/casos/[casoSlug]/engine/  — 9 engine API routes
    app/api/investigations/           — user investigation CRUD
    app/api/auth/                     — Auth.js routes
    lib/engine/                       — autonomous investigation engine (45 files)
    lib/engine/llm/                   — LLM provider adapters
    lib/engine/stages/                — pipeline stage implementations
    lib/engine/connectors/            — data source connectors
    lib/engine/orchestrator/          — task coordination
    lib/investigations/               — query builder, registry, types
    lib/caso-libra/                   — Caso Libra backend
    lib/caso-finanzas-politicas/      — Finanzas Políticas backend
    lib/caso-epstein/                 — Caso Epstein backend
    lib/auth/                         — Auth.js config, session, CSRF, lockout
    lib/neo4j/                        — Neo4j client wrapper
    lib/compliance/                   — (M11 — TO BE CREATED)
    components/engine/                — engine UI components
    components/investigation/         — TipTap editor, forms, embeds
    components/auth/                  — SessionProvider, UserMenu
  compliance/frameworks/              — (M11 — YAML framework definitions)
```

## Environment

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
AUTH_SECRET=<32+ chars>
MIROFISH_API_URL=http://localhost:8080
APP_URL=http://localhost:5174
```

## Acceptance Criteria

See `TASKS.md` for detailed acceptance criteria per milestone. Each milestone has verification steps at the end of its section.

## References

- Full PRD: `PRD.md`
- Task breakdown: `TASKS.md`
- Graph reference: [br-acc](https://github.com/World-Open-Graph/br-acc)
