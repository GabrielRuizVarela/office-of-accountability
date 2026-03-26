# Caputo Deep Dive - Structured Findings for Graph Ingestion

**Date:** 2026-03-21
**Research scope:** Deutsche Bank operations, AXIS Fund, Sacha Rupaska, Palmeral Chico, Ancora Investments, Century Bond, Bausili judicial proceedings, Anker Latinoamerica network, Nicolas Caputo (Nicky), JP Morgan cabinet

---

## 1. New Entities Discovered

### Persons

| Name | Role | Notes |
|------|------|-------|
| Carlos Hernan Planas | Co-founder AXIS SGFCI, VP | Deutsche Bank director alongside Caputo from 2003. Assumed Caputo's presidency of AXIS on Dec 4, 2015. Currently president of AXIS Inversiones. |
| Luis Maria Mendez Ezcurra | Co-founder Sacha Rupaska SA | Brother-in-law of Luis Caputo (married to Rossana Pia Caputo). Requested land clearing in Santiago del Estero. |
| Rossana Pia Caputo | Sister of Luis Caputo | Married to Mendez Ezcurra. Connection point between Caputo family and Sacha Rupaska. |
| Horacio Ivan Gandara | Co-founder Sacha Rupaska SA | Co-requested land clearing alongside Mendez Ezcurra. |
| Carlos Alberto Piccaluga | President of Palmeral Chico SA | Caputo served as alternate director. |
| Marco Piccaluga | Alternate director Palmeral Chico SA (2024) | Replaced Caputo in records. |
| Federico Furiase | Anker partner, Secretary of Finance (2026) | Economist UBA, MSc Finance Di Tella. Director BCRA Jun 2024. Secretary of Finance via Decree 135/2026. |
| Martin Vauthier | Anker partner, VP of BICE | Economist UBA. Caputo advisor in Economy Ministry. |
| Felipe Beron | Anker partner, Undersecretary Financial Services | Economist UBA, MSc Finance Di Tella. Self-described as "raised at Anker." |
| Alejandro Lew | Secretary of Finance (2025), ex-JP Morgan | VP JP Morgan Chase Buenos Aires. VP BCRA under Milei. Ex-CFO YPF (2020-2023). Resigned from Finance 2026. |
| Pablo Quirno | Foreign Minister (2025), ex-Finance Secretary | Former Secretary of Finance under Milei, moved to Foreign Ministry. |
| Vladimir Werning | VP BCRA | JP Morgan background. |
| Damian Reidel | President Nucleoelectrica Argentina | JP Morgan background. |
| Jose Luis Daza | Secretary of Economic Policy | JP Morgan background. |
| Emilio Basavilbaso | ANSES director | Co-investigated in FGS/AXIS case. |
| Gustavo Angel Marconato | ANSES official | Co-investigated in FGS/AXIS case. |
| Luis Maria Blaquier | ANSES official | Co-investigated in FGS/AXIS case. |
| Pedro Lacoste | ANSES official | Co-investigated in FGS/AXIS case. |
| Gabriel De Vedia | Titular UFISES | Filed criminal complaint against Caputo over FGS irregularities. |

### Companies / Organizations

| Entity | CUIT / ID | Type | Notes |
|--------|-----------|------|-------|
| AXIS Sociedad Gerente de Fondos Comunes de Inversion SA | 30-71224145-0 | Fund management | Founded Mar 8, 2012. Reconquista 458, 7th floor, CABA. CNV Registration #36. CAFCI member. |
| AXIS Ahorro Plus FCI | - | Mutual fund | Vehicle through which FGS/ANSES invested ~$302M in LEBACs. |
| Sacha Rupaska SA | - | Agropecuaria (shell) | IGJ declared "totally fictitious company" - no real activity, no capital, no dividends. Caputo 60% shareholder. Fined via Res. 1448/2022. |
| Palmeral Chico SA | 30-71026604-9 | Agropecuaria | Incorporated Jun 4, 2007. CABA. Agricultural, livestock, forestry. Caputo was alternate director. Fined >$10M ARS in Aug 2013 for native forest destruction. |
| Ancora Investments LP | - | Investment fund (Canada) | 100% owned by Caputo per sworn declaration. Valued at $388M ARS (2024 declaration). Private wealth advisory and institutional asset management. |
| Noctua International WMG LLC | - | Offshore fund manager | Controlled via Princess International Global Ltd (Cayman) -> Affinis Partners II (Cayman). Caputo 75% of Princess. Connected to AXIS via SEC filings. |
| Princess International Global Ltd | - | Offshore (Cayman Islands) | 75% owned by Caputo. Controls Affinis Partners II. |
| Affinis Partners II | - | Offshore (Cayman Islands) | Controlled 50-74% by Princess. Controls 75%+ of Noctua. |
| Anker Latinoamerica SA | - | Consulting firm | Founded ~2020 by Caputo. Suspended Dec 2023. Partners: Caputo, Bausili, Furiase, Vauthier, Beron. |
| BSD Grupo Asesor SA | - | Real estate advisory | Partners with Anker on Paseo Gigena (40,000 sqm Buenos Aires development). |
| Caputo Hermanos | - | Construction | IGJ imposed "fiscalizacion estatal" and fine. Related to Caputo family. |
| Il Tevere | - | Holding company | Controls Nicolas Caputo's group (99.995% family-owned). Controls Mirgor SA. |
| Mirgor SA | - | Electronics/autoparts | Nicolas Caputo's flagship. Created 1983 by Macri and Nicolas Caputo. Controls IATEC and Interclima. |
| SES SA | - | Construction | Nicolas Caputo's company. ~$1,023M ARS in Buenos Aires public works contracts (2008-2015). |

---

## 2. New Relationships

### Caputo -> Deutsche Bank

| From | Relationship | To | Period | Details |
|------|-------------|-----|--------|---------|
| Luis Caputo | EMPLOYED_BY | Deutsche Bank | 1998-2003 | Chief of Trading, Eastern Europe & Latin America |
| Luis Caputo | PRESIDENT_OF | Deutsche Bank Argentina | 2003-2008 | CEO/President |
| Santiago Bausili | EMPLOYED_BY | Deutsche Bank | 2007-2015 | Directorial roles |
| Bausili | RECEIVED_PAYMENT | Deutsche Bank | 2016-2017 | ~100,000 EUR + 13,025 DB shares while serving as Secretary of Finance |
| Carlos Hernan Planas | EMPLOYED_BY | Deutsche Bank | 2003-2005+ | Director, designated alongside Caputo |

### Caputo -> AXIS -> Noctua (Offshore Chain)

| From | Relationship | To | Details |
|------|-------------|-----|---------|
| Luis Caputo | FOUNDED | AXIS SGFCI SA | Mar 8, 2012. President until Dec 4, 2015. |
| Carlos Hernan Planas | FOUNDED | AXIS SGFCI SA | VP, then president after Dec 2015. |
| Luis Caputo | OWNED_75PCT | Princess International Global Ltd | Cayman Islands |
| Princess International Global Ltd | CONTROLLED | Affinis Partners II | 50-74% ownership |
| Affinis Partners II | CONTROLLED | Noctua International WMG LLC | 75%+ ownership |
| Noctua International WMG LLC | ASSOCIATED_WITH | AXIS SGFCI SA | Per SEC filings |
| FGS/ANSES | INVESTED_IN | AXIS Ahorro Plus FCI | $302M ARS, April 2016 |
| AXIS SGFCI SA | RECEIVED_COMMISSION | FGS/ANSES | $540,000 ARS for LEBAC intermediation |

### Caputo -> Land Holdings

| From | Relationship | To | Details |
|------|-------------|-----|---------|
| Luis Caputo | SHAREHOLDER_60PCT | Sacha Rupaska SA | Acquired majority 2 months after registration |
| Luis Caputo | CREDITOR_OF | Sacha Rupaska SA | $3.8M ARS principal credit |
| Luis Mendez Ezcurra | CO_FOUNDER | Sacha Rupaska SA | Caputo's brother-in-law |
| Horacio Gandara | CO_FOUNDER | Sacha Rupaska SA | |
| Rossana Pia Caputo | MARRIED_TO | Luis Mendez Ezcurra | Family link |
| Luis Caputo | SIBLING_OF | Rossana Pia Caputo | |
| Sacha Rupaska SA | OWNS_LAND | Piruaj Bajo (Santiago del Estero) | ~17,800 hectares, Copo dept. Acquired Oct 12, 2007. |
| Sacha Rupaska SA | ACCUSED_OF | Illegal deforestation | Greenpeace complaint. ~500 ha cleared in Yellow category zone. |
| Sacha Rupaska SA | ACCUSED_OF | Campesino displacement | 80+ families affected. Violent evictions. |
| Luis Caputo | ALTERNATE_DIRECTOR | Palmeral Chico SA | CUIT 30-71026604-9 |
| Palmeral Chico SA | SANCTIONED_FOR | Native forest destruction | >$10M ARS fine, Aug 2013 |

### Caputo -> Ancora (Foreign Assets)

| From | Relationship | To | Details |
|------|-------------|-----|---------|
| Luis Caputo | OWNS_100PCT | Ancora Investments LP | Canada-registered. $388M ARS value (2024). |

### Anker Network -> Government

| From | Relationship | To | Period |
|------|-------------|-----|--------|
| Luis Caputo | FOUNDED | Anker Latinoamerica SA | ~2020 |
| Santiago Bausili | PARTNER_OF | Anker Latinoamerica SA | ~2020-2023 |
| Federico Furiase | PARTNER_OF | Anker Latinoamerica SA | ~2020-2023 |
| Martin Vauthier | PARTNER_OF | Anker Latinoamerica SA | ~2020-2023 |
| Felipe Beron | PARTNER_OF | Anker Latinoamerica SA | ~2020-2023 |
| Caputo + Bausili | PARTNERS_IN | BSD Grupo Asesor / Paseo Gigena | 40,000 sqm CABA development |
| Anker team | ALL_PLACED_IN | Argentine Government (Milei) | Dec 2023 onward |

### JP Morgan Cabinet (7 Officials)

| Person | Government Role | JP Morgan Background |
|--------|----------------|---------------------|
| Luis Caputo | Economy Minister | Former employee |
| Santiago Bausili | BCRA President | Deutsche Bank (not JP Morgan directly) |
| Jose Luis Daza | Secretary Economic Policy | JP Morgan |
| Alejandro Lew | Secretary of Finance (2025) | VP JP Morgan Chase Buenos Aires, analyst NYC 1998-2004 |
| Pablo Quirno | Foreign Minister | JP Morgan background |
| Vladimir Werning | VP BCRA | JP Morgan |
| Damian Reidel | President Nucleoelectrica | JP Morgan |

### Century Bond Connections

| From | Relationship | To | Details |
|------|-------------|-----|---------|
| Luis Caputo | AUTHORIZED | Century Bond emission | Jun 19, 2017. As Finance Minister. |
| HSBC | UNDERWRITER | Century Bond | Joint lead |
| Citigroup | UNDERWRITER | Century Bond | Joint lead |
| Nomura | UNDERWRITER | Century Bond | Placement |
| Santander | UNDERWRITER | Century Bond | Placement |
| Underwriters | RECEIVED_COMMISSION | Argentine State | 0.12% of capital = ~$3.3M USD |
| AGN | AUDITED | Century Bond | Found it "gravoso para el Estado" (burdensome for the State) |
| Noctua (Caputo offshore) | PURCHASED | Century Bond | Per press reports |

### REPO 2026

| From | Relationship | To | Details |
|------|-------------|-----|---------|
| BCRA | REPO_AGREEMENT | International Banks | Jan 7, 2026. $3B USD, 372 days, SOFR+400bp (~7.4%) |
| Santander | PARTICIPATED | REPO 2026 | ~$680M each |
| BBVA | PARTICIPATED | REPO 2026 | |
| Deutsche Bank | PARTICIPATED | REPO 2026 | |
| Citi | PARTICIPATED | REPO 2026 | |
| JP Morgan | PARTICIPATED | REPO 2026 | |
| Bank of China | PARTICIPATED | REPO 2026 | |

---

## 3. Timeline of Caputo Career Events

| Date | Event | Source |
|------|-------|--------|
| 1998 | Joins Deutsche Bank, Chief of Trading EM/LATAM | [Wikipedia](https://en.wikipedia.org/wiki/Luis_Caputo) |
| 2003 | Becomes President of Deutsche Bank Argentina | [Ambito](https://www.ambito.com/economia/quien-es-luis-caputo-el-financista-que-suena-el-ministerio-milei-n5883111) |
| Apr 2003 | Planas and Caputo designated Deutsche Bank directors | [UFISES filing](https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/) |
| Jun 2007 | Palmeral Chico SA incorporated (Caputo as alternate director) | [Dateas](https://www.dateas.com/en-us/empresa/palmeral-chico-sa-30710266049) |
| Oct 2007 | Sacha Rupaska acquires Piruaj Bajo (~17,800 ha) | [Enorsai](https://www.enorsai.com.ar/politica/37659-sacha-rupaska--cuando-los-caputo-compraron-tierras-con-un-pueblo-adentro.html) |
| 2008 | Leaves Deutsche Bank Argentina | [El Cronista](https://www.cronista.com/finanzas-mercados/ultiman-salida-del-ceo-del-deutsche-en-la-argentina/) |
| Mar 2012 | Founds AXIS SGFCI SA with Planas | [CNV](https://aif2.cnv.gov.ar/Presentations/publicview/59CBB9F4-97BF-41AA-9D9D-210C3298903F) |
| Aug 2013 | Palmeral Chico fined >$10M for native forest destruction | [LPO](https://www.lapoliticaonline.com/sinseccion/otra-empresa-de-caputo-acusada-de-actividad-ilicita/) |
| Dec 4, 2015 | Resigns from AXIS SGFCI; Planas takes over | [Fiscales.gob.ar](https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/) |
| Dec 10, 2015 | Appointed Secretary of Finance (Macri gov) | [Wikipedia](https://en.wikipedia.org/wiki/Luis_Caputo) |
| 2016 | Paradise Papers reveal Noctua/Princess offshore chain | [Perfil](https://www.perfil.com/noticias/paradisepapers/el-ministro-caputo-oculto-que-era-dueno-de-offshores-en-islas-caiman.phtml) |
| Apr 2016 | FGS invests $302M ARS in AXIS Ahorro Plus (conflict of interest) | [Fiscales.gob.ar](https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/) |
| 2016-2017 | Bausili receives ~100K EUR + 13,025 DB shares while Sec. of Finance | [Diario Jornada](https://www.diariojornada.com.ar/209702/economia/otro_escandalo_en_finanzas_un_secretario_cobro_100_mil_euros_del_deutsche_bank) |
| Jan 2017 | Appointed Finance Minister | [Wikipedia](https://en.wikipedia.org/wiki/Luis_Caputo) |
| Jun 19, 2017 | Issues Century Bond ($2.75B, 100 years, 7.125%) | [El Cronista](https://www.cronista.com/finanzasmercados/Detalles-del-bono-a-100-anos-costos-tasas-precio-y-comisiones-a-los-bancos-20170628-0116.html) |
| Sep 2017 | UFISES files criminal complaint: FGS/AXIS irregularities | [El Cronista](https://www.cronista.com/economia-politica/Denuncian-a-Caputo-por-presuntas-irregularidades-en-manejo-de-fondos-la-ANSES-20170907-0074.html) |
| 2018 | Greenpeace denounces Sacha Rupaska for illegal deforestation | [Foro Ambiental](https://www.foroambiental.net/greenpeace-denuncio-una-empresa-desmontes-ilegales-santiago-del-estero-ministro-finanzas-accionista-la-firma/) |
| ~2020 | Founds Anker Latinoamerica with Bausili, Furiase, Vauthier, Beron | [Perfil](https://www.perfil.com/noticias/politica/caputo-llevo-a-sus-socios-de-su-consultora-al-gobierno-quienes-son-y-que-funciones-tendran.phtml) |
| Apr 2021 | Judge Casanello processes Bausili for negociaciones incompatibles | [Infobae](https://www.infobae.com/politica/2021/04/12/procesaron-a-un-ex-secretario-de-finanzas-del-macrismo-por-negociaciones-incompatibles-en-el-megacanje-ii/) |
| Oct 2022 | IGJ imposes "fiscalizacion estatal" on Caputo Hermanos | [Telam](https://www.telam.com.ar/notas/202210/608711-caputo-construcciones-inspeccion-general-de-justicia-intimacion-irregularidades.html) |
| Dec 2022 | IGJ fines Sacha Rupaska, files judicial nullity for "empresa simulada" | [Noticias La Insuperable](https://noticiaslainsuperable.com.ar/2022/12/16/la-igj-multo-y-demandara-judicialmente-a-otra-empresa-de-los-caputo/) |
| Nov 2023 | Appointed Economy Minister (Milei gov). Suspends Anker. | [Ambito](https://www.ambito.com/economia/luis-caputo-cierra-su-consultora-y-suma-los-socios-su-equipo-n5889363) |
| Dec 2023 | Bausili appointed BCRA President; Anker team enters government | [Filo News](https://www.filo.news/noticia/2023/12/06/quien-es-santiago-bausili-el-socio-de-caputo-elegido-para-presidir-el-bcra) |
| Jun 2024 | Furiase appointed BCRA director | [La Nacion](https://www.lanacion.com.ar/economia/nuevas-designaciones-entra-al-banco-central-un-economista-de-maxima-confianza-de-caputo-nid13062024/) |
| Nov 2024 | Casacion confirms Bausili processing for negociaciones incompatibles | [Filo News](https://www.filo.news/noticia/2024/11/05/procesan-al-presidente-del-banco-central-por-negociaciones-incompatibles-con-la-funcion-publica) |
| Dec 2024 | Court ratifies conflict of interest existed for Bausili/BCRA | [Ambito](https://www.ambito.com/politica/nuevo-reves-judicial-santiago-bausili-ratificaron-que-existio-conflicto-intereses-el-bcra-n6089014) |
| Jan 7, 2026 | BCRA signs $3B REPO (Deutsche Bank, Santander, BBVA, Citi, JP Morgan, Bank of China) | [Bloomberg](https://www.bloomberg.com/news/articles/2026-01-07/argentina-signs-3-billion-repo-with-banks-ahead-of-debt-payment) |
| Jan 2026 | Furiase promoted to Secretary of Finance (Decree 135/2026) | [Boletin Oficial](https://www.boletinoficial.gob.ar/pdf/aviso/primera/302216/20260119) |
| 2025 (latest declaration) | Caputo patrimony: $11.851B ARS. 65%+ abroad. 99.9% of cash in exterior. | [Chequeado](https://chequeado.com/el-explicador/la-declaracion-jurada-de-luis-caputo-informo-un-patrimonio-de-11-800-millones-y-casi-2-tercios-de-sus-bienes-estan-en-el-exterior/) |

---

## 4. Conflicts of Interest Not Yet Documented

### A. AXIS / FGS Pension Fund Drain
Caputo founded AXIS SGFCI in 2012, resigned Dec 4, 2015 (days before joining government). In April 2016, the FGS pension fund invested $302M ARS in AXIS Ahorro Plus - a fund that merely bought LEBACs that FGS could have purchased directly from BCRA with zero commission. AXIS collected $540K ARS in commissions for unnecessary intermediation. Criminal charges filed by UFISES for negociaciones incompatibles, incumplimiento de deberes, and administracion infiel.

**Source:** [Fiscales.gob.ar](https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/)

### B. Noctua Offshore Purchased Century Bond
The offshore fund management entity Noctua - controlled by Caputo through Princess International (Cayman) and Affinis Partners II (Cayman) - reportedly purchased the same Century Bond that Caputo authorized as Finance Minister. Self-dealing across sovereign/private boundary.

**Source:** [Offshore Planet](https://offshoreplanet.wordpress.com/2018/01/10/la-offshore-que-administro-caputo-compro-deuda-a-100-anos/)

### C. Bausili: Deutsche Bank Payments While Selecting DB as Bond Placer
Bausili received ~100K EUR + 13,025 Deutsche Bank shares (deferred compensation) in 2016-2017 while serving as Secretary of Finance. Simultaneously, Deutsche Bank was selected as placer of Argentine dollar bonds in April 2016, January 2017, and January 2018, earning 0.12-0.18% commissions. Casacion confirmed processing for negociaciones incompatibles (Nov 2024).

**Source:** [La Nacion](https://www.lanacion.com.ar/politica/el-secretario-finanzas-declaro-bonadio-bonos-cobro-nid2180833/), [Ambito](https://www.ambito.com/politica/nuevo-reves-judicial-santiago-bausili-ratificaron-que-existio-conflicto-intereses-el-bcra-n6089014)

### D. Anker Consulting -> Entire Economic Team
Caputo founded Anker Latinoamerica (~2020) with Bausili. When appointed Economy Minister (Dec 2023), he suspended the firm and placed all partners in government: Bausili (BCRA President), Furiase (BCRA Director -> Secretary of Finance), Vauthier (VP BICE), Beron (Undersecretary Financial Services). A private consulting firm effectively became the economic policy apparatus of the state.

**Source:** [Perfil](https://www.perfil.com/noticias/politica/caputo-llevo-a-sus-socios-de-su-consultora-al-gobierno-quienes-son-y-que-funciones-tendran.phtml)

### E. JP Morgan Cabinet: 7 Officials from One Bank
Seven officials in Milei's government have JP Morgan backgrounds: Caputo, Daza, Lew, Quirno, Werning, Reidel, plus Bausili (Deutsche Bank, closely allied). These officials now regulate the same banks that employed them and continue to do business with the Argentine state (e.g., the $3B REPO of Jan 2026).

**Source:** [Fuego24](https://fuego24.com/nacionales-e-internacionales/el-gabinete-del-jp-morgan-los-7-funcionarios-de-milei-con-pasado-en-el-poderoso-banco/)

### F. Century Bond: AGN Found "Gravoso para el Estado"
The AGN audited the Century Bond and found: (1) no financing strategy justified the emission; (2) the chosen option was not among the 25 alternatives presented by advising banks; (3) Argentina received only $2.47B of the $2.75B nominal due to below-par placement and commissions; (4) early redemption clauses were impractical; (5) 7.917% locked for 100 years with no realistic exit.

**Source:** [El Cronista](https://www.cronista.com/economia-politica/deuda-la-agn-cuestiono-la-colocacion-del-bono-del-siglo-en-el-gobierno-de-macri/)

### G. Sacha Rupaska: "Totally Fictitious Company" with Real Harm
IGJ declared Sacha Rupaska SA a simulated entity (no real meetings, no capital, no activity, no dividends). Yet it acquired 17,800 hectares in Santiago del Estero, displaced 80+ campesino families, and cleared 500+ hectares of protected forest. Caputo holds 60% and is the principal creditor ($3.8M ARS).

**Source:** [Noticias La Insuperable](https://noticiaslainsuperable.com.ar/2022/12/16/la-igj-multo-y-demandara-judicialmente-a-otra-empresa-de-los-caputo/)

### H. Nicolas Caputo (Nicky) - Parallel Caputo Network
Not directly related to Luis "Toto" Caputo by confirmed family ties, but Nicolas "Nicky" Caputo is Macri's closest friend and business partner since childhood (Newman school). Forbes #34 in Argentina ($340M USD). Controls: Mirgor SA (electronics/autoparts), SES SA ($1.023B ARS in Buenos Aires public works 2008-2015), Caputo SA (construction, sold 82.32% for $109M USD), IATEC, Interclima. All controlled through holding company Il Tevere (99.995% family-owned). Opened secret Swiss bank accounts and offshore entities per Pandora Papers.

**Source:** [Wikipedia](https://es.wikipedia.org/wiki/Nicol%C3%A1s_Caputo), [ElDiarioAR](https://www.eldiarioar.com/politica/pandora-papers/nicolas-caputo-abrio-cuenta-secreta-suiza-controlada-offshore-luego-blanqueo-macri_1_9313781.html)

---

## 5. Deutsche Bank Global Sanctions Context

Deutsche Bank has faced major penalties globally for AML failures:
- US Fed: $186M fine for insufficient AML controls
- Frankfurt prosecutors: $7.1M EUR for 701 cases of failed suspicious activity reports
- Additional $13.5M EUR fine for late filing of SARs

These systemic failures at Deutsche Bank globally are relevant context for its Argentine operations during the period when Caputo and Bausili were employed there and later selected it for sovereign debt placements.

**Source:** [Milenio](https://www.milenio.com/negocios/fed-multa-deutsche-bank-medidas-lavado-dinero), [Diario Financiero](https://www.df.cl/empresas/banca-instituciones-financieras/deutsche-bank-resuelve-un-caso-de-lavado-de-dinero-por-us-7-1-millones)

---

## 6. Caputo Wealth Evolution (Sworn Declarations)

| Period | Net Worth | Foreign Assets | Key Holdings |
|--------|-----------|---------------|--------------|
| Pre-Milei (~2022) | ~$4M USD | Unknown | Ancora Investments, AXIS shares |
| End 2023 (entry) | ~$4M USD | Majority abroad | |
| End 2024 (1 year in office) | ~$11.85B ARS (~$18M USD) | 65% abroad ($7.8B ARS) | Ancora Investments ($388M ARS), foreign deposits |
| Mid-2025 | Quintupled since taking office | 99.9% of cash abroad | $5.7M USD in foreign accounts |

Caputo's patrimony grew 137% in his first year as minister, and he keeps virtually all liquid assets outside Argentina.

**Source:** [Chequeado](https://chequeado.com/el-explicador/la-declaracion-jurada-de-luis-caputo-informo-un-patrimonio-de-11-800-millones-y-casi-2-tercios-de-sus-bienes-estan-en-el-exterior/), [Filo News](https://www.filo.news/noticia/2025/08/03/luis-caputo-mantiene-el-99-9-de-su-dinero-en-el-exterior-y-quintuplico-su-patrimonio-desde-que-asumio), [La Letra P](https://www.letrap.com.ar/politica/toto-caputo-sumo-27-millones-dolares-sus-cuentas-el-exterior-2024-n5417610)
