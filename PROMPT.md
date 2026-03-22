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
| 10 | Motor de Investigación Autónomo | ✅ Code complete — see details below |

### M10 Engine — What Exists

The autonomous investigation engine is **fully implemented** (~2,400 lines, 45 files):

- **LLM Abstraction** (`src/lib/engine/llm/`): llamacpp, openai, anthropic providers — real HTTP adapters, reasoning extraction, tool call parsing
- **Pipeline** (`src/lib/engine/pipeline.ts`): PipelineState CRUD, stage runner, gate mechanism
- **Stages** (`src/lib/engine/stages/`): ingest, verify, enrich, analyze, iterate, report — all query Neo4j + call LLM
- **Connectors** (`src/lib/engine/connectors/`): rest-api, file-upload, custom-script
- **Proposals** (`src/lib/engine/proposals.ts`): create, list, review, approve/reject
- **Audit** (`src/lib/engine/audit.ts`): SHA-256 hash chain, append-only, validateChain
- **Snapshots** (`src/lib/engine/snapshots.ts`): caso_slug namespaced graph copies
- **Config** (`src/lib/engine/config.ts`): CRUD for 6 config node types
- **Orchestrator** (`src/lib/engine/orchestrator/`): dispatch, synthesis, priority, diminishing returns
- **Research** (`src/lib/engine/`): research-program, gap-detector, research-metrics
- **API Routes** (`src/app/api/casos/[casoSlug]/engine/`): 9 routes
- **UI Components** (`src/components/engine/`): Dashboard, PipelineStatus, ProposalReview, AuditLog, GateApproval, OrchestratorPanel

### M10 Remaining Gaps (do NOT re-implement what exists)

- [ ] Dedup integration: wire `src/lib/ingestion/dedup.ts` into connector source-level dedup
- [ ] Parallel agent dispatch: `src/lib/engine/agents.ts` for per-stage concurrent execution
- [ ] LLM cost budgeting: token estimation + tracking per iteration in iterate stage
- [ ] Gap detector → iterate wiring: gaps from iteration N become enrichment targets for N+1
- [ ] Graph algorithms: audit `src/lib/graph/algorithms.ts` — extend with centrality, community detection, anomaly if missing
- [ ] MiroFish refactor: add `endpoint` param to client, generalize seed export node types
- [ ] Engine metrics: pipeline_runs_total, llm_calls_total, proposals_total counters

## Current Objective — Milestone 11: Compliance Framework Engine

**Goal:** Per-investigation compliance framework engine. Researchers declare which international standards (FATF, UNCAC, SOC 2) govern their investigation. Machine-readable rules as mild pipeline gates, parallel auditor for warnings, manual attestations, Qwen LLM for qualitative analysis. Frameworks are swappable — adding a standard = adding a YAML file.

**Full spec:** See `TASKS.md` → Milestone 11 (6 phases + pipeline integration)

**Key decisions:**
- Gate rules are **mild** — they log + flag, don't crash the pipeline
- LLM check handler reuses M10's `LLMProvider` factory (not direct MiroFish calls)
- Compliance evaluations create `AuditEntry` nodes in the existing hash chain
- No framework attached → compliance checks skip entirely (zero overhead)

**Dependencies available:** M9 InvestigationConfig ✅, M10 pipeline executor + LLM abstraction ✅

## Next Objective — Milestone 17: Investigation Governance

**Goal:** Git-like governance for investigations. Fork, branch, merge requests, coalitions with democratic governance. The investigation graph becomes a versioned, auditable, collaborative artifact.

**Full spec:** See `TASKS.md` → Milestone 17

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

## Acceptance Criteria (M11)

**Given** a YAML compliance framework,
**When** `pnpm run compliance:seed` is run,
**Then** ComplianceFramework + ComplianceRule + ChecklistItem nodes exist in Neo4j with correct relationships.

**Given** an investigation with FATF framework attached,
**When** the pipeline runs through ingest stage,
**Then** FATF gate rules for ingest phase are evaluated, violations logged as `compliance_violation` Proposals, auditor warnings in PipelineState.progress_json.

**Given** a `llm` check type rule,
**When** evaluated against investigation nodes,
**Then** it uses M10's LLMProvider factory (not direct MiroFish), parses structured JSON response, falls back to "inconclusive" on LLM failure.

**Given** no framework attached to an investigation,
**When** the pipeline runs,
**Then** compliance checks are skipped entirely with zero overhead.

## Acceptance Criteria (M17)

**Given** a researcher viewing an investigation,
**When** they click "Fork",
**Then** a new InvestigationConfig is created with `FORKED_FROM` relationship, a snapshot of the source graph is copied to the fork's namespace.

**Given** a branch with approved proposals,
**When** a merge request is submitted,
**Then** proposals are presented at a gate for review by the main investigation's owner or coalition.

**Given** a coalition-governed investigation,
**When** a merge request is submitted,
**Then** it requires quorum approval (configurable: majority, unanimous, or weighted) before proposals are applied.

## References

- Full PRD: `PRD.md`
- Task breakdown: `TASKS.md`
- Graph reference: [br-acc](https://github.com/World-Open-Graph/br-acc)
