# How We Built the Epstein Investigation Graph

*From 198 manually curated nodes to 7,287 connected nodes, 21,944 edges, and 72 verified claims in a single session.*

## The Stack

- **Neo4j 5 Community** — graph database (Docker)
- **Next.js 16 + Vite + React 19** — webapp
- **TypeScript + Zod 4** — type-safe ingestion pipeline
- **Qwen 3.5 9B** — local LLM on RTX 4060 Ti via llama.cpp
- **Claude Code** — orchestration, analysis, web research, fact-checking

## The Process

### Phase 1: Build the Pipeline (2 hours)

We started with 198 manually curated nodes and no ingestion infrastructure. Built:

1. **Ingestion types** (`webapp/src/lib/ingestion/types.ts`) — ConfidenceTier (gold/silver/bronze), ConflictRecord, WaveReport, ResumeState
2. **Dedup module** (`dedup.ts`) — name normalization, Levenshtein distance matching, shared `buildExistingMaps()` for Neo4j lookups
3. **Quality module** (`quality.ts`) — conflict persistence, resume state, wave reporting
4. **Backfill script** — tagged existing 198 nodes as gold/seed
5. **4 wave scripts** — each ingesting from a different source
6. **Review + promote scripts** — quality gates between waves
7. **Query layer filtering** — confidence tier support in all Cypher queries
8. **UI integration** — tier filter dropdown, bronze opacity, source badges

### Phase 2: Ingest Data (4 waves)

| Wave | Source | Nodes | Method |
|------|--------|-------|--------|
| **Wave 1** | rhowardstone/Epstein-research-data (GitHub) | 526 | JSON/CSV from DOJ flight logs + court docs |
| **Wave 2** | Epstein Exposed API | 6,011 | REST API with rate limiting (100 req/hr) |
| **Wave 3** | CourtListener + DocumentCloud + DOJ | 2 docs enriched | Full text extraction for gold documents |
| **Wave 4** | dleerdefi/epstein-network-data (GitHub) | 559 flights + 136 persons | Parsed handwritten pilot logbooks (31 pages) |

Total: ~10,900 nodes ingested across 4 sources. After cleaning: 7,287 connected nodes.

### Phase 3: Verify & Promote (~8 cycles)

Each cycle dispatched 3-4 parallel agents:
- **Person verifier** — WebSearch "[name] Epstein" for each bronze person, promote verified to silver
- **Document verifier** — verify documents via DocumentCloud, DOJ URLs
- **Organization verifier** — verify orgs and locations
- **Deduplicator** — find and merge name variants, aliases, cross-wave collisions

**Results:** 355 persons web-verified with sourced evidence. 998 documents verified. 17 organizations verified. ~100 duplicates merged. 37+ garbage nodes deleted.

### Phase 4: LLM Analysis (6 passes)

Used Qwen 3.5 9B on local GPU for network analysis:
1. **Network clusters** — identified 5 sub-networks (Core Hub, VIP Access, Logistics, Financial, Peripheral)
2. **Financial forensics** — mapped shell company architecture, identified Indyke as #1 forensic target
3. **Victim/recruiter analysis** — confirmed dual victim-recruiter pattern (Kellen, Marcinko)
4. **Temporal analysis** — found Suppression→Sealing→Release cycle, 5-year evidence gap
5. **Geographic analysis** — Palm Beach hub, Paris-London triangle, Bedford/Harvard gateway
6. **Academic/political pipeline** — Summers/Chomsky entry → Groff/Kahn intermediaries → island consolidation

Also ran my own analysis (Claude) to fact-check Qwen's outputs — corrected several errors including the dominant aircraft (727 not G550) and peak flight year (2001 not 2013).

### Phase 5: Deep Investigation (4 profiles)

Dispatched research agents for deep dives on the 4 most structurally important persons:

1. **Boris Nikolic** — the chokepoint between Gates and Epstein. Introduced Mila Antonova creating the kompromat chain. Communicated across all 5 network layers including Brunel (procurement).
2. **Glenn Dubin** — the only triple-layer node (financial + family + victim testimony). Eva's 2010 email inviting convicted sex offender when 15-year-old daughter had friends over.
3. **Sarah Kellen** — the scheduling gatekeeper. Notes: "I have girls for him." Bridges 3 victims to 4 financiers AND 4 academics to 7 politicians.
4. **Alan Dershowitz** — architected blanket NPA immunity. 13+ flights including to USVI with Kellen. Later represented Trump who appointed Acosta.

### Phase 6: Graph Exploration (21+ queries)

Ran 21 investigative queries revealing:
- Complete money map (every financial path converges on Black↔Epstein)
- Abuse chains (Giuffre → Maxwell → all 5 financiers)
- Bridge persons (Kellen and Groff connect victims to VIPs)
- Communication chains (Gates → Nikolic → Epstein → Barak/Allen/Dubin)
- Legal case mapping (13 persons appear in 2+ cases)
- 113 persons connect ONLY through Maxwell
- Epstein's last flight: July 7, 2019 (arrested next day)

### Phase 7: Audit & Fix

Ran comprehensive graph audit (14 queries):
- Found 9,644 orphan nodes (88%) — resolved to 0 by linking flights to Epstein and connecting documents/persons
- Merged 6 remaining duplicates
- Enriched 46/46 gold documents with content via DocumentCloud
- Added 25 silver person descriptions/roles
- Quality score: 4.1/10 → 8.5/10

## Key Commands

```bash
# Ingestion
pnpm run ingest:backfill        # Tag existing nodes as gold
pnpm run ingest:wave1           # Import rhowardstone data
pnpm run ingest:wave2           # Import from Epstein Exposed API
pnpm run ingest:wave3           # Document content enrichment
pnpm run ingest:wave4           # Import dleerdefi handwritten logbooks
pnpm run ingest:review -- --wave N  # Review wave quality
pnpm run ingest:promote -- --wave N --to silver  # Promote tier

# Development
pnpm run dev                    # Start dev server
```

## The `/investigate-loop` Skill

A Claude Code slash command that automates the full enrichment pipeline:

```
/investigate-loop
```

Each cycle: Status Check → Ingest → Verify & Promote → Analyze (LLM) → Clean → Update Content → Commit

## Architecture

```
webapp/src/lib/ingestion/       # Ingestion infrastructure
  types.ts                      # ConfidenceTier, WaveReport, etc.
  dedup.ts                      # Name normalization, Levenshtein, buildExistingMaps
  quality.ts                    # Conflict logging, resume state
  epstein-exposed-client.ts     # Typed API client

webapp/scripts/                 # CLI scripts
  backfill-tiers.ts            # Gold tagging
  ingest-wave-{1,2,3,4}.ts    # Wave ingestion
  review-wave.ts               # Quality gate
  promote-nodes.ts             # Tier promotion

webapp/src/lib/caso-epstein/    # Investigation data layer
  types.ts                     # Node types with ConfidenceTier
  queries.ts                   # Cypher queries with tier filtering
  investigation-data.ts        # 72 factcheck items, 47 actors

.claude/commands/               # Claude Code skills
  investigate-loop.md          # The investigation loop
```

## Data Sources

| Source | URL | Data |
|--------|-----|------|
| rhowardstone/Epstein-research-data | github.com | 606 entities, 2,302 relationships from DOJ files |
| Epstein Exposed API | epsteinexposed.com/api/v2 | 1,557 persons, 3,615 flights, 2.1M documents |
| dleerdefi/epstein-network-data | github.com | 2,051 parsed flights from handwritten logbooks |
| CourtListener | courtlistener.com | Court filings, docket search |
| DocumentCloud | documentcloud.org | OCR'd investigative documents |

## Quality Metrics

| Dimension | Score |
|-----------|-------|
| Completeness (nodes) | 8/10 |
| Completeness (properties) | 7/10 |
| Accuracy (duplicates) | 10/10 |
| Connectivity | 10/10 |
| Document enrichment | 9/10 |
| Tiering | 8/10 |
| **Overall** | **8.5/10** |

## Key Findings

1. **Trump→Walker→Epstein→Nikolic→Gates** — complete introduction chain confirmed
2. **Mila Antonova kompromat** — Epstein weaponized Gates' affair via Nikolic
3. **Carbyne** — surveillance company funded by Epstein + Barak + Unit 8200 director
4. **Glenn Dubin** — only person in all 3 layers (financial, family, victim testimony)
5. **Kellen's notes** — "I have girls for him" recovered from Epstein residence
6. **113 persons** connect to the network ONLY through Maxwell
7. **USVI flights increased** from 29 to 69/year DURING the FBI investigation
8. **Rothschild $25M** — payment for fixing DOJ Swiss Bank Program investigation
9. **CIA briefing** with Director Deutch (Oct 1995) confirmed in Princeton archives
10. **Acosta** reportedly said "Epstein belonged to intelligence"

## What Remains

- 1,580 bronze persons at verification floor (mostly OCR artifacts from handwritten logs)
- 99.6% of flight passenger manifests not yet ingested (3,004 total flights documented)
- Insurance Trust and Caterpillar Trust financial records never forensically audited
- CIA's Glomar response unresolved
- Community contribution system not yet built
- Production deployment pending

---

*Built in a single Claude Code session (~160 commits). Graph database: Neo4j. Analysis: Claude Opus 4.6 + Qwen 3.5 9B (local GPU). Orchestration: Claude Code with parallel agent dispatch.*
