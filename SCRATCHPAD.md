# Investigation Standardization — Scratchpad

**Started:** 2026-03-21
**Branch:** worktree-crispy-cuddling-snail
**Goal:** Milestone 9 — Standardize Caso Libra, Finanzas Politicas, Caso Epstein under unified InvestigationConfig + generic labels + unified API

---

## Current State Audit (2026-03-21)

### What already follows the target pattern
- **Caso Epstein** already uses generic labels (`Person`, `Event`, `Document`, etc.) + `caso_slug: "caso-epstein"` property
- Epstein queries.ts (18KB) filters by `WHERE n.caso_slug = $casoSlug`
- Epstein seed script (80KB) uses generic labels, imports rhowardstone data
- 10,864+ Epstein nodes already in Neo4j

### What needs migration
- **Caso Libra** uses `CasoLibra*` prefixed labels (CasoLibraPerson, CasoLibraEvent, etc.)
- Neo4j schema has 6 CasoLibra* unique constraints, no generic label constraints
- 8 API routes hardcoded at `/api/caso-libra/*`
- Seed script (26KB) uses CasoLibra* labels

### What needs creation from scratch
- **Caso Finanzas Politicas** has no Neo4j backend — only static `investigation-data.ts` (48KB)
- No `lib/investigations/` directory (query builder, registry, config, types)
- No `/api/casos/` unified API routes
- No InvestigationConfig nodes in Neo4j
- No generic label constraints or caso_slug range indexes

### Existing API routes to redirect
- `/api/caso-libra/*` — 8 routes (graph, person, document, wallets, investigation, simulate x3)
- `/api/caso/[slug]/*` — 6 routes (graph, flights, proximity, simulation/init, simulation/query)

### Static pages to delete (after generic [slug] pages work)
- `caso/finanzas-politicas/` — 7 files (page, layout, resumen, conexiones, investigacion, cronologia, dinero)
- `caso/caso-epstein/` — 5 files (page + layout, resumen, cronologia, evidencia, investigacion)
- Keep: `caso/finanzas-politicas/conexiones/` (platform-graph visualization)

---

## Execution Log

*(entries added as work progresses)*

### 2026-03-21 — Docs prepared
- Updated TASKS.md with full M9 specification (data model, schemas, interfaces, file changes, 6 phases)
- Updated PRD.md with section 5.3.2 + M9 milestone
- Updated PROMPT.md with requirement 11 + M9 acceptance criteria
- All spec content translated into docs — no external spec references remain
- Current state audit completed, docs reflect actual codebase state

### 2026-03-21 — M10 added (Motor de Investigación Autónomo)
- Added Milestone 10 to TASKS.md — automated pipeline with 8 phases:
  1. Engine data model (config nodes, proposals, audit trail)
  2. LLM abstraction layer (4 providers, 3 execution modes)
  3. Pipeline executor (stage runner, gates, proposals, snapshots)
  4. Source connectors (rest-api, file-upload, custom-script)
  5. Stage implementations (ingest, verify, enrich, analyze, report)
  6. Graph algorithms (5 algorithms extending `algorithms.ts`)
  7. MiroFish integration (endpoint param, generalized seed)
  8. API routes (6 engine endpoints)
- Updated PRD.md with M10 milestone + critical path
- Updated PROMPT.md with requirement 11 + M10 acceptance criteria
- Engine spec content (`docs/superpowers/specs/2026-03-20-investigation-engine-design.md`) fully translated into TASKS.md
- Reuses: `dedup.ts`, `quality.ts` (directly), `algorithms.ts` (extend), `mirofish/client.ts` (refactor)

### Wave execution order
1. **Ralph wave: M9** — Investigation Standardization (generic labels, unified API, config-driven frontend)
2. **Ralph wave: M10** — Motor de Investigación Autónomo (pipeline, LLM, connectors, algorithms)

### M9 next steps
- Phase 1: Create `scripts/seed-investigation-configs.ts` + update `init-schema.ts`
- Phase 2: Create `scripts/migrate-caso-libra-labels.ts`
- Phase 3: Create `scripts/seed-caso-finanzas-politicas.ts`
- Phase 4: Align existing `seed-caso-epstein.ts` with InvestigationConfig schema
- Phase 5: Create `lib/investigations/` module + unified API routes
- Phase 6: Frontend standardization + static route deletion

### M10 next steps (after M9 complete)
- Phase 1: Engine data model in Neo4j + `lib/engine/types.ts`
- Phase 2: LLM providers (llamacpp first — Qwen already running locally)
- Phase 3: Pipeline executor + proposal system
- Phase 4: Source connectors (rest-api first for Epstein Exposed API)
- Phase 5: Stage implementations
- Phase 6: Graph algorithms
- Phase 7: MiroFish refactor
- Phase 8: API routes
