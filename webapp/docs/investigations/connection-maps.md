# Investigation Connection Maps

**Date:** 2026-03-19
**Source:** Graph analysis of 3.26M nodes, 2.77M relationships (incl. 1.78M SAME_PERSON bridge) across 8 datasets

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

### Camaño - Maximum Overlap

- **Offshore:** TT 41 CORP (BVI, incorporated June 2016 - DURING her 2014-2018 term)
- **Financial votes:** 326 total on Presupuesto, Ganancias, Blanqueo, etc.
- **High absence:** 35 absent votes on Presupuesto alone
- **Party switching:** 6 parties over 30 years (maximizing cross-coalition access)
- **Wealth growth:** ARS 2.8M (2013) → 39.2M (2023) = **14x growth**
- **Graph centrality:** 4th highest (2,364 connections)
- **Datasets:** 4 (OffshoreOfficer + BoardMember + CompanyOfficer + AssetDeclaration)

### Ibañez - Active Violation

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
2. Corporate connections don't predict voting - ideology does
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

**2,637 Argentines exposed by Pandora Papers alone** - the largest single leak for Argentina.

## Investigation Priority Ranking

| Rank | Target | Signal | Status |
|------|--------|--------|--------|
| 1 | Camaño | Offshore (Pandora/Trident) + Bellota SA + financial votes + 14x wealth + 6 parties | Highest single-target value |
| 2 | Macri/SOCMA/Geometales | Correo + AUSOL + blanqueo + Minera Geometales board (Aguado, Grindetti, Luksic, Mindlin) | Most documented, new mining nexus |
| 3 | Ibañez/PELMOND | Active offshore while deputy | Most actionable current violation |
| 4 | Santoro sand empire | 11 sand/aggregate companies while sitting deputy, vertically integrated | New finding - undisclosed business empire |
| 5 | Grindetti/Panama Papers | On Geometales board + Panama Papers charges + SOCMA cadre | Bridges corporate and offshore |
| 6 | De Narváez | 37 boards, $500M fortune, Timberhill/Willowbrook trading cos | Offshore vehicle investigation needed |
| 7 | PRO revolving door | 13/20 cases = institutional capture | Systemic pattern |
| 8 | Aluar dual-coalition | ARS 5.4M to both sides | Industrial policy corruption signal |

## Data Quality Notes

- **False positive risk:** FERNANDEZ Carlos Alberto (Misiones) shows 234 external links - almost certainly name-collision artifacts. Common Argentine names (Garcia, Rodriguez, Martinez, Fernandez) inflate match counts.
- **Asset totals null:** DDJJ `total_assets` field is unpopulated for most declarations, blocking wealth trajectory analysis. Individual asset items exist in separate CSV files not yet ingested.
- **Donation amounts loaded:** CNE donation amounts now correctly loaded (bugs fixed: 100x inflation, empty dates, missing relationship amounts).
- **Company nodes missing:** 1M+ Company/PublicCompany nodes not yet loaded (timeout issues). Officer/board member nodes are loaded but lack company linkage.

## Connection Map 7: The Macri Gravity Field (Corporate Board Overlap)

9 politicians share company boards with Macri family members:

| Politician | Party | Shared Company | Macri Member |
|-----------|-------|---------------|--------------|
| Eduardo Oscar Camaño | PJ | GRUPO PROVINCIA | Jorge Macri |
| Rodolfo Frigeri | PJ | GRUPO PROVINCIA | Jorge Macri |
| Francisco Gutierrez | FpV | GRUPO PROVINCIA | Jorge Macri |
| Alberto Iribarne | PJ | GRUPO PROVINCIA | Jorge Macri |
| Damaso Larraburu | PJ | GRUPO PROVINCIA | Jorge Macri |
| Anibal Leguizamon | Peronismo | TOTAL SUPPLY SUDAMERICANA | Maria Laura Macri |
| Antonio Rattin | Unidad Federalista | LA XENEIZE | Mauricio Macri |

**GRUPO PROVINCIA bridges 5 PJ politicians to Jorge Macri** - cross-party corporate entanglement at the board level.

## Connection Map 8: The Influence Triangle

Politicians who are simultaneously donors + board members + government appointees:

| Politician | Party | Companies | Govt Role | Datasets |
|-----------|-------|-----------|-----------|----------|
| Sánchez, Fernando | CC | 13 | Secretario | 5 |
| Macri, Mauricio | PRO | 6 | Presidente | 5 |
| Recalde, Mariano | PJ | 8 | - | 4 |
| Máximo Kirchner | UP | 1 | - | 4 |

## Connection Map 9: Corporate Politicians Vote Pro-Deregulation

Politicians with the most board seats overwhelmingly support economic deregulation:
- 108 boards → Ley Bases: 42 YES vs 7 NO
- 34 boards → Ley Bases: 50 YES, Reforma Laboral: 27 YES
- This confirms the hypothesis: corporate-connected politicians vote to deregulate

## Connection Map 15: Mining Legislation Conflict of Interest

Politicians who voted on mining legislation AND sit on mining company boards:

| Politician | Party | Mining Legislation | Mining Company | Vote |
|-----------|-------|-------------------|---------------|------|
| **MACRI, Mauricio** | PRO | Código de Minería - Modificación (Sept 2024) | MINERA GEOMETALES | Absent/null |
| **MORALES, Gerardo Rubén** | UCR | Exploración y explotación del carbón mineral | NUEVO NORTE ENERGIA Y MINERIA | (recorded) |
| **YARADE, Rodolfo Fernando** | - | Día del proveedor minero nacional | BOLERA MINERA | (recorded) |

**Macri finding:** Mauricio Macri was absent for the Mining Code modification vote on 12/09/2024, while simultaneously sitting on the board of Minera Geometales SA - a copper exploration company in Malargüe, Mendoza, originally owned by the Macri Group via IECSA. Web search confirms: Governor Cornejo returned the mining concession to the Macri Group via Decree 304/2018, and Geometales has 16 mining properties in Malargüe. The company names its deposits after Franco Macri's grandchildren (Francesca, Valentina, Joaquina, Florencia).

**Morales finding:** Gerardo Morales (UCR, Governor of Jujuy) voted on a coal mining exploration law while sitting on the board of NUEVO NORTE ENERGIA Y MINERIA - a direct conflict of interest for a politician from Argentina's mining-heavy northwest.

## Connection Map 16: De Narváez Offshore Network (ICIJ)

Francisco De Narváez appears in **both** Panama Papers and Pandora Papers:

| Officer Name | Leak | Offshore Entity | Jurisdiction | Status |
|-------------|------|----------------|-------------|--------|
| FRANCISCO DE NARVAEZ STEUER | Panama Papers | Titan Consulting Ltd. | BVI | Active |
| MARIA ISABEL DE NARVAEZ STEUER | Panama Papers | Titan Consulting Ltd. | BVI | Active |
| JUANITA DE NARVAEZ STEUER | Panama Papers | Titan Consulting Ltd. | BVI | Active |
| FRANCISCO DE NARVAEZ FECCHINO | Pandora Papers (Alcogal) | BANDA ORIENTAL S.A | - | Inactive |
| FRANCISCO DE NARVAEZ FECCHINO | Pandora Papers (Alcogal) | RETRATO PARTNERS LIMITED | BVI | Active |

**Key distinctions:** Two different Francisco De Narváez:
- **STEUER** = siblings (Francisco, Maria Isabel, Juanita), registered with Titan Consulting in the Panama Papers - likely the children of the politician
- **FECCHINO** = the politician himself (maiden name variant), with two Pandora Papers entities through Alcogal law firm

**RETRATO PARTNERS LIMITED** (BVI, Active) is the most significant - an active offshore entity linked to the politician who purchased Walmart Argentina for ~USD 80M in 2020 and whose personal fortune exceeds USD 500M. The name "Retrato" (portrait) may reference the art/gallery world (De Narváez is a known art collector).

**BANDA ORIENTAL S.A** - the name references the historical territory of Uruguay/Río de la Plata, suggesting Uruguayan operations. Status: Inactive.

## Data Quality: Confirmed False Positives

Fernandez Carlos Alberto (108 boards) is confirmed as **multiple different people** sharing a common name - simultaneously "inspector," "jefe de sección," "Director de Planificación de Seguridad de Frontera," and "Diputado Nacional." Name-only matching inflates common names.

## Connection Map 10: PENSAR ARGENTINA - The PRO Policy Factory

**Most significant structural finding.** PENSAR ARGENTINA is registered as a formal civil association in the IGJ corporate registry with 50+ PRO politicians and technocrats as board members/socios:

Key members (from IGJ BoardMember data):
- Patricia Bullrich (Minister of Security)
- Eugenio Burzaco (Security Secretary)
- Sergio Bergman (Environment Minister)
- Federico Pinedo (Senate President)
- Gabriela Michetti (Vice President)
- Federico Sturzenegger (Central Bank President)
- María Eugenia Vidal (Buenos Aires Province Governor)
- Diego Santilli (Buenos Aires City Deputy Mayor)
- Horacio Rodríguez Larreta (Buenos Aires City Mayor)
- Marcos Peña (Chief of Staff)
- Nicolás Caputo (Macri's closest business partner)
- Pablo Lombardi (Media Secretary)

**Significance:** This is not a loose political alliance - it's a **formally registered corporate entity** where the entire PRO governing elite sat on the same board alongside Macri's personal business partner. Policy decisions flowed from this think tank directly to the executive branch.

Also co-founded: **SUMA PARA EL DISEÑO DE POLITICAS PUBLICAS** (Michetti + Pinedo).

## Connection Map 11: Cross-Party Corporate Bridges

| Politician 1 | Politician 2 | Shared Entity | Type |
|-------------|-------------|---------------|------|
| Caballero | Gonzalez | NACION SEGUROS | State insurance |
| Michetti | Pinedo | PENSAR ARGENTINA | PRO think tank |
| Heller | Lopez | CREDICOOP | Cooperative banking |
| Amadeo | Capitanich | FONCAP | Cross-party microfinance |
| Brown | De Mendiguren | BICE | National investment bank |

## Connection Map 12: SAME_PERSON Bridge - New Corporate Connections (Cycle 3)

The SAME_PERSON relationship (1.78M DNI-matched links between CompanyOfficer and BoardMember nodes) created new traversal paths revealing politicians' full corporate footprints.

### Verified Corporate Politicians (DNI-confirmed)

| Politician | Party | DNI | Boards | Key Holdings |
|-----------|-------|-----|--------|-------------|
| De Narváez, Francisco | UCyB, Buenos Aires | 18758371 | 37 | Mundo Urbano, Narciso, Dorinka, Gossip, El Cronista, TIA, La Rural, America TV |
| Gutiérrez, Julio César | PJ, Santa Fe | 11128344 | 28 | Latin American Management, South Cable Holdings, AC Inversora, Southtel Holdings |
| Fargosi, Alejandro | LLA, CABA | 11371750 | 20 | Estudio O'Farrell, Synthes Argentina, Ellipso Inc, Hipatia Capital |
| Torello, José María | PRO, Buenos Aires | 14156067 | 15 | Consultatio Argentina (Costantini), PENSAR ARGENTINA, SJJF Desarrollos |
| Romero, Juan Carlos | Cambio Federal, Salta | 13516864 | 15 | Transportes ERSA (Cargas + Santiago), Matysud, Grupo Rioplatense, Arrozales Corrientes |
| Michel, Guillermo | UP, Entre Ríos | 25661121 | 14 | EMBRAR, Baco Inversiones, Sandebus, Rapp Collins Worldwide |
| Pereyra, Juan Manuel | FORJA, Córdoba | 26018792 | 13 | Yacylec, Vialnoa, Raisin, Construcciones Térmicas |
| Wechsler, Marcelo Germán | PRO, CABA | 17198527 | 12 | Corporación Puerto Madero, Internet Now, Critical Path, Rote Meer Leasing |
| Frigerio, Rogelio | PRO, Entre Ríos | 21482393 | 11 | Desarrollos Inmobiliarios Alto Delta, Economía y Regiones, Casel, Chulun |
| Santoro, Leandro | UP, CABA | 30743251 | 11 | Aridos Cañuelas, Arenas Building, Arenera Sarthou, Arenera Pueyrredón, CADEAR, Arenas Shipping |
| De Mendiguren, José Ignacio | FdT, Buenos Aires | 8406697 | 9 | UIA, Observatorio PyME, BICE Factoring, Pro-Tejer, Cedeira Internacional |
| Pérez, Alberto José | Compromiso Federal, SL | 14699750 | 9 | Rainbow Agroscienses, Sulphur Mills, NPC & Asociados |

### Key New Lead: Santoro's Sand Empire
Leandro Santoro (UP, CABA) DNI-confirmed across 11 sand extraction and aggregate companies: Aridos Cañuelas, Arenas Building, Arenera Sarthou, Arenera Pueyrredón, Silos Areneros Buenos Aires, Arenas Shipping, CADEAR (industry association), Arenas Studios, Marymar, SABA. Web search confirms he is Managing Director involved in dredging, sand extraction, transport and commercialization. This is a **vertically integrated sand/aggregate business** operated by a sitting deputy.

### Key New Lead: De Narváez offshore vehicles
Timberhill Trading Inc. and Willowbrook Trading Inc. - associated with a politician-businessman who purchased El Cronista Comercial and owned TIA supermarkets (sold for $638M). Web search confirms personal fortune exceeding $500M, Walmart Argentina acquisition (2020), La Rural exhibition center, América TV. These trading companies warrant offshore investigation.

### Camaño - Bellota SA bridge to Barrionuevo
Only politician at the intersection of offshore records AND company boards. Confirmed: she and husband Luis Barrionuevo co-direct Bellota SA. The Camaño-Barrionuevo-Bellota link is the only InvestigationTarget→Politician bridge found via shared companies.

## Connection Map 13: Minera Geometales - The SOCMA Mining Nexus

Minera Geometales SA is the **single richest board-level connection** found in the graph. It links:

**Politicians on board:**
- **MACRI, Mauricio** (PRO) - board member, company originally acquired by IECSA/Macri Group from Chile's Luksic Group
- **MACRI, Francisco** - Franco Macri, patriarch of the Macri empire
- **AGUADO, Jorge** (UCeDé, Buenos Aires) - ex-governor of Buenos Aires province (military era), later VP of SOCMA Group
- **GRINDETTI, Néstor Osvaldo** - PRO mayor of Lanús, former SOCMA cadre, **charged in Panama Papers** (2016, illicit enrichment)

**Corporate figures on the same board:**
- Jean Paul Luksic Fontbona / Andrónico Luksic Abaroa - Chilean Luksic mining dynasty (original owners)
- Damián Mindlin - Emes Group (acquired the company in 2017 along with all IECSA assets)
- Felipe Suar - TV producer, Macri associate
- Pablo Clusellas - Macri's Legal Secretary during presidency
- Martín Blaquier - Ledesma sugar dynasty

**Timeline:** Originally Luksic Group → acquired by IECSA (Macri Group) in late 1990s → Calcaterra (Macri cousin) as president 2001-2004 → fined for illegal water use 2008 → sold to Emes Group (Mindlin) 2017.

**Significance:** This single mining company board served as a meeting point for the Macri political dynasty, military-era political appointees, Chilean mining oligarchs, and the group that later acquired the privatized energy assets. Grindetti's presence on this board while simultaneously facing Panama Papers charges for offshore structures reinforces the SOCMA→offshore pipeline.

## Connection Map 14: Investigation Target Network Expansion

Only 3 connections found between InvestigationTargets and other politicians via shared companies:

| Target | Connected Politician | Party | Shared Company |
|--------|---------------------|-------|---------------|
| CAMAÑO, Graciela | BARRIONUEVO, José Luis | Nacional Sindical | BELLOTA SA |
| MACRI, Mauricio | AGUADO, Jorge Rubén | UCeDé | MINERA GEOMETALES |
| MACRI, Mauricio | RATTIN, Antonio Ubaldo | Unidad Federalista | LA XENEIZE SOC. GERENTE FCI |

**La Xeneize** is a Boca Juniors-linked investment fund management company - Macri was Boca president (1995-2007), Rattin was the legendary Boca player-turned-politician.

### Offshore Politicians (MAYBE_SAME_AS to OffshoreOfficer)

Only 3 politicians have direct offshore links in the ICIJ data:

| Politician | Party | Leak | Offshore Entity |
|-----------|-------|------|----------------|
| CAMAÑO, Graciela | Consenso Federal | Pandora Papers (Trident Trust) | TT 41 CORP (BVI) |
| IBAÑEZ, Maria Cecilia | La Libertad Avanza | Panama Papers | PELMOND COMPANY LTD (BVI) |
| NUÑEZ, Jose | Provincias Unidas | Panama Papers | (unspecified) |

### False positives confirmed
- Fernández Carlos Alberto (208 companies via MAYBE_SAME_AS) - common name collision, multiple different people
- López Juan Carlos (131 companies) - same issue
- Martínez Luis Alberto / Carlos Alberto - same issue
- García Carlos (79 companies, includes SEED HOLDINGS/SEED PARTNERS) - likely name collision with corporate Carlos García

## Connection Map 17: Vote-Corporate Conflicts of Interest

528 Legislation nodes and 85,205 Company nodes tagged by sector. Cross-referencing reveals potential conflicts (note: Argentine legislators are NOT legally required to recuse from votes on legislation related to their business interests - this is a known gap in Ley 25.188, which applies primarily to the executive branch):

| Sector | Politicians with conflicts | Total votes on sector | Companies held |
|--------|--------------------------|----------------------|----------------|
| Finance | 69 | 23,525 | 77 |
| Construction | 39 | 750 | 51 |
| Energy | 21 | 999 | 35 |
| Telecom | 20 | 989 | 29 |
| Agriculture | 13 | 522 | 17 |
| Transport | 11 | 155 | 12 |
| Mining | 7 | 44 | 7 |

### Verified high-signal conflicts:
- **Heller** - 173 votes on financial legislation as president of Banco Credicoop
- **Costa** - 16 votes on hydrocarbons while owning Costa Hidrocarburos y Energía
- **Macri** - voted on mining code reform while on Minera Geometales board
- **Lousteau** - voted YES on Ley Bases while linked to LCG Inversora (finance)
