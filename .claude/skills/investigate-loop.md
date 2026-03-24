---
name: investigate-loop
description: Run a generic investigation enrichment loop for any caso — ingest, verify, cross-reference, analyze with LLM, update investigation content
user_invocable: true
---

# Investigation Enrichment Loop

Generic orchestration loop that enriches any investigation case graph. Each cycle: status → ingest → verify → cross-reference → analyze → update → commit.

**Usage:** `/investigate-loop [caso-slug]` (e.g., `caso-epstein`, `caso-finanzas-politicas`, `caso-libra`)

If no caso-slug is provided, ask the user which case to run.

## Prerequisites

Before running, ensure:
1. **Neo4j** is running (`docker compose ps` or check port 7687)
2. **llama.cpp** is running with Qwen model on GPU (port 8080). If not:
   ```bash
   /home/vg/dev/llama.cpp/build/bin/llama-server -m /home/vg/models/Qwen3.5-9B-Q5_K_M.gguf --port 8080 --n-gpu-layers 99 --ctx-size 8192
   ```
3. Set env vars: `NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j`

## Case Registry

| Case | caso_slug | Investigation Data | Queries | Key Node Types |
|------|-----------|-------------------|---------|----------------|
| **Epstein** | `caso-epstein` | `src/lib/caso-epstein/investigation-data.ts` | `src/lib/caso-epstein/queries.ts` | Person, Flight, Location, Document, Event, Organization, LegalCase |
| **Finanzas Politicas** | `caso-finanzas-politicas` | `src/lib/caso-finanzas-politicas/investigation-data.ts` | N/A (platform labels) | Politician, Donor, Contractor, Company, CompanyOfficer, GovernmentAppointment, OffshoreOfficer, AssetDeclaration |
| **Caso Libra** | `caso-libra` | `src/lib/caso-libra/investigation-data.ts` | `src/lib/caso-libra/queries.ts` | CasoLibraPerson, CasoLibraEvent, CasoLibraDocument, CasoLibraWallet, CasoLibraOrganization, CasoLibraToken |

## The Loop

Each cycle runs these phases. Use parallel agents wherever possible.

### Phase 1: Status Check

Query Neo4j for current graph state. Adapt query to the case:

**For caso-epstein / caso-libra (caso_slug filtered):**
```cypher
MATCH (n) WHERE n.caso_slug = $casoSlug
RETURN n.confidence_tier AS tier, labels(n)[0] AS type, count(n) AS count
ORDER BY tier, type
```

**For caso-finanzas-politicas (platform labels, no caso_slug):**
```cypher
// Node counts by label (platform-wide entities)
MATCH (n) WHERE n:Politician OR n:Donor OR n:Contractor OR n:Company OR n:CompanyOfficer OR n:GovernmentAppointment OR n:OffshoreOfficer OR n:AssetDeclaration
RETURN labels(n)[0] AS label, count(n) AS cnt ORDER BY cnt DESC

// Cross-reference relationship summary
MATCH ()-[r:SAME_ENTITY]->()
RETURN r.match_type AS type, count(r) AS cnt ORDER BY cnt DESC

// Investigation flags
MATCH (a)-[r:SAME_ENTITY]->(b)
RETURN labels(a)[0] AS src, labels(b)[0] AS tgt, count(r) AS cnt ORDER BY cnt DESC
```

Report: total nodes, edges, tier/match-type breakdown.

### Phase 2: Ingest (if new data available)

**caso-epstein:**
- Wave 1 (rhowardstone), Wave 2 (Epstein Exposed API), Wave 3 (document enrichment), Wave 4 (dleerdefi logbooks)
- Run `pnpm run ingest:wave{N}` as appropriate

**caso-finanzas-politicas:**
- Cross-reference engine: `pnpm run cross-ref`
- ETL pipelines: como-voto, cne-finance, boletin-oficial, opencorporates, ddjj-patrimoniales, cnv-securities
- Schema init: `npx tsx scripts/init-schema.ts` (with dotenv)

**caso-libra:**
- Check for new data in `_ingestion_data/` or external APIs
- Run case-specific ingestion scripts

Run ingestion in background where possible.

### Phase 3: Verify & Cross-Reference (parallel agents)

Dispatch 3-4 agents in parallel, adapted to the case:

**Agent A — Verify top entities:**
- caso-epstein: top bronze persons with most connections
- caso-finanzas-politicas: top revolving door cases (CompanyOfficer↔GovernmentAppointment with most companies)
- caso-libra: key persons and events
- For each: WebSearch for confirmation
- DNI-verify all CUIT/DNI matches (check document_number matches across sources)
- Flag false positives (fuzzy name matches with different DNIs are common)

**Agent B — Verify organizations/companies:**
- caso-epstein: bronze organizations
- caso-finanzas-politicas: shell company flags (0 IGJ officers + contracts), repeat contract winners
- caso-libra: organizations and wallets
- WebSearch each for confirmation

**Agent C — Cross-reference enrichment:**
- caso-finanzas-politicas: run `pnpm run cross-ref` if not recently run, check for new label pairs
- caso-epstein: check for new SAME_ENTITY or ASSOCIATED_WITH patterns
- All: deduplicate (exact name/slug + near-duplicates Levenshtein ≤ 2)

**Agent D — Verify claims/factchecks:**
- Review existing factcheck items against current Neo4j state
- Remove items that are false positives
- Add new items for verified findings
- Follow bilingual (ES/EN) pattern

### Phase 4: Analyze with LLM (parallel agents)

Dispatch 2-3 agents using the GPU Qwen model:

**Agent E — Network analysis:**
- Extract the most connected entities and their cross-dataset links
- Send to Qwen at http://localhost:8080/v1/chat/completions
- Model: "Qwen3.5-9B-Q5_K_M.gguf", temperature 0.3, max_tokens 4096
- NOTE: Qwen 3.5 may use thinking mode. Check `reasoning_content` field AND `content`. Parse both.
- caso-epstein: bridge nodes, co-flyers, org connections, victim/recruiter patterns
- caso-finanzas-politicas: revolving door networks, donor-officer-contractor chains, shell company clusters
- caso-libra: wallet flows, communication networks, timeline correlations

**Agent F — Financial analysis:**
- caso-epstein: FINANCED, EMPLOYED_BY, trust/shell company network
- caso-finanzas-politicas: Donor→Politician→Contractor chains, DDJJ wealth vs corporate positions
- caso-libra: token flows, wallet clusters, pump-dump patterns
- Send to Qwen for forensic analysis

### Phase 5: Clean & Sanitize

Dispatch cleanup agent:
- Delete garbage nodes (corrupted entries, single-character names, test data)
- Merge newly discovered duplicates
- Fix data quality issues flagged by analysis agents
- Report deletions and fixes

### Phase 6: Update Investigation Content

Dispatch 2-3 agents to update investigation artifacts:

**Agent H — Update stats:**
- Query Neo4j for current counts
- Update the case's investigation-data.ts IMPACT_STATS
- Update page.tsx / OverviewContent.tsx with new numbers

**Agent I — Update factchecks:**
- Add new verified findings to the case's investigation-data.ts
- Follow existing bilingual (EN/ES) pattern
- DNI-verify all claims before adding (for finanzas-politicas)

**Agent J — Update narrative:**
- caso-epstein: update `NARRATIVE-EPSTEIN.md` or resumen chapters
- caso-finanzas-politicas: update `/resumen/page.tsx` chapters with new findings
- caso-libra: update investigation narrative
- Include specific names, numbers, and evidence from this cycle

### Phase 7: Commit & Report

```bash
git add -A && git commit -m "chore: investigation loop cycle — [caso-slug] $(date +%Y-%m-%d-%H%M)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

Print summary:
- Nodes/edges before → after
- Entities verified this cycle
- Duplicates merged / false positives removed
- Key findings from LLM analysis
- New factcheck items added

Then ask: "Run another cycle?"

## Agent Dispatch Pattern

All agents use this Neo4j connection pattern:
```bash
cd /home/vg/dev/office-of-accountability/webapp && NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j npx tsx -e '
import "dotenv/config";
import { readQuery, closeDriver } from "./src/lib/neo4j/client";
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
- caso-finanzas-politicas uses platform-wide labels (no caso_slug filter) — queries hit Politician, Donor, Contractor, etc. directly
- CUIT→DNI extraction: middle 8 digits of 11-digit CUIT. Person CUITs start with 20/23/24/27, company CUITs with 30/33/34
- Fuzzy name matching (Levenshtein ≤ 2) produces false positives at scale (TINELLI≈PINELLI). Always DNI-verify.
- Neo4j LIMIT requires integer type — use `toInteger($limit)` in Cypher or `neo4j.int(n)` in JS
- Qwen 3.5 may put analysis in `reasoning_content` or `content` — always check both fields
- Promote to silver only with web-verified evidence. Never auto-promote to gold.
- The graph API at `/api/caso/[slug]/graph` uses two-pass queries to avoid O(n^2) cartesian products
- Cross-ref engine timeout: set `NEO4J_QUERY_TIMEOUT_MS=120000` for heavy CUIT joins
- Investigation data files: all use bilingual (ES primary, EN secondary) pattern with typed interfaces
