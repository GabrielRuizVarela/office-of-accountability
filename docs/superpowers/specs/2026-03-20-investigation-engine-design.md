# Investigation Engine — Design Specification

**Date:** 2026-03-20
**Status:** Approved (v2 — database-native architecture)
**Scope:** General-purpose, automated investigation pipeline integrated into Office of Accountability

---

## 1. Overview

The Investigation Engine is a structured, automated, template-driven system for conducting reproducible investigations. It generalizes the existing Epstein investigation workflow into a reusable framework applicable to any domain — public accountability, corporate OSINT, land ownership, or fully custom research.

Investigation configuration (schema, sources, pipeline, state) lives in **Neo4j as first-class graph entities**, managed through the webapp UI. The engine runs within the Next.js application, executing pipeline stages as server-side operations with gates rendered as interactive webapp pages.

### Relationship to PRD

The PRD defines an `Investigation` as a content type — a long-form document with embedded graph references. The Investigation Engine is a process that automates the research phase:

```
Investigation Engine (pipeline)
  → discovers nodes, relationships, patterns
  → produces hypotheses with evidence
  → researcher reviews at gates (webapp UI)
  → approved findings become...
    → Bronze/Silver graph nodes (PRD open schema)
    → Claim nodes with status: pending (PRD claim pattern)
    → Investigation documents (PRD Section 5.3)
```

The engine is an accelerator, not a replacement. Manual investigation remains fully supported.

---

## 2. Core Concepts

### Database-Native Configuration

All investigation configuration — schema definitions, source connectors, pipeline stages, audit entries, proposals, snapshots — lives as Neo4j nodes and relationships. The webapp reads and writes these directly. No filesystem YAML, no CLI tool, no git-for-config complexity.

Benefits:
- **Single source of truth** — Neo4j holds both config and data
- **Webapp-first** — researchers interact entirely through the UI
- **Queryable** — investigation metadata is traversable alongside investigation data
- **No sync issues** — no filesystem ↔ database coordination

### Human-at-the-Gates

Automation handles data collection and processing. The researcher makes decisions at gates: which sources to trust, which connections look real, which hypotheses to pursue. Between gates, the system suggests next moves, surfaces anomalies, and handles grunt work. Gates are rendered as interactive pages in the webapp.

### LLM Never Writes Directly

The LLM agent produces proposals — proposed nodes, edges, hypotheses, report sections — stored as `Proposal` nodes in Neo4j. They accumulate until the next gate, where the researcher approves, modifies, or rejects them through the UI. Nothing is written to the investigation graph without human review.

### Neo4j Namespace Implementation

Neo4j Community has no native namespace or multi-database support. Namespacing is implemented via the existing `caso_slug` property on every node and relationship. All engine-generated Cypher queries filter by `WHERE n.caso_slug = $casoSlug`.

This continues the existing pattern in the codebase (see `dedup.ts`: `WHERE n.caso_slug = $casoSlug`). The engine maps the investigation's `id` to `caso_slug` in the Cypher generation layer — no data migration needed.

**Dynamic UNIQUE constraints:** When a researcher defines a new node type in the schema (e.g., `Parcel` for a land ownership investigation), the engine creates a UNIQUE constraint for `{NodeType}.id` using `IF NOT EXISTS`. This follows the existing idempotent pattern in `schema.ts`.

**Relationship isolation:** Relationships do NOT carry a `caso_slug` property (Neo4j Community has no relationship property indexes). Isolation is achieved through node-level filtering — if both endpoints belong to an investigation, the relationship implicitly does too.

---

## 3. Data Model — Investigation Config in Neo4j

### 3.1 Config Node Types

```
(InvestigationConfig)
  -[:HAS_SCHEMA]-> (SchemaDefinition)
    -[:DEFINES_NODE_TYPE]-> (NodeTypeDefinition {name, properties_json, color, icon})
    -[:DEFINES_REL_TYPE]-> (RelTypeDefinition {name, from_types, to_types, properties_json})
  -[:HAS_SOURCE]-> (SourceConnector {name, type, config_json, mapping_json, dedup_config_json, tier})
  -[:HAS_PIPELINE]-> (PipelineConfig)
    -[:HAS_STAGE]-> (PipelineStage {id, name, type, order, config_json})
      -[:HAS_GATE]-> (Gate {type, prompt, actions, show_components})
  -[:HAS_MODEL]-> (ModelConfig {name, provider, endpoint, model, config_json, api_key_env})
  -[:HAS_MIROFISH]-> (MiroFishConfig {endpoint, llm_backend})
  -[:CURRENT_STATE]-> (PipelineState {current_stage, status, progress_json})
  -[:HAS_SNAPSHOT]-> (Snapshot {name, created, stage, graph_state_json, pipeline_state_json})
  -[:FORKED_FROM]-> (InvestigationConfig)  # for branches
```

### 3.2 InvestigationConfig Node

```typescript
interface InvestigationConfig {
  id: string                    // e.g., "caso-epstein"
  name: string                  // "Jeffrey Epstein Network Investigation"
  description: string
  template_id?: string          // which template seeded this
  created: Date
  tags: string[]
  caso_slug: string             // maps to caso_slug on all data nodes
  status: 'draft' | 'running' | 'paused' | 'completed'
  branch?: string               // 'main' or branch name
}
```

### 3.3 SchemaDefinition

Researchers define node types and relationship types through the webapp UI. Each type becomes a `NodeTypeDefinition` or `RelTypeDefinition` node:

```typescript
interface NodeTypeDefinition {
  name: string                  // e.g., "Person", "Organization", "Parcel"
  properties_json: string       // JSON: {name: {type:"string", required:true}, role: {type:"string"}}
  color: string                 // hex color for graph visualization
  icon: string                  // icon identifier
}

interface RelTypeDefinition {
  name: string                  // e.g., "ASSOCIATED_WITH", "FINANCED"
  from_types: string[]          // which node types can be the source
  to_types: string[]            // which node types can be the target
  properties_json: string       // JSON: property definitions
}
```

All nodes created by the engine automatically receive provenance fields: `confidence_tier`, `source`, `source_url`, `ingestion_wave`, `created_at`, `created_by`, `pipeline_stage`, `proposed_by`.

### 3.4 SourceConnector

Each source connector is a node with its configuration stored as JSON properties:

```typescript
interface SourceConnector {
  id: string
  name: string                  // "Epstein Exposed API"
  type: 'rest-api' | 'file-upload' | 'web-scraper' | 'court-records' | 'corporate-registry' | 'custom-script'
  config_json: string           // type-specific config (base_url, endpoints, rate_limit, etc.)
  mapping_json: string          // field mapping: source fields → schema node/rel types
  dedup_config_json: string     // {strategy, threshold, match_fields}
  tier: 'bronze' | 'silver'
  enabled: boolean
  resume_state_json?: string    // for resumable connectors
}
```

#### Built-in Connector Types

| Type | Description |
|------|-------------|
| `rest-api` | Paginated REST APIs with rate limiting and resumability |
| `file-upload` | Uploaded files (CSV, JSON, PDF) — stored in webapp's upload directory |
| `web-scraper` | Fetch and extract from HTML pages |
| `court-records` | CourtListener, PACER |
| `corporate-registry` | OpenCorporates, SEC EDGAR |
| `custom-script` | Server-side script that outputs JSONL |

#### Dedup Two-Pass Model

Dedup runs at two distinct points:
- **Source-level dedup** (per SourceConnector's `dedup_config_json`): runs at connector time, deduplicates incoming records against the existing graph. Pre-filter to prevent obvious duplicates.
- **Pipeline-level dedup** (verify stage config): cross-source global pass after all sources ingested. Catches duplicates between sources.

Both use the existing Levenshtein algorithm from `dedup.ts`. Thresholds can differ between passes.

### 3.5 PipelineStage & Gate

```typescript
interface PipelineStage {
  id: string                    // "ingest", "verify", "enrich", "analyze", "report"
  name: string                  // display name
  type: 'ingest' | 'verify' | 'enrich' | 'analyze' | 'report'
  order: number                 // execution order
  config_json: string           // stage-specific config (agents, algorithms, LLM directives, etc.)
}

interface Gate {
  type: 'human_review' | null   // null = no gate, fully automated
  prompt: string                // what to show the researcher
  actions: string[]             // e.g., ["approve", "reject", "partial", "back_to_analyze"]
  show_components: string[]     // e.g., ["conflicts_summary", "node_edge_counts", "random_sample"]
}
```

#### Default Pipeline Stages

1. **ingest** — run source connectors, collect data, dedup, write bronze nodes
2. **verify** — dispatch parallel verification agents, propose tier promotions, cross-source dedup
3. **enrich** — fetch document content, LLM entity extraction, reverse lookups
4. **analyze** — graph algorithms + LLM analysis (tool-agent or swarm mode)
5. **report** — LLM drafts investigation report

Each stage can have a gate (blocking human review) or `gate: null` for fully automated stages.

#### Pipeline Properties

- **Stages are re-runnable.** Re-running `ingest` after adding a new source only processes what's new.
- **Gates are blocking.** The pipeline stops and renders the gate UI. Gate decisions are recorded as `AuditEntry` nodes.
- **Stages can loop.** The `back_to_analyze` action on the report gate loops back.
- **LLM scope is per-stage.** Each stage defines what the LLM can do.

### 3.6 Proposals

All LLM/connector output that modifies the graph is captured as `Proposal` nodes:

```typescript
interface Proposal {
  id: string
  investigation_id: string
  stage: string                 // which pipeline stage created this
  type: 'node' | 'edge' | 'promotion' | 'merge' | 'hypothesis' | 'report_section'
  payload_json: string          // the proposed change
  confidence: number            // 0-1
  reasoning: string             // why the LLM/agent proposed this
  proposed_by: string           // "llm:qwen-3.5-9b" | "connector:epstein-exposed" | "algorithm:centrality"
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string          // researcher who reviewed
  reviewed_at?: Date
  review_rationale?: string
}
```

Proposals accumulate during a stage and are presented at the gate for batch review.

### 3.7 AuditEntry

Every action — human or machine — creates an `AuditEntry` node linked to the investigation:

```typescript
interface AuditEntry {
  id: string
  investigation_id: string
  ts: Date                      // ISO timestamp
  actor: string                 // "engine" | "researcher:gabriel" | "llm:qwen-3.5-9b" | "connector:epstein-exposed"
  action: string                // "stage_start" | "node_created" | "gate_decision" | "proposal_approved" | ...
  details_json: string          // action-specific context
  prev_hash: string             // SHA-256 of previous entry for tamper detection
}
```

`(InvestigationConfig)-[:HAS_AUDIT]->(AuditEntry)-[:NEXT]->(AuditEntry)`

**Hash chain:** Each entry includes `prev_hash` containing the SHA-256 hash of the previous entry's JSON representation. The first entry uses `prev_hash: "genesis"`. The engine validates the chain on startup.

### 3.8 Snapshots

Named checkpoints stored as `Snapshot` nodes:

```typescript
interface Snapshot {
  id: string
  investigation_id: string
  name: string                  // "pre-financial-deep-dive"
  created: Date
  stage: string                 // which stage was active
  graph_state_json: string      // {node_count, edge_count, tier_breakdown}
  pipeline_state_json: string   // {completed_stages, current_stage, proposals_pending}
}
```

- Auto-created at every gate approval
- Manually created through the dashboard UI
- Snapshots record state metadata; restore regenerates from audit log replay up to the snapshot point

### 3.9 Forking

Forking creates a new `InvestigationConfig` node linked to the parent via `FORKED_FROM`:

```
(Fork:InvestigationConfig {branch: "hypothesis-money-laundering"})
  -[:FORKED_FROM]-> (Parent:InvestigationConfig {id: "caso-epstein"})
```

**Lazy forking (copy-on-write):** The fork initially contains no data nodes. Queries against the fork read through to the parent namespace. Only when a node is modified or created in the fork does it get its own copy (with `caso_slug` set to the fork's namespace, e.g., `caso-epstein__money-laundering`). This avoids duplicating 10K+ nodes per fork.

**Merge:** The engine performs a graph diff between fork and parent. New/modified nodes are proposed as additions to the parent, presented at a merge gate for review. Approved additions carry provenance tracking back to the fork branch.

---

## 4. LLM Abstraction Layer

### 4.1 Provider Interface

All providers implement the same interface:

```typescript
interface LLMProvider {
  chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse>
  stream(messages: Message[], options?: LLMOptions): AsyncIterable<LLMChunk>
}

interface LLMResponse {
  content: string
  reasoning?: string       // for models with thinking mode (Qwen, Claude)
  tool_calls?: ToolCall[]  // for agent actions
  usage: { prompt_tokens: number, completion_tokens: number }
}
```

**Provider field mapping:** Each provider adapter maps vendor-specific response fields to `LLMResponse`. The `llamacpp` provider must map Qwen's `reasoning_content` field to `reasoning` (Qwen 3.5 uses mandatory thinking mode — the analysis is in `reasoning_content`, not `content`). The `anthropic` provider maps `thinking` blocks similarly. This mapping is mandatory — without it, proposals from thinking-mode models will have empty reasoning.

#### Built-in Providers

| Provider | Description |
|----------|-------------|
| `llamacpp` | OpenAI-compatible `/v1/chat/completions` (Qwen, Llama, etc.) |
| `openai` | OpenAI API |
| `anthropic` | Anthropic API |
| `ollama` | Local Ollama instance |
| `custom` | Any OpenAI-compatible endpoint |

### 4.2 Three Execution Modes

#### `single` — Direct LLM Call

Prompt in, text out. No tools, no agents. Used for summarization, report drafting, entity extraction.

#### `tool-agent` — LLM with Scoped Tools

The LLM gets investigation-scoped tools depending on the stage:

| Stage | Available Tools |
|-------|----------------|
| `enrich` | read_graph, propose_node, propose_edge, fetch_url, extract_entities |
| `analyze` | read_graph, run_algorithm, propose_hypothesis, compare_timelines |
| `report` | read_graph, read_hypotheses, draft_section |

The agent never writes directly — it produces `Proposal` nodes queued for gate review.

#### `swarm` — MiroFish Multi-Agent Simulation

Graph entities become autonomous agents that interact. The existing `graphToMiroFishSeed()` export is generalized to read `agent_source` and `context_from` from the stage config rather than hardcoding `Person`, `Organization`, `Location`.

Swarm config (stored in PipelineStage's `config_json`):
```json
{
  "llm": {
    "mode": "swarm",
    "model": "default",
    "swarm": {
      "agent_source": "Person",
      "context_from": ["Organization", "Location", "Document"],
      "scenario": "Analyze network patterns and hidden connections"
    }
  }
}
```

**Migration note:** The existing `mirofish/client.ts` reads `process.env.MIROFISH_API_URL` at module load. The `endpoint` parameter must be added to the exported public functions (`initializeSimulation`, `querySimulation`, `getSimulationStatus`) so the engine can pass per-investigation endpoints from the `MiroFishConfig` node. The MiroFish endpoint (port 5000) is separate from the llama.cpp LLM server (port 8080).

---

## 5. Execution Engine

### 5.1 Process Model

The engine runs **inside the Next.js application** as server-side operations:

- **Stage execution** happens in API routes / server actions, triggered by the webapp UI
- **Long-running stages** (ingestion, enrichment) run as background tasks with progress reported via `PipelineState` node updates
- **Gates** are rendered as interactive webapp pages — the researcher reviews proposals inline and submits decisions
- **State** is persisted in Neo4j (`PipelineState`, `Proposal`, `AuditEntry` nodes) — no filesystem state files

### 5.2 Webapp Routes

```
/investigations                          → investigation library
/investigations/new                      → create wizard (pick template, define schema, configure sources)
/investigations/[id]                     → dashboard (status, progress, stats, audit log)
/investigations/[id]/schema              → schema editor (node types, rel types)
/investigations/[id]/sources             → source connector config
/investigations/[id]/pipeline            → pipeline stage config
/investigations/[id]/gate/[stageId]      → gate review UI (proposals, approve/reject)
/investigations/[id]/branches            → fork/branch management
/investigations/[id]/snapshots           → snapshot list, restore
/investigations/[id]/audit               → full audit log viewer
/investigations/[id]/report              → generated report view/edit
/caso/[slug]/grafo                       → graph explorer (existing, now investigation-aware)
/caso/[slug]/simulacion                  → MiroFish simulation (existing, now uses investigation's model config)
```

### 5.3 Execution Flow

```
Researcher clicks "Run Pipeline" on dashboard
  │
  ├─ API route reads InvestigationConfig + PipelineConfig from Neo4j
  ├─ Resolves current stage from PipelineState node
  │
  ├─ Stage: ingest
  │   ├─ Read SourceConnector nodes
  │   ├─ Run connectors server-side (parallel where independent)
  │   ├─ Dedup against existing graph (caso_slug filter)
  │   ├─ Write bronze nodes to Neo4j
  │   ├─ Create AuditEntry nodes
  │   ├─ Update PipelineState → status: "gate_pending"
  │   └─ Redirect to /investigations/[id]/gate/ingest
  │
  ├─ Gate: ingest review
  │   ├─ UI shows: conflicts, node/edge counts, random sample
  │   ├─ Researcher approves/rejects
  │   ├─ AuditEntry created with decision + rationale
  │   ├─ Snapshot auto-created
  │   ├─ PipelineState → next stage
  │   └─ Redirect to dashboard or next stage
  │
  ├─ Stage: verify
  │   ├─ Dispatch parallel agents (server-side, per stage config)
  │   ├─ Each agent: query graph → web search → create Proposal nodes
  │   ├─ Update PipelineState → status: "gate_pending"
  │   └─ Redirect to /investigations/[id]/gate/verify
  │
  ├─ ... (enrich, analyze, report — same pattern)
  │
  └─ Pipeline complete → PipelineState status: "completed"
```

### 5.4 Parallel Agent Dispatch

Stages with parallel agents dispatch multiple server-side tasks concurrently. Each agent:
- Has a scoped query against the graph (node type, filter, limit)
- Performs its action (web_verify, dedup, sanitize, analyze)
- Creates `Proposal` nodes
- Updates progress on the `PipelineState` node

Agent scope queries use structured filters (not string expressions):
```json
{
  "scope": {
    "node_type": "Person",
    "filter": {"property": "confidence_tier", "op": "eq", "value": "bronze"},
    "order_by": {"computed": "connection_count"},
    "limit": 50
  }
}
```

Computed `order_by` values (like `connection_count`) generate Cypher aggregation subqueries: `ORDER BY COUNT { (n)--(m) WHERE m.caso_slug = $casoSlug } DESC`.

### 5.5 Cycle Mode

For continuous monitoring (e.g., wave 2 API data trickling in), the webapp supports scheduled re-runs:

- Researcher configures a cycle interval on the dashboard (e.g., every 30 minutes)
- A server-side cron/interval triggers stage execution
- When a gate is reached, the cycle **blocks** — no further ticks until the researcher acts
- Subsequent ticks while a gate is pending are no-ops
- Stages configured with `gate: null` run fully automated

---

## 6. Template System

### 6.1 Templates as Neo4j Seed Data

Templates are `InvestigationTemplate` nodes with pre-configured schema, sources, and pipeline stages:

```
(InvestigationTemplate {id, name, description, tags})
  -[:TEMPLATE_SCHEMA]-> (SchemaDefinition)
    -[:DEFINES_NODE_TYPE]-> (NodeTypeDefinition) ...
  -[:TEMPLATE_SOURCE]-> (SourceConnector) ...
  -[:TEMPLATE_PIPELINE]-> (PipelineConfig)
    -[:HAS_STAGE]-> (PipelineStage) ...
```

#### Built-in Templates

| Template | Node Types | Use Case |
|----------|-----------|----------|
| `public-accountability` | Person, Organization, Location, Document, Event, LegalCase, Flight | Political investigations, public figure networks |
| `corporate-osint` | Company, Officer, Filing, Transaction, Beneficial_Owner, Jurisdiction | Corporate fraud, shell company networks |
| `land-ownership` | Parcel, Owner, Transfer, Lien, Developer, Permit | Property investigation, land grabs |
| `blank` | (none — researcher defines all) | Fully custom investigations |

### 6.2 Creating from Template

"Create Investigation" wizard flow:
1. Pick template (or blank)
2. Name, describe, tag the investigation
3. Schema editor — template types are pre-loaded, researcher adds/removes/modifies
4. Source connector setup — template sources pre-loaded, researcher configures endpoints/credentials, adds custom sources
5. Pipeline config — template stages pre-loaded, researcher adjusts gates, assigns LLM models
6. Create → engine clones template nodes into new `InvestigationConfig` subgraph

### 6.3 Community Templates

Templates can be exported as JSON bundles and imported:

```
/investigations/templates                → template library
/investigations/templates/import         → upload JSON bundle
/investigations/templates/[id]/export    → download as JSON
```

Future: a community template registry where researchers publish and discover templates.

### 6.4 Caso Epstein as Reference Instance

The current Epstein investigation becomes the reference implementation — a concrete instance of `public-accountability` with:
- 7 node types, 11+ relationship types
- 4 source connectors (rhowardstone, epstein-exposed, courtlistener, dleerdefi)
- Full pipeline with MiroFish swarm analysis
- 10,864+ nodes as existing data

---

## 7. Graph Algorithms

Graph algorithms run **application-side in TypeScript** (not in Neo4j). At 10K nodes this is feasible and avoids dependency on Neo4j GDS (Enterprise-only).

| Algorithm | Purpose | Implementation |
|-----------|---------|----------------|
| **Degree centrality** | Identify most-connected nodes | Count relationships per node |
| **Betweenness centrality** | Find bridge nodes | BFS-based approximation (extend existing `algorithms.ts`) |
| **Community detection** | Find clusters | Label propagation (iterative, O(n) per pass) |
| **Anomaly detection** | Unusual patterns | Statistical outliers on degree, temporal gaps, isolated clusters |
| **Temporal patterns** | Timeline correlations | Event co-occurrence within time windows |

Results are stored as `Proposal` nodes of type `hypothesis`, presented at the analyze gate for researcher review.

---

## 8. Audit Trail & Reproducibility

### 8.1 Audit Log

Every action creates an `AuditEntry` node (Section 3.7). The audit log is:
- **Append-only** — entries are never modified or deleted
- **Hash-chained** — tamper-evident via `prev_hash` SHA-256 chain
- **Queryable** — filterable by actor, action, stage, time range via the webapp UI
- **Aligned with PRD** — same structured JSON format as PRD Section 6.3

### 8.2 Reproducibility

- **Audit trail** — complete forensic record of every action (human and machine), with timestamps, actors, and rationale
- **Re-runnable** — snapshots record pipeline state; restoring a snapshot and re-running produces equivalent results
- **Forkable** — lazy copy-on-write forking lets researchers explore hypothesis branches without data duplication

---

## 9. PRD Integration Points

### 9.1 Mapping to PRD Concepts

| Engine Output | PRD Concept | How |
|---------------|-------------|-----|
| Proposed nodes/edges | Bronze-tier graph additions | Per PRD open schema (Section 5.2) |
| Verified promotions | Silver-tier upgrades | Per PRD tiered trust (Section 5.1) |
| LLM hypotheses | `Claim` nodes, `status: pending` | Per PRD claim pattern (Section 4.2) |
| Investigation reports | `Investigation` documents | Per PRD Section 5.3, with `REFERENCES` edges |
| Audit entries | Platform audit log | Aligned format with PRD Section 6.3 |

### 9.2 Provenance Extension

The PRD's provenance record is extended with engine-specific fields:

```typescript
interface EngineProvenance extends ProvenanceRecord {
  pipeline_stage: string       // which stage created this
  proposed_by: string          // 'engine' | 'llm:model-name' | 'connector:source-name'
  proposal_id: string          // reference to the proposal that was approved
  investigation_id: string     // which investigation this belongs to
  branch: string               // 'main' or branch name
}
```

### 9.3 Coalition Integration

Investigations can be coalition-owned. Multiple researchers can participate at gates — gate decisions require consensus based on coalition roles (Admin/Editor).

---

## 10. Existing Code Migration

| Current Code | Engine Component |
|---|---|
| `scripts/ingest-wave-*.ts` | Built-in connector implementations, config stored in `SourceConnector` nodes |
| `src/lib/ingestion/dedup.ts` | Engine dedup module (reused directly) |
| `src/lib/ingestion/quality.ts` | Engine conflict resolution (reused directly) |
| `scripts/review-wave.ts` | Gate review UI data provider |
| `scripts/promote-nodes.ts` | Gate approval action handler |
| `src/lib/mirofish/export.ts` | Generalized `graphToMiroFishSeed()` reading from `NodeTypeDefinition` nodes |
| `src/lib/mirofish/client.ts` | Refactored with per-call `endpoint` parameter |
| `src/lib/caso-epstein/types.ts` | Generated from `NodeTypeDefinition` nodes or kept as-is during transition |
| `src/lib/caso-epstein/queries.ts` | Engine query builder using schema-aware Cypher generation |
| `src/lib/graph/algorithms.ts` | Extended with centrality, community detection, anomaly detection |
| Investigation-loop skill | Engine pipeline execution via webapp routes |

**Migration path:** Incremental. Existing Epstein investigation code continues working unchanged. The engine is built alongside it. Once the engine can replicate all existing functionality, the hardcoded scripts become thin wrappers or are retired.

**Property naming:** The engine uses `caso_slug` as the namespace property (matching existing code), not `investigation_id`. The YAML-era naming is retired.
