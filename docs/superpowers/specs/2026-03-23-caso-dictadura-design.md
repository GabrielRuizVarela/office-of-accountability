# caso-dictadura — Argentine Military Dictatorship Investigation

**Date:** 2026-03-23
**Status:** Draft
**Case slug:** `caso-dictadura`

## Problem

The Argentine military dictatorship (1976-1983) produced one of the most documented state terror apparatuses in history. Over 30,000 persons were disappeared, 762+ clandestine detention centers operated, and decades of judicial proceedings have produced 361+ sentences. The data exists across dozens of government portals, NGO archives, declassified intelligence collections, and academic datasets — but no unified graph connects victims, perpetrators, detention centers, military units, judicial outcomes, corporate complicity, and transnational intelligence coordination.

This investigation builds a full historical reconstruction: who did what, to whom, where, when, and under whose orders.

## Ontology

### Node Labels

All nodes prefixed with `Dictadura` to avoid collision with existing case data.

```
DictaduraPersona         — Any individual (subtyped via category property)
  categories: victima, represor, imputado, complice_civil, testigo, juez, diplomatico, niño_apropiado

DictaduraCCD             — Centro Clandestino de Detención
DictaduraUnidadMilitar   — Military unit, police force, intelligence agency
DictaduraLugar           — Geographic location (city, province, country, address)
DictaduraEvento          — Dated occurrence (operation, arrest, transfer, meeting)
DictaduraCausa           — Judicial proceeding (criminal case)
DictaduraSentencia       — Court verdict with outcome
DictaduraTribunal        — Court that issued a sentence
DictaduraDocumento       — Any source document (cable, testimony, ruling, report)
DictaduraAgencia         — Foreign intelligence or diplomatic agency
DictaduraOrganizacion    — Institution (DDHH org, company, political party, junta)
DictaduraOperacion       — Named operation (Plan Cóndor, Operativo Independencia, etc.)
DictaduraActa            — Junta meeting minute record
DictaduraArchivo         — Archival collection or fond (from Memoria Abierta, ANM, etc.)
```

### Relationship Types

```
# Victim relationships
DETENIDO_EN              — Persona→CCD (date, witnesses)
SECUESTRADO_EN           — Persona→Lugar (date)
TRASLADADO_A             — Persona→CCD (from CCD, date)
ASESINADO_EN             — Persona→Lugar (date, circumstances)
NACIDO_EN                — Persona→Lugar

# CCD relationships
OPERADO_POR              — CCD→UnidadMilitar
UBICADO_EN               — CCD→Lugar (coordinates)
DEPENDIA_DE              — UnidadMilitar→UnidadMilitar (chain of command)

# Judicial relationships
ACUSADO_EN               — Persona→Causa (role, charges)
VICTIMA_EN_CAUSA         — Persona→Causa
JUZGADO_POR              — Causa→Tribunal
CONDENADO_A              — Persona→Sentencia (years, verdict)
ABSUELTO_EN              — Persona→Sentencia

# Document/intelligence relationships
EMITIDO_POR              — Documento→Agencia
MENCIONA                 — Documento→Persona
DESCRIBE_EVENTO          — Documento→Evento
REFERENTE_A              — Documento→Organizacion

# Testimony relationships
TESTIFICA_SOBRE          — Persona→Persona (testigo→victima or represor)
DECLARA_EN               — Persona→Documento (testimony)

# Corporate complicity
EMPLEADO_EN              — Persona→Organizacion (during dictatorship period)
COLABORO_CON             — Organizacion→CCD
ENTREGO_A                — Organizacion→Persona (handed over employee to military)

# Appropriated children
MADRE_DE                 — Persona→Persona
PADRE_DE                 — Persona→Persona
APROPIADO_POR            — Persona(niño)→Persona(apropiador)
RESTITUIDO_EN            — Persona(niño)→Evento (year, method)

# Archival
PRESERVADO_POR           — Documento→Archivo (archival provenance)

# Transnational
COORDINO_CON             — Agencia→Agencia (intelligence sharing)
COMPARTIO_INTELIGENCIA   — Agencia→UnidadMilitar
DECIDIO_EN_ACTA          — Acta→Evento (junta decision→operation)

# Organization/command
PERTENECE_A              — Persona→UnidadMilitar (rank, period)
COMANDO                  — Persona→UnidadMilitar (as commander)
MIEMBRO_DE               — Persona→Organizacion
```

### Key Properties (all nodes)

```typescript
interface DictaduraNodeBase {
  id: string                    // UUID
  caso_slug: 'caso-dictadura'
  name: string
  slug: string                  // URL-safe
  ingestion_wave: number        // 0=seed, 1-14
  confidence_tier: 'gold' | 'silver' | 'bronze'
  source: string                // provenance
  source_url?: string
  created_at: string            // ISO date
  updated_at: string
}
```

### Persona-specific Properties

```typescript
interface DictaduraPersona extends DictaduraNodeBase {
  category: 'victima' | 'represor' | 'imputado' | 'complice_civil' | 'testigo' | 'juez' | 'diplomatico' | 'niño_apropiado'
  ruvte_id?: string             // id_unico_ruvte
  dni?: string                  // national ID
  birth_year?: string
  birth_province?: string
  birth_country?: string
  nationality?: string
  age_at_event?: string
  pregnancy?: string            // pregnancy status at detention
  detention_date?: string
  detention_location?: string
  death_date?: string
  death_location?: string
  photo_available?: boolean
  rank?: string                 // military rank for represores
  unit?: string                 // military unit
  employer?: string             // for civilian victims
}
```

### CCD-specific Properties

```typescript
interface DictaduraCCD extends DictaduraNodeBase {
  ruvte_ccd_id?: number         // from presentes dataset
  aliases?: string[]            // alternative names
  address?: string
  lat?: number
  lon?: number
  province?: string
  municipality?: string
  military_branch?: string      // EJÉRCITO, ARMADA, PFA, etc.
  property_ownership?: string   // from presentes
  is_memory_space?: boolean     // converted to memorial site
  description?: string          // narrative
  operating_period?: string     // e.g. "1976-1978"
}
```

## Zod Validation Schemas

`webapp/src/lib/caso-dictadura/types.ts` must define Zod schemas for runtime validation during ingestion. At minimum:

```typescript
import { z } from 'zod/v4'

export const dictaduraPersonaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string(),
  category: z.enum(['victima', 'represor', 'imputado', 'complice_civil', 'testigo', 'juez', 'diplomatico', 'niño_apropiado']),
  caso_slug: z.literal('caso-dictadura'),
  confidence_tier: z.enum(['gold', 'silver', 'bronze']),
  ingestion_wave: z.number().int(),
  source: z.string(),
  ruvte_id: z.string().optional(),
  dni: z.string().optional(),
  detention_date: z.string().optional(),
  detention_location: z.string().optional(),
  // ... remaining fields
})

export const dictaduraCCDSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string(),
  caso_slug: z.literal('caso-dictadura'),
  lat: z.number().optional(),
  lon: z.number().optional(),
  military_branch: z.string().optional(),
  province: z.string().optional(),
  // ... remaining fields
})

export const dictaduraCausaSchema = z.object({ /* ... */ })
export const dictaduraDocumentoSchema = z.object({ /* ... */ })
export const dictaduraSentenciaSchema = z.object({ /* ... */ })
```

All ingestion scripts must validate parsed rows through these schemas before writing to Neo4j.

## Query Functions

`webapp/src/lib/caso-dictadura/queries.ts` must implement:

- `getInvestigationGraph(tier?)` — Overview graph for caso page (filtered by confidence tier)
- `getTimeline(startYear?, endYear?)` — Events ordered chronologically
- `getVictimBySlug(slug)` — Full victim profile with CCDs, causa, testimonies
- `getPerpetratorBySlug(slug)` — Perpetrator profile with causas, sentencias, units
- `getCCDBySlug(slug)` — CCD detail with victims, military unit, coordinates
- `getCCDNetwork()` — All CCDs with coordinates for map visualization
- `getCausaBySlug(slug)` — Case detail with accused, victims, tribunal, sentencia
- `getChainOfCommand(unitSlug)` — Traverse DEPENDIA_DE hierarchy
- `searchPersonas(query, category?)` — Full-text search filtered by category
- `getActors(category?, tier?)` — List persons by category with pagination
- `getDocuments(source?)` — List documents filtered by agency/source
- `getDisappearanceRoute(personSlug)` — SECUESTRADO_EN→DETENIDO_EN→TRASLADADO_A chain
- `getProvincialStats()` — Aggregate counts by province for heatmap

All queries use parameterized Cypher with `neo4j.int()` for LIMIT values.

## Cross-Reference Engine Integration

Dictadura entities must integrate with the platform-level cross-reference engine at `webapp/src/etl/cross-reference/`. Specifically:

- **DNI matching:** `DictaduraPersona` nodes with `dni` property can be matched against existing `GovernmentAppointment` (post-dictatorship careers), `Donor`, and `CompanyOfficer` nodes. This reveals perpetrators who continued in government roles after 1983.
- **Name matching:** Fuzzy name matching against `Politician` nodes may surface perpetrators or collaborators who entered politics.
- **Company matching:** `DictaduraOrganizacion` nodes representing complicit companies can be matched against `Company` and `Contractor` nodes in the finanzas-politicas case.

Wave 8 (Entity Resolution) must register dictadura matchers in `webapp/src/etl/cross-reference/matchers.ts` following the existing pattern.

## Data Staging

All external data sources are downloaded to `_ingestion_data/dictadura/` before ingestion. Scripts expect pre-staged files (not runtime downloads) to ensure reproducibility and avoid dependency on external service availability. Each wave's README in its data directory documents:
- Download date
- Source URL
- SHA256 hash of downloaded file
- Any manual preprocessing applied

## Neo4j Schema

### Constraints

```cypher
CREATE CONSTRAINT dictadura_persona_id_unique IF NOT EXISTS
FOR (n:DictaduraPersona) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_ccd_id_unique IF NOT EXISTS
FOR (n:DictaduraCCD) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_unidad_id_unique IF NOT EXISTS
FOR (n:DictaduraUnidadMilitar) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_lugar_id_unique IF NOT EXISTS
FOR (n:DictaduraLugar) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_evento_id_unique IF NOT EXISTS
FOR (n:DictaduraEvento) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_causa_id_unique IF NOT EXISTS
FOR (n:DictaduraCausa) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_sentencia_id_unique IF NOT EXISTS
FOR (n:DictaduraSentencia) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_tribunal_id_unique IF NOT EXISTS
FOR (n:DictaduraTribunal) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_documento_id_unique IF NOT EXISTS
FOR (n:DictaduraDocumento) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_agencia_id_unique IF NOT EXISTS
FOR (n:DictaduraAgencia) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_organizacion_id_unique IF NOT EXISTS
FOR (n:DictaduraOrganizacion) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_operacion_id_unique IF NOT EXISTS
FOR (n:DictaduraOperacion) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_acta_id_unique IF NOT EXISTS
FOR (n:DictaduraActa) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT dictadura_archivo_id_unique IF NOT EXISTS
FOR (n:DictaduraArchivo) REQUIRE n.id IS UNIQUE;
```

### Indexes

```cypher
-- Full-text search
CREATE FULLTEXT INDEX dictadura_persona_name_fulltext IF NOT EXISTS
FOR (n:DictaduraPersona) ON EACH [n.name];

CREATE FULLTEXT INDEX dictadura_ccd_name_fulltext IF NOT EXISTS
FOR (n:DictaduraCCD) ON EACH [n.name];

CREATE FULLTEXT INDEX dictadura_documento_name_fulltext IF NOT EXISTS
FOR (n:DictaduraDocumento) ON EACH [n.name, n.summary];

CREATE FULLTEXT INDEX dictadura_organizacion_name_fulltext IF NOT EXISTS
FOR (n:DictaduraOrganizacion) ON EACH [n.name];

-- Range indexes for filtering
CREATE INDEX dictadura_persona_slug IF NOT EXISTS FOR (n:DictaduraPersona) ON (n.slug);
CREATE INDEX dictadura_persona_category IF NOT EXISTS FOR (n:DictaduraPersona) ON (n.category);
CREATE INDEX dictadura_persona_ruvte_id IF NOT EXISTS FOR (n:DictaduraPersona) ON (n.ruvte_id);
CREATE INDEX dictadura_persona_dni IF NOT EXISTS FOR (n:DictaduraPersona) ON (n.dni);
CREATE INDEX dictadura_ccd_slug IF NOT EXISTS FOR (n:DictaduraCCD) ON (n.slug);
CREATE INDEX dictadura_ccd_province IF NOT EXISTS FOR (n:DictaduraCCD) ON (n.province);
CREATE INDEX dictadura_evento_date IF NOT EXISTS FOR (n:DictaduraEvento) ON (n.date);
CREATE INDEX dictadura_evento_slug IF NOT EXISTS FOR (n:DictaduraEvento) ON (n.slug);
CREATE INDEX dictadura_causa_slug IF NOT EXISTS FOR (n:DictaduraCausa) ON (n.slug);
CREATE INDEX dictadura_documento_slug IF NOT EXISTS FOR (n:DictaduraDocumento) ON (n.slug);
CREATE INDEX dictadura_operacion_slug IF NOT EXISTS FOR (n:DictaduraOperacion) ON (n.slug);
CREATE INDEX dictadura_organizacion_slug IF NOT EXISTS FOR (n:DictaduraOrganizacion) ON (n.slug);
CREATE INDEX dictadura_unidad_slug IF NOT EXISTS FOR (n:DictaduraUnidadMilitar) ON (n.slug);
CREATE INDEX dictadura_agencia_slug IF NOT EXISTS FOR (n:DictaduraAgencia) ON (n.slug);
CREATE INDEX dictadura_tribunal_slug IF NOT EXISTS FOR (n:DictaduraTribunal) ON (n.slug);
CREATE INDEX dictadura_sentencia_slug IF NOT EXISTS FOR (n:DictaduraSentencia) ON (n.slug);
CREATE INDEX dictadura_acta_date IF NOT EXISTS FOR (n:DictaduraActa) ON (n.date);
CREATE INDEX dictadura_archivo_slug IF NOT EXISTS FOR (n:DictaduraArchivo) ON (n.slug);
CREATE INDEX dictadura_acta_date IF NOT EXISTS FOR (n:DictaduraActa) ON (n.date);
```

## Data Sources

### Tier 1: Structured CSV — Direct Ingest

| Source | URL | Records | Format |
|--------|-----|---------|--------|
| RUVTE victims | `https://datos.jus.gob.ar/dataset/registro-unificado-de-victimas-del-terrorismo-de-estado-ruvte` | 9,537 | CSV |
| RUVTE GitHub | `https://github.com/datos-justicia-argentina/Registro-Unificado-Victimas-Terrorismo-Estado-RUVTE-` | mirror | CSV |
| presentes CCDs | `https://raw.githubusercontent.com/DiegoKoz/presentes/master/extdata/centros_clandestinos_detencion.csv` | 762 | CSV |
| Ex CCDs PBA | `https://catalogo.datos.gba.gob.ar/dataset/ex-centros-clandestinos-de-detencion` | 130 | CSV+GeoJSON |
| Personas Detenidas PBA | `https://catalogo.datos.gba.gob.ar/dataset/personas-detenidas-desaparecidas-de-la-provincia-de-buenos-aires` | ~thousands | CSV |
| SNEEP prison census | `https://datos.jus.gob.ar/dataset/sneep` | 22 years | CSV (filter code 29) |
| Causas penales | `https://datos.jus.gob.ar/dataset/poderes-judiciales-causas-penales` | multi-year | CSV (ZIP) |
| Actas Junta Militar | `https://datos.gob.ar/dataset/defensa-inventario-serie-actas-reunion-junta-militar` | 281 | CSV |
| Archivos Defensa | `https://datos.gob.ar/dataset/defensa-documentacion-preservada-archivos-fuerzas-armadas` | multiple | CSV |

### Tier 2: Structured — Requires Processing

| Source | URL | Records | Format |
|--------|-----|---------|--------|
| Desclasificados | `https://desclasificados.org.ar` | 3,200+ | CSV export (23 fields) |
| Plan Cóndor victims | `https://plancondor.org/en/database-of-victims` | 805 | Web export (17 vars) |
| Nietos restituidos | `https://es.wikipedia.org/wiki/Anexo:Nietos_y_nietas_restituidos_por_Abuelas_de_Plaza_de_Mayo` | ~140 | HTML table scrape |
| Wikidata | `https://query.wikidata.org/` | partial | SPARQL |

### Tier 3: Semi-Structured — NLP/OCR Required

| Source | URL | Records | Format |
|--------|-----|---------|--------|
| Nunca Más full text | `http://www.desaparecidos.org/nuncamas/web/investig/articulo/nuncamas/nmas0001.htm` | chapters | HTML scrape |
| Memoria Abierta | `https://indice.memoriaabierta.org.ar/` | 28,000 | OAI-PMH (AtoM) |
| PCCH Dossier | `https://www.mpf.gob.ar/lesa/` | 361 sentences | PDF extraction |
| intel.gov raw docs | `https://www.intel.gov/argentina/records` | 7,035 | ZIP/PDF (48K pages) |
| ANM catalog | `https://catalogo.jus.gob.ar/` | 4,600+ | AtoM REST API |
| PCCH annual reports | `https://www.fiscales.gob.ar/lesa-humanidad/` | 2015-2025 | PDF |

### Bonus: R Package

The `presentes` R package (`https://cran.r-project.org/web/packages/presentes/`) wraps RUVTE data with extras: 5,362 victim aliases, 762 CCDs, Parque de la Memoria entries. Raw CSVs in `extdata/` usable without R.

## 14-Wave Pipeline

Every wave runs the full investigate-loop cycle:
**ingest → verify → dedup → analyze (Qwen) → promote → update docs → commit**

### PHASE A: Ingestion (Seed + Waves 1-7)

#### Seed: Curated Foundation (~250 nodes, gold tier)

Manual TypeScript seed script: `webapp/scripts/seed-caso-dictadura.ts`

**Personas (~80):**
- Junta I: Jorge R. Videla, Emilio E. Massera, Orlando R. Agosti
- Junta II: Roberto E. Viola, Armando Lambruschini, Omar D. R. Graffigna
- Junta III: Leopoldo F. Galtieri, Jorge I. Anaya, Basilio Lami Dozo
- Junta IV: Cristino Nicolaides, Rubén Franco, Augusto Hughes
- Key perpetrators: Alfredo Astiz, Miguel Etchecolatz, Luciano B. Menéndez, Antonio Bussi, Ramón Camps, Guillermo Suárez Mason, Carlos Guillermo Suárez Mason
- DDHH leaders: Estela de Carlotto, Hebe de Bonafini, Adolfo Pérez Esquivel, Emilio Mignone
- Key victims: Rodolfo Walsh, Azucena Villaflor, Héctor Oesterheld

**CCDs (~20):**
- ESMA, La Perla, Campo de Mayo, El Olimpo, Pozo de Banfield, Pozo de Quilmes, Club Atlético, Automotores Orletti, La Cacha, Garage Azopardo, El Vesubio, Mansión Seré, La Escuelita (Neuquén), La Escuelita (Bahía Blanca), El Campito, Comisaría 5ta La Plata, Destacamento de Inteligencia 121, Jefatura de Policía de Tucumán, La Ribera, El Atletico

**Unidades militares (~15):**
- I Cuerpo de Ejército, II Cuerpo, III Cuerpo, V Cuerpo
- ESMA (Armada), Batallón de Inteligencia 601, SIDE
- Policía Federal Argentina, Policía de la Provincia de Buenos Aires
- Grupo de Tareas 3.3.2

**Organizaciones (~20):**
- CONADEP, Abuelas de Plaza de Mayo, Madres de Plaza de Mayo, CELS, Memoria Abierta
- Junta Militar, Ejército Argentino, Armada Argentina, Fuerza Aérea Argentina
- CIA, FBI, U.S. Department of State, DINA (Chile), SIE (Bolivia)

**Eventos (~15):**
- Golpe de Estado (24 Mar 1976), Noche de los Lápices (16 Sep 1976)
- Juicio a las Juntas (1985), Leyes de Punto Final / Obediencia Debida
- Visita CIDH (Sep 1979), Mundial 78, Guerra de Malvinas
- Anulación leyes de impunidad (2005)

**Causas (~10):**
- Causa 13 (Juicio a las Juntas), Causa ESMA, Causa La Perla
- Causa Plan Cóndor, Causa Automotores Orletti

**Operaciones (~5):**
- Plan Cóndor, Operativo Independencia, Proceso de Reorganización Nacional

#### Wave 1: RUVTE Victims (~10K nodes)

**Source:** RUVTE CSV from datos.jus.gob.ar (8,753 + 784 sin denuncia formal)

**Script:** `webapp/scripts/ingest-dictadura-wave-1.ts`

**Process:**
1. Download both CSVs from datos.jus.gob.ar
2. Parse CSV, normalize names (accent-strip, lowercase, whitespace-collapse)
3. Create `DictaduraPersona` nodes with category `victima`
4. Map fields: `id_unico_ruvte`→`ruvte_id`, `apellido_paterno_nombres`→`name`, `documentos`→`dni` (extract from mixed field), `fecha_detencion_secuestro`→`detention_date`, `lugar_detencion_secuestro`→`detention_location`
5. Create `DictaduraLugar` nodes from unique detention locations and birth provinces
6. Create `SECUESTRADO_EN` and `NACIDO_EN` relationships
7. Dedup against seed personas (exact + fuzzy)
8. Write with `ingestion_wave: 1, confidence_tier: 'bronze', source: 'ruvte'`

**Investigate-loop:**
- Verify: Web-search top 50 victims with most data fields for biographical confirmation
- Dedup: Fuzzy match against seed, save conflicts to `_ingestion_data/dictadura-wave-1-conflicts.json`
- Analyze: Qwen analyzes detention location patterns, temporal distribution of disappearances
- Promote: Verified victims → silver
- Update: Stats in investigation-data.ts, narrative section on victim demographics

#### Wave 2: Centros Clandestinos (~800 nodes)

**Sources:**
- presentes CSV (762 CCDs, national, with coordinates)
- Ex CCDs PBA CSV (130 sites, Buenos Aires province, with military branch + narrative)
- Personas Detenidas PBA CSV (Buenos Aires victims, complements RUVTE)

**Script:** `webapp/scripts/ingest-dictadura-wave-2.ts`

**Process:**
1. Download presentes CSV from GitHub raw URL
2. Download Ex CCDs PBA CSV + GeoJSON from catalogo.datos.gba.gob.ar
3. Download Personas Detenidas PBA CSV
4. Create `DictaduraCCD` nodes from presentes (762), enriched with PBA fields where matching
5. Create `DictaduraLugar` nodes with coordinates
6. Create `DictaduraUnidadMilitar` nodes from `dependencia` field (Ex CCDs PBA)
7. Create `OPERADO_POR`, `UBICADO_EN`, `DEPENDIA_DE` relationships
8. **Cross-reference:** Match RUVTE `lugar_detencion_secuestro` strings to CCD names → create `DETENIDO_EN` relationships
9. Dedup CCDs between presentes and PBA datasets
10. Write with `ingestion_wave: 2, confidence_tier: 'silver', source: 'presentes+pba'`

**Investigate-loop:**
- Verify: Spot-check 30 CCD coordinates against Google Maps/OSM
- Dedup: Merge presentes ↔ PBA overlapping CCDs (130 PBA sites should be subset of 762 national)
- Analyze: Qwen identifies CCD clusters, provincial density patterns, operating period overlaps
- Promote: Government-sourced CCDs with coordinates → silver
- Update: Geographic chapter draft, CCD stats

#### Wave 3: Juicios y Sentencias (~3K nodes)

**Sources:**
- SNEEP census CSV filtered by delito code 29 (lesa humanidad)
- Causas penales CSV filtered for lesa humanidad
- PCCH annual stats PDFs (table extraction with pdfplumber)

**Script:** `webapp/scripts/ingest-dictadura-wave-3.ts`

**Process:**
1. Download SNEEP unified ZIP (2002-2024), filter rows where `delito1_id = 29`
2. Download Causas penales ZIPs, filter for lesa humanidad crime codes
3. Download latest PCCH Dossier PDF, extract sentence tables
4. Create `DictaduraPersona` with category `imputado` (promoted to `represor` only after sentencia confirms conviction)
5. Create `DictaduraCausa`, `DictaduraSentencia`, `DictaduraTribunal` nodes
6. Create `ACUSADO_EN`, `JUZGADO_POR`, `CONDENADO_A` relationships
7. **Cross-reference:** Match imputados to seed perpetrators; match causa victims to RUVTE nodes
8. Dedup perpetrators across SNEEP + causas + seed
9. Write with `ingestion_wave: 3, confidence_tier: 'silver', source: 'sneep+causas+pcch'`

**Investigate-loop:**
- Verify: Web-search key imputados for current status (convicted, fugitive, deceased)
- Dedup: Match perpetrators appearing in multiple cases
- Analyze: Qwen identifies serial perpetrators (multiple cases), sentencing patterns, impunity gaps
- Promote: Sentenced perpetrators with court records → silver
- Update: Justice chapter, impunity statistics

#### Wave 4: Desclasificados US Intelligence (~5K nodes)

**Source:** desclasificados.org.ar CSV export (3,200+ docs, 23 metadata fields)

**Script:** `webapp/scripts/ingest-dictadura-wave-4.ts`

**Process:**
1. Download CSV export from desclasificados.org.ar
2. Create `DictaduraDocumento` nodes from each row
3. Create `DictaduraAgencia` nodes (CIA, FBI, State Dept, DIA, NSC, etc.)
4. Create `EMITIDO_POR` relationships (doc→agency)
5. Extract person names from subject/keyword fields → match to existing graph
6. Create `MENCIONA` relationships where matches found
7. Extract event references → create or link `DictaduraEvento` nodes
8. Write with `ingestion_wave: 4, confidence_tier: 'bronze', source: 'desclasificados'`

**Investigate-loop:**
- Verify: Spot-check 30 document metadata entries against original PDFs
- Dedup: Merge persons mentioned in docs with existing RUVTE/seed nodes
- Analyze: Qwen analyzes document clusters by date/agency, identifies key intelligence relationships
- Promote: Docs with verified metadata → silver
- Update: Intelligence chapter, US involvement findings

#### Wave 5: Plan Cóndor + Nietos + Actas (~1K nodes)

**Sources:**
- plancondor.org victims database (805 victims, 17 variables)
- Wikipedia nietos table (~140 restituted grandchildren)
- Actas Junta Militar inventory CSV (281 meeting minutes)

**Script:** `webapp/scripts/ingest-dictadura-wave-5.ts`

**Process:**
1. Scrape/export plancondor.org database → parse 17 fields per victim
2. Scrape Wikipedia nietos table → parse names, parents, dates
3. Download Actas Junta CSV from datos.gob.ar
4. Create `DictaduraPersona` nodes for Cóndor victims (with cross-border transfer data)
5. Create `DictaduraPersona` (category `niño_apropiado`) + `APROPIADO_POR`, `RESTITUIDO_EN`, `MADRE_DE`/`PADRE_DE`
6. Create `DictaduraActa` nodes from Junta meeting inventory
7. Create `DictaduraOperacion` for Plan Cóndor if not in seed
8. Create `TRASLADADO_A` relationships for cross-border transfers
9. **Cross-reference:** Match Cóndor victims to RUVTE; match niño parents to victim nodes
10. Write with `ingestion_wave: 5, confidence_tier: 'bronze', source: 'plancondor+wikipedia+actas'`

**Investigate-loop:**
- Verify: Cross-check nietos against Abuelas.org.ar announcements; verify Cóndor victims against RUVTE
- Dedup: Match Cóndor victims appearing in both plancondor.org and RUVTE
- Analyze: Qwen maps cross-border transfer patterns, correlates Junta meeting dates with operations
- Promote: Nietos with confirmed restitution → silver; Cóndor victims matching RUVTE → silver
- Update: Transnational chapter, appropriated children section

#### Wave 6: Nunca Más + Memoria Abierta + Wikidata (~5K+ nodes)

**Sources:**
- desaparecidos.org HTML (Nunca Más full text, chapter by chapter)
- Memoria Abierta OAI-PMH catalog (28,000 archival records)
- Wikidata SPARQL (enforced disappearance + Argentina)

**Script:** `webapp/scripts/ingest-dictadura-wave-6.ts`

**Process:**
1. Scrape desaparecidos.org chapter HTML → extract testimony text
2. Harvest Memoria Abierta via OAI-PMH (`indice.memoriaabierta.org.ar/;oai`)
3. Query Wikidata SPARQL for Argentine enforced disappearance victims
4. **NLP (Qwen):** Extract entities from Nunca Más testimony text → persons, locations, events, CCDs
5. Create `DictaduraDocumento` (testimony), `DictaduraArchivo` nodes
6. Create `TESTIFICA_SOBRE`, `DECLARA_EN`, `PRESERVADO_POR` relationships
7. Match extracted entities to existing graph nodes
8. Write with `ingestion_wave: 6, confidence_tier: 'bronze', source: 'nuncamas+memoriaabierta+wikidata'`

**Investigate-loop:**
- Verify: Cross-check NLP-extracted entities against existing graph for accuracy
- Dedup: Heavy dedup pass — testimony names vs. RUVTE records
- Analyze: Qwen identifies new connections not in structured data, testimony patterns
- Promote: Testimony-verified connections → silver
- Update: Testimony chapter, new connections narrative

#### Wave 7: Deep Document Intelligence (~3K+ nodes)

**Sources:**
- PCCH Dossier de Sentencias PDFs (per-accused verdict details)
- intel.gov ZIP archives (48K pages, OCR)
- ANM AtoM catalog REST API (4,600+ docs)
- Archivos Defensa CSVs (Army/Navy/Air Force repertoires)

**Script:** `webapp/scripts/ingest-dictadura-wave-7.ts`

**Process:**
1. Extract PCCH Dossier tables with pdfplumber → per-accused verdict rows
2. Download intel.gov ZIPs by agency, OCR with Tesseract → extract text
3. Query ANM AtoM API at `catalogo.jus.gob.ar/api/informationobjects`
4. Download Archivos Defensa CSVs from datos.gob.ar
5. **NLP (Qwen):** Extract entities from OCR text and document metadata
6. Enrich existing nodes with new relationships from documents
7. Write with `ingestion_wave: 7, confidence_tier: 'bronze', source: 'pcch+intelgov+anm+defensa'`

**Investigate-loop:**
- Verify: Spot-check OCR extraction accuracy, validate PDF table parsing
- Dedup: Match document-extracted persons against all previous waves
- Analyze: Qwen identifies previously unknown connections from raw intelligence
- Promote: PDF-extracted data verified against known records → silver
- Update: Deep intelligence chapter, document index

### PHASE B: Consolidation & Discovery (Waves 8-14)

Each wave runs the full investigate-loop: **ingest → verify → dedup → analyze (Qwen) → promote → update docs → commit**

#### Wave 8: Entity Resolution

**Ingest:** Re-fetch updated RUVTE/SNEEP CSVs for any new records since Wave 1/3. Pull fresh Wikidata SPARQL for new matches.

**Verify/Dedup:** Build DNI/CUIT index across all nodes. Run fuzzy name matching across all 7 waves. Identify and merge canonical nodes for persons appearing in multiple datasets (e.g., a victim in RUVTE + testimony in Nunca Más + case in sentencias).

**Analyze (Qwen):** Score ambiguous matches. Flag false positives. Recommend merges for near-duplicates where automated matching is uncertain.

**Promote:** Cross-referenced nodes (confirmed in 2+ independent sources) → silver. Nodes confirmed in 3+ sources → gold candidate.

**Update:** Merge report with stats. Updated node/edge counts. Cross-reference methodology notes.

#### Wave 9: Chain of Command Reconstruction

**Ingest:** Query graph for all `DictaduraPersona` (category: represor) + `DictaduraUnidadMilitar`. Web-search for missing unit assignments, zone commanders, military career records not in existing datasets.

**Verify/Dedup:** Verify ranks and unit assignments against sentencias data. Confirm chain-of-command links with court testimony.

**Analyze (Qwen):** Reconstruct full hierarchy: soldier→unit→zone→corps→junta. Detect officers bridging multiple CCDs (high betweenness centrality). Identify command responsibility paths for un-sentenced officers.

**Promote:** Command relationships verified by court records → silver.

**Update:** Chain-of-command chapter in narrative. Military structure visualization data. Add findings to investigation-data.ts.

#### Wave 10: Disappearance Routes & Geographic Intelligence

**Ingest:** Query victim detention/transfer location sequences. Fetch military zone GeoJSON boundaries. Scrape mapa.poblaciones.org CCD layers for additional coordinates.

**Verify/Dedup:** Verify coordinates against OpenStreetMap. Dedup overlapping CCD entries from different sources with slightly different coordinates.

**Analyze (Qwen):** Detect temporal spikes (disappearances vs. Junta meeting dates). Cluster CCDs by proximity. Reconstruct transfer chains (detention→CCD₁→CCD₂→disappearance). Generate heatmaps by province/year.

**Promote:** Transfer routes confirmed by multiple testimonies → silver.

**Update:** Geographic chapter with route maps. Temporal analysis findings. Provincial breakdown statistics.

#### Wave 11: Corporate & Civilian Complicity

**Ingest:** Query graph for victim employer data from RUVTE/testimonies. Re-run existing ETLs (OpenCorporates, ICIJ offshore, comprar.gob.ar) filtered for dictadura-era entities. Scrape Mercedes-Benz, Ford, Acindar case documentation.

**Verify/Dedup:** Cross-ref company names with CCD testimony mentions. Verify employer-victim links against court records.

**Analyze (Qwen):** Analyze corporate complicity patterns. Build `EMPRESA→ENTREGO_A→MILITAR→DETENIDO_EN→CCD` paths. Identify civilian collaborators named in sentencias. Labor-repression intersection analysis.

**Promote:** Corporate connections established in court proceedings → silver.

**Update:** Corporate complicity chapter. Economic actors network visualization. Add corporate findings to investigation-data.ts.

#### Wave 12: Transnational Expansion (Plan Cóndor Deep Dive)

**Ingest:** Query graph for cross-border victims and intelligence relationships. Fetch Chilean Rettig/Valech commission datasets if accessible. Scrape NSArchive Electronic Briefing Books for new Cóndor docs. Pull FBI Vault Condor PDFs.

**Verify/Dedup:** Verify cross-border victim identities across national registries. Dedup against existing Cóndor nodes from Wave 5.

**Analyze (Qwen):** Map intelligence flows CIA↔SIDE↔DINA↔SIE↔OCOA. Diplomatic cable network analysis. Coordination timeline reconstruction. Identify Automotores Orletti as transnational hub.

**Promote:** Cross-border connections confirmed by multiple national sources → silver.

**Update:** Transnational chapter expanded. Plan Cóndor network visualization. International coordination findings.

#### Wave 13: Narrative & Article Generation

**Ingest:** Final re-scrape of all sources for updates. Fetch latest PCCH stats PDF for current conviction numbers. Query full graph for comprehensive statistics.

**Verify/Dedup:** Final verification pass on all gold/silver claims. Check for stale data. Validate all source URLs still accessible.

**Analyze (Qwen):** Generate chapter drafts from verified graph data:
1. El Aparato: military structure, chain of command, CCD network
2. Las Víctimas: demographics, detention patterns, disappearance routes
3. La Justicia: trials, sentences, impunity gaps, pending cases
4. Lo Internacional: Plan Cóndor, US intelligence, foreign complicity
5. La Complicidad Civil: corporate and civilian collaboration
6. Identidad Genética: appropriated children, restitutions, BNDG
7. Memoria y Verdad: CONADEP, testimony archives, memory sites

**Promote:** Final batch of well-sourced bronze → silver.

**Update:** Write `NARRATIVE-DICTADURA.md`. Write `investigation-data.ts` (bilingual EN/ES). Update caso page content. Generate overview statistics.

#### Wave 14: Quality Audit & Publication

**Ingest:** Check all source URLs still live. Re-download any CSVs that have been updated since initial ingest. Query graph for orphan nodes (no relationships).

**Verify/Dedup:** Full-graph dedup sweep. Validate all relationship provenance chains. Audit tier consistency (no gold nodes without verified sources).

**Analyze (Qwen):** Audit findings for internal consistency and contradictions. Flag gaps in the graph (known events/persons not yet connected). Generate source verification report. Confidence scoring for all major claims.

**Promote:** Final promotion: verified silver → gold for highest-confidence nodes. Clean up remaining bronze with insufficient evidence.

**Update:** Update `METHODOLOGY.md` with dictadura-specific verification notes. Final stats commit. Source verification report. Publication-ready state declaration.

## PDF & OCR Tooling

Waves 3 and 7 require PDF table extraction. Use TypeScript-native libraries to stay within the existing stack:

- **PDF table extraction:** `pdf-parse` or `pdfjs-dist` for text extraction from PCCH Dossier PDFs
- **Structured table parsing:** Post-process extracted text with regex patterns to reconstruct table rows (accused name, verdict, sentence length, tribunal)
- **OCR (Wave 7 only):** For scanned intel.gov documents, use `tesseract.js` (WebAssembly Tesseract port for Node.js) or shell out to system Tesseract via `execFile` (not `exec`) if higher quality is needed
- **Fallback:** If TypeScript PDF extraction proves insufficient for complex tables, invoke Python `pdfplumber` via `execFile` subprocess

## File Structure

```
webapp/
├── scripts/
│   ├── seed-caso-dictadura.ts
│   ├── ingest-dictadura-wave-1.ts
│   ├── ingest-dictadura-wave-2.ts
│   ├── ingest-dictadura-wave-3.ts
│   ├── ingest-dictadura-wave-4.ts
│   ├── ingest-dictadura-wave-5.ts
│   ├── ingest-dictadura-wave-6.ts
│   ├── ingest-dictadura-wave-7.ts
│   ├── consolidate-dictadura-wave-8.ts   (entity resolution)
│   ├── consolidate-dictadura-wave-9.ts   (chain of command)
│   ├── consolidate-dictadura-wave-10.ts  (geographic intelligence)
│   ├── consolidate-dictadura-wave-11.ts  (corporate complicity)
│   ├── consolidate-dictadura-wave-12.ts  (transnational / Plan Cóndor)
│   ├── consolidate-dictadura-wave-13.ts  (narrative & article generation)
│   └── consolidate-dictadura-wave-14.ts  (quality audit & publication)
├── src/
│   ├── lib/
│   │   └── caso-dictadura/
│   │       ├── queries.ts
│   │       ├── types.ts
│   │       ├── transform.ts
│   │       ├── investigation-data.ts
│   │       └── index.ts
│   ├── etl/
│   │   └── dictadura/
│   │       ├── ruvte/           (fetcher, transformer, loader, types)
│   │       ├── ccds/            (fetcher, transformer, loader, types)
│   │       ├── sneep-lesa/      (fetcher, transformer, loader, types)
│   │       ├── desclasificados/ (fetcher, transformer, loader, types)
│   │       ├── plan-condor/     (fetcher, transformer, loader, types)
│   │       ├── nietos/          (fetcher, transformer, loader, types)
│   │       ├── nunca-mas/       (fetcher, transformer, loader, types)
│   │       └── actas-junta/     (fetcher, transformer, loader, types)
│   └── app/
│       └── caso/
│           └── caso-dictadura/  (uses generic [slug] template)
├── _ingestion_data/
│   └── dictadura/
│       ├── ruvte/               (downloaded CSVs)
│       ├── ccds/                (presentes + PBA CSVs + GeoJSON)
│       ├── sneep/               (filtered SNEEP data)
│       ├── desclasificados/     (CSV export)
│       ├── plan-condor/         (scraped data)
│       ├── actas-junta/         (CSV)
│       └── wave-N-conflicts.json (per-wave dedup conflicts)
└── docs/
    └── investigations/
        └── NARRATIVE-DICTADURA.md
```

## Expected Graph Scale

| Phase | Cumulative Nodes | Cumulative Edges | Gold | Silver | Bronze |
|-------|-----------------|-----------------|------|--------|--------|
| Seed | ~250 | ~500 | 250 | 0 | 0 |
| Wave 1 | ~10K | ~15K | 250 | 0 | ~10K |
| Wave 2 | ~11K | ~20K | 250 | ~800 | ~10K |
| Wave 3 | ~14K | ~30K | 250 | ~3K | ~11K |
| Wave 4 | ~19K | ~40K | 250 | ~3K | ~16K |
| Wave 5 | ~20K | ~45K | 250 | ~4K | ~16K |
| Wave 6 | ~25K | ~55K | 250 | ~4K | ~21K |
| Wave 7 | ~28K | ~65K | 250 | ~5K | ~23K |
| Waves 8-14 | ~30K | ~80K | ~2K | ~20K | ~8K |

## pnpm Scripts

```json
{
  "ingest:dictadura:seed": "tsx scripts/seed-caso-dictadura.ts",
  "ingest:dictadura:wave1": "tsx scripts/ingest-dictadura-wave-1.ts",
  "ingest:dictadura:wave2": "tsx scripts/ingest-dictadura-wave-2.ts",
  "ingest:dictadura:wave3": "tsx scripts/ingest-dictadura-wave-3.ts",
  "ingest:dictadura:wave4": "tsx scripts/ingest-dictadura-wave-4.ts",
  "ingest:dictadura:wave5": "tsx scripts/ingest-dictadura-wave-5.ts",
  "ingest:dictadura:wave6": "tsx scripts/ingest-dictadura-wave-6.ts",
  "ingest:dictadura:wave7": "tsx scripts/ingest-dictadura-wave-7.ts",
  "consolidate:dictadura:wave8": "tsx scripts/consolidate-dictadura-wave-8.ts",
  "consolidate:dictadura:wave9": "tsx scripts/consolidate-dictadura-wave-9.ts",
  "consolidate:dictadura:wave10": "tsx scripts/consolidate-dictadura-wave-10.ts",
  "consolidate:dictadura:wave11": "tsx scripts/consolidate-dictadura-wave-11.ts",
  "consolidate:dictadura:wave12": "tsx scripts/consolidate-dictadura-wave-12.ts",
  "consolidate:dictadura:wave13": "tsx scripts/consolidate-dictadura-wave-13.ts",
  "consolidate:dictadura:wave14": "tsx scripts/consolidate-dictadura-wave-14.ts"
}
```

## Ethical Considerations

- **Victim dignity:** Persona nodes for victims include only publicly available information from official registries. No speculative information about manner of death beyond what RUVTE records.
- **Data gaps are structural:** The dictatorship destroyed records. The graph will contain structural gaps — these should be documented, not filled with speculation.
- **Testimony sensitivity:** Nunca Más testimonies contain graphic content. NLP extraction focuses on entity relationships, not graphic detail.
- **Living appropriated children:** Some restituted grandchildren may prefer privacy. Only include information from public judicial records and Abuelas announcements.
- **Perpetrator presumption of innocence:** For persons not yet convicted, mark as `category: 'imputado'` rather than `represor` until sentencia confirms.
- **Source transparency:** Every node and relationship includes provenance metadata. No information without attribution.
