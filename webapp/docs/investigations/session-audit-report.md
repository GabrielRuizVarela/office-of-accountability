# Session Audit Report: Discovered but Not Integrated

**Date:** 2026-03-21
**Scope:** Cross-reference of 9 research files against Neo4j graph (56 persons, 49 orgs) and frontend investigation-data.ts (46 actors, 30 factchecks, 13 money flows)

---

## A. Persons in Research Files but NOT in Neo4j Graph

### Critical Priority (directly implicated in schemes)

| Person | Role | Source File | Status |
|--------|------|-------------|--------|
| Hugo Rodríguez | Former Olivos administrator, prosecuted for facilitating unrecorded meetings | nacion-seguros-investigation.json | NOT IN GRAPH |
| María Cantero | Alberto Fernández's secretary, wife of Martínez Sosa | nacion-seguros-investigation.json | NOT IN GRAPH |
| Mauro Tanos | Ex-La Cámpora, Nación Seguros GM, raided by justice | nacion-seguros-investigation.json | NOT IN GRAPH |
| Alfonso José Torres | Current Nación Seguros president, Menem-linked | nacion-seguros-investigation.json | NOT IN GRAPH |
| Alfredo "Freddy" Lijo | Judge Lijo's brother, 95% owner of Finaig Consultores | judicial-power-findings.json | NOT IN GRAPH |
| Carlos Bettini | Ex-ambassador, owns Lijo's undeclared USD 2M apartment | judicial-power-findings.json | NOT IN GRAPH |
| Pablo Casey | Magnetto nephew, organized Lago Escondido trip | judicial-power-findings.json | NOT IN GRAPH |
| Héctor Magnetto | CEO Grupo Clarín | judicial-power-findings.json | NOT IN GRAPH |
| Karina Milei | Sec. General, implicated in ANDIS/Suizo bribery audios | recent-scandals-2024-2026.json | NOT IN GRAPH |
| Diego Spagnuolo | Ex-ANDIS director, leaked bribery audios | recent-scandals-2024-2026.json | NOT IN GRAPH |
| Luana Volnovich | Ex-PAMI director, 16x overpricing period | recent-scandals-2024-2026.json | NOT IN GRAPH |
| Julio De Vido | Former Planning Minister, processed in Causa Seguros | comodoro-py-findings.json | NOT IN GRAPH |
| Alberto Pagliano | Ex-head of Nación Seguros, prosecuted | revolving-door-findings.json | NOT IN GRAPH |
| Paolo Rocca | CEO Techint, cleared by Ercolini in Cuadernos | judicial-cases-findings.json | NOT IN GRAPH |

### High Priority (judges, operators, networked persons)

| Person | Role | Source File | Status |
|--------|------|-------------|--------|
| Pablo Yadarola | Federal judge, Lago Escondido participant | judicial-power-findings.json | NOT IN GRAPH |
| Pablo Cayssials | Federal judge, Lago Escondido participant | judicial-power-findings.json | NOT IN GRAPH |
| Carlos "Coco" Mahiques | Judge, Lago Escondido participant | judicial-power-findings.json | NOT IN GRAPH |
| Juan Bautista Mahiques | Fiscal General Porteño, fake invoices audio | judicial-power-findings.json | NOT IN GRAPH |
| Jorge Rendo | CEO Grupo Clarín, Lago Escondido chat | judicial-power-findings.json | NOT IN GRAPH |
| Manuel García-Mansilla | Co-designee to Supreme Court by decree | judicial-power-findings.json | NOT IN GRAPH |
| Alejo Ramos Padilla | Judge who declared decree unconstitutional | judicial-power-findings.json | NOT IN GRAPH |
| Alberto Nisman | AMIA special prosecutor, found dead 2015 | comodoro-py-findings.json | NOT IN GRAPH |
| Rodolfo Canicoba Corral | Ex-judge Court 6 (27 years), vacancy Lijo absorbed | comodoro-py-findings.json | NOT IN GRAPH |
| María Romilda Servini | Federal Judge Court 1, longest-serving | comodoro-py-findings.json | NOT IN GRAPH |
| Eduardo Casal | Interim Attorney General since 2017 | comodoro-py-findings.json | NOT IN GRAPH |
| Gabriel Bussola | Head of Libra Seguros | revolving-door-findings.json | NOT IN GRAPH |
| Gustavo Balabanian | Head of Paraná Seguros | revolving-door-findings.json | NOT IN GRAPH |
| Pablo Sallaberry | Businessman gaining power in SSN | revolving-door-findings.json | NOT IN GRAPH |
| Victoria Costoya | Frigerio's wife, nepotism appointment | frigerio-network/findings.json | NOT IN GRAPH |
| Octavio Frigerio | Frigerio's father, YPF director during son's ministry | frigerio-network/findings.json | NOT IN GRAPH |
| Mario Frigerio | Frigerio's uncle, ENACOM manager during nephew's ministry | frigerio-network/findings.json | NOT IN GRAPH |
| Gustavo Alberto Esses | Koolhaas SA director, economic ties to Frigerio | comodoro-py-findings.json | NOT IN GRAPH |
| Ariel Eduardo Naistat | Koolhaas SA director, economic ties to Frigerio | comodoro-py-findings.json | NOT IN GRAPH |
| Diego Cardona Herreros | Paraguayan businessman, Causa Coimas Entre Ríos | frigerio-network/findings.json | NOT IN GRAPH |

### Medium Priority (contextual figures)

| Person | Role | Source File | Status |
|--------|------|-------------|--------|
| Rita Mónica Almada | Ex-VP Nación Seguros → AGN revolving door | nacion-seguros-investigation.json | NOT IN GRAPH |
| Juan Horacio Sarquis | Ex-president Nación Seguros (Macri era) | nacion-seguros-investigation.json | NOT IN GRAPH |
| José De los Ríos | Current VP Nación Seguros (Milei appointee) | nacion-seguros-investigation.json | NOT IN GRAPH |
| Fernando Barbiero | Current Nación Seguros director (Milei appointee) | nacion-seguros-investigation.json | NOT IN GRAPH |
| Delia Marisa Bircher | Sec. Foreign Trade, SGS Group revolving door | revolving-door-findings.json | NOT IN GRAPH |
| White Pablo Guillermo | Officer of Camponuevo de Capital Federal SRL (potential shell) | revolving-door-findings.json | NOT IN GRAPH |
| Magali Mazzuca | Lijo's ex-partner, Supreme Court law clerk | comodoro-py-findings.json | NOT IN GRAPH |
| Amado Boudou | Former VP, processed by Lijo | comodoro-py-findings.json | NOT IN GRAPH |
| Daniel Vila | 40% Grupo América, Belocopitt partner | side-belocopitt-health-findings.json | NOT IN GRAPH |
| Jonathan Simón Kovalivker | President of Suizo Argentina, raided | recent-scandals-2024-2026.json | NOT IN GRAPH |
| Eduardo Jorge Kovalivker | 64.5% owner Suizo Argentina | recent-scandals-2024-2026.json | NOT IN GRAPH |

**Total persons discovered but not in graph: ~50+**

---

## B. Organizations in Research but NOT in Neo4j Graph

### Should Be Added

| Organization | Relevance | Source File |
|-------------|-----------|-------------|
| Finaig Consultores SA | 95% owned by Alfredo Lijo (judge's brother) | judicial-power-findings.json |
| Caledonia Seguros | Linked to Alfredo Lijo | judicial-power-findings.json |
| Koolhaas SA | Received state land from Frigerio, cleared by Ercolini | frigerio-network/findings.json |
| Lethe | $35M irregular loan from Banco Ciudad under Frigerio (1500% of equity) | frigerio-network/findings.json |
| ATX SA | Simulated bidding in Causa Seguros | comodoro-py-findings.json |
| Area Tech SA | Simulated bidding in Causa Seguros | comodoro-py-findings.json |
| Nación Seguros SA | State insurer, captive monopoly vehicle (ARS 28.5B contracts) | nacion-seguros-investigation.json |
| Nación Reaseguros | Reinsurance arm of Grupo Banco Nación | nacion-seguros-investigation.json |
| Provincia Seguros SA | Provincial-level captive insurer | nacion-seguros-investigation.json |
| Provincia ART SA | Provincial workers' comp insurer | nacion-seguros-investigation.json |
| Justicia Legítima | Judges-politician association | (referenced in investigation context) |
| Correo Argentino SA | Macri family postal company, 98.82% debt forgiveness | judicial-cases-findings.json |
| Relevamientos Catastrales SA | Cardona Herreros company, Causa Coimas | frigerio-network/findings.json |
| E&R Economía y Regiones SA | Frigerio's consulting firm, fined by Moreno | frigerio-network/findings.json |
| Suizo Argentina SA (Droguería) | 2,678% contract increase, bribery scandal | recent-scandals-2024-2026.json |
| Camponuevo de Capital Federal SRL | Potential shell, 2 officers, Army-only contracts | revolving-door-findings.json |
| Bapro Mandatos y Negocios SAU | Catalán was president, Estrella del Sur scandal | revolving-door-findings.json |
| Fideicomiso Estrella del Sur | Housing trust fraud linked to Catalán tenure | revolving-door-findings.json |
| ACE Oncología | Cartel with labs for PAMI overpricing | recent-scandals-2024-2026.json |
| Glencore El Pachón Limited (Bermuda) | In graph ✓ | - |
| Glencore South America Limited (Cayman) | Paradise Papers offshore structure | recent-scandals-2024-2026.json |
| Glencore Finance Limited (Bermuda) | Paradise Papers offshore structure | recent-scandals-2024-2026.json |
| Glencore SA Holdings Limited (Bermuda) | Paradise Papers offshore structure | recent-scandals-2024-2026.json |
| KARIMA PORTFOLIO et al. (6 Belocopitt BVI entities) | Panama Papers offshore entities | side-belocopitt-health-findings.json |

**Note:** Nación Seguros SA is the single largest finding gap - it is the #1 government contractor by value (ARS 28.5B) and central to the Causa Seguros, yet has no graph node.

---

## C. Key MiroFish/Research Findings NOT Reflected in Factchecks

### Missing Factchecks

1. **Frigerio Banco Ciudad irregularities** - $35M loan to Lethe (1500% of equity, company with zero construction experience). Not in factchecks despite being sourced from Página/12.

2. **Frigerio ATN discretionary distribution** - Rosario (1M pop, socialist) received 3% ($12M) vs Santa Fe capital (400K pop, Cambiemos) received $152M. Documented by La Nación but no factcheck.

3. **Frigerio nepotism network** - Wife (Victoria Costoya) at Min. Social Development, father (Octavio) at YPF board, uncle (Mario) at ENACOM, all during his ministry. No factcheck despite 3+ sources.

4. **SUIZO dual CUIT anomaly** - Suizo Argentina SA has two CUITs (data manipulation flag), combined $13.2B in contracts, 2,678% increase year-over-year. Mentioned in key-findings.md but no dedicated factcheck.

5. **Belocopitt COVID ATP collection** - Received USD 13M in state salary subsidies while being one of Argentina's 50 richest people (USD 440M fortune). Has factcheck `belocopitt-health-media` but the COVID ATP figure is not in money flows.

6. **PAMI pharmaceutical cartel** - ACE Oncología + Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo coordinated pricing, PAMI overpaid $273M in 2023 alone. Has factcheck `pami-16x-overpricing` but cartel members not named.

7. **Glencore royalty discrepancy** - Reported paying USD 525M to Argentina in 2015, independent records show only USD 45M. Paradise Papers revealed 6 Bermuda/Cayman entities. No factcheck at all.

8. **Ercolini clearing pattern** - Cleared Frigerio "express" in Koolhaas case, cleared Techint/Rocca in Cuadernos ("state of necessity" defense for USD 1M bribery), cleared all Lago Escondido participants. Pattern documented across 3 research files but no aggregate factcheck.

9. **Macri systematic clearances** - 6+ cases (Mesa Judicial, ARA San Juan espionage, GCBA wiretapping, Sevel smuggling, Boca Juniors fraud) all resulted in dismissal. Documented in judicial-cases-findings.json, no factcheck.

10. **Accusatory system reform** - August 2025 transition transfers power from judges to prosecutors at Comodoro Py, described by INECIP as "altering the ecosystem." No factcheck or timeline event.

---

## D. Specific Figures from Research NOT in Money Flows

| Figure | Context | Source | In Frontend? |
|--------|---------|--------|-------------|
| $9,669,697,257.25 ARS | Bachellier SA exact embargo | judicial-cases-findings.json | NO (has factcheck but not exact in money flow) |
| $366,635,744 ARS | Martínez Sosa commissions (4 years) | nacion-seguros-investigation.json | NO |
| $2,870,729,545.61 ARS | Martínez Sosa company embargo | judicial-cases-findings.json | NO |
| $14,634,220,283 ARS | Alberto Fernández total embargo | comodoro-py-findings.json | NO |
| USD 211,102 | Kueider border cash (exact) | investigation-data.ts | YES (in factcheck, not in money flow) |
| USD 13M | Belocopitt COVID ATP received | side-belocopitt-health-findings.json | NO |
| ARS 97.1B | SIDE 2026 total budget | key-findings.md | NO (factcheck exists, no money flow) |
| ARS 5.666B | SIDE 2026 unjustifiable expenses | recent-scandals-2024-2026.json | NO |
| $108,299M ARS | Suizo Argentina contracts 2025 (from $3,898M in 2024) | recent-scandals-2024-2026.json | NO |
| $273M ARS | PAMI oncological overcharges 2023 | recent-scandals-2024-2026.json | NO |
| USD 2M | Lijo undeclared apartment (Alvear Ave) | comodoro-py-findings.json | NO |
| $35M ARS | Lethe irregular loan (Frigerio/Banco Ciudad) | frigerio-network/findings.json | NO |
| USD 776,000 | Frigerio + officials invested in Koolhaas project | frigerio-network/findings.json | NO |
| $3,428M ARS | Total ATN managed by Macri/Frigerio for Entre Ríos | frigerio-network/findings.json | NO |
| USD 4.1M | Frigerio consulting firm sale proceeds | frigerio-network/findings.json | NO |
| ARS 28.5B | Nación Seguros total contract value | nacion-seguros-investigation.json | Partial (factcheck yes, money flow yes) |
| USD 1M | Techint bribery to Baratta (cleared by Ercolini) | judicial-cases-findings.json | NO |
| USD 9.5B + USD 4.5B | Glencore RIGI applications (El Pachón + MARA) | recent-scandals-2024-2026.json | NO |

---

## E. Data Gaps Identified in Research but Not Addressed

1. **Politician-Donor cross-reference NOT BUILT** - 1,467 campaign donors remain unlinked to politician recipients (key-findings.md)
2. **CompanyOfficer-OffshoreOfficer cross-reference NOT BUILT** - No systematic cross-match between IGJ company officers and ICIJ offshore officers
3. **Glencore/Mining offshore structures** - Marun → Bermuda entities chain not mapped
4. **CONSEJO EMPRESARIO ARGENTINO as central hub** - Identified as most connected organization in graph analysis but not featured in frontend narrative
5. **Blaquier Hub** - Identified as most connected cross-family figure in graph analysis but not featured

---

## F. Summary Statistics

| Metric | Count |
|--------|-------|
| Total persons discovered in research | ~100+ |
| Persons in Neo4j graph | 56 |
| **Persons discovered but NOT in graph** | **~50+** |
| Total orgs discovered in research | ~40+ |
| Orgs in Neo4j graph | 49 |
| **Orgs discovered but NOT in graph** | **~20+** |
| Factchecks in frontend | 30 |
| **Research findings without factchecks** | **10+** |
| Money flows in frontend | 13 |
| **Documented amounts without money flows** | **15+** |
| Actor profiles in frontend | 46 |
| **Researched persons without actor profiles** | **~50+** |

---

## G. Priority Integration Recommendations

### Tier 1 - Immediate (critical gaps in active judicial cases)

1. Add Nación Seguros SA as Organization node with all relationships
2. Add María Cantero, Hugo Rodríguez, Mauro Tanos (Causa Seguros central figures)
3. Add Alfredo Lijo + Finaig Consultores (Lijo corruption network)
4. Add Carlos Bettini (Lijo undeclared apartment owner)
5. Add money flows for Bachellier embargo ($9.67B), Martínez Sosa embargo ($2.87B), Fernández embargo ($14.63B)
6. Add Karina Milei + Diego Spagnuolo + Suizo Argentina (active ANDIS scandal)

### Tier 2 - High (pattern-completing nodes)

7. Add Lago Escondido participants: Casey, Magnetto, Yadarola, Cayssials, Mahiques (judges-corporate nexus)
8. Add Frigerio family network: Victoria Costoya, Octavio Frigerio, Mario Frigerio
9. Add Koolhaas SA + Lethe (Frigerio financial irregularities)
10. Add Glencore offshore subsidiaries (3-4 Bermuda/Cayman entities)
11. Create factcheck for Ercolini systematic clearing pattern
12. Create factcheck for Macri systematic acquittals

### Tier 3 - Enrichment (depth and completeness)

13. Build Politician-Donor cross-reference (1,467 donors)
14. Build CompanyOfficer-OffshoreOfficer cross-reference
15. Add Belocopitt 6 BVI offshore entities as individual nodes
16. Add pharmaceutical cartel members as Organization nodes
17. Add accusatory system reform as timeline event
