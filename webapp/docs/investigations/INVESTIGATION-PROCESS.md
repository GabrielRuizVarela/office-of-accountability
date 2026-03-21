# Investigation Process Documentation
## Finanzas Politicas — Argentine Political Finance Investigation

This document consolidates the architecture, methodology, findings, and technical lessons from the Argentine political finance investigation. Use it as a reference to continue or replicate the investigation workflow in future sessions.

---

### 1. Architecture Overview

#### Data Sources (9 total)

| Source | Description | Scale |
|--------|-------------|-------|
| Como Voto | Legislators, votes, parties | Legislative corpus |
| ICIJ Offshore Leaks | Panama Papers, Pandora Papers | Offshore entities |
| CNE | Campaign finance donations | Donor-party links |
| Boletin Oficial | Government appointments + procurement awards | Federal gazette |
| IGJ | Corporate registry | 398K companies, 951K officers |
| CNV | Securities market filings | Public offerings, boards |
| DDJJ | Sworn asset declarations | 27,720 entries |
| Compr.ar | Procurement orders | Federal contracts |
| Judiciary ETL | Court system structure | 2,674 judges, 1,165 courts |

#### Cross-Referencing Engine

The cross-reference engine links entities across all data sources using three matching strategies:

- **CUIT matching** (confidence 1.0): Exact tax ID match. Produced 1,110 matches.
- **DNI/CUIL matching** (confidence 0.9-0.95): National identity number match. Produced 715 matches.
- **Name matching** (confidence 0.6-0.8): Skipped in practice due to performance. With 2.3M entities the comparison is O(n*m) and needs a fulltext search approach to be viable.

Results: 1,840 `SAME_ENTITY` relationships | 10,393 `MAYBE_SAME_AS` relationships.

#### MiroFish / Qwen 3.5 Analysis

- **Model**: Qwen3.5-9B-Q5_K_M.gguf running on RTX 4060 Ti via llama.cpp
- **enable_thinking**: `false` (when set to `true`, Qwen spends all available tokens on internal reasoning and returns no usable output)
- **Temperature**: 0.3 for analytical tasks
- **max_tokens**: 4096
- **Timeout**: 10 minutes per analysis call
- **Analysis passes this session**: 6 total — procurement anomalies, ownership chains, political connections (x2), family networks, judicial nexus

Always parse both `reasoning_content` and `content` fields from the response. Structured JSON prompts produce the best results.

---

### 2. Investigation Methodology

#### Wave-Based Investigation Loop

Each investigation runs in 4 sequential waves:

1. **Research** — WebSearch + Neo4j queries to discover entities and establish context.
2. **Deep queries** — Targeted Neo4j queries on discovered entities; follow leads from wave 1.
3. **Cross-reference** — Link new findings to existing graph via CUIT/DNI/name matching.
4. **Consolidation** — Ingest findings into Neo4j, verify sources, update frontend data.

#### Agent Dispatch Pattern

- 3-4 parallel agents per wave, each with a distinct concern (research, graph queries, MiroFish analysis, ingestion).
- Background execution with progress monitoring.
- The consolidation agent waits for research output files before starting ingestion.
- Separation of concerns prevents agents from stepping on each other's graph writes.

#### Source Verification Protocol

Every claim in the investigation goes through verification:

1. Every source URL is WebFetched to confirm HTTP 200.
2. Key claims are WebSearched for independent confirmation from a second source.
3. Corrections are applied immediately when URLs are broken or figures are inexact.
4. A verification report is committed at `docs/investigations/source-verification-report.md`.

Do not skip verification. Fabricated or dead URLs undermine the entire investigation's credibility.

---

### 3. Key Findings Summary

#### Financial Arms

- 12 oligarchic families controlling 500+ companies.
- 72 revolving door cases (financial sector to government and back).
- $28.5B Nacion Seguros monopoly scandal.
- 3 confirmed self-dealing cases where officials awarded contracts to their own companies.
- Cross-family nexus boards identified (shared directorships linking otherwise separate groups).

#### Judicial Auxiliary

- **Comodoro Py**: 12 courts where the same judges handle ALL major political cases.
- Ercolini-Clarin Lago Escondido flight documented (judge traveled with media group executives).
- Lijo Supreme Court nomination via decree, bypassing Senate confirmation.
- 2% corruption conviction rate nationally.
- Judicial wealth anomalies: Seijas ARS 1.75B declared assets, Pistone 457,000% asset growth.

#### The Systemic Cycle

This is the core finding — a repeating pattern across multiple administrations:

1. Judge accumulates unexplained wealth.
2. A colleague quietly closes the enrichment investigation.
3. The defense lawyer in related cases becomes Justice Minister.
4. The government nominates a friendly judge to the Supreme Court.
5. That judge handles cases involving the nominating president's family companies.

---

### 4. Technical Lessons Learned

#### Performance

- **Always use labels in queries.** `MATCH (n {name: $name})` without a label scans all 951K nodes. Use `MATCH (n:Person {name: $name})` instead.
- **Name matching at scale is prohibitive.** 2.3M entities makes naive comparison O(n*m). Cap at 50K per entity type, or implement Neo4j fulltext indexes.
- **Neo4j Community lacks APOC.** All queries must use native Cypher. No `apoc.text.levenshteinSimilarity`, no `apoc.periodic.iterate`.
- **Phase timeouts prevent infinite hangs.** Default is 5 minutes per phase. Set via the orchestrator config.
- **Use `--skip-name-matching` for fast iteration cycles** when you only need CUIT/DNI matching.

#### Neo4j Patterns

- **MERGE for idempotency.** Every ingest script uses MERGE so it is safe to re-run without creating duplicates.
- **`neo4j.int()` for LIMIT clauses.** JavaScript numbers are IEEE 754 floats; Neo4j expects integer types for LIMIT and SKIP.
- **Parameterized Cypher only.** Zero string interpolation of user input into queries. Always use `$paramName` syntax.
- **`caso_slug` for namespace isolation.** Each investigation (e.g., `finanzas-politicas`, `epstein`) tags its entities with a `caso_slug` property so investigations do not collide.
- **`RELATED_TO` with `relationship_type` property.** When the exact relationship type is uncertain, use a generic `RELATED_TO` edge with a `relationship_type` string property for flexible typing.

#### MiroFish / Qwen

- **`enable_thinking: false` is required.** With thinking enabled, Qwen 3.5 exhausts all tokens on internal reasoning and returns empty or truncated output.
- **Parse both response fields.** Check `reasoning_content` AND `content` — the model sometimes splits output across both.
- **Structured JSON prompts work best.** Provide input data as JSON objects and request JSON output with a defined schema.
- **Temperature 0.3** for analytical and factual tasks. Higher temperatures introduce hallucination risk.
- **10-minute timeout** for complex analysis calls (ownership chain tracing, multi-entity correlation).

---

### 5. Data Gaps & Future Work

#### Unresolved Entity Resolution

- Offshore (ICIJ) to Judge matching has not been attempted.
- Donor to Judge matching has not been attempted.
- Full name matching across 2.3M entities requires a fulltext search index approach.
- Provincial-level data has not been ingested.

#### Missing Data Sources

| Source | Description | Why It Matters |
|--------|-------------|----------------|
| Provincial procurement | Each province has its own system | Captures subnational corruption |
| BCRA (Central Bank) | Banking regulation data | Financial sector oversight |
| UIF (Financial Intelligence Unit) | Suspicious transaction reports | Money laundering detection |
| Registro de la Propiedad | Real estate ownership | Asset hiding via property |
| AFIP public CUIT lookup | Business registry enrichment | Fill gaps in corporate ownership |

#### Frontend Enhancements Needed

- Graph preset for "Judicial Branch" view (filter graph to judiciary subgraph).
- Timeline filtering by investigation chapter.
- Actor profile pages with embedded graph subview.
- Money flow visualization (Sankey diagram for procurement/donation flows).
- Export investigation as PDF report.

---

### 6. Commands Reference

```bash
# ETL pipelines
pnpm run etl:como-voto           # Legislative voting data
pnpm run etl:comprar              # Procurement orders
pnpm run etl:boletin              # Appointments + awards
pnpm run etl:igj                  # Corporate registry

# Cross-referencing
pnpm run cross-ref                # Full CUIT/DNI/name matching
pnpm run cross-ref -- --skip-name-matching   # Fast mode (CUIT/DNI only)

# Seeding
pnpm run seed:clarin              # Grupo Clarin entities
pnpm run seed:top-contractors     # Top 50 contractors by contract value

# Investigation loop
pnpm run investigation:loop       # Full 4-phase cycle
pnpm run investigation:loop -- --skip-name-matching --skip-analysis

# Ingestion scripts (run directly)
npx tsx scripts/ingest-financial-findings.ts
npx tsx scripts/ingest-judicial-findings.ts
npx tsx scripts/ingest-family-networks.ts
npx tsx scripts/seed-clarin-group.ts

# Schema initialization
pnpm run db:init-schema           # Create constraints + indexes
```

---

### 7. File Map

```
src/etl/
  comprar/                         # Compr.ar procurement ETL
  cross-reference/                 # CUIT/DNI/name matching engine
  boletin-oficial/                 # Appointments + awards parser
  opencorporates/                  # IGJ corporate registry ETL
  judiciary/research/              # Judicial investigation findings
    judicial-power-findings.json
    comodoro-py-findings.json
    judicial-cases-findings.json

src/lib/
  mirofish/analysis.ts             # Qwen 3.5 analysis functions
  mirofish/prompts.ts              # System prompts (ES/EN bilingual)
  caso-finanzas-politicas/
    investigation-data.ts           # Static investigation data
                                    # (factchecks, timeline, actors, money flows)

docs/investigations/
  narrative-financial-arms.md       # Bilingual financial arms narrative
  narrative-finanzas-politicas.md   # Main investigation narrative
  source-verification-report.md    # URL and claim verification log
  argentina-political-finance-findings.md
  argentina-political-finance-summary.md
  INVESTIGATION-PROCESS.md         # This file

scripts/
  run-investigation-loop.ts        # 4-phase orchestrator
  run-cross-reference.ts           # Cross-reference engine runner
  run-etl-comprar.ts               # Compr.ar ETL runner
  seed-clarin-group.ts             # Clarin Group entity seeder
  seed-top-contractors.ts          # Top contractor seeder
  ingest-financial-findings.ts     # Financial findings ingestion
  ingest-judicial-findings.ts      # Judicial findings ingestion
  ingest-family-networks.ts        # Family network ingestion
```

---

### 8. Session Checklist

Use this checklist when starting a new investigation session:

- [ ] Neo4j is running (`docker ps` or `docker compose up -d neo4j`)
- [ ] llama.cpp server is running with Qwen 3.5 model loaded
- [ ] Run `pnpm run db:init-schema` if schema has changed
- [ ] Review `docs/investigations/source-verification-report.md` for any open issues
- [ ] Check Data Gaps section above for next priorities
- [ ] After new ingestion, run `pnpm run cross-ref -- --skip-name-matching` to link entities
- [ ] Verify all new source URLs before committing
