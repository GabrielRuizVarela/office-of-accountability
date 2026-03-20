# Investigation Engine — Design Specification

**Date:** 2026-03-20
**Status:** Approved
**Scope:** General-purpose, automated investigation pipeline integrated into Office of Accountability

---

## 1. Overview

The Investigation Engine is a structured, automated, template-driven system for conducting reproducible investigations. It generalizes the existing Epstein investigation workflow into a reusable framework applicable to any domain — public accountability, corporate OSINT, land ownership, or fully custom research.

An investigation is a **git-versioned directory** of declarative YAML files. The engine reads these files and executes an automated pipeline against Neo4j, with human gates at decision points. It integrates with the existing PRD as an accelerator for the manual investigation workflow (PRD Section 5.3), producing findings that researchers curate into Investigation documents.

### Relationship to PRD

The PRD defines an `Investigation` as a content type — a long-form document with embedded graph references. The Investigation Engine is a process that automates the research phase:

```
Investigation Engine (pipeline)
  → discovers nodes, relationships, patterns
  → produces hypotheses with evidence
  → researcher reviews at gates
  → approved findings become...
    → Bronze/Silver graph nodes (PRD open schema)
    → Claim nodes with status: pending (PRD claim pattern)
    → Investigation documents (PRD Section 5.3)
```

The engine is an accelerator, not a replacement. Manual investigation remains fully supported.

---

## 2. Core Concepts

### Investigation-as-Code

An investigation is a directory — a git repo (or subdirectory) with declarative YAML files that define schema, sources, pipeline stages, and gates.

- **Reproducible:** git provides versioning, forking, and audit for free.
- **Portable:** a directory of files is universally understood, shareable, and archivable.
- **Templatable:** a template is an investigation directory without data. Clone it, fill in specifics, run it.
- **Two audiences:** power users edit YAML directly; the webapp generates/edits files through a guided wizard.

### Human-at-the-Gates

Automation handles data collection and processing. The researcher makes decisions at gates: which sources to trust, which connections look real, which hypotheses to pursue. Between gates, the system suggests next moves, surfaces anomalies, and handles grunt work.

### LLM Never Writes Directly

The LLM agent produces proposals — proposed nodes, edges, hypotheses, report sections — that accumulate until the next gate. The researcher approves, modifies, or rejects them. Nothing is written to the graph without human review.

### Neo4j Namespace Implementation

Neo4j Community has no native namespace or multi-database support. Namespacing is implemented via a mandatory `investigation_id` property on every engine-created node and relationship. All engine-generated Cypher queries filter by `WHERE n.investigation_id = $investigationId`.

This follows the existing pattern in the codebase, where `caso_slug` serves the same purpose (see `dedup.ts` line 103: `WHERE n.caso_slug = $casoSlug`).

**Uniqueness strategy:** Node IDs are composite — `{investigation_id}:{node_id}` — avoiding collisions with the existing global UNIQUE constraints on `Person.id`, `Document.id`, etc. The engine generates IDs in this format: `caso-epstein:ee-john-doe`. Forked branches use `{investigation_id}__{branch}:{node_id}`.

**Constraint compatibility:** The engine does NOT create new Neo4j UNIQUE constraints per investigation. It relies on the composite ID format for uniqueness and the `investigation_id` property for isolation. Existing global constraints remain in place for non-engine data.

**Coexistence with pre-engine data:** Existing nodes (from wave scripts, seed data) retain their plain IDs (e.g., `ee-john-doe`) and have no `investigation_id` property. The engine treats these as read-only reference data — it can query and link to them but does not modify or merge them. Engine-created nodes always use composite IDs (`caso-epstein:ee-john-doe`) and always carry `investigation_id`. Dedup between engine nodes and pre-engine nodes uses `caso_slug` matching (the existing pattern), not ID comparison. This avoids silent boundary failures while preserving backward compatibility.

---

## 3. Investigation File Structure

```
my-investigation/
  investigation.yaml      # identity + metadata
  schema.yaml             # entity types, relationship types, property definitions
  sources/                # one file per data source connector
    *.yaml
  pipeline.yaml           # ordered stages + gates
  .investigation/         # engine-managed (not hand-edited)
    state.yaml            # current stage, progress, resume points
    audit.log             # append-only JSONL — every action logged
    proposals/            # pending proposals from LLM/connectors
    snapshots/            # named checkpoints for re-runnability
    branches/             # fork metadata
```

### 3.1 investigation.yaml

```yaml
id: caso-epstein
name: "Jeffrey Epstein Network Investigation"
description: "Mapping financial, social, and travel connections..."
template: public-accountability    # optional — which template seeded this
created: 2026-03-20
tags: [financial-crime, trafficking, public-figures]
neo4j_namespace: caso-epstein      # investigation_id property on all nodes/edges

models:
  default:
    provider: llamacpp
    endpoint: http://localhost:8080
    model: qwen-3.5-9b
    config:
      temperature: 0.7
      max_tokens: 2048
      timeout: 600

  fast:
    provider: openai
    api_key_env: OPENAI_API_KEY
    model: gpt-4o-mini
    config:
      temperature: 0.3
      max_tokens: 1024

  reasoning:
    provider: anthropic
    api_key_env: ANTHROPIC_API_KEY
    model: claude-sonnet-4-20250514
    config:
      temperature: 0.5
      max_tokens: 4096

mirofish:
  endpoint: http://localhost:5000    # MiroFish swarm server (separate from llama.cpp at :8080)
  llm_backend: default               # which model config MiroFish uses internally
```

### 3.2 schema.yaml

Defines entity types and relationship types for the investigation. The engine reads this and adapts — it makes zero assumptions about what is being investigated.

```yaml
node_types:
  Person:
    properties:
      name: { type: string, required: true }
      role: { type: string }
      nationality: { type: string }
      description: { type: string }
    display:
      color: "#3b82f6"
      icon: user

  Organization:
    properties:
      name: { type: string, required: true }
      org_type: { type: enum, values: [company, bank, foundation, government] }
    display:
      color: "#8b5cf6"
      icon: building

  # Users define as many node types as needed

relationship_types:
  ASSOCIATED_WITH:
    from: [Person, Organization]
    to: [Person, Organization]
    properties:
      nature: { type: string }
      source_url: { type: string }

  FLEW_WITH:
    from: Person
    to: Person
    properties:
      flight_id: { type: string }
      date: { type: date }

  # Users define as many relationship types as needed

# All nodes/relationships automatically receive provenance fields:
#   confidence_tier, source, source_url, ingestion_wave,
#   created_at, created_by, pipeline_stage, proposed_by
```

### 3.3 sources/*.yaml

Each file defines one data source and how to map its data into the investigation's schema.

#### Built-in Connector Types

| Type | Description |
|------|-------------|
| `rest-api` | Paginated REST APIs with rate limiting and resumability |
| `file-glob` | Local files (CSV, JSON, PDF) |
| `github-dataset` | Clone a repo, parse structured data files |
| `web-scraper` | Fetch and extract from HTML pages |
| `court-records` | CourtListener, PACER |
| `corporate-registry` | OpenCorporates, SEC EDGAR |
| `custom` | User script that outputs JSONL to stdout |

#### Source Definition Example

```yaml
# sources/epstein-exposed-api.yaml
name: "Epstein Exposed API"
type: rest-api
config:
  base_url: "https://api.epsteinexposed.com/api"
  endpoints:
    - path: /persons
      paginate: { type: offset, param: page, per_page: 50 }
      rate_limit: { requests: 100, per: hour }
  auth: null
  resumable: true

mapping:
  persons:
    node_type: Person
    id_template: "ee-{slug}"
    fields:
      name: "$.name"
      role: "$.role"
      description: "$.bio"

  connections:
    relationship_type: ASSOCIATED_WITH
    from: "$.person_slug"
    to: "$.connected_slug"
    fields:
      nature: "$.connection_type"

dedup:
  strategy: fuzzy
  threshold: 2
  match_fields: [name]

tier: bronze
```

#### Custom Connector Example

```yaml
# sources/my-custom-pdfs.yaml
name: "Leaked Financial Documents"
type: custom
config:
  script: ./connectors/parse-financial-pdfs.ts
  args:
    input_dir: ./data/financial-docs/

# Script must output JSONL to stdout:
# {"type":"node","node_type":"Transaction","id":"tx-001","properties":{...}}
# {"type":"edge","relationship_type":"FINANCED","from":"person-x","to":"tx-001","properties":{...}}

tier: bronze
```

#### Source Processing

1. Engine reads all `sources/*.yaml` files
2. Validates each against `schema.yaml` — mapping targets must reference defined types
3. Connectors run in the order specified by `pipeline.yaml`
4. Each connector handles its own pagination, rate limiting, and resumability
5. Output goes through the dedup layer before writing to Neo4j
6. Everything is logged to `.investigation/audit.log`

**Dedup two-pass model:** Dedup runs at two distinct points with different scopes:
- **Source-level dedup** (configured in `sources/*.yaml`): runs at connector time, deduplicates incoming records against the existing graph. This is a pre-filter — prevents writing obvious duplicates during ingestion.
- **Pipeline-level dedup** (configured in `pipeline.yaml` verify stage): runs as a cross-source global pass after all sources have been ingested. Catches duplicates between sources that source-level dedup can't see (e.g., the same person ingested from two different APIs with slightly different names).

Both use the same underlying Levenshtein algorithm from `dedup.ts`. The threshold can differ between the two passes — source-level may be stricter (lower threshold) to avoid false merges during ingestion, while pipeline-level may be more permissive to catch cross-source duplicates.

### 3.4 pipeline.yaml

Defines the investigation as an ordered sequence of stages (automated work) and gates (human decision points).

```yaml
stages:
  - id: ingest
    name: "Data Collection"
    type: ingest
    sources: [all]
    config:
      parallel: true
      on_conflict: log
    gate:
      type: human_review
      prompt: "Review ingested data — check conflicts, sample nodes, approve or reject sources"
      actions: [approve, reject, partial]
      show:
        - conflicts_summary
        - node_edge_counts
        - random_sample

  - id: verify
    name: "Verification"
    type: verify
    config:
      parallel: true
      agents:
        - name: verify-persons
          scope:
            node_type: Person
            filter: "confidence_tier = 'bronze'"
            order_by: "@connection_count"   # @ prefix = computed aggregation
            limit: 50
          action: web_verify
          llm: fast
          promote_to: silver

        - name: verify-organizations
          scope:
            node_type: Organization
            filter: "confidence_tier = 'bronze'"
          action: web_verify
          llm: fast
          promote_to: silver

        - name: dedup-merge
          action: dedup
          config:
            strategy: fuzzy
            threshold: 2
            auto_merge: exact

        - name: cleanup
          action: sanitize
          config:
            remove:
              - single_char_names
              - foia_references
              - passenger_placeholders
    gate:
      type: human_review
      prompt: "Review proposed promotions and merges"
      show:
        - fuzzy_match_pairs
        - confidence_scores
        - proposed_promotions

  - id: enrich
    name: "Content Enrichment"
    type: enrich
    config:
      strategies:
        - type: document_fetch
          sources: [courtlistener, documentcloud, doj]
        - type: llm_extract
          model: fast
          extract: [key_findings, dates, dollar_amounts, named_entities]
        - type: reverse_lookup
          model: fast
          max_hops: 2
    gate:
      type: human_review
      prompt: "Review enrichment results — verify extracted entities, approve new connections"
      show:
        - new_nodes_created
        - new_relationships
        - llm_confidence_scores

  - id: analyze
    name: "Pattern Analysis"
    type: analyze
    config:
      algorithms:
        - centrality
        - community_detection
        - anomaly_detection
        - temporal_patterns
      llm:
        mode: swarm
        model: default
        swarm:
          agent_source: Person
          context_from: [Organization, Location, Document]
          scenario: "Analyze network patterns and hidden connections"
        directives:
          - "Identify unexplained financial flows"
          - "Find geographic patterns"
          - "Surface contradictions between documents and testimony"
    gate:
      type: human_review
      prompt: "Review analysis findings — which hypotheses to pursue?"
      show:
        - hypothesis_list
        - supporting_evidence
        - confidence_rankings
      actions: [approve, dismiss, investigate_further]

  - id: report
    name: "Report Generation"
    type: report
    config:
      format: [markdown, html]
      sections:
        - executive_summary
        - key_findings
        - network_analysis
        - evidence_chain
        - methodology
        - appendix
      llm:
        mode: single
        model: reasoning
        tone: investigative
    gate:
      type: human_review
      prompt: "Review draft report — edit, approve, or send back for more analysis"
      actions: [approve, revise, back_to_analyze]
```

#### Pipeline Properties

- **Stages are re-runnable.** Re-running `ingest` after adding a new source only processes what's new.
- **Gates are blocking.** The pipeline stops and waits for human input. Gate decisions are recorded in the audit log.
- **Stages can loop.** The `back_to_analyze` action on the report gate loops back.
- **LLM scope is per-stage.** Each stage defines what the LLM can do — no free rein across the investigation.
- **Computed sort expressions.** The `order_by` field supports `@`-prefixed computed aggregations (e.g., `@connection_count` generates `ORDER BY COUNT { (n)--(m) WHERE m.investigation_id = $investigationId } DESC`). Plain field names sort by stored properties. This keeps the YAML simple for common cases while supporting runtime aggregations. Computed aggregations are always scoped to the investigation namespace via `investigation_id` filter.

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

**Provider field mapping:** Each provider adapter maps vendor-specific response fields to the `LLMResponse` interface. The `llamacpp` provider must map Qwen's `reasoning_content` field to `reasoning` (Qwen 3.5 uses mandatory thinking mode — the analysis is in `reasoning_content`, not `content`). The `anthropic` provider maps `thinking` blocks similarly. This mapping is mandatory — without it, proposals from thinking-mode models will have empty reasoning in the audit trail.

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

The agent never writes directly — it produces proposals queued for gate review.

#### `swarm` — MiroFish Multi-Agent Simulation

Graph entities become autonomous agents that interact. The existing `graphToMiroFishSeed()` export is generalized:

```yaml
swarm:
  agent_source: Person           # any node type from schema.yaml
  context_from: [Organization, Location]
  scenario: "..."
  endpoint: http://localhost:5000
```

A corporate investigation could turn `Company` nodes into agents with `Officer` and `Transaction` context. The engine handles the conversion generically based on schema.yaml.

**Migration note:** The existing `mirofish/client.ts` reads from `process.env.MIROFISH_API_URL` (hardcoded at import time). The engine requires a runtime-configurable endpoint per investigation. The `endpoint` parameter must be added to the exported public functions (`initializeSimulation`, `querySimulation`, `getSimulationStatus`), not only to the internal `apiRequest` helper, so callers can pass per-investigation endpoints from YAML config. Similarly, `graphToMiroFishSeed()` must be generalized to accept `agent_source` and `context_from` node types from YAML rather than hardcoding `Person`, `Organization`, `Location`.

### 4.3 Proposals

All LLM output is captured as proposals, never written directly:

```jsonl
{"type":"node","node_type":"Person","properties":{"name":"Jane Doe","role":"financial advisor"},"confidence":0.72,"reasoning":"Referenced in 3 documents...","proposed_by":"qwen-3.5-9b","stage":"enrich"}
{"type":"edge","relationship_type":"FINANCED","from":"person-x","to":"org-y","properties":{"amount":"$2.3M"},"confidence":0.65,"reasoning":"Bank records show...","proposed_by":"qwen-3.5-9b","stage":"enrich"}
{"type":"hypothesis","title":"Shell company network","evidence":["doc-1","doc-2","org-3"],"confidence":0.78,"reasoning":"...","proposed_by":"qwen-3.5-9b","stage":"analyze"}
```

Proposals are stored in `.investigation/proposals/` and presented at the next gate.

---

## 5. Audit Trail, Snapshots & Forking

### 5.1 Audit Log

Every action — human or machine — appends to `.investigation/audit.log` as JSONL:

```jsonl
{"ts":"2026-03-20T14:32:01Z","actor":"engine","action":"stage_start","stage":"ingest","source":"epstein-exposed-api"}
{"ts":"2026-03-20T14:32:05Z","actor":"engine","action":"node_created","node_type":"Person","id":"ee-john-doe","tier":"bronze","source":"epstein-exposed-api"}
{"ts":"2026-03-20T14:35:12Z","actor":"engine","action":"conflict_logged","type":"fuzzy_match","node_a":"ee-john-doe","node_b":"ep-w1-john-doe","distance":1}
{"ts":"2026-03-20T14:40:00Z","actor":"engine","action":"gate_reached","stage":"ingest","proposals":142}
{"ts":"2026-03-20T14:42:30Z","actor":"researcher:gabriel","action":"gate_decision","stage":"ingest","decision":"approve","rationale":"Conflicts reviewed, all reasonable fuzzy matches"}
{"ts":"2026-03-20T14:43:00Z","actor":"llm:qwen-3.5-9b","action":"propose_node","node_type":"Person","name":"Jane Smith","confidence":0.72,"stage":"enrich"}
{"ts":"2026-03-20T14:55:00Z","actor":"researcher:gabriel","action":"proposal_rejected","proposal_id":"enrich-047","reason":"Insufficient evidence"}
```

Fields on every entry:
- `ts` — ISO timestamp
- `actor` — `engine`, `researcher:<name>`, `llm:<model>`, `connector:<source>`
- `action` — what happened
- Action-specific context fields

The log is **append-only** — never edited, never truncated.

**Hash chain for tamper detection:** Per PRD Section 6.3, each entry includes a `prev_hash` field containing the SHA-256 hash of the previous entry. The first entry uses `prev_hash: "genesis"`. This creates a tamper-evident chain — modifying any entry invalidates all subsequent hashes. The engine validates the chain on startup and warns if corruption is detected.

```jsonl
{"ts":"...","actor":"engine","action":"stage_start","prev_hash":"genesis",...}
{"ts":"...","actor":"engine","action":"node_created","prev_hash":"a3f2b8c1...",...}
```

### 5.2 Snapshots

Named checkpoints of the full investigation state:

```yaml
name: pre-financial-deep-dive
created: 2026-03-20T15:00:00Z
stage: analyze
graph_state:
  node_count: 10864
  edge_count: 15230
  tier_breakdown: { gold: 42, silver: 3200, bronze: 7622 }
pipeline_state:
  completed_stages: [ingest, verify]
  current_stage: analyze
  proposals_pending: 17
neo4j_export: snapshots/pre-financial-deep-dive.cypher
```

- Auto-created at every gate approval
- Manually created via `investigate snapshot --name "..."`
- Restorable: reloads Neo4j subgraph from Cypher dump and resets pipeline state

### 5.3 Forking

```bash
investigate fork ./caso-epstein/ --branch hypothesis-money-laundering
```

This:
1. Creates a git branch `caso-epstein/hypothesis-money-laundering`
2. Copies the current snapshot as the fork point
3. Creates a namespaced copy of the graph in Neo4j (`caso-epstein__money-laundering`)
4. Records the fork in `.investigation/branches/`

```yaml
# .investigation/branches/hypothesis-money-laundering.yaml
forked_from: main
fork_point: 2026-03-20-analyze-approved
created: 2026-03-20T16:00:00Z
neo4j_namespace: caso-epstein__money-laundering
status: active
```

The researcher can run the pipeline on this branch with different parameters without affecting the main investigation.

Branches can be **merged back**:
```bash
investigate merge ./caso-epstein/ --branch hypothesis-money-laundering
```

**Merge semantics:** The engine performs a graph diff between the branch state and the current main state (not an audit log replay). The diff identifies:
- **New nodes/edges** in the branch → proposed as additions to main (queued for gate review)
- **Modified nodes** (property changes) → presented as updates with both versions
- **ID collisions** (same entity created independently in main and branch) → flagged as conflicts for manual resolution, using the same fuzzy dedup logic

The merge itself is a gate: the researcher reviews the diff and approves/rejects each change. Approved additions carry provenance tracking back to the branch (`branch: "hypothesis-money-laundering"`).

---

## 6. Execution Engine

### 6.1 CLI

```bash
# Initialize from template
investigate init --template public-accountability --name "caso-epstein"

# Run the full pipeline (stops at each gate)
investigate run ./caso-epstein/

# Run a specific stage
investigate run ./caso-epstein/ --stage enrich

# Re-run from a checkpoint
investigate run ./caso-epstein/ --from-snapshot pre-analysis-v2

# Fork an investigation
investigate fork ./caso-epstein/ --branch hypothesis-financial-focus

# Create snapshot
investigate snapshot ./caso-epstein/ --name "pre-deep-dive"

# Restore snapshot
investigate restore ./caso-epstein/ --snapshot pre-deep-dive

# Merge branch
investigate merge ./caso-epstein/ --branch hypothesis-financial-focus

# Status
investigate status ./caso-epstein/

# Continuous loop
investigate loop ./caso-epstein/ --interval 30m

# Loop specific stages
investigate loop ./caso-epstein/ --stages ingest,verify --interval 1h

# List templates
investigate template list

# Add community template
investigate template add https://github.com/someone/investigation-template-xyz
```

### 6.2 Execution Flow

```
investigate run ./caso-epstein/
  │
  ├─ Read investigation.yaml, schema.yaml, pipeline.yaml
  ├─ Connect to Neo4j (namespace: caso-epstein)
  ├─ Load state from .investigation/state.yaml
  │
  ├─ Stage: ingest
  │   ├─ Read sources/*.yaml
  │   ├─ Run connectors (parallel where independent)
  │   ├─ Dedup against existing graph
  │   ├─ Write bronze nodes to Neo4j
  │   ├─ Log to audit.log
  │   └─ GATE: human reviews conflicts, counts, samples
  │
  ├─ Stage: verify
  │   ├─ Dispatch parallel agents (per pipeline.yaml config)
  │   ├─ Each agent: query graph → web search → propose promotions
  │   ├─ Collect proposals in .investigation/proposals/
  │   └─ GATE: human reviews proposed promotions and merges
  │
  ├─ Stage: enrich
  │   ├─ Fetch document content from configured sources
  │   ├─ LLM extracts entities, key findings
  │   ├─ Reverse lookup for additional connections
  │   └─ GATE: human reviews enrichment results
  │
  ├─ Stage: analyze
  │   ├─ Run graph algorithms (centrality, community, anomaly)
  │   ├─ Dispatch LLM agents (tool-agent or swarm mode)
  │   ├─ Collect hypotheses
  │   └─ GATE: human reviews hypotheses
  │
  ├─ Stage: report
  │   ├─ LLM drafts report sections
  │   ├─ Include evidence chains from graph
  │   └─ GATE: human reviews, edits, approves
  │
  └─ Commit checkpoint + snapshot
```

### 6.3 Parallel Agent Dispatch

Stages with `parallel: true` dispatch multiple agents concurrently. Each agent:
- Has a scoped query against the graph (node type, filter, limit)
- Performs its action (web_verify, dedup, sanitize, analyze)
- Produces proposals
- Reports results

This maps directly to the existing investigation-loop skill's parallel agent pattern (Agents A–J), but driven by YAML configuration instead of hardcoded logic.

### 6.4 Cycle Mode

```bash
investigate loop ./caso-epstein/ --interval 30m
```

Each cycle picks up where the last left off — new data from sources, new nodes to verify, updated analysis.

**Gate behavior in loop mode:**
- When a gate is reached, the loop **blocks** and notifies the researcher (terminal notification for CLI, push notification for webapp).
- The loop does NOT continue past a pending gate — it waits for the researcher's decision before proceeding to the next stage.
- If a gate has been pending for longer than the loop interval, subsequent loop ticks are no-ops (no re-notification, no skipping). The loop resumes from the pending gate once the researcher acts.
- `--stages ingest,verify` restricts which stages run but does NOT bypass gates. If the `ingest` stage has a gate, the loop still stops there.
- To run stages without gates (fully automated), configure `gate: null` on those stages in `pipeline.yaml`.

---

## 7. Template System

### 7.1 Template Structure

A template is an investigation directory without data:

```
templates/
  public-accountability/
    investigation.yaml
    schema.yaml          # Person, Organization, Location, Document, Event, LegalCase, Flight
    sources/
      _court-records.yaml
      _corporate-registry.yaml
      _flight-records.yaml
    pipeline.yaml
    README.md

  corporate-osint/
    schema.yaml          # Company, Officer, Filing, Transaction, Beneficial_Owner, Jurisdiction
    sources/
      _sec-edgar.yaml
      _opencorporates.yaml
    pipeline.yaml

  land-ownership/
    schema.yaml          # Parcel, Owner, Transfer, Lien, Developer, Permit
    sources/
      _property-records.yaml
    pipeline.yaml

  blank/
    investigation.yaml
    schema.yaml          # empty, just provenance fields
    pipeline.yaml        # basic ingest → review → report
```

### 7.2 Template Inheritance

An investigation can extend a template and override parts:

```yaml
# investigation.yaml
template: public-accountability
overrides:
  schema: ./schema.yaml
  pipeline: ./pipeline.yaml
  remove_sources: [_flight-records]   # matches by filename stem (without .yaml)
```

**Inheritance rules per file type:**

| File | Mode | Behavior |
|------|------|----------|
| `schema.yaml` | **Additive (deep merge)** | Investigation schema is merged on top of template schema. New node/relationship types are added. If the investigation redefines a type that exists in the template, properties are merged (investigation properties override template properties with the same name, new properties are added). |
| `pipeline.yaml` | **Replacement** | If provided, the investigation pipeline replaces the template pipeline entirely. There is no stage-level merge — if you need most of the template pipeline, copy it and modify. |
| `sources/*.yaml` | **Additive** | Template sources are inherited. Investigation adds its own sources. `remove_sources` removes template sources by filename stem (e.g., `_flight-records` matches `_flight-records.yaml`). |
| `investigation.yaml` | **Override** | Investigation values override template values for all fields. |

### 7.3 Community Templates

Templates are directories — shareable as git repos:

```bash
investigate template add https://github.com/someone/investigation-template-financial-fraud
investigate template list
investigate init --template financial-fraud --name "caso-xyz"
```

### 7.4 Caso Epstein as Reference Instance

The current Epstein investigation becomes the reference implementation — a concrete instance of `public-accountability` with:
- 7 node types, 11+ relationship types
- 4 wave sources (rhowardstone, epstein-exposed, courtlistener, dleerdefi logbooks)
- Full pipeline with MiroFish swarm analysis
- 10,864+ nodes as existing data

---

## 8. UI Integration

### 8.1 Power User Mode (CLI)

Full control: `investigate init`, `investigate run`, `investigate fork`, etc. YAML editing, custom connectors, direct Cypher access.

### 8.2 Guided UI Mode

The webapp gets a new top-level section: **Investigations**.

#### Create Investigation

Wizard flow: pick template (or blank) → name → define schema (drag-and-drop entity/relationship builder or edit YAML) → configure sources (browse connector library, add custom) → configure pipeline (reorder stages, set gate types, assign LLM models).

Under the hood, generates the investigation directory and commits it.

#### Run Investigation Dashboard

Per-investigation dashboard showing:
- Current stage and progress
- Live agent activity
- Pending gate — review UI inline
- Audit log stream (filterable by actor, action, stage)
- Graph stats over time

#### Gate Review UI

When a gate is reached, the researcher gets a notification. Gate view shows:
- **Ingest gates:** conflict list, node/edge counts, random sample with inline approve/reject
- **Verify gates:** proposed promotions with evidence links, bulk approve/reject
- **Analyze gates:** hypothesis cards with supporting evidence, accept/dismiss/investigate-further
- **Report gates:** draft report with inline editing

Researcher's decision + rationale is recorded to audit log.

#### Fork & Branch UI

- Visual branch tree (like git graph)
- Fork from any snapshot
- Side-by-side comparison between branches
- Merge with diff view

#### Investigation Library

- List all investigations with status, last activity, node counts
- Filter by template, tag, status
- Clone an investigation as starting point

### 8.3 Integration with Existing Views

The graph explorer (`/caso/[slug]/grafo`) and simulation panel (`/caso/[slug]/simulacion`) become views within an investigation:
- Graph explorer shows which nodes came from which pipeline stage
- Simulation panel uses the investigation's configured LLM models
- Path finder and analysis tools feed back into the analyze stage

---

## 9. PRD Integration Points

### 9.1 Mapping to PRD Concepts

| Engine Output | PRD Concept | How |
|---------------|-------------|-----|
| Proposed nodes/edges | Bronze-tier graph additions | Per PRD open schema (Section 5.2) |
| Verified promotions | Silver-tier upgrades | Per PRD tiered trust (Section 5.1) |
| LLM hypotheses | `Claim` nodes, `status: pending` | Per PRD claim pattern (Section 4.2) |
| Investigation reports | `Investigation` documents | Per PRD Section 5.3, with `REFERENCES` edges |
| Audit log entries | Platform audit log | Aligned format with PRD Section 6.3 |

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

The current Epstein-specific code maps to engine components:

| Current Code | Engine Component |
|---|---|
| `scripts/ingest-wave-*.ts` | Built-in connector implementations driven by `sources/*.yaml` |
| `src/lib/ingestion/dedup.ts` | Engine dedup module (reused directly) |
| `src/lib/ingestion/quality.ts` | Engine conflict resolution (reused directly) |
| `scripts/review-wave.ts` | Gate review UI data provider |
| `scripts/promote-nodes.ts` | Gate approval action handler |
| `src/lib/mirofish/export.ts` | Generalized `graphToMiroFishSeed()` using schema.yaml |
| `src/lib/mirofish/client.ts` | MiroFish provider in LLM abstraction |
| `src/lib/caso-epstein/types.ts` | Generated from `schema.yaml` |
| `src/lib/caso-epstein/queries.ts` | Engine query builder using schema-aware Cypher generation |
| Investigation-loop skill | Engine execution loop (`investigate run/loop`) |

The migration path is incremental: existing code continues working while the engine is built alongside it. Once the engine can replicate all existing functionality, the hardcoded scripts become thin wrappers or are retired.
