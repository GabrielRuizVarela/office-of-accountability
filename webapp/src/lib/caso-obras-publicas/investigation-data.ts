/**
 * Obras Publicas investigation structured data for the webapp.
 *
 * Bilingual (EN primary, ES secondary) factcheck items, timeline events,
 * actors, money flows, evidence documents, impact stats, and government
 * responses — all sourced from the obras-publicas graph analysis and
 * cross-reference engine findings.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FactcheckStatus =
  | 'confirmed'
  | 'alleged'
  | 'denied'
  | 'under_investigation'

export interface FactcheckItem {
  id: string
  claim_en: string
  claim_es: string
  status: FactcheckStatus
  source: string
  source_url: string
  detail_en?: string
  detail_es?: string
}

export type InvestigationCategory =
  | 'political'
  | 'financial'
  | 'legal'
  | 'media'
  | 'coverup'

export interface InvestigationTimelineEvent {
  id: string
  date: string
  title_en: string
  title_es: string
  description_en: string
  description_es: string
  category: InvestigationCategory
  sources: string[]
}

export interface Actor {
  id: string
  name: string
  role_en: string
  role_es: string
  description_en: string
  description_es: string
  nationality: string
  status_en?: string
  status_es?: string
}

export interface MoneyFlow {
  id: string
  from_label: string
  to_label: string
  amount_usd: number
  date: string
  source: string
}

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'unverified'

export interface EvidenceDoc {
  id: string
  title: string
  type_en: string
  type_es: string
  date: string
  summary_en: string
  summary_es: string
  source_url: string
  verification_status: VerificationStatus
}

export interface ImpactStat {
  value: string
  label_en: string
  label_es: string
  source: string
}

export interface GovernmentResponse {
  id: string
  date: string
  action_en: string
  action_es: string
  effect_en: string
  effect_es: string
  source_url?: string
}

// ---------------------------------------------------------------------------
// IMPACT_STATS
// ---------------------------------------------------------------------------

export const IMPACT_STATS: ImpactStat[] = [
  {
    value: '37,351',
    label_en: 'Entities traced in the obras-publicas graph',
    label_es: 'Entidades rastreadas en el grafo de obras publicas',
    source: 'Office of Accountability knowledge graph',
  },
  {
    value: '43,615',
    label_en: 'Cross-references linking to finanzas-politicas',
    label_es: 'Referencias cruzadas vinculadas a finanzas-politicas',
    source: 'Office of Accountability cross-reference engine',
  },
  {
    value: '12,431',
    label_en: 'Investigation flags detected',
    label_es: 'Alertas de investigacion detectadas',
    source: 'Office of Accountability cross-reference engine',
  },
  {
    value: '7,481',
    label_en: 'Public works analyzed',
    label_es: 'Obras publicas analizadas',
    source: 'CONTRAT.AR / datos.gob.ar',
  },
  {
    value: '28,419',
    label_en: 'Contractors registered in the graph',
    label_es: 'Contratistas registrados en el grafo',
    source: 'CONTRAT.AR / datos.gob.ar',
  },
  {
    value: '3',
    label_en: 'International bribery cases mapped (Odebrecht, Cuadernos, Siemens)',
    label_es: 'Casos internacionales de soborno mapeados (Odebrecht, Cuadernos, Siemens)',
    source: 'DOJ plea agreements, Argentine federal court records',
  },
]

// ---------------------------------------------------------------------------
// FACTCHECK_ITEMS
// ---------------------------------------------------------------------------

export const FACTCHECK_ITEMS: FactcheckItem[] = [
  {
    id: 'fc-rn3-execution',
    claim_en: 'Autopista RN3 Canuelas-Azul ($86.7B ARS) has only 19.2% financial execution despite being marked as completed.',
    claim_es: 'La Autopista RN3 Canuelas-Azul ($86.700M ARS) tiene solo 19,2% de ejecucion financiera a pesar de estar marcada como completada.',
    status: 'confirmed',
    source: 'CONTRAT.AR public works registry, Office of Accountability analysis',
    source_url: 'https://contratar.gob.ar/',
    detail_en: 'Cross-referencing CONTRAT.AR financial execution data with project status flags reveals that this major highway project was marked as completed while only 19.2% of the allocated budget was disbursed. This discrepancy suggests either significant cost savings or incomplete financial reporting.',
    detail_es: 'El cruce de datos de ejecucion financiera de CONTRAT.AR con las marcas de estado del proyecto revela que esta autopista fue marcada como completada mientras solo el 19,2% del presupuesto asignado fue desembolsado. Esta discrepancia sugiere ahorro significativo o reportes financieros incompletos.',
  },
  {
    id: 'fc-rp17-execution',
    claim_en: 'Pavimentacion RP17 Chubut ($12.8B ARS) has only 1.4% financial execution.',
    claim_es: 'La Pavimentacion RP17 Chubut ($12.800M ARS) tiene solo 1,4% de ejecucion financiera.',
    status: 'confirmed',
    source: 'CONTRAT.AR public works registry, Office of Accountability analysis',
    source_url: 'https://contratar.gob.ar/',
    detail_en: 'Analysis of CONTRAT.AR data shows this road paving project in Chubut province received a $12.8B ARS allocation but only 1.4% was financially executed, representing one of the most extreme discrepancies in the dataset.',
    detail_es: 'El analisis de datos de CONTRAT.AR muestra que este proyecto de pavimentacion en la provincia de Chubut recibio una asignacion de $12.800M ARS pero solo el 1,4% fue ejecutado financieramente, representando una de las discrepancias mas extremas del dataset.',
  },
  {
    id: 'fc-de-vido-dual-cases',
    claim_en: 'Julio De Vido is linked to both the Odebrecht and Cuadernos bribery cases.',
    claim_es: 'Julio De Vido esta vinculado tanto al caso Odebrecht como al caso Cuadernos.',
    status: 'confirmed',
    source: 'Argentine federal court records, DOJ Odebrecht plea agreement',
    source_url: 'https://www.justice.gov/criminal-fraud/file/920101/download',
    detail_en: 'De Vido served as Minister of Federal Planning (2003-2015), overseeing all major public works contracts. Court records establish his involvement in both the Odebrecht bribery scheme and the Cuadernos cash delivery network documented by driver Oscar Centeno.',
    detail_es: 'De Vido fue Ministro de Planificacion Federal (2003-2015), supervisando todos los contratos de obras publicas mayores. Los expedientes judiciales establecen su participacion tanto en el esquema de sobornos de Odebrecht como en la red de entregas de efectivo documentada por el chofer Oscar Centeno.',
  },
  {
    id: 'fc-baratta-dual-cases',
    claim_en: 'Roberto Baratta is linked to both the Odebrecht and Cuadernos bribery cases.',
    claim_es: 'Roberto Baratta esta vinculado tanto al caso Odebrecht como al caso Cuadernos.',
    status: 'confirmed',
    source: 'Argentine federal court records',
    source_url: '',
    detail_en: 'Baratta served as Secretary of Energy under De Vido and was a key figure in both cases. In the Cuadernos case, he was filmed receiving bags of cash. In the Odebrecht case, he is alleged to have coordinated bribe payments for energy infrastructure contracts.',
    detail_es: 'Baratta fue Secretario de Energia bajo De Vido y fue una figura clave en ambos casos. En el caso Cuadernos, fue filmado recibiendo bolsas de efectivo. En el caso Odebrecht, se alega que coordino pagos de sobornos para contratos de infraestructura energetica.',
  },
  {
    id: 'fc-cpc-cuadernos',
    claim_en: 'CPC S.A. (CUIT 30598652011) received $1.8T ARS in public works contracts while being linked to the Cuadernos case.',
    claim_es: 'CPC S.A. (CUIT 30598652011) recibio $1,8B ARS en contratos de obras publicas mientras estaba vinculada al caso Cuadernos.',
    status: 'alleged',
    source: 'CONTRAT.AR registry cross-referenced with Cuadernos case filings',
    source_url: 'https://contratar.gob.ar/',
    detail_en: 'Cross-reference analysis links CPC S.A. to $1.8T ARS in public works contracts. The company appears in Cuadernos case documentation. The connection between contract awards and bribery payments remains under judicial investigation.',
    detail_es: 'El analisis de referencias cruzadas vincula a CPC S.A. con $1,8B ARS en contratos de obras publicas. La empresa aparece en la documentacion del caso Cuadernos. La conexion entre adjudicaciones de contratos y pagos de sobornos sigue bajo investigacion judicial.',
  },
  {
    id: 'fc-dual-officers',
    claim_en: '2,155 company officers simultaneously hold government positions.',
    claim_es: '2.155 directivos de empresas ocupan simultaneamente cargos gubernamentales.',
    status: 'confirmed',
    source: 'Office of Accountability cross-reference engine — CUIT/DNI entity resolution',
    source_url: '',
    detail_en: 'Entity resolution across 34,776 cross-matched identities revealed 2,155 individuals who serve as officers in companies receiving public works contracts while simultaneously holding government positions. This represents a systemic conflict-of-interest pattern.',
    detail_es: 'La resolucion de entidades sobre 34.776 identidades cruzadas revelo 2.155 individuos que son directivos de empresas que reciben contratos de obras publicas mientras ocupan simultaneamente cargos gubernamentales. Esto representa un patron sistemico de conflicto de intereses.',
  },
  {
    id: 'fc-shell-companies',
    claim_en: '831 shell companies (0-1 officers) receive government contracts.',
    claim_es: '831 empresas fantasma (0-1 directivos) reciben contratos del gobierno.',
    status: 'confirmed',
    source: 'Office of Accountability cross-reference engine',
    source_url: '',
    detail_en: 'Analysis of corporate registry data cross-referenced with CONTRAT.AR reveals 831 companies with zero or one registered officer that have received public works contracts. Companies with minimal corporate structure are commonly used as pass-through entities.',
    detail_es: 'El analisis de datos del registro corporativo cruzados con CONTRAT.AR revela 831 empresas con cero o un directivo registrado que han recibido contratos de obras publicas. Las empresas con estructura corporativa minima son comunmente usadas como entidades de paso.',
  },
  {
    id: 'fc-sacde-contracts',
    claim_en: 'SACDE (ex-IECSA) received $1.9T in public works while linked to Macri-era political finance.',
    claim_es: 'SACDE (ex-IECSA) recibio $1,9B en obras publicas mientras estaba vinculada a financiamiento politico de la era Macri.',
    status: 'alleged',
    source: 'CONTRAT.AR registry, political finance disclosure filings',
    source_url: 'https://contratar.gob.ar/',
    detail_en: 'SACDE, formerly known as IECSA (linked to the Macri family), received $1.9T ARS in public works contracts. Cross-reference with political finance disclosures shows simultaneous campaign contributions to the governing coalition. The causal relationship between donations and contract awards is alleged but not judicially established.',
    detail_es: 'SACDE, anteriormente conocida como IECSA (vinculada a la familia Macri), recibio $1,9B ARS en contratos de obras publicas. El cruce con declaraciones de financiamiento politico muestra contribuciones simultaneas de campana a la coalicion gobernante. La relacion causal entre donaciones y adjudicaciones es alegada pero no establecida judicialmente.',
  },
  {
    id: 'fc-completed-low-execution',
    claim_en: '128 public works marked "completed" have less than 30% financial execution.',
    claim_es: '128 obras publicas marcadas como "completadas" tienen menos del 30% de ejecucion financiera.',
    status: 'confirmed',
    source: 'CONTRAT.AR public works registry, Office of Accountability analysis',
    source_url: 'https://contratar.gob.ar/',
    detail_en: 'Systematic analysis of all public works in the CONTRAT.AR registry identified 128 projects flagged as completed where financial execution records show less than 30% of the allocated budget was disbursed. This pattern suggests either reporting errors or potential diversion of funds.',
    detail_es: 'El analisis sistematico de todas las obras publicas en el registro CONTRAT.AR identifico 128 proyectos marcados como completados donde los registros de ejecucion financiera muestran que menos del 30% del presupuesto asignado fue desembolsado. Este patron sugiere errores de reporte o potencial desvio de fondos.',
  },
  {
    id: 'fc-odebrecht-bribes',
    claim_en: 'Odebrecht paid $35M USD in bribes for Argentine public works contracts.',
    claim_es: 'Odebrecht pago $35M USD en sobornos por contratos de obras publicas argentinas.',
    status: 'confirmed',
    source: 'US DOJ plea agreement, United States v. Odebrecht S.A., Dec 2016',
    source_url: 'https://www.justice.gov/criminal-fraud/file/920101/download',
    detail_en: 'In its December 2016 guilty plea with the US DOJ, Odebrecht admitted to paying approximately $35 million in bribes to Argentine government officials between 2007 and 2014 to secure public works contracts, including the Sarmiento railway and gas pipeline projects.',
    detail_es: 'En su declaracion de culpabilidad de diciembre de 2016 ante el DOJ de EE.UU., Odebrecht admitio haber pagado aproximadamente $35 millones en sobornos a funcionarios del gobierno argentino entre 2007 y 2014 para obtener contratos de obras publicas, incluyendo el ferrocarril Sarmiento y proyectos de gasoductos.',
  },
  {
    id: 'fc-buenos-aires-concentration',
    claim_en: 'Buenos Aires province concentrates 66 public works (34% of the total analyzed).',
    claim_es: 'La provincia de Buenos Aires concentra 66 obras publicas (34% del total analizado).',
    status: 'confirmed',
    source: 'CONTRAT.AR public works registry, geographic analysis',
    source_url: 'https://contratar.gob.ar/',
    detail_en: 'Geographic distribution analysis of public works in the dataset shows Buenos Aires province with 66 projects, representing 34% of all analyzed works. This concentration far exceeds its population share and suggests political allocation patterns.',
    detail_es: 'El analisis de distribucion geografica de obras publicas en el dataset muestra a la provincia de Buenos Aires con 66 proyectos, representando el 34% de todas las obras analizadas. Esta concentracion excede ampliamente su peso demografico y sugiere patrones de asignacion politica.',
  },
  {
    id: 'fc-cuadernos-cash',
    claim_en: 'The Cuadernos case documents cash deliveries to officials overseeing public works contracts from 2005 to 2015.',
    claim_es: 'El caso Cuadernos documenta entregas de efectivo a funcionarios que supervisaban contratos de obras publicas entre 2005 y 2015.',
    status: 'alleged',
    source: 'Cuadernos case filings, Federal Court of Comodoro Py',
    source_url: '',
    detail_en: 'Driver Oscar Centeno recorded cash deliveries in handwritten notebooks spanning 2005-2015. The notebooks document deliveries to officials at the Ministry of Federal Planning who had oversight of public works contracts. The case reached oral trial in November 2025.',
    detail_es: 'El chofer Oscar Centeno registro entregas de efectivo en cuadernos manuscritos entre 2005 y 2015. Los cuadernos documentan entregas a funcionarios del Ministerio de Planificacion Federal que tenian supervision de contratos de obras publicas. El caso llego a juicio oral en noviembre de 2025.',
  },
  {
    id: 'fc-cuadernos-provenance-anomaly',
    claim_en: 'EVIDENCE ANOMALY: The Cuadernos notebooks have a broken chain of custody, 1,500+ alterations by non-author hands, and one notebook permanently missing. Jorge Bacigalupo was charged with falsifying names in the notebooks.',
    claim_es: 'ANOMALIA DE EVIDENCIA: Los cuadernos tienen una cadena de custodia rota, 1.500+ alteraciones por manos ajenas al autor, y un cuaderno permanentemente perdido. Jorge Bacigalupo fue procesado por falsificar nombres en los cuadernos.',
    status: 'confirmed',
    source: 'Gendarmeria Nacional pericia (Aug 2025, 312 pages); Bacigalupo processing (Nov 2025)',
    source_url: 'https://www.infobae.com/judiciales/2025/08/18/causa-cuadernos-el-peritaje-de-gendarmeria-confirmo-que-los-escribio-el-chofer-oscar-centeno/',
    detail_en: 'Gendarmeria confirmed Centeno wrote the base text but found 1,373 overwritings, 195 white-out corrections, and 55 amendments by 2-4 other hands. Notebook #5 is permanently lost. Originals were unaccounted for 18+ months before resurfacing from an unidentified source 4 days before the 2019 elections. Bacigalupo was specifically found to have crossed out names and written different ones to implicate specific individuals. Centeno refused to testify at trial on March 19, 2026. These anomalies mean specific names and amounts in the notebooks cannot be treated as reliable without independent corroboration.',
    detail_es: 'Gendarmeria confirmo que Centeno escribio el texto base pero encontro 1.373 sobreescrituras, 195 correcciones con liquid corrector y 55 enmiendas por 2-4 manos diferentes. El Cuaderno #5 esta permanentemente perdido. Los originales no tuvieron custodia por mas de 18 meses antes de reaparecer de una fuente no identificada 4 dias antes de las elecciones de 2019. Se encontro que Bacigalupo especificamente tacho nombres y escribio otros para implicar a individuos especificos. Centeno se nego a declarar en el juicio el 19 de marzo de 2026. Estas anomalias significan que los nombres y montos especificos en los cuadernos no pueden tratarse como confiables sin corroboracion independiente.',
  },
  {
    id: 'fc-cuadernos-independent-evidence',
    claim_en: 'Only 2 of 9 top Cuadernos-linked contractors (SACDE/IECSA and CPC) have robust independent evidence outside the notebooks. Four contractors depend entirely on Cuadernos testimony for corruption allegations.',
    claim_es: 'Solo 2 de 9 contratistas principales vinculados a Cuadernos (SACDE/IECSA y CPC) tienen evidencia independiente robusta fuera de los cuadernos. Cuatro contratistas dependen enteramente del testimonio de Cuadernos para las alegaciones de corrupcion.',
    status: 'confirmed',
    source: 'Cross-reference analysis: DOJ Odebrecht plea, AFIP investigations, Gendarmeria pericia',
    source_url: 'https://www.justice.gov/archives/opa/pr/odebrecht-and-braskem-plead-guilty-and-agree-pay-least-35-billion-global-penalties-resolve',
    detail_en: 'SACDE is independently verified via Odebrecht DOJ plea agreement, Andorra money trail (AFIP traced $4.5M USD), and Sarmiento soterramiento financial flows. CPC is independently verified via AFIP $8B peso fraud investigation and Echegaray conviction. Supercemento/Roggio, Vialmani, and CN Sapag have partial corroboration from contract records and independent reporting. Decavial (Aznar retracted testimony), Construmex, Cleanosol, and Concret Nor have no significant independent corroboration — their corruption links depend solely on the Cuadernos notebooks and arrepentido testimony.',
    detail_es: 'SACDE esta verificado independientemente via el acuerdo DOJ de Odebrecht, el rastro de dinero en Andorra (AFIP rastreo $4,5M USD) y flujos financieros del soterramiento Sarmiento. CPC esta verificado independientemente via la investigacion de fraude de AFIP por $8B pesos y la condena de Echegaray. Supercemento/Roggio, Vialmani y CN Sapag tienen corroboracion parcial de registros de contratos y reportes independientes. Decavial (Aznar retracto testimonio), Construmex, Cleanosol y Concret Nor no tienen corroboracion independiente significativa.',
  },
]

// ---------------------------------------------------------------------------
// TIMELINE_EVENTS
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: InvestigationTimelineEvent[] = [
  {
    id: 'te-siemens-bribery-period',
    date: '1996–2007',
    title_en: 'Siemens DNI contract bribery period',
    title_es: 'Periodo de sobornos del contrato DNI de Siemens',
    description_en: 'Siemens paid bribes to Argentine officials to secure the $1.2B USD contract for the national DNI (identity document) system. The scheme involved payments through offshore accounts to government decision-makers.',
    description_es: 'Siemens pago sobornos a funcionarios argentinos para obtener el contrato de $1.200M USD para el sistema de DNI (documento nacional de identidad). El esquema involucro pagos a traves de cuentas offshore a decisores gubernamentales.',
    category: 'financial',
    sources: ['US DOJ, SEC enforcement action against Siemens AG, Dec 2008'],
  },
  {
    id: 'te-cuadernos-period',
    date: '2005–2015',
    title_en: 'Cuadernos notebook period — cash deliveries documented',
    title_es: 'Periodo de los Cuadernos — entregas de efectivo documentadas',
    description_en: 'Driver Oscar Centeno kept handwritten notebooks recording cash deliveries from businessmen to government officials at the Ministry of Federal Planning, which oversaw all major public works contracts during the Kirchner administrations.',
    description_es: 'El chofer Oscar Centeno mantuvo cuadernos manuscritos registrando entregas de efectivo de empresarios a funcionarios del Ministerio de Planificacion Federal, que supervisaba todos los contratos mayores de obras publicas durante las administraciones kirchneristas.',
    category: 'financial',
    sources: ['Cuadernos case filings, Federal Court of Comodoro Py'],
  },
  {
    id: 'te-odebrecht-bribery-period',
    date: '2007–2014',
    title_en: 'Odebrecht bribery period in Argentina',
    title_es: 'Periodo de sobornos de Odebrecht en Argentina',
    description_en: 'Odebrecht paid approximately $35M USD in bribes to Argentine officials to secure public works contracts including the Sarmiento railway expansion and gas pipeline projects. The scheme was part of a broader $788M global bribery operation.',
    description_es: 'Odebrecht pago aproximadamente $35M USD en sobornos a funcionarios argentinos para obtener contratos de obras publicas incluyendo la expansion del ferrocarril Sarmiento y proyectos de gasoductos. El esquema fue parte de una operacion global de sobornos de $788M.',
    category: 'financial',
    sources: ['US DOJ plea agreement, United States v. Odebrecht S.A., Dec 2016'],
  },
  {
    id: 'te-siemens-sec',
    date: '2008-12-15',
    title_en: 'SEC and DOJ announce $1.6B settlement with Siemens',
    title_es: 'SEC y DOJ anuncian acuerdo de $1.600M con Siemens',
    description_en: 'Siemens AG agreed to pay $1.6 billion in fines to US and European authorities for systematic bribery across multiple countries, including Argentina. The Argentine DNI contract was among the cases cited.',
    description_es: 'Siemens AG acordo pagar $1.600 millones en multas a autoridades estadounidenses y europeas por soborno sistematico en multiples paises, incluyendo Argentina. El contrato argentino del DNI estuvo entre los casos citados.',
    category: 'legal',
    sources: ['SEC Litigation Release No. 20829, Dec 15, 2008'],
  },
  {
    id: 'te-odebrecht-plea',
    date: '2016-12-21',
    title_en: 'Odebrecht pleads guilty in US — largest foreign bribery case in history',
    title_es: 'Odebrecht se declara culpable en EE.UU. — mayor caso de soborno extranjero de la historia',
    description_en: 'Odebrecht S.A. pleaded guilty to conspiracy to violate the FCPA. The company admitted to $788M in bribes across 12 countries, with $35M allocated to Argentina for public works contracts.',
    description_es: 'Odebrecht S.A. se declaro culpable de conspiracion para violar la FCPA. La empresa admitio $788M en sobornos en 12 paises, con $35M asignados a Argentina para contratos de obras publicas.',
    category: 'legal',
    sources: ['https://www.justice.gov/criminal-fraud/file/920101/download'],
  },
  {
    id: 'te-contratar-first',
    date: '2017',
    title_en: 'CONTRAT.AR publishes first public procurement procedure',
    title_es: 'CONTRAT.AR publica el primer procedimiento de contratacion publica',
    description_en: 'The Argentine government launches the CONTRAT.AR platform for public procurement transparency, publishing the first digitized procurement procedure. This created the data layer that enables systematic analysis of public works contracts.',
    description_es: 'El gobierno argentino lanza la plataforma CONTRAT.AR para la transparencia en contrataciones publicas, publicando el primer procedimiento digitalizado. Esto creo la capa de datos que permite el analisis sistematico de contratos de obras publicas.',
    category: 'political',
    sources: ['https://contratar.gob.ar/'],
  },
  {
    id: 'te-cuadernos-published',
    date: '2018-08-01',
    title_en: 'Cuadernos notebooks published by La Nacion',
    title_es: 'Los cuadernos publicados por La Nacion',
    description_en: 'La Nacion newspaper publishes contents of Oscar Centeno\'s notebooks, triggering the largest corruption investigation in Argentine history. The notebooks document systematic cash payments from contractors to officials overseeing public works.',
    description_es: 'El diario La Nacion publica el contenido de los cuadernos de Oscar Centeno, desencadenando la mayor investigacion de corrupcion en la historia argentina. Los cuadernos documentan pagos sistematicos en efectivo de contratistas a funcionarios que supervisaban obras publicas.',
    category: 'media',
    sources: ['La Nacion, August 2018'],
  },
  {
    id: 'te-contratar-decree',
    date: '2018-12-27',
    title_en: 'Decree 1169/2018 formally establishes CONTRAT.AR',
    title_es: 'El Decreto 1169/2018 establece formalmente CONTRAT.AR',
    description_en: 'Decree 1169/2018 formally establishes the CONTRAT.AR electronic public procurement system, mandating that all national public works contracts be published on the platform with standardized data formats.',
    description_es: 'El Decreto 1169/2018 establece formalmente el sistema electronico de contrataciones publicas CONTRAT.AR, mandando que todos los contratos nacionales de obras publicas sean publicados en la plataforma con formatos de datos estandarizados.',
    category: 'political',
    sources: ['Decreto 1169/2018, Boletin Oficial de la Republica Argentina'],
  },
  {
    id: 'te-de-vido-sentenced',
    date: '2018-11-28',
    title_en: 'De Vido sentenced to 5 years and 8 months for Once train disaster',
    title_es: 'De Vido condenado a 5 anos y 8 meses por la tragedia de Once',
    description_en: 'Former Minister of Federal Planning Julio De Vido was convicted for his role in the 2012 Once train disaster that killed 52 people, stemming from negligent oversight of railway maintenance contracts.',
    description_es: 'El exministro de Planificacion Federal Julio De Vido fue condenado por su rol en la tragedia ferroviaria de Once de 2012 que mato a 52 personas, derivada de la supervision negligente de contratos de mantenimiento ferroviario.',
    category: 'legal',
    sources: ['Tribunal Oral Federal No. 4, Buenos Aires'],
  },
  {
    id: 'te-cuadernos-trial',
    date: '2023',
    title_en: 'Cuadernos case reaches trial stage',
    title_es: 'El caso Cuadernos llega a juicio oral',
    description_en: 'After five years of pre-trial proceedings, the Cuadernos case involving dozens of businessmen and officials reached the oral trial stage. The case covers systematic bribery tied to public works contract awards.',
    description_es: 'Despues de cinco anos de instruccion, el caso Cuadernos que involucra a docenas de empresarios y funcionarios llego a la etapa de juicio oral. El caso cubre soborno sistematico vinculado a adjudicaciones de contratos de obras publicas.',
    category: 'legal',
    sources: ['Tribunal Oral Federal, Comodoro Py, Buenos Aires'],
  },
  {
    id: 'te-cross-reference-analysis',
    date: '2026-03',
    title_en: 'Office of Accountability cross-references 34,776 identities across public works and political finance',
    title_es: 'Office of Accountability cruza 34.776 identidades entre obras publicas y finanzas politicas',
    description_en: 'Entity resolution engine matches CUIT and DNI identifiers across public works contracts, political finance disclosures, and corporate registries, revealing 2,155 dual-role officers and 831 shell companies receiving government contracts.',
    description_es: 'El motor de resolucion de entidades cruza identificadores CUIT y DNI entre contratos de obras publicas, declaraciones de finanzas politicas y registros corporativos, revelando 2.155 directivos con doble rol y 831 empresas fantasma recibiendo contratos gubernamentales.',
    category: 'financial',
    sources: ['Office of Accountability cross-reference engine'],
  },
]

// ---------------------------------------------------------------------------
// ACTORS
// ---------------------------------------------------------------------------

export const ACTORS: Actor[] = [
  {
    id: 'act-de-vido',
    name: 'Julio De Vido',
    role_en: 'Minister of Federal Planning (2003-2015)',
    role_es: 'Ministro de Planificacion Federal (2003-2015)',
    description_en: 'Oversaw all major public works contracts during the Kirchner administrations. Linked to both Odebrecht and Cuadernos bribery cases. Convicted in the Once train disaster case.',
    description_es: 'Superviso todos los contratos mayores de obras publicas durante las administraciones kirchneristas. Vinculado a los casos Odebrecht y Cuadernos. Condenado en el caso de la tragedia de Once.',
    nationality: 'Argentine',
    status_en: 'Convicted (Once case), under trial (Cuadernos)',
    status_es: 'Condenado (caso Once), en juicio oral (Cuadernos)',
  },
  {
    id: 'act-baratta',
    name: 'Roberto Baratta',
    role_en: 'Secretary of Energy, Deputy Minister under De Vido',
    role_es: 'Secretario de Energia, viceministro bajo De Vido',
    description_en: 'Key figure in both Odebrecht and Cuadernos cases. Filmed receiving bags of cash in the Cuadernos investigation. Coordinated energy infrastructure contracts.',
    description_es: 'Figura clave en los casos Odebrecht y Cuadernos. Filmado recibiendo bolsas de efectivo en la investigacion de Cuadernos. Coordino contratos de infraestructura energetica.',
    nationality: 'Argentine',
    status_en: 'Under trial (Cuadernos)',
    status_es: 'En juicio oral (Cuadernos)',
  },
  {
    id: 'act-centeno',
    name: 'Oscar Centeno',
    role_en: 'Driver and whistleblower',
    role_es: 'Chofer y denunciante',
    description_en: 'Government driver who kept handwritten notebooks documenting cash deliveries from businessmen to government officials at the Ministry of Federal Planning between 2005 and 2015.',
    description_es: 'Chofer gubernamental que mantuvo cuadernos manuscritos documentando entregas de efectivo de empresarios a funcionarios del Ministerio de Planificacion Federal entre 2005 y 2015.',
    nationality: 'Argentine',
    status_en: 'Protected witness',
    status_es: 'Testigo protegido',
  },
  {
    id: 'act-odebrecht',
    name: 'Odebrecht S.A.',
    role_en: 'Brazilian construction conglomerate',
    role_es: 'Conglomerado constructor brasileno',
    description_en: 'Admitted to paying $35M USD in bribes to Argentine officials for public works contracts (2007-2014) as part of a global $788M bribery scheme spanning 12 countries.',
    description_es: 'Admitio haber pagado $35M USD en sobornos a funcionarios argentinos por contratos de obras publicas (2007-2014) como parte de un esquema global de sobornos de $788M en 12 paises.',
    nationality: 'Brazilian',
    status_en: 'Pleaded guilty (US DOJ, Dec 2016)',
    status_es: 'Declarado culpable (DOJ EE.UU., dic 2016)',
  },
  {
    id: 'act-cpc',
    name: 'CPC S.A.',
    role_en: 'Major public works contractor (CUIT 30598652011)',
    role_es: 'Contratista mayor de obras publicas (CUIT 30598652011)',
    description_en: 'Received $1.8T ARS in public works contracts. Linked to Cuadernos case documentation. One of the top recipients of national public works spending.',
    description_es: 'Recibio $1,8B ARS en contratos de obras publicas. Vinculada a la documentacion del caso Cuadernos. Una de las principales receptoras de gasto en obras publicas nacionales.',
    nationality: 'Argentine',
    status_en: 'Under investigation',
    status_es: 'Bajo investigacion',
  },
  {
    id: 'act-sacde',
    name: 'SACDE (ex-IECSA)',
    role_en: 'Major construction company, formerly IECSA',
    role_es: 'Empresa constructora mayor, anteriormente IECSA',
    description_en: 'Received $1.9T ARS in public works contracts. Formerly IECSA, linked to the Macri family. Cross-referenced with political finance disclosures showing simultaneous campaign contributions.',
    description_es: 'Recibio $1,9B ARS en contratos de obras publicas. Anteriormente IECSA, vinculada a la familia Macri. Cruzada con declaraciones de finanzas politicas mostrando contribuciones simultaneas de campana.',
    nationality: 'Argentine',
    status_en: 'Alleged political-financial linkage',
    status_es: 'Vinculacion politico-financiera alegada',
  },
  {
    id: 'act-siemens',
    name: 'Siemens AG',
    role_en: 'German industrial conglomerate',
    role_es: 'Conglomerado industrial aleman',
    description_en: 'Paid bribes to Argentine officials to secure the $1.2B USD DNI national identity document contract (1996-2007). Part of a broader systematic bribery pattern that resulted in a $1.6B global settlement.',
    description_es: 'Pago sobornos a funcionarios argentinos para obtener el contrato de DNI por $1.200M USD (1996-2007). Parte de un patron de soborno sistematico mas amplio que resulto en un acuerdo global de $1.600M.',
    nationality: 'German',
    status_en: 'Settled with SEC/DOJ ($1.6B, Dec 2008)',
    status_es: 'Acordo con SEC/DOJ ($1.600M, dic 2008)',
  },
  {
    id: 'act-lazaro-baez',
    name: 'Lazaro Baez',
    role_en: 'Contractor, Austral Construcciones',
    role_es: 'Contratista, Austral Construcciones',
    description_en: 'Former bank teller who became one of Argentina\'s largest public works contractors through Austral Construcciones, receiving billions in road construction contracts in Santa Cruz province. Convicted of money laundering in 2022.',
    description_es: 'Excajero bancario que se convirtio en uno de los mayores contratistas de obras publicas de Argentina a traves de Austral Construcciones, recibiendo miles de millones en contratos de construccion vial en Santa Cruz. Condenado por lavado de dinero en 2022.',
    nationality: 'Argentine',
    status_en: 'Convicted (money laundering, 2022)',
    status_es: 'Condenado (lavado de dinero, 2022)',
  },
  {
    id: 'act-electroingenieria',
    name: 'Electroingenieria S.A.',
    role_en: 'Energy infrastructure contractor',
    role_es: 'Contratista de infraestructura energetica',
    description_en: 'Major contractor for energy infrastructure projects. Named in Cuadernos case as one of the companies involved in cash payments to government officials overseeing contract awards.',
    description_es: 'Contratista mayor de proyectos de infraestructura energetica. Nombrada en el caso Cuadernos como una de las empresas involucradas en pagos en efectivo a funcionarios que supervisaban adjudicaciones de contratos.',
    nationality: 'Argentine',
    status_en: 'Under trial (Cuadernos)',
    status_es: 'En juicio oral (Cuadernos)',
  },
  {
    id: 'act-jose-lopez',
    name: 'Jose Lopez',
    role_en: 'Secretary of Public Works (2003-2015)',
    role_es: 'Secretario de Obras Publicas (2003-2015)',
    description_en: 'Arrested in 2016 while attempting to hide bags containing $9M USD in cash and firearms at a monastery. Became a cooperating witness in the Cuadernos case, providing testimony about systematic corruption in public works.',
    description_es: 'Arrestado en 2016 mientras intentaba ocultar bolsas con $9M USD en efectivo y armas en un monasterio. Se convirtio en testigo colaborador en el caso Cuadernos, brindando testimonio sobre corrupcion sistematica en obras publicas.',
    nationality: 'Argentine',
    status_en: 'Convicted, cooperating witness',
    status_es: 'Condenado, testigo colaborador',
  },
  {
    id: 'act-cristina-fernandez',
    name: 'Cristina Fernandez de Kirchner',
    role_en: 'President of Argentina (2007-2015), Vice President (2019-2023)',
    role_es: 'Presidenta de Argentina (2007-2015), Vicepresidenta (2019-2023)',
    description_en: 'Head of state during the period when the majority of investigated public works contracts were awarded. Named in Cuadernos case and multiple public works corruption cases.',
    description_es: 'Jefa de estado durante el periodo en que se adjudicaron la mayoria de los contratos de obras publicas investigados. Nombrada en el caso Cuadernos y multiples causas de corrupcion en obras publicas.',
    nationality: 'Argentine',
    status_en: 'Convicted (Vialidad case, 2022), under appeal',
    status_es: 'Condenada (causa Vialidad, 2022), en apelacion',
  },
  {
    id: 'act-nestor-kirchner',
    name: 'Nestor Kirchner',
    role_en: 'President of Argentina (2003-2007)',
    role_es: 'Presidente de Argentina (2003-2007)',
    description_en: 'President during the early period of the Cuadernos notebooks and the beginning of the Odebrecht bribery period. Appointed De Vido as Minister of Federal Planning.',
    description_es: 'Presidente durante el periodo temprano de los Cuadernos y el comienzo del periodo de sobornos de Odebrecht. Designo a De Vido como Ministro de Planificacion Federal.',
    nationality: 'Argentine',
    status_en: 'Deceased (2010)',
    status_es: 'Fallecido (2010)',
  },
]

// ---------------------------------------------------------------------------
// MONEY_FLOWS
// ---------------------------------------------------------------------------

export const MONEY_FLOWS: MoneyFlow[] = [
  {
    id: 'mf-odebrecht-bribes',
    from_label: 'Odebrecht S.A.',
    to_label: 'Argentine government officials',
    amount_usd: 35_000_000,
    date: '2007–2014',
    source: 'US DOJ plea agreement, United States v. Odebrecht S.A., Dec 2016',
  },
  {
    id: 'mf-siemens-bribes',
    from_label: 'Siemens AG',
    to_label: 'Argentine government officials (DNI contract)',
    amount_usd: 100_000_000,
    date: '1996–2007',
    source: 'SEC Litigation Release No. 20829, Dec 2008',
  },
  {
    id: 'mf-cpc-contracts',
    from_label: 'Argentine state (public works budget)',
    to_label: 'CPC S.A.',
    amount_usd: 0,
    date: '2003–2015',
    source: 'CONTRAT.AR registry ($1.8T ARS in contracts)',
  },
  {
    id: 'mf-sacde-contracts',
    from_label: 'Argentine state (public works budget)',
    to_label: 'SACDE (ex-IECSA)',
    amount_usd: 0,
    date: '2003–2023',
    source: 'CONTRAT.AR registry ($1.9T ARS in contracts)',
  },
  {
    id: 'mf-lopez-monastery',
    from_label: 'Unknown origin (public works kickbacks)',
    to_label: 'Jose Lopez (cash hidden at monastery)',
    amount_usd: 9_000_000,
    date: '2016-06-14',
    source: 'Federal court records, arrest of Jose Lopez',
  },
  {
    id: 'mf-siemens-settlement',
    from_label: 'Siemens AG',
    to_label: 'US SEC / DOJ (global settlement)',
    amount_usd: 1_600_000_000,
    date: '2008-12-15',
    source: 'SEC Litigation Release No. 20829',
  },
  {
    id: 'mf-austral-santa-cruz',
    from_label: 'Argentine state (Vialidad Nacional)',
    to_label: 'Austral Construcciones (Lazaro Baez)',
    amount_usd: 0,
    date: '2003–2015',
    source: 'Causa Vialidad, Tribunal Oral Federal No. 2',
  },
]

// ---------------------------------------------------------------------------
// EVIDENCE_DOCS
// ---------------------------------------------------------------------------

export const EVIDENCE_DOCS: EvidenceDoc[] = [
  {
    id: 'ed-odebrecht-plea',
    title: 'United States v. Odebrecht S.A. — Plea Agreement',
    type_en: 'DOJ plea agreement',
    type_es: 'Acuerdo de culpabilidad del DOJ',
    date: '2016-12-21',
    summary_en: 'Odebrecht pleaded guilty to FCPA violations, admitting to $788M in global bribes including $35M to Argentine officials for public works contracts.',
    summary_es: 'Odebrecht se declaro culpable de violar la FCPA, admitiendo $788M en sobornos globales incluyendo $35M a funcionarios argentinos por contratos de obras publicas.',
    source_url: 'https://www.justice.gov/criminal-fraud/file/920101/download',
    verification_status: 'verified',
  },
  {
    id: 'ed-siemens-sec',
    title: 'SEC v. Siemens AG — Enforcement Action',
    type_en: 'SEC enforcement action',
    type_es: 'Accion de cumplimiento de la SEC',
    date: '2008-12-15',
    summary_en: 'SEC and DOJ enforcement action against Siemens for systematic bribery including the Argentine DNI contract. Resulted in $1.6B in combined penalties.',
    summary_es: 'Accion de cumplimiento de la SEC y DOJ contra Siemens por soborno sistematico incluyendo el contrato argentino del DNI. Resulto en $1.600M en penalidades combinadas.',
    source_url: 'https://www.sec.gov/litigation/litreleases/2008/lr20829.htm',
    verification_status: 'verified',
  },
  {
    id: 'ed-cuadernos-notebooks',
    title: 'Cuadernos de Oscar Centeno',
    type_en: 'Handwritten evidence notebooks',
    type_es: 'Cuadernos de evidencia manuscritos',
    date: '2018-08-01',
    summary_en: 'Handwritten notebooks kept by government driver Oscar Centeno documenting cash deliveries from public works contractors to government officials at the Ministry of Federal Planning (2005-2015).',
    summary_es: 'Cuadernos manuscritos del chofer gubernamental Oscar Centeno documentando entregas de efectivo de contratistas de obras publicas a funcionarios del Ministerio de Planificacion Federal (2005-2015).',
    source_url: '',
    verification_status: 'verified',
  },
  {
    id: 'ed-contratar-dataset',
    title: 'CONTRAT.AR Public Works Dataset',
    type_en: 'Government open data platform',
    type_es: 'Plataforma de datos abiertos del gobierno',
    date: '2017–2026',
    summary_en: 'Digitized registry of all national public procurement procedures. The Office of Accountability analyzed 7,481 public works entries, cross-referencing financial execution data with project status flags.',
    summary_es: 'Registro digitalizado de todos los procedimientos de contratacion publica nacional. Office of Accountability analizo 7.481 entradas de obras publicas, cruzando datos de ejecucion financiera con marcas de estado de proyecto.',
    source_url: 'https://contratar.gob.ar/',
    verification_status: 'verified',
  },
  {
    id: 'ed-datos-gob',
    title: 'datos.gob.ar — Argentine Open Data Portal',
    type_en: 'Government open data portal',
    type_es: 'Portal de datos abiertos del gobierno',
    date: '2016–2026',
    summary_en: 'The Argentine government\'s open data portal providing bulk access to public works, political finance, and corporate registry datasets used in the cross-reference analysis.',
    summary_es: 'El portal de datos abiertos del gobierno argentino que provee acceso masivo a datasets de obras publicas, finanzas politicas y registros corporativos utilizados en el analisis de referencias cruzadas.',
    source_url: 'https://datos.gob.ar/',
    verification_status: 'verified',
  },
  {
    id: 'ed-lopez-arrest',
    title: 'Arrest of Jose Lopez at Monastery',
    type_en: 'Federal court arrest records',
    type_es: 'Registros de arresto del tribunal federal',
    date: '2016-06-14',
    summary_en: 'Former Secretary of Public Works Jose Lopez was arrested while attempting to hide bags containing $9M USD in cash and firearms at a convent in General Rodriguez, Buenos Aires province.',
    summary_es: 'El exsecretario de Obras Publicas Jose Lopez fue arrestado mientras intentaba ocultar bolsas con $9M USD en efectivo y armas de fuego en un convento de General Rodriguez, provincia de Buenos Aires.',
    source_url: '',
    verification_status: 'verified',
  },
]

// ---------------------------------------------------------------------------
// GOVERNMENT_RESPONSES
// ---------------------------------------------------------------------------

export const GOVERNMENT_RESPONSES: GovernmentResponse[] = [
  {
    id: 'gr-contratar-launch',
    date: '2017',
    action_en: 'Argentine government launches CONTRAT.AR public procurement platform',
    action_es: 'El gobierno argentino lanza la plataforma de contrataciones publicas CONTRAT.AR',
    effect_en: 'Created a centralized digital registry for all national public procurement, enabling systematic analysis and transparency oversight of public works contracts.',
    effect_es: 'Creo un registro digital centralizado para todas las contrataciones publicas nacionales, habilitando analisis sistematico y supervision de transparencia de contratos de obras publicas.',
    source_url: 'https://contratar.gob.ar/',
  },
  {
    id: 'gr-decreto-1169',
    date: '2018-12-27',
    action_en: 'Decree 1169/2018 formally establishes CONTRAT.AR',
    action_es: 'El Decreto 1169/2018 establece formalmente CONTRAT.AR',
    effect_en: 'Mandated that all national public procurement procedures be conducted and published through the CONTRAT.AR platform, establishing standardized data formats for contracts.',
    effect_es: 'Mando que todos los procedimientos de contratacion publica nacional se realicen y publiquen a traves de la plataforma CONTRAT.AR, estableciendo formatos de datos estandarizados para contratos.',
    source_url: '',
  },
  {
    id: 'gr-cuadernos-investigation',
    date: '2018-08',
    action_en: 'Federal court opens Cuadernos investigation after notebook publication',
    action_es: 'El tribunal federal abre la investigacion de los Cuadernos tras la publicacion de los cuadernos',
    effect_en: 'Largest corruption investigation in Argentine history. Dozens of businessmen and officials charged. Multiple cooperating witnesses including Jose Lopez.',
    effect_es: 'La mayor investigacion de corrupcion en la historia argentina. Docenas de empresarios y funcionarios imputados. Multiples testigos colaboradores incluyendo Jose Lopez.',
    source_url: '',
  },
  {
    id: 'gr-de-vido-conviction',
    date: '2018-11-28',
    action_en: 'De Vido convicted for negligence in Once train disaster',
    action_es: 'De Vido condenado por negligencia en la tragedia de Once',
    effect_en: 'First major conviction of a Kirchner-era minister. Established precedent that ministerial oversight failures in public works could carry criminal liability.',
    effect_es: 'Primera condena mayor de un ministro de la era kirchnerista. Establecio precedente de que las fallas de supervision ministerial en obras publicas pueden acarrear responsabilidad penal.',
    source_url: '',
  },
  {
    id: 'gr-vialidad-conviction',
    date: '2022-12-06',
    action_en: 'Cristina Fernandez de Kirchner convicted in Vialidad public works case',
    action_es: 'Cristina Fernandez de Kirchner condenada en la causa Vialidad de obras publicas',
    effect_en: 'Convicted of fraudulent administration in the allocation of public works road contracts to Lazaro Baez\'s Austral Construcciones in Santa Cruz province. Sentenced to 6 years and disqualification from public office. Under appeal.',
    effect_es: 'Condenada por administracion fraudulenta en la adjudicacion de contratos de obras viales a Austral Construcciones de Lazaro Baez en la provincia de Santa Cruz. Sentenciada a 6 anos e inhabilitacion perpetua. En apelacion.',
    source_url: '',
  },
]
