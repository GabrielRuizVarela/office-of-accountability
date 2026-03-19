# Wave-Based Ingestion Pipeline Design

**Date:** 2026-03-19
**Status:** Approved

## Problem

The Epstein investigation graph has 198 nodes and 431 edges, all manually seeded. Public structured datasets contain 10x–60x more entities. We need to ingest this data in controlled waves with quality gates, preserving our curated data as the gold standard, and evolving toward community-driven contributions.

## Data Model Changes

Three properties added to every node and relationship:

```
ingestion_wave: number              — which wave created this (0 = original seed)
confidence_tier: 'gold' | 'silver' | 'bronze' — data quality level
source: string                      — origin ('seed', 'rhowardstone', 'epstein-exposed', 'community')
```

Existing 198 nodes backfilled with `ingestion_wave: 0, confidence_tier: 'gold', source: 'seed'`. New data enters as `bronze`. Review promotes `bronze` → `silver` → `gold`.

## Wave 1: GitHub Structured Data (rhowardstone/Epstein-research-data)

**Source:** Static JSON/CSV files from GitHub repo.

**Scope:**
- 606 entities → Neo4j nodes (persons, organizations, locations)
- 2,302 relationships → Neo4j edges
- 1,614 person registry entries
- 116 organizations

**Script:** `webapp/scripts/ingest-wave-1.ts`

**Process:**
1. Download repo data files to temp directory
2. Parse and map to existing Zod schemas
3. Deduplicate against existing 198 nodes:
   - **Exact match** → skip (gold data wins)
   - **Fuzzy match** → log conflict for manual review, don't overwrite
   - **No match** → create bronze node
4. Write nodes with `ingestion_wave: 1, confidence_tier: 'bronze', source: 'rhowardstone', caso_slug: 'caso-epstein'`
5. Write relationships with same metadata
6. Output report: new nodes, new edges, conflicts

**Quality gate:** Review script dumps conflicts + 20-node sample for manual review before Wave 2.

## Wave 2: Epstein Exposed API

**Source:** Epstein Exposed API (free tier, 100 req/hr).

**Scope:**
- ~1,463 persons
- ~1,700 flights with passenger manifests
- ~12,300 document metadata (title, date, type, source URL — not full text)
- Network relationships

**Script:** `webapp/scripts/ingest-wave-2.ts`

**Process:**
1. Paginate through API endpoints: `/persons`, `/flights`, `/documents`, `/organizations`
2. Deduplicate against graph (now ~800+ nodes post-Wave 1)
3. Rate limit handling: batch with delays, ~2-3 hours unattended. Resumable via local cursor state file.
4. Map API response shapes to Zod schemas
5. Write with `ingestion_wave: 2, confidence_tier: 'bronze', source: 'epstein-exposed'`
6. Output report with stats and conflicts

**Additional file:** `webapp/src/lib/ingestion/epstein-exposed-client.ts` — thin API client with retry/backoff.

**Quality gate:** Review script + cross-reference report showing Wave 2 ↔ Wave 1 entity overlap.

## Wave 3: Document Content Enrichment

**Sources:** CourtListener API, DocumentCloud API, DOJ EFTA URLs.

**Scope:** Full text extraction for the most-connected documents first.

**Script:** `webapp/scripts/ingest-wave-3.ts`

**Process:**
1. Query Neo4j for documents ranked by connection count (persons + events + cases)
2. For each document, try sources in order:
   - CourtListener search by case number/title
   - DocumentCloud search
   - DOJ EFTA URL → download PDF, extract text with `pdf-parse`
3. Store extracted text as `content` property on Document node
4. Heuristic key findings extraction: named entities, dates, monetary amounts → populate `key_findings[]`
5. Tag with `ingestion_wave: 3, content_source: 'courtlistener' | 'documentcloud' | 'doj'`

**Scope control:** First run processes top 100 most-connected documents. Review quality, then expand.

**Quality gate:** Sample 10 documents, compare extracted text against actual PDF.

**New dependency:** `pdf-parse` for PDF text extraction.

## Ingestion Infrastructure

### Directory Structure

```
webapp/src/lib/ingestion/
├── types.ts                    — IngestionResult, ConflictRecord, WaveConfig
├── dedup.ts                    — fuzzy matching (normalization, Levenshtein)
├── quality.ts                  — review report generation, conflict logging
├── wave-runner.ts              — shared wave execution (run, resume, report)
└── epstein-exposed-client.ts   — API client for Wave 2

webapp/scripts/
├── ingest-wave-1.ts            — GitHub data import
├── ingest-wave-2.ts            — Epstein Exposed API import
├── ingest-wave-3.ts            — Document content enrichment
├── review-wave.ts              — Quality gate: conflicts + sample review
└── promote-nodes.ts            — Promote bronze → silver → gold
```

### Dedup Logic (dedup.ts)

- Normalize: lowercase, strip accents, collapse whitespace
- Match: Levenshtein distance ≤ 2 OR exact slug match
- Returns: `exact_match | fuzzy_match | no_match`
- Fuzzy matches logged to `_ingestion_conflicts.json`

### Review Script

```bash
npx tsx scripts/review-wave.ts --wave 1
```

Outputs: new node count, conflict list, random 20-node sample.

### Promote Script

```bash
npx tsx scripts/promote-nodes.ts --wave 1 --to silver
npx tsx scripts/promote-nodes.ts --ids ep-person-123,ep-org-456 --to gold
```

## UI Integration

### Confidence Filter Toggle

Added to graph explorer and evidence explorer toolbars. Dropdown: `All | Gold+Silver | Gold only`. Defaults to `All`. Implemented as a `confidence_tier IN $tiers` clause appended to existing Cypher queries.

### Source Badge on Nodes

Displayed on actor profiles, document cards, and graph tooltips:
- **Gold:** no badge (curated data, no visual noise)
- **Silver:** subtle checkmark
- **Bronze:** "unverified" label with source name

No new pages or routes. Filter is additive — remove it and UI behaves as before.

## Future: Community Contributions

The wave system naturally extends to community contributions:
- Promote script → API endpoint
- Review script → moderation queue page
- User submissions = "waves from users" through the same quality gate

Not in scope for this design.

## Dependencies

- No new dependencies for Waves 1-2 (uses `fetch` + existing Neo4j driver)
- Wave 3 adds `pdf-parse` for PDF text extraction
