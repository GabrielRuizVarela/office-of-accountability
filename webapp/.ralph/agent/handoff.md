# Session Handoff

_Generated: 2026-03-24 manual reset after audit_

## Git Context

- **Branch:** `worktree-crispy-cuddling-snail`

## Status

An audit found **critical integration bugs in M10 engine code** that were never caught. The individual modules are real implementations but they don't wire together correctly. These MUST be fixed before continuing with M13 Phase 3+.

**Completed so far:** M0–M11, M12 E2E tests, M13 Phases 1–2.

## Pending Work — M10 Integration Fixes

Read `PROMPT.md` → "M10 Fix List — MUST complete before M11" for full details per item.

### Critical Backend Bugs (fix first)
- [ ] `src/lib/engine/stages/index.ts` — iterate factory returns AnalyzeStageRunner instead of IterateStageRunner. Import IterateStageRunner, fix the case. Also fix iterate.ts STAGE_KIND from 'analyze' to 'iterate'.
- [ ] `src/lib/engine/stages/shared.ts` processToolCall — 5 LLM tools (read_graph, fetch_url, extract_entities, run_algorithm, compare_timelines) are silent no-ops. Implement real handlers.
- [ ] `src/lib/engine/orchestrator/synthesis.ts` — queries use HAS_PROPOSAL relationship that is never created. Fix by either creating the relationship in proposals.ts or rewriting queries to use property match.
- [ ] `src/lib/engine/stages/ingest.ts` — only uses normalizeName from dedup. Wire buildExistingMaps() and fuzzy dedup() to check proposals against existing nodes.
- [ ] `src/lib/engine/proposals.ts` applyProposal — dynamic labels from LLM output via template literals. Add whitelist check against SchemaDefinition node types.

### Critical UI Bugs
- [ ] `src/components/engine/EngineDashboard.tsx` — bootstrap fetch to /engine/state has no pipeline_id, always 400s. Add pipeline discovery step or update route to support listing by caso_slug.
- [ ] `src/components/engine/AuditLog.tsx` line 93 — setEntries(json.data) should be setEntries(json.data.entries).
- [ ] `src/components/investigation/InvestigationNav.tsx` — no motor/engine tab. Add { href: '/motor', label: { en: 'Engine', es: 'Motor' } } to all case tab lists.
- [ ] Motor page unreachable for static case routes — caso-epstein and finanzas-politicas use static route trees. Either add motor/page.tsx in each or migrate to dynamic [slug] layout.

### Feature Gaps
- [ ] LLM cost budgeting — LLMResponse.usage populated but never accumulated or budget-checked in iterate.ts.
- [ ] Graph algorithms — src/lib/graph/algorithms.ts only has BFS. Add degree centrality, betweenness centrality, community detection, anomaly detection.
- [ ] Engine metrics — no pipeline_runs_total, llm_calls_total, proposals_total counters anywhere.
- [ ] Wire logger — src/lib/engine/logger.ts exists but is never imported. Replace console.error in pipeline/stages/orchestrator.
- [ ] Fix TypeScript errors — 9 errors in scripts/ files (5 .ts extension imports + 4 implicit any in ingest-consolidation.ts).

## After M10 Fixes

Continue with M13 Phase 3+ and the rest of the **Implementation Queue (M11–M17)** in PROMPT.md. Execute milestones in order. Do NOT stop after finishing a single milestone.

## Next Session

**There are 14 open fix items above. DO NOT signal LOOP_COMPLETE until all are done.**
