# Voting Pattern Analysis - 33 Years of Argentine Legislative Data

## Data Coverage
- **Diputados:** 2,901 voting sessions (1993-2026)
- **Senadores:** 2,598 voting sessions (1983-2026)
- **Platform totals:** 2,258 politicians, 4,353 votes, 2,997 terms, 1,467 donors

## Key Findings

### 1. Privatization Votes (Menem Era)
- 338 politicians voted on privatization legislation
- 799 AFIRMATIVO, 572 NEGATIVO, 551 AUSENTE, 24 ABSTENCION
- **Critical gap:** 1989-1992 vote records missing (Reforma del Estado, Law 23.696)

### 2. Party Switchers (4+ parties)
- 18 politicians served in 4+ party labels
- **Anomalous:** Bullrich (PJ→LLA), Pichetto (FpV→JxC), Camaño (6 parties)
- Party-switcher × longevity overlap = career survivorship signal

### 3. Longest-Serving (5+ terms)
- 13 politicians with 5+ terms
- Camaño, Conti, Negri, Osuna, Pichetto: 6 terms each

### 4. Donor-Company Politicians
- Macri: 4+ company links + donor + RELATED_TO Caputo
- Recalde: 7 company links (Aerolíneas)
- Sánchez: 18 connections (possible false positive)

### 5. Temporal Coverage Gaps
- **1984-1992:** No vote records (critical privatization era)
- 1993-2001: Sparse (22-54/year)
- 2004+: Dense coverage (200-317/year)

### 6. Legislation Sectors
- 86% unclassified (3,299/3,827)
- Finance: 283, Labor: 59, Security: 57, Health: 31, Energy: 23

### 7. Coalition Structure
- PJ: 1,139 | UCR: 468 | JxC: 146 | LLA: 117

## Expansion Targets (Top Connected, Not Yet Investigated)
| Politician | Connections | Priority |
|-----------|------------|----------|
| PICHETTO Miguel Angel | 2,738 | HIGH - Kirchner→Macri pivot |
| MAYANS José Miguel | 2,595 | MEDIUM - Formosa dynasty |
| RODRÍGUEZ SAÁ Adolfo | 2,253 | HIGH - San Luis dynasty, defaulted on debt |
| REUTEMANN Carlos Alberto | 2,243 | MEDIUM - Santa Fe, deceased |
| NEGRI Mario Raúl | 2,135 | MEDIUM - UCR leader |

## Technical Notes
- Vote values are on CAST_VOTE relationship (`cv.vote_value`), not vote node
- 951K CompanyOfficer, 860K BoardMember, 398K Company nodes available for cross-reference
- Only a fraction cross-referenced against 2,997 political terms via MAYBE_SAME_AS
