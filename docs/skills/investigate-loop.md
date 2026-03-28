---
name: investigate-loop
description: Run a generic investigation enrichment loop for any caso — discover case config dynamically, ingest, verify, cross-reference, analyze with LLM, update content
user_invocable: true
---

# Investigation Enrichment Loop

Generic orchestration loop that enriches any investigation case. Discovers case configuration dynamically from Neo4j and the filesystem. Each cycle: discover → status → ingest → verify → analyze → update → commit.

**Usage:** `/investigate-loop [caso-slug]` — if omitted, list available cases and ask.

## Prerequisites

1. **Neo4j** running (port 7687)
2. **Local LLM** running on GPU (port 8080). Check with `curl -s http://localhost:8080/v1/models`

## Phase 0: Discover Case

Discover the case configuration dynamically — never hardcode case-specific knowledge.

**Step 1 — Find investigation data module:**
```bash
# List available cases from filesystem
ls webapp/src/lib/caso-*/  # or src/lib/caso-*
ls webapp/src/app/caso/*/  # page routes
```

**Step 2 — Read case structure:**
- Read the case's `investigation-data.ts` (or equivalent) to understand its types and arrays
- Read the case's `queries.ts` if it exists
- Check for ETL pipelines: `ls webapp/src/etl/` for case-specific directories
- Check for API routes: `ls webapp/src/app/api/caso/*/`

**Step 3 — Query Neo4j for case state:**
```cypher
// Try caso_slug-based cases first
MATCH (n) WHERE n.caso_slug = $casoSlug
RETURN labels(n)[0] AS type, count(n) AS cnt ORDER BY cnt DESC

// If no results, check for platform-label cases (no caso_slug)
CALL db.labels() YIELD label RETURN label ORDER BY label

// Relationship summary
MATCH ()-[r]->() RETURN type(r) AS rel, count(r) AS cnt ORDER BY cnt DESC LIMIT 20
```

**Step 4 — Identify available tools:**
```bash
# Available pnpm scripts
grep -E '"[^"]+":' webapp/package.json | grep -i "ingest\|cross\|etl"

# Available standalone scripts
ls webapp/scripts/*.ts
```

Build a mental model of the case from what you find, then proceed.

## Phase 1: Status Check

Report current state using what you discovered:
- Node counts by label/type
- Relationship counts by type
- Confidence tier breakdown (if applicable)
- Last notable finding or ingestion

## Phase 2: Ingest (if applicable)

Check for pending ingestion work:
- Run any available ETL/ingestion scripts discovered in Phase 0
- Check for resume state files (`*-resume.json`)
- Run in background where possible — don't block on slow pipelines

## Phase 3: Verify & Cross-Reference (parallel agents)

Dispatch 2-4 agents in parallel, adapted to what the case contains:

**Agent A — Verify top entities:**
- Query the most connected/important entities
- WebSearch for confirmation of key claims
- For CUIT/DNI-based matches: verify document numbers match across sources
- Flag false positives (especially fuzzy name matches)

**Agent B — Verify organizations/companies:**
- Query entities with flags or anomalies
- WebSearch for confirmation
- Check shell company indicators (missing officers, disproportionate contracts)

**Agent C — Cross-reference enrichment:**
- Run cross-reference engine if available (`pnpm run cross-ref` or equivalent)
- Check for new entity resolution opportunities
- Deduplicate: exact + near-duplicates

**Agent D — Validate existing claims:**
- Review factcheck items against current Neo4j state
- Remove false positives, update stale numbers
- Add new items for verified findings

## Phase 4: Analyze with LLM (parallel agents)

Dispatch 2-3 agents using the local LLM (port 8080, OpenAI-compatible API):

```bash
curl -s http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [...], "temperature": 0.3, "max_tokens": 4096}'
```

**Agent E — Network analysis:**
- Extract the most connected entities and cross-dataset links from Neo4j
- Send to local LLM for pattern identification
- NOTE: Check both `reasoning_content` and `content` fields in response (thinking mode)

**Agent F — Domain-specific analysis:**
- Adapt to what the case is about (financial flows, trafficking patterns, token movements, etc.)
- Let the data guide the analysis — don't assume the case type

## Phase 5: Clean & Sanitize

- Delete garbage nodes (corrupted entries, test data, single-character names)
- Merge duplicates discovered during verification
- Fix data quality issues flagged by analysis agents

## Phase 6: Update Investigation Content

Discover and update the case's frontend artifacts:

**Find the files:**
```bash
# Investigation data (factchecks, timeline, actors, stats)
find webapp/src/lib/caso-* -name "investigation-data.ts"

# Narrative pages
find webapp/src/app/caso/ -name "page.tsx" | head -20

# Overview/landing pages
find webapp/src/app/caso/ -path "*/resumen/*" -o -path "*/investigacion/*"
```

**Update following the existing patterns in each file:**
- Read the file's type definitions first — match the exact interface
- Follow the bilingual pattern if present (ES primary, EN secondary)
- DNI-verify all claims before adding (for CUIT/DNI-based cases)
- Update stats with real numbers from Neo4j queries

## Phase 7: Commit & Report

```bash
git add -A && git commit -m "chore: investigation loop — [caso-slug] $(date +%Y-%m-%d-%H%M)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

Print summary:
- Nodes/edges before → after
- Entities verified this cycle
- Key findings from LLM analysis
- Content updates made

Then ask: "Run another cycle?"

## Technical Notes

- Neo4j LIMIT needs integer type — use `toInteger($limit)` in Cypher or `neo4j.int(n)` in JS
- Always use `import "dotenv/config"` in standalone scripts for env vars
- For heavy cross-reference joins, set `NEO4J_QUERY_TIMEOUT_MS=120000`
- Cartesian Cypher joins on large label sets will timeout — use in-memory Map joins instead
- Fuzzy name matching (Levenshtein ≤ 2) produces false positives at scale — always verify against document IDs
- Promote to silver only with web-verified evidence. Never auto-promote to gold.
- Graph API queries use two-pass pattern to avoid O(n^2) cartesian products
