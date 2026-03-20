## Summary

Argentine political finance investigation platform — 8 ETL pipelines cross-referencing public data sources, 5.39M-node Neo4j graph, factchecked investigation pages, and a 9-chapter investigative narrative in Spanish.

### ETL Pipelines (8 data sources integrated)
- **Como Voto** extension — Terms, Legislation, Elections (920K votes, 2,997 terms, 3,827 legislation, 21 elections)
- **ICIJ Offshore Leaks** — Panama/Pandora/Paradise Papers filtered to Argentine connections (4,349 officers, 2,422 entities)
- **CNE Campaign Finance** — aportantes.electoral.gob.ar (1,714 donations with amounts, 1,467 donors)
- **Boletín Oficial** — government appointments + public contracts from datos.gob.ar (6,044 appointments, 22,280 contracts)
- **IGJ Corporate Registry** — company officers from datos.jus.gob.ar (951,863 officers, 1,060,769 companies)
- **CNV/IGJ Board Members** — corporate board members with DNI (1,528,931 entries)
- **DDJJ Patrimoniales** — sworn asset declarations 2012-2024 from datos.jus.gob.ar (718,865 declarations)
- **Cross-enrichment** engine matching entities across all datasets

### Investigation Pages (`/caso/finanzas-politicas/`)
- 5-tab case layout: Inicio, Investigación, Cronología, El Dinero, Conexiones
- 9 factcheck items (confirmed/alleged/cleared) with source URLs and tier indicators
- 10 timeline events (1976-2024) color-coded by category
- 9 key actors with dataset counts
- 5 money flows with ARS formatting
- Force-directed graph visualization with color-coded nodes (react-force-graph-2d)
- API route serving Neo4j data (`/api/caso/finanzas-politicas/graph`)
- Bilingual (ES/EN) language toggle on investigation page
- Legal disclaimer footer

### Investigation Findings (10 verified targets)
1. **Camaño** — BVI offshore (TT 41 CORP, Pandora Papers) created during term, 14x wealth growth, 326 financial votes, 6 party switches, Bellota SA with husband Barrionuevo
2. **Macri/SOCMA** — 153 family × 211 companies, Correo Argentino 98.82% debt forgiveness, AUSOL 400% share premium, blanqueo ARS 900M+, MINERA GEOMETALES board with Luksic+Grindetti+Composto
3. **Ibañez** — active BVI offshore (PELMOND) while sitting LLA deputy, wealth doubled in one year
4. **De Narváez** — 37 company boards, 5 ICIJ entities (Titan Consulting, Retrato Partners), Walmart Argentina, $500M+ fortune
5. **Grindetti** — Mercier International (Panama) + Clariden Leu (Swiss bank) + 9 Brazilian tax cases + SOCMA cadre since 1979
6. **Kueider** — $211K cash at Paraguay border, BETAIL/EDEKOM shell companies, expelled from Senate, 7 associates arrested
7. **PENSAR ARGENTINA** — 19 politicians confirmed by DNI + Nicolás Caputo on same registered board
8. **Lousteau** — LCG SA billed Congress $1.69M while serving as senator, criminal charges filed
9. **Mining conflicts** — Macri, Morales, Yarade voted on mining legislation while sitting on mining company boards
10. **Aluar** — ARS 5.4M donated to both major coalitions (hedge-bet)

### Investigation Documents
- `narrative-finanzas-politicas.md` — 9-chapter Spanish investigative journalism piece (restructured as cohesive story)
- `argentina-political-finance-summary.md` — bilingual (ES/EN) executive summary
- `macri-family-dossier.md` — comprehensive SOCMA/offshore/Correo/AUSOL/blanqueo analysis
- `connection-maps.md` — 16 documented connection patterns
- `graph-analysis-queries.md` — 12 investigative Cypher queries with results
- `exploratory-run-closing.md` — methodology, limitations, false positives, next steps

### Graph Infrastructure
- 5.39M nodes, 6.22M relationships
- 10,159 MAYBE_SAME_AS politician matches (confidence-scored, match_method tracked)
- 1,781,881 SAME_PERSON DNI-matched officer↔board member links
- 21,647 OFFICIAL_FILED DDJJ↔appointment links
- Neo4j uniqueness constraints on all node types
- Configurable query timeout via NEO4J_QUERY_TIMEOUT_MS

### Data Quality
- 50/50 politician-donor matches verified (0 false positives)
- 4 common-name false positives identified and cleaned (Romero, Fernández, Martínez, López)
- Confidence scores (0.7-0.8) on all MAYBE_SAME_AS relationships
- `match_method` metadata on every match relationship
- Factchecked twice by independent agents — 0 incorrect claims

## Test plan
- [x] `npx tsc --noEmit` compiles with zero TypeScript errors
- [x] All 8 ETL pipelines run successfully with zero load errors
- [x] Investigation pages render at `/caso/finanzas-politicas/`
- [x] Graph API returns data at `/api/caso/finanzas-politicas/graph`
- [x] Cross-enrichment script runs idempotently
- [x] All factcheck claims independently verified via WebSearch
- [ ] Manual review of all page content for accuracy
- [ ] Mobile responsiveness check

🤖 Generated with [Claude Code](https://claude.com/claude-code)
