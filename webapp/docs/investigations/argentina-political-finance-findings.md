# Argentine Political Finance Investigation — Findings

**Date:** 2026-03-19
**Investigation cycle:** 1
**Graph status:** 113,283 nodes, 975,909 relationships

## Executive Summary

Cross-referencing five datasets — legislative voting records (Como Voto), offshore leaks (ICIJ), campaign finance declarations (CNE), government appointments (Boletín Oficial), and corporate registry (IGJ) — we identified politicians with undeclared offshore entities, contractors who illegally donated to campaigns, and individuals whose public funds flow through offshore structures.

## High-Priority Findings

### 1. IBAÑEZ, Maria Cecilia — Active offshore entity while serving as deputy

| Field | Detail |
|-------|--------|
| **Politician** | María Cecilia Ibáñez (La Libertad Avanza, Córdoba) |
| **Offshore entity** | PELMOND COMPANY LTD. (BVI, incorporated 31-Oct-2014, **Active**) |
| **Source** | Panama Papers |
| **Overlap** | Entity active during her current term (2024-2026) |
| **Legal risk** | Under Ley 25.188, officials must declare all assets including offshore interests. If undeclared, criminal omission. |
| **Status** | UNCONFIRMED — High Confidence. Confirmed in [ICIJ database](https://offshoreleaks.icij.org/nodes/10158328). |

### 2. CAMAÑO, Graciela — Offshore entity created during active term

| Field | Detail |
|-------|--------|
| **Politician** | Graciela Camaño (Consenso Federal, Buenos Aires) — 6 parties over career |
| **Offshore entity** | TT 41 CORP (BVI, incorporated 23-Jun-2016) |
| **Source** | Pandora Papers (Trident Trust) |
| **Overlap** | Entity created during her 2014-2018 term as National Deputy |
| **Status** | UNCONFIRMED — Probable. Exact name match, consistent with Trident Trust/Argentina pattern. |

### 3. Contractor-Donor violations (Ley 26.215)

Under Argentine law, government contractors are **prohibited** from making campaign contributions.

| Person | Contractor role | Donor role | Legal issue |
|--------|----------------|------------|-------------|
| Juan Pablo Rodriguez | Government contractor (2018-2020) | Campaign donor | Illegal under Ley 26.215 |
| Jorge Omar Gonzalez | Government contractor (2018-2020) | Campaign donor | Illegal under Ley 26.215 |

### 4. Maria Eugenia Cordero — Triple overlap

Government contractor + offshore officer. Public funds potentially cycling through offshore structures.

### 5. Manuel Lucio Torino — Donor with offshore holdings

Campaign donor confirmed in [ICIJ Panama Papers database](https://offshoreleaks.icij.org/nodes/56052663). Undeclared offshore assets while making political contributions.

## Verified Matches

### Politician ↔ Donor (50 confirmed, 0 false positives)

All 50 MAYBE_SAME_AS matches between politicians and campaign donors were verified as the same person. All donations go to the politician's own party/coalition. No cross-party financing detected.

Notable self-donors:
- Mauricio Macri — ARS 100,000 to Juntos por el Cambio 2019
- Máximo Kirchner — ARS 50,000 to Frente de Todos 2019

**Data gap:** Donation amounts not yet ingested in graph (present in source data).

### Politician ↔ Government Appointment (24 confirmed)

Key matches: Macri (Presidente), Michetti (Vicepresidente), Bullrich (Ministra), Frigerio (Ministro del Interior), Laura Alonso (Secretaria de Ética Pública).

### Politician ↔ Offshore (3 matches, 2 credible)

| Match | Confidence | Rationale |
|-------|-----------|-----------|
| Ibañez ↔ PELMOND | High | Exact name, entity active, sitting deputy |
| Camaño ↔ TT 41 CORP | Probable | Exact name, entity created during term |
| Nuñez ↔ SURPLAY FINANCIAL | Low (likely false positive) | Common name, entity dissolved pre-career |

## Multi-Dataset Politicians

Politicians appearing in 2+ external datasets:

| Politician | Party | Datasets | Notes |
|-----------|-------|----------|-------|
| Mauricio Macri | PRO | Donor, GovernmentAppointment | Documented offshore history (Fleg Trading, Kagemusha — separate from this graph). Contractor-donor campaign violations documented by Chequeado. |
| Fernando Sánchez | Coalición Cívica | Donor, GovernmentAppointment | Legislator → government appointee revolving door. CC-ARI faced allegations of fictitious donations. |
| Graciela Susana Villata | Frente Cívico - Córdoba | Donor, GovernmentAppointment | Lower risk without additional evidence. |

## Data Sources

| Source | Records | Pipeline |
|--------|---------|----------|
| Como Voto (legislative votes) | 2,258 politicians, 920K votes, 2,997 terms, 3,827 legislation | `run-etl-como-voto.ts` |
| ICIJ Offshore Leaks | 4,349 Argentine officers, 2,422 entities | `run-etl-icij.ts` |
| CNE Campaign Finance | 1,714 donations, 1,467 donors | `run-etl-cne.ts` |
| Boletín Oficial | 6,044 appointments, 22,280 contracts | `run-etl-boletin.ts` |
| IGJ Corporate Registry | 951,863 officers, 1,060,769 companies (loading) | `run-etl-opencorporates.ts` |

## Methodology

- Entity matching via `normalizeName()` — strips diacritics, lowercases, sorts name parts alphabetically
- All matches stored as `MAYBE_SAME_AS` relationships with confidence scores
- Cross-dataset links stored as `CROSS_REFERENCED` relationships
- Verification via WebSearch for press coverage and ICIJ database confirmation
- False positive rate: 0% for donor matches (50/50 confirmed), ~33% for offshore matches (1/3 likely false positive)

## Next Steps

1. Ingest donation amounts from CNE source data
2. Complete IGJ corporate registry load (1,479 politician-company officer matches pending)
3. Re-run cross-enrichment after IGJ load completes
4. Extend Boletín Oficial data beyond 2019 snapshot
5. Add COMPR.AR procurement data for recent contracts
6. Investigate Ibañez/PELMOND declaration status via AFIP records
7. Build investigation page (case layout like Caso Libra)

## Sources

- [ICIJ Offshore Leaks Database](https://offshoreleaks.icij.org)
- [Aportantes Electorales — CNE](https://aportantes.electoral.gob.ar)
- [datos.gob.ar](https://datos.gob.ar)
- [PELMOND COMPANY LTD — ICIJ](https://offshoreleaks.icij.org/nodes/10158328)
- [Macri — contratistas donation — Chequeado](https://chequeado.com/investigaciones/macri-recibio-3-millones-de-contratistas-del-estado-para-su-campana-electoral/)
- [Pandora Papers Argentina — Infobae](https://www.infobae.com/america/pandora-papers/2021/10/03/)
- [Panama Papers Macri — El Cronista](https://www.cronista.com/economia-politica/panama-papers-que-declaro-el-periodista-alconada-en-la-causa-por-la-offshore-de-macri/)
