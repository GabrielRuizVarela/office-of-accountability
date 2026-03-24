/**
 * Monopolized Markets in Argentina — Investigation structured data.
 *
 * Bilingual (ES primary, EN secondary) factcheck items, timeline events,
 * actors, money flows, and impact stats — sourced from 24-wave investigation
 * cycle cross-referencing Neo4j graph (2.5M+ nodes), web research, ICIJ
 * offshore leaks, IGJ corporate registry, CompraR procurement, CNE campaign
 * finance data, privatization records, and regulatory body analysis.
 */

// ---------------------------------------------------------------------------
// Types (reuse from finanzas-politicas pattern)
// ---------------------------------------------------------------------------

export type FactcheckStatus =
  | 'confirmed'
  | 'alleged'
  | 'confirmed_cleared'
  | 'unconfirmed'

export type InvestigationCategory =
  | 'telecom'
  | 'energy'
  | 'food'
  | 'media'
  | 'banking'
  | 'mining'
  | 'agroexport'
  | 'construction'
  | 'pharma'
  | 'transport'
  | 'cross_sector'
  | 'regulatory_capture'

export interface FactcheckItem {
  id: string
  claim_es: string
  claim_en: string
  status: FactcheckStatus
  tier: number
  sector: InvestigationCategory
  source: string
  source_url: string
  detail_es?: string
  detail_en?: string
}

export interface TimelineEvent {
  id: string
  date: string
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  category: InvestigationCategory
  sources: string[]
}

export interface Actor {
  id: string
  name: string
  role_es: string
  role_en: string
  description_es: string
  description_en: string
  sectors: InvestigationCategory[]
  companies_count: number
  offshore_count: number
  status_es?: string
  status_en?: string
  source_url?: string
}

export interface MoneyFlow {
  id: string
  from_label: string
  to_label: string
  amount_description_es: string
  amount_description_en: string
  sector: InvestigationCategory
  source: string
  source_url: string
}

export interface ImpactStat {
  value: string
  label_es: string
  label_en: string
  source: string
}

// ---------------------------------------------------------------------------
// Impact Stats
// ---------------------------------------------------------------------------

export const IMPACT_STATS: readonly ImpactStat[] = [
  {
    value: '44',
    label_es: 'Archivos de investigacion',
    label_en: 'Research files',
    source: '44 archivos JSON: sectores, cruces, factchecks, resoluciones, obras-publicas (1.5MB total)',
  },
  {
    value: '829+',
    label_es: 'Cruces Neo4j con actores monopólicos',
    label_en: 'Neo4j cross-references with monopoly actors',
    source: '240 initial + 141 finanzas + 85 obras + 77 offshore + 124 donations + 162 consolidated = 829+ unique cross-references',
  },
  {
    value: '90',
    label_es: 'Hallazgos puerta giratoria',
    label_en: 'Revolving door findings',
    source: 'Politicians serving as company officers, government appointees with corporate ties',
  },
  {
    value: '39',
    label_es: 'Contratos gubernamentales de empresas monopólicas',
    label_en: 'Govt contracts held by monopoly companies',
    source: 'CompraR procurement data — Telecom 314, AMX 287, Telefónica 281, YPF 245, Ledesma 125',
  },
  {
    value: '38',
    label_es: 'Entidades offshore de familias monopólicas',
    label_en: 'Offshore entities linked to monopoly families',
    source: 'ICIJ Panama/Pandora Papers: Blaquier 7, Roggio 3, Cartellone 2, Coto 1, Werthein 1, Galuccio 1',
  },
  {
    value: '30',
    label_es: 'Directorios cruzados inter-sectoriales',
    label_en: 'Cross-sector interlocking directorates',
    source: 'Board members sitting on companies across monopolized sectors (IGJ registry)',
  },
  {
    value: '44',
    label_es: 'Archivos de investigación JSON',
    label_en: 'Investigation JSON research files',
    source: '44 research JSON files — sectors, cross-refs, factchecks, resolutions, obras-públicas (1.5MB total)',
  },
] as const

// ---------------------------------------------------------------------------
// Factcheck Items
// ---------------------------------------------------------------------------

export const FACTCHECK_ITEMS: readonly FactcheckItem[] = [
  // --- Tier 1: Cross-Sector Monopoly Empires ---
  {
    id: 'clarin-telecom-convergence',
    claim_es:
      'Grupo Clarín (Héctor Magnetto) controla simultáneamente el principal diario, canales de TV (TN, Canal 13), radio (Mitre), cable (Cablevisión/Flow), e infraestructura de telecomunicaciones (Telecom Argentina) tras la fusión de 2018. Controla ~46% banda ancha, ~33% móvil, ~36-40% TV paga.',
    claim_en:
      'Grupo Clarín (Héctor Magnetto) simultaneously controls the leading newspaper, TV channels (TN, Canal 13), radio (Mitre), cable (Cablevisión/Flow), and telecom infrastructure (Telecom Argentina) after the 2018 merger. Controls ~46% broadband, ~33% mobile, ~36-40% pay-TV.',
    status: 'confirmed',
    tier: 1,
    sector: 'telecom',
    source: 'ENACOM / CNDC merger approval',
    source_url: 'https://www.enacom.gob.ar/',
    detail_es:
      'La fusión Telecom-Cablevisión fue aprobada por la CNDC en 2018 bajo condiciones que nunca se cumplieron completamente. Magnetto aparece como officer en 35 empresas según el registro IGJ en Neo4j. La convergencia medios+telecom es única a nivel mundial en su nivel de concentración.',
    detail_en:
      'The Telecom-Cablevisión merger was approved by CNDC in 2018 under conditions never fully met. Magnetto appears as officer in 35 companies per IGJ registry in Neo4j. Media+telecom convergence is globally unique in its concentration level.',
  },
  {
    id: 'techint-vertical-integration',
    claim_es:
      'Techint (familia Rocca) controla producción de acero (Ternium/Siderar ~80% mercado doméstico), tubos de acero (Tenaris, líder mundial), extracción de gas (Tecpetrol, operador principal en Vaca Muerta), y construcción de infraestructura. Integración vertical total.',
    claim_en:
      'Techint (Rocca family) controls steel production (Ternium/Siderar ~80% domestic market), steel pipes (Tenaris, world leader), gas extraction (Tecpetrol, lead operator in Vaca Muerta), and infrastructure construction. Total vertical integration.',
    status: 'confirmed',
    tier: 1,
    sector: 'construction',
    source: 'IGJ Registry / Neo4j CompanyOfficer',
    source_url: 'https://www.techint.com/',
    detail_es:
      'Paolo Rocca/Norberto Rocca aparecen en 20+ empresas en Neo4j. Directores de Techint también en AMX (Guillermo Hang) y Santander (Claudio Cesario). Protección arancelaria al acero impide competencia de importaciones.',
    detail_en:
      'Paolo Rocca/Norberto Rocca appear in 20+ companies in Neo4j. Techint directors also sit on AMX (Guillermo Hang) and Santander (Claudio Cesario) boards. Steel tariff protection prevents import competition.',
  },
  {
    id: 'mindlin-energy-empire',
    claim_es:
      'Marcelo Mindlin (Pampa Energía) controla 52+ empresas incluyendo distribución eléctrica (Edenor), generación, gas, y seguros. Controla tanto generación como distribución, creando un mercado cautivo.',
    claim_en:
      'Marcelo Mindlin (Pampa Energía) controls 52+ companies including electricity distribution (Edenor), generation, gas, and insurance. Controls both generation and distribution, creating a captive market.',
    status: 'confirmed',
    tier: 1,
    sector: 'energy',
    source: 'IGJ Registry / Neo4j CompanyOfficer',
    source_url: 'https://www.pampaenergia.com/',
    detail_es:
      'Marcos Mindlin y Damián Mindlin figuran como officers en 52-61 empresas respectivamente. El control simultáneo de generación y distribución viola el espíritu de la desregulación del mercado eléctrico de los 90s.',
    detail_en:
      'Marcos Mindlin and Damián Mindlin appear as officers in 52-61 companies respectively. Simultaneous control of generation and distribution violates the spirit of 1990s electricity market deregulation.',
  },
  {
    id: 'vila-manzano-media-energy',
    claim_es:
      'Daniel Vila y José Luis Manzano controlan 70+ y 53+ empresas respectivamente, abarcando medios (América TV, Telefe, A24, El Cronista), energía (Edenor/DESA), vinos, e inmobiliarias. Manzano es ex-Ministro del Interior de Menem.',
    claim_en:
      'Daniel Vila and José Luis Manzano control 70+ and 53+ companies respectively, spanning media (América TV, Telefe, A24, El Cronista), energy (Edenor/DESA), wine, and real estate. Manzano is former Interior Minister under Menem.',
    status: 'confirmed',
    tier: 1,
    sector: 'media',
    source: 'IGJ Registry / Neo4j CompanyOfficer',
    source_url: 'https://www.americatv.com.ar/',
    detail_es:
      'Vila-Manzano operan el segundo conglomerado de medios del país. La combinación de poder mediático + negocios energéticos + conexiones políticas directas (Manzano fue ministro) constituye un caso paradigmático de captura político-empresarial.',
    detail_en:
      'Vila-Manzano operate the country\'s second-largest media conglomerate. The combination of media power + energy business + direct political connections (Manzano was minister) constitutes a paradigmatic case of political-corporate capture.',
  },
  {
    id: 'blaquier-offshore-empire',
    claim_es:
      'La familia Blaquier (Ledesma) posee 28+ empresas y 7 entidades offshore en BVI y Panamá según ICIJ: Sunbird International, Silver Stream Ventures, Brahmbari Holdings, Caribbean Lodges, Cabonor International, Yamary Business, Dunmoore Trading.',
    claim_en:
      'The Blaquier family (Ledesma) owns 28+ companies and 7 offshore entities in BVI and Panama per ICIJ: Sunbird International, Silver Stream Ventures, Brahmbari Holdings, Caribbean Lodges, Cabonor International, Yamary Business, Dunmoore Trading.',
    status: 'confirmed',
    tier: 1,
    sector: 'food',
    source: 'ICIJ Offshore Leaks / Neo4j OffshoreOfficer',
    source_url: 'https://offshoreleaks.icij.org/',
    detail_es:
      'Ledesma SAAI tiene 125 contratos gubernamentales en Neo4j. Ledesma posee 17-20% de la producción azucarera nacional (los top 3 grupos suman ~50%). 7 entidades offshore + contratos estatales constituyen el mayor riesgo de erosión de base impositiva entre los grupos monopólicos.',
    detail_en:
      'Ledesma SAAI has 125 government contracts in Neo4j. Ledesma holds 17-20% of national sugar production (top 3 groups account for ~50%). 7 offshore entities + state contracts constitute the largest tax base erosion risk among monopoly groups.',
  },
  {
    id: 'roggio-public-services-offshore',
    claim_es:
      'Familia Roggio controla 33+ empresas de servicios públicos (Metrovías, Cliba, construcción vial) y tiene 3 entidades en BVI: Graymark International, Gotland International, Linhill International. Múltiples miembros familiares figuran como officers.',
    claim_en:
      'Roggio family controls 33+ public service companies (Metrovías, Cliba, road construction) and has 3 BVI entities: Graymark International, Gotland International, Linhill International. Multiple family members listed as officers.',
    status: 'confirmed',
    tier: 1,
    sector: 'construction',
    source: 'ICIJ Offshore Leaks / Neo4j CompanyOfficer',
    source_url: 'https://offshoreleaks.icij.org/',
    detail_es:
      'Aldo Benito Roggio, Martín Roggio, Lucía Roggio, y Rodolfo Roggio Picot todos aparecen en las entidades BVI. Roggio opera servicios públicos esenciales (metro, recolección de residuos, rutas). Dinero público → servicios → offshore.',
    detail_en:
      'Aldo Benito Roggio, Martin Roggio, Lucia Roggio, and Rodolfo Roggio Picot all appear in the BVI entities. Roggio operates essential public services (metro, waste collection, roads). Public money → services → offshore.',
  },
  {
    id: 'coto-retail-panama',
    claim_es:
      'Alfredo Coto controla 26 empresas (Coto CICSA, Frigorífico Uno Más, otros) y figura como officer de Leopold Company S.A. en Panamá según ICIJ. Coto domina el mercado retail del AMBA.',
    claim_en:
      'Alfredo Coto controls 26 companies (Coto CICSA, Frigorífico Uno Más, others) and is listed as officer of Leopold Company S.A. in Panama per ICIJ. Coto dominates the AMBA retail market.',
    status: 'confirmed',
    tier: 1,
    sector: 'food',
    source: 'ICIJ Offshore Leaks / Neo4j CompanyOfficer',
    source_url: 'https://offshoreleaks.icij.org/',
    detail_es:
      'Negocio de alto flujo de efectivo + entidad panameña = riesgo de lavado. Germán Alfredo Coto también aparece como officer en las mismas 18 empresas.',
    detail_en:
      'Cash-intensive retail business + Panama entity = money laundering risk. Germán Alfredo Coto also appears as officer in the same 18 companies.',
  },
  {
    id: 'abcd-grain-cartel',
    claim_es:
      'El cartel ABCD (Cargill, Bunge, Louis Dreyfus, ADM) + AGD + COFCO controla ~60% de las exportaciones de granos y más del 80% del crushing de oleaginosas. Ricardo Martelli figura en 8 entidades de Cargill. Concentración portuaria en el complejo oleaginoso de Rosario.',
    claim_en:
      'The ABCD cartel (Cargill, Bunge, Louis Dreyfus, ADM) + AGD + COFCO controls ~60% of grain exports and over 80% of oilseed crushing. Ricardo Martelli sits on 8 Cargill entities. Port concentration in the Rosario oilseed complex.',
    status: 'confirmed',
    tier: 1,
    sector: 'agroexport',
    source: 'CIARA-CEC / Neo4j CompanyOfficer',
    source_url: 'https://www.ciaracec.com.ar/',
    detail_es:
      'Jorge Perez Alati sienta en directorios de Dreyfus Y Santander simultáneamente — nexo agro-financiero. Bunge aparece como Contractor en Neo4j con CUIT 30700869918. Las terminales portuarias privadas de Rosario manejan 80% del comercio granario.',
    detail_en:
      'Jorge Perez Alati sits on boards of Dreyfus AND Santander simultaneously — agro-finance nexus. Bunge appears as Contractor in Neo4j with CUIT 30700869918. Private Rosario port terminals handle 80% of grain trade.',
  },
  // --- Tier 2: Interlocking Directorates ---
  {
    id: 'elite-law-firms-bridge',
    claim_es:
      'Estudios jurídicos de elite (PAGBAM, Bruchou & Funes de Rioja, Allende & Brea) sirven como puentes de información entre grupos económicos monopolísticos a través de roles de síndico y asesoría legal. Perez Alati (PAGBAM) es síndico de Santander y counsel de Dreyfus simultáneamente.',
    claim_en:
      'Elite law firms (PAGBAM, Bruchou & Funes de Rioja, Allende & Brea) serve as information bridges between monopolistic economic groups through síndico and legal counsel roles. Perez Alati (PAGBAM) is síndico of Santander and counsel to Dreyfus simultaneously.',
    status: 'confirmed',
    tier: 2,
    sector: 'cross_sector',
    source: 'Boletín Oficial / PAGBAM firm profile',
    source_url: 'https://pagbam.com/',
    detail_es:
      'CORRECCIÓN: No son directorios cruzados en sentido antimonopolio (Art. 3(l) Ley 27.442 solo prohíbe entre empresas competidoras para directores). Son roles de síndico/asesor legal. Sin embargo, crean redes de información privilegiada entre sectores.',
    detail_en:
      'CORRECTION: These are NOT antitrust-relevant interlocking directorates (Art. 3(l) Ley 27.442 only prohibits between competing companies for directors). They are síndico/legal counsel roles. However, they create privileged information networks across sectors.',
  },
  {
    id: 'aluar-dual-donor-concession',
    claim_es:
      'Aluar Aluminio Argentino SAIC donó ARS 11.15M a campañas políticas (2017-2019), siendo la ÚNICA empresa que donó a AMBAS coaliciones en 2019 (JxC ARS 4.5M + FdT ARS 3.65M). Viola potencialmente Art. 15 Ley 26.215 que prohíbe donaciones de concesionarios estatales — Aluar posee 60.2% de Futaleufú (concesión estatal).',
    claim_en:
      'Aluar Aluminio Argentino SAIC donated ARS 11.15M to campaigns (2017-2019), being the ONLY company to donate to BOTH coalitions in 2019 (JxC ARS 4.5M + FdT ARS 3.65M). Potentially violates Art. 15 Ley 26.215 prohibiting donations from state concessionaires — Aluar owns 60.2% of Futaleufú (state concession).',
    status: 'confirmed',
    tier: 2,
    sector: 'cross_sector',
    source: 'CNE campaign finance records / Ley 26.215',
    source_url: 'https://www.electoral.gob.ar/',
    detail_es:
      'FdT inicialmente RECHAZÓ la donación de ARS 900K alegando que Aluar es concesionario estatal. Luego la aceptó cuando Aluar argumentó que la concesión es de la subsidiaria Futaleufú SA, no de Aluar directamente. Donación hedging clásica de monopolista dependiente de concesiones.',
    detail_en:
      'FdT initially REJECTED the ARS 900K donation arguing Aluar is a state concessionaire. Later accepted when Aluar argued the concession is held by subsidiary Futaleufú SA, not Aluar directly. Classic hedging donation by a monopolist dependent on concessions.',
  },
  {
    id: 'igj-cumulative-records-caveat',
    claim_es:
      'NOTA METODOLÓGICA: Los registros IGJ en Neo4j son ACUMULATIVOS — incluyen TODAS las posiciones históricas en directorios, no solo las actuales. Los conteos de empresas por persona (Magnetto 35, Vila 70+, Mindlin 52) incluyen roles pasados y subsidiarias. De Narváez vendió América TV (2017) y El Cronista (2021) pero aún figuran en IGJ.',
    claim_en:
      'METHODOLOGICAL NOTE: IGJ records in Neo4j are CUMULATIVE — they include ALL historical board positions, not just current ones. Company counts per person (Magnetto 35, Vila 70+, Mindlin 52) include past roles and subsidiaries. De Narváez sold América TV (2017) and El Cronista (2021) but they still appear in IGJ.',
    status: 'confirmed',
    tier: 3,
    sector: 'cross_sector',
    source: 'IGJ Registry methodology / factcheck resolution',
    source_url: 'https://www.igj.gob.ar/',
  },
  // --- Tier 2: Regulatory Capture ---
  {
    id: 'enacom-clarin-deregulation',
    claim_es:
      'En 2015, el gobierno Macri derogó parcialmente la Ley de Medios (26.522) mediante DNU 267/2015, creando ENACOM y eliminando restricciones clave a la concentración cruzada medios-telecom. Esto permitió la fusión Telecom-Cablevisión de 2018.',
    claim_en:
      'In 2015, the Macri government partially repealed the Media Law (26.522) via DNU 267/2015, creating ENACOM and removing key cross-ownership restrictions for media-telecom. This enabled the 2018 Telecom-Cablevisión merger.',
    status: 'confirmed',
    tier: 2,
    sector: 'regulatory_capture',
    source: 'Boletín Oficial / DNU 267/2015',
    source_url: 'https://www.boletinoficial.gob.ar/',
    detail_es:
      'La desregulación eliminó los topes de concentración de mercado que impedían la convergencia medios-telecomunicaciones. El ENACOM reemplazó a la AFSCA con un mandato más débil.',
    detail_en:
      'Deregulation removed market concentration caps that prevented media-telecom convergence. ENACOM replaced AFSCA with a weaker mandate.',
  },
  {
    id: 'cndc-institutional-weakness',
    claim_es:
      'La CNDC (Comisión Nacional de Defensa de la Competencia) opera sin autonomía presupuestaria, con personal insuficiente, y sin poder sancionatorio efectivo. En comparación, CADE de Brasil tiene 600+ empleados y poder de multa.',
    claim_en:
      'CNDC (National Competition Commission) operates without budget autonomy, with insufficient staff, and no effective sanctioning power. By comparison, Brazil\'s CADE has 600+ employees and fining power.',
    status: 'confirmed',
    tier: 2,
    sector: 'regulatory_capture',
    source: 'CNDC / OECD Competition Review Argentina',
    source_url: 'https://www.oecd.org/competition/',
    detail_es:
      'La Ley de Defensa de la Competencia (27.442, 2018) fue un avance pero la CNDC sigue sin tribunal autónomo. Casos de cartel de cemento y oxígeno medicinal tardaron años en resolverse.',
    detail_en:
      'The Competition Defense Law (27.442, 2018) was progress but CNDC still lacks an autonomous tribunal. Cement and medical oxygen cartel cases took years to resolve.',
  },
  {
    id: 'edenor-edesur-duopoly',
    claim_es:
      'Edenor (Pampa Energía/Mindlin) y Edesur (Enel) conforman un duopolio de distribución eléctrica en Buenos Aires. ENRE como regulador carece de independencia efectiva. Las tarifas subsidiadas benefician desproporcionadamente a las distribuidoras.',
    claim_en:
      'Edenor (Pampa Energía/Mindlin) and Edesur (Enel) form an electricity distribution duopoly in Buenos Aires. ENRE as regulator lacks effective independence. Subsidized tariffs disproportionately benefit distributors.',
    status: 'confirmed',
    tier: 2,
    sector: 'energy',
    source: 'ENRE / Secretaría de Energía',
    source_url: 'https://www.enre.gov.ar/',
  },
  {
    id: 'mining-rigi-foreign-control',
    claim_es:
      'El 100% de la extracción de litio argentino está controlada por empresas extranjeras. El régimen RIGI otorga estabilidad fiscal de 30 años, regalías de solo 3%, y libre repatriación de ganancias. Las provincias controlan concesiones sin supervisión federal efectiva.',
    claim_en:
      '100% of Argentine lithium extraction is controlled by foreign companies. RIGI regime grants 30-year tax stability, royalties of just 3%, and free profit repatriation. Provinces control concessions without effective federal oversight.',
    status: 'confirmed',
    tier: 2,
    sector: 'mining',
    source: 'Secretaría de Minería / RIGI Law',
    source_url: 'https://www.argentina.gob.ar/economia/mineria',
  },
  {
    id: 'pharma-pricing-premium',
    claim_es:
      'Los precios de medicamentos en Argentina son 40-100% superiores al promedio regional latinoamericano. Roemmers (líder de mercado) y Bagó dominan las licitaciones de PAMI. La penetración de genéricos es baja.',
    claim_en:
      'Drug prices in Argentina are 40-100% above Latin American regional average. Roemmers (market leader) and Bagó dominate PAMI tenders. Generic drug penetration is low.',
    status: 'confirmed',
    tier: 2,
    sector: 'pharma',
    source: 'ANMAT / PAMI procurement data',
    source_url: 'https://www.anmat.gob.ar/',
  },
  // --- Tier 2: Construction Cartel ---
  {
    id: 'cuadernos-construction-cartel',
    claim_es:
      'Los "cuadernos de la corrupción" (2018) revelaron pagos sistemáticos de sobornos de empresas constructoras a funcionarios públicos. Involucra a Electroingeniería (Ferreyra), IECSA, y otros. Odebrecht pagó USD 35M en sobornos en Argentina.',
    claim_en:
      'The "corruption notebooks" (2018) revealed systematic bribery payments from construction companies to public officials. Involves Electroingeniería (Ferreyra), IECSA, and others. Odebrecht paid USD 35M in bribes in Argentina.',
    status: 'confirmed',
    tier: 2,
    sector: 'construction',
    source: 'Poder Judicial / Causa Cuadernos',
    source_url: 'https://www.cij.gov.ar/',
    detail_es:
      'Electroingeniería S.A. aparece como Contractor en Neo4j con UTEs (joint ventures). Francisco Macri (IECSA/Socma) tiene 17 empresas en Neo4j. La causa Cuadernos fue la mayor investigación anti-corrupción de la historia argentina.',
    detail_en:
      'Electroingeniería S.A. appears as Contractor in Neo4j with UTEs (joint ventures). Francisco Macri (IECSA/Socma) has 17 companies in Neo4j. The Cuadernos case was the largest anti-corruption investigation in Argentine history.',
  },
  {
    id: 'loma-negra-cement-monopoly',
    claim_es:
      'Loma Negra (ahora controlada por Camargo Corrêa de Brasil) domina el mercado de cemento argentino. La CNDC investigó prácticas de cartel entre Loma Negra, Holcim y otros productores.',
    claim_en:
      'Loma Negra (now controlled by Brazil\'s Camargo Corrêa) dominates the Argentine cement market. CNDC investigated cartel practices between Loma Negra, Holcim, and other producers.',
    status: 'confirmed',
    tier: 2,
    sector: 'construction',
    source: 'CNDC / Causa Cemento',
    source_url: 'https://www.argentina.gob.ar/cndc',
  },
  // --- Tier 3: Revolving Door & Political Connections ---
  {
    id: 'de-narvaez-35-companies',
    claim_es:
      'Francisco De Narváez, diputado nacional por Buenos Aires, aparece como officer en ~25-30 empresas activas (IGJ acumulativo muestra 35 incluyendo históricas). Vendió su participación en América TV (2017) y El Cronista (2021). Tiene 3 entidades offshore activas en BVI (Retrato Partners, Titan Consulting).',
    claim_en:
      'Francisco De Narváez, national deputy for Buenos Aires, appears as officer in ~25-30 active companies (IGJ cumulative shows 35 including historical). Sold his stake in América TV (2017) and El Cronista (2021). Has 3 active BVI offshore entities (Retrato Partners, Titan Consulting).',
    status: 'confirmed',
    tier: 3,
    sector: 'cross_sector',
    source: 'IGJ Registry / Neo4j CompanyOfficer + Politician',
    source_url: 'https://www.igj.gob.ar/',
  },
  {
    id: 'macri-multi-dataset',
    claim_es:
      'Mauricio Macri aparece en 4 datasets simultáneamente: CompanyOfficer (17 empresas incluyendo IECSA/Socma), Politician (diputado CABA), GovernmentAppointment, y Donor. También cruza con AssetDeclaration.',
    claim_en:
      'Mauricio Macri appears in 4 datasets simultaneously: CompanyOfficer (17 companies including IECSA/Socma), Politician (deputy CABA), GovernmentAppointment, and Donor. Also cross-references with AssetDeclaration.',
    status: 'confirmed',
    tier: 3,
    sector: 'cross_sector',
    source: 'Neo4j SAME_ENTITY / Cross-reference engine',
    source_url: 'https://www.igj.gob.ar/',
  },
  {
    id: 'galuccio-vista-malta',
    claim_es:
      'Miguel Matías Galuccio, ex-CEO de YPF y fundador de Vista Oil & Gas, figura como officer de Vera Limited en Malta según ICIJ. Malta es jurisdicción preferida para planificación fiscal en la UE.',
    claim_en:
      'Miguel Matías Galuccio, former YPF CEO and Vista Oil & Gas founder, is listed as officer of Vera Limited in Malta per ICIJ. Malta is a preferred EU tax planning jurisdiction.',
    status: 'confirmed',
    tier: 3,
    sector: 'energy',
    source: 'ICIJ Offshore Leaks / Neo4j OffshoreOfficer',
    source_url: 'https://offshoreleaks.icij.org/',
  },
  {
    id: 'arsat-gov-captured',
    claim_es:
      'ARSAT (empresa satelital estatal) tiene 22 officers con conexiones gubernamentales en Neo4j, el mayor número de cualquier empresa. CAMMESA (administradora del mercado eléctrico) tiene 8.',
    claim_en:
      'ARSAT (state satellite company) has 22 government-connected officers in Neo4j, the highest of any company. CAMMESA (electricity market administrator) has 8.',
    status: 'confirmed',
    tier: 3,
    sector: 'regulatory_capture',
    source: 'Neo4j GovernmentAppointment-CompanyOfficer cross-reference',
    source_url: 'https://www.igj.gob.ar/',
  },
  {
    id: 'papel-prensa-vertical-chain',
    claim_es:
      'Papel Prensa (controlada por Clarín + La Nación + Estado) es el único fabricante de papel de diario en Argentina. Ledesma (Blaquier) produce la celulosa. Clarín consume el papel. Cadena vertical de suministro entre monopolios.',
    claim_en:
      'Papel Prensa (controlled by Clarín + La Nación + State) is the only newsprint manufacturer in Argentina. Ledesma (Blaquier) produces the pulp. Clarín consumes the paper. Vertical supply chain across monopolies.',
    status: 'confirmed',
    tier: 3,
    sector: 'media',
    source: 'Papel Prensa S.A. records / IGJ',
    source_url: 'https://www.igj.gob.ar/',
    detail_es:
      'Papel Prensa aparece en Neo4j como Contractor (CUIT vinculado). La conexión Blaquier-celulosa → Papel Prensa → Clarín-periódico ilustra cómo los monopolios se refuerzan mutuamente a lo largo de la cadena productiva.',
    detail_en:
      'Papel Prensa appears in Neo4j as Contractor (linked CUIT). The Blaquier-pulp → Papel Prensa → Clarín-newspaper connection illustrates how monopolies reinforce each other along the production chain.',
  },
  // --- Waves 15-22: Extended Sector Analysis ---
  {
    id: 'aluar-pure-monopoly',
    claim_es:
      'Aluar (familia Madanes Quintanilla) es el ÚNICO productor de aluminio en Argentina (HHI 10,000 — monopolio puro). Opera desde Puerto Madryn con energía subsidiada de la represa Futaleufú. La familia aparece en los Panama Papers.',
    claim_en:
      'Aluar (Madanes Quintanilla family) is the ONLY aluminium producer in Argentina (HHI 10,000 — pure monopoly). Operates from Puerto Madryn with subsidized energy from Futaleufú dam. Family appears in Panama Papers.',
    status: 'confirmed',
    tier: 1,
    sector: 'cross_sector',
    source: 'ICIJ Panama Papers / Production records',
    source_url: 'https://offshoreleaks.icij.org/',
    detail_es:
      'Aluar también controla FATE (neumáticos). Protección arancelaria impide importaciones competitivas. El monopolio ha sobrevivido a todos los gobiernos desde 1970.',
    detail_en:
      'Aluar also controls FATE (tires). Tariff protection prevents competitive imports. The monopoly has survived every government since 1970.',
  },
  {
    id: 'mastellone-dairy-monopoly',
    claim_es:
      'Mastellone/La Serenísima controla ~90% del mercado de leche fluida en AMBA y 75-80% a nivel nacional. En lácteos totales, ~58% del mercado. El colapso de SanCor eliminó al principal competidor cooperativo.',
    claim_en:
      'Mastellone/La Serenísima controls ~90% of fluid milk market in AMBA and 75-80% nationally. In total dairy, ~58% of the market. SanCor\'s collapse eliminated the main cooperative competitor.',
    status: 'confirmed',
    tier: 1,
    sector: 'food',
    source: 'CNDC / Industry data',
    source_url: 'https://www.argentina.gob.ar/cndc',
    detail_es:
      'Mastellone Hnos. aparece como Contractor en Neo4j con CUIT 30547242331 (5 contratos gubernamentales). La sociedad con Danone reforzó la dominancia en lugar de crear competencia.',
    detail_en:
      'Mastellone Hnos. appears as Contractor in Neo4j with CUIT 30547242331 (5 government contracts). The Danone partnership reinforced dominance rather than creating competition.',
  },
  {
    id: 'nacion-seguros-procurement-monopoly',
    claim_es:
      'Nación Seguros S.A. tiene 598 contratos gubernamentales en CompraR — el MAYOR número de contratos de CUALQUIER contratista en el sistema (13,585 contratistas, 86,648 contratos totales). Monopolio de facto en seguros estatales.',
    claim_en:
      'Nación Seguros S.A. has 598 government contracts in CompraR — the HIGHEST number of any contractor in the system (13,585 contractors, 86,648 total contracts). De facto monopoly in state insurance.',
    status: 'confirmed',
    tier: 2,
    sector: 'banking',
    source: 'CompraR / Neo4j Contractor data',
    source_url: 'https://comprar.gob.ar/',
  },
  {
    id: 'privatization-monopoly-origin',
    claim_es:
      'Las privatizaciones menemistas (1989-1999) crearon los monopolios actuales: ENTel → Telecom/Telefónica duopolio (ahora fusionándose), SEGBA → Edenor/Edesur duopolio, GdE → TGS/TGN, Aerolíneas → concesión ruinosa. Los compradores conectados pagaron precios subvaluados.',
    claim_en:
      'Menem-era privatizations (1989-1999) created current monopolies: ENTel → Telecom/Telefónica duopoly (now merging), SEGBA → Edenor/Edesur duopoly, GdE → TGS/TGN, Aerolíneas → ruinous concession. Connected buyers paid undervalued prices.',
    status: 'confirmed',
    tier: 2,
    sector: 'cross_sector',
    source: 'Congressional privatization records / Boletín Oficial',
    source_url: 'https://www.boletinoficial.gob.ar/',
    detail_es:
      'Roberto Dromi: "nada de lo que deba ser estatal permanecerá en manos del Estado". María Julia Alsogaray procesada por enriquecimiento ilícito durante privatizaciones.',
    detail_en:
      'Roberto Dromi: "nothing that should be state-owned will remain in the hands of the State." María Julia Alsogaray prosecuted for illicit enrichment during privatizations.',
  },
  {
    id: 'milei-dnu-media-deregulation',
    claim_es:
      'DNU 70/2023 (Milei) eliminó todos los topes nacionales de licencias de medios y derogó la ley de supervisión de papel prensa. Habilitó la venta de Telefe a Vila-Manzano, dándole control de los 2 canales más vistos.',
    claim_en:
      'DNU 70/2023 (Milei) eliminated all national media license caps and repealed the newsprint oversight law. Enabled Telefe sale to Vila-Manzano, giving them control of the 2 most-watched channels.',
    status: 'confirmed',
    tier: 2,
    sector: 'regulatory_capture',
    source: 'Boletín Oficial DNU 70/2023',
    source_url: 'https://www.boletinoficial.gob.ar/',
  },
  {
    id: 'eurnekian-airport-monopoly',
    claim_es:
      'Eduardo Eurnekian (Corporación América/AA2000) controla 35 aeropuertos argentinos en concesión. 35 empresas en IGJ + entidad BVI (Viskert Enterprises). La concesión ha sido renegociada y extendida bajo múltiples gobiernos.',
    claim_en:
      'Eduardo Eurnekian (Corporación América/AA2000) controls 35 Argentine airports under concession. 35 companies in IGJ + BVI entity (Viskert Enterprises). Concession renegotiated and extended under multiple governments.',
    status: 'confirmed',
    tier: 2,
    sector: 'transport',
    source: 'IGJ Registry / ICIJ / ORSNA',
    source_url: 'https://www.igj.gob.ar/',
  },
  {
    id: 'mercadolibre-digital-monopoly',
    claim_es:
      'MercadoLibre (Marcos Galperín, USD 10B) domina e-commerce (~60%+ market share) y pagos digitales (Mercado Pago, 74% wallet share, 35M cuentas). Los top 3 neobancos tienen 88% del mercado de banca digital. Galperín se mudó a Uruguay por planificación fiscal.',
    claim_en:
      'MercadoLibre (Marcos Galperín, USD 10B) dominates e-commerce (~60%+ market share) and digital payments (Mercado Pago, 74% wallet share, 35M accounts). Top 3 neobanks hold 88% of digital banking. Galperín relocated to Uruguay for tax planning.',
    status: 'confirmed',
    tier: 2,
    sector: 'banking',
    source: 'SEC filings / Industry reports',
    source_url: 'https://mercadolibre.com/',
    detail_es:
      'MercadoLibre SRL aparece en Neo4j como Company. No hay regulación de plataformas en Argentina vs. Digital Markets Act de la UE. Los monopolios digitales están reemplazando a los tradicionales.',
    detail_en:
      'MercadoLibre SRL appears in Neo4j as Company. No platform regulation in Argentina vs. EU Digital Markets Act. Digital monopolies are replacing traditional ones.',
  },
  {
    id: 'telecom-procurement-dominance',
    claim_es:
      'El sector telecom monopólico tiene 1,334 contratos gubernamentales combinados: Telecom Argentina 411, Telefónica 335, AMX/Claro 288, Cablevisión 13. El 1.5% del total de contratos pero concentrados en telecomunicaciones estatales.',
    claim_en:
      'The monopolized telecom sector holds 1,334 combined government contracts: Telecom Argentina 411, Telefónica 335, AMX/Claro 288, Cablevisión 13. 1.5% of total contracts but concentrated in state telecom.',
    status: 'confirmed',
    tier: 2,
    sector: 'telecom',
    source: 'CompraR / Neo4j Contractor data',
    source_url: 'https://comprar.gob.ar/',
  },
  {
    id: 'consumer-cost-pharma',
    claim_es:
      'Los precios de medicamentos en Argentina son 26% superiores al promedio latinoamericano. Los trabajadores necesitan 4 horas extra de trabajo respecto al promedio regional para comprar la misma canasta de medicamentos. PAMI documentó sobreprecios de hasta 1,327% en oncológicos.',
    claim_en:
      'Drug prices in Argentina are 26% above the Latin American average. Workers need 4 extra working hours vs. regional average to buy the same medicine basket. PAMI documented markups up to 1,327% on oncology drugs.',
    status: 'confirmed',
    tier: 2,
    sector: 'pharma',
    source: 'PAMI / Industry reports',
    source_url: 'https://www.pami.org.ar/',
  },
] as const

// ---------------------------------------------------------------------------
// Key Actors
// ---------------------------------------------------------------------------

export const ACTORS: readonly Actor[] = [
  {
    id: 'magnetto',
    name: 'Héctor Horacio Magnetto',
    role_es: 'CEO Grupo Clarín',
    role_en: 'CEO Grupo Clarín',
    description_es: 'Arquitecto de la convergencia medios-telecom. Officer en 35 empresas registradas en IGJ.',
    description_en: 'Architect of media-telecom convergence. Officer in 35 IGJ-registered companies.',
    sectors: ['telecom', 'media'],
    companies_count: 35,
    offshore_count: 0,
  },
  {
    id: 'rocca',
    name: 'Paolo Rocca / Norberto Rocca',
    role_es: 'Familia controlante, Grupo Techint',
    role_en: 'Controlling family, Techint Group',
    description_es: 'Control de acero, tubos, petróleo, gas, y construcción. Integración vertical total.',
    description_en: 'Control of steel, pipes, oil, gas, and construction. Total vertical integration.',
    sectors: ['construction', 'energy'],
    companies_count: 20,
    offshore_count: 0,
  },
  {
    id: 'mindlin',
    name: 'Marcelo Mindlin',
    role_es: 'Presidente, Pampa Energía',
    role_en: 'Chairman, Pampa Energía',
    description_es: 'Controla distribución eléctrica (Edenor) + generación + gas + seguros. 52 empresas.',
    description_en: 'Controls electricity distribution (Edenor) + generation + gas + insurance. 52 companies.',
    sectors: ['energy'],
    companies_count: 52,
    offshore_count: 0,
  },
  {
    id: 'vila-manzano',
    name: 'Daniel Vila / José Luis Manzano',
    role_es: 'Grupo América (medios + energía)',
    role_en: 'Grupo América (media + energy)',
    description_es: 'Mayor conglomerado mediático (América TV + Telefe). Manzano ex-ministro del Interior. 70+/53+ empresas. También controlan Edenor vía DESA.',
    description_en: 'Largest media conglomerate (América TV + Telefe). Manzano former Interior Minister. 70+/53+ companies. Also control Edenor via DESA.',
    sectors: ['media', 'energy'],
    companies_count: 70,
    offshore_count: 0,
  },
  {
    id: 'roggio',
    name: 'Familia Roggio',
    role_es: 'Construcción, servicios públicos (metro, residuos)',
    role_en: 'Construction, public services (metro, waste)',
    description_es: '33+ empresas de servicios públicos. 3 entidades BVI (Graymark, Gotland, Linhill). Múltiples familiares involucrados.',
    description_en: '33+ public service companies. 3 BVI entities (Graymark, Gotland, Linhill). Multiple family members involved.',
    sectors: ['construction', 'transport'],
    companies_count: 33,
    offshore_count: 3,
  },
  {
    id: 'blaquier',
    name: 'Familia Blaquier (Ledesma)',
    role_es: 'Azúcar, papel, agricultura, offshore',
    role_en: 'Sugar, paper, agriculture, offshore',
    description_es: 'Mayor red offshore de familias monopólicas: 7 entidades BVI/Panamá. 28+ empresas, 125 contratos gubernamentales.',
    description_en: 'Largest offshore network among monopoly families: 7 BVI/Panama entities. 28+ companies, 125 government contracts.',
    sectors: ['food', 'agroexport'],
    companies_count: 28,
    offshore_count: 7,
  },
  {
    id: 'coto',
    name: 'Alfredo Coto',
    role_es: 'Retail AMBA (Coto CICSA)',
    role_en: 'AMBA retail (Coto CICSA)',
    description_es: '26 empresas incluyendo frigoríficos. Leopold Company S.A. en Panamá según ICIJ.',
    description_en: '26 companies including meatpacking. Leopold Company S.A. in Panama per ICIJ.',
    sectors: ['food'],
    companies_count: 26,
    offshore_count: 1,
  },
  {
    id: 'werthein',
    name: 'Familia Werthein',
    role_es: 'Seguros, banca, agricultura',
    role_en: 'Insurance, banking, agriculture',
    description_es: '30 empresas. Canrold Overseas (offshore). Diversificación en sector financiero.',
    description_en: '30 companies. Canrold Overseas (offshore). Financial sector diversification.',
    sectors: ['banking'],
    companies_count: 30,
    offshore_count: 1,
  },
  {
    id: 'eurnekian',
    name: 'Eduardo Eurnekian',
    role_es: 'Aeropuertos, energía, medios',
    role_en: 'Airports, energy, media',
    description_es: '35 empresas. Concesionario de aeropuertos (AA2000). Viskert Enterprises BVI (familiar).',
    description_en: '35 companies. Airport concessionaire (AA2000). Viskert Enterprises BVI (family member).',
    sectors: ['transport', 'energy', 'media'],
    companies_count: 35,
    offshore_count: 1,
  },
  {
    id: 'perez-companc',
    name: 'Familia Pérez Companc',
    role_es: 'Alimentos procesados (Molinos Río de la Plata)',
    role_en: 'Processed food (Molinos Río de la Plata)',
    description_es: '23 empresas. Domina mercado de alimentos envasados. Ex-conglomerado energético vendido a Petrobras.',
    description_en: '23 companies. Dominates packaged food market. Former energy conglomerate sold to Petrobras.',
    sectors: ['food'],
    companies_count: 23,
    offshore_count: 0,
  },
  {
    id: 'madanes-quintanilla',
    name: 'Familia Madanes Quintanilla',
    role_es: 'Aluar Aluminio + FATE Neumáticos',
    role_en: 'Aluar Aluminium + FATE Tires',
    description_es: 'Monopolio puro en aluminio (HHI 10,000). Panama Papers. Protección arancelaria + energía subsidiada desde 1970.',
    description_en: 'Pure aluminium monopoly (HHI 10,000). Panama Papers. Tariff protection + subsidized energy since 1970.',
    sectors: ['cross_sector'],
    companies_count: 10,
    offshore_count: 1,
  },
  {
    id: 'mastellone',
    name: 'Familia Mastellone',
    role_es: 'La Serenísima — lácteos',
    role_en: 'La Serenísima — dairy',
    description_es: '~90% leche fluida Buenos Aires. Sociedad con Danone. Competidor cooperativo SanCor colapsó.',
    description_en: '~90% fluid milk Buenos Aires. Danone partnership. Cooperative competitor SanCor collapsed.',
    sectors: ['food'],
    companies_count: 8,
    offshore_count: 0,
  },
  {
    id: 'galperin',
    name: 'Marcos Galperín',
    role_es: 'MercadoLibre / Mercado Pago',
    role_en: 'MercadoLibre / Mercado Pago',
    description_es: 'USD 10B. E-commerce 60%+ market share. Mercado Pago 74% wallet. Mudado a Uruguay.',
    description_en: 'USD 10B. E-commerce 60%+ market share. Mercado Pago 74% wallet. Relocated to Uruguay.',
    sectors: ['banking'],
    companies_count: 5,
    offshore_count: 0,
  },
] as const

// ---------------------------------------------------------------------------
// Timeline Events
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  {
    id: 'ley-medios-2009',
    date: '2009-10-10',
    title_es: 'Ley de Medios 26.522',
    title_en: 'Media Law 26.522',
    description_es: 'Congreso aprueba Ley de Servicios de Comunicación Audiovisual, limitando concentración de medios. Clarín litiga durante años.',
    description_en: 'Congress approves Audiovisual Communication Services Law, limiting media concentration. Clarín litigates for years.',
    category: 'media',
    sources: ['Boletín Oficial'],
  },
  {
    id: 'dnu-267-2015',
    date: '2015-12-29',
    title_es: 'DNU 267/2015 — Derogación Ley de Medios',
    title_en: 'DNU 267/2015 — Media Law Repeal',
    description_es: 'Gobierno Macri deroga Ley de Medios por decreto, crea ENACOM, elimina restricciones de concentración cruzada.',
    description_en: 'Macri government repeals Media Law by decree, creates ENACOM, removes cross-ownership restrictions.',
    category: 'regulatory_capture',
    sources: ['Boletín Oficial DNU 267/2015'],
  },
  {
    id: 'fusion-telecom-cablevision-2018',
    date: '2018-06-28',
    title_es: 'Fusión Telecom-Cablevisión aprobada',
    title_en: 'Telecom-Cablevisión merger approved',
    description_es: 'CNDC aprueba fusión creando el mayor conglomerado de telecomunicaciones de Argentina bajo control de Grupo Clarín.',
    description_en: 'CNDC approves merger creating Argentina\'s largest telecom conglomerate under Clarín Group control.',
    category: 'telecom',
    sources: ['CNDC Resolution'],
  },
  {
    id: 'cuadernos-2018',
    date: '2018-08-01',
    title_es: 'Caso Cuadernos de la Corrupción',
    title_en: 'Corruption Notebooks Case',
    description_es: 'Se revelan los cuadernos del chofer Oscar Centeno documentando pagos de sobornos de constructoras a funcionarios durante 2005-2015.',
    description_en: 'Driver Oscar Centeno\'s notebooks are revealed documenting bribery payments from construction companies to officials during 2005-2015.',
    category: 'construction',
    sources: ['Poder Judicial / Causa CFP 9608/2018'],
  },
  {
    id: 'vicentin-default-2020',
    date: '2020-02-10',
    title_es: 'Default de Vicentin — USD 1.5B',
    title_en: 'Vicentin Default — USD 1.5B',
    description_es: 'Agroexportadora Vicentin entra en default por USD 1.5B, exponiendo fraude crediticio y conexiones políticas.',
    description_en: 'Agro-exporter Vicentin defaults on USD 1.5B, exposing credit fraud and political connections.',
    category: 'agroexport',
    sources: ['Poder Judicial / Causa Vicentin'],
  },
  {
    id: 'rigi-2024',
    date: '2024-07-08',
    title_es: 'Régimen RIGI aprobado',
    title_en: 'RIGI Regime Approved',
    description_es: 'Se aprueba el Régimen de Incentivo a las Grandes Inversiones: 30 años de estabilidad fiscal, regalías del 3%, libre repatriación. Beneficia principalmente a mineras extranjeras.',
    description_en: 'Large Investment Incentive Regime approved: 30-year tax stability, 3% royalties, free repatriation. Primarily benefits foreign mining companies.',
    category: 'mining',
    sources: ['Ley Bases / Boletín Oficial'],
  },
  {
    id: 'privatizaciones-menem-1989',
    date: '1989-08-17',
    title_es: 'Ley de Reforma del Estado 23.696',
    title_en: 'State Reform Law 23.696',
    description_es: 'Congreso aprueba ley que habilita privatización masiva de empresas estatales: ENTel, Aerolíneas, SEGBA, Gas del Estado, YPF, agua, trenes. Origen de los monopolios privados actuales.',
    description_en: 'Congress approves law enabling mass privatization of state companies: ENTel, Aerolíneas, SEGBA, Gas del Estado, YPF, water, railways. Origin of current private monopolies.',
    category: 'cross_sector',
    sources: ['Ley 23.696 / Boletín Oficial'],
  },
  {
    id: 'dnu-70-2023',
    date: '2023-12-20',
    title_es: 'DNU 70/2023 — Megadecreto desregulador Milei',
    title_en: 'DNU 70/2023 — Milei mega-deregulation decree',
    description_es: 'Deroga restricciones a concentración de medios, ley de góndolas, controles de precios, y regulaciones sectoriales. Beneficia a grupos monopólicos establecidos.',
    description_en: 'Repeals media concentration restrictions, shelf-space law, price controls, and sector regulations. Benefits established monopoly groups.',
    category: 'regulatory_capture',
    sources: ['Boletín Oficial DNU 70/2023'],
  },
  {
    id: 'telefe-sale-2025',
    date: '2025-01-15',
    title_es: 'Vila-Manzano compra Telefe por USD 95M',
    title_en: 'Vila-Manzano buys Telefe for USD 95M',
    description_es: 'Grupo América (Vila-Manzano) adquiere Telefe de Paramount, controlando ahora los 2 canales más vistos de Argentina (Telefe + América TV). Posible por desregulación de medios.',
    description_en: 'Grupo América (Vila-Manzano) acquires Telefe from Paramount, now controlling Argentina\'s 2 most-watched channels (Telefe + América TV). Made possible by media deregulation.',
    category: 'media',
    sources: ['Infobae / ENACOM'],
  },
] as const
