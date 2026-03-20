---
name: investigate-argentina-finance
description: Run the Argentine political finance investigation loop — verify cross-dataset matches, analyze conflicts of interest with LLM, promote verified data, generate investigation findings
user_invocable: true
---

# Argentine Political Finance Investigation Loop

Automated orchestration loop that investigates connections between Argentine politicians, campaign donors, offshore entities, government contractors, and corporate officers. Each cycle: status → verify → cross-enrich → analyze → report.

## Prerequisites

Before running, ensure:
1. **Neo4j** is running (port 7687)
2. **llama.cpp** is running with Qwen model on GPU (port 8080). If not:
   ```bash
   /home/vg/dev/llama.cpp/build/bin/llama-server -m /home/vg/models/Qwen3.5-9B-Q5_K_M.gguf --port 8080 --n-gpu-layers 99 --ctx-size 8192
   ```
3. ETL pipelines have been run: Como Voto, ICIJ, CNE, Boletín Oficial, (optionally IGJ)
4. Cross-enrichment script has been run: `scripts/run-cross-enrichment.ts`

## The Loop

Each cycle runs these phases. Use parallel agents wherever possible.

### Phase 1: Status Check

Query Neo4j for current graph state:
```cypher
// Node counts by label
MATCH (n) RETURN labels(n)[0] AS label, count(n) AS cnt ORDER BY cnt DESC

// Relationship counts
MATCH ()-[r]->() RETURN type(r) AS rel, count(r) AS cnt ORDER BY cnt DESC

// MAYBE_SAME_AS summary
MATCH (p:Politician)-[r:MAYBE_SAME_AS]->(t)
WITH p, collect(DISTINCT labels(t)[0]) AS datasets
RETURN p.name AS politician, datasets, size(datasets) AS datasetCount
ORDER BY datasetCount DESC LIMIT 20

// CROSS_REFERENCED summary
MATCH (a)-[r:CROSS_REFERENCED]->(b)
RETURN labels(a)[0] AS from_type, labels(b)[0] AS to_type, r.source AS source, count(r) AS cnt
```

Report: total nodes, edges, MAYBE_SAME_AS count, CROSS_REFERENCED count, multi-dataset politicians.

### Phase 2: Verify MAYBE_SAME_AS Matches (parallel agents)

Dispatch 3-4 agents in parallel:

**Agent A — Verify Politician↔Donor matches:**
- Query: all Politician-[:MAYBE_SAME_AS]->Donor relationships
- For each: check if politician name and donor name are truly the same person (not just a common name)
- WebSearch "[politician name] donación campaña Argentina" for confirmation
- Promote verified to confidence 1.0, mark false positives for removal
- High-value: politicians who donated to their OWN party vs OTHER parties

**Agent B — Verify Politician↔Offshore matches:**
- Query: all Politician-[:MAYBE_SAME_AS]->OffshoreOfficer relationships
- For each: WebSearch "[politician name] offshore Panama Papers Pandora Papers"
- These are the highest-impact matches — verify carefully
- Check if the offshore entity was created before/during/after their term in office
- Report: confirmed, unconfirmed, false positive

**Agent C — Verify Politician↔Appointment matches:**
- Query: all Politician-[:MAYBE_SAME_AS]->GovernmentAppointment relationships
- Cross-reference appointment dates with legislative terms
- Identify: politicians who held executive positions while serving in congress (dual roles)
- Report revolving door patterns

**Agent D — Verify CROSS_REFERENCED matches:**
- Query: all CROSS_REFERENCED relationships
- For each: verify the two entities are truly the same person/company
- High-priority: donors who are also offshore officers, contractors who also donated
- WebSearch for confirmation

### Phase 3: Conflict of Interest Detection (parallel agents)

Dispatch 2-3 agents to find conflicts of interest:

**Agent E — Voting vs Donations:**
```cypher
// Politicians who voted on legislation AND received donations from entities affected by that legislation
MATCH (p:Politician)-[:MAYBE_SAME_AS]->(d:Donor)-[:DONATED_TO]->(pf:PoliticalPartyFinance)
MATCH (p)-[:CAST_VOTE]->(v:LegislativeVote)-[:VOTE_ON]->(l:Legislation)
RETURN p.name, pf.party_name, l.name, v.date
ORDER BY p.name
```
Analyze: did donations correlate with favorable votes?

**Agent F — Contractors who donated:**
```cypher
// Companies that both received government contracts AND donated to campaigns
MATCH (c:Contractor)-[:CROSS_REFERENCED]->(d:Donor)
MATCH (c)<-[:AWARDED_TO]-(pc:PublicContract)
MATCH (d)-[:DONATED_TO]->(pf:PoliticalPartyFinance)
RETURN c.name, sum(pc.amount) AS contract_total, pf.party_name
```
Analyze: pay-to-play patterns

**Agent G — Offshore + Public office:**
```cypher
// Politicians with offshore entities who also held government appointments
MATCH (p:Politician)-[:MAYBE_SAME_AS]->(o:OffshoreOfficer)-[:OFFICER_OF]->(e:OffshoreEntity)
OPTIONAL MATCH (p)-[:MAYBE_SAME_AS]->(g:GovernmentAppointment)
RETURN p.name, e.name AS offshore_entity, e.jurisdiction_description, g.position
```
Analyze: undeclared offshore holdings while in public office

### Phase 4: Analyze with LLM (parallel agents)

Send findings to Qwen for deeper analysis:

**Agent H — Network analysis:**
- Extract the full subgraph of politicians with 2+ dataset appearances
- Include their party, province, voting patterns, donations, offshore links
- Send to Qwen at http://localhost:8080/v1/chat/completions
- Model: "Qwen3.5-9B-Q5_K_M.gguf", temperature 0.3, max_tokens 4096
- NOTE: Qwen 3.5 uses mandatory thinking mode. Analysis is in `reasoning_content` field, not `content`. Always parse both.
- Ask: "Analyze these Argentine politicians' connections across campaign finance, offshore entities, government appointments, and corporate directorships. Identify potential conflicts of interest, corruption patterns, and investigation priorities."

**Agent I — Financial flow analysis:**
- Extract donation amounts, contract values, offshore entity jurisdictions
- Ask Qwen to identify: unusual donation patterns, contract-donation correlations, offshore jurisdiction preferences by party/province

### Phase 5: Update Findings

Dispatch agent to compile findings:

**Agent J — Generate investigation summary:**
- Compile all verified matches, conflicts of interest, LLM findings
- Write to `docs/investigations/argentina-political-finance-findings.md`
- Structure: Executive Summary, Key Findings, High-Priority Targets, Evidence Table, Methodology

### Phase 6: Commit & Report

```bash
git add -A && git commit -m "chore: investigation loop cycle $(date +%Y-%m-%d-%H%M) — Argentine political finance

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

Print summary:
- Nodes/edges count
- Matches verified this cycle
- False positives removed
- Conflicts of interest detected
- Key findings from LLM analysis
- High-priority investigation targets

Then ask: "Run another cycle?"

## Agent Dispatch Pattern

All agents use this Neo4j connection pattern:
```bash
cd /home/vg/dev/office-of-accountability/.claude/worktrees/gentle-jingling-lampson/webapp && NEO4J_QUERY_TIMEOUT_MS=30000 npx tsx -e '
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

- Always verify MAYBE_SAME_AS before trusting — common Argentine names cause false positives
- Promote to confidence 1.0 only with web-verified evidence
- The CNE data covers recent elections only; historical finance data is limited
- Boletín Oficial appointments are a Dec 2019 snapshot; not all current
- IGJ corporate data may still be loading — check CompanyOfficer count before relying on it
- CROSS_REFERENCED relationships are the highest-value investigation targets
- normalizeName sorts name parts alphabetically — "JUAN CARLOS" and "CARLOS JUAN" match. Be aware of false positives from common name combinations.
