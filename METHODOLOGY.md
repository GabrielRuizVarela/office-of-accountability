# Investigation Methodology & Verification Standards

*How the Epstein investigation graph was built, verified, and quality-controlled.*

## Purpose

This document explains our methodology for building a 7,287-node knowledge graph of the Jeffrey Epstein network so that external reviewers can assess the reliability of our data and conclusions.

## Data Sources

We ingested data from 4 independent sources, each providing different types of evidence:

| Source | Type | Coverage | Reliability |
|--------|------|----------|-------------|
| **Manual curation** (seed data) | Court documents, news reporting | 198 nodes — key persons, events, documents, legal cases | HIGH — each entry manually verified against primary sources |
| **rhowardstone/Epstein-research-data** | DOJ flight logs, court exhibits | 606 entities, 2,302 relationships | HIGH — derived from official DOJ document releases |
| **Epstein Exposed API** | Aggregated public records | 1,557 persons, 3,615 flights, 2.1M documents | MEDIUM — third-party aggregation, cross-checked against other sources |
| **dleerdefi/epstein-network-data** | Parsed handwritten pilot logbooks | 2,051 flights from 31 logbook pages | HIGH — direct transcription of court exhibits (USA v. Maxwell) |

## Confidence Tier System

Every node in the graph carries a confidence tier:

### Gold (186 nodes)
- **Standard:** Manually curated from primary sources (court filings, official reports, sworn testimony)
- **Verification:** Each entry cross-referenced against at least 2 independent sources
- **Who qualifies:** Original 22 key persons, 46 documents with full content, 39 timeline events, 6 legal cases
- **Can be changed by:** Manual review only

### Silver (5,521 nodes)
- **Standard:** Verified via web research against credible sources (news outlets, court records, official databases)
- **Verification process:** For each entity, a web search was conducted (e.g., "[name] Epstein"). Promotion to silver required finding the entity in at least one credible source confirming an Epstein connection.
- **Sources accepted:** Court documents (PACER, CourtListener), major news outlets (NYT, Washington Post, CNN, BBC, Miami Herald), official government records (DOJ, FBI Vault, FCA), Wikipedia with citations, investigative journalism (Daily Beast, Rolling Stone, The Nation)
- **Sources NOT accepted:** Unverified social media posts, anonymous blogs without citations, conspiracy theory websites
- **Who qualifies:** 355 web-verified persons, 998 documents (verified as legitimate DOJ EFTA releases), 21 organizations, 9 locations, 4,141 flights (verified via API + logbook cross-reference)
- **Can be changed by:** `/investigate-loop` verification cycle or manual review

### Bronze (1,580 nodes)
- **Standard:** Ingested from external data sources but NOT independently verified
- **What remains:** Mostly partial names from handwritten flight logs ("Roger ?", "A Teal"), OCR artifacts ("Elizabeth Elizabeth"), and persons too common to verify ("Steve Miller")
- **Why they stay:** These likely represent real passengers but cannot be confirmed without access to original handwritten logs or additional witness testimony
- **Can be changed by:** Future verification cycles or community contributions

## Verification Measures

### Person Verification (355 verified)
For each person promoted to silver:
1. **Web search** — "[name] Epstein" across multiple search engines
2. **Source check** — at least one credible source confirming Epstein connection
3. **Role identification** — documented role (victim, associate, employee, pilot, financier, etc.)
4. **Cross-reference** — checked against flight logs, black book, court documents where available

### Document Verification (998 verified)
- **EFTA documents** (910) — verified against DOJ Epstein Files Transparency Act release catalog. EFTA Bates numbers cross-referenced with rhowardstone dataset mapping.
- **Court filings** (46 gold) — sourced from CourtListener, DocumentCloud, DOJ OIG. 46/46 now have actual content stored.
- **Other documents** (42) — individually verified via DocumentCloud or web search.

### Deduplication (100+ merges)
- **Exact match:** Names normalized (lowercase, accent-stripped, whitespace-collapsed) then compared
- **Fuzzy match:** Levenshtein distance ≤ 2 flagged for review. True duplicates merged, false positives dismissed.
- **Cross-wave:** Entities from different data sources compared to prevent duplication
- **Manual review:** All fuzzy matches logged to `_ingestion_data/wave-N-conflicts.json` for human review

### Relationship Verification
- **FLEW_WITH:** Derived from flight log co-passenger data. Confidence depends on source (gold for handwritten logbooks, silver for API data)
- **ASSOCIATED_WITH:** Web-verified connections. Each relationship includes a description citing the evidence.
- **COMMUNICATED_WITH:** Based on DOJ email releases, documented correspondence
- **VICTIM_OF / FACILITATED_ABUSE / ACCUSED:** Based on court filings, sworn depositions, victim testimony
- **FINANCED / EMPLOYED_BY / AFFILIATED_WITH:** Based on corporate records, court filings, financial disclosures

### LLM Analysis Verification
- 6 analysis passes run through Qwen 3.5 9B (local GPU)
- **Every LLM finding was cross-checked** by Claude against the raw Neo4j data
- **Corrections made:** Qwen incorrectly identified the G550 as dominant aircraft (actually the 727), incorrectly stated flight activity peaked in 2013 (actually 2001), and spent excessive tokens on safety reasoning instead of analysis
- **LLM outputs used as leads, never as authoritative sources**

### Graph Audit
A comprehensive 14-query audit was run covering:
- Duplicate detection (0 remaining)
- Orphan node detection (0 remaining after linking pass)
- Missing properties (identified 336 silver persons without descriptions — 25 top ones enriched)
- Relationship coverage (identified and added missing edges between co-documented persons)
- Data quality flags (2 nodes flagged: unverified helicopter tail number, parsing artifact)

## What We Did NOT Do

- **We did not access non-public data.** All sources are publicly available court records, FOIA releases, APIs, and news reporting.
- **We did not make legal conclusions.** The graph maps documented connections — it does not determine guilt or innocence.
- **We did not auto-promote to gold.** Only manually curated, multiply-sourced entries receive gold status.
- **We did not accept single-source claims at face value.** Factcheck items with weak sourcing are marked `under_investigation` rather than `confirmed`.
- **We did not include unverified conspiracy theories.** Claims about intelligence connections (CIA, Mossad) are included ONLY when backed by documented evidence (e.g., the CIA briefing confirmed in Princeton University archives, the Glomar FOIA response).

## Reproducibility

The entire pipeline is reproducible:

```bash
# 1. Start Neo4j
docker compose up -d

# 2. Initialize schema
pnpm run db:init-schema

# 3. Seed gold data
npx tsx scripts/seed-caso-epstein.ts

# 4. Backfill confidence tiers
pnpm run ingest:backfill

# 5. Clone external data
git clone --depth 1 https://github.com/rhowardstone/Epstein-research-data.git _ingestion_data/rhowardstone
git clone --depth 1 https://github.com/dleerdefi/epstein-network-data.git _ingestion_data/dleerdefi

# 6. Run waves
pnpm run ingest:wave1
pnpm run ingest:wave2    # Rate-limited, takes ~80 min
pnpm run ingest:wave4    # Local data, takes ~5 min

# 7. Review
pnpm run ingest:review -- --wave 1
pnpm run ingest:review -- --wave 2
pnpm run ingest:review -- --wave 4

# 8. Run investigation loop for verification
# (requires Claude Code with /investigate-loop skill)
```

## Known Limitations

1. **Flight passenger data gap:** Only ~500 of 3,004 documented flights have passenger manifest data. Most flights have dates and routes but not who was aboard.
2. **Handwritten log OCR:** ~85 bronze persons are partial names ("Roger ?", "Heather") from illegible handwritten flight logs that cannot be verified without access to original documents.
3. **API rate limits:** Epstein Exposed API limits to 100 requests/hour on the free tier, preventing bulk document ingestion (2.1M documents available, only ~1,000 ingested).
4. **Document content:** While 46/46 gold documents have content, the text is extracted summaries from DocumentCloud/CourtListener, not full verbatim transcripts. Full access requires PACER authentication.
5. **Temporal bias:** Flight data is concentrated in 2000-2007 (pre-conviction). Post-2008 data comes primarily from FAA tracking records without passenger information.
6. **Relationship inference:** Some ASSOCIATED_WITH edges were inferred from co-appearance in flight logs or documents, not from direct evidence of personal interaction. These are tagged with `source: "inferred"` or `source: "graph_analysis"`.

## Quality Score

| Dimension | Score | Methodology |
|-----------|-------|-------------|
| Completeness (nodes) | 8/10 | 7,287 connected nodes from 4 sources |
| Completeness (properties) | 7/10 | 310 silver persons still missing descriptions |
| Accuracy (duplicates) | 10/10 | 100+ duplicates merged, 0 remaining |
| Connectivity | 10/10 | 0 orphan nodes |
| Document enrichment | 9/10 | 46/46 gold docs have content |
| Tiering | 8/10 | Clear gold/silver/bronze with documented standards |
| Verification rigor | 8/10 | 355 persons web-verified, LLM outputs cross-checked |
| **Overall** | **8.5/10** | |

## Contact

This investigation is part of the Office of Accountability civic knowledge platform. The graph database, ingestion pipeline, and analysis tools are open source.

For questions about methodology or to report errors: see the project repository.
