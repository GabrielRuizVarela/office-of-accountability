# Session Handoff

_Generated: 2026-03-21 11:19:00 UTC_

## Git Context

- **Branch:** `worktree-crispy-cuddling-snail`
- **HEAD:** 6aa56bf: chore: auto-commit before merge (loop primary)

## Tasks

### Completed

- [x] Initialize Vinext app with TypeScript and Tailwind CSS in webapp/
- [x] Docker Compose: Neo4j 5 Community with Bolt+WS listeners
- [x] Project structure: lib/neo4j, lib/graph, components, etl directories + .env.example
- [x] Neo4j schema initialization script with constraints and indexes
- [x] Neo4j client wrapper: lib/neo4j/client.ts with typed query helpers
- [x] ESLint + Prettier configuration
- [x] ETL types: Zod schemas for Como Voto legislators + votes JSON
- [x] ETL fetcher: download Como Voto JSON from GitHub
- [x] ETL transformer: map Como Voto to Neo4j params
- [x] ETL loader: batch MERGE into Neo4j
- [x] ETL runner script: npm run etl:como-voto
- [x] M2: Graph transform utilities — lib/graph/transform.ts to convert Neo4j records to {nodes, links} format
- [x] M2: Graph query service — lib/graph/queries.ts with Cypher queries for node neighborhood and search
- [x] M2: API route GET /api/graph/node/[id] — returns neighborhood {nodes, links} JSON
- [x] M2: API route GET /api/graph/search — search nodes by query string
- [x] Install react-force-graph-2d and create ForceGraph wrapper component
- [x] Create SearchBar component for graph explorer
- [x] Create NodeDetailPanel component
- [x] Create TypeFilter component for graph explorer
- [x] Create /explorar Graph Explorer page
- [x] M4: Politician query functions — getPoliticianBySlug, getPoliticianVoteHistory, getAllPoliticianSlugs in lib/graph/queries.ts
- [x] M4: Politician profile page — SSR at /politico/[slug] with vote history, graph sub-view, Schema.org JSON-LD, OG tags
- [x] M5: Auth types + Neo4j adapter — DONE
- [x] Auth UI — sign-in page, sign-up page, user menu component
- [x] Install TipTap deps + investigation types and Zod schemas
- [x] Investigation Neo4j query functions
- [x] Investigation CRUD API routes
- [x] TipTap editor component with toolbar
- [x] Investigation create/edit pages
- [x] Investigation reading page
- [x] Investigations index + my investigations
- [x] Install satori + resvg-wasm and create OG image rendering utility
- [x] Politician OG image API route at /api/og/politician/[slug]
- [x] Investigation OG image API route at /api/og/investigation/[slug]
- [x] Wire OG images into politician + investigation metadata
- [x] PDF export for investigations
- [x] Rate limiting middleware for API routes
- [x] Security response headers
- [x] Homepage upgrade with navigation
- [x] Seed investigation content
- [x] Create src/lib/investigations/types.ts — foundational types for M9
- [x] Create src/lib/investigations/utils.ts — casoNodeId helper + slug generation
- [x] Create seed-investigation-configs.ts — idempotent MERGE of InvestigationConfig + SchemaDefinition + NodeTypeDefinition + RelTypeDefinition for all 3 investigations
- [x] Add generic label constraints + caso_slug range indexes to init-schema.ts
- [x] Create migrate-caso-libra-labels.ts — two-phase label migration script
- [x] Update seed-caso-libra.ts to use generic labels + caso_slug + prefixed IDs
- [x] Create seed-caso-finanzas-politicas.ts script
- [x] Update seed-caso-epstein.ts: prefix IDs with caso-epstein:, add caso_slug filters to MATCH clauses, use session pattern
- [x] Create src/lib/investigations/config.ts — read/write InvestigationConfig nodes from Neo4j
- [x] Create src/lib/investigations/query-builder.ts — schema-aware generic query builder
- [x] Create per-investigation config.ts files (caso-libra, caso-epstein, caso-finanzas-politicas)
- [x] Create src/lib/investigations/registry.ts — casoSlug → InvestigationClientConfig registry
- [x] Create investigations/registry.ts — client config registry mapping casoSlug to InvestigationClientConfig
- [x] Update /api/caso/[slug]/graph/route.ts — use generic query builder instead of hardcoded caso-epstein
- [x] Create /api/caso/[slug]/timeline/route.ts — unified timeline endpoint
- [x] Create /api/caso/[slug]/stats/route.ts — unified stats endpoint
- [x] Create /api/caso/[slug]/config/route.ts — returns InvestigationClientConfig from registry
- [x] Create /api/caso/[slug]/schema/route.ts — unified schema endpoint
- [x] Create /api/caso/[slug]/node/[id]/route.ts — node connections endpoint
- [x] Add 301 redirects from /api/caso-libra/* to /api/caso/caso-libra/*
- [x] Full M9 code review — review all unified API routes (graph, timeline, stats, config, schema, node, redirects) + infrastructure (types, utils, config, query-builder, registry)
- [x] Add engine node type uniqueness constraints to scripts/init-schema.ts (SourceConnector.id, PipelineConfig.id, PipelineStage.id, Gate.id, PipelineState.id, Proposal.id, AuditEntry.id, Snapshot.id, ModelConfig.id, MiroFishConfig.id)
- [x] Create src/lib/engine/types.ts — TypeScript interfaces + Zod schemas for all engine node types (SourceConnector, PipelineConfig, PipelineStage, Gate, PipelineState, Proposal, AuditEntry, Snapshot, ModelConfig, MiroFishConfig)
- [x] Create src/lib/engine/config.ts — CRUD operations for engine config nodes (read/write SourceConnector, PipelineConfig, PipelineStage, Gate, ModelConfig, MiroFishConfig to Neo4j)
- [x] Create src/lib/engine/audit.ts — append-only AuditEntry creation with SHA-256 hash chain, chain validation on startup
- [x] Create webapp/src/lib/engine/llm/types.ts — LLM abstraction interfaces (Message, ToolDefinition, ToolCall, LLMOptions, LLMResponse, LLMProvider)
- [x] Create llamacpp LLM provider (webapp/src/lib/engine/llm/llamacpp.ts)
- [x] Create llm/factory.ts — provider factory from ModelConfig
- [x] Step 4.1: Create webapp/src/lib/engine/connectors/types.ts — shared Connector interface, ConnectorResult, per-kind config Zod schemas
- [x] Step 7.1: Refactor client.ts to accept endpoint parameter
- [x] Step 7.2: Generalize export.ts for any investigation
- [x] Step 8.1 — Create run route POST /api/engine/[investigationId]/run
- [x] Create OpenAI LLM provider adapter (webapp/src/lib/engine/llm/openai.ts)
- [x] Create Anthropic LLM provider adapter (webapp/src/lib/engine/llm/anthropic.ts)
- [x] Create scoped tool definitions per stage (webapp/src/lib/engine/llm/tools.ts)
- [x] Update LLM barrel exports (webapp/src/lib/engine/llm/index.ts)
- [x] Create webapp/src/lib/engine/stages/iterate.ts — autonomous research iteration stage implementing StageRunner, loops LLM calls with gap detection until convergence or max iterations
- [x] Create webapp/src/lib/engine/research-program.ts — ResearchDirective type + ResearchProgram manager (add/remove/prioritize directives, track status per directive)
- [x] Create webapp/src/lib/engine/research-metrics.ts — evaluateIteration() returning IterationMetrics (coverage_delta, confidence_delta, corroboration_score, novelty_score) + shouldContinue() convergence check
- [x] Create webapp/src/lib/engine/gap-detector.ts — detectGaps(casoSlug) queries graph for missing relationships, isolated nodes, low-confidence clusters, returns GapReport with prioritized research suggestions
- [x] Add OrchestratorTask + OrchestratorState constraints to schema.ts and types to types.ts
- [x] Step 3.3: Create orchestrator/dispatch.ts — planBatch, dispatchBatch, collectResults, reassign
- [x] Refactor MiroFish export.ts — accept agent_source and context_from config instead of hardcoded Person/Organization/Location labels (file: webapp/src/lib/mirofish/export.ts)
- [x] Create src/lib/engine/agents.ts — parallel agent dispatch per stage config with scoped queries, concurrent execution, progress updates on PipelineState
- [x] Create /api/casos/[casoSlug]/engine/orchestrator/route.ts — GET orchestrator state, active tasks, synthesis reports
- [x] Create /api/casos/[casoSlug]/engine/orchestrator/tasks/route.ts — GET+POST task queue CRUD, manual priority override
- [x] Create /api/casos/[casoSlug]/engine/orchestrator/focus/route.ts — GET+PUT research focus, update directives mid-run
- [x] Move 6 engine API routes from /api/engine/[investigationId]/ to /api/casos/[casoSlug]/engine/, rename param to casoSlug in all handlers
- [x] Extract shared helpers from iterate.ts into stages/shared.ts
- [x] Implement stages/verify.ts — LLM-driven bronze verification
- [x] Implement stages/enrich.ts — LLM entity extraction from source URLs
- [x] Implement stages/analyze.ts — LLM-driven gap detection and hypothesis generation
- [x] Create src/lib/engine/logger.ts — structured engine logger with LogEntry, createEngineLogger factory, withTiming helper

### Remaining

- [ ] Add browser language detection and bilingual page titles/metadata

## Key Files

Recently modified:

- `.claude/commands/investigate-loop.md`
- `.claude/skills/investigate-loop.md`
- `.gitignore`
- `.ralph/agent/handoff.md`
- `.ralph/agent/scratchpad.md`
- `.ralph/agent/summary.md`
- `.ralph/agent/tasks.jsonl`
- `.ralph/current-events`
- `.ralph/current-loop-id`
- `.ralph/diagnostics/logs/ralph-2026-03-21T02-23-28-935-482963.log`

## Next Session

The following prompt can be used to continue where this session left off:

```
Continue the previous work. Remaining tasks (1):
- Add browser language detection and bilingual page titles/metadata

Original objective: Continue from M10 onward
```
