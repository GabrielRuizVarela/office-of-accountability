# Nuclear Risk Tracking — ETL & Investigation Design

**Date:** 2026-03-23
**Status:** Draft
**Investigation slug:** `riesgo-nuclear`

## Overview

Real-time (daily cadence) monitoring of signals that could indicate escalation of nuclear risk globally. Tracks military developments, official statements, treaty status, seismic events, OSINT, and all available open-source data across all nuclear-armed states and theaters. Follows the existing wave-based ETL + investigation loop pattern.

## Domain Model

### Node Labels

| Label | Purpose | Key Properties |
|-------|---------|----------------|
| `NuclearSignal` | Core unit — one discrete event/statement/observation | `id`, `date`, `title_en`, `title_es`, `summary_en`, `summary_es`, `severity` (0-100), `escalation_level` (routine/notable/elevated/serious/critical), `signal_type`, `theater` |
| `NuclearActor` | State or non-state actor | `id`, `name`, `actor_type` (state/organization/agency), `nuclear_status` (armed/threshold/non-nuclear) |
| `WeaponSystem` | Specific weapons platform or program | `id`, `name`, `category` (icbm/slbm/tactical/hypersonic/missile_defense), `operator_id` |
| `Treaty` | Arms control agreement | `id`, `name`, `status` (active/suspended/withdrawn/expired), `signed_date`, `parties` |
| `NuclearFacility` | Enrichment, testing, storage, reactor sites | `id`, `name`, `facility_type`, `location`, `lat`, `lng`, `operator_id` |
| `RiskBriefing` | LLM-generated daily synthesis | `id`, `date`, `period`, `overall_score`, `summary_en`, `summary_es`, `theaters_summary` |

All nodes carry standard provenance fields: `tier`, `confidence_score`, `source_url`, `submitted_by`, `ingestion_hash`, `created_at`, `updated_at`.

### Relationships

| Relationship | From | To | Purpose |
|-------------|------|-----|---------|
| `INVOLVES` | NuclearSignal | NuclearActor | Signal references an actor |
| `REFERENCES_SYSTEM` | NuclearSignal | WeaponSystem | Signal mentions a weapon |
| `REFERENCES_TREATY` | NuclearSignal | Treaty | Signal references a treaty |
| `LOCATED_AT` | NuclearSignal | NuclearFacility | Signal tied to a location |
| `ESCALATES` | NuclearSignal | NuclearSignal | Signal chains (escalation sequences) |
| `OPERATES` | NuclearActor | NuclearFacility | Actor operates facility |
| `PARTY_TO` | NuclearActor | Treaty | Treaty membership |
| `POSSESSES` | NuclearActor | WeaponSystem | Arsenal ownership |
| `SYNTHESIZES` | RiskBriefing | NuclearSignal | Briefing summarizes signals |
| `REFERENCES` | Investigation | NuclearSignal | Ties into existing investigation framework |

## Data Sources (31 total)

### Gold Tier (11 sources)

| Source | Module | What We Get | Method |
|--------|--------|-------------|--------|
| IAEA | `iaea` | Press releases, incident reports, inspection updates | RSS/scrape iaea.org/newscenter |
| IAEA Board of Governors | `iaea-bog` | Quarterly safeguards reports, special inspections, non-compliance findings | Document scrape |
| CTBTO | `ctbto` | Seismic events consistent with nuclear tests | Public API/event feed |
| CTBTO Official | `ctbto-official` | Verification reports, on-site inspection mandates | Document scrape |
| UN Security Council | `unsc` | Resolutions, statements on nuclear matters | UN documents API |
| US DoD | `us-dod` | Pentagon press briefings, STRATCOM statements, Nuclear Posture Review updates | RSS/scrape |
| US Congressional Research Service | `crs` | Reports on nuclear policy, proliferation assessments | Document scrape |
| NATO | `nato` | Nuclear sharing policy, deterrence communiqués, Allied Command statements | RSS |
| OPCW | `opcw` | Chemical weapons crossover signals (dual-use proliferation) | RSS |
| US NRC | `us-nrc` | Domestic facility events, emergency notifications | RSS/API |
| SIPRI | `sipri` | Annual yearbook data, warhead inventories, arms transfer database | Scrape/CSV |

### Silver Tier (17 sources)

| Source | Module | What We Get | Method |
|--------|--------|-------------|--------|
| US State Dept | `state-dept` | Press briefings, arms control statements | RSS |
| Russian MFA | `russian-mfa` | Official statements, treaty positions | RSS/scrape mid.ru |
| Chinese MFA | `chinese-mfa` | Spokesperson statements, defense white papers | RSS/scrape mfa.gov.cn |
| DPRK (KCNA) | `kcna` | Missile test announcements, rhetoric | Scrape via KCNA Watch proxy |
| UK MoD | `uk-mod` | Trident program updates, defense committee statements | RSS |
| French MoD | `france-mod` | Force de frappe updates, nuclear doctrine statements | RSS |
| Indian MEA + DRDO | `india-official` | Missile test notifications, nuclear doctrine statements | RSS/scrape |
| Pakistan MFA + SPD | `pakistan-official` | Strategic Plans Division updates, missile test claims | RSS/scrape |
| EU EEAS | `eu-eeas` | Non-proliferation policy, Iran deal (JCPOA) updates | RSS |
| NPT Review Conference | `npt` | Treaty review outcomes, withdrawal threats | Document scrape |
| MTCR | `mtcr` | Export control violations, member state notifications | Document scrape |
| Nuclear Suppliers Group | `nsg` | Proliferation-sensitive trade alerts | Document scrape |
| Arms Control Association | `aca` | Treaty status, analysis, fact sheets | RSS armscontrol.org |
| Bulletin of Atomic Scientists | `bulletin` | Doomsday Clock updates, expert analysis | RSS thebulletin.org |
| Federation of American Scientists | `fas` | Nuclear notebook, stockpile estimates, satellite analysis | RSS fas.org |
| ASPI | `aspi` | Indo-Pacific nuclear dynamics, AUKUS nuclear submarine program | RSS |
| Reuters/AP | `wire-services` | Breaking news matching nuclear keywords | News API with keyword filter |

### Bronze Tier (3 sources)

| Source | Module | What We Get | Method |
|--------|--------|-------------|--------|
| ADSB Exchange | `adsb` | Military aircraft patterns (E-6B, E-4B, RC-135) | ADSB API filtered by mil hex codes |
| OSINT Twitter/X | `osint-social` | Defense analysts, nuclear policy accounts | Curated list via API |
| USGS Earthquake | `usgs-seismic` | Seismic events for cross-ref with CTBTO | USGS API filtered by magnitude/depth |

### ETL Module Structure

Each source follows:

```
src/etl/nuclear-risk/[source]/
├── fetcher.ts       # API/RSS/scrape → raw data
├── types.ts         # Zod schemas for raw + transformed
├── transformer.ts   # Raw → NuclearSignal parameters
└── loader.ts        # MERGE into Neo4j with provenance
```

Shared utilities in `src/etl/nuclear-risk/shared/`:

- `rss-parser.ts` — common RSS fetch + parse
- `keyword-filter.ts` — nuclear-relevant keyword matching to filter noise
- `geo-resolver.ts` — map location mentions to lat/lng for facility/theater tagging

## Daily Pipeline (4-Phase Loop)

Script: `scripts/run-nuclear-risk-loop.ts`

### Phase 0: Status Check
- Count existing signals, actors, facilities in Neo4j
- Report last successful run timestamp
- Validate all API keys/endpoints are reachable

### Phase 1: Ingest
- Run all 31 fetchers in parallel (batched by tier: gold first, then silver, then bronze)
- Each fetcher pulls last 24h of data
- Zod-validate raw responses
- Transform to `NuclearSignal` + related entity parameters
- MERGE into Neo4j with provenance (`source_url`, `tier`, `ingestion_hash`, `created_at`)
- Keyword filter discards irrelevant results before loading

### Phase 2: Cross-Reference & Dedup
- Entity resolution across sources — same event reported by multiple outlets links to one `NuclearSignal` with multiple source edges
- Match `NuclearActor` nodes by name normalization (existing `normalizeName()`)
- Link signals to known `WeaponSystem`, `Treaty`, `NuclearFacility` nodes via keyword + LLM extraction
- Create `ESCALATES` chains when a signal references or follows a prior signal

### Phase 3: LLM Analysis (Qwen 3.5 via MiroFish)

Three sequential tasks:

**1. Signal Classification** — for each new `NuclearSignal`, extract:
- `severity` score (0-100)
- `escalation_level` (routine/notable/elevated/serious/critical)
- `theater` (US-Russia, Indo-Pacific, Korean Peninsula, Middle East, Europe, South Asia, Global)
- Entity mentions → link to `NuclearActor`, `WeaponSystem`, `Treaty`

**2. Pattern Detection** — analyze last 7/30 days of signals per theater:
- Flag convergence (multiple independent signals pointing to same escalation)
- Flag anomalies (sudden spike in rhetoric, unusual military activity)
- Compare current score to rolling average

**3. Briefing Generation** — synthesize into a `RiskBriefing` node:
- Overall risk score + per-theater breakdown
- Top signals of the day with context
- Trend arrows (rising/stable/declining per theater)
- Bilingual (EN/ES)

### Phase 4: Report
- Write `RiskBriefing` node to Neo4j
- Update investigation stats in the registry
- Log run summary with signal counts, new entities, risk delta

**Timeout:** 5 minutes per phase.

## Escalation Scoring Model

### Per-Signal Severity (0-100)

| Factor | Weight | Examples |
|--------|--------|---------|
| Source tier | 20% | Gold source = higher base score |
| Event type | 30% | Nuclear test (90+), missile launch (70-85), rhetoric (20-50), routine exercise (10-20) |
| Actor nuclear status | 15% | Nuclear-armed state = higher weight than threshold state |
| Novelty | 15% | First-ever event type scores higher than repeated pattern |
| Multi-source corroboration | 20% | Same event from 3+ independent sources boosts score |

### Escalation Ladder

| Level | Score Range | Meaning |
|-------|------------|---------|
| `routine` | 0-20 | Standard diplomatic activity, routine exercises, scheduled tests |
| `notable` | 21-40 | Unusual rhetoric, unscheduled military movements, treaty disputes |
| `elevated` | 41-60 | Weapons tests, force posture changes, inspection refusals |
| `serious` | 61-80 | Treaty withdrawal, nuclear threats, confirmed proliferation breach |
| `critical` | 81-100 | Nuclear detonation, launch detection, confirmed first-strike posture |

### Theater Aggregation
- Weighted average of all signals in the last 7 days per theater
- Decaying weight: today = 100%, 7 days ago = 30%
- LLM can override numerical score ±15 points (must log reasoning)

### Overall Risk Score
- Highest theater score drives the headline number (weakest-link model)
- Secondary metric: average across all theaters for trend tracking

## Neo4j Schema Additions

### Unique Constraints
- `NuclearSignal.id`
- `NuclearActor.id`
- `WeaponSystem.id`
- `Treaty.id`
- `NuclearFacility.id`
- `RiskBriefing.id`

### Full-Text Indexes
- `nuclear_signal_fulltext` on `NuclearSignal(title_en, title_es, summary_en, summary_es)`
- `nuclear_actor_fulltext` on `NuclearActor(name)`

### Range Indexes
- `NuclearSignal(date)`, `NuclearSignal(theater)`, `NuclearSignal(escalation_level)`, `NuclearSignal(severity)`
- `NuclearActor(actor_type)`, `NuclearActor(nuclear_status)`
- `NuclearFacility(facility_type)`
- `Treaty(status)`
- `RiskBriefing(date)`

## Seed Data (Wave 0)

Loaded before any daily runs, all gold tier, manually curated:

- **9 nuclear-armed states** as `NuclearActor` nodes (US, Russia, China, UK, France, India, Pakistan, Israel, North Korea)
- **~5 threshold/aspiring states** (Iran, Saudi Arabia, South Korea, Japan, Turkey)
- **~8 major treaties** (NPT, New START, CTBT, INF, JCPOA, MTCR, NSG, Tlatelolco)
- **~30 weapon systems** (Minuteman III, Trident II, Topol-M, DF-41, Agni-V, Shaheen-III, etc.)
- **~50 key facilities** (Natanz, Yongbyon, Dimona, Sellafield, La Hague, Pantex, Sarov, etc.)

## Investigation Registration

### Registry Entry (`src/config/investigations.ts`)
- Slug: `riesgo-nuclear`
- Title: bilingual
- Status: `active`
- Color: yellow

### Case Library (`src/lib/caso-nuclear-risk/`)
- `types.ts` — domain types, escalation enums
- `investigation-data.ts` — seed data for actors, treaties, weapons, facilities
- `investigation-schema.ts` — Zod schemas for user-submitted signals (Caso Libra pattern)
- `queries.ts` — Neo4j Cypher queries
- `scoring.ts` — severity calculation, escalation ladder, theater aggregation, decay weighting

### UI Pages (via existing `/caso/[slug]/` dynamic routes)

| Page | Content |
|------|---------|
| `/resumen` | Current overall risk score, per-theater breakdown, today's top signals, 30-day trend chart |
| `/cronologia` | Signal timeline filterable by theater, escalation level, actor |
| `/grafo` | Network graph — actors, signals, treaties, weapon systems, facilities |
| `/evidencia` | Source documents, official statements, LLM briefings |
| `/actor/[slug]` | Actor profile — nuclear arsenal, treaty memberships, recent signals, risk trend |

## Confidence Tiers

Reuses the existing three-tier system:

- **Gold**: IAEA, CTBTO, UN Security Council, US DoD, NATO, OPCW, CRS, US NRC, SIPRI (official/institutional sources)
- **Silver**: Government MFAs, EU EEAS, policy think tanks, wire services (reliable but potentially biased or delayed)
- **Bronze**: ADSB military flight tracking, OSINT social media, USGS seismic (useful but noisy, requires corroboration)
