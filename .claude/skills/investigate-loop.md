---
name: investigate-loop
description: Run the investigation enrichment loop — ingest external data, verify persons, deduplicate, analyze with LLM, promote verified data, and update investigation content
user_invocable: true
---

# Investigation Enrichment Loop

Automated orchestration loop that enriches the Epstein investigation graph through parallel agent dispatch. Each cycle: ingest → verify → dedup → analyze → promote → update.

## Prerequisites

Before running, ensure:
1. **Neo4j** is running (`docker compose ps` or check port 7687)
2. **llama.cpp** is running with Qwen model on GPU (port 8080). If not:
   ```bash
   /home/vg/dev/llama.cpp/build/bin/llama-server -m /home/vg/models/Qwen3.5-9B-Q5_K_M.gguf --port 8080 --n-gpu-layers 99 --ctx-size 8192
   ```
3. Set env vars: `NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j`

## The Loop

Each cycle runs these phases. Use parallel agents wherever possible.

### Phase 1: Status Check

Query Neo4j for current graph state:
```cypher
MATCH (n) WHERE n.caso_slug = "caso-epstein"
RETURN n.confidence_tier AS tier, labels(n)[0] AS type, count(n) AS count
ORDER BY tier, type
```

Report: total nodes, edges, tier breakdown, last ingestion wave completed.

### Phase 2: Ingest (if new data available)

Check if there are pending waves to run:

- **Wave 1** (rhowardstone): Check if `_ingestion_data/rhowardstone/` exists. If not, clone it. Run `pnpm run ingest:wave1` if Wave 1 nodes don't exist yet.
- **Wave 2** (Epstein Exposed API): Check resume state at `_ingestion_data/wave-2-resume.json`. If incomplete, run `pnpm run ingest:wave2` in background (rate-limited, takes hours).
- **Wave 3** (Document enrichment): Run `pnpm run ingest:wave3 -- --limit 20` for next batch of documents.

Run ingestion in background where possible. Don't block on Wave 2.

### Phase 3: Verify & Promote (parallel agents)

Dispatch 3-4 agents in parallel:

**Agent A — Verify top bronze persons:**
- Query: top 30-50 bronze persons with most connections, excluding names with "?" or "Passenger"
- For each: WebSearch "[name] Epstein" to verify identity and connection
- Promote verified to silver, keep unverified as bronze
- Report promotions

**Agent B — Verify bronze organizations:**
- Query: all bronze organizations
- WebSearch each for Epstein connection
- Promote verified to silver

**Agent C — Verify bronze locations:**
- Query: all bronze locations
- Verify they're real Epstein-connected locations
- Promote verified to silver

**Agent D — Deduplicate:**
- Find exact name/slug duplicates across waves
- Find near-duplicates (Levenshtein ≤ 2)
- Merge duplicates: transfer relationships to canonical node, delete duplicate
- Report merges

### Phase 4: Analyze with LLM (parallel agents)

Dispatch 2-3 agents using the GPU Qwen model:

**Agent E — Network analysis:**
- Extract bridge nodes, co-flyers, org connections from Neo4j
- Send to Qwen at http://localhost:8080/v1/chat/completions
- Model: "Qwen3.5-9B-Q5_K_M.gguf", temperature 0.3, max_tokens 4096
- NOTE: Qwen 3.5 uses mandatory thinking mode. Analysis is in `reasoning_content` field, not `content`. Always parse both.
- Identify: hidden patterns, overlooked persons, network clusters

**Agent F — Financial analysis:**
- Extract FINANCED, EMPLOYED_BY, AFFILIATED_WITH, OWNED relationships
- Extract trust/shell company network
- Send to Qwen for forensic financial analysis
- Identify: money laundering patterns, shell structures, enablers

**Agent G — Victim/recruiter analysis:**
- Extract VICTIM_OF relationships, flight-only persons, recruiter contact networks
- Send to Qwen for trafficking pattern analysis
- Identify: recruitment chains, potential unidentified victims, dual victim-recruiters

### Phase 4b: Autonomous Research Iterations (autoresearch pattern)

After LLM analysis produces hypotheses, run an autonomous iteration loop that deepens the most promising leads without human intervention. Inspired by karpathy/autoresearch: fixed-budget iterations, evaluate, keep or discard, repeat.

**How it works:**
1. Rank hypothesis Proposals from Phase 4 by confidence score
2. For top 5 hypotheses, generate targeted follow-up queries:
   - "If [person A] is connected to [org B], search for [org B] corporate filings"
   - "If [location X] had events in [date range], search for corroborating flight records"
   - "If [shell company] has ≤1 officer, search OpenCorporates for related entities"
3. Execute follow-ups using parallel agents:
   - **WebSearch** for public records, news articles, court documents
   - **Neo4j traversal** for adjacent graph patterns not yet explored
   - **Cross-reference** against existing data sources (Compr.ar, ICIJ, CNE)
4. Evaluate each iteration:
   - `confidence_delta`: did the hypothesis get stronger or weaker?
   - `corroboration_score`: how many independent sources now support it?
   - `novelty_score`: did we find new entities/relationships?
   - `coverage_delta`: new nodes/edges added to graph
5. Keep hypotheses that improved; discard those that weakened
6. Detect gaps: persons mentioned but not yet nodes, time periods with no events, unverified locations
7. Feed gaps as enrichment targets into next iteration
8. Repeat for max 3 iterations or until no hypothesis improves

**Research directives** (optional): before running, check if the investigation has research_directives in its config — researcher-defined priorities like "focus on financial enablers" or "trace recruitment chains through modeling agencies". These guide which hypotheses get priority.

**Output:** Updated hypothesis Proposals with iterated confidence scores, new bronze nodes from follow-ups, gap analysis report. All iterations create AuditEntry nodes.

**Important:** This phase is autonomous but bounded. It does NOT promote tiers (that's still human-gated). It only creates bronze nodes and updates hypothesis confidence. The gate after Phase 4b lets the researcher review what the iterations found before anything gets promoted.

### Phase 5: Clean & Sanitize

Dispatch cleanup agent:
- Delete garbage nodes (FOIA references, "Passenger (N)", corrupted entries, single-character names)
- Merge newly discovered duplicates from ingestion
- Fix data quality issues flagged by analysis agents
- Report deletions and fixes

### Phase 6: Update Investigation Content

Dispatch 2-3 agents to update investigation artifacts:

**Agent H — Update overview stats:**
- Query Neo4j for current counts
- Update `webapp/src/app/caso/[slug]/OverviewContent.tsx` and `page.tsx` with new numbers

**Agent I — Update factcheck data:**
- Add new verified findings to `webapp/src/lib/caso-epstein/investigation-data.ts`
- Add new actors discovered during verification
- Follow existing bilingual (EN/ES) pattern

**Agent J — Update narrative:**
- Expand `NARRATIVE-EPSTEIN.md` with new findings from LLM analysis
- Add new persons, connections, and patterns discovered

### Phase 7: Commit & Report

```bash
git add -A && git commit -m "chore: investigation loop cycle $(date +%Y-%m-%d-%H%M)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

Print summary:
- Nodes/edges before → after
- Persons verified this cycle
- Duplicates merged
- Key findings from LLM analysis
- New factcheck items added

Then ask: "Run another cycle?"

## Orchestrator

The orchestrator coordinates all agent work across phases. Instead of dispatching agents ad-hoc, the orchestrator manages a task queue, prevents duplicate work, and synthesizes findings across agents.

### How it works

1. **Before dispatching agents:** the orchestrator checks what's already been investigated (OrchestratorState in Neo4j or in-memory tracking). It won't re-search entities that were already verified or hypotheses that were already evaluated.

2. **Batch planning:** group tasks by independence. Agents A-D (verify/dedup) are independent → dispatch in parallel. Agents E-G (LLM analysis) share the GPU → dispatch sequentially or with resource awareness.

3. **After each batch:** run synthesis:
   - **Corroboration**: Agent A verified person X, Agent E found the same person in a network cluster → boost confidence
   - **Contradiction**: Agent B says org Y is legitimate, Agent F flags it as a shell company → create conflict Proposal for human review
   - **Emergent patterns**: Agent E found A→B, Agent F found B→C → orchestrator surfaces A→B→C chain that no single agent saw
   - **Dedup findings**: two agents investigated overlapping entities → merge their Proposals, keep the higher-confidence one

4. **Priority rebalancing:** after synthesis, reprioritize the task queue:
   - Promote: tasks connected to newly corroborated findings
   - Demote: tasks in areas where last batch found nothing new
   - Generate: new tasks from gaps detected in synthesis

5. **Stopping conditions:**
   - Max iterations reached (default 3 batches)
   - Diminishing returns: novelty_score and coverage_delta both declining for 2+ batches
   - All tasks completed or deprioritized
   - Gate triggered (researcher review needed)

### Orchestrator in practice

Instead of Phase 3 dispatching agents A-D independently and Phase 4 dispatching E-G independently, the orchestrator runs this loop:

```
Batch 1: Agents A, B, C, D (verify + dedup) → synthesis → update priorities
Batch 2: Agents E, F, G (LLM analysis, sequential on GPU) → synthesis → update priorities
Batch 3: Phase 4b iteration agents (follow-up on top hypotheses) → synthesis → evaluate metrics
Batch 4+: If metrics improving, continue iterations; if plateauing, stop → gate
```

The orchestrator writes a `synthesis_report` after each batch. At the gate (Phase 7), the researcher sees not just individual Proposals but the orchestrator's synthesis: what was corroborated, what conflicted, what emerged from combining findings.

## Agent Dispatch Pattern

All agents use this Neo4j connection pattern:
```bash
cd /home/vg/dev/office-of-accountability/webapp && NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j npx tsx -e '
import { getDriver, closeDriver, verifyConnectivity } from "./src/lib/neo4j/client.ts";
// ... queries ...
'
```

For LLM calls:
```bash
curl -s http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "Qwen3.5-9B-Q5_K_M.gguf", "messages": [...], "temperature": 0.3, "max_tokens": 4096}'
```

## Important Notes

- Always run verification agents BEFORE analysis agents (analysis needs clean data)
- Wave 2 API is rate-limited at 100 req/hr — run in background, don't wait
- Qwen 3.5 puts analysis in `reasoning_content`, not `content` — always check both fields
- Promote to silver only with web-verified evidence. Never auto-promote to gold.
- The graph API query at `/api/caso/[slug]/graph` was rewritten to avoid O(n^2) cartesian products. If graph gets very large (>10K nodes), consider defaulting to gold+silver only.
- Neo4j LIMIT requires integer type — use `neo4j.int(n)` when passing JS numbers
