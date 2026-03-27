# Investigation Methodology & Verification Standards

*How the Office of Accountability knowledge graph is built, verified, and quality-controlled.*

## Purpose

This document explains our methodology for building knowledge graphs from public records so that external reviewers can assess the reliability of our data and conclusions. These standards apply to every investigation on the platform.

## Data Sources

Each investigation ingests data from multiple independent sources. Source types include:

| Category | Examples | Typical Reliability |
|----------|----------|-------------------|
| **Manual curation** (seed data) | Court documents, sworn testimony, official reports | HIGH -- each entry manually verified against primary sources |
| **Government open data** | Comprar, ContratAR, Mapa de Inversiones, Boletin Oficial, AFIP, CNE | HIGH -- official datasets from government agencies |
| **International registries** | World Bank debarment lists, IDB sanctions, ICIJ offshore leaks | HIGH -- curated by international organizations |
| **Third-party aggregations** | OpenCorporates, news archives, legislative records | MEDIUM -- cross-checked against primary sources |
| **Declassified documents** | FOIA releases, DOJ files, declassified intelligence | HIGH -- official document releases |
| **Transcribed records** | Handwritten logs, OCR'd documents, transcripts | VARIABLE -- depends on legibility and verification |

The specific sources used for each investigation are documented in its `investigation-data.ts` module and on its summary page.

## Confidence Tier System

Every node in the graph carries a confidence tier:

### Gold
- **Standard:** Manually curated from primary sources (court filings, official reports, government records)
- **Verification:** Each entry cross-referenced against at least 2 independent sources
- **Promotion:** Manual review only -- no automated promotion to gold

### Silver
- **Standard:** Verified via web research or cross-reference against credible sources
- **Sources accepted:** Court documents, major news outlets, official government records, investigative journalism with citations, Wikipedia with citations
- **Sources NOT accepted:** Unverified social media posts, anonymous blogs without citations, conspiracy theory websites
- **Promotion:** Verification cycle (`/investigate-loop`) or manual review

### Bronze
- **Standard:** Ingested from external data sources but NOT independently verified
- **Purpose:** Unverified data may contain real leads. Removing it loses information. Bronze nodes render with reduced opacity in the UI.
- **Promotion:** Future verification cycles or community contributions

## Verification Measures

### Entity Verification
For each entity promoted from bronze to silver:
1. **Source search** -- query across multiple credible sources
2. **Source check** -- at least one credible source confirming the entity and its role
3. **Role identification** -- documented role or relationship
4. **Cross-reference** -- checked against other datasets in the graph where possible

### Document Verification
- **Government documents** -- verified against official release catalogs and registries
- **Court filings** -- sourced from official court systems or document repositories
- **Other documents** -- individually verified via original publisher or web search

### Deduplication
- **Exact match:** Names normalized (lowercase, accent-stripped, whitespace-collapsed) then compared
- **CUIT/DNI match:** Argentine tax and national IDs used for high-confidence entity resolution (confidence 0.9-1.0)
- **Fuzzy match:** Levenshtein distance <= 2 flagged for review. True duplicates merged, false positives dismissed.
- **Cross-wave:** Entities from different data sources compared to prevent duplication
- **Manual review:** All fuzzy matches logged to conflict files for human review

### Relationship Verification
Each relationship type has a defined evidence standard:
- **Contractual** (AWARDED_TO, CONTRACTED_FOR): Based on procurement records, government datasets
- **Financial** (DONATED_TO, FINANCED): Based on campaign finance records, financial disclosures, court filings
- **Corporate** (OFFICER_OF, BOARD_MEMBER_OF): Based on corporate registry records (IGJ, OpenCorporates)
- **Political** (CAST_VOTE, SERVED_TERM): Based on legislative records
- **Associative** (ASSOCIATED_WITH, AFFILIATED_WITH): Web-verified connections with cited evidence
- **Inferred** relationships are tagged with `source: "inferred"` or `source: "graph_analysis"`

### LLM Analysis Verification
- Local LLM (Qwen via llama.cpp) used for pattern detection and lead generation
- **Every LLM finding is cross-checked** against raw data in the graph
- **LLM outputs are used as leads, never as authoritative sources**
- Known LLM limitations are documented and corrections applied

### Graph Audit
Each investigation undergoes a comprehensive audit covering:
- Duplicate detection
- Orphan node detection
- Missing properties
- Relationship coverage
- Data quality flags

## What We Do NOT Do

- **We do not access non-public data.** All sources are publicly available records, open data, FOIA releases, and news reporting.
- **We do not make legal conclusions.** The graph maps documented connections -- it does not determine guilt or innocence.
- **We do not auto-promote to gold.** Only manually curated, multiply-sourced entries receive gold status.
- **We do not accept single-source claims at face value.** Factcheck items with weak sourcing are marked `under_investigation` rather than `confirmed`.
- **We do not include unverified conspiracy theories.** Claims are included ONLY when backed by documented evidence.
- **We hedge all allegations.** Language uses "according to [source]" or "alleged" for unproven claims. Presumption of innocence is maintained for persons facing legal proceedings.

## Reproducibility

Every investigation pipeline is reproducible:

```bash
# 1. Start Neo4j
docker compose up -d

# 2. Initialize schema
pnpm run db:init-schema

# 3. Seed investigation data
npx tsx scripts/seed-caso-<slug>.ts

# 4. Run ETL pipelines
pnpm run etl:<source>

# 5. Run cross-reference
pnpm run cross-ref

# 6. Review results
pnpm run ingest:review -- --wave <N>
```

## Known Limitations

1. **Data availability:** Government open data portals vary in completeness, format, and update frequency.
2. **Fuzzy matching:** Name-based entity resolution produces false positives. All fuzzy matches require human review.
3. **Temporal coverage:** Data availability varies by time period. Some sources only cover recent years.
4. **Language:** Source documents are primarily in Spanish. English translations are manually verified but may lose nuance.
5. **Relationship inference:** Some edges are inferred from co-appearance in documents or datasets, not from direct evidence. These are tagged as inferred.
6. **Scale constraints:** Fuzzy name matching is capped at 10K targets per run. Cross-reference engine uses in-memory joins for performance.

## Contact

This investigation is part of the Office of Accountability civic knowledge platform. The graph database, ingestion pipeline, and analysis tools are open source.

For questions about methodology or to report errors: **officeofaccountability@proton.me**
