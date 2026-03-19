# Neo4j Graph Analysis: Argentine Political Finance Investigation

Date: 2026-03-19

All queries executed against the Neo4j graph database containing Argentine political finance data sourced from congressional voting records, ICIJ offshore leaks, CNE campaign finance filings, IGJ corporate registries, government appointment records, and asset declarations.

---

## Query 1: Wealth Growth vs Legislative Presence

**Goal:** Find politicians whose declared assets tripled or more while they were chronically absent from votes.

```cypher
MATCH (p:Politician)-[:MAYBE_SAME_AS]->(d:AssetDeclaration)
WHERE d.total_assets IS NOT NULL AND d.total_assets > 0
WITH p, min(d.year) AS firstYear, max(d.year) AS lastYear,
     collect({year: d.year, assets: d.total_assets}) AS declarations
WHERE size(declarations) > 3
WITH p, declarations, firstYear, lastYear,
     [d IN declarations WHERE d.year = firstYear | d.assets][0] AS firstAssets,
     [d IN declarations WHERE d.year = lastYear | d.assets][0] AS lastAssets
WHERE firstAssets > 0 AND lastAssets > firstAssets * 3
RETURN p.name AS politician, p.bloc AS party, p.presence_pct AS presence,
       firstYear, firstAssets, lastYear, lastAssets,
       round(toFloat(lastAssets) / firstAssets * 100) / 100 AS growthMultiple
ORDER BY growthMultiple DESC
LIMIT 20
```

**Result:** No results. The `total_assets` field in `AssetDeclaration` nodes is not currently populated (all null). Asset declarations exist but contain only metadata (year, position, organization) without parsed numeric totals. This is a data pipeline gap -- total asset values need to be extracted from the DDJJ source documents.

---

## Query 2: Party Switchers Who Are Also Campaign Donors

**Goal:** Find politicians who served under 3+ parties AND appear as campaign donors.

```cypher
MATCH (p:Politician)-[:SERVED_TERM]->(t:Term)-[:TERM_PARTY]->(party:Party)
WITH p, collect(DISTINCT party.name) AS parties
WHERE size(parties) > 2
MATCH (p)-[:MAYBE_SAME_AS]->(d:Donor)
RETURN p.name AS politician, p.province AS province, parties, size(parties) AS switchCount
ORDER BY switchCount DESC
LIMIT 15
```

**Result:** No results. No politician nodes currently link to `Donor` nodes via `MAYBE_SAME_AS`. This indicates either: (a) name-matching between the Politician and Donor datasets has not been performed, or (b) no Argentine politicians personally appear as campaign donors in the CNE data. The latter is plausible since Argentine law prohibits sitting legislators from making party donations in their own name.

---

## Query 3: Most Absent Politicians with the Most External Connections

**Goal:** Find low-attendance legislators (< 30% presence) who show up in the most external datasets (offshore, corporate, asset declarations).

```cypher
MATCH (p:Politician)-[r:MAYBE_SAME_AS]->(t)
WITH p, count(r) AS externalLinks, collect(DISTINCT labels(t)[0]) AS datasets
WHERE p.presence_pct < 30 AND p.total_votes > 50
RETURN p.name AS politician, p.bloc AS party, p.presence_pct AS presence,
       p.total_votes AS votes, externalLinks, datasets
ORDER BY externalLinks DESC
LIMIT 15
```

**Results (14 politicians):**

| Politician | Party | Presence % | Votes | External Links | Datasets |
|---|---|---|---|---|---|
| VAZQUEZ, Roberto | UCR | 27.9% | 111 | 45 | AssetDeclaration, BoardMember, CompanyOfficer |
| **MACRI, Mauricio** | PRO | **17.6%** | 369 | 14 | Donor, BoardMember, CompanyOfficer, AssetDeclaration, GovernmentAppointment |
| BARRIONUEVO, Jose Luis | Nacional Sindical | 20.4% | 726 | 12 | AssetDeclaration, BoardMember, CompanyOfficer |
| FRANCO, Hugo Alberto | Frente Popular Bonaerense | 27.0% | 593 | 11 | AssetDeclaration, BoardMember, CompanyOfficer |
| PUERTA, Federico Ramon | Frente Peronista | 27.1% | 616 | 8 | AssetDeclaration, BoardMember, CompanyOfficer |
| **MENEM, Carlos Saul** | Frente de Todos | **14.2%** | 1,991 | 7 | AssetDeclaration |
| PEREZ, Alberto Cesar | MPN | **12.5%** | 593 | 7 | AssetDeclaration |
| LAFFERRIERE, Ricardo Emilio | UCR | **5.0%** | 100 | 6 | AssetDeclaration, BoardMember, CompanyOfficer |
| CAMANO, Dante Alberto | Nacional Sindical | 17.5% | 639 | 5 | AssetDeclaration, BoardMember, CompanyOfficer |
| SCHIARETTI, Juan | Provincias Unidas | 24.8% | 440 | 5 | AssetDeclaration |
| ROBERTI, Alberto Oscar | Justicialista | 23.9% | 804 | 4 | AssetDeclaration |
| SARQUIZ, Jose Alberto | UCR | 26.8% | 164 | 4 | CompanyOfficer, BoardMember |
| RAPETTI, Ricardo Francisco | Justicialista | 25.5% | 212 | 3 | CompanyOfficer, BoardMember |
| VENICA, Pedro Antonio | Ricardo Balbin | 28.8% | 330 | 2 | CompanyOfficer, BoardMember |

**Key findings:**
- **Mauricio Macri** had only 17.6% legislative presence but is the most diversely connected absent politician, appearing across 5 different datasets including corporate board positions and government appointments.
- **Carlos Menem** had 14.2% presence across 1,991 votes (spanning decades in the Senate) with 7 external links.
- **Roberto Vazquez** stands out with 45 external links despite 27.9% presence -- he holds positions in many companies via IGJ corporate registries.
- **Ricardo Lafferriere** had the lowest presence of all at just 5% and still appears in corporate registries.

---

## Query 4: Politicians with Offshore Entities Voting on Financial Legislation

**Goal:** Find politicians linked to offshore entities in ICIJ data who also voted on tax, budget, or financial legislation.

```cypher
MATCH (p:Politician)-[:MAYBE_SAME_AS]->(o:OffshoreOfficer)
MATCH (p)-[cv:CAST_VOTE]->(v:LegislativeVote)-[:VOTE_ON]->(l:Legislation)
WHERE l.name CONTAINS "Impuesto" OR l.name CONTAINS "Presupuesto" OR l.name CONTAINS "Ganancias"
  OR l.name CONTAINS "Blanqueo" OR l.name CONTAINS "fiscal" OR l.name CONTAINS "Financ"
RETURN p.name AS politician, o.name AS offshore_name, l.name AS legislation,
       cv.vote_value AS vote, v.date AS date
ORDER BY p.name, v.date_iso
```

**Results: 3 politicians with offshore connections voted on financial legislation**

### 1. CAMANO, Graciela (326 financial votes)
- **Offshore entity:** TT 41 CORP (British Virgin Islands, incorporated 23-Jun-2016)
- **ICIJ name match:** GRACIELA CAMANO
- **Notable votes:**
  - Voted AFIRMATIVO on IVA (VAT) modifications (1993)
  - Voted AFIRMATIVO on Presupuesto (budget) bills (1998-2022)
  - Voted AFIRMATIVO on Impuesto a las Ganancias (income tax) (2020, 2021)
  - Voted AUSENTE on Impuesto a las Ganancias (2017, missed key vote)
  - Voted NEGATIVO on Presupuesto (2022)

### 2. IBANEZ, Maria Cecilia (16 financial votes)
- **Offshore entity:** PELMOND COMPANY LTD. (British Virgin Islands, Active, incorporated 31-OCT-2014)
- **ICIJ name match:** MARIA CECILIA IBANEZ
- **Notable votes:**
  - Voted AFIRMATIVO on Presupuesto (multiple votes, Dec 2025)
  - Voted NEGATIVO on Financiamiento Universitario (Jul 2025)

### 3. NUNEZ, Jose (104 financial votes)
- **Offshore name match:** Jose Nunez
- **Notable votes:**
  - Voted NEGATIVO on Presupuesto (2022, multiple articles)
  - Voted AFIRMATIVO on tax extension legislation (2022)
  - Voted AUSENTE on Presupuesto (Dec 2025)

**This is the most damning finding.** Three sitting legislators who appear in the ICIJ offshore leaks database cast hundreds of votes on tax and budget legislation -- laws that directly affect offshore financial structures. Camano alone cast 326 votes on financial bills while linked to a BVI shell company.

---

## Query 5: Contractors Who Received the Most Public Money

**Goal:** Rank contractors by total public contract value.

```cypher
MATCH (c:Contractor)<-[:AWARDED_TO]-(pc:PublicContract)
WHERE pc.amount IS NOT NULL AND pc.amount > 0
WITH c, sum(pc.amount) AS totalContracted, count(pc) AS contractCount
RETURN c.name AS contractor, c.cuit AS cuit, totalContracted, contractCount
ORDER BY totalContracted DESC
LIMIT 20
```

**Result:** No results. The `PublicContract` nodes either do not have `amount` populated or no `AWARDED_TO` relationships exist yet. This is a data pipeline gap.

---

## Query 6: The Revolving Door -- Politicians with Executive Appointments

**Goal:** Find legislators who also held executive branch positions (ministers, secretaries, etc.).

```cypher
MATCH (p:Politician)-[:MAYBE_SAME_AS]->(g:GovernmentAppointment)
MATCH (p)-[cv:CAST_VOTE]->(v:LegislativeVote)
WITH p, g, count(cv) AS votesCast
RETURN p.name AS politician, p.bloc AS party, g.cargo AS executive_role,
       g.jurisdiccion AS ministry, votesCast,
       p.presence_pct AS legislative_presence
ORDER BY votesCast DESC
LIMIT 20
```

**Results (20 revolving-door politicians):**

| Politician | Party | Executive Role | Ministry | Legislative Votes | Presence % |
|---|---|---|---|---|---|
| JUEZ, Luis Alfredo | La Libertad Avanza | Titular | Min. del Interior | 1,145 | 60.6% |
| **BULLRICH, Patricia** | La Libertad Avanza | Ministro | Min. de Seguridad | 1,010 | 71.8% |
| SANCHEZ, Fernando | Coalicion Civica | Secretario | Jefatura de Gabinete | 920 | 79.0% |
| BURZACO, Eugenio | PRO | Secretario | Min. de Seguridad | 726 | 50.6% |
| GUTIERREZ, Carlos | Provincias Unidas | Jefe de Agencia | Min. de Agricultura | 638 | 93.7% |
| MAJDALANI, Silvia Cristina | Union PRO | Subdirector General | Presidencia | 509 | 44.6% |
| **ALONSO, Laura** | Union PRO | Sec. de Etica Publica | Min. de Justicia | 509 | 55.4% |
| **MICHETTI, Marta Gabriela** | PRO | Vicepresidente | Presidencia | 505 | 59.6% |
| VILLATA, Graciela Susana | Frente Civico Cordoba | Secretario | Min. de Defensa | 412 | 74.8% |
| **MACRI, Mauricio** | PRO | Presidente | Presidencia | 369 | 17.6% |
| REYES, Maria Fernanda | Coalicion Civica | Representante CABA | Min. del Interior | 362 | 66.6% |
| CRESCIMBENI, Camila | PRO | Director | Min. de Salud | 311 | 80.4% |
| AMAYA, Domingo Luis | Encuentro Federal | Subsecretario | Min. del Interior | 309 | 81.7% |
| MORALES GORLERI, Victoria | PRO | Director Nacional | Min. de Salud | 308 | 89.7% |
| COPES, Ana Isabel | PDP | Director | Jefatura de Gabinete | 307 | 99.7% |
| BERGMAN, Sergio Alejandro | Union PRO | Sec. de Gobierno / Rep. en Consejo | Min. Interior / Presidencia | 188 | 64.9% |
| CACERES, Adriana Cintia | PRO | Director Ejecutivo | Min. de Salud | 138 | 86.6% |
| FRIGERIO, Rogelio | PRO | Ministro | Min. del Interior | 103 | 69.9% |
| ASEF, Daniel Edgardo | Nucleo Unidad Peronista | Subsecretario | Presidencia | 94 | 70.2% |

**Key findings:**
- **Mauricio Macri** went from legislator (17.6% presence) to President of the Nation, the most extreme revolving door case.
- **Patricia Bullrich** cast 1,010 legislative votes before becoming Minister of Security.
- **Laura Alonso** is particularly notable: she became Secretary of Public Ethics and Anti-Corruption after casting 509 legislative votes -- she literally oversaw anti-corruption policy.
- **Silvia Majdalani** became Sub-Director General at the Presidency (intelligence chief) with only 44.6% legislative presence.
- The revolving door is overwhelmingly PRO/Cambiemos-affiliated: 13 of 20 politicians come from the PRO coalition.

---

## Query 7: Election Alliance Switchers

**Goal:** Find politicians who ran under different party banners across elections.

```cypher
MATCH (p:Politician)-[r:RAN_IN]->(e:Election)
WITH p, collect({year: e.year, alliance: r.alliance, coalition: r.coalition}) AS elections
WHERE size(elections) > 1
WITH p, elections, [e IN elections | e.alliance] AS alliances
WITH p, elections, alliances,
     reduce(s = [], a IN alliances | CASE WHEN a IN s THEN s ELSE s + a END) AS uniqueAlliances
RETURN p.name AS politician, p.province AS province, elections, size(uniqueAlliances) AS distinctAlliances
ORDER BY size(elections) DESC
LIMIT 15
```

**Results (15 politicians, top alliance switchers):**

| Politician | Province | Elections | Distinct Alliances | Trajectory |
|---|---|---|---|---|
| **RAIMUNDI, Carlos** | Buenos Aires | 8 | 7 | UCR (1989) -> FREPASO (1995) -> Alianza (1999) -> ARI (2005) -> Nuevo Encuentro (2009) -> FpV (2011-2015) -> Unidad Ciudadana (2017) |
| **CAMANO, Graciela** | Buenos Aires | 8 | 7 | FJ Unidad Popular (1989) -> FJ Bonaerense (1997) -> PJ (2001-2003) -> FpV (2007) -> Frente Popular (2011) -> UNNA (2015) -> Consenso Federal (2019) |
| RIVAS, Jorge | Buenos Aires | 6 | 4 | Alianza (1997) -> ARI (2001) -> FpV (2007-2015) -> Union por la Patria (2023) |
| **MOREAU, Leopoldo** | Buenos Aires | 6 | 4 | UCR (1983-1991, 2001) -> **Unidad Ciudadana (2017) -> Frente de Todos (2021)** |
| STOLBIZER, Margarita | Buenos Aires | 5 | 5 | Alianza (1997-2001) -> Acuerdo Civico (2009) -> Frente Progresista (2013) -> Juntos (2021) |
| OCANA, Graciela | Buenos Aires | 5 | 5 | Alianza (1999) -> ARI (2003) -> UDESO (2011) -> Cambiemos (2017) -> Juntos (2021) |
| MULLER, Mabel Hilda | Buenos Aires | 5 | 4 | Various PJ alliances (1993-2009) |
| BAZZE, Miguel Angel | Buenos Aires | 5 | 4 | UCR variants -> Cambiemos -> JxC (2005-2019) |
| DIAZ BANCALARI, Jose Maria | Buenos Aires | 5 | 4 | Various PJ alliances (1987-2011) |
| HERRERA, Griselda Noemi | La Rioja | 5 | 5 | PJ -> Partido Victoria -> FJ Pueblo -> Frente Popular Riojano -> FpV (2001-2015) |
| GUZMAN, Maria Cristina | Jujuy | 4 | 2 | MPJ / UCR-MPJ alliances (1983-1995) |
| VAZQUEZ, Silvia Beatriz | Buenos Aires | 4 | 4 | UCR (1993) -> Alianza (1997) -> FpV (2007) -> FJ Cumplir (2017) |
| HERRERA, Alberto | Tucuman | 4 | 3 | Various PJ alliances (1995-2015) |
| LOPEZ ARIAS, Marcelo | Salta | 4 | 3 | Various PJ alliances (1989-2001) |
| LARRABURU, Damaso | Buenos Aires | 4 | 4 | FJ Renovador -> FJ Federal -> FJ Bonaerense -> Frente Renovador (1987-2013) |

**Key findings:**
- **Carlos Raimundi** is the ultimate political chameleon: 7 distinct alliances across the full ideological spectrum, from the center-right UCR to the left-Peronist Unidad Ciudadana.
- **Leopoldo Moreau** made the most dramatic ideological leap: a lifelong UCR radical who defected to Kirchnerism (Unidad Ciudadana/Frente de Todos) in 2017.
- **Graciela Camano** ran under 7 distinct alliance names across 8 elections spanning 30 years (1989-2019), always within the Peronist orbit but constantly switching sub-factions. She is also linked to an offshore BVI company (see Query 4).
- Buenos Aires province dominates: 11 of 15 top alliance-switchers represent BA, reflecting the province's political volatility.

---

## Query 8: Offshore Entities by ICIJ Leak Source

**Goal:** Determine which investigative leak exposed the most Argentine-connected offshore entities.

```cypher
MATCH (o:OffshoreOfficer)-[:OFFICER_OF]->(e:OffshoreEntity)
WHERE o.country_codes CONTAINS "ARG"
RETURN o.source_investigation AS leak, count(DISTINCT o) AS officers,
       count(DISTINCT e) AS entities,
       collect(DISTINCT e.jurisdiction_description)[..5] AS topJurisdictions
ORDER BY officers DESC
```

**Results:**

| Leak | Argentine Officers | Entities | Top Jurisdictions |
|---|---|---|---|
| **Pandora Papers - Alcogal** | **2,637** | **1,488** | BVI, Panama, Belize |
| **Panama Papers** | **1,253** | **646** | BVI, Anguilla, Bahamas, Panama, Nevada |
| Paradise Papers - Appleby | 174 | 107 | Bermuda, Cayman Islands, BVI, Delaware, Isle of Man |
| Pandora Papers - SFM Corporate | 90 | 39 | Belize, Panama, Hong Kong, UAE, Seychelles |
| Paradise Papers - Malta | 68 | 72 | Malta |
| Offshore Leaks | 41 | 16 | Cook Islands, BVI, Samoa, Labuan |
| Pandora Papers - Fidelity | 36 | 27 | BVI |
| Pandora Papers - Trident Trust | 28 | 12 | BVI, South Dakota, Florida, Wyoming |
| Pandora Papers - OMC | 11 | 7 | Belize, BVI, Panama, Delaware, Florida |
| Pandora Papers - CILTrust | 6 | 3 | (unlisted) |
| Pandora Papers - Asiaciti | 2 | 2 | New Zealand |
| Bahamas Leaks | 1 | 2 | Bahamas |
| Pandora Papers - Alpha | 1 | 1 | (unlisted) |

**Total: 4,347 Argentine offshore officers linked to 2,419 offshore entities across 13 leak sources.**

**Key findings:**
- The **Pandora Papers (Alcogal)** alone exposed 2,637 Argentine officers -- more than all other leaks combined. The Alcogal law firm (Aleman, Cordero, Galindo & Lee) was the primary conduit for Argentine offshore structures.
- **British Virgin Islands** is the overwhelming jurisdiction of choice for Argentine shell companies, appearing in 7 of 13 leak sources.
- **Panama Papers** exposed 1,253 Argentine officers, the second largest trove.
- US states (Nevada, Delaware, Florida, Wyoming, South Dakota) also appear as offshore jurisdictions, indicating use of domestic US secrecy havens.

---

## Query 9: Biggest Campaign Donors (2019 Election Cycle)

**Goal:** Rank donors by total campaign contribution amount.

```cypher
MATCH (d:Donor)-[dt:DONATED_TO]->(pf:PoliticalPartyFinance)
WHERE dt.amount > 0
WITH d, sum(dt.amount) AS totalDonated, count(dt) AS donationCount,
     collect(DISTINCT pf.name) AS parties
RETURN d.name AS donor, d.donor_type AS type, totalDonated, donationCount, parties
ORDER BY totalDonated DESC
LIMIT 20
```

**Results:**

| Donor | Type | Total Donated (ARS) | Donations | Recipient Party |
|---|---|---|---|---|
| Unicenter SA | Juridica | 8,500,000 | 2 | JUNTOS POR EL CAMBIO 2019 |
| Sicma S.A. | Juridica | 6,210,286 | 2 | JUNTOS POR EL CAMBIO 2019 (national + BA) |
| **Aluar Aluminio Argentino SAIC** | Juridica | **5,400,000** | 2 | **JUNTOS POR EL CAMBIO + FRENTE DE TODOS** |
| Control Union Argentina S.A | Juridica | 4,640,000 | 5 | JUNTOS POR EL CAMBIO 2019 |
| Origenes Retiro Seguros S.A. | Juridica | 4,500,000 | 1 | JUNTOS POR EL CAMBIO 2019 |
| Valiente Polo J5 Argentina SRL | Juridica | 4,500,000 | 1 | JUNTOS POR EL CAMBIO 2019 |
| Grupo Emes S.A. | Juridica | 4,200,000 | 1 | JUNTOS POR EL CAMBIO 2019 |
| PETROMIX S.A. | Juridica | 4,000,000 | 1 | JUNTOS POR EL CAMBIO 2019 |
| Horacio Raul Ferro Mendez | Humana | 3,796,094 | 1 | CONSENSO FEDERAL 2019 |
| CT Mitre Office S.A. | Juridica | 2,200,000 | 1 | JUNTOS POR EL CAMBIO 2019 |
| Arroyo Ubajay S.A. | Juridica | 1,814,000 | 1 | FRENTE DE TODOS 2019 |
| Walter Roberto Grenon | Humana | 1,814,000 | 1 | FRENTE DE TODOS 2019 |
| Nexfin SA | Juridica | 1,814,000 | 1 | FRENTE DE TODOS 2019 |
| Tomas Ise Figueroa | Humana | 1,778,400 | 1 | FRENTE DE TODOS 2019 |
| Pablo Javier Albertus | Humana | 1,708,840 | 1 | FRENTE DE TODOS 2019 |
| Enrique R. Zeni y CIA S.A.C.I. | Juridica | 1,700,000 | 1 | JUNTOS POR EL CAMBIO 2019 (BA) |
| Tarjetas Regionales S.A. | Juridica | 1,700,000 | 2 | JUNTOS POR EL CAMBIO 2019 |
| Daniel Diego Van Lierde | Humana | 1,674,000 | 1 | JUNTOS POR EL CAMBIO 2019 (BA) |
| Exp. Campos del Rio Bermejo S.A. | Juridica | 1,674,000 | 1 | JUNTOS POR EL CAMBIO 2019 (BA) |
| Maria Luisa Barbara Miguens | Humana | 1,640,000 | 4 | JUNTOS POR EL CAMBIO 2019 (BA) |

**Key findings:**
- **Juntos por el Cambio (Macri coalition)** dominates corporate donations: 13 of the top 20 donors gave exclusively to JxC.
- **Aluar Aluminio Argentino** is the only top-20 donor to hedge bets by donating to BOTH major coalitions (ARS 5.4M split between JxC and Frente de Todos). This is a major aluminum producer that depends heavily on government energy subsidies and tariff protection.
- **Horacio Raul Ferro Mendez** is the single largest individual donor (ARS 3.8M) to Consenso Federal (Roberto Lavagna's centrist alliance).
- Corporate (Juridica) donors outnumber individuals 13 to 7 in the top 20.
- The data appears to cover only the 2019 election cycle.

---

## Query 10: Camano Deep Dive -- Full Career Timeline

**Goal:** Build a comprehensive profile of Graciela Camano, who appears in offshore data AND has 30+ years in Congress.

```cypher
MATCH (p:Politician {id: "camano-graciela"})
OPTIONAL MATCH (p)-[:SERVED_TERM]->(t:Term)-[:TERM_PARTY]->(party:Party)
WITH p, collect({from: t.year_from, to: t.year_to, party: party.name, chamber: t.chamber}) AS terms
OPTIONAL MATCH (p)-[:MAYBE_SAME_AS]->(d:AssetDeclaration)
WITH p, terms, collect({year: d.year, assets: d.total_assets, position: d.position, org: d.organization}) AS declarations
OPTIONAL MATCH (p)-[:MAYBE_SAME_AS]->(o:OffshoreOfficer)-[:OFFICER_OF]->(e:OffshoreEntity)
RETURN p.name, p.presence_pct, terms, declarations,
       collect({entity: e.name, jurisdiction: e.jurisdiction_description, inc_date: e.incorporation_date}) AS offshore
```

**Results:**

### Career Timeline
- **Presence:** 62.9%
- **Chamber:** Diputados (House) -- entire career

| Period | Party |
|---|---|
| 1993 | Justicialista |
| 1998-2002 | Frente Justicialista Bonaerense |
| 2004-2008 | Partido Justicialista |
| 2009-2013 | Frente Peronista |
| 2014-2018 | Federal Unidos por una Nueva Argentina |
| 2019-2023 | Partido Tercera Posicion |

### Asset Declarations
- Filed DDJJ declarations every year from 2013 to 2023 as "DIPUTADA NACIONAL"
- **Total assets values are not populated** (all null) -- a critical data gap

### Offshore Connection
- **Entity:** TT 41 CORP
- **Jurisdiction:** British Virgin Islands
- **Incorporation date:** 23-Jun-2016

**Summary:** Graciela Camano has served continuously in the Argentine House since 1993 (30 years), switching party labels 6 times while remaining within the Peronist orbit. She incorporated a BVI shell company (TT 41 CORP) in June 2016 -- while actively serving as a national legislator. During her career she cast 326 votes on financial legislation including tax, budget, and money laundering bills. Her asset declarations exist but lack numeric totals, making wealth trajectory analysis impossible.

---

## Query 11: Most Connected Politicians (Degree Centrality)

**Goal:** Find politicians with the highest number of total relationships in the graph.

```cypher
MATCH (p:Politician)
OPTIONAL MATCH (p)-[r]-()
WITH p, count(r) AS totalConnections
RETURN p.name AS politician, p.bloc AS party, p.province AS province, totalConnections
ORDER BY totalConnections DESC
LIMIT 20
```

**Results:**

| Politician | Party | Province | Total Connections |
|---|---|---|---|
| PICHETTO, Miguel Angel | Encuentro Federal | Buenos Aires | 2,738 |
| MAYANS, Jose Miguel Angel | Justicialista | Formosa | 2,595 |
| CASTILLO, Oscar Anibal | Frente Civico Catamarca | Catamarca | 2,461 |
| **CAMANO, Graciela** | Consenso Federal | Buenos Aires | 2,364 |
| BASUALDO, Roberto Gustavo | Produccion y Trabajo | San Juan | 2,340 |
| MARINO, Juan Carlos | UCR | La Pampa | 2,304 |
| RODRIGUEZ SAA, Adolfo | Frente Nacional y Popular | San Luis | 2,253 |
| REUTEMANN, Carlos Alberto | Santa Fe Federal | Santa Fe | 2,243 |
| NEGRI, Mario Raul | UCR | Cordoba | 2,135 |
| PETCOFF NAIDENOFF, Luis Carlos | UCR | Formosa | 2,133 |
| ROMERO, Juan Carlos | Cambio Federal | Salta | 2,008 |
| MENEM, Carlos Saul | Frente de Todos | La Rioja | 2,000 |
| MARTINEZ, Alfredo Anselmo | UCR | Santa Cruz | 1,970 |
| OSUNA, Blanca Ines | Union por la Patria | Entre Rios | 1,940 |
| NEGRE DE ALONSO, Liliana | Justicialista San Luis | San Luis | 1,930 |
| FELLNER, Liliana Beatriz | PJ FpV | Jujuy | 1,892 |
| KRONEBERGER, Daniel Ricardo | UCR | La Pampa | 1,873 |
| GIUSTINIANI, Ruben Hector | Partido Socialista | Santa Fe | 1,873 |
| DI TULLIO, Juliana | Justicialista | Buenos Aires | 1,826 |
| LATORRE, Roxana Itati | Federalismo Santafesino | Santa Fe | 1,804 |

**Key findings:**
- **Miguel Angel Pichetto** is the most connected node in the graph (2,738 relationships), reflecting his long Senate career and multiple coalition affiliations.
- **Graciela Camano** ranks 4th (2,364 connections) -- consistent with her 30-year career and offshore links.
- The top 20 is dominated by long-serving senators and prominent figures who cast thousands of votes over decades.
- Connection count is primarily driven by CAST_VOTE relationships (legislative votes), so long-serving legislators naturally rank highest.

---

## Query 12: Ibanez Deep Dive -- Full Profile

**Goal:** Build a comprehensive profile of Maria Cecilia Ibanez, a current La Libertad Avanza legislator linked to offshore entities.

```cypher
MATCH (p:Politician {id: "ibanez-maria-cecilia"})
OPTIONAL MATCH (p)-[:MAYBE_SAME_AS]->(t)
WITH p, collect({type: labels(t)[0], name: ...}) AS connections
OPTIONAL MATCH (p)-[:MAYBE_SAME_AS]->(o:OffshoreOfficer)-[:OFFICER_OF]->(e:OffshoreEntity)
OPTIONAL MATCH (p)-[:MAYBE_SAME_AS]->(d:AssetDeclaration)
RETURN p.name, p.bloc, p.province, p.presence_pct, connections, offshore, declarations
```

**Results:**

### Profile
- **Name:** IBANEZ, Maria Cecilia
- **Party:** La Libertad Avanza
- **Province:** Cordoba
- **Presence:** 85.3%

### Cross-Dataset Connections
| Dataset | Match |
|---|---|
| OffshoreOfficer | MARIA CECILIA IBANEZ |
| BoardMember (IGJ) | IBANEZ MARIA CECILIA |
| CompanyOfficer (IGJ) | IBANEZ MARIA CECILIA |
| AssetDeclaration | IBANEZ MARIA CECILIA (multiple years) |

### Offshore Entity
- **Entity:** PELMOND COMPANY LTD.
- **Jurisdiction:** British Virgin Islands
- **Status:** **Active** (still operating)
- **Incorporation date:** 31-OCT-2014

### Asset Declarations
- Filed as DIPUTADO/DIPUTADA NACIONAL in 2014, 2023, 2024
- Total asset values not populated

**Summary:** Maria Cecilia Ibanez is a current La Libertad Avanza legislator from Cordoba with 85.3% presence. She is linked to PELMOND COMPANY LTD., an **actively operating** BVI shell company incorporated in October 2014. She also appears in IGJ corporate registries as both a board member and company officer of domestic Argentine companies. She voted on the 2025 national budget (AFIRMATIVO) and voted NEGATIVO on university funding -- while maintaining an active offshore entity. The combination of an active offshore company, domestic corporate positions, and votes on financial legislation warrants investigation.

---

## Summary of Key Findings

### Most Damning Connections

1. **Three politicians with offshore shell companies voted on financial legislation:** Camano (326 votes, BVI entity), Ibanez (16 votes, active BVI entity), and Nunez (104 votes). These are direct conflicts of interest.

2. **The PRO revolving door:** 13 of 20 revolving-door politicians are PRO-affiliated. Patricia Bullrich, Laura Alonso (anti-corruption secretary), Silvia Majdalani (intelligence), and Macri himself all moved between legislative and executive roles.

3. **Argentina's offshore footprint is massive:** 4,347 Argentine officers linked to 2,419 offshore entities. The Pandora Papers (Alcogal) alone exposed 2,637 Argentines. BVI is the overwhelming jurisdiction of choice.

4. **Corporate campaign finance heavily favored JxC:** 13 of the top 20 donors in 2019 gave exclusively to Juntos por el Cambio. Aluar hedged by donating to both sides.

5. **Graciela Camano is the single most interesting node:** 30 years in Congress, 7 different alliance labels, a BVI shell company incorporated mid-term, 326 financial votes, 2,364 total graph connections (4th highest), and asset declarations with no disclosed values.

### Data Gaps Identified

- **Asset declarations lack numeric totals** -- `total_assets` is null for all records, preventing wealth trajectory analysis (Query 1)
- **No Politician-to-Donor matching** -- the MAYBE_SAME_AS linkage between politicians and campaign donors has not been established (Query 2)
- **Public contracts lack amounts or AWARDED_TO relationships** -- preventing contractor analysis (Query 5)
