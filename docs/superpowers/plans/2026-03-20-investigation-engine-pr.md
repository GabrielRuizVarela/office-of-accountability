# Investigation Engine — Documentation PR Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a PR that delivers the Investigation Engine design spec, PRD updates, and implementation task breakdown.

**Architecture:** The Investigation Engine is a database-native (Neo4j), webapp-integrated pipeline for reproducible investigations. Config, state, proposals, and audit entries all live as Neo4j nodes. The engine runs inside Next.js. This PR documents the design and updates the PRD to integrate it.

**Tech Stack:** Markdown, existing PRD structure

---

### Task 1: PRD Section 5.3.1 — Investigation Engine

Add a new subsection under Section 5.3 (Investigations) that introduces the Investigation Engine as an automated research accelerator.

**Files:**
- Modify: `PRD.md` (after the Endorsement Model paragraph in Section 5.3, before Section 5.4)

- [ ] **Step 1: Add Section 5.3.1 to PRD**

Find the line `- No formal threshold required — visibility is organic, not gated` and insert after it, before the `---` that precedes Section 5.4:

```markdown

#### 5.3.1 Investigation Engine (Automated Research Pipeline)

Investigations can be initiated manually (the workflow above) OR through an automated Investigation Engine that follows a structured, reproducible pipeline. The engine accelerates the research phase — it does not replace manual investigation.

**How it works:**

The Investigation Engine is configured entirely through the webapp UI. Researchers define:
- **Schema** — custom node types and relationship types per investigation (fully generic)
- **Sources** — data source connectors (REST APIs, file uploads, court records, web scrapers, custom scripts)
- **Pipeline** — ordered stages (ingest → verify → enrich → analyze → report) with human gates at decision points

The engine executes pipeline stages server-side. At each gate, the researcher reviews proposals (new nodes, tier promotions, LLM hypotheses) and approves or rejects them. Nothing is written to the graph without human review.

**Key capabilities:**
- **LLM agent** — provider-agnostic (Qwen/llama.cpp, OpenAI, Anthropic, Ollama), three modes: direct call, tool-agent with scoped capabilities, MiroFish swarm simulation
- **Audit trail** — every action (human and machine) logged as AuditEntry nodes with SHA-256 hash chain for tamper detection
- **Snapshots** — named checkpoints at every gate, restorable
- **Forking** — lazy copy-on-write branches for exploring hypothesis paths without data duplication
- **Templates** — reusable investigation scaffolds (public-accountability, corporate-osint, land-ownership, blank) stored as seed data, exportable/importable as JSON
- **Cycle mode** — scheduled re-runs (e.g., every 30 minutes) for continuous data monitoring; blocks at gates until the researcher acts
- **Coalition-owned investigations** — investigations can belong to a coalition; gate decisions require consensus based on coalition roles (Admin/Editor)

**Engine outputs map to existing platform concepts:**
- Proposed nodes/edges → Bronze-tier graph additions (open schema)
- Verified promotions → Silver-tier upgrades (tiered trust)
- LLM hypotheses → Claim nodes with `status: pending`
- Investigation reports → Investigation documents with `REFERENCES` edges

See `docs/superpowers/specs/2026-03-20-investigation-engine-design.md` for full specification.
```

- [ ] **Step 2: Verify the section renders correctly in context**

Read `PRD.md` around line 300 to confirm the new section sits between 5.3 Investigations and 5.4 Coalitions, with proper heading hierarchy (`####` under `###`).

- [ ] **Step 3: Commit**

```bash
git add PRD.md
git commit -m "docs(prd): add Section 5.3.1 — Investigation Engine

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: PRD Section 7.2 — Update Tech Stack Table

Update the AI/LLM row and add Investigation Engine row to the tech stack table.

**Files:**
- Modify: `PRD.md` (AI/LLM row in Section 7.2 tech stack table)

- [ ] **Step 1: Update the AI/LLM row**

Find the row in the Section 7.2 tech stack table that reads:
```
| AI/LLM | Claude API | Async batch jobs only — never inline blocking calls |
```
To:
```
| AI/LLM | Provider-agnostic (llama.cpp/Qwen local, OpenAI, Anthropic, Ollama) | Investigation Engine LLM abstraction — three modes: single call, tool-agent, MiroFish swarm |
```

- [ ] **Step 2: Add Investigation Engine row after AI/LLM**

Insert a new row immediately after the updated AI/LLM row:
```
| Investigation Engine | Neo4j config nodes + Next.js server actions | Database-native pipeline: schema, sources, stages, gates, proposals, audit — all in Neo4j |
```

- [ ] **Step 3: Commit**

```bash
git add PRD.md
git commit -m "docs(prd): update tech stack with Investigation Engine and LLM abstraction

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: PRD Section 7.3 — Update Architecture Diagram

Add the Investigation Engine module to the service architecture diagram.

**Files:**
- Modify: `PRD.md` (architecture diagram in Section 7.3)

- [ ] **Step 1: Replace the architecture diagram**

Find the existing architecture diagram block (the fenced code block containing the ASCII art starting with `Vinext Application`). Replace the entire block including its opening and closing triple-backtick fences with:

````
```
+-----------------------------------------------------------+
|                    Vinext Application                      |
|                                                           |
|  +-------------+  +----------------------+               |
|  |    CORE      |  |     COMMUNITY        |               |
|  |              |  |                      |               |
|  | Graph CRUD   |  | Coalitions           |               |
|  | Ingestion    |  | Investigations       |               |
|  | Politician   |  | Endorsements         |               |
|  |  profiles    |  | Reputation           |               |
|  | Provenance   |  | Node/edge CRUD       |               |
|  +-------------+  +----------------------+               |
|                                                           |
|  +-----------------------------------------+             |
|  |              ANALYSIS                   |             |
|  |                                         |             |
|  |  Graph explorer   Query builder         |             |
|  |  AI batch jobs     Export / reports      |             |
|  +-----------------------------------------+             |
|                                                           |
|  +-----------------------------------------+             |
|  |        INVESTIGATION ENGINE             |             |
|  |                                         |             |
|  |  Pipeline executor   Gate review UI     |             |
|  |  LLM abstraction     Source connectors  |             |
|  |  Graph algorithms    Proposal system    |             |
|  |  Audit trail         Template system    |             |
|  +-----------------------------------------+             |
+-----------------------------------------------------------+
              |
         Neo4j 5 Community
         (graph data + investigation config + audit entries)
```
````

- [ ] **Step 2: Commit**

```bash
git add PRD.md
git commit -m "docs(prd): add Investigation Engine module to architecture diagram

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: PRD Section 7.5 — Update AI Integration Rules

The existing AI rules (Section 7.5) were written for Claude-only batch jobs. Update to reflect the Investigation Engine's broader LLM usage.

**Files:**
- Modify: `PRD.md` (Section 7.5 AI Integration Rules)

- [ ] **Step 1: Update AI Integration Rules**

Find Section `### 7.5 AI Integration Rules` and replace the entire section content (heading + numbered rules) with:

```markdown
### 7.5 AI Integration Rules

LLMs are used across the platform: promise extraction, document summarization, investigation pipeline (entity extraction, hypothesis generation, report drafting, MiroFish swarm simulation). Rules:

1. **Never authoritative.** All LLM outputs create `Proposal` nodes with `status: pending`, never published facts. LLM never writes directly to the investigation graph.
2. **Always labeled.** Every AI-generated content carries a "Analisis preliminar IA — requiere revision humana" badge.
3. **Deterministic where possible.** Structured JSON output with Zod validation, results cached by input hash. Temperature configurable per investigation but defaults to 0 for extraction tasks.
4. **Provider-agnostic.** The Investigation Engine supports multiple LLM providers (llama.cpp/Qwen local, OpenAI, Anthropic, Ollama) via a unified interface. Per-investigation model selection.
5. **Scoped per stage.** Each pipeline stage defines which tools the LLM can access (read_graph, propose_node, fetch_url, etc.). No free rein across the investigation.
6. **Auditable.** Every LLM call logs: model version, input, raw output, extracted result, the stage and investigation that triggered it. Stored as `AuditEntry` nodes.
7. **Human-at-the-gates.** LLM proposals accumulate until a gate, where the researcher reviews and approves/rejects each one through the webapp UI.
8. **Degradable.** If no LLM is available, the pipeline continues without AI stages — they are accelerators, not dependencies.
9. **Prompt injection defense.** PDFs are rendered to image -> OCR before passing text to the LLM. No raw PDF text extraction.
```

- [ ] **Step 2: Commit**

```bash
git add PRD.md
git commit -m "docs(prd): update AI integration rules for Investigation Engine

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: PRD Section 11 — Add Investigation Engine Phase

Add the Investigation Engine as a new phase in the phased delivery plan.

**Files:**
- Modify: `PRD.md` (Section 11, insert between Phase 2 and Phase 3)

- [ ] **Step 1: Insert new phase between Phase 2 and Phase 3**

Find `### Phase 3 — Future Vision` and insert the following block **before** it (after Phase 2's feature table ends):

```markdown

### Phase 2.5 — Investigation Engine

**Goal:** Deliver the automated investigation pipeline, enabling reproducible, template-driven investigations with LLM assistance.

| Feature | Difficulty |
|---------|-----------|
| Neo4j config schema (InvestigationConfig, SchemaDefinition, SourceConnector, PipelineStage, Gate, Proposal, AuditEntry, Snapshot nodes) | Medium |
| LLM abstraction layer (provider interface, llamacpp/openai/anthropic adapters, reasoning_content mapping) | Medium |
| Pipeline execution engine (stage runner, gate mechanism, state persistence in Neo4j) | Hard |
| Source connector framework (REST API, file upload, web scraper, custom script) + dedup integration | Hard |
| Graph algorithms in TypeScript (centrality, community detection, anomaly detection, temporal patterns) | Medium-Hard |
| MiroFish generalization (parameterized client, generic swarm seed export from schema) | Medium |
| Proposal system (LLM proposals as Neo4j nodes, batch review at gates) | Medium |
| Audit trail (AuditEntry nodes, hash chain, tamper detection, query UI) | Medium |
| Snapshot and restore (checkpoint at gates, metadata recording) | Medium |
| Lazy copy-on-write forking (hypothesis branches without data duplication) | Hard |
| Investigation library UI (list, filter, create wizard, dashboard) | Hard |
| Gate review UI (inline proposal review, approve/reject, rationale capture) | Medium-Hard |
| Schema editor UI (define node types, relationship types, display properties) | Medium |
| Template system (seed data, create-from-template, JSON export/import) | Medium |
| Parallel agent dispatch (concurrent verification/analysis agents per stage config) | Medium-Hard |
| Cycle mode (scheduled re-runs, gate blocking, server-side cron) | Medium |
| Coalition-owned investigations (multi-researcher gates, role-based consensus) | Medium |
```

- [ ] **Step 2: Commit**

```bash
git add PRD.md
git commit -m "docs(prd): add Phase 2.5 — Investigation Engine to delivery roadmap

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Write Implementation Task Breakdown

Create a task breakdown document that outlines the three implementation phases with concrete deliverables.

**Files:**
- Create: `docs/superpowers/plans/2026-03-20-investigation-engine-implementation.md`

- [ ] **Step 1: Write the implementation breakdown**

```markdown
# Investigation Engine — Implementation Task Breakdown

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Investigation Engine as specified in `docs/superpowers/specs/2026-03-20-investigation-engine-design.md`

**Architecture:** Database-native (Neo4j config nodes), webapp-integrated (Next.js server actions), provider-agnostic LLM abstraction, human-at-the-gates pipeline.

**Tech Stack:** Next.js 16, React 19, Neo4j 5, TypeScript, Zod 4, TailwindCSS 4, llama.cpp/Qwen

---

## Implementation Phases

Each phase produces working, testable software. Phases are sequential — each builds on the previous.

### Phase 1: Foundation (Neo4j Schema + LLM Abstraction + Pipeline Core)

**Prerequisite:** None. This is the skeleton everything else plugs into.

**Deliverables:**
- [ ] Neo4j schema for all config node types (InvestigationConfig, SchemaDefinition, NodeTypeDefinition, RelTypeDefinition, SourceConnector, PipelineConfig, PipelineStage, Gate, PipelineState, Proposal, AuditEntry, Snapshot)
- [ ] CRUD operations for config nodes (`webapp/src/lib/engine/config.ts`)
- [ ] Zod schemas for all config types (`webapp/src/lib/engine/types.ts`)
- [ ] LLM provider interface + llamacpp adapter (`webapp/src/lib/engine/llm/`)
- [ ] Qwen `reasoning_content` → `reasoning` field mapping
- [ ] Pipeline stage runner — reads config from Neo4j, executes stages in order (`webapp/src/lib/engine/pipeline.ts`)
- [ ] Gate mechanism — writes `gate_pending` state, reads gate decisions from Neo4j
- [ ] Proposal system — create/read/update Proposal nodes, batch review
- [ ] AuditEntry system — append-only, SHA-256 hash chain, chain validation on startup
- [ ] PipelineState persistence — current stage, progress, resume points
- [ ] Dynamic UNIQUE constraint creation for new node types via `IF NOT EXISTS`
- [ ] Tests for all of the above

**Files to create:**
- `webapp/src/lib/engine/types.ts` — Zod schemas + TS interfaces for all config types
- `webapp/src/lib/engine/config.ts` — CRUD for InvestigationConfig, SchemaDefinition, etc.
- `webapp/src/lib/engine/pipeline.ts` — stage runner, state management
- `webapp/src/lib/engine/gate.ts` — gate mechanism, decision recording
- `webapp/src/lib/engine/proposal.ts` — proposal CRUD, batch operations
- `webapp/src/lib/engine/audit.ts` — audit log writer, hash chain, validation
- `webapp/src/lib/engine/llm/types.ts` — LLMProvider interface, LLMResponse
- `webapp/src/lib/engine/llm/llamacpp.ts` — llama.cpp provider adapter
- `webapp/src/lib/engine/llm/index.ts` — provider factory

**Files to modify:**
- `webapp/src/lib/neo4j/schema.ts` — add constraints/indexes for engine node types

### Phase 2: Connectors, Algorithms & MiroFish

**Prerequisite:** Phase 1 complete (config schema, pipeline runner, LLM abstraction).

**Deliverables:**
- [ ] Source connector interface (`webapp/src/lib/engine/connectors/types.ts`)
- [ ] REST API connector — pagination, rate limiting, resumability, field mapping
- [ ] File upload connector — CSV, JSON parsing with field mapping
- [ ] Custom script connector — execute server-side script, parse JSONL output
- [ ] Source-level dedup integration (reuse existing `dedup.ts`)
- [ ] Pipeline-level dedup (cross-source global pass in verify stage)
- [ ] Ingest stage implementation — run connectors, dedup, write bronze nodes
- [ ] Verify stage implementation — parallel agent dispatch, web verification, tier promotion proposals
- [ ] Enrich stage implementation — document fetch, LLM entity extraction
- [ ] Analyze stage implementation — graph algorithms + LLM analysis
- [ ] Report stage implementation — LLM report drafting
- [ ] Graph algorithms — extend existing `webapp/src/lib/graph/algorithms.ts` with: degree centrality, betweenness centrality (BFS approx), community detection (label propagation), anomaly detection, temporal patterns
- [ ] MiroFish client refactor — add `endpoint` param to public functions
- [ ] `graphToMiroFishSeed()` generalization — accept `agentSource` and `contextFrom` from config
- [ ] OpenAI and Anthropic LLM provider adapters
- [ ] Tests for all connectors, algorithms, and stage implementations

**Files to create:**
- `webapp/src/lib/engine/connectors/types.ts` — connector interface
- `webapp/src/lib/engine/connectors/rest-api.ts` — REST API connector
- `webapp/src/lib/engine/connectors/file-upload.ts` — file upload connector
- `webapp/src/lib/engine/connectors/custom-script.ts` — custom script connector
- `webapp/src/lib/engine/stages/ingest.ts` — ingest stage
- `webapp/src/lib/engine/stages/verify.ts` — verify stage
- `webapp/src/lib/engine/stages/enrich.ts` — enrich stage
- `webapp/src/lib/engine/stages/analyze.ts` — analyze stage
- `webapp/src/lib/engine/stages/report.ts` — report stage
_(No new algorithms file — extend existing `webapp/src/lib/graph/algorithms.ts` instead)_
- `webapp/src/lib/engine/llm/openai.ts` — OpenAI provider adapter
- `webapp/src/lib/engine/llm/anthropic.ts` — Anthropic provider adapter

**Files to modify:**
- `webapp/src/lib/graph/algorithms.ts` — add centrality, community detection, anomaly detection, temporal patterns
- `webapp/src/lib/mirofish/client.ts` — add endpoint parameter to public functions
- `webapp/src/lib/mirofish/export.ts` — generalize node type parameters

### Phase 3: Webapp UI & Templates

**Prerequisite:** Phase 2 complete (all stages functional, connectors working).

**Deliverables:**
- [ ] Investigation library page (`/investigaciones`) — list, filter, status badges
- [ ] Create investigation wizard (`/investigaciones/new`) — template picker, schema editor, source config, pipeline config
- [ ] Investigation dashboard (`/investigaciones/[id]`) — status, progress, stats, audit stream
- [ ] Gate review UI (`/investigaciones/[id]/gate/[stageId]`) — proposal cards, approve/reject, rationale input
- [ ] Schema editor (`/investigaciones/[id]/schema`) — add/edit/remove node types and rel types
- [ ] Source connector config UI (`/investigaciones/[id]/sources`) — add/edit connectors, test connection
- [ ] Pipeline config UI (`/investigaciones/[id]/pipeline`) — stage ordering, gate config, LLM model assignment
- [ ] Audit log viewer (`/investigaciones/[id]/audit`) — filterable, searchable
- [ ] Snapshot management UI (`/investigaciones/[id]/snapshots`) — list, create, restore
- [ ] Fork/branch UI (`/investigaciones/[id]/branches`) — fork, branch tree visualization, merge
- [ ] Template system — InvestigationTemplate seed data, create-from-template flow, JSON export/import
- [ ] Integration: graph explorer becomes investigation-aware (show pipeline stage provenance)
- [ ] Integration: simulation panel uses investigation's model config
- [ ] API routes for all engine operations (server actions)

**Files to create:**
- `webapp/src/app/investigaciones/page.tsx` — library
- `webapp/src/app/investigaciones/new/page.tsx` — create wizard
- `webapp/src/app/investigaciones/[id]/page.tsx` — dashboard
- `webapp/src/app/investigaciones/[id]/schema/page.tsx` — schema editor
- `webapp/src/app/investigaciones/[id]/sources/page.tsx` — source config
- `webapp/src/app/investigaciones/[id]/pipeline/page.tsx` — pipeline config
- `webapp/src/app/investigaciones/[id]/gate/[stageId]/page.tsx` — gate review
- `webapp/src/app/investigaciones/[id]/audit/page.tsx` — audit log
- `webapp/src/app/investigaciones/[id]/snapshots/page.tsx` — snapshot management
- `webapp/src/app/investigaciones/[id]/branches/page.tsx` — fork/branch
- `webapp/src/app/investigaciones/templates/page.tsx` — template library
- `webapp/src/components/engine/` — shared components (ProposalCard, StageProgress, AuditStream, SchemaEditor, ConnectorForm, etc.)
- `webapp/src/app/api/engine/` — API routes for engine operations

**Files to modify:**
- `webapp/src/components/graph/ForceGraph.tsx` — add pipeline stage provenance display
- `webapp/src/components/investigation/SimulationPanel.tsx` — read model config from investigation
- `webapp/src/app/caso/[slug]/layout.tsx` — link to investigation dashboard
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-03-20-investigation-engine-implementation.md
git commit -m "docs: add Investigation Engine implementation task breakdown

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Create the PR

**Files:** All changes from Tasks 1-6.

- [ ] **Step 1: Verify all changes are committed**

```bash
git status
git log --oneline -10
```

- [ ] **Step 2: Push branch and create PR**

```bash
git push -u origin worktree-epstein
gh pr create --title "docs: Investigation Engine design spec, PRD updates, and implementation plan" --body "$(cat <<'EOF'
## Summary

- Add Investigation Engine design specification (database-native, webapp-integrated pipeline for reproducible investigations)
- Update PRD with Investigation Engine integration (Section 5.3.1, tech stack, architecture diagram, AI rules, phased delivery)
- Add implementation task breakdown (3 phases: foundation, connectors/algorithms, webapp UI)

### Key design decisions:
- Investigation config lives in Neo4j (not filesystem YAML)
- Engine runs inside Next.js (not standalone CLI)
- Human-at-the-gates: LLM never writes directly, proposals reviewed at gates
- Provider-agnostic LLM abstraction (llama.cpp, OpenAI, Anthropic, Ollama)
- Lazy copy-on-write forking for hypothesis branches
- Graph algorithms in TypeScript (no Neo4j GDS dependency)
- Existing `caso_slug` property preserved (no data migration)

### Files changed:
- `docs/superpowers/specs/2026-03-20-investigation-engine-design.md` — full spec
- `docs/superpowers/plans/2026-03-20-investigation-engine-implementation.md` — task breakdown
- `PRD.md` — Section 5.3.1, tech stack, architecture diagram, AI rules, Phase 2.5

## Test plan
- [ ] Review spec for completeness and consistency
- [ ] Review PRD changes for correct heading hierarchy and content flow
- [ ] Review implementation breakdown for realistic phase ordering and file paths
- [ ] Verify no existing PRD sections were accidentally removed or corrupted

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
