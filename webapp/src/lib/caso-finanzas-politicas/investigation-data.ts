/**
 * Argentine Political Finance investigation structured data.
 *
 * Bilingual (ES primary, EN secondary) factcheck items, timeline events,
 * actors, and money flows — sourced from the cross-referencing of eight
 * public datasets: Como Voto, ICIJ, CNE, Boletin Oficial, IGJ, CNV,
 * DDJJ, and cross-enrichment pipeline.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FactcheckStatus =
  | 'confirmed'
  | 'alleged'
  | 'confirmed_cleared'
  | 'unconfirmed'

export type InvestigationCategory =
  | 'political'
  | 'financial'
  | 'legal'
  | 'corporate'

export interface FactcheckItem {
  id: string
  claim_es: string
  claim_en: string
  status: FactcheckStatus
  tier: number
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
  party: string
  datasets: number
  status_es?: string
  status_en?: string
}

export interface MoneyFlow {
  id: string
  from_label: string
  to_label: string
  amount_ars: number
  description_es: string
  description_en: string
  date: string
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
    value: '10,130',
    label_es: 'Coincidencias cross-dataset',
    label_en: 'Cross-dataset matches',
    source: 'Entity resolution pipeline',
  },
  {
    value: '617',
    label_es: 'Politicos en 2+ datasets',
    label_en: 'Politicians in 2+ datasets',
    source: 'Cross-enrichment',
  },
  {
    value: '3.26M',
    label_es: 'Nodos en el grafo',
    label_en: 'Graph nodes',
    source: 'Neo4j database',
  },
  {
    value: '8',
    label_es: 'Fuentes de datos cruzadas',
    label_en: 'Cross-referenced sources',
    source: 'ETL pipelines',
  },
] as const

// ---------------------------------------------------------------------------
// Factcheck Items
// ---------------------------------------------------------------------------

export const FACTCHECK_ITEMS: readonly FactcheckItem[] = [
  // --- Tier 1: Offshore + Public Office ---
  {
    id: 'ibanez-pelmond',
    claim_es:
      'Maria Cecilia Ibanez (La Libertad Avanza, Cordoba) figura como officer de PELMOND COMPANY LTD (BVI), entidad activa durante su mandato como diputada nacional.',
    claim_en:
      'Maria Cecilia Ibanez (La Libertad Avanza, Cordoba) is listed as officer of PELMOND COMPANY LTD (BVI), an entity active during her term as national deputy.',
    status: 'alleged',
    tier: 1,
    source: 'ICIJ Panama Papers',
    source_url: 'https://offshoreleaks.icij.org/nodes/10158328',
    detail_es:
      'Coincidencia exacta de nombre confirmada en la base de datos ICIJ. La entidad fue incorporada el 31-Oct-2014 y permanece activa. Bajo la Ley 25.188 Art. 6, los funcionarios deben declarar todos los activos incluyendo intereses offshore. Si no fue declarada, constituye omision criminal (Art. 268(2) Codigo Penal). Pendiente: cruzar con declaraciones juradas (DDJJ).',
    detail_en:
      'Exact name match confirmed in ICIJ database. Entity incorporated 31-Oct-2014 and remains active. Under Ley 25.188 Art. 6, officials must declare all assets including offshore interests. If undeclared, constitutes criminal omission (Art. 268(2) Codigo Penal). Pending: cross-reference against sworn asset declarations (DDJJ).',
  },
  {
    id: 'camano-tt41',
    claim_es:
      'Graciela Camano (Consenso Federal, Buenos Aires) esta vinculada a TT 41 CORP (BVI), entidad creada a traves de Trident Trust durante su mandato 2014-2018.',
    claim_en:
      'Graciela Camano (Consenso Federal, Buenos Aires) is linked to TT 41 CORP (BVI), an entity created through Trident Trust during her 2014-2018 term.',
    status: 'alleged',
    tier: 1,
    source: 'ICIJ Pandora Papers',
    source_url: 'https://offshoreleaks.icij.org',
    detail_es:
      'Coincidencia exacta de nombre, consistente con patron Trident Trust/Argentina. Su patrimonio declarado crecio de ARS 2,8M (2013) a ARS 39,2M (2023). Tasa de presencia del 62,9%, con ausencias sistematicas en votaciones de legislacion financiera: 35 ausencias en Presupuesto, 19 en Impuesto a las Ganancias. 6 cambios de partido en 30 anos.',
    detail_en:
      'Exact name match, consistent with Trident Trust/Argentina pattern. Declared wealth grew from ARS 2.8M (2013) to ARS 39.2M (2023). 62.9% presence rate, with systematic absences on financial legislation votes: 35 absences on Budget, 19 on Income Tax. 6 party switches over 30 years.',
  },
  // --- Tier 1: Macri offshore (judicially cleared) ---
  {
    id: 'macri-fleg-trading',
    claim_es:
      'Mauricio Macri fue director de Fleg Trading Ltd (Bahamas), una entidad que aparecio en los Panama Papers. La justicia lo sobreseyo — el juez Fraga determino que no era "socio ni accionista".',
    claim_en:
      'Mauricio Macri was a director of Fleg Trading Ltd (Bahamas), an entity that appeared in the Panama Papers. He was judicially cleared — Judge Fraga determined he was "not a partner nor shareholder".',
    status: 'confirmed_cleared',
    tier: 1,
    source: 'Buenos Aires Times / El Cronista',
    source_url:
      'https://www.batimes.com.ar/news/argentina/panama-papers-macri-cleared-of-wrongdoing.phtml',
    detail_es:
      'Macri admitio haber aceptado brevemente un cargo de director en Fleg Trading y Kagemusha SA (Panama). El juez Fraga lo sobreseyo pero las entidades estan confirmadas. Macri aparece en 5 datasets: donante, director de empresa, officer societario, DDJJ y nombramiento de gobierno.',
    detail_en:
      'Macri admitted to briefly accepting a director position in Fleg Trading and Kagemusha SA (Panama). Judge Fraga cleared him but the entities are confirmed. Macri appears across 5 datasets: donor, board member, company officer, DDJJ, and government appointment.',
  },
  // --- Tier 2: Correo Argentino ---
  {
    id: 'macri-correo-argentino',
    claim_es:
      'El gobierno de Macri acepto un acuerdo con Correo Argentino (empresa de SOCMA) que implicaba una quita del 98,82% de la deuda con el Estado. La fiscal Boquin lo califico de "equivalente a una condonacion" y "abusivo".',
    claim_en:
      'The Macri government accepted a settlement with Correo Argentino (SOCMA company) that implied a 98.82% debt forgiveness. Prosecutor Boquin ruled it "equivalent to a forgiveness" and "abusive".',
    status: 'confirmed',
    tier: 2,
    source: 'Chequeado',
    source_url:
      'https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/',
    detail_es:
      'SOCMA obtuvo la concesion postal en 1997 (gobierno de Menem). Solo pago el canon el primer ano; la deuda alcanzo ARS 296M. En junio de 2016, el gobierno de Macri acepto un acuerdo con quita del 98,82% (ARS 70.000M ajustados). El fiscal Zoni imputo al presidente Macri y al ministro Aguad en 2017. Para 2024, la familia no habia pagado nada.',
    detail_en:
      'SOCMA won the postal concession in 1997 (Menem government). Only paid the canon the first year; debt reached ARS 296M. In June 2016, the Macri government accepted a settlement with 98.82% reduction (ARS 70B adjusted). Prosecutor Zoni charged President Macri and Minister Aguad in 2017. By 2024, the family had paid nothing.',
  },
  // --- Tier 2: AUSOL shares ---
  {
    id: 'macri-ausol',
    claim_es:
      'Macri vendio acciones de Autopistas del Sol (AUSOL) con una prima del 400% despues de que su gobierno autorizara aumentos de peaje y renegociara la concesion por ~USD 2.000M.',
    claim_en:
      'Macri sold Autopistas del Sol (AUSOL) shares at a 400% premium after his government authorized toll increases and renegotiated the concession for ~USD 2B.',
    status: 'confirmed',
    tier: 2,
    source: 'Pagina/12',
    source_url:
      'https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol',
    detail_es:
      'La Oficina Anticorrupcion recomendo que Macri no participara; se recuso formalmente. Sin embargo, la renegociacion de 2018 comprometio al Estado con ~USD 2.000M de impacto economico total. Fiscales imputaron a ex funcionarios por "administracion fraudulenta". Las acciones fueron vendidas a Natal Inversiones con prima del 400%.',
    detail_en:
      'The Anti-Corruption Office recommended Macri not participate; he formally recused. However, the 2018 renegotiation committed the State to ~USD 2B total economic impact. Prosecutors charged ex-officials with "fraudulent administration." Shares were sold to Natal Inversiones at a 400% premium.',
  },
  // --- Tier 2: Contractor-donor violations ---
  {
    id: 'rodriguez-gonzalez-contractor-donor',
    claim_es:
      'Juan Pablo Rodriguez (4 contratos estatales 2018-2020) y Jorge Omar Gonzalez (1 contrato estatal) realizaron donaciones de campana, violando la Ley 26.215 Art. 15 que prohibe contribuciones de contratistas del Estado.',
    claim_en:
      'Juan Pablo Rodriguez (4 government contracts 2018-2020) and Jorge Omar Gonzalez (1 government contract) made campaign donations, violating Ley 26.215 Art. 15 which prohibits contributions from government contractors.',
    status: 'confirmed',
    tier: 2,
    source: 'Cross-dataset analysis (Boletin Oficial + CNE)',
    source_url: 'https://datos.gob.ar',
    detail_es:
      'Estas no son zonas grises. La Ley 26.215 Art. 15 prohibe explicitamente las contribuciones de campana de personas o entidades con contratos estatales. El Art. 15 bis establece multas de 10 a 20 veces el monto de la contribucion ilegal y potencial procesamiento penal.',
    detail_en:
      'These are not gray areas. Ley 26.215 Art. 15 explicitly prohibits campaign contributions from persons or entities holding government contracts. Art. 15 bis establishes fines of 10 to 20 times the illegal contribution amount and potential criminal prosecution.',
  },
  // --- Tier 2: Cordero pipeline ---
  {
    id: 'cordero-offshore-pipeline',
    claim_es:
      'Maria Eugenia Cordero es simultaneamente contratista del Estado y officer de BETHAN INVESTMENTS LIMITED (offshore), configurando un potencial conducto de fondos publicos hacia jurisdicciones opacas.',
    claim_en:
      'Maria Eugenia Cordero is simultaneously a government contractor and officer of BETHAN INVESTMENTS LIMITED (offshore), creating a potential pipeline from public funds to opaque jurisdictions.',
    status: 'alleged',
    tier: 2,
    source: 'Cross-dataset analysis (Boletin Oficial + ICIJ)',
    source_url: 'https://offshoreleaks.icij.org',
    detail_es:
      'Este patron — contratista estatal con holdings offshore — es la estructura fundacional de esquemas de malversacion y constituye una potencial violacion de la Ley 25.246 (lavado de activos). Confirmado: la coincidencia de nombre en ambos datasets. No confirmado: si es la misma persona, y si fondos publicos pasaron por la entidad offshore.',
    detail_en:
      'This pattern — state contractor with offshore holdings — is the foundational structure of embezzlement schemes and constitutes a potential violation of Ley 25.246 (anti-money laundering). Confirmed: the name match across both datasets. Unconfirmed: whether the same individual, and whether public funds moved through the offshore entity.',
  },
  // --- Tier 2: SOCMA blanqueo ---
  {
    id: 'socma-blanqueo',
    claim_es:
      'Insiders de SOCMA declararon ARS 900M+ de activos previamente ocultos a traves del blanqueo de 2016 aprobado por el gobierno de Macri. Gianfranco Macri declaro USD 4M de BF Corporation (offshore panameña).',
    claim_en:
      'SOCMA insiders declared ARS 900M+ in previously hidden assets through the 2016 blanqueo (tax amnesty) passed by the Macri government. Gianfranco Macri declared USD 4M from BF Corporation (Panamanian offshore).',
    status: 'confirmed',
    tier: 2,
    source: 'Perfil',
    source_url:
      'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml',
    detail_es:
      'Gianfranco Macri: ARS 622M (~USD 4M de BF Corp). Leonardo Maffioli (CEO SOCMA): ARS 76M. Armando Amasanti: ARS 93M. Victor Composto: ARS 68M. Carlos Libedinsky (socio de Jorge Macri): ARS 61,9M. Gianfranco tambien declaro un fideicomiso de Alicia Blanco Villegas (madre de Mauricio), potencialmente violando la prohibicion del blanqueo de declarar activos de familiares.',
    detail_en:
      'Gianfranco Macri: ARS 622M (~USD 4M from BF Corp). Leonardo Maffioli (SOCMA CEO): ARS 76M. Armando Amasanti: ARS 93M. Victor Composto: ARS 68M. Carlos Libedinsky (Jorge Macri partner): ARS 61.9M. Gianfranco also declared a trust belonging to Alicia Blanco Villegas (Mauricio\'s mother), potentially violating the blanqueo prohibition on declaring relatives\' assets.',
  },
  // --- Tier 2: BF Corporation Swiss transfers ---
  {
    id: 'bf-corporation-swiss',
    claim_es:
      'BF Corporation SA (Panama), propiedad 50/50 de Gianfranco y Mariano Macri, movio fondos al Safra Bank de Suiza. Un banco aleman ordeno la destruccion de toda la correspondencia.',
    claim_en:
      'BF Corporation SA (Panama), owned 50/50 by Gianfranco and Mariano Macri, moved funds to Safra Bank in Switzerland. A German bank ordered the destruction of all correspondence.',
    status: 'confirmed',
    tier: 2,
    source: 'Perfil',
    source_url:
      'https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml',
    detail_es:
      'BF Corporation canalizo fondos de la familia Macri a traves de Suiza. La destruccion de correspondencia por parte del banco aleman sugiere un esfuerzo deliberado de ocultar el rastro financiero. Gianfranco posteriormente declaro USD 4M de esta entidad a traves del blanqueo de 2016.',
    detail_en:
      'BF Corporation channeled Macri family funds through Switzerland. The destruction of correspondence by the German bank suggests a deliberate effort to obscure the financial trail. Gianfranco later declared USD 4M from this entity through the 2016 tax amnesty.',
  },
] as const

// ---------------------------------------------------------------------------
// Timeline Events
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  {
    id: 'tl-1976-socma',
    date: '1976',
    title_es: 'Fundacion de SOCMA',
    title_en: 'SOCMA founded',
    description_es:
      'Franco Macri funda Sociedad Macri S.A. (SOCMA). El grupo crecera de 7 a 47 empresas durante la dictadura militar. En 1998, Forbes estimaria su fortuna personal en USD 730M.',
    description_en:
      'Franco Macri founds Sociedad Macri S.A. (SOCMA). The group would grow from 7 to 47 companies during the military dictatorship. By 1998, Forbes would estimate his personal fortune at USD 730M.',
    category: 'corporate',
    sources: ['https://es.wikipedia.org/wiki/Grupo_Macri'],
  },
  {
    id: 'tl-1997-correo',
    date: '1997',
    title_es: 'Privatizacion de Correo Argentino',
    title_en: 'Correo Argentino privatized',
    description_es:
      'El gobierno de Menem privatiza el servicio postal, otorgando la concesion a SOCMA. La empresa solo pagara el canon el primer ano; la deuda llegara a ARS 296M.',
    description_en:
      'The Menem government privatizes the postal service, awarding the concession to SOCMA. The company would only pay the canon the first year; the debt would reach ARS 296M.',
    category: 'financial',
    sources: [
      'https://es.wikipedia.org/wiki/Causa_Correo_Argentino',
      'https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/',
    ],
  },
  {
    id: 'tl-2014-pelmond',
    date: '2014-10-31',
    title_es: 'PELMOND COMPANY LTD incorporada',
    title_en: 'PELMOND COMPANY LTD incorporated',
    description_es:
      'Se incorpora PELMOND COMPANY LTD en las Islas Virgenes Britanicas, con Maria Cecilia Ibanez listada como officer. La entidad permanece activa durante su mandato como diputada nacional (2024-2026).',
    description_en:
      'PELMOND COMPANY LTD incorporated in the British Virgin Islands, with Maria Cecilia Ibanez listed as officer. The entity remains active during her term as national deputy (2024-2026).',
    category: 'financial',
    sources: ['https://offshoreleaks.icij.org/nodes/10158328'],
  },
  {
    id: 'tl-2015-bf-corp',
    date: '2015',
    title_es: 'BF Corporation mueve fondos a Suiza',
    title_en: 'BF Corporation moves funds to Switzerland',
    description_es:
      'BF Corporation SA (Panama), propiedad de Gianfranco y Mariano Macri, transfiere fondos al Safra Bank de Suiza. Un banco aleman ordena destruir toda la correspondencia.',
    description_en:
      'BF Corporation SA (Panama), owned by Gianfranco and Mariano Macri, transfers funds to Safra Bank in Switzerland. A German bank orders destruction of all correspondence.',
    category: 'financial',
    sources: [
      'https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml',
    ],
  },
  {
    id: 'tl-2016-tt41',
    date: '2016-06-23',
    title_es: 'TT 41 CORP incorporada (Camano)',
    title_en: 'TT 41 CORP incorporated (Camano)',
    description_es:
      'Se incorpora TT 41 CORP en las Islas Virgenes Britanicas a traves de Trident Trust, vinculada a Graciela Camano durante su mandato 2014-2018 como diputada nacional.',
    description_en:
      'TT 41 CORP incorporated in the British Virgin Islands through Trident Trust, linked to Graciela Camano during her 2014-2018 term as national deputy.',
    category: 'financial',
    sources: ['https://offshoreleaks.icij.org'],
  },
  {
    id: 'tl-2016-blanqueo',
    date: '2016',
    title_es: 'Ley de blanqueo de Macri aprobada',
    title_en: 'Macri blanqueo law passed',
    description_es:
      'El gobierno de Macri aprueba una ley de amnistia fiscal. Insiders de SOCMA declaran ARS 900M+ en activos previamente ocultos, incluyendo USD 4M de Gianfranco Macri a traves de BF Corporation.',
    description_en:
      'The Macri government passes a tax amnesty law. SOCMA insiders declare ARS 900M+ in previously hidden assets, including USD 4M from Gianfranco Macri through BF Corporation.',
    category: 'political',
    sources: [
      'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml',
    ],
  },
  {
    id: 'tl-2016-correo-acuerdo',
    date: '2016-06',
    title_es: 'Acuerdo del Correo Argentino: quita del 98,82%',
    title_en: 'Correo Argentino settlement: 98.82% debt reduction',
    description_es:
      'El gobierno de Macri acepta un acuerdo que reduce la deuda de Correo Argentino (empresa familiar) en un 98,82%. La fiscal Boquin lo califica de "equivalente a una condonacion".',
    description_en:
      'The Macri government accepts a settlement reducing the Correo Argentino (family company) debt by 98.82%. Prosecutor Boquin rules it "equivalent to a forgiveness."',
    category: 'legal',
    sources: [
      'https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/',
    ],
  },
  {
    id: 'tl-2017-correo-charges',
    date: '2017',
    title_es: 'Fiscal imputa a Macri por Correo Argentino',
    title_en: 'Prosecutor charges Macri over Correo Argentino',
    description_es:
      'El fiscal Zoni imputa al presidente Macri y al ministro Aguad en relacion al acuerdo de la deuda del Correo Argentino.',
    description_en:
      'Prosecutor Zoni charges President Macri and Minister Aguad in connection with the Correo Argentino debt settlement.',
    category: 'legal',
    sources: ['https://es.wikipedia.org/wiki/Causa_Correo_Argentino'],
  },
  {
    id: 'tl-2019-donations',
    date: '2019',
    title_es: 'Declaraciones de aportes de campana',
    title_en: 'Campaign donation filings',
    description_es:
      'Macri dona ARS 100.000 a Juntos por el Cambio; Maximo Kirchner dona ARS 50.000 a Frente de Todos. Se identifican 50 coincidencias politico-donante (0% falsos positivos). Se detectan violaciones de contratista-donante de Rodriguez y Gonzalez.',
    description_en:
      'Macri donates ARS 100,000 to Juntos por el Cambio; Maximo Kirchner donates ARS 50,000 to Frente de Todos. 50 politician-donor matches identified (0% false positives). Rodriguez contractor-donor pattern detected.',
    category: 'political',
    sources: ['https://aportantes.electoral.gob.ar'],
  },
  {
    id: 'tl-2024-mariano-denuncia',
    date: '2024-08',
    title_es: 'Mariano Macri denuncia penalmente a SOCMA',
    title_en: 'Mariano Macri files criminal complaint against SOCMA',
    description_es:
      'Mariano Macri presenta denuncias penales contra SOCMA, nombrando a Gianfranco, Florencia y al CEO Leonardo Maffioli. Cargos: administracion fraudulenta, falsificacion de documentos, evasion fiscal, balances falsos y lavado de activos.',
    description_en:
      'Mariano Macri files criminal complaints against SOCMA, naming Gianfranco, Florencia, and CEO Leonardo Maffioli. Charges: fraudulent administration, document falsification, tax evasion, false balance sheets, and money laundering.',
    category: 'legal',
    sources: [
      'https://www.infobae.com/judiciales/2024/08/07/el-hermano-de-mauricio-macri-denuncio-al-grupo-empresarial-de-la-familia-por-defraudacion-y-lavado-de-activos/',
    ],
  },
] as const

// ---------------------------------------------------------------------------
// Key Actors
// ---------------------------------------------------------------------------

export const ACTORS: readonly Actor[] = [
  {
    id: 'actor-macri',
    name: 'Mauricio Macri',
    role_es: 'Expresidente, PRO — 5 datasets',
    role_en: 'Former President, PRO — 5 datasets',
    description_es:
      'Aparece en 5 datasets: donante, director de empresa, officer societario, DDJJ y nombramiento de gobierno. Offshore documentada (Fleg Trading, Kagemusha), campanas financiadas por contratistas (documentado por Chequeado), presencia legislativa del 17,6%. Correo Argentino: quita del 98,82% de deuda familiar. AUSOL: venta de acciones con prima del 400%.',
    description_en:
      'Appears across 5 datasets: donor, board member, company officer, DDJJ, and government appointment. Documented offshore (Fleg Trading, Kagemusha), contractor-funded campaigns (documented by Chequeado), 17.6% legislative presence. Correo Argentino: 98.82% family debt forgiveness. AUSOL: share sale at 400% premium.',
    party: 'PRO',
    datasets: 5,
    status_es: 'Sobreseido por Fleg Trading; imputado por Correo Argentino',
    status_en: 'Cleared on Fleg Trading; charged over Correo Argentino',
  },
  {
    id: 'actor-ibanez',
    name: 'Maria Cecilia Ibanez',
    role_es: 'Diputada Nacional, La Libertad Avanza — 4 datasets',
    role_en: 'National Deputy, La Libertad Avanza — 4 datasets',
    description_es:
      'Diputada en ejercicio con entidad offshore activa (PELMOND COMPANY LTD, BVI). Coincidencia exacta confirmada en base ICIJ. Bajo Ley 25.188, debe declarar todos los activos offshore.',
    description_en:
      'Sitting deputy with active offshore entity (PELMOND COMPANY LTD, BVI). Exact name match confirmed in ICIJ database. Under Ley 25.188, must declare all offshore assets.',
    party: 'La Libertad Avanza',
    datasets: 4,
    status_es: 'No confirmado — Alta confianza',
    status_en: 'Unconfirmed — High confidence',
  },
  {
    id: 'actor-camano',
    name: 'Graciela Camano',
    role_es: 'Exdiputada Nacional, Consenso Federal — 4 datasets',
    role_en: 'Former National Deputy, Consenso Federal — 4 datasets',
    description_es:
      'Vinculada a TT 41 CORP (BVI, Pandora Papers). 6 cambios de partido en 30 anos. Presencia del 62,9%. Ausencias sistematicas en votaciones financieras. Patrimonio: ARS 2,8M (2013) a ARS 39,2M (2023).',
    description_en:
      'Linked to TT 41 CORP (BVI, Pandora Papers). 6 party switches over 30 years. 62.9% presence rate. Systematic absences on financial votes. Wealth: ARS 2.8M (2013) to ARS 39.2M (2023).',
    party: 'Consenso Federal',
    datasets: 4,
    status_es: 'No confirmado — Probable',
    status_en: 'Unconfirmed — Probable',
  },
  {
    id: 'actor-bullrich',
    name: 'Patricia Bullrich',
    role_es: 'Ministra de Seguridad, PRO — 4 datasets',
    role_en: 'Minister of Security, PRO — 4 datasets',
    description_es:
      'Parte del cluster de puerta giratoria con Macri y Sanchez: legisladora, luego funcionaria de gobierno, luego regreso a la politica. Sin offshore detectada pero multiples solapamientos dataset.',
    description_en:
      'Part of the revolving-door cluster with Macri and Sanchez: legislator, then government appointee, then back to politics. No offshore detected but multiple dataset overlaps.',
    party: 'PRO',
    datasets: 4,
    status_es: 'Puerta giratoria — sin hallazgo penal',
    status_en: 'Revolving door — no criminal finding',
  },
  {
    id: 'actor-cordero',
    name: 'Maria Eugenia Cordero',
    role_es: 'Contratista estatal + Officer offshore',
    role_en: 'Government contractor + Offshore officer',
    description_es:
      'Contratista del Estado y officer de BETHAN INVESTMENTS LIMITED (offshore). Potencial conducto de fondos publicos a jurisdicciones opacas. Caso referido para investigacion bajo Ley 25.246.',
    description_en:
      'Government contractor and officer of BETHAN INVESTMENTS LIMITED (offshore). Potential pipeline from public funds to opaque jurisdictions. Case referred for investigation under Ley 25.246.',
    party: '-',
    datasets: 2,
    status_es: 'Presunto — Referido a UIF',
    status_en: 'Alleged — Referred to UIF',
  },
  {
    id: 'actor-rodriguez',
    name: 'Juan Pablo Rodriguez',
    role_es: 'Contratista estatal + Donante de campana',
    role_en: 'Government contractor + Campaign donor',
    description_es:
      '4 contratos estatales (2018-2020) y donante de campana. Violacion directa de Ley 26.215 Art. 15.',
    description_en:
      '4 government contracts (2018-2020) and campaign donor. Direct violation of Ley 26.215 Art. 15.',
    party: '-',
    datasets: 2,
    status_es: 'Confirmado — Violacion de ley',
    status_en: 'Confirmed — Legal violation',
  },
  {
    id: 'actor-gonzalez',
    name: 'Jorge Omar Gonzalez',
    role_es: 'Contratista estatal + Donante de campana',
    role_en: 'Government contractor + Campaign donor',
    description_es:
      '1 contrato estatal y donante de campana. Violacion directa de Ley 26.215 Art. 15.',
    description_en:
      '1 government contract and campaign donor. Direct violation of Ley 26.215 Art. 15.',
    party: '-',
    datasets: 2,
    status_es: 'Confirmado — Violacion de ley',
    status_en: 'Confirmed — Legal violation',
  },
  {
    id: 'actor-sanchez',
    name: 'Fernando Sanchez',
    role_es: 'Exdiputado, Coalicion Civica — 2+ datasets',
    role_en: 'Former Deputy, Coalicion Civica — 2+ datasets',
    description_es:
      'Puerta giratoria: legislador a funcionario de gobierno. CC-ARI enfrento alegaciones de donaciones ficticias.',
    description_en:
      'Revolving door: legislator to government appointee. CC-ARI faced allegations of fictitious donations.',
    party: 'Coalicion Civica',
    datasets: 2,
    status_es: 'Puerta giratoria — alegaciones pendientes',
    status_en: 'Revolving door — allegations pending',
  },
  {
    id: 'actor-gianfranco',
    name: 'Gianfranco Macri',
    role_es: 'Cabeza operativa de SOCMA',
    role_en: 'Operational head of SOCMA',
    description_es:
      'Copropietario de BF Corporation (Panama). Declaro ARS 622M a traves del blanqueo 2016. Fondos transferidos a Safra Bank (Suiza). Denunciado penalmente por su hermano Mariano en 2024.',
    description_en:
      'Co-owner of BF Corporation (Panama). Declared ARS 622M through 2016 blanqueo. Funds transferred to Safra Bank (Switzerland). Criminally denounced by brother Mariano in 2024.',
    party: '-',
    datasets: 3,
    status_es: 'Denunciado penalmente por hermano (2024)',
    status_en: 'Criminally denounced by brother (2024)',
  },
] as const

// ---------------------------------------------------------------------------
// Money Flows
// ---------------------------------------------------------------------------

export const MONEY_FLOWS: readonly MoneyFlow[] = [
  {
    id: 'flow-correo-debt',
    from_label: 'Correo Argentino (SOCMA)',
    to_label: 'Estado Nacional',
    amount_ars: 296_000_000,
    description_es:
      'Deuda original del Correo Argentino con el Estado. SOCMA solo pago el canon el primer ano. El gobierno de Macri acepto una quita del 98,82%, liquidando la deuda a 1,18% de su valor.',
    description_en:
      'Original Correo Argentino debt to the State. SOCMA only paid the canon the first year. The Macri government accepted a 98.82% reduction, settling the debt at 1.18% of its value.',
    date: '2016-06',
    source: 'Chequeado',
    source_url:
      'https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/',
  },
  {
    id: 'flow-camano-wealth',
    from_label: 'Patrimonio 2013: ARS 2,8M',
    to_label: 'Patrimonio 2023: ARS 39,2M',
    amount_ars: 39_200_000,
    description_es:
      'Crecimiento patrimonial declarado de Graciela Camano durante 10 anos. De ARS 2,8M a ARS 39,2M, mientras mantuvo una entidad offshore en BVI.',
    description_en:
      'Graciela Camano declared wealth growth over 10 years. From ARS 2.8M to ARS 39.2M, while maintaining an offshore entity in BVI.',
    date: '2013–2023',
    source: 'DDJJ Asset Declarations',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'flow-socma-blanqueo',
    from_label: 'Insiders SOCMA',
    to_label: 'Blanqueo 2016 (amnistia fiscal)',
    amount_ars: 920_900_000,
    description_es:
      'Total declarado por insiders de SOCMA: Gianfranco (ARS 622M), Maffioli (ARS 76M), Amasanti (ARS 93M), Composto (ARS 68M), Libedinsky (ARS 61,9M). Activos previamente ocultos, incluyendo USD 4M de BF Corporation (Panama).',
    description_en:
      'Total declared by SOCMA insiders: Gianfranco (ARS 622M), Maffioli (ARS 76M), Amasanti (ARS 93M), Composto (ARS 68M), Libedinsky (ARS 61.9M). Previously hidden assets including USD 4M from BF Corporation (Panama).',
    date: '2016',
    source: 'Perfil',
    source_url:
      'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml',
  },
  {
    id: 'flow-macri-donation',
    from_label: 'Mauricio Macri',
    to_label: 'Juntos por el Cambio (2019)',
    amount_ars: 100_000,
    description_es:
      'Auto-donacion de campana. Chequeado documento que Macri recibio ~ARS 3M en donaciones de empleados de empresas contratistas del Estado, eludiendo la prohibicion del Art. 15 sobre donaciones corporativas.',
    description_en:
      'Campaign self-donation. Chequeado documented that Macri received ~ARS 3M in donations from employees of state contractor companies, circumventing the Art. 15 prohibition on corporate donations.',
    date: '2019',
    source: 'CNE / Chequeado',
    source_url:
      'https://chequeado.com/investigaciones/macri-recibio-3-millones-de-contratistas-del-estado-para-su-campana-electoral/',
  },
  {
    id: 'flow-bf-corp-swiss',
    from_label: 'BF Corporation SA (Panama)',
    to_label: 'Safra Bank (Suiza)',
    amount_ars: 0,
    description_es:
      'Transferencia de fondos a banco suizo. Monto exacto desconocido. Un banco aleman ordeno la destruccion de toda la correspondencia. Gianfranco declaro USD 4M de esta entidad en el blanqueo.',
    description_en:
      'Fund transfer to Swiss bank. Exact amount unknown. A German bank ordered destruction of all correspondence. Gianfranco declared USD 4M from this entity in the blanqueo.',
    date: '2015',
    source: 'Perfil',
    source_url:
      'https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml',
  },
] as const
