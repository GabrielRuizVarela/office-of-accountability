# Obras Públicas Investigation Design

## Overview

Contract tracing investigation of Argentine public works ("obras públicas") designed for cross-referencing with the existing finanzas-politicas investigation graph. 14 waves: 7 ingestion, 7 analysis/narrative.

**Caso slug:** `obras-publicas`
**Cross-ref strategy:** Dedicated cross-reference wave (Wave 7) with full 3-tier matching after all ingestion completes.
**Odebrecht/Cuadernos approach:** Manually curated seed JSON + Qwen LLM enrichment.
**Output:** Caso UI pages at `/caso/obras-publicas/` + standalone `DOSSIER-OBRAS-PUBLICAS.md`.

---

## Data Sources

### Tier 1 — National structured (Waves 1-2)

| Source | URL | Format | Auth | CUIT |
|--------|-----|--------|------|------|
| CONTRAT.AR (7 CSVs) | `infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.{N}/download/onc-contratar-{resource}.csv` | CSV | None | Yes |
| COMPR.AR SIPRO | `infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.11/download/proveedores.csv` | CSV | None | Yes |
| COMPR.AR convocatorias | `infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.19/download/convocatorias-{year}.csv` | CSV | None | No |
| COMPR.AR adjudicaciones | `infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.20/download/adjudicaciones-{year}.csv` | CSV | None | Yes |
| MapaInversiones | `mapainversiones.obraspublicas.gob.ar/opendata/dataset_mop.csv` | CSV | None | No (names) |
| Presupuesto Abierto `/pef` | `presupuestoabierto.gob.ar/api/v1/pef` | JSON | Token | No |

### Tier 2 — Sector-specific national (Wave 3)

| Source | URL | Format | Auth | CUIT |
|--------|-----|--------|------|------|
| Vialidad Nacional | `argentina.gob.ar/transporte/vialidad-nacional/catalogos-de-datos-abiertos` | CSV/OCDS | None | Yes |
| ENOHSA water/sanitation | `datos.gob.ar/dataset/obras-agua-saneamiento-e-infraestructura-hidrica---agua-saneamiento` | CSV | None | Yes |

### Tier 3 — Provincial (Wave 4)

| Source | URL | Format | Auth | CUIT |
|--------|-----|--------|------|------|
| CABA BAC_OCDS | `github.com/datosgcba/BAC_OCDS` | OCDS JSON/CSV | None | Yes |
| Mendoza OCDS | `datosabiertos-compras.mendoza.gov.ar/datasets/` | OCDS JSON | None | Yes |

### Tier 4 — International (Wave 5)

| Source | URL | Format | Auth | CUIT |
|--------|-----|--------|------|------|
| World Bank Contract Awards | `financesone.worldbank.org/Procurement/Major-Contract-Awards/kdui-wcs3` | CSV/JSON/API | None | No (names) |
| WB Borrower Procurement Reports | `worldbank.org/.../summary-and-detailed-borrower-procurement-reports` | Excel | None | No (names) |
| WB Debarment List | `worldbank.org/.../debarred-firms` | Excel | None | No (names) |
| IDB Sanctions List | `iadb.org/.../sanctioned-firms-and-individuals` | Web | None | No (names) |
| IDB Invest Projects | `idbinvest.org/en/projects?country=argentina` | XML | None | No |

### Tier 5 — Investigative (Wave 6)

| Source | Format | Notes |
|--------|--------|-------|
| DOJ Odebrecht plea agreement | PDF → manual seed JSON | $35M bribes to AR officials |
| SEC FCPA Siemens settlement | PDF → manual seed JSON | $100M+ DNI contract bribery |
| Cuadernos reporting | Journalistic sources → manual seed JSON | Named companies, amounts, politicians |

---

## Prerequisites: Type Extensions

Before any wave runs, extend the existing `IngestionSource` type in `webapp/src/lib/ingestion/types.ts`:

```typescript
export type IngestionSource =
  | 'seed' | 'rhowardstone' | 'epstein-exposed' | 'courtlistener'
  | 'documentcloud' | 'doj' | 'community' | 'dleerdefi'
  // obras-publicas sources (new)
  | 'contratar'           // Wave 1: CONTRAT.AR
  | 'sipro'               // Wave 1: COMPR.AR supplier registry
  | 'mapa-inversiones'    // Wave 2: MapaInversiones
  | 'presupuesto-abierto' // Wave 2: Presupuesto Abierto API
  | 'vialidad'            // Wave 3: Vialidad Nacional
  | 'enohsa'              // Wave 3: ENOHSA water/sanitation
  | 'ocds-provincial'     // Wave 4: CABA + Mendoza OCDS
  | 'multilateral'        // Wave 5: World Bank + IDB
  | 'investigative-seed'  // Wave 6: Odebrecht/Cuadernos
```

Extend `FlagType` in `webapp/src/etl/cross-reference/types.ts` with the new `ObrasFlagType` values (see New Investigation Flags section below).

---

## Neo4j Schema Additions

### New Node Labels

All node interfaces extend `ObrasProvenanceParams`, following the existing pattern (e.g., `BoletinProvenanceParams` in `boletin-oficial/types.ts`):

```typescript
// Base provenance for all obras-publicas nodes
interface ObrasProvenanceParams {
  source_url: string
  submitted_by: string     // e.g., 'etl:contratar'
  tier: ConfidenceTier
  confidence_score: number
  ingestion_hash: string   // SHA256[:16] of source key
  created_at: string       // ISO timestamp
  updated_at: string       // ISO timestamp
}

// Procurement procedure (from CONTRAT.AR procedimientos)
interface ObrasProcedure extends ObrasProvenanceParams {
  procedure_id: string     // unique constraint — sha256(proc:${numero_procedimiento})[:16]
  caso_slug: 'obras-publicas'
  numero_procedimiento: string
  tipo_procedimiento: string  // 'licitacion_publica' | 'licitacion_privada' | 'contratacion_directa'
  modalidad: string
  organismo: string        // contracting government entity
  estado: string           // 'abierto' | 'evaluacion' | 'adjudicado' | 'desierto' | 'cancelado'
  fecha_apertura?: string
  fecha_adjudicacion?: string
  monto_estimado?: number
  moneda: string
}

// Public work project (from CONTRAT.AR obras, MapaInversiones)
interface PublicWork extends ObrasProvenanceParams {
  work_id: string          // unique constraint
  caso_slug: 'obras-publicas'
  name: string
  description: string
  sector: string           // 'road' | 'water' | 'housing' | 'energy' | 'transport' | 'other'
  province: string
  municipality: string
  latitude?: number
  longitude?: number
  status: string           // 'planned' | 'in_progress' | 'completed' | 'suspended' | 'cancelled'
  start_date?: string
  end_date?: string
}

// Bid on a procedure (from CONTRAT.AR ofertas)
// Note: bidder_cuit resolves to a Contractor node via MERGE, not via SAME_ENTITY on the Bid itself
interface Bid extends ObrasProvenanceParams {
  bid_id: string           // unique constraint
  caso_slug: 'obras-publicas'
  procedure_number: string
  bidder_name: string
  bidder_cuit?: string
  amount: number
  currency: string
  date: string
  status: string           // 'submitted' | 'evaluated' | 'winner' | 'rejected'
}

// Work front within a project (from CONTRAT.AR obras)
interface WorkFront extends ObrasProvenanceParams {
  front_id: string         // unique constraint
  caso_slug: 'obras-publicas'
  name: string
  description: string
  physical_progress: number  // 0-100%
  financial_progress: number // 0-100%
}

// Budget allocation (from Presupuesto Abierto)
interface BudgetAllocation extends ObrasProvenanceParams {
  allocation_id: string    // unique constraint
  caso_slug: 'obras-publicas'
  fiscal_year: number
  program: string
  subprogram: string
  budget_ars: number       // allocated
  executed_ars: number     // spent
  execution_pct: number    // executed / budget
}

// Multilateral-funded project (from World Bank, IDB)
interface MultilateralProject extends ObrasProvenanceParams {
  project_id: string       // unique constraint
  caso_slug: 'obras-publicas'
  funder: string           // 'world_bank' | 'idb' | 'caf'
  name: string
  sector: string
  amount_usd: number
  status: string
  approval_date: string
}

// Debarred entity (from WB, IDB debarment lists)
interface DebarredEntity extends ObrasProvenanceParams {
  debarment_id: string     // unique constraint
  caso_slug: 'obras-publicas'
  name: string             // unified property name (consistent across labels)
  entity_name: string      // original name from debarment list (kept for provenance)
  country: string
  debarred_by: string      // 'world_bank' | 'idb'
  from_date: string
  to_date: string
  grounds: string
}

// Bribery case (from Odebrecht/Cuadernos seed)
interface BriberyCase extends ObrasProvenanceParams {
  case_id: string          // unique constraint
  caso_slug: 'obras-publicas'
  name: string             // 'odebrecht_argentina' | 'cuadernos' | 'siemens_dni'
  source_case: string      // 'lava_jato' | 'cuadernos' | 'fcpa'
  total_bribes_usd?: number
  period_start: string
  period_end: string
  jurisdiction: string
}

// Intermediary in bribery scheme (from seed data)
interface Intermediary extends ObrasProvenanceParams {
  intermediary_id: string  // unique constraint
  caso_slug: 'obras-publicas'
  name: string
  role: string             // 'bagman' | 'fixer' | 'lobbyist' | 'shell_operator'
  cuit?: string
  dni?: string
}
```

### New Relationships

```
PROCEDURE_FOR:       ObrasProcedure → PublicWork (1:1 or 1:N — one procedure may produce multiple works)
BID_ON:              Bid → ObrasProcedure (bids target a procedure, not a work directly)
BIDDER:              Bid → Contractor (resolved from bidder_cuit via MERGE)
CONTRACTED_FOR:      Contractor → PublicWork
WORK_FRONT_OF:       WorkFront → PublicWork
BUDGET_FOR:          BudgetAllocation → PublicWork
LOCATED_IN_PROVINCE: PublicWork → Province
FUNDED_BY:           PublicWork → MultilateralProject
DEBARRED_FROM:       DebarredEntity → MultilateralProject (funder)
DEBARRED_SAME_AS:    DebarredEntity → Contractor (cross-ref match via fuzzy name)
BRIBED_BY:           Politician|GovernmentAppointment → BriberyCase
INTERMEDIATED:       Intermediary → BriberyCase
CASE_INVOLVES:       BriberyCase → PublicWork|Contractor|Company
EXECUTED_BY:         BudgetAllocation → Contractor|Company
```

Note: Geographic coordinates (lat/lon) are stored directly on `PublicWork` nodes, not as separate `GeoPoint` nodes. Sector (`road`, `water`, etc.) is a property on `PublicWork`, not a separate label.

### New Indexes

```cypher
-- Unique constraints
CREATE CONSTRAINT procedure_id_unique FOR (n:ObrasProcedure) REQUIRE n.procedure_id IS UNIQUE
CREATE CONSTRAINT publicwork_id_unique FOR (n:PublicWork) REQUIRE n.work_id IS UNIQUE
CREATE CONSTRAINT bid_id_unique FOR (n:Bid) REQUIRE n.bid_id IS UNIQUE
CREATE CONSTRAINT workfront_id_unique FOR (n:WorkFront) REQUIRE n.front_id IS UNIQUE
CREATE CONSTRAINT budget_id_unique FOR (n:BudgetAllocation) REQUIRE n.allocation_id IS UNIQUE
CREATE CONSTRAINT multilateral_id_unique FOR (n:MultilateralProject) REQUIRE n.project_id IS UNIQUE
CREATE CONSTRAINT debarred_id_unique FOR (n:DebarredEntity) REQUIRE n.debarment_id IS UNIQUE
CREATE CONSTRAINT briberycase_id_unique FOR (n:BriberyCase) REQUIRE n.case_id IS UNIQUE
CREATE CONSTRAINT intermediary_id_unique FOR (n:Intermediary) REQUIRE n.intermediary_id IS UNIQUE

-- B-tree indexes for query performance
CREATE INDEX publicwork_caso_slug FOR (n:PublicWork) ON (n.caso_slug)
CREATE INDEX publicwork_sector FOR (n:PublicWork) ON (n.sector)
CREATE INDEX publicwork_province FOR (n:PublicWork) ON (n.province)
CREATE INDEX publicwork_status FOR (n:PublicWork) ON (n.status)
CREATE INDEX bid_caso_slug FOR (n:Bid) ON (n.caso_slug)
CREATE INDEX bid_cuit FOR (n:Bid) ON (n.bidder_cuit)
CREATE INDEX procedure_caso_slug FOR (n:ObrasProcedure) ON (n.caso_slug)
CREATE INDEX intermediary_cuit FOR (n:Intermediary) ON (n.cuit)

-- Fulltext indexes (all labels use consistent `name` property)
CREATE FULLTEXT INDEX obras_name_fulltext FOR (n:PublicWork|WorkFront|MultilateralProject|ObrasProcedure) ON EACH [n.name, n.description]
CREATE FULLTEXT INDEX obras_entity_name_fulltext FOR (n:DebarredEntity|Intermediary) ON EACH [n.name]
```

### New Investigation Flags

```typescript
type ObrasFlagType =
  | 'contractor_donor'       // contractor also donated to political campaigns
  | 'contractor_offshore'    // contractor linked to offshore entity
  | 'debarred_active'        // debarred entity still winning contracts
  | 'budget_overrun'         // execution > 150% of budget allocation
  | 'budget_underrun'        // execution < 30% but project marked "completed"
  | 'odebrecht_linked'       // entity appears in Odebrecht plea data
  | 'cuadernos_linked'       // entity appears in Cuadernos data
  | 'repeat_winner'          // contractor with 50+ public works contracts
  | 'shell_company'          // company with 0 officers but receives contracts
  | 'cross_investigation'    // entity appears in both obras-publicas AND finanzas-politicas
  | 'multilateral_national'  // same contractor wins both WB/IDB AND national contracts
  | 'geographic_concentration' // single contractor dominates one province
```

---

## Wave Definitions

Each wave implements the `/investigate-loop` pattern:
1. Status Check (Neo4j query for current graph state)
2. Ingest (fetch → validate Zod → transform → dedup → load MERGE)
3. Verify (WebSearch top entities, parallel agents)
4. Dedup (exact + Levenshtein name matching)
5. Analyze (Qwen LLM for pattern detection)
6. Promote (bronze → silver where verified)
7. Update (investigation artifacts)
8. Commit

### Wave 1 — CONTRAT.AR + COMPR.AR SIPRO

**Purpose:** Foundation layer. National public works contracts and supplier registry.

**Ingest:**
- Fetch 7 CONTRAT.AR CSVs from `infra.datos.gob.ar`:
  - `onc-contratar-procedimientos.csv` → `ObrasProcedure` nodes
  - `onc-contratar-ofertas.csv` → `Bid` nodes + `BID_ON` rels
  - `onc-contratar-contratos.csv` → `PublicContract` nodes + `CONTRACTED_FOR` rels
  - `onc-contratar-obras.csv` → `WorkFront` nodes + `WORK_FRONT_OF` rels
  - `onc-contratar-ubicacion-geografica.csv` → `LOCATED_IN_PROVINCE` rels + lat/lon on PublicWork
  - `onc-contratar-circulares.csv` → metadata on procedures
  - `onc-contratar-actas-apertura.csv` → bid opening metadata
- Fetch COMPR.AR SIPRO supplier CSV → `Contractor` nodes (MERGE on cuit)
- Fetch COMPR.AR adjudicaciones CSVs (2015-2024) → `PublicContract` + `AWARDED_TO` rels

**ETL module:** `webapp/src/etl/obras-publicas/contratar/`
**Files:** `types.ts`, `fetcher.ts`, `transformer.ts`, `loader.ts`, `index.ts`
**Script:** `webapp/scripts/run-etl-contratar.ts`
**npm:** `"etl:contratar": "npx tsx scripts/run-etl-contratar.ts"`

**Verify (parallel agents):**
- Agent A: WebSearch top 30 contractors by contract count
- Agent B: WebSearch top 20 contractors by total award amount
- Agent C: Validate CUIT format and detect person vs company CUITs

**Analyze (Qwen):**
- Identify repeat winners (>50 contracts)
- Detect geographic concentration patterns
- Flag procedures with single bidder

**Tier:** silver (official government portal data)

### Wave 2 — MapaInversiones + Presupuesto Abierto

**Purpose:** Budget allocation vs actual execution. Geographic visualization data.

**Ingest:**
- Fetch MapaInversiones CSV → `PublicWork` nodes (MERGE by project ID or name hash)
  - Fields: budget, execution %, physical progress %, contractor name, province, municipality, lat/lon
  - Link to existing `PublicWork` nodes from Wave 1 where procedure numbers match
- Fetch Presupuesto Abierto API POST `/pef` → `BudgetAllocation` nodes
  - Requires auth token from `presupuestoabierto.gob.ar/sici/api-pac`
  - Fields: fiscal year, program, subprogram, budget, executed, execution %

**ETL module:** `webapp/src/etl/obras-publicas/mapa-inversiones/`
**Script:** `webapp/scripts/run-etl-mapa-inversiones.ts`
**npm:** `"etl:mapa-inversiones": "npx tsx scripts/run-etl-mapa-inversiones.ts"`

**Verify (parallel agents):**
- Agent A: Flag projects with execution > 150% of budget
- Agent B: Flag projects with execution < 30% but status "completed"
- Agent C: WebSearch contractors on largest projects (>$1B ARS)

**Analyze (Qwen):**
- Budget overrun/underrun pattern analysis
- Geographic distribution of spending per capita
- Contractor concentration by fiscal year

**Tier:** silver

### Wave 3 — Vialidad Nacional + ENOHSA

**Purpose:** Sector-specific infrastructure data — roads and water.

**Ingest:**
- Fetch Vialidad Nacional open data catalogs → `PublicWork` nodes with `sector: 'road'`
  - OCDS format where available, CSV otherwise
  - Link to existing `Contractor` nodes via CUIT
- Fetch ENOHSA water/sanitation CSVs → `PublicWork` nodes with `sector: 'water'`
  - Fields: work type (drinking water network, sewage, treatment plant), province, status

**ETL module:** `webapp/src/etl/obras-publicas/vialidad/` and `webapp/src/etl/obras-publicas/enohsa/`
**Scripts:** `run-etl-vialidad.ts`, `run-etl-enohsa.ts`

**Verify:**
- Agent A: WebSearch top road contractors
- Agent B: Cross-check ENOHSA contractors against Wave 1 SIPRO registry

**Analyze (Qwen):**
- Road contract patterns (seasonal, geographic, political cycle)
- Water infrastructure coverage gaps vs spending

**Tier:** silver

### Wave 4 — CABA BAC_OCDS + Mendoza OCDS

**Purpose:** Provincial procurement lifecycle data in OCDS format.

**Ingest:**
- Clone `datosgcba/BAC_OCDS` from GitHub → parse OCDS JSON releases
  - 23,298 tenders, 13,835 awards/contracts
  - OCID prefix: `ocds-bulbcf`
  - Coverage: Jan-Jun 2022 (historical, no longer updated)
- Fetch Mendoza OCDS JSON files (3 periods):
  - `2020-2023: 01/2020_20231021_v1_release.json` (125MB)
  - `2023-2025: 02/20250810_release.json` (87MB)
  - `2025-2026: 03/20260104_release.json` (11MB)
  - 22,851 tenders, 47,304 awards/contracts, 61,243 parties
  - OCID prefix: `ocds-ppv9mm`

**ETL module:** `webapp/src/etl/obras-publicas/ocds-provincial/`
**Script:** `run-etl-ocds-provincial.ts`

**Large file handling:** Mendoza OCDS files (125MB, 87MB) must be parsed with a streaming JSON parser (e.g., `jsonstream` or line-by-line JSONL processing). Do NOT load entire files into memory with `JSON.parse()`.

**OCDS → Neo4j mapping:**
- `release.tender` → `PublicWork` + `ObrasProcedure`
- `release.awards` → `PublicContract` + `AWARDED_TO`
- `release.parties` (role: supplier) → `Contractor` (MERGE on CUIT)
- `release.contracts` → `PublicContract` (MERGE on contract ID)

**Verify:**
- Agent A: Spot-check 20 provincial contractors against national SIPRO
- Agent B: Detect contractors active in both CABA and Mendoza

**Analyze (Qwen):**
- Provincial vs national contractor overlap
- Price differences for similar works across jurisdictions

**Tier:** silver

### Wave 5 — World Bank + IDB + Debarment Lists

**Purpose:** Multilateral-funded projects and sanctioned entities.

**Ingest:**
- Fetch WB Major Contract Awards via Socrata API:
  - `GET https://financesone.worldbank.org/resource/kdui-wcs3.json?$where=borrower_country='Argentina'`
  - → `MultilateralProject` + `PublicContract` + `Contractor` nodes
- Fetch WB Borrower Procurement Reports (Excel, FY2000-2019):
  - → Enrich `MultilateralProject` with detailed contract data
- Fetch WB Debarment List (Excel):
  - Filter country = Argentina or match against existing Contractor names
  - → `DebarredEntity` nodes + `DEBARRED_FROM` rels
- Fetch IDB Sanctions List:
  - → `DebarredEntity` nodes (MERGE on name)
- Fetch IDB Invest projects (XML, filter Argentina):
  - → `MultilateralProject` nodes with `funder: 'idb'`

**ETL module:** `webapp/src/etl/obras-publicas/multilateral/`
**Script:** `run-etl-multilateral.ts`

**Verify:**
- Agent A: Match debarred entity names against existing `Contractor` nodes (fuzzy)
- Agent B: WebSearch debarred Argentine firms for current status
- Agent C: Cross-check WB contractors against SIPRO by name

**Analyze (Qwen):**
- Debarred firms still active in national procurement?
- Sector concentration of multilateral funding
- Contractor overlap between WB/IDB and national contracts

**Tier:** silver (ingest at silver; fast-track to gold in Wave 11 due to audit-grade provenance)

### Wave 6 — Odebrecht/FCPA + Cuadernos Seed

**Purpose:** Investigative intelligence from court records and journalism.

**Ingest:**
- Manually curate seed JSONs:
  - `research/odebrecht-argentina.json`:
    - Companies: Odebrecht S.A., Techint, Electroingeniería, CPC, etc.
    - Intermediaries: named in DOJ plea agreement
    - Projects: gas pipelines, soterramiento Sarmiento, Atucha II, etc.
    - Amounts: $35M total bribes, per-project breakdown where available
  - `research/cuadernos.json`:
    - Companies: Electroingeniería, Esuco, Austral Construcciones, CPC, etc.
    - Politicians: named recipients
    - Amounts: cash deliveries documented in notebooks
    - Dates: 2005-2015 (notebook coverage period)
  - `research/siemens-fcpa.json`:
    - The DNI contract bribery scheme ($100M+)
    - Intermediaries and shell companies
- Send each seed JSON to Qwen for relationship extraction:
  - Prompt: extract (entity, relationship, entity) triples
  - Parse `reasoning_content` field for analysis
- Load extracted entities as `BriberyCase`, `Intermediary` nodes
- Create `CASE_INVOLVES`, `BRIBED_BY`, `INTERMEDIATED` rels

**ETL module:** `webapp/src/etl/obras-publicas/investigative-seed/`
**Script:** `run-etl-investigative-seed.ts`

**Verify:**
- Agent A: WebSearch each intermediary name for confirmation
- Agent B: WebSearch each company for current CUIT status
- Agent C: Cross-check Cuadernos companies against existing Contractor nodes

**Analyze (Qwen):**
- Map bribery network topology
- Identify companies that appear in both Odebrecht AND Cuadernos cases
- Detect intermediaries that bridge multiple schemes

**Tier:** bronze (promoted to silver after verification)

### Wave 7 — Cross-Reference + Flag Detection

**Purpose:** Full entity resolution across both investigations.

**Ingest:** None (analysis-only wave)

**Cross-reference process:**
1. **Tier 1 — CUIT matching** (confidence 0.95-1.0):
   - Match `Contractor` (obras-publicas) ↔ `Contractor|Company|Donor` (finanzas-politicas)
   - Match `Bid.bidder_cuit` ↔ `Contractor.cuit`
   - Match `Intermediary.cuit` ↔ `CompanyOfficer|Donor`
   - Create `SAME_ENTITY` relationships

2. **Tier 2 — DNI/CUIL matching** (confidence 0.9-0.95):
   - Extract DNI from person CUITs (prefix 20/23/24/27)
   - Match `Intermediary.dni` ↔ `GovernmentAppointment.dni|CompanyOfficer.document_number`

3. **Tier 3 — Fuzzy name matching** (confidence 0.6-0.8):
   - Normalized name match for unmatched entities
   - Levenshtein distance ≤ 2 fallback
   - Match `DebarredEntity.entity_name` ↔ `Contractor.name|Company.name`

**Flag detection queries:**
```cypher
// contractor_donor: contractor who also donated to campaigns
MATCH (c:Contractor)-[:SAME_ENTITY]-(d:Donor)
WHERE c.caso_slug = 'obras-publicas' OR EXISTS { (c)-[:CONTRACTED_FOR]->(:PublicWork) }
CREATE (f:InvestigationFlag {type: 'contractor_donor', ...})

// debarred_active: debarred entity still winning contracts
MATCH (de:DebarredEntity)-[:DEBARRED_SAME_AS]-(c:Contractor)-[:AWARDED_TO|CONTRACTED_FOR]->(pc)
WHERE de.to_date > date() OR de.to_date IS NULL
CREATE (f:InvestigationFlag {type: 'debarred_active', ...})

// cross_investigation: entity in both graphs
MATCH (n)-[:SAME_ENTITY]-(m)
WHERE n.caso_slug = 'obras-publicas' AND m.caso_slug IS NULL
CREATE (f:InvestigationFlag {type: 'cross_investigation', ...})

// odebrecht_linked: entity connected to Odebrecht bribery case
MATCH (bc:BriberyCase {name: 'odebrecht_argentina'})-[:CASE_INVOLVES]-(e)
MATCH (e)-[:SAME_ENTITY]-(c:Contractor)-[:CONTRACTED_FOR]->(pw:PublicWork)
CREATE (f:InvestigationFlag {type: 'odebrecht_linked', ...})
```

**Verify:**
- Agent A: WebSearch top 20 cross-investigation matches for confirmation
- Agent B: Validate all `SAME_ENTITY` links with confidence < 0.8

**Analyze (Qwen):**
- Summary of cross-investigation connections
- Rank entities by number of flags
- Identify the most connected bridge nodes

**Output:** Cross-reference report with match counts, flag counts, and key findings

### Wave 8 — Deep Graph Queries

**Purpose:** Network analysis and pattern discovery on the completed graph.

**Note:** Neo4j Community Edition does not include the GDS library. All queries use pure Cypher.

**Queries:**
```cypher
// Degree centrality (most connected nodes)
MATCH (n) WHERE n.caso_slug = 'obras-publicas'
WITH n, size((n)--()) AS degree
RETURN labels(n)[0] AS type, n.name AS name, degree
ORDER BY degree DESC LIMIT 50

// Bridge node detection (nodes connecting otherwise separate clusters)
// Approximation: nodes whose removal would disconnect the most pairs
MATCH (n)-[r]-(m)
WHERE n.caso_slug = 'obras-publicas'
WITH n, count(DISTINCT m) AS neighbors,
     size([(n)-[:SAME_ENTITY]-() | 1]) AS cross_links
RETURN labels(n)[0] AS type, n.name AS name, neighbors, cross_links
ORDER BY cross_links DESC, neighbors DESC LIMIT 50

// Contractor clusters by co-bidding on same procedures
MATCH (b1:Bid)-[:BID_ON]->(p:ObrasProcedure)<-[:BID_ON]-(b2:Bid)
MATCH (b1)-[:BIDDER]->(c1:Contractor), (b2)-[:BIDDER]->(c2:Contractor)
WHERE elementId(c1) < elementId(c2)
RETURN c1.name, c2.name, count(*) AS co_bids
ORDER BY co_bids DESC LIMIT 100

// Geographic concentration
MATCH (c:Contractor)-[:CONTRACTED_FOR]->(pw:PublicWork)
WITH c, pw.province AS province, count(*) AS works, sum(pw.monto) AS total
RETURN c.name, province, works, total
ORDER BY total DESC LIMIT 100

// Political cycle analysis
MATCH (pc:PublicContract)-[:AWARDED_TO]->(c:Contractor)
WITH c, substring(pc.fecha_adjudicacion, 0, 4) AS year, count(*) AS contracts, sum(pc.monto) AS total
RETURN c.name, year, contracts, total
ORDER BY c.name, year
```

**Analyze (Qwen):**
- Send query results for pattern analysis
- Identify: cartels (co-bidding clusters), geographic monopolies, political cycle spending spikes

**Output:** `research/network-analysis.json`

### Wave 9 — Neo4j Expansion

**Purpose:** Expand from bridge nodes to discover indirect connections.

**Process:**
1. Take top 50 bridge nodes from Wave 8
2. Run 2-hop neighborhood expansion queries
3. For each expansion, identify previously unknown connections:
   - Contractor → Company → Officer → Politician (indirect political link)
   - Contractor → DebarredEntity → MultilateralProject (international sanctions trail)
   - Intermediary → BriberyCase → PublicWork → Contractor (corruption chain)
4. WebSearch newly discovered entities for verification
5. Add verified discoveries as new nodes/rels

**Verify (parallel agents):**
- Agent A: WebSearch expansion-discovered persons
- Agent B: WebSearch expansion-discovered companies
- Agent C: Validate indirect connection chains (are they real or graph artifacts?)

**Analyze (Qwen):**
- Which expansion paths reveal the most interesting connections?
- Are there hidden intermediaries not in the seed data?
- Do any expansion chains connect to the Epstein investigation graph?

**Output:** `research/expansion-discoveries.json`

### Wave 10 — Discovery Synthesis

**Purpose:** Synthesize all findings into coherent investigative narratives.

**Process:**
1. Aggregate all flags from Wave 7
2. Aggregate all network analysis from Wave 8
3. Aggregate all expansion discoveries from Wave 9
4. Send to Qwen in structured batches:
   - Batch 1: "What corruption patterns does this data reveal?"
   - Batch 2: "Who are the key actors and what are their roles?"
   - Batch 3: "What are the money trails and how do they connect to political power?"
   - Batch 4: "What are the cross-investigation connections between obras-publicas and finanzas-politicas?"

**Analyze (Qwen):**
- Forensic synthesis of all data
- Identify the 3-5 most significant findings
- Generate investigative hypotheses for further verification

**Output:** `research/discovery-synthesis.json`

### Wave 11 — Consolidation + Dedup

**Purpose:** Final data quality pass before narrative generation.

**Process:**
1. Final dedup pass across all waves:
   - Exact name/slug duplicates
   - Levenshtein ≤ 2 near-duplicates
   - CUIT-based merges not caught in Wave 7
2. Merge duplicate entities: transfer relationships to canonical node, delete duplicate
3. Normalize confidence scores:
   - Verified entities: promote to silver
   - Entities with 3+ independent sources: promote to gold
4. Clean garbage nodes:
   - Empty names, single-character names
   - Test/development artifacts
   - Orphan nodes with no relationships
5. Final graph stats snapshot:
   - Total nodes by label
   - Total relationships by type
   - Tier breakdown
   - Flag counts

**Output:** Consolidation report with before/after stats

### Wave 12 — Investigation Content

**Purpose:** Generate the investigation-data.ts for the caso UI.

**Generate:**
```typescript
// webapp/src/lib/caso-obras-publicas/investigation-data.ts

export const IMPACT_STATS: readonly ImpactStat[] = [
  // Generated from graph stats
]

export const FACTCHECK_ITEMS: readonly FactcheckItem[] = [
  // Bilingual ES/EN factchecks from verified findings
  // Status: confirmed | alleged | unconfirmed
]

export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  // From contract dates, bribery dates, debarment dates
  // Categories: political | financial | legal | corporate | infrastructure
]

export const ACTORS: readonly Actor[] = [
  // Key contractors, politicians, intermediaries
  // With role, description, datasets count, source_url
]

export const MONEY_FLOWS: readonly MoneyFlow[] = [
  // Contract amounts, bribe amounts, budget allocations
  // With from/to labels, amounts in ARS and USD
]
```

**Analyze (Qwen):**
- Generate factcheck claims from verified findings
- Write bilingual descriptions for actors
- Draft timeline event descriptions

### Wave 13 — Caso UI Pages

**Purpose:** Build the web interface for the investigation.

**Create:**
```
webapp/src/app/caso/obras-publicas/
  ├── page.tsx              (landing page)
  ├── layout.tsx            (navigation layout)
  ├── resumen/page.tsx      (overview with impact stats)
  ├── cronologia/page.tsx   (timeline visualization)
  ├── conexiones/page.tsx   (graph visualization)
  ├── dinero/page.tsx       (money flow visualization)
  ├── investigacion/page.tsx (narrative + factchecks)
  └── mapa/page.tsx         (geographic map of works — NEW, unique to this investigation)
```

**API routes:**
```
webapp/src/app/api/caso/obras-publicas/
  ├── graph/route.ts        (graph data for conexiones page)
  ├── money-trails/route.ts (money flow data)
  └── map/route.ts          (geographic data for mapa page)
```

**Unique feature:** Geographic map page (`mapa/`) showing public works locations with contractor overlays, color-coded by flag type. This leverages the lat/lon data from MapaInversiones and CONTRAT.AR ubicación geográfica.

### Wave 14 — Article + Dossier

**Purpose:** Generate publication-ready outputs.

**Generate:**
1. `DOSSIER-OBRAS-PUBLICAS.md` — standalone longform article
   - Executive summary
   - Methodology (data sources, entity resolution, verification)
   - Key findings (top 5-10, with evidence chains)
   - Entity profiles (contractors, politicians, intermediaries)
   - Money trails (contract amounts, bribe amounts, budget gaps)
   - Cross-investigation connections (obras-publicas ↔ finanzas-politicas)
   - Geographic analysis (maps, concentration)
   - Timeline (key dates, contracts, scandals, court proceedings)
   - Sources and data dictionary

2. Update caso UI pages with final polished content

3. Final commit with complete investigation package

**Analyze (Qwen):**
- Draft each section of the dossier
- Editorial refinement pass
- Fact-check all claims against graph data

---

## ETL Directory Structure

```
webapp/src/etl/obras-publicas/
├── contratar/              # Wave 1: CONTRAT.AR CSVs
│   ├── types.ts
│   ├── fetcher.ts
│   ├── transformer.ts
│   ├── loader.ts
│   └── index.ts
├── sipro/                  # Wave 1: COMPR.AR supplier registry
│   ├── types.ts
│   ├── fetcher.ts
│   ├── transformer.ts
│   ├── loader.ts
│   └── index.ts
├── mapa-inversiones/       # Wave 2: MapaInversiones
│   ├── types.ts
│   ├── fetcher.ts
│   ├── transformer.ts
│   ├── loader.ts
│   └── index.ts
├── presupuesto/            # Wave 2: Presupuesto Abierto API
│   ├── types.ts
│   ├── fetcher.ts
│   ├── transformer.ts
│   ├── loader.ts
│   └── index.ts
├── vialidad/               # Wave 3: Vialidad Nacional
│   └── ...
├── enohsa/                 # Wave 3: ENOHSA water/sanitation
│   └── ...
├── ocds-provincial/        # Wave 4: CABA + Mendoza OCDS
│   ├── types.ts            # Shared OCDS types
│   ├── fetcher.ts          # Handles both sources
│   ├── transformer.ts      # OCDS → Neo4j mapping
│   ├── loader.ts
│   └── index.ts
├── multilateral/           # Wave 5: World Bank + IDB
│   └── ...
├── investigative-seed/     # Wave 6: Odebrecht + Cuadernos
│   ├── types.ts
│   ├── loader.ts
│   └── index.ts            # No fetcher (manual seed JSONs)
├── cross-reference/        # Wave 7: Cross-ref engine (extends existing)
│   └── obras-publicas-matchers.ts
└── research/               # Waves 6, 8-10: Seed data + analysis outputs
    ├── odebrecht-argentina.json       # Wave 6 seed
    ├── cuadernos.json                 # Wave 6 seed
    ├── siemens-fcpa.json              # Wave 6 seed
    ├── network-analysis.json          # Wave 8 output
    ├── expansion-discoveries.json     # Wave 9 output
    └── discovery-synthesis.json       # Wave 10 output
```

## NPM Scripts

```json
{
  "etl:contratar": "npx tsx scripts/run-etl-contratar.ts",
  "etl:sipro": "npx tsx scripts/run-etl-sipro.ts",
  "etl:mapa-inversiones": "npx tsx scripts/run-etl-mapa-inversiones.ts",
  "etl:presupuesto": "npx tsx scripts/run-etl-presupuesto.ts",
  "etl:vialidad": "npx tsx scripts/run-etl-vialidad.ts",
  "etl:enohsa": "npx tsx scripts/run-etl-enohsa.ts",
  "etl:ocds-provincial": "npx tsx scripts/run-etl-ocds-provincial.ts",
  "etl:multilateral": "npx tsx scripts/run-etl-multilateral.ts",
  "etl:investigative-seed": "npx tsx scripts/run-etl-investigative-seed.ts",
  "obras:cross-ref": "npx tsx scripts/run-obras-cross-reference.ts",
  "obras:wave": "npx tsx scripts/run-obras-wave.ts"
}
```

## Cross-Reference Bridge

The CUIT identifier is the primary bridge between investigations:

```
obras-publicas graph                     finanzas-politicas graph
─────────────────────                    ────────────────────────
ObrasProcedure                           Politician
  ↑ PROCEDURE_FOR                           ↑ MAYBE_SAME_AS
PublicWork                               Contractor (CUIT)
  ↑ CONTRACTED_FOR                          ↓ SAME_ENTITY
Contractor (CUIT) ───SAME_ENTITY────→  Company (CUIT)
  ↑ AWARDED_TO                              ↓ OFFICER_OF_COMPANY
PublicContract                           CompanyOfficer
  ↑ BIDDER                                  ↓ MAYBE_SAME_AS
Bid ──BIDDER──→ Contractor (resolved)    Donor (CUIT)
                                             ↓ SAME_ENTITY
DebarredEntity ──DEBARRED_SAME_AS──→    Contractor
                                             ↓ SAME_ENTITY
Intermediary (cuit) ──SAME_ENTITY──→    OffshoreOfficer (ICIJ)
  ↑ INTERMEDIATED
BriberyCase ──CASE_INVOLVES──→          PublicWork|Contractor
```

Note: `Bid.bidder_cuit` resolves to a `Contractor` node via MERGE during ingestion. Cross-reference matching happens on `Contractor` nodes, not on `Bid` nodes directly. This keeps SAME_ENTITY semantically correct (linking entities, not transactions).

## Success Criteria

1. **Wave 1-6:** All data sources ingested with <1% error rate per batch
2. **Wave 7:** Cross-reference produces >1,000 SAME_ENTITY matches between investigations
3. **Wave 8-10:** At least 5 significant findings surfaced by analysis
4. **Wave 11:** Final graph has <0.5% duplicate entities
5. **Wave 12-13:** Caso UI is fully functional with bilingual content
6. **Wave 14:** Dossier published with all findings, evidence chains, and sources cited
