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

## Signal Types

```typescript
type SignalType =
  | 'nuclear_test'           // Confirmed or suspected nuclear detonation
  | 'missile_launch'         // Ballistic/cruise missile test or deployment
  | 'force_posture_change'   // Troop movements, DEFCON changes, alert status
  | 'treaty_action'          // Withdrawal, suspension, violation, renegotiation
  | 'official_statement'     // Government/military rhetoric or policy declaration
  | 'inspection_event'       // IAEA inspection, refusal, or finding
  | 'proliferation_activity' // Enrichment, weaponization, technology transfer
  | 'facility_event'         // Accident, construction, activation, decommission
  | 'military_exercise'      // Scheduled or unscheduled nuclear-capable exercises
  | 'diplomatic_action'      // Summit, negotiation, sanctions, UN vote
  | 'osint_observation'      // Satellite imagery, flight tracking, seismic anomaly
  | 'policy_analysis'        // Think tank or expert assessment
```

## Data Sources (31 total)

### Implementation Waves

Sources are prioritized into implementation waves based on API accessibility and value:

**Wave 0 (Seed + 6 RSS-based gold/silver):** `iaea`, `nato`, `us-dod`, `state-dept`, `aca`, `bulletin` — all have stable RSS feeds, no auth required.

**Wave 1 (Remaining gold + easy silver):** `unsc`, `us-nrc`, `opcw`, `sipri`, `fas`, `uk-mod`, `france-mod`, `eu-eeas`, `wire-services`, `usgs-seismic` — mix of RSS and simple API, some require free API keys.

**Wave 2 (Complex silver + bronze):** `russian-mfa`, `chinese-mfa`, `india-official`, `pakistan-official`, `kcna`, `iaea-bog`, `ctbto`, `ctbto-official`, `crs`, `npt`, `mtcr`, `nsg`, `aspi`, `adsb`, `osint-social` — require scraping, authenticated access, paid APIs, or proxy services. Some may be deferred indefinitely if access is unreliable.

**Access notes:**
- `ctbto` seismic data requires authenticated access via national data centres — may need to use USGS as a proxy initially
- `kcna` requires KCNA Watch proxy service (reliability varies)
- `russian-mfa` (mid.ru) subject to geo-blocking — may need proxy
- `adsb` shifted to paid API — free tier has limited coverage
- `osint-social` (X/Twitter API) has prohibitive pricing — may use RSS bridges or curated manual feeds instead

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

Each source follows (under `webapp/src/etl/nuclear-risk/`):

```
webapp/src/etl/nuclear-risk/
├── shared/
│   ├── rss-parser.ts       # Common RSS fetch + parse (most sources use RSS)
│   ├── keyword-filter.ts   # Nuclear-relevant keyword matching to filter noise
│   └── geo-resolver.ts     # Location → lat/lng via local gazetteer of ~200 known nuclear sites
├── iaea/
│   ├── index.ts            # Barrel re-export of fetch, transform, load
│   ├── fetcher.ts          # API/RSS/scrape → raw data
│   ├── types.ts            # Zod schemas for raw + transformed
│   ├── transformer.ts      # Raw → NuclearSignal parameters
│   └── loader.ts           # MERGE into Neo4j with provenance
├── nato/
│   └── ...                 # Same structure per source
└── ...
```

Every module includes an `index.ts` barrel file re-exporting `fetch`, `transform`, and `load` functions, matching the existing ETL convention (e.g., `webapp/src/etl/boletin-oficial/index.ts`).

`geo-resolver.ts` uses a local gazetteer (JSON file of ~200 known nuclear sites with lat/lng) for seed facilities. For dynamically discovered locations in signal text, falls back to LLM extraction of place names matched against the gazetteer — no external geocoding API needed.

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

**Signal deduplication:** When multiple sources report the same event, we consolidate into a single `NuclearSignal` node with multiple `SOURCED_FROM` relationships to `SignalSource` nodes (see below). Matching criteria:
- Same theater + date within ±1 day + entity overlap ≥ 1 shared `NuclearActor`
- Fuzzy title similarity (normalized Levenshtein ≥ 0.6 on `title_en`)
- If ambiguous, LLM adjudicates with a yes/no "same event?" prompt
- The highest-tier source becomes the canonical signal; others become `SOURCED_FROM` edges

**New node for multi-source provenance:**
- `SignalSource` — `id`, `source_module`, `source_url`, `tier`, `fetched_at`, `raw_title`
- Relationship: `NuclearSignal -[:SOURCED_FROM]-> SignalSource`

**Actor matching:** Uses existing `normalizeName()` from `webapp/src/lib/utils/normalize.ts` — handles diacritics, casing, and word order. For non-Latin scripts (Russian, Chinese, Korean), match on the English transliteration stored in `NuclearActor.name` (all actor names stored in English).

**Entity linking:** Link signals to known `WeaponSystem`, `Treaty`, `NuclearFacility` nodes via:
1. Exact keyword match against known entity names
2. LLM extraction for ambiguous references (e.g., "the treaty" → which treaty based on context)

**Escalation chains:** Create `ESCALATES` relationships when:
- Signal explicitly references a prior signal's event (LLM detects reference)
- Same theater + same actor + within 7 days + escalation_level increased
- Manual override via user submission

### Phase 3: LLM Analysis (Qwen 3.5 via MiroFish)

Three sequential tasks. All use Qwen 3.5 via MiroFish (`MIROFISH_API_URL`). Must check `reasoning_content` field (mandatory thinking mode), then parse `content` for structured output.

**1. Signal Classification** — for each new `NuclearSignal`, batch up to 10 signals per prompt:

```
System: You are a nuclear risk analyst. Classify each signal.
User: [JSON array of {id, title, summary, source_tier, source_module}]
```

Expected output (JSON array):
```json
[{
  "id": "signal-id",
  "severity": 45,
  "escalation_level": "elevated",
  "signal_type": "missile_launch",
  "theater": "Korean Peninsula",
  "actors": ["north-korea", "us"],
  "weapon_systems": ["hwasong-17"],
  "treaties": ["npt"],
  "facilities": []
}]
```

Estimated tokens: ~500 input + ~200 output per signal. At 50 signals/day: ~35K tokens total.

**2. Pattern Detection** — one prompt per theater with active signals:

```
System: You are a nuclear escalation pattern analyst.
User: Theater: {theater}. Signals last 30 days: [JSON array sorted by date].
      Current 7-day rolling average severity: {score}.
      Identify convergence patterns, anomalies, and trend direction.
```

Expected output (JSON):
```json
{
  "theater": "US-Russia",
  "convergence_flags": ["Multiple signals indicate..."],
  "anomaly_flags": ["Unusual spike in..."],
  "trend": "rising",
  "score_override": null,
  "override_reasoning": null
}
```

Estimated tokens: ~2K input + ~500 output per theater. At 7 theaters: ~17.5K tokens total.

**3. Briefing Generation** — single prompt with all theater summaries:

```
System: You are a nuclear risk briefing writer. Write in both English and Spanish.
User: Date: {date}. Theater summaries: [JSON from step 2].
      Top 10 signals today: [JSON from step 1, sorted by severity].
      Generate a concise daily risk briefing.
```

Expected output (JSON):
```json
{
  "overall_score": 38,
  "summary_en": "...",
  "summary_es": "...",
  "theaters": [{"theater": "...", "score": 42, "trend": "rising", "summary_en": "...", "summary_es": "..."}],
  "top_signals": ["signal-id-1", "signal-id-2", "..."]
}
```

Estimated tokens: ~3K input + ~2K output. Single call.

**Total Phase 3 estimate:** ~55K tokens, ~2-3 minutes on local Qwen 3.5 9B. Well within 5-minute timeout.

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
- LLM can override numerical score ±15 points — stored as `score_override` and `override_reasoning` properties on the `RiskBriefing` node's theater entry

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

## API Routes

New endpoints under `webapp/src/app/api/caso/riesgo-nuclear/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/caso/riesgo-nuclear/graph` | GET | Full investigation graph (reuses existing pattern) |
| `/api/caso/riesgo-nuclear/risk-score` | GET | Current overall + per-theater scores, trends |
| `/api/caso/riesgo-nuclear/signals` | GET | Filtered signals query — params: `theater`, `escalation_level`, `signal_type`, `from_date`, `to_date`, `limit` |
| `/api/caso/riesgo-nuclear/briefing` | GET | Latest `RiskBriefing` or by date param |
| `/api/caso/riesgo-nuclear/actor/[actorSlug]` | GET | Actor detail — arsenal, treaties, recent signals, risk trend |
| `/api/caso/riesgo-nuclear/timeline` | GET | Signals ordered by date for cronologia page |

## Package.json Scripts

```json
{
  "nuclear:seed": "tsx scripts/seed-nuclear-risk.ts",
  "nuclear:loop": "tsx scripts/run-nuclear-risk-loop.ts",
  "nuclear:ingest:wave0": "tsx scripts/ingest-nuclear-risk-wave0.ts",
  "nuclear:ingest:wave1": "tsx scripts/ingest-nuclear-risk-wave1.ts",
  "nuclear:ingest:wave2": "tsx scripts/ingest-nuclear-risk-wave2.ts"
}
```

## Investigation Registration

### Registry Entry (`src/config/investigations.ts`)
- Slug: `riesgo-nuclear`
- Title: bilingual
- Status: `active`
- Color: `yellow` (Tailwind color token)
- Add entry to `CASE_META` in dynamic layout at `webapp/src/app/caso/[slug]/layout.tsx`

### Case Library (`src/lib/caso-nuclear-risk/`)
- `types.ts` — domain types, escalation enums, Zod schemas for all 6 node types + `SignalSource`
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
