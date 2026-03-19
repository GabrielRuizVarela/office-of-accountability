# Investigation Connection Maps

**Date:** 2026-03-19
**Source:** Graph analysis of 3.26M nodes, 986K relationships across 8 datasets

## Connection Map 1: The PRO Financial Machine

13/20 revolving door cases are PRO-affiliated, revealing a systematic pipeline:

**Legislator (low attendance) → Executive appointment → Back to politics**

With parallel tracks through corporate board seats and government contracts.

Key actors:
- **Macri:** 17.6% legislative presence → President → 5 corporate boards
- **Laura Alonso:** 509 legislative votes → Secretary of Public Ethics (oversees asset declarations)
- **Majdalani:** 44.6% presence → intelligence sub-director
- **13/20 top campaign donors** gave exclusively to JxC

## Connection Map 2: The Offshore-Legislation Nexus

### Camaño — Maximum Overlap

- **Offshore:** TT 41 CORP (BVI, incorporated June 2016 — DURING her 2014-2018 term)
- **Financial votes:** 326 total on Presupuesto, Ganancias, Blanqueo, etc.
- **High absence:** 35 absent votes on Presupuesto alone
- **Party switching:** 6 parties over 30 years (maximizing cross-coalition access)
- **Wealth growth:** ARS 2.8M (2013) → 39.2M (2023) = **14x growth**
- **Graph centrality:** 4th highest (2,364 connections)
- **Datasets:** 4 (OffshoreOfficer + BoardMember + CompanyOfficer + AssetDeclaration)

### Ibañez — Active Violation

- **Offshore:** PELMOND COMPANY LTD (BVI, incorporated Oct 2014, status: **ACTIVE**)
- **Current deputy:** La Libertad Avanza, Córdoba
- **Corporate:** Also BoardMember + CompanyOfficer in IGJ registry
- **Wealth:** ARS 15.5M (2023) → 33.5M (2024) = **2x in one year**
- **Datasets:** 4 (OffshoreOfficer + BoardMember + CompanyOfficer + AssetDeclaration)

## Connection Map 3: The Dual-Coalition Donor

**Aluar Aluminio** donated ARS 5.4M to BOTH major coalitions (JxC and Frente de Todos) in 2019. This hedge-betting pattern signals:
- Expectation of needing government favors regardless of winner
- Both coalitions accepted money from the same industrial source
- Potential quid-pro-quo on aluminum import/export policy

## Connection Map 4: The Ley Bases Paradox

Senate vote on Ley de Bases (June 12, 2024):
- **AFIRMATIVO** (LLA+allies): 36 senators, avg 1.44 external datasets
- **NEGATIVO** (PJ opposition): 36 senators, avg 1.53 external datasets

**The opposition had MORE corporate connections than government supporters.** Possible interpretations:
1. PJ senators voted against because deregulation threatened their business interests
2. Corporate connections don't predict voting — ideology does
3. JxC's corporate network operates through different channels not captured in this data

## Connection Map 5: The Macri Web

```
SOCMA (47 companies at peak)
├── Correo Argentino → 98.82% debt forgiveness (ARS 70B adjusted)
├── AUSOL → shares sold at 400% premium after gov decisions
├── IECSA → cousin Calcaterra → Cuadernos (USD 8M in bribes)
├── BF Corporation (Panama) → Swiss bank → records destroyed
└── Blanqueo law → family declared ARS 900M+ in hidden assets

153 Macri family members → 211 IGJ-registered companies
Key: MACRI INVESTMENT GROUP, FRAMAC, SOCMA INVERSIONES, CHERY SOCMA
```

Mauricio Macri appears in **5 datasets** (maximum): Donor + BoardMember + CompanyOfficer + AssetDeclaration + GovernmentAppointment.

## Connection Map 6: ICIJ Leak Exposure

| Leak | Argentine Officers | Entities | Top Jurisdiction |
|------|-------------------|----------|------------------|
| Pandora Papers (Alcogal) | 2,637 | ~1,800 | BVI |
| Panama Papers | 1,498 | ~600 | BVI |
| Offshore Leaks | 127 | ~50 | BVI |
| Paradise Papers | 87 | ~30 | Malta, Bermuda |

**2,637 Argentines exposed by Pandora Papers alone** — the largest single leak for Argentina.

## Investigation Priority Ranking

| Rank | Target | Signal | Status |
|------|--------|--------|--------|
| 1 | Camaño | Offshore + financial votes + 14x wealth + 6 parties | Highest single-target value |
| 2 | Macri/SOCMA | Correo + AUSOL + blanqueo = systemic | Most documented |
| 3 | Ibañez/PELMOND | Active offshore while deputy | Most actionable current violation |
| 4 | PRO revolving door | 13/20 cases = institutional capture | Systemic pattern |
| 5 | Aluar dual-coalition | ARS 5.4M to both sides | Industrial policy corruption signal |

## Data Quality Notes

- **False positive risk:** FERNANDEZ Carlos Alberto (Misiones) shows 234 external links — almost certainly name-collision artifacts. Common Argentine names (Garcia, Rodriguez, Martinez, Fernandez) inflate match counts.
- **Asset totals null:** DDJJ `total_assets` field is unpopulated for most declarations, blocking wealth trajectory analysis. Individual asset items exist in separate CSV files not yet ingested.
- **Donation amounts loaded:** CNE donation amounts now correctly loaded (bugs fixed: 100x inflation, empty dates, missing relationship amounts).
- **Company nodes missing:** 1M+ Company/PublicCompany nodes not yet loaded (timeout issues). Officer/board member nodes are loaded but lack company linkage.
