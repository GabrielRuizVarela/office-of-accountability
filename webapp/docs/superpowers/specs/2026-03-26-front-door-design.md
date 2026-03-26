# Front Door Design: MCP-First Investigation Platform

**Date:** 2026-03-26
**Status:** Draft
**Scope:** Complete the "front door" — MCP tool surface for orchestration, webapp review UI, MiroFish consolidation, investigation creation flow

---

## Problem Statement

The Office of Accountability has a sophisticated investigation engine (7,287 Epstein nodes, 50K+ Finanzas Politicas ETL nodes, Libra forensics) but **no way for users or LLM orchestrators to create investigations, import data, or run the discovery loop without writing seed scripts and CLI commands.**

Ralph built 139 tasks worth of engine internals. The pipeline stages work (ingest, verify, enrich, analyze, iterate). The MCP server has 14 tools. But the critical path — from "I want to investigate X" to "data is flowing through the pipeline" — requires a developer.

---

## Architecture

Two-layer system. External LLM does heavy orchestration via MCP. Webapp provides review UI + built-in LLM for user-facing features.

```
+--------------------------------------------------+
|  External LLM Client (Claude, Cursor, etc.)      |
|  - Runs investigate-loop orchestration            |
|  - Heavy token usage (client's cost)              |
|  - Connects via MCP tools                         |
+--------------------+-----------------------------+
                     | MCP Protocol (SSE)
+--------------------v-----------------------------+
|  OoA MCP Server (Cloudflare Workers)              |
|  - 30 tools across 7 groups                       |
|  - Auth: API key + scope-based access             |
|  - Rate limited: 120 calls/min                    |
|  - All writes create AuditEntry nodes             |
|  - Cypher sandbox for safe graph queries          |
+--------------------+-----------------------------+
                     | HTTP proxy
+--------------------v-----------------------------+
|  Webapp (Next.js + Neo4j + Built-in LLM)          |
|  - Review UI: proposals, audit, pipeline status   |
|  - User-facing LLM: summaries, Q&A, search        |
|  - Billable token usage (your revenue)            |
|  - Investigation creation wizard                   |
|  - End users approve/reject proposals              |
+--------------------------------------------------+
```

---

## 1. MCP Tool Surface (Complete the Server)

### Current State
- **Done (14 tools):** investigation.list/get/create/update/delete/mine/tags/upload_image, graph.query/node/expand/search/path/edge_provenance
- **Missing (16 tools):** Everything the investigate-loop needs to run autonomously

### Tools to Add

#### Group: Ingest (4 tools) — NEW
The missing front door. These let an orchestrating LLM feed data into the system.

| Tool | Input | Output | Notes |
|---|---|---|---|
| `ingest.add_entity` | `{caso_slug, label, properties, source_url?, confidence?}` | `{proposal_id, node_id}` | Creates bronze Proposal, not direct node. Dedup check against existing graph. |
| `ingest.add_relationship` | `{caso_slug, from_id, to_id, type, properties?}` | `{proposal_id}` | Creates edge Proposal. Validates both endpoints exist. |
| `ingest.import_csv` | `{caso_slug, csv_content, column_mapping, label}` | `{proposal_count, conflicts[]}` | Bulk import. Column mapping: `{csv_column: neo4j_property}`. Runs dedup, returns conflict report. Max 500 rows per call. |
| `ingest.import_url` | `{caso_slug, url, extract_entities?: boolean}` | `{content_summary, entities_found[], proposals_created}` | Fetches URL, extracts text. If `extract_entities`, runs regex extraction (dates, amounts, names) and creates bronze proposals. |

**Design decision:** All ingest tools create Proposals, never direct nodes. This preserves the human-review gate. The orchestrating LLM proposes; the webapp user approves.

#### Group: Pipeline (7 tools) — Wire existing APIs to MCP

| Tool | Input | Output | Notes |
|---|---|---|---|
| `pipeline.run` | `{caso_slug, stage?}` | `{pipeline_state_id, status}` | Start or resume pipeline. If `stage` omitted, runs next stage. |
| `pipeline.state` | `{caso_slug}` | `{current_stage, status, progress}` | Read current pipeline state. |
| `pipeline.stop` | `{caso_slug}` | `{stopped: true}` | Graceful stop at next gate. |
| `pipeline.proposals` | `{caso_slug, status?: "pending"\|"approved"\|"rejected", limit?}` | `{proposals[], total}` | List proposals with filtering. |
| `pipeline.approve` | `{proposal_ids[], rationale}` | `{approved_count}` | Batch approve. Creates AuditEntry. |
| `pipeline.reject` | `{proposal_ids[], rationale}` | `{rejected_count}` | Batch reject. Creates AuditEntry. |
| `pipeline.gate_action` | `{caso_slug, stage_id, action: "approve"\|"reject"\|"back"}` | `{next_stage}` | Gate decision. Advances or loops pipeline. |

#### Group: Verify (3 tools) — NEW

| Tool | Input | Output | Notes |
|---|---|---|---|
| `verify.check_entity` | `{node_id, search_queries[]}` | `{sources_found[], confidence_score}` | LLM-assisted verification. Runs web search, cross-references against graph, returns confidence assessment. Uses webapp's built-in LLM. |
| `verify.promote_tier` | `{node_ids[], from_tier, to_tier, evidence_url?}` | `{promoted_count}` | Promote bronze→silver or silver→gold. Creates AuditEntry with evidence. Requires rationale. |
| `verify.cross_reference` | `{caso_slug, match_type: "cuit"\|"dni"\|"name_fuzzy"}` | `{matches_found, same_entity_created}` | Run cross-reference pass. Uses existing dedup.ts engine. |

#### Group: Analyze (3 tools) — Wire existing code to MCP

| Tool | Input | Output | Notes |
|---|---|---|---|
| `analyze.detect_gaps` | `{caso_slug}` | `{isolated_nodes[], low_confidence[], missing_relationships[], questions[]}` | Uses existing gap-detector.ts. Returns structural gaps + suggested research questions. |
| `analyze.hypothesize` | `{caso_slug, hypothesis, evidence_ids[], confidence}` | `{proposal_id}` | Create hypothesis Proposal. Links to evidence nodes. |
| `analyze.run_analysis` | `{caso_slug, type: "procurement"\|"ownership"\|"connections"\|"temporal"\|"centrality"}` | `{findings[]}` | Runs existing MiroFish analysis functions (procurement anomalies, ownership chains, political connections) + new graph algorithm implementations. Uses webapp LLM. |

#### Group: Audit & Snapshots (4 tools) — Wire existing code to MCP

| Tool | Input | Output | Notes |
|---|---|---|---|
| `audit.log` | `{caso_slug, actor, action, details}` | `{entry_id, hash}` | Append to hash chain. |
| `audit.trail` | `{caso_slug, limit?, actor?}` | `{entries[]}` | Read audit history. |
| `audit.verify_chain` | `{caso_slug}` | `{valid: boolean, break_at?}` | Validate SHA-256 chain integrity. |
| `snapshot.create` | `{caso_slug, name}` | `{snapshot_id, node_count, edge_count}` | Capture graph state. |

#### Group: Orchestrator (3 tools) — Wire existing code to MCP

| Tool | Input | Output | Notes |
|---|---|---|---|
| `orchestrator.state` | `{caso_slug}` | `{active_tasks, synthesis_reports, metrics}` | Full orchestrator dashboard data. |
| `orchestrator.set_focus` | `{caso_slug, directives[]}` | `{updated: true}` | Set/update research directives. Directives guide which hypotheses get priority in iterate stage. |
| `orchestrator.tasks` | `{caso_slug, status?}` | `{tasks[]}` | List orchestrator task queue. |

### MCP Resources (5 resources) — NEW

Context injection for LLM clients. These provide investigation context without tool calls.

| Resource URI | Returns |
|---|---|
| `investigation://{slug}/summary` | Investigation overview: node counts, tier breakdown, last activity, key findings |
| `investigation://{slug}/schema` | Node types, relationship types, property definitions |
| `investigation://{slug}/gaps` | Current gap report from gap-detector |
| `investigation://{slug}/directives` | Active research directives and their status |
| `investigation://{slug}/pipeline` | Pipeline state, pending proposals count, last gate decision |

### Cypher Sandbox — REQUIRED before exposing graph.query

The existing `graph.query` tool passes raw Cypher. Before external clients use it:

- Whitelist read-only operations (MATCH, RETURN, WITH, ORDER BY, LIMIT, WHERE)
- Block writes (CREATE, MERGE, SET, DELETE, REMOVE, CALL)
- Auto-inject `caso_slug` filter (prevent cross-investigation reads)
- Query timeout: 10 seconds max
- Result size cap: 1000 nodes max
- Log all queries to AuditEntry

---

## 2. Investigation Creation Flow (Webapp)

### The User Flow

```
[Homepage] → "New Investigation" button
    ↓
[Step 1: Name & Describe]
    → Title (bilingual: ES/EN)
    → One-line description
    → Tags (free text, autocomplete from existing)
    → Status: draft (default)
    ↓
[Step 2: Seed Entity — "Who or what are you investigating?"]
    → Text input
    → System searches existing Neo4j graph across ALL investigations
    → Shows matches: "Jeffrey Epstein (caso-epstein, 1,345 connections)"
    → User can: select existing entity, or create new
    → If new: pick type (Person, Organization, Event) from palette
    ↓
[Step 3: Scope — "Include nearby connections?"]
    → Shows 1-hop neighbors of seed entity
    → Checkboxes to include/exclude
    → "Include all" / "Start minimal" shortcuts
    → Creates caso_slug namespace, copies selected nodes
    ↓
[Step 4: Add Data (optional, can skip)]
    → Tabs: "Upload CSV" | "Paste Names" | "Enter URL" | "Connect API"
    → Each creates bronze Proposals (not direct nodes)
    → Preview before submit
    ↓
[Step 5: Landing — Investigation Dashboard]
    → Graph view with selected nodes
    → Sidebar: "Add more data", "Run pipeline", "Configure"
    → Pipeline status panel
    → Proposal review queue (if any from Step 4)
```

### What This Requires (New Code)

| Component | Type | Notes |
|---|---|---|
| `POST /api/investigations/create-caso` | API route | Creates InvestigationConfig + SchemaDefinition + initial nodes in Neo4j. Generates caso_slug. Registers in runtime registry. |
| `src/app/nuevo/page.tsx` | Page | Investigation creation wizard (Steps 1-4) |
| `src/components/investigation/SeedEntitySearch.tsx` | Component | Cross-investigation entity search with type-ahead |
| `src/components/investigation/ScopeSelector.tsx` | Component | 1-hop neighbor selection with checkboxes |
| `src/components/investigation/DataImport.tsx` | Component | Tabbed import UI (CSV, paste, URL, API) |
| `src/components/investigation/EntityPalette.tsx` | Component | Sidebar with draggable entity types (Person, Org, Event, Document, Location) |

### Dynamic Investigation Registry

Currently `registry.ts` is a hardcoded Map. For dynamic creation:

```typescript
// New: load from Neo4j at runtime, cache in memory
async function getClientConfig(casoSlug: string): Promise<InvestigationClientConfig> {
  // 1. Check in-memory cache
  // 2. Query Neo4j: MATCH (c:InvestigationConfig {caso_slug: $slug}) RETURN c
  // 3. Build InvestigationClientConfig from DB fields
  // 4. Cache for 5 minutes
  // 5. Fall back to static registry for legacy cases
}
```

This means new investigations created through the wizard are immediately navigable at `/caso/[slug]` without code changes or deploys.

---

## 3. Webapp Review UI (Complete the Dashboard)

### Current State
The engine dashboard exists (`/caso/[slug]/motor/`) with tabs: Pipeline, Proposals, Audit, Snapshots, Orchestrator. Components are real React code with fetch calls.

### What's Missing

| Component | What It Needs | Priority |
|---|---|---|
| **"Run Pipeline" button** | Currently calls API but no feedback. Needs: loading state, stage progress, real-time status polling (5s interval). | HIGH |
| **Proposal Review UX** | Batch approve/reject exists but needs: diff view (what will this proposal change?), source link, confidence badge, bulk select by stage/type. | HIGH |
| **Data Import Panel** | New tab on dashboard. CSV upload with column mapping, URL fetch with preview, paste names with entity type selector. All create Proposals. | HIGH |
| **Connector Config** | UI to create SourceConnector nodes. Form: name, type (REST API / file / script), config JSON, field mapping. For power users. | MEDIUM |
| **Model Config** | UI to select LLM provider per stage. Form: provider (llamacpp/openai/anthropic), endpoint, model name, API key env var. | MEDIUM |
| **Pipeline Config** | UI to define stage order, gates, stage-specific config. Drag-and-drop stage reordering. | LOW |
| **Real-time Progress** | WebSocket or SSE for pipeline execution updates. Currently polling-only. | LOW (polling works) |

---

## 4. MiroFish Decision: Absorb and Retire

### Current State
- **LLM Analysis** (`analysis.ts`): Working. Wraps Qwen 3.5 for procurement/ownership/connection analysis.
- **Swarm Simulation** (`client.ts`, `export.ts`): Dead code. Backend never deployed. UI is "Coming Soon."

### Decision: Absorb the analysis, kill the swarm brand

**What to do:**

1. **Move analysis functions into engine stages:**
   - `analyzeProcurementAnomalies()` → `analyze.ts` stage (add as analysis type)
   - `analyzeOwnershipChains()` → `analyze.ts` stage
   - `analyzePoliticalConnections()` → `analyze.ts` stage
   - These become callable via `analyze.run_analysis` MCP tool

2. **Kill MiroFish simulation infrastructure:**
   - Delete `src/lib/mirofish/client.ts` (swarm API stubs)
   - Delete `src/lib/mirofish/export.ts` (seed export for non-existent backend)
   - Delete `src/lib/mirofish/types.ts` (simulation types)
   - Delete `src/components/investigation/SimulationPanel.tsx` (dead code)
   - Delete `src/components/investigation/AgentChat.tsx` (dead code)
   - Delete `src/app/api/caso-libra/simulate/` routes (dead API)
   - Keep `src/lib/mirofish/analysis.ts` and `prompts.ts` (move to `src/lib/engine/analysis/`)

3. **Repurpose `/simular` page:**
   - Instead of "Coming Soon" swarm simulation, make it the **"What-If" analysis page**
   - User types a hypothesis → webapp LLM analyzes against graph data → returns assessment with evidence
   - This is simpler, actually works, and delivers the same user value
   - The external MCP client can do deeper scenario analysis through the MCP tools

4. **Remove MiroFish from config:**
   - Remove `MiroFishConfig` from engine types
   - Remove `HAS_MIROFISH` relationship from schema
   - Simplify engine config: just `ModelConfig` for LLM provider selection

**Why:** The swarm simulation was a cool idea but adds complexity without value. The MCP architecture already enables multi-agent orchestration — any LLM client connecting via MCP *is* the multi-agent system. No need for a separate simulation backend.

---

## 5. Graph Algorithms: Implement the Stubs

### Current State
`src/lib/engine/algorithms/` has 4 files with only type definitions. The `analyze` stage calls them but they return nothing.

### Implement in TypeScript (not Neo4j GDS)

| Algorithm | Implementation | Complexity | Used By |
|---|---|---|---|
| **Degree centrality** | Count relationships per node via Cypher `MATCH (n)-[r]-() RETURN n, count(r)` | O(n) | `analyze.run_analysis` MCP tool |
| **Betweenness centrality** | BFS-based approximation. Sample 100 random source nodes, run shortest paths, count intermediaries. | O(k * n) where k=100 | Gap detection, identifying bridge nodes |
| **Community detection** | Label propagation. Each node adopts most common neighbor label. Iterate until stable (max 20 iterations). | O(n * edges * iterations) | Cluster identification, "who belongs together" |
| **Temporal patterns** | Event co-occurrence within configurable time windows (7d, 30d, 90d). Return pairs of events that cluster. | O(events^2) | Timeline analysis, "what happened around the same time" |
| **Anomaly detection** | Statistical outliers: nodes with degree > 3 standard deviations from mean, temporal gaps > 2x average interval, isolated clusters with < 3 nodes. | O(n) | Flag suspicious patterns |

**Size constraint:** All algorithms run in-memory from Cypher result sets. Feasible for <10K nodes. For larger graphs, add pagination/sampling.

---

## 6. Task Delegation: Us vs Ralph

### We Build (High-stakes, architecture-defining)

| Task | Reason |
|---|---|
| MCP tool implementations (16 new tools) | Core architecture, must be right |
| Cypher sandbox | Security-critical |
| Investigation creation wizard | UX-critical, defines user experience |
| Dynamic investigation registry | Architectural change to how cases load |
| MiroFish absorption into engine | Structural refactor |
| `ingest.add_entity` / `ingest.add_relationship` | Core data flow, must handle dedup correctly |

### Ralph Builds (Well-scoped, pattern-following)

| Task | Scope | Notes |
|---|---|---|
| Graph algorithm implementations (5) | Each is a single file, clear interface | Give exact function signatures |
| MCP resources (5) | Each is a handler returning JSON | Template from existing tools |
| Data Import UI components | React forms following existing component patterns | Provide mockups |
| Connector/Model Config UI | CRUD forms for existing Neo4j node types | Pattern: existing ProposalReview.tsx |
| Pipeline progress polling | Add `useEffect` interval to PipelineStatus.tsx | Straightforward |
| "What-If" analysis page | Replace simulation "Coming Soon" | Use existing LLM provider |
| Dead code cleanup | Delete MiroFish simulation files | List exact files |
| API key management UI (M13 Phase 6) | CRUD for KV-stored API keys | Following existing settings patterns |
| MCP server Phase 3-4 tools | Wire pipeline/orchestrator/audit tools | Same proxy pattern as Phase 2 |

### Task Format for Ralph (TASKS.md entries)

Each Ralph task should include:
- **Exact file paths** to create/modify
- **Function signatures** or component props
- **Pattern to follow** (reference existing file)
- **Acceptance criteria** (what "done" looks like)
- **Dependencies** (which tasks must finish first)

---

## 7. Implementation Order

```
Phase 1: Foundation (us)              Phase 1b: Cleanup (Ralph, parallel)
├─ Cypher sandbox                     ├─ Delete MiroFish simulation files
├─ Dynamic investigation registry     ├─ Graph algorithm implementations
├─ ingest.add_entity MCP tool         ├─ MCP resources (5)
├─ ingest.add_relationship MCP tool   └─ Dead code cleanup
├─ ingest.import_csv MCP tool
└─ ingest.import_url MCP tool

Phase 2: Pipeline MCP (us)            Phase 2b: UI (Ralph, parallel)
├─ pipeline.* MCP tools (7)           ├─ Data Import UI (CSV, URL, paste)
├─ verify.* MCP tools (3)             ├─ Connector Config UI
├─ analyze.* MCP tools (3)            ├─ Model Config UI
└─ MiroFish analysis absorption       └─ Pipeline progress polling

Phase 3: Orchestrator MCP (us)        Phase 3b: Pages (Ralph, parallel)
├─ orchestrator.* MCP tools (3)       ├─ Investigation creation wizard
├─ audit.* MCP tools (3)              ├─ "What-If" analysis page
├─ snapshot.* MCP tools (1)           ├─ API key management UI
└─ End-to-end test                    └─ Proposal review UX improvements
```

**Estimated scope:**
- Us: 16 MCP tools + Cypher sandbox + dynamic registry + MiroFish absorption = ~15-20 files
- Ralph: 5 algorithms + 5 resources + 6 UI components + cleanup = ~20 files
- Both streams can run in parallel after Phase 1 foundation

---

## 8. Success Criteria

The system is "done" when an external LLM client can:

1. `investigation.create` → new caso with schema
2. `ingest.import_url` → fetch a source, extract entities as bronze proposals
3. `ingest.add_entity` / `ingest.add_relationship` → manually build graph
4. `pipeline.run` → start pipeline (verify → enrich → analyze → iterate)
5. `pipeline.proposals` → see what the pipeline found
6. `pipeline.approve` → approve good proposals into graph
7. `analyze.detect_gaps` → find what's missing
8. `orchestrator.set_focus` → direct the next research iteration
9. Loop back to step 2 with new URLs/entities

And a webapp user can:
1. Create a new investigation via wizard (no CLI needed)
2. Upload CSV/JSON or paste names to seed initial data
3. See pipeline running with progress indication
4. Review and approve/reject proposals
5. Ask "what if" questions against the graph via built-in LLM

---

## Appendix: Files to Delete (MiroFish Cleanup)

```
src/lib/mirofish/client.ts          # Swarm API stubs
src/lib/mirofish/export.ts          # Seed export for non-existent backend
src/lib/mirofish/types.ts           # Simulation types
src/components/investigation/SimulationPanel.tsx
src/components/investigation/AgentChat.tsx
src/components/investigation/ScenarioInput.tsx
src/app/api/caso-libra/simulate/    # Dead API routes
scripts/export-caso-libra-seed.ts   # Export script for dead backend
```

## Appendix: Files to Move (MiroFish Analysis Absorption)

```
src/lib/mirofish/analysis.ts  → src/lib/engine/analysis/analysis.ts
src/lib/mirofish/prompts.ts   → src/lib/engine/analysis/prompts.ts
```

Update imports in `scripts/run-investigation-loop.ts` and add as analysis types in `analyze.ts` stage runner.
