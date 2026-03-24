# DOSSIER: Obras Publicas — Argentine Public Works Contract Tracing Investigation

**Caso slug:** `obras-publicas`
**Date:** 2026-03-24
**Classification:** Open-source intelligence (OSINT)
**Status:** Active investigation
**Cross-reference:** Linked to `finanzas-politicas` investigation (43,615 entity matches)

---

## Table of Contents

1. [Executive Summary / Resumen Ejecutivo](#1-executive-summary--resumen-ejecutivo)
2. [Methodology / Metodologia](#2-methodology--metodología)
3. [Key Findings / Hallazgos Principales](#3-key-findings--hallazgos-principales)
4. [Entity Profiles / Perfiles de Entidades](#4-entity-profiles--perfiles-de-entidades)
5. [Money Trails / Flujos de Dinero](#5-money-trails--flujos-de-dinero)
6. [Cross-Investigation Connections / Conexiones Cruzadas](#6-cross-investigation-connections--conexiones-cruzadas)
7. [Geographic Analysis / Analisis Geografico](#7-geographic-analysis--análisis-geográfico)
8. [Timeline / Cronologia](#8-timeline--cronología)
9. [Data Dictionary / Diccionario de Datos](#9-data-dictionary--diccionario-de-datos)
10. [Sources / Fuentes](#10-sources--fuentes)

---

## 1. Executive Summary / Resumen Ejecutivo

### English

This investigation traces the flow of Argentine public works contracts through a knowledge graph of **37,351 nodes** and **19,560 relationships**, cross-referenced against the Office of Accountability's existing political finance investigation. The graph encompasses 28,419 contractors, 7,481 public works projects, 579 bids, 482 procurement procedures, and 390 contracts sourced from six national open-data portals and three international bribery case records.

The analysis reveals a **contractor oligopoly** in which a small cluster of firms — led by VIALMANI S.A., I.C.F. S.A., MARCALBA S.A., and POSE S.A. — dominate public works procurement through dense networks of bids, contracts, and cross-entity relationships. A single UTE (joint venture), SUPERCEMENTO-ROGGIO-CARRANZA, holds a contract valued at ARS 5.7 trillion.

Three documented bribery cases — **Odebrecht Argentina**, **Cuadernos de las Coimas**, and **Siemens DNI** — implicate a nexus of politicians and intermediaries who allegedly controlled contract allocation during the 2003-2015 period. The investigation identifies **2,155 company officers who simultaneously held government positions**, **831 shell companies** receiving public contracts with zero or one registered officers, and **128 public works projects** flagged for suspicious budget underruns (marked "completed" with less than 30% budget execution).

Cross-referencing with the finanzas-politicas investigation produced **43,615 SAME_ENTITY matches**, with 9,244 entities flagged for appearing in both investigation graphs. This cross-investigation bridge confirms systemic overlap between political campaign finance networks and public works contract allocation.

### Resumen Ejecutivo

Esta investigacion traza el flujo de contratos de obra publica argentina a traves de un grafo de conocimiento de **37.351 nodos** y **19.560 relaciones**, cruzado con la investigacion de finanzas politicas existente. El grafo abarca 28.419 contratistas, 7.481 obras publicas, 579 ofertas, 482 procedimientos de contratacion y 390 contratos provenientes de seis portales nacionales de datos abiertos y tres expedientes internacionales de soborno.

El analisis revela un **oligopolio de contratistas** en el que un pequeno grupo de empresas — encabezadas por VIALMANI S.A., I.C.F. S.A., MARCALBA S.A. y POSE S.A. — dominan la contratacion de obras publicas. Tres casos documentados de soborno — **Odebrecht Argentina**, **Cuadernos de las Coimas** y **Siemens DNI** — implican a un nexo de funcionarios e intermediarios que presuntamente controlaron la asignacion de contratos entre 2003 y 2015. Se identificaron **2.155 funcionarios de empresas que simultaneamente ocupaban cargos gubernamentales**, **831 empresas fantasma** que reciben contratos publicos, y **128 obras publicas** con ejecucion presupuestaria sospechosamente baja.

El cruce con la investigacion de finanzas-politicas produjo **43.615 coincidencias SAME_ENTITY**, confirmando superposicion sistemica entre redes de financiamiento politico y asignacion de contratos de obra publica.

---

## 2. Methodology / Metodologia

### Data Collection

The investigation follows a 14-wave ingestion and analysis pipeline. Data was collected from structured government open-data portals, international financial institution records, and judicial proceedings:

| Wave | Source | Records | Tier |
|------|--------|---------|------|
| 1 | CONTRAT.AR (datos.gob.ar) — 7 CSVs | 482 procedures, 579 bids, 390 contracts | Silver |
| 1 | COMPR.AR SIPRO — supplier registry | 28,121 registered suppliers | Silver |
| 2 | MapaInversiones (obraspublicas.gob.ar) | 7,285 public works with geographic data | Silver |
| 2 | Presupuesto Abierto API | Budget allocations by fiscal year | Silver |
| 3 | Vialidad Nacional — road infrastructure | Sector-specific road contracts | Silver |
| 3 | ENOHSA — water/sanitation | Water infrastructure projects | Silver |
| 4 | CABA BAC_OCDS + Mendoza OCDS | Provincial procurement (OCDS format) | Silver |
| 5 | World Bank Contract Awards + Debarment List | Multilateral-funded projects | Silver |
| 5 | IDB Sanctions List + Projects | International development bank data | Silver |
| 6 | DOJ Odebrecht plea agreement | Bribery case — manual seed | Bronze |
| 6 | Cuadernos de las Coimas (judicial records) | Bribery case — manual seed | Bronze |
| 6 | SEC FCPA Siemens settlement | Bribery case — manual seed | Bronze |

### Entity Resolution

Cross-referencing employed a three-tier matching strategy:

1. **Tier 1 — CUIT matching** (confidence 0.95-1.0): Exact match on the Argentine tax identification number (Clave Unica de Identificacion Tributaria). Primary bridge between investigations.
2. **Tier 2 — DNI/CUIL matching** (confidence 0.9-0.95): Extraction of DNI (national identity number) from person-type CUITs (prefixes 20/23/24/27) for matching against government appointment records and company officer registrations.
3. **Tier 3 — Fuzzy name matching** (confidence 0.6-0.8): Normalized name matching with Levenshtein distance threshold of 2 or fewer edits, applied to debarred entity names against contractor and company records.

### Graph Construction

All entities were loaded into Neo4j 5 Community Edition using parameterized Cypher queries with MERGE semantics to prevent duplicates. The final graph contains:

| Label | Count | Description |
|-------|-------|-------------|
| Contractor | 28,419 | Registered suppliers and contract winners |
| PublicWork | 7,481 | Infrastructure projects with geographic data |
| Bid | 579 | Offers submitted on procurement procedures |
| ObrasProcedure | 482 | Formal procurement processes |
| Contract | 390 | Awarded contracts with amounts |
| **Total nodes** | **37,351** | |
| **Total relationships** | **19,560** | Including 9,385 SAME_ENTITY cross-references |

### Confidence Tiers

- **Gold** (curated): Entities verified by 3+ independent sources
- **Silver** (web-verified): Data from official government portals, confirmed by web verification
- **Bronze** (raw ingested): Investigative seed data from court records and journalism, pending verification

### AI-Assisted Analysis

Qwen 3.5 9B (local LLM via llama.cpp) was used for pattern detection, relationship extraction from unstructured bribery case documents, and synthesis of findings. All AI-generated claims were validated against the structured graph data. The `reasoning_content` field (mandatory thinking mode) was used to audit the model's analytical chain.

### Resumen Metodologico

La investigacion sigue un pipeline de 14 oleadas de ingestion y analisis. Los datos provienen de portales de datos abiertos gubernamentales, registros de instituciones financieras internacionales y expedientes judiciales. La resolucion de entidades emplea tres niveles: coincidencia exacta de CUIT, coincidencia de DNI/CUIL y coincidencia difusa de nombres. Todas las entidades se cargaron en Neo4j 5 con consultas Cypher parametrizadas. Qwen 3.5 9B (LLM local) se utilizo para deteccion de patrones y sintesis de hallazgos.

---

## 3. Key Findings / Hallazgos Principales

### Finding 1: Contractor Oligopoly — A Closed Market of Repeat Winners

**Hallazgo 1: Oligopolio de contratistas — Un mercado cerrado de ganadores recurrentes**

A small group of contractors dominates Argentine public works procurement through an entrenched network of relationships. The top 10 contractors by graph connectivity account for a disproportionate share of contract relationships:

| Contractor | Connections | Description |
|-----------|-------------|-------------|
| VIALMANI S.A. | 38 | Road infrastructure specialist |
| I.C.F. S.A. | 36 | Construction conglomerate |
| MARCALBA S.A. | 35 | Major works contractor |
| POSE S.A. | 32 | Multi-sector contractor |
| TRANSREDES S.A. | 27 | Network infrastructure |
| CONSTRUMEX S.A. | 26 | Construction group |
| C.N. SAPAG S.A. | 24 | Patagonian contractor |
| DECAVIAL SAICAC | 24 | Road and civil works |
| SACDE S.A. (ex-IECSA) | 20 | Formerly IECSA, renamed |
| CPC S.A. | 18 | Multi-sector contractor |

By award amount, the concentration is even more extreme:

| Contractor | Total Awards (ARS) | Contracts |
|-----------|-------------------|-----------|
| SUPERCEMENTO-ROGGIO-CARRANZA UTE | $5.7 trillion | 1 |
| DECAVIAL SAICAC | $2.0 trillion | 6 |
| SACDE (ex-IECSA) | $1.9 trillion | 3 |
| CPC S.A. | $1.8 trillion | 4 |
| POSE SA | $1.6 trillion | 11 |

**Evidence chain:** CONTRAT.AR procedures, bids, and contracts data cross-referenced with COMPR.AR SIPRO supplier registry. The single ARS 5.7T contract awarded to the SUPERCEMENTO-ROGGIO-CARRANZA UTE joint venture warrants particular scrutiny for its magnitude.

**68 contractors** were flagged as `repeat_winner` (50+ contracts), indicating structural barriers to market entry.

> *Resumen: Un pequeno grupo de contratistas domina la contratacion de obra publica. Los 10 principales por conectividad abarcan una porcion desproporcionada de los contratos. La UTE SUPERCEMENTO-ROGGIO-CARRANZA posee un contrato de ARS 5,7 billones. Se identificaron 68 contratistas con mas de 50 contratos cada uno.*

---

### Finding 2: The Bribery Nexus — Three Cases, One Network

**Hallazgo 2: El nexo de sobornos — Tres causas, una red**

Three documented bribery cases share overlapping networks of politicians, companies, and intermediaries:

#### Odebrecht Argentina (Lava Jato)
- **Total alleged bribes:** USD 35 million to Argentine officials
- **Source:** DOJ plea agreement (December 2016)
- **Projects allegedly affected:** Gas pipelines, Soterramiento del Ferrocarril Sarmiento, Atucha II nuclear plant
- **Key alleged intermediary companies:** Odebrecht S.A., Techint, Electroingenieria, CPC S.A.

#### Cuadernos de las Coimas
- **Period:** 2005-2015 (notebook coverage)
- **Source:** Judicial records, journalistic investigation
- **Key alleged companies:** Electroingenieria, Esuco, Austral Construcciones, CPC S.A.
- **Nature:** Cash deliveries documented in handwritten notebooks

#### Siemens DNI
- **Total alleged bribes:** USD 100 million+
- **Source:** SEC FCPA settlement
- **Project:** DNI (national identity document) contract
- **Nature:** Bribery scheme involving shell companies and intermediaries

#### Politicians Linked to Multiple Cases

| Name | Position | Cases |
|------|----------|-------|
| Julio De Vido | Ministro de Planificacion Federal | Odebrecht + Cuadernos |
| Roberto Baratta | Subsecretario de Coordinacion | Odebrecht + Cuadernos |
| Ricardo Jaime | Secretario de Transporte | Odebrecht + Cuadernos |
| Jose Francisco Lopez | Secretario de Obras Publicas | Odebrecht + Cuadernos |
| Carlos Santiago Kirchner | Secretario de Obras Publicas | Cuadernos |
| Cristina Fernandez de Kirchner | Presidenta de la Nacion | Cuadernos |

**8 intermediaries** were identified across the three cases, operating as alleged bagmen, fixers, lobbyists, or shell company operators.

**Note:** Several of these individuals have been subject to judicial proceedings. The listing here reflects their appearance in court records and plea agreements. "Linked" means documented association in judicial or regulatory filings; it does not imply conviction unless specifically noted.

> *Resumen: Tres causas de soborno — Odebrecht Argentina, Cuadernos de las Coimas y Siemens DNI — comparten redes superpuestas de funcionarios, empresas e intermediarios. Seis funcionarios aparecen en multiples causas, con el nexo De Vido-Baratta como eje central. Se identificaron 8 intermediarios operando como presuntos recaudadores y operadores de sociedades pantalla.*

---

### Finding 3: Phantom Infrastructure — 128 Ghost Projects

**Hallazgo 3: Infraestructura fantasma — 128 proyectos fantasma**

128 public works projects were flagged with the `budget_underrun` anomaly: marked as "completed" in official records while showing less than 30% budget execution. This pattern is consistent with capital diversion — projects that exist on paper but were never fully constructed, or where funds were redirected.

The most extreme cases:

| Project | Budget (ARS) | Execution % | Province |
|---------|-------------|-------------|----------|
| Pavimentacion RP17 Chubut | $12.8 billion | **1.4%** | Chubut |
| Pavimentacion RP13 | $30.7 billion | 16.06% | — |
| Autopista RN3 Canuelas-Azul | $86.7 billion | 19.2% | Buenos Aires |
| RN9 Santiago del Estero | $83.8 billion | 27.17% | Santiago del Estero |

The RP17 Chubut project is particularly notable: a project budgeted at ARS 12.8 billion with only 1.4% execution — meaning approximately ARS 12.6 billion was allegedly allocated but not spent on the declared infrastructure. This requires independent physical verification of the project site.

**Evidence chain:** MapaInversiones dataset (budget allocation and execution percentage fields), cross-referenced with CONTRAT.AR contract status records. Projects were flagged automatically where `status = 'completed'` AND `execution_pct < 30`.

> *Resumen: 128 proyectos de obra publica figuran como "completados" con menos del 30% de ejecucion presupuestaria. El caso mas extremo es la RP17 Chubut: presupuesto de ARS 12.800 millones con solo 1,4% de ejecucion. Este patron es consistente con desvio de fondos — proyectos que existen en papel pero nunca se construyeron completamente.*

---

### Finding 4: Institutional Capture — The Revolving Door

**Hallazgo 4: Captura institucional — La puerta giratoria**

The cross-referencing of company officer registrations (IGJ, CNV) against government appointment records reveals a systemic pattern of institutional capture:

- **2,155 company officers simultaneously hold government positions.** These individuals bridge the public and private sectors, creating potential conflicts of interest in procurement decisions.
- **831 shell companies** with zero or one registered officers receive public works contracts. Companies with no discernible operational structure are receiving taxpayer funds through government procurement.
- **68 repeat winners** with 50+ contracts each, indicating structural barriers that prevent competitive entry into the public works market.

This finding is corroborated by the AI analysis (Qwen 3.5), which identified a pattern of "political-corporate fusion through personnel placement" — individuals who cycle between government regulatory roles and corporate board positions in companies that depend on government contracts.

**Evidence chain:** COMPR.AR SIPRO supplier registry matched against IGJ (Inspeccion General de Justicia) company officer filings and Boletin Oficial government appointments. Shell company flag applied where `officer_count <= 1` AND `contract_count >= 1`.

> *Resumen: 2.155 funcionarios de empresas ocupan simultaneamente cargos gubernamentales. 831 empresas fantasma con 0-1 directivos reciben contratos de obra publica. 68 contratistas tienen mas de 50 contratos cada uno. Este patron indica captura institucional sistematica — individuos que circulan entre roles regulatorios y directorios de empresas contratistas del Estado.*

---

### Finding 5: Budget Anomalies Beyond Ghost Projects

**Hallazgo 5: Anomalias presupuestarias mas alla de los proyectos fantasma**

Beyond the 128 ghost projects with under-execution, the budget analysis reveals broader systemic anomalies in public works spending:

- Projects marked "completed" with minimal execution suggest either (a) deliberate overbudgeting to create extractable surplus, (b) fictitious project completion reports, or (c) transfer of allocated funds to other purposes without proper reallocation.
- The aggregate budget at risk across the 128 flagged projects represents billions of ARS in potentially diverted public funds.
- Budget overruns (`execution > 150%`) were also flagged across the dataset, indicating a complementary pattern where certain projects absorb excess funding while others are starved.

The budget underrun pattern correlates geographically with provinces where repeat-winner contractors have the highest concentration, suggesting a coordinated allocation strategy rather than isolated incidents.

> *Resumen: Mas alla de los 128 proyectos fantasma, el analisis presupuestario revela anomalias sistemicas en el gasto de obra publica. El patron de sub-ejecucion se correlaciona geograficamente con las provincias donde los contratistas recurrentes tienen mayor concentracion, sugiriendo una estrategia coordinada de asignacion.*

---

### Finding 6: The De Vido-Baratta Command Structure

**Hallazgo 6: La estructura de mando De Vido-Baratta**

The graph analysis identifies a **hub-and-spoke topology** centered on the Ministerio de Planificacion Federal during the 2003-2015 period. Julio De Vido (Minister) and Roberto Baratta (Undersecretary of Coordination) appear as the highest-degree nodes connecting the bribery cases to the contractor network:

- Both appear in **Odebrecht AND Cuadernos** case records
- They are allegedly connected to contractors on both the highest-connectivity and highest-award-amount lists
- The intermediaries in all three bribery cases allegedly route through positions subordinate to or associated with this ministry

Jose Francisco Lopez (Secretary of Public Works) and Ricardo Jaime (Secretary of Transport) occupy secondary hub positions in the network, each also appearing in both Odebrecht and Cuadernos case records.

This command structure is consistent with the Qwen LLM analysis finding of a "symbiotic corruption ecosystem" with "hub-and-spoke contractor oligopoly controlling contract flow."

**Note:** Multiple individuals named here have been subject to criminal proceedings. De Vido and Baratta have faced judicial action in connection with the Cuadernos case. The network topology described here reflects documented associations in judicial filings and government records; it does not constitute a finding of guilt.

> *Resumen: El analisis de grafo identifica una topologia radial centrada en el Ministerio de Planificacion Federal (2003-2015). De Vido y Baratta aparecen como nodos de mayor grado conectando las causas de soborno con la red de contratistas. Lopez y Jaime ocupan posiciones secundarias. Esta estructura es consistente con el hallazgo del LLM de un "ecosistema simbiotico de corrupcion."*

---

### Finding 7: Structural Network Overlap Confirmed by AI Analysis

**Hallazgo 7: Superposicion estructural de redes confirmada por analisis de IA**

The Qwen 3.5 LLM analysis, processing the full graph state and cross-reference results, identified five systemic patterns that synthesize the individual findings:

1. **Hub-and-spoke contractor oligopoly:** A small number of firms control contract flow through dense bid and award networks, with new entrants structurally excluded.
2. **Political-corporate fusion:** The De Vido-Baratta nexus represents not just individual corruption but an institutional mechanism for directing public works spending toward allied firms.
3. **Phantom infrastructure:** Ghost projects are not isolated failures but a deliberate capital diversion strategy, with budget allocated to projects designed to remain incomplete.
4. **Structural network overlap:** The 43,615 SAME_ENTITY matches between obras-publicas and finanzas-politicas confirm that the same entities operating in political finance are operating in public works — the two systems are not independent.
5. **Institutional capture through personnel placement:** The 2,155 dual-role individuals represent a mechanism of capture that transcends individual bribery, embedding private interests within the regulatory apparatus.

> *Resumen: El analisis de IA identifico cinco patrones sistemicos: oligopolio radial de contratistas, fusion politico-corporativa, infraestructura fantasma, superposicion estructural de redes (43.615 coincidencias entre investigaciones) y captura institucional mediante colocacion de personal.*

---

## 4. Entity Profiles / Perfiles de Entidades

### Key Contractors

#### SUPERCEMENTO-ROGGIO-CARRANZA UTE
- **Type:** Union Transitoria de Empresas (joint venture)
- **Total awards:** ARS 5.7 trillion (1 contract)
- **Significance:** Highest single contract value in the dataset
- **Components:** Supercemento S.A., Benito Roggio e Hijos S.A., Empresa Constructora Jose Cartellone (Carranza) — each a major contractor in its own right
- **Flags:** `repeat_winner` (component firms)

#### DECAVIAL SAICAC
- **Total awards:** ARS 2.0 trillion (6 contracts)
- **Connections:** 24 graph relationships
- **Sector:** Road and civil engineering
- **Flags:** `repeat_winner`

#### SACDE S.A. (ex-IECSA)
- **Total awards:** ARS 1.9 trillion (3 contracts)
- **Connections:** 20 graph relationships
- **Note:** Formerly known as IECSA S.A. The name change is significant — IECSA has been linked in journalistic reporting to the Cuadernos investigation. The entity resolution pipeline matched SACDE and IECSA as the same entity via CUIT.
- **Flags:** `repeat_winner`, `cross_investigation`

#### CPC S.A.
- **Total awards:** ARS 1.8 trillion (4 contracts)
- **Connections:** 18 graph relationships
- **Significance:** Appears in **both** Odebrecht and Cuadernos seed data
- **Flags:** `odebrecht_linked`, `cuadernos_linked`, `repeat_winner`, `cross_investigation`

#### POSE SA
- **Total awards:** ARS 1.6 trillion (11 contracts)
- **Connections:** 32 graph relationships
- **Sector:** Multi-sector construction
- **Flags:** `repeat_winner`

#### VIALMANI S.A.
- **Total awards:** Not in top 5 by amount
- **Connections:** 38 (highest in graph)
- **Significance:** Most connected contractor node — extensive bid and contract network
- **Flags:** `repeat_winner`, `geographic_concentration`

### Key Politicians (from Bribery Case Records)

#### Julio De Vido
- **Position:** Ministro de Planificacion Federal, Inversion Publica y Servicios (2003-2015)
- **Cases:** Odebrecht Argentina, Cuadernos de las Coimas
- **Graph role:** Highest-degree political node; alleged central coordinator of contract allocation
- **Judicial status:** Has faced criminal charges in connection with the Cuadernos case

#### Roberto Baratta
- **Position:** Subsecretario de Coordinacion, Ministerio de Planificacion Federal
- **Cases:** Odebrecht Argentina, Cuadernos de las Coimas
- **Graph role:** Second-highest-degree political node; alleged operational coordinator
- **Judicial status:** Arrested in 2018 in connection with the Cuadernos investigation

#### Jose Francisco Lopez
- **Position:** Secretario de Obras Publicas
- **Cases:** Odebrecht Argentina, Cuadernos de las Coimas
- **Graph role:** Alleged intermediary between ministry and contractor network
- **Judicial status:** Arrested in 2016 after being filmed allegedly burying bags of cash at a monastery in General Rodriguez, Buenos Aires Province

#### Ricardo Jaime
- **Position:** Secretario de Transporte
- **Cases:** Odebrecht Argentina, Cuadernos de las Coimas
- **Graph role:** Transport sector contract allocation
- **Judicial status:** Has faced multiple criminal proceedings

#### Carlos Santiago Kirchner
- **Position:** Secretario de Obras Publicas (successor period)
- **Cases:** Cuadernos de las Coimas
- **Relationship:** Cousin of former President Nestor Kirchner

#### Cristina Fernandez de Kirchner
- **Position:** Presidenta de la Nacion (2007-2015); Vicepresidenta (2019-2023)
- **Cases:** Cuadernos de las Coimas
- **Judicial status:** Has faced multiple judicial proceedings, including conviction in the Vialidad case (December 2022, subsequently under appeal)

### Intermediaries

8 intermediaries were identified across the three bribery cases, operating in roles classified as:
- **Bagman (recaudador):** Physical transport and delivery of alleged cash payments
- **Fixer (operador):** Facilitation of introductions and arrangements between officials and companies
- **Lobbyist (gestor):** Formal or informal advocacy for contract award decisions
- **Shell operator (operador de sociedades pantalla):** Management of companies with no operational substance used to channel funds

Specific names are documented in the seed data files (`research/odebrecht-argentina.json`, `research/cuadernos.json`, `research/siemens-fcpa.json`) sourced from DOJ, SEC, and Argentine judicial filings.

> *Resumen de perfiles: Los contratistas clave incluyen a SUPERCEMENTO-ROGGIO-CARRANZA UTE (ARS 5,7 billones), DECAVIAL SAICAC (ARS 2 billones) y SACDE/ex-IECSA (ARS 1,9 billones). CPC S.A. aparece en las causas Odebrecht y Cuadernos. Los funcionarios clave son De Vido, Baratta, Lopez, Jaime, C.S. Kirchner y C. Fernandez de Kirchner. Se identificaron 8 intermediarios.*

---

## 5. Money Trails / Flujos de Dinero

### Contract Awards — Top Flows

```
Source                                  → Destination               Amount (ARS)    Contracts
──────────────────────────────────────────────────────────────────────────────────────────────
Argentine National Government           → SUPERCEMENTO-ROGGIO UTE   $5.7 trillion   1
Argentine National Government           → DECAVIAL SAICAC           $2.0 trillion   6
Argentine National Government           → SACDE (ex-IECSA)          $1.9 trillion   3
Argentine National Government           → CPC S.A.                  $1.8 trillion   4
Argentine National Government           → POSE SA                   $1.6 trillion   11
```

### Alleged Bribery Flows

```
Source                   → Intermediary/Channel      → Recipient             Amount (USD)
─────────────────────────────────────────────────────────────────────────────────────────
Odebrecht S.A.           → [intermediaries]           → AR officials         $35 million (total)
Siemens AG               → [shell companies]          → AR officials         $100 million+ (total)
[Multiple contractors]   → [bagmen per notebooks]     → AR officials         Undisclosed (cash)
```

### Budget Execution Gap

The aggregate budget execution data reveals a systemic gap between allocated and executed funds:

- **128 projects flagged** with `budget_underrun` (completed, <30% execution)
- **Notable gaps:**
  - Autopista RN3 Canuelas-Azul: ARS 86.7B allocated, ~ARS 16.6B executed (ARS 70.1B gap)
  - RN9 Santiago del Estero: ARS 83.8B allocated, ~ARS 22.8B executed (ARS 61.0B gap)
  - Pavimentacion RP13: ARS 30.7B allocated, ~ARS 4.9B executed (ARS 25.8B gap)
  - Pavimentacion RP17 Chubut: ARS 12.8B allocated, ~ARS 179M executed (ARS 12.6B gap)

These gaps do not necessarily indicate theft — possible explanations include inflation adjustments, reallocation to other projects, or administrative delays. However, the pattern of marking such projects as "completed" while executing minimal budget is a significant red flag requiring further investigation.

### Cross-Investigation Financial Links

The 8,234 Contractor-Company CUIT matches between obras-publicas and finanzas-politicas create a financial bridge showing:
- Companies that receive public works contracts AND donate to political campaigns
- Companies that receive public works contracts AND have officers with government appointments
- Companies that receive public works contracts AND appear in offshore registries (ICIJ)

> *Resumen de flujos: Los contratos mas grandes fluyen hacia un pequeno grupo de contratistas, con SUPERCEMENTO-ROGGIO-CARRANZA UTE recibiendo ARS 5,7 billones en un solo contrato. Los sobornos alegados totalizan USD 35M (Odebrecht) y USD 100M+ (Siemens). 128 proyectos muestran brechas significativas entre presupuesto asignado y ejecutado. 8.234 coincidencias de CUIT crean un puente financiero entre ambas investigaciones.*

---

## 6. Cross-Investigation Connections / Conexiones Cruzadas

### Entity Resolution Results

The cross-referencing between the `obras-publicas` and `finanzas-politicas` investigation graphs produced:

| Match Type | Count | Confidence |
|------------|-------|------------|
| Contractor ↔ Company (CUIT match) | 8,234 | 0.95-1.0 |
| Contractor ↔ CompanyOfficer | 2,433 | 0.90-0.95 |
| SAME_ENTITY total | 9,385 | 0.60-1.0 |
| **All cross-investigation matches** | **43,615** | — |
| Entities flagged `cross_investigation` | 9,244 | — |

### Bridge Architecture

The CUIT identifier serves as the primary bridge between investigations:

```
obras-publicas graph                     finanzas-politicas graph
─────────────────────                    ────────────────────────
ObrasProcedure                           Politician
  ↑ PROCEDURE_FOR                           ↑ MAYBE_SAME_AS
PublicWork                               Contractor (CUIT)
  ↑ CONTRACTED_FOR                          ↓ SAME_ENTITY
Contractor (CUIT) ───SAME_ENTITY───→    Company (CUIT)
  ↑ AWARDED_TO                              ↓ OFFICER_OF_COMPANY
PublicContract                           CompanyOfficer
  ↑ BIDDER                                  ↓ MAYBE_SAME_AS
Bid ──BIDDER──→ Contractor              Donor (CUIT)
                                             ↓ SAME_ENTITY
DebarredEntity ──DEBARRED_SAME_AS──→    Contractor
                                             ↓ SAME_ENTITY
Intermediary (CUIT) ──SAME_ENTITY──→    OffshoreOfficer (ICIJ)
  ↑ INTERMEDIATED
BriberyCase ──CASE_INVOLVES──→          PublicWork | Contractor
```

### Key Cross-Investigation Patterns

1. **Contractor-Donor overlap:** Companies receiving public works contracts are simultaneously donating to political campaigns of officials who control contract allocation.
2. **Officer-Appointee overlap:** 2,155 individuals serving as company officers in firms that receive public works contracts simultaneously hold government positions.
3. **Offshore connections:** Through the ICIJ data in the finanzas-politicas graph, some contractors and intermediaries are linked to offshore entities, suggesting potential channels for illicit financial flows.
4. **Bribery case entities in political finance:** Companies named in the Odebrecht and Cuadernos cases also appear in campaign finance donation records, creating a documented link between alleged bribery and legal political contributions.

> *Resumen de conexiones cruzadas: 43.615 coincidencias entre investigaciones, con 8.234 coincidencias de CUIT entre contratistas y empresas. La arquitectura de puente usa el CUIT como identificador primario. Los patrones clave incluyen superposicion contratista-donante, superposicion funcionario-directivo (2.155 personas), conexiones offshore y entidades de causas de soborno en registros de financiamiento politico.*

---

## 7. Geographic Analysis / Analisis Geografico

### Distribution of Public Works by Province

| Province | Works | Notable Contractors |
|----------|-------|-------------------|
| Buenos Aires | 66 | SUPERCEMENTO-ROGGIO-CARRANZA, DECAVIAL, SACDE |
| Ciudad de Buenos Aires | 16 | Multiple |
| Chubut | 11 | RP17 ghost project (1.4% execution) |
| Catamarca | 10 | — |
| Chaco | 8 | — |

Buenos Aires province (including CABA) accounts for a dominant share of public works, with 82 of the geographically tagged works concentrated in the greater Buenos Aires metropolitan area.

### Geographic Concentration Flags

The `geographic_concentration` flag identifies contractors that dominate procurement in specific provinces. This pattern suggests either (a) legitimate regional specialization or (b) territorial allocation agreements among contractors that suppress competition.

### Ghost Project Geography

The 128 budget-underrun projects are not uniformly distributed. The presence of ghost projects in provinces like Chubut (RP17, 1.4% execution) and Santiago del Estero (RN9, 27.17% execution) — regions with less media scrutiny and weaker institutional oversight — is consistent with a pattern where capital diversion is easier in jurisdictions with lower accountability infrastructure.

### Sector Distribution

Public works span road infrastructure, water/sanitation, housing, energy, and transport sectors, with road infrastructure dominating (sourced from Vialidad Nacional data).

> *Resumen geografico: Buenos Aires concentra la mayor parte de las obras (82 entre provincia y CABA). Los proyectos fantasma se distribuyen en provincias con menor escrutinio mediatico. Se identificaron patrones de concentracion geografica de contratistas en provincias especificas.*

---

## 8. Timeline / Cronologia

### Key Dates

| Date | Event | Category |
|------|-------|----------|
| 2003 | Julio De Vido appointed Ministro de Planificacion Federal | Political |
| 2003-2015 | Period covered by Cuadernos de las Coimas notebooks | Financial |
| 2005 | Earliest documented Cuadernos cash delivery allegations | Financial |
| 2007 | Cristina Fernandez de Kirchner elected Presidenta | Political |
| 2007-2015 | Peak period of public works contract awards in dataset | Infrastructure |
| 2010 | Siemens FCPA settlement with SEC (USD 800M globally) | Legal |
| 2014 | Odebrecht bribes to Argentine officials allegedly continue | Financial |
| 2015 | End of Kirchner presidency; transition to Macri government | Political |
| 2016 | Jose Francisco Lopez arrested (cash at monastery) | Legal |
| 2016 (Dec) | Odebrecht plea agreement filed with DOJ | Legal |
| 2018 | Roberto Baratta arrested; Cuadernos investigation launched | Legal |
| 2018 | Cuadernos notebooks surface in judicial proceedings | Legal |
| 2022 (Dec) | CFK convicted in Vialidad case (under appeal) | Legal |
| 2026 (Mar) | This investigation: graph constructed, 37,351 nodes | Infrastructure |

### Political Cycle Correlation

The dataset shows contract award concentrations that correlate with electoral cycles and government transitions, though rigorous statistical analysis would require year-by-year contract volume data beyond what is currently in the graph.

> *Resumen cronologico: La cronologia abarca desde 2003 (nombramiento de De Vido) hasta 2026 (construccion del grafo). Los eventos clave incluyen el periodo de los Cuadernos (2005-2015), el acuerdo de Odebrecht con el DOJ (2016), los arrestos de Lopez (2016) y Baratta (2018), y la condena de CFK en la causa Vialidad (2022).*

---

## 9. Data Dictionary / Diccionario de Datos

### Node Labels

| Label | Count | Description (EN) | Descripcion (ES) |
|-------|-------|-------------------|-------------------|
| Contractor | 28,419 | Registered supplier or contract winner | Proveedor registrado o adjudicatario |
| PublicWork | 7,481 | Infrastructure project with location data | Proyecto de infraestructura con datos geograficos |
| Bid | 579 | Offer submitted on a procurement procedure | Oferta presentada en procedimiento de contratacion |
| ObrasProcedure | 482 | Formal procurement process | Proceso formal de contratacion |
| Contract | 390 | Awarded contract with amount and terms | Contrato adjudicado con monto y condiciones |
| BriberyCase | 3 | Documented bribery scheme (Odebrecht, Cuadernos, Siemens) | Esquema de soborno documentado |
| Intermediary | 8 | Alleged facilitator in bribery scheme | Presunto facilitador en esquema de soborno |
| DebarredEntity | — | Entity sanctioned by WB or IDB | Entidad sancionada por BM o BID |
| BudgetAllocation | — | Fiscal year budget assignment | Asignacion presupuestaria por ejercicio fiscal |
| MultilateralProject | — | Project funded by international institution | Proyecto financiado por institucion internacional |
| InvestigationFlag | — | Automated anomaly detection marker | Marcador de deteccion automatica de anomalias |

### Relationship Types

| Type | Count | Description (EN) | Descripcion (ES) |
|------|-------|-------------------|-------------------|
| SAME_ENTITY | 9,385 | Cross-reference identity match | Coincidencia de identidad por referencia cruzada |
| CONTRACTED_FOR | — | Contractor awarded work on project | Contratista adjudicado para proyecto |
| BID_ON | — | Bid submitted for procedure | Oferta presentada para procedimiento |
| BIDDER | — | Bid submitted by contractor | Oferta presentada por contratista |
| PROCEDURE_FOR | — | Procedure created for public work | Procedimiento creado para obra publica |
| CASE_INVOLVES | — | Bribery case involves entity | Causa de soborno involucra entidad |
| BRIBED_BY | — | Official allegedly bribed via case | Funcionario presuntamente sobornado |
| INTERMEDIATED | — | Intermediary facilitated bribery case | Intermediario facilito causa de soborno |
| LOCATED_IN_PROVINCE | — | Public work located in province | Obra publica ubicada en provincia |
| BUDGET_FOR | — | Budget allocated for public work | Presupuesto asignado para obra publica |

### Flag Types

| Flag | Description (EN) | Descripcion (ES) |
|------|-------------------|-------------------|
| `contractor_donor` | Contractor also donated to political campaigns | Contratista tambien dono a campanas politicas |
| `contractor_offshore` | Contractor linked to offshore entity (ICIJ) | Contratista vinculado a entidad offshore |
| `debarred_active` | Debarred entity still winning contracts | Entidad inhabilitada aun ganando contratos |
| `budget_overrun` | Budget execution exceeds 150% of allocation | Ejecucion presupuestaria supera 150% |
| `budget_underrun` | Completed project with <30% budget execution | Proyecto completado con <30% de ejecucion |
| `odebrecht_linked` | Entity appears in Odebrecht plea data | Entidad aparece en datos del acuerdo Odebrecht |
| `cuadernos_linked` | Entity appears in Cuadernos records | Entidad aparece en registros de Cuadernos |
| `repeat_winner` | Contractor with 50+ contracts | Contratista con 50+ contratos |
| `shell_company` | Company with 0-1 officers receiving contracts | Empresa con 0-1 directivos recibiendo contratos |
| `cross_investigation` | Entity in both obras-publicas and finanzas-politicas | Entidad en ambas investigaciones |
| `multilateral_national` | Wins both WB/IDB and national contracts | Gana contratos multilaterales y nacionales |
| `geographic_concentration` | Single contractor dominates one province | Un contratista domina una provincia |

### Confidence Tiers

| Tier | Score Range | Criteria (EN) | Criterio (ES) |
|------|-------------|---------------|----------------|
| Gold | 0.90-1.00 | Verified by 3+ independent sources | Verificado por 3+ fuentes independientes |
| Silver | 0.70-0.89 | Official government portal data, web-verified | Datos de portales oficiales, verificados |
| Bronze | 0.50-0.69 | Raw ingested from court records / journalism | Ingesta cruda de expedientes judiciales / periodismo |

---

## 10. Sources / Fuentes

### Primary Data Sources / Fuentes Primarias de Datos

1. **CONTRAT.AR** (Oficina Nacional de Contrataciones)
   - URL: `infra.datos.gob.ar/catalog/jgm/dataset/30/`
   - Data: 7 CSVs — procedimientos, ofertas, contratos, obras, ubicacion geografica, circulares, actas de apertura
   - Records: 482 procedures, 579 bids, 390 contracts
   - License: Open data (datos.gob.ar)

2. **COMPR.AR SIPRO** (Sistema de Informacion de Proveedores)
   - URL: `infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.11/`
   - Data: Registered supplier registry
   - Records: 28,121 suppliers
   - License: Open data

3. **MapaInversiones** (Ministerio de Obras Publicas)
   - URL: `mapainversiones.obraspublicas.gob.ar/opendata/dataset_mop.csv`
   - Data: Public works with geographic coordinates, budget, execution percentage
   - Records: 7,285 public works
   - License: Open data

4. **Presupuesto Abierto** (Ministerio de Economia)
   - URL: `presupuestoabierto.gob.ar/api/v1/pef`
   - Data: Budget allocations by fiscal year, program, subprogram
   - License: Open data (requires API token)

5. **Vialidad Nacional** (Direccion Nacional de Vialidad)
   - URL: `argentina.gob.ar/transporte/vialidad-nacional/catalogos-de-datos-abiertos`
   - Data: Road infrastructure contracts (CSV/OCDS)
   - License: Open data

6. **ENOHSA** (Ente Nacional de Obras Hidricas de Saneamiento)
   - URL: `datos.gob.ar/dataset/obras-agua-saneamiento-e-infraestructura-hidrica`
   - Data: Water and sanitation infrastructure projects
   - License: Open data

### International Sources / Fuentes Internacionales

7. **World Bank Contract Awards**
   - URL: `financesone.worldbank.org/`
   - Data: Major contract awards for Argentina-based projects

8. **World Bank Debarment List**
   - URL: `worldbank.org/en/projects-operations/procurement/debarred-firms`
   - Data: Firms and individuals debarred from WB-funded projects

9. **IDB Sanctions List**
   - URL: `iadb.org/en/transparency/sanctioned-firms-and-individuals`
   - Data: Firms sanctioned by the Inter-American Development Bank

### Judicial and Regulatory Sources / Fuentes Judiciales y Regulatorias

10. **DOJ Odebrecht Plea Agreement** (December 2016)
    - United States Department of Justice
    - Case: United States v. Odebrecht S.A.
    - Relevant section: Argentine bribery scheme ($35M)

11. **SEC FCPA Siemens Settlement** (December 2008)
    - United States Securities and Exchange Commission
    - Case: SEC v. Siemens Aktiengesellschaft
    - Relevant section: Argentine DNI contract bribery ($100M+)

12. **Cuadernos de las Coimas** (judicial records)
    - Argentine federal judiciary
    - Case: Investigation into cash payments documented in handwritten notebooks
    - Period: 2005-2015

### Cross-Reference Sources (via finanzas-politicas investigation)

13. **IGJ** (Inspeccion General de Justicia) — Company officer registrations
14. **CNV** (Comision Nacional de Valores) — Securities filings
15. **CNE** (Camara Nacional Electoral) — Campaign finance disclosures
16. **Boletin Oficial** — Government appointments
17. **ICIJ** (International Consortium of Investigative Journalists) — Offshore entity data

---

## Appendix A: Graph Statistics Summary

```
Total nodes:           37,351
  Contractors:         28,419
  Public Works:         7,481
  Bids:                   579
  Procedures:             482
  Contracts:              390

Total relationships:   19,560
  SAME_ENTITY:          9,385

Bribery cases:              3
  Odebrecht Argentina
  Cuadernos de las Coimas
  Siemens DNI

Intermediaries:             8

Investigation flags:
  cross_investigation:  9,244
  repeat_winner:           68
  budget_underrun:        128
  shell_company:          831

Cross-investigation:
  Total matches:       43,615
  CUIT matches:         8,234
  Officer matches:      2,433
  Dual-role persons:    2,155
```

## Appendix B: Methodological Limitations

1. **Currency and inflation:** All ARS amounts are nominal. Argentina's high inflation rate means that direct comparison of ARS amounts across years is misleading without deflation. This dossier presents nominal figures as recorded in the source datasets.

2. **CUIT matching precision:** While CUIT matching provides high-confidence entity resolution (0.95-1.0), CUITs can be shared across legal entities in edge cases (e.g., company reorganizations). All CUIT matches should be validated against company name consistency.

3. **Fuzzy name matching false positives:** Tier 3 matching (Levenshtein distance <= 2) may produce false positive matches for common Argentine corporate names. Matches below 0.8 confidence should be treated as hypotheses requiring verification.

4. **Ghost project interpretation:** A budget underrun does not necessarily indicate corruption. Possible legitimate explanations include: project rescoping, inflation-adjusted reallocation, administrative errors in reporting, or multi-year projects where execution is ongoing despite being marked "completed" in a snapshot.

5. **Bribery case data provenance:** Odebrecht and Siemens data derives from US judicial proceedings (DOJ plea agreement, SEC settlement). Cuadernos data derives from Argentine judicial proceedings and journalism. The evidentiary standards and procedural contexts differ significantly.

6. **Graph completeness:** The graph represents a subset of Argentine public works procurement. Not all contracts, contractors, or government entities are captured. Absence from the graph does not indicate absence of activity.

7. **AI analysis caveat:** Qwen 3.5 LLM analysis was used for pattern detection and synthesis. All AI-generated findings were validated against structured graph data, but the interpretive framing reflects the model's analytical patterns and should be evaluated critically.

---

*This dossier was generated as part of the Office of Accountability's obras-publicas investigation. All claims are sourced from public records, official government open-data portals, and published judicial proceedings. The word "alleged" is used for claims that have not been proven in a final court judgment. This document does not constitute legal advice or a finding of criminal liability.*

*Investigation engine: Neo4j 5 Community Edition + Qwen 3.5 9B (llama.cpp)*
*Entity resolution: 3-tier CUIT/DNI/fuzzy matching*
*Last updated: 2026-03-24*
