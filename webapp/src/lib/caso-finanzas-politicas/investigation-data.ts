/**
 * Argentine Political Finance investigation structured data.
 *
 * Bilingual (ES primary, EN secondary) factcheck items, timeline events,
 * actors, and money flows — sourced from the cross-referencing of nine
 * public datasets: Como Voto, ICIJ, CNE, Boletin Oficial, IGJ, CNV,
 * DDJJ, cross-enrichment pipeline, and Poder Judicial.
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
  source_url?: string
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
    value: '12,233',
    label_es: 'Coincidencias cross-dataset',
    label_en: 'Cross-dataset matches',
    source: 'SAME_ENTITY + MAYBE_SAME_AS',
  },
  {
    value: '1,825',
    label_es: 'Entidades cruzadas por CUIT/DNI',
    label_en: 'CUIT/DNI cross-referenced entities',
    source: 'Cross-reference engine',
  },
  {
    value: '133',
    label_es: 'Nodos de investigación',
    label_en: 'Investigation nodes',
    source: 'Neo4j graph',
  },
  {
    value: '22',
    label_es: 'Personas críticas identificadas',
    label_en: 'Critical persons identified',
    source: 'Cross-reference engine',
  },
  {
    value: '$674B',
    label_es: 'Valor total contratos rastreados (ARS)',
    label_en: 'Total tracked contract value (ARS)',
    source: 'Compr.ar / Boletín Oficial',
  },
  {
    value: '72+',
    label_es: 'Puerta giratoria financiera-gobierno',
    label_en: 'Financial-government revolving door',
    source: 'IGJ + GovernmentAppointment cross-match',
  },
  {
    value: '6',
    label_es: 'Jueces criticos documentados',
    label_en: 'Critical judges documented',
    source: 'Poder Judicial / DDJJ / ACIJ',
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
      'SOCMA obtuvo la concesion postal en 1997 (gobierno de Menem). Solo pago el canon el primer ano; la deuda alcanzo ARS 296M. En junio de 2016, el gobierno de Macri acepto un acuerdo con quita del 98,82% (ARS 70.000M ajustados). La causa judicial continua activa. Para 2024, la familia no habia pagado nada.',
    detail_en:
      'SOCMA won the postal concession in 1997 (Menem government). Only paid the canon the first year; debt reached ARS 296M. In June 2016, the Macri government accepted a settlement with 98.82% reduction (ARS 70B adjusted). The judicial case continues. By 2024, the family had paid nothing.',
  },
  // --- Tier 2: AUSOL shares ---
  {
    id: 'macri-ausol',
    claim_es:
      'Macri vendio acciones de Autopistas del Sol (AUSOL) con una prima de ~394% despues de que su gobierno autorizara aumentos de peaje y renegociara la concesion por ~USD 2.000M.',
    claim_en:
      'Macri sold Autopistas del Sol (AUSOL) shares at a ~394% premium after his government authorized toll increases and renegotiated the concession for ~USD 2B.',
    status: 'confirmed',
    tier: 2,
    source: 'Pagina/12',
    source_url:
      'https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol',
    detail_es:
      'La Oficina Anticorrupcion recomendo que Macri no participara; se recuso formalmente. Sin embargo, la renegociacion de 2018 comprometio al Estado con ~USD 2.000M de impacto economico total. La causa judicial continua respecto a ex funcionarios por "administracion fraudulenta". Las acciones fueron vendidas a Natal Inversiones con prima de ~394%.',
    detail_en:
      'The Anti-Corruption Office recommended Macri not participate; he formally recused. However, the 2018 renegotiation committed the State to ~USD 2B total economic impact. The judicial case continues regarding ex-officials for "fraudulent administration." Shares were sold to Natal Inversiones at a ~394% premium.',
  },
  // --- Tier 2: Contractor-donor violations ---
  {
    id: 'rodriguez-contractor-donor',
    claim_es:
      'Juan Pablo Rodriguez (4 contratos estatales 2018-2020) realizo donaciones de campana, en coincidencia con la prohibicion de la Ley 26.215 Art. 15 sobre contribuciones de contratistas del Estado.',
    claim_en:
      'Juan Pablo Rodriguez (4 government contracts 2018-2020) made campaign donations, coinciding with the prohibition in Ley 26.215 Art. 15 on contributions from government contractors.',
    status: 'confirmed',
    tier: 2,
    source: 'Cross-dataset analysis (Boletin Oficial + CNE)',
    source_url: 'https://datos.gob.ar',
    detail_es:
      'La Ley 26.215 Art. 15 prohibe explicitamente las contribuciones de campana de personas o entidades con contratos estatales. El Art. 15 bis establece multas de 10 a 20 veces el monto de la contribucion ilegal y potencial procesamiento penal.',
    detail_en:
      'Ley 26.215 Art. 15 explicitly prohibits campaign contributions from persons or entities holding government contracts. Art. 15 bis establishes fines of 10 to 20 times the illegal contribution amount and potential criminal prosecution.',
  },
  // --- Tier 2: Cordero pipeline ---
  {
    id: 'cordero-offshore-pipeline',
    claim_es:
      'Maria Eugenia Cordero es simultaneamente contratista del Estado y officer de BETHAN INVESTMENTS LIMITED (offshore), configurando una posible coincidencia entre fondos publicos y jurisdicciones opacas.',
    claim_en:
      'Maria Eugenia Cordero is simultaneously a government contractor and officer of BETHAN INVESTMENTS LIMITED (offshore), creating a possible overlap between public funds and opaque jurisdictions.',
    status: 'alleged',
    tier: 2,
    source: 'Cross-dataset analysis (Boletin Oficial + ICIJ)',
    source_url: 'https://offshoreleaks.icij.org',
    detail_es:
      'Este patron — contratista estatal con holdings offshore — constituye una estructura de riesgo bajo la Ley 25.246 (lavado de activos). Confirmado: la coincidencia de nombre en ambos datasets. No confirmado: si es la misma persona, y si fondos publicos pasaron por la entidad offshore.',
    detail_en:
      'This pattern — state contractor with offshore holdings — represents a risk structure under Ley 25.246 (anti-money laundering). Confirmed: the name match across both datasets. Unconfirmed: whether the same individual, and whether public funds moved through the offshore entity.',
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
      'Gianfranco Macri: ARS 622M (~USD 4M de BF Corp). Leonardo Maffioli (CEO SOCMA): ARS 76M. Armando Amasanti: ARS 93M. Victor Composto: ARS 68M. Carlos Libedinsky (socio de Jorge Macri): ARS 61,9M. Gianfranco tambien declaro un fideicomiso de Alicia Blanco Villegas (madre de Mauricio), potencialmente en tension con la prohibicion del blanqueo de declarar activos de familiares.',
    detail_en:
      'Gianfranco Macri: ARS 622M (~USD 4M from BF Corp). Leonardo Maffioli (SOCMA CEO): ARS 76M. Armando Amasanti: ARS 93M. Victor Composto: ARS 68M. Carlos Libedinsky (Jorge Macri partner): ARS 61.9M. Gianfranco also declared a trust belonging to Alicia Blanco Villegas (Mauricio\'s mother), potentially in tension with the blanqueo prohibition on declaring relatives\' assets.',
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
  // --- Tier 1: Kueider border detention ---
  {
    id: 'kueider-border-cash',
    claim_es:
      'El senador Edgardo Kueider fue detenido en el cruce fronterizo de Paraguay con USD 211.000 en efectivo no declarado. Fue expulsado del Senado de la Nacion. Sus asociados BETAIL y EDEKOM figuran como empresas vinculadas.',
    claim_en:
      'Senator Edgardo Kueider was detained at the Paraguay border crossing with USD 211,000 in undeclared cash. He was expelled from the Senate. Associates BETAIL and EDEKOM appear as linked companies.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / La Nacion',
    source_url:
      'https://www.infobae.com/politica/2024/12/04/detuvieron-al-senador-edgardo-kueider-en-paraguay-llevaba-mas-de-usd-200-mil/',
    detail_es:
      'Kueider fue detenido el 4 de diciembre de 2024 en el paso fronterizo de Clorinda con USD 211.000 no declarados. El Senado lo expulso por mayoria. Las empresas BETAIL SRL y EDEKOM SA aparecen en registros como vinculadas a su nombre. En marzo de 2025, siete personas de su entorno fueron detenidas.',
    detail_en:
      'Kueider was detained on 4 December 2024 at the Clorinda border crossing with USD 211,000 in undeclared cash. The Senate expelled him by majority vote. The companies BETAIL SRL and EDEKOM SA appear in records linked to his name. In March 2025, seven associates were detained.',
  },
  // --- Tier 2: Lousteau / LCG ---
  {
    id: 'lousteau-lcg',
    claim_es:
      'LCG SA, consultora vinculada al senador Martin Lousteau, habria facturado al Congreso Nacional aproximadamente ARS 1.690.000 entre 2020 y 2022 durante su mandato como senador. Se presentaron cargos penales.',
    claim_en:
      'LCG SA, a consultancy linked to Senator Martin Lousteau, reportedly billed the National Congress approximately ARS 1,690,000 between 2020 and 2022 during his Senate term. Criminal charges were filed.',
    status: 'confirmed',
    tier: 2,
    source: 'Cross-dataset analysis (Boletin Oficial + DDJJ)',
    source_url: 'https://datos.gob.ar',
    detail_es:
      'LCG SA figura en el Boletin Oficial con contratos de consultoria con el Congreso por ARS 1.690.000 durante el periodo en que Lousteau ejercia como senador. La causa judicial continua activa.',
    detail_en:
      'LCG SA appears in the Boletin Oficial with consulting contracts with Congress for ARS 1,690,000 during the period Lousteau served as senator. The judicial case continues.',
  },
  // --- Tier 1: PENSAR ARGENTINA ---
  {
    id: 'pensar-argentina-caputo',
    claim_es:
      'PENSAR ARGENTINA, fundacion vinculada al empresario Nicolas Caputo (socio historico de Macri), tiene registrados a 19 politicos como miembros del directorio segun datos de IGJ.',
    claim_en:
      'PENSAR ARGENTINA, a foundation linked to businessman Nicolas Caputo (longtime Macri associate), has 19 politicians registered as board members according to IGJ data.',
    status: 'confirmed',
    tier: 1,
    source: 'IGJ / Cross-dataset analysis',
    source_url: 'https://datos.gob.ar',
    detail_es:
      'La coincidencia entre el directorio de PENSAR ARGENTINA y legisladores activos fue detectada en el cruce de datasets IGJ y GovernmentAppointment. Nicolas Caputo figura como miembro fundador. La foundation aparece en 2 datasets.',
    detail_en:
      'The overlap between PENSAR ARGENTINA\'s board and active legislators was detected in the cross-referencing of IGJ and GovernmentAppointment datasets. Nicolas Caputo appears as founding member. The foundation appears in 2 datasets.',
  },
  // --- Tier 1: De Narváez offshore ---
  {
    id: 'denarvaez-offshore',
    claim_es:
      'Francisco De Narvaez figura en 5 entidades offshore segun la base ICIJ, incluyendo Titan Consulting y Retrato Partners. Su fortuna es estimada en USD 920M. Aparece en 4 datasets.',
    claim_en:
      'Francisco De Narvaez appears in 5 offshore entities in the ICIJ database, including Titan Consulting and Retrato Partners. His fortune is estimated at USD 920M. He appears in 4 datasets.',
    status: 'confirmed',
    tier: 1,
    source: 'ICIJ Offshore Leaks',
    source_url: 'https://offshoreleaks.icij.org',
    detail_es:
      'Coincidencias confirmadas en la base ICIJ. De Narvaez adquirio Walmart Argentina en noviembre de 2020. Sus entidades offshore incluyen Titan Consulting Ltd y Retrato Partners Ltd, ambas en jurisdicciones de baja tributacion.',
    detail_en:
      'Matches confirmed in the ICIJ database. De Narvaez acquired Walmart Argentina in November 2020. His offshore entities include Titan Consulting Ltd and Retrato Partners Ltd, both in low-tax jurisdictions.',
  },
  // --- Tier 2: Grindetti offshore + Brazil ---
  {
    id: 'grindetti-offshore',
    claim_es:
      'Nestor Grindetti figura como vinculado a Mercier International (Panama) y a la cuenta en Clariden Leu (banco suizo). Enfrenta 9 causas tributarias en Brasil. Aparece en 3 datasets.',
    claim_en:
      'Nestor Grindetti appears linked to Mercier International (Panama) and an account at Clariden Leu (Swiss bank). He faces 9 tax cases in Brazil. He appears in 3 datasets.',
    status: 'confirmed',
    tier: 2,
    source: 'ICIJ / Cross-dataset analysis',
    source_url: 'https://offshoreleaks.icij.org',
    detail_es:
      'Mercier International SA (Panama) aparece en la base ICIJ vinculada a Grindetti. Clariden Leu fue absorbido por Credit Suisse en 2012. Las causas tributarias en Brasil corresponden al periodo 2010-2020 segun registros del fisco federal brasileno.',
    detail_en:
      'Mercier International SA (Panama) appears in the ICIJ database linked to Grindetti. Clariden Leu was absorbed by Credit Suisse in 2012. The Brazilian tax cases correspond to the 2010-2020 period according to Brazilian federal tax records.',
  },
  // --- Tier 2: Vote-corporate conflicts ---
  {
    id: 'vote-corporate-conflicts',
    claim_es:
      '69 legisladores votaron sobre legislacion financiera mientras figuraban como vinculados a empresas del sector financiero, segun el cruce de datasets Como Voto y registros societarios.',
    claim_en:
      '69 legislators voted on financial legislation while appearing linked to financial sector companies, according to cross-referencing Como Voto and corporate registry datasets.',
    status: 'alleged',
    tier: 2,
    source: 'Cross-dataset analysis (Como Voto + IGJ + CNV)',
    source_url: 'https://datos.gob.ar',
    detail_es:
      'Hallazgo analitico derivado del grafo de coincidencias. La potencial coincidencia entre el rol legislativo y el interes corporativo en el sector financiero abarca a 69 individuos identificados. No se confirma causalidad — se documenta la coincidencia estructural.',
    detail_en:
      'Analytical finding derived from the match graph. The potential overlap between legislative role and corporate interest in the financial sector spans 69 identified individuals. Causality is not confirmed — the structural coincidence is documented.',
  },
  // --- Tier 1: Nación Seguros scandal ---
  {
    id: 'nacion-seguros-monopoly',
    claim_es:
      'El Decreto 823/2021 firmado por Alberto Fernández obligó a todo el sector público a contratar seguros exclusivamente con Nación Seguros S.A., creando un monopolio que fue explotado por brokers amigos del presidente.',
    claim_en:
      'Decree 823/2021 signed by Alberto Fernández mandated all public sector entities to contract insurance exclusively through Nación Seguros S.A., creating a monopoly exploited by brokers close to the president.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / Noticias Argentinas',
    source_url:
      'https://noticiasargentinas.com/politica/investigacion-sobre-seguros--alberto-fernandez-debera-explicar-el-decreto-823-2021-que-dio-millones-del-estado-a-sus-amigo-brokers_a6729edb7955e3f568c0df2a2',
    detail_es:
      'El Decreto 823/2021 obligó a todas las entidades bajo Ley 24.156 Art. 8 a contratar con Nación Seguros. Los 25 brokers más importantes cobraron $3.500M en comisiones. Bachellier S.A. facturó $1.665M y fue embargada por $9.669M. Héctor Martínez Sosa (amigo y ex-asesor de Fernández) cobró $366M en comisiones. 24 allanamientos, procesamiento en curso (Juez Casanello, feb. 2026). Decreto revocado por Milei (747/2024).',
    detail_en:
      'Decree 823/2021 mandated all entities under Ley 24.156 Art. 8 to contract with Nación Seguros. The top 25 brokers collected $3.5B ARS in commissions. Bachellier S.A. invoiced $1.665B and was embargoed for $9.669B. Héctor Martínez Sosa (friend and former advisor of Fernández) collected $366M in commissions. 24 raids, prosecution ongoing (Judge Casanello, Feb 2026). Decree revoked by Milei (747/2024).',
  },
  // --- Tier 1: Insurance revolving door ---
  {
    id: 'plate-revolving-door',
    claim_es:
      'Guillermo Pedro Plate pasó de ser Vicepresidente de Provincia ART a Superintendente de Seguros, regulando el mismo mercado donde fue ejecutivo. Protege selectivamente a Liderar Seguros (de Franco Ortolano) mientras sanciona a competidores.',
    claim_en:
      'Guillermo Pedro Plate went from VP of Provincia ART to Superintendent of Insurance, regulating the same market where he was an executive. He selectively shields Liderar Seguros (Franco Ortolano) while sanctioning competitors.',
    status: 'confirmed',
    tier: 1,
    source: 'La Letra P',
    source_url:
      'https://www.letrap.com.ar/politica/como-funciona-el-blindaje-oficial-las-aseguradoras-protegidas-el-gobierno-n5416266',
    detail_es:
      'Plate fue VP de Provincia ART (mayor ART estatal) y asesor del Banco Provincia, luego nombrado Superintendente de Seguros. Medios documentan "blindaje oficial": protege a Liderar Seguros (exenta de inspecciones) y a Libra Seguros (cuyo ex-director legal, Mariano Cúneo Libarona, es ahora Ministro de Justicia, creando "doble blindaje"). Sanciona duramente a Boston Seguros, TPC y Orbis.',
    detail_en:
      'Plate was VP of Provincia ART (largest state workers comp insurer) and Banco Provincia board advisor, then appointed Insurance Superintendent. Media documents "official shielding": shields Liderar Seguros (exempt from inspections) and Libra Seguros (whose ex-legal director, Mariano Cúneo Libarona, is now Justice Minister, creating "double shielding"). Harshly sanctions Boston Seguros, TPC and Orbis.',
  },
  // --- Tier 1: Catalán revolving door ---
  {
    id: 'catalan-ypf-revolving-door',
    claim_es:
      'Lisandro Catalán dejó el Ministerio del Interior el 3 de noviembre de 2025 y dos semanas después fue designado Director de YPF con un salario de ~140 millones de pesos mensuales.',
    claim_en:
      'Lisandro Catalán left the Ministry of Interior on November 3, 2025 and two weeks later was appointed YPF Director at ~140 million pesos/month salary.',
    status: 'confirmed',
    tier: 1,
    source: 'iProfesional / Infocielo',
    source_url:
      'https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf',
    detail_es:
      'Catalán fue previamente presidente de Bapro Mandatos y Negocios S.A. (gobernación Scioli, 2006-2007), donde surgió el escándalo de fideicomisos de vivienda "Estrella del Sur". Trabajó simultáneamente en Provincia Bursátil, Provincia Seguros y otras empresas del Grupo Bapro (2007-2015). Su designación en YPF lo reúne con Guillermo Francos en el directorio.',
    detail_en:
      'Catalán was previously president of Bapro Mandatos y Negocios S.A. (Scioli governorship, 2006-2007), where the "Estrella del Sur" housing trust scandal emerged. He simultaneously held positions at Provincia Bursátil, Provincia Seguros and other Grupo Bapro companies (2007-2015). His YPF appointment reunites him with Guillermo Francos on the board.',
  },
  // --- Tier 1: Frigerio family conflicts ---
  {
    id: 'frigerio-koolhaas',
    claim_es:
      'La Oficina Anticorrupción denunció a Rogelio Frigerio por "negociaciones incompatibles" al invertir USD 776.000 en un proyecto inmobiliario sobre tierras fiscales que él mismo transfirió como titular de la AABE.',
    claim_en:
      'The Anti-Corruption Office denounced Rogelio Frigerio for "dealings incompatible with public office" for investing USD 776,000 in a real estate project on fiscal lands he himself transferred as head of AABE.',
    status: 'confirmed_cleared',
    tier: 1,
    source: 'Infobae',
    source_url:
      'https://www.infobae.com/politica/2022/04/25/pidieron-citar-a-indagatoria-a-rogelio-frigerio-por-irregularidades-en-operaciones-inmobiliarias/',
    detail_es:
      'Frigerio firmó transferencias de tierras fiscales de AABE a Koolhaas S.A. y en el plazo de un mes invirtió USD 776.000 en el emprendimiento inmobiliario sobre esas mismas tierras. Sobreseído por el juez Ercolini en diciembre 2022. Su padre Octavio fue director de YPF (2016-2018) mientras Rogelio era Ministro del Interior. Su esposa Victoria Costoya fue designada Directora General en Desarrollo Social.',
    detail_en:
      'Frigerio signed AABE fiscal land transfers to Koolhaas S.A. and within one month invested USD 776,000 in the real estate project on those same lands. Cleared by Judge Ercolini in December 2022. His father Octavio was YPF director (2016-2018) while Rogelio was Interior Minister. His wife Victoria Costoya was appointed Director General at Social Development.',
  },
  // --- Tier 2: Financial interlocking directorates ---
  {
    id: 'interlocking-directorates',
    claim_es:
      'El análisis de grafos reveló clusters masivos de directores compartidos: CITELEC-EDELAP (81 officers compartidos, grupo Pampa Energía/Mindlin), Grupo Galicia seguros (60 officers), cluster MetLife (40 officers en 5 entidades).',
    claim_en:
      'Graph analysis revealed massive interlocking directorate clusters: CITELEC-EDELAP (81 shared officers, Pampa Energía/Mindlin group), Grupo Galicia insurance (60 officers), MetLife cluster (40 officers across 5 entities).',
    status: 'confirmed',
    tier: 2,
    source: 'Cross-dataset analysis (IGJ)',
    source_url: 'https://datos.gob.ar',
    detail_es:
      'El grupo Werthein controla el cluster Caja de Seguros (32 officers compartidos). Pampa Energía opera la infraestructura eléctrica de Buenos Aires con 81 officers idénticos entre CITELEC y EDELAP. MetLife opera 5 entidades legales separadas (seguro, pensión, inversión) con 29-40 officers compartidos.',
    detail_en:
      'The Werthein family controls the Caja de Seguros cluster (32 shared officers). Pampa Energía operates Buenos Aires electricity infrastructure with 81 identical officers between CITELEC and EDELAP. MetLife operates 5 separate legal entities (insurance, pension, investment) with 29-40 shared officers.',
  },
  // --- Tier 1: Judicial Branch — Lijo Supreme Court ---
  {
    id: 'lijo-supreme-court',
    claim_es:
      'El juez Ariel Lijo fue nombrado a la Corte Suprema por decreto 137/2025, eludiendo el rechazo del Senado (43 en contra, 27 a favor, 1 abstención). Maneja la causa Correo Argentino contra la familia Macri. Tiene 89 causas de corrupción con solo 14 elevadas a juicio. Vive en un departamento de USD 2M no declarado en su DDJJ.',
    claim_en:
      'Judge Ariel Lijo was appointed to the Supreme Court by decree 137/2025, bypassing Senate rejection (43 against, 27 for, 1 abstention). He handles the Correo Argentino case against the Macri family. Has 89 corruption cases with only 14 sent to trial. Lives in a USD 2M apartment not declared in his sworn assets.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / ACIJ',
    source_url:
      'https://www.infobae.com/politica/2025/02/25/javier-milei-designo-por-decreto-en-la-corte-suprema-a-ariel-lijo-y-manuel-garcia-mansilla/',
  },
  // --- Tier 1: Judicial Branch — Ercolini Lago Escondido ---
  {
    id: 'ercolini-lago-escondido',
    claim_es:
      'El juez Ercolini voló en un avión pagado por Clarín a la estancia Lago Escondido del billonario Joe Lewis, junto a otros jueces, funcionarios macristas y agentes de inteligencia. Luego sobreyó a Frigerio en el caso Koolhaas. Chats filtrados de Telegram muestran coordinación para fabricar coartadas.',
    claim_en:
      'Judge Ercolini flew on a Clarín-paid flight to billionaire Joe Lewis\'s Lago Escondido estate, with other judges, Macri officials and intelligence agents. He then cleared Frigerio in the Koolhaas case. Leaked Telegram chats show coordination to fabricate alibis.',
    status: 'confirmed',
    tier: 1,
    source: 'El Destape / Judicial leaks',
    source_url:
      'https://www.eldestapeweb.com/politica/los-jueces-de-clarin/clarin-invito-a-jueces-del-lawfare-a-lago-escondido-y-buscaron-encubrirlo-con-facturas-truchas-y-el-direccionamiento-de-una-causa-judicial-202212419450',
  },
  // --- Tier 1: Judicial Branch — Rosenkrantz conflicts ---
  {
    id: 'rosenkrantz-clarin',
    claim_es:
      'Carlos Rosenkrantz, presidente de la Corte Suprema, fue abogado de Clarín, La Nación, McDonald\'s, YPF y Repsol. En 2021 revirtió su política de recusación y comenzó a fallar en casos de ex clientes: al menos 56 fallos involucrando antiguos clientes.',
    claim_en:
      'Carlos Rosenkrantz, Supreme Court president, was lawyer for Clarín, La Nación, McDonald\'s, YPF and Repsol. In 2021 reversed his recusal policy and began ruling on former clients\' cases: at least 56 rulings involving former clients.',
    status: 'confirmed',
    tier: 1,
    source: 'Página/12',
    source_url:
      'https://www.pagina12.com.ar/204884-rosenkrantz-una-larga-historia-de-conflictos',
  },
  // --- Tier 1: Judicial Branch — Hornos/Borinsky Olivos visits ---
  {
    id: 'hornos-borinsky-olivos',
    claim_es:
      'Los jueces de Casación Hornos y Borinsky visitaron a Macri en Olivos y Casa Rosada (6+ y 15+ veces respectivamente) mientras presidían causas contra dirigentes kirchneristas. Borinsky admitió que iba \'a jugar al pádel\'.',
    claim_en:
      'Cassation judges Hornos and Borinsky visited Macri at Olivos and Casa Rosada (6+ and 15+ times respectively) while presiding over cases against Kirchnerist leaders. Borinsky claimed he went \'to play paddle tennis\'.',
    status: 'confirmed',
    tier: 1,
    source: 'El Destape / Judicial leaks',
    source_url:
      'https://www.eldestapeweb.com/politica/operacion-olivos/el-juez-hornos-tambien-estuvo-con-macri-en-olivos-20214118034',
  },
  // --- Tier 1: Judicial Branch — Wealth anomalies ---
  {
    id: 'judicial-wealth-anomalies',
    claim_es:
      'El juez Seijas declaró ARS 1.750 millones en activos en 2024 siendo asesor ad honorem (no remunerado). La jueza Pistone mostró un crecimiento patrimonial del 457.000% en 11 años (de 24K a 108M ARS). Castiñeira de Dios creció 62.000% (528K a 326M ARS).',
    claim_en:
      'Judge Seijas declared ARS 1.75 billion in assets in 2024 as an ad honorem (unpaid) advisor. Judge Pistone showed 457,000% asset growth over 11 years (24K to 108M ARS). Castiñeira de Dios grew 62,000% (528K to 326M ARS).',
    status: 'confirmed',
    tier: 1,
    source: 'DDJJ / Cross-dataset analysis',
    source_url: 'https://datos.gob.ar',
  },
  // --- Tier 1: Judicial Branch — 2% conviction rate ---
  {
    id: '2pct-conviction-rate',
    claim_es:
      'Según el Cuerpo de Auditores del Consejo de la Magistratura de la Nación, la tasa de condena por corrupción en Argentina es del 2%. El 98% de las causas prescriben, se archivan o terminan en absolución.',
    claim_en:
      'According to the Auditors Body of the Consejo de la Magistratura, Argentina\'s corruption conviction rate is 2%. 98% of cases expire, are archived, or end in acquittal.',
    status: 'confirmed',
    tier: 1,
    source: 'Cuerpo de Auditores del Consejo de la Magistratura / Chequeado',
    source_url: 'https://chequeado.com',
  },
  // --- Tier 1: Milei-era scandals ---
  {
    id: 'libra-crypto-scandal',
    claim_es:
      'El presidente Milei promovió la criptomoneda $LIBRA que alcanzó una capitalización de USD 4.5B antes de caer 90%. Insiders cobraron USD 107M. En el teléfono del lobbyista Mauricio Novelli se encontró un acuerdo de pago de USD 5M a Milei. Hayden Davis (Kelsier Ventures) tiene activos congelados.',
    claim_en:
      'President Milei promoted the $LIBRA cryptocurrency which hit USD 4.5B market cap before crashing 90%. Insiders cashed out USD 107M. A USD 5M payment agreement to Milei was found on lobbyist Mauricio Novelli\'s phone. Hayden Davis (Kelsier Ventures) has frozen assets.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / Congressional investigation',
    source_url: 'https://www.infobae.com',
  },
  {
    id: 'side-2838-growth',
    claim_es:
      'Los fondos reservados de inteligencia (SIDE) crecieron ~2.000% bajo Milei. Santiago Caputo controla la SIDE a través del designado Cristian Auguadra sin ser funcionario público. El DNU 941/2025 otorgó poderes de detención y vigilancia masiva sin orden judicial.',
    claim_en:
      'Intelligence reserved funds (SIDE) grew ~2,000% under Milei. Santiago Caputo controls SIDE through appointee Cristian Auguadra without being a public official. DNU 941/2025 granted detention and mass surveillance powers without judicial order.',
    status: 'confirmed',
    tier: 1,
    source: 'Chequeado / Página/12 / elDiarioAR',
    source_url: 'https://chequeado.com',
  },
  {
    id: 'belocopitt-health-media',
    claim_es:
      'Claudio Belocopitt posee 76% de Swiss Medical y 40% de Grupo América (América TV, A24, La Red). Tiene 6 entidades offshore en las Islas Vírgenes Británicas (Panama Papers). Red de 53 empresas. Cobró USD 13M en ayuda COVID estatal siendo top-50 más ricos.',
    claim_en:
      'Claudio Belocopitt owns 76% of Swiss Medical and 40% of Grupo America (America TV, A24, La Red). Has 6 BVI offshore entities (Panama Papers). 53-company network. Collected USD 13M COVID state aid while being top-50 richest.',
    status: 'confirmed',
    tier: 1,
    source: 'ICIJ / Forbes',
    source_url: 'https://offshoreleaks.icij.org',
  },
  {
    id: 'pami-16x-overpricing',
    claim_es:
      'PAMI pagó hasta 16 veces el precio de mercado por medicamentos oncológicos en 2023 (anastrozol: $13.192 vs $924 en licitación, ~14x). Cartel denunciado: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncología.',
    claim_en:
      'PAMI paid up to 16x market price for oncological drugs in 2023 (anastrozole: $13,192 vs $924 at tender, ~14x). Cartel complaint: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncología.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae',
    source_url: 'https://www.infobae.com',
  },
  {
    id: 'bcra-gold-london',
    claim_es:
      'El BCRA envió secretamente ~37 toneladas de oro ($1B+) a Londres en 2024. Rechaza auditorías, dice que no existen contratos, bloquea a la AGN.',
    claim_en:
      'BCRA secretly shipped ~37 tonnes of gold ($1B+) to London in 2024. Refuses audits, claims no contracts exist, blocks AGN.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / Congressional investigation',
    source_url: 'https://www.infobae.com',
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
    id: 'tl-2016-belocopitt-panama',
    date: '2016',
    title_es: 'Panama Papers: Belocopitt con 6 entidades offshore en BVI',
    title_en: 'Panama Papers: Belocopitt with 6 offshore entities in BVI',
    description_es: 'Claudio Belocopitt aparece como el argentino con más entidades en Panama Papers: KARIMA PORTFOLIO, RAGNAR PORTFOLIO, PENSFORD BUSINESS, ELYANNE BUSINESS, TIAGO GLOBAL, KARRI MANAGEMENT. Controla 76% de Swiss Medical y 40% de Grupo América.',
    description_en: 'Claudio Belocopitt appears as the Argentine with most Panama Papers entities: KARIMA PORTFOLIO, RAGNAR PORTFOLIO, PENSFORD BUSINESS, ELYANNE BUSINESS, TIAGO GLOBAL, KARRI MANAGEMENT. Controls 76% of Swiss Medical and 40% of Grupo América.',
    category: 'financial',
    sources: ['https://offshoreleaks.icij.org/nodes/12170966'],
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
    title_es: 'Causa Correo Argentino: cargos formalizados',
    title_en: 'Correo Argentino case: charges formalized',
    description_es:
      'El fiscal Zoni presenta cargos contra el presidente Macri y el ministro Aguad en relacion al acuerdo de la deuda del Correo Argentino. La causa judicial continua.',
    description_en:
      'Prosecutor Zoni files charges against President Macri and Minister Aguad in connection with the Correo Argentino debt settlement. The judicial case continues.',
    category: 'legal',
    sources: ['https://es.wikipedia.org/wiki/Causa_Correo_Argentino'],
  },
  {
    id: 'tl-2017-borinsky-olivos',
    date: '2017-2019',
    title_es: 'Borinsky: 15+ visitas a Olivos coincidiendo con fallos clave',
    title_en: 'Borinsky: 15+ Olivos visits coinciding with key rulings',
    description_es: 'El juez de Casación Mariano Borinsky visitó a Macri en Olivos más de 15 veces mientras presidía causas contra dirigentes kirchneristas (Nisman, Ruta del Dinero K, Dólar Futuro). Admitió que iba "a jugar al pádel".',
    description_en: 'Cassation judge Mariano Borinsky visited Macri at Olivos 15+ times while presiding over Kirchnerist cases (Nisman, Ruta del Dinero K, Dólar Futuro). Claimed he went "to play paddle tennis."',
    category: 'legal',
    sources: ['https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034'],
  },
  {
    id: 'tl-2017-hornos-rosada',
    date: '2017-2019',
    title_es: 'Hornos: 6+ reuniones con Macri en Casa Rosada mientras juzgaba causas K',
    title_en: 'Hornos: 6+ meetings with Macri at Casa Rosada while judging K cases',
    description_es: 'El juez de Casación Gustavo Hornos se reunió con Macri en Casa Rosada al menos 6 veces mientras presidía la cámara que resolvía causas contra dirigentes kirchneristas.',
    description_en: 'Cassation judge Gustavo Hornos met with Macri at Casa Rosada at least 6 times while presiding over the chamber that decided Kirchnerist cases.',
    category: 'legal',
    sources: ['https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034'],
  },
  {
    id: 'tl-2019-donations',
    date: '2019',
    title_es: 'Declaraciones de aportes de campana',
    title_en: 'Campaign donation filings',
    description_es:
      'Macri dona ARS 100.000 a Juntos por el Cambio; Maximo Kirchner dona ARS 50.000 a Frente de Todos. Se identifican 50 coincidencias politico-donante (0% falsos positivos). Se detecta la coincidencia contratista-donante de Rodriguez. Aluar dona ARS 5.400.000 distribuidos entre ambas coaliciones.',
    description_en:
      'Macri donates ARS 100,000 to Juntos por el Cambio; Maximo Kirchner donates ARS 50,000 to Frente de Todos. 50 politician-donor matches identified (0% false positives). Rodriguez contractor-donor pattern detected. Aluar donates ARS 5,400,000 distributed across both coalitions.',
    category: 'political',
    sources: ['https://aportantes.electoral.gob.ar'],
  },
  {
    id: 'tl-2020-denarvaez-walmart',
    date: '2020-11',
    title_es: 'De Narvaez adquiere Walmart Argentina',
    title_en: 'De Narvaez acquires Walmart Argentina',
    description_es:
      'Francisco De Narvaez completa la adquisicion de Walmart Argentina, rebautizada luego como Changomas. La operacion refuerza su presencia en el retail nacional. Sus cinco entidades offshore figuran en la base ICIJ.',
    description_en:
      'Francisco De Narvaez completes the acquisition of Walmart Argentina, later rebranded as Changomas. The operation reinforces his presence in national retail. His five offshore entities appear in the ICIJ database.',
    category: 'corporate',
    sources: ['https://offshoreleaks.icij.org'],
  },
  {
    id: 'tl-2024-ley-bases',
    date: '2024-06-12',
    title_es: 'Ley de Bases aprobada en Senado (36-36, desempate Villarruel)',
    title_en: 'Ley de Bases approved in Senate (36-36, Villarruel tiebreak)',
    description_es:
      'El Senado aprueba la Ley de Bases con un empate de 36 votos a 36. La vicepresidenta Victoria Villarruel desempata a favor. Varios senadores vinculados a intereses financieros votaron sobre articulos clave de la ley.',
    description_en:
      'The Senate approves the Ley de Bases with a 36-36 tie. Vice President Victoria Villarruel casts the deciding vote in favor. Several senators linked to financial interests voted on key articles of the law.',
    category: 'political',
    sources: ['https://www.senado.gob.ar'],
  },
  {
    id: 'tl-2024-kueider-detencion',
    date: '2024-12-04',
    title_es: 'Kueider detenido en la frontera de Paraguay con USD 211.000',
    title_en: 'Kueider detained at Paraguay border with USD 211,000',
    description_es:
      'El senador Edgardo Kueider es detenido en el paso fronterizo de Clorinda (Paraguay) con USD 211.000 en efectivo no declarados. El Senado lo expulsa por mayoria. Empresas BETAIL y EDEKOM aparecen en registros vinculados a su nombre.',
    description_en:
      'Senator Edgardo Kueider is detained at the Clorinda border crossing (Paraguay) with USD 211,000 in undeclared cash. The Senate expels him by majority vote. Companies BETAIL and EDEKOM appear in records linked to his name.',
    category: 'legal',
    sources: [
      'https://www.infobae.com/politica/2024/12/04/detuvieron-al-senador-edgardo-kueider-en-paraguay-llevaba-mas-de-usd-200-mil/',
    ],
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
  {
    id: 'tl-2025-kueider-arrestos',
    date: '2025-03',
    title_es: '7 asociados de Kueider detenidos',
    title_en: '7 Kueider associates arrested',
    description_es:
      'Siete personas del entorno del ex senador Kueider son detenidas en el marco de la causa iniciada tras su detencion en la frontera paraguaya con efectivo no declarado.',
    description_en:
      'Seven associates of former senator Kueider are detained as part of the case opened following his detention at the Paraguayan border with undeclared cash.',
    category: 'legal',
    sources: [
      'https://www.infobae.com/politica/2024/12/04/detuvieron-al-senador-edgardo-kueider-en-paraguay-llevaba-mas-de-usd-200-mil/',
    ],
  },
  {
    id: 'tl-2021-rosenkrantz-recusal',
    date: '2021',
    title_es: 'Rosenkrantz revierte recusación: comienza a fallar sobre ex clientes (Clarín, La Nación)',
    title_en: 'Rosenkrantz reverses recusal: begins ruling on former clients (Clarín, La Nación)',
    description_es: 'El presidente de la Corte Suprema Carlos Rosenkrantz, ex abogado de Clarín, La Nación, McDonald\'s, YPF y Repsol, revierte su política de recusación. Al menos 56 fallos involucrando antiguos clientes.',
    description_en: 'Supreme Court president Carlos Rosenkrantz, former lawyer for Clarín, La Nación, McDonald\'s, YPF and Repsol, reverses his recusal policy. At least 56 rulings involving former clients.',
    category: 'legal',
    sources: ['https://www.pagina12.com.ar/204884-rosenkrantz-una-larga-historia-de-conflictos'],
  },
  {
    id: 'tl-2021-decreto-823',
    date: '2021-12-01',
    title_es: 'Decreto 823/2021: monopolio de seguros estatales',
    title_en: 'Decree 823/2021: state insurance monopoly',
    description_es:
      'Alberto Fernández firma el Decreto 823/2021 que obliga a todo el sector público nacional a contratar seguros exclusivamente con Nación Seguros S.A. Crea el monopolio que será explotado por brokers cercanos al presidente.',
    description_en:
      'Alberto Fernández signs Decree 823/2021 mandating all national public sector entities to contract insurance exclusively through Nación Seguros S.A. Creates the monopoly that would be exploited by brokers close to the president.',
    category: 'financial',
    sources: ['https://www.argentina.gob.ar/normativa/nacional/decreto-823-2021-357558'],
  },
  {
    id: 'tl-2024-raids-seguros',
    date: '2024-04-01',
    title_es: '24 allanamientos en la Causa Seguros',
    title_en: '24 raids in the Causa Seguros investigation',
    description_es:
      'El juez Ercolini ordena 24 allanamientos simultáneos en el marco de la investigación sobre el escándalo de los seguros. El gobierno prohíbe todos los intermediarios en pólizas estatales.',
    description_en:
      'Judge Ercolini orders 24 simultaneous raids in the insurance scandal investigation. The government bans all intermediaries in state insurance policies.',
    category: 'legal',
    sources: ['https://www.infobae.com/politica/2024/04/11/tras-el-escandalo-de-los-seguros-el-gobierno-prohibio-a-los-intermediarios-en-todas-las-polizas-con-organismos-del-estado/'],
  },
  {
    id: 'tl-2024-decreto-747',
    date: '2024-08-21',
    title_es: 'Decreto 747/2024 revoca monopolio de seguros',
    title_en: 'Decree 747/2024 revokes insurance monopoly',
    description_es:
      'El gobierno de Milei deroga el Decreto 823/2021, eliminando la obligación de contratar con Nación Seguros. El gobierno no renueva el contrato con Nación Seguros (marzo 2024).',
    description_en:
      'The Milei government revokes Decree 823/2021, eliminating the mandatory contracting with Nación Seguros. The government does not renew the contract with Nación Seguros (March 2024).',
    category: 'political',
    sources: ['https://www.lanacion.com.ar/politica/el-gobierno-derogo-el-decreto-de-alberto-fernandez-que-obligaba-a-contratar-a-nacion-seguros-nid21082024/'],
  },
  {
    id: 'tl-2025-catalan-ypf',
    date: '2025-11-17',
    title_es: 'Catalán designado Director de YPF tras dejar Interior',
    title_en: 'Catalán appointed YPF Director after leaving Interior',
    description_es:
      'Lisandro Catalán deja el Ministerio del Interior el 3 de noviembre y es designado Director Clase D de YPF dos semanas después, con un salario de ~140 millones de pesos mensuales.',
    description_en:
      'Lisandro Catalán leaves the Ministry of Interior on November 3 and is appointed YPF Class D Director two weeks later, at a salary of ~140 million pesos/month.',
    category: 'corporate',
    sources: ['https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf'],
  },
  {
    id: 'tl-2022-lago-escondido',
    date: '2022-11',
    title_es: 'Escándalo Lago Escondido: jueces en avión de Clarín',
    title_en: 'Lago Escondido scandal: judges on Clarín-paid flight',
    description_es:
      'Se revela que el juez Ercolini y otros magistrados volaron en un avión pagado por el Grupo Clarín a la estancia Lago Escondido de Joe Lewis. Chats de Telegram filtrados muestran coordinación para fabricar coartadas.',
    description_en:
      'It is revealed that Judge Ercolini and other magistrates flew on a Grupo Clarín-paid flight to Joe Lewis\'s Lago Escondido estate. Leaked Telegram chats show coordination to fabricate alibis.',
    category: 'legal',
    sources: ['https://www.eldestapeweb.com/politica/los-jueces-de-clarin/clarin-invito-a-jueces-del-lawfare-a-lago-escondido-y-buscaron-encubrirlo-con-facturas-truchas-y-el-direccionamiento-de-una-causa-judicial-202212419450'],
  },
  {
    id: 'tl-2023-pami-16x',
    date: '2023',
    title_es: 'PAMI paga 16 veces el precio de mercado por medicamentos oncológicos',
    title_en: 'PAMI pays 16x market price for oncological drugs',
    description_es: 'PAMI pagó hasta 16 veces el precio de mercado (anastrozol: $13.192 vs $924 en licitación, ~14x). Cartel denunciado: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncología.',
    description_en: 'PAMI paid up to 16x market price (anastrozole: $13,192 vs $924 at tender, ~14x). Cartel complaint: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncología.',
    category: 'financial',
    sources: ['https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/'],
  },
  {
    id: 'tl-2024-seijas-ddjj',
    date: '2024',
    title_es: 'Juez Seijas declara ARS 1.750 millones siendo asesor ad honorem',
    title_en: 'Judge Seijas declares ARS 1.75B while serving as unpaid advisor',
    description_es: 'Alberto Seijas declaró ARS 1.750.832.137,66 en activos en su DDJJ 2024 mientras ejercía como asesor ad honorem (no remunerado) del Consejo de la Magistratura. Anomalía extrema de riqueza judicial.',
    description_en: 'Alberto Seijas declared ARS 1,750,832,137.66 in assets in his 2024 DDJJ while serving as ad honorem (unpaid) advisor to the Consejo de la Magistratura. Extreme judicial wealth anomaly.',
    category: 'legal',
    sources: ['https://datos.gob.ar'],
  },
  {
    id: 'tl-2025-side-explosion',
    date: '2025',
    title_es: 'Fondos reservados SIDE crecen ~2.000% bajo Milei',
    title_en: 'SIDE secret funds grow ~2,000% under Milei',
    description_es: 'Los fondos reservados de inteligencia crecieron de ARS 3.800M (4,1% del presupuesto en 2023) a ARS 13.400M (19,6% en 2025). Santiago Caputo controla la SIDE a través del designado Cristian Auguadra.',
    description_en: 'Intelligence reserved funds grew from ARS 3.8B (4.1% of budget in 2023) to ARS 13.4B (19.6% in 2025). Santiago Caputo controls SIDE through appointee Cristian Auguadra.',
    category: 'political',
    sources: ['https://chequeado.com/el-explicador/los-fondos-reservados-de-la-secretaria-de-inteligencia-el-gobierno-de-milei-los-amplio-por-tercera-vez/'],
  },
  {
    id: 'tl-2025-suizo-2678',
    date: '2025',
    title_es: 'Contratos Suizo Argentina crecen 2.678% con investigación por sobornos',
    title_en: 'Suizo Argentina contracts grow 2,678% with bribery investigation',
    description_es: 'Los contratos de Suizo Argentina crecieron de ARS 3.900M a ARS 108.300M (2.678%). Investigación por sobornos vinculada al escándalo Spagnuolo/ANDIS que implica a Karina Milei. Se encontró $240.000 en efectivo en allanamientos.',
    description_en: 'Suizo Argentina contracts grew from ARS 3.9B to ARS 108.3B (2,678%). Bribery investigation linked to Spagnuolo/ANDIS scandal implicating Karina Milei. $240K cash found in raids.',
    category: 'financial',
    sources: ['https://www.infobae.com'],
  },
  {
    id: 'tl-2025-lijo-decreto',
    date: '2025-02-14',
    title_es: 'Milei nombra a Lijo a Corte Suprema por decreto 137/2025',
    title_en: 'Milei appoints Lijo to Supreme Court by decree 137/2025',
    description_es:
      'El presidente Milei nombra al juez Ariel Lijo a la Corte Suprema por decreto 137/2025, eludiendo el rechazo del Senado (43 en contra, 27 a favor, 1 abstención). Lijo maneja la causa Correo Argentino y tiene 89 causas de corrupción con solo 14 elevadas a juicio.',
    description_en:
      'President Milei appoints Judge Ariel Lijo to the Supreme Court by decree 137/2025, bypassing Senate rejection (43 against, 27 for, 1 abstention). Lijo handles the Correo Argentino case and has 89 corruption cases with only 14 sent to trial.',
    category: 'political',
    sources: ['https://www.infobae.com/politica/2025/02/25/javier-milei-designo-por-decreto-en-la-corte-suprema-a-ariel-lijo-y-manuel-garcia-mansilla/'],
  },
  {
    id: 'tl-2025-acusatorio',
    date: '2025-08',
    title_es: 'Reforma acusatoria: poder pasa de jueces a fiscales',
    title_en: 'Accusatory reform: power shifts from judges to prosecutors',
    description_es:
      'Entra en vigencia la reforma del sistema acusatorio, transfiriendo el poder de investigación de los jueces federales a los fiscales. El cambio amenaza la concentración de poder en Comodoro Py.',
    description_en:
      'The accusatory system reform takes effect, transferring investigative power from federal judges to prosecutors. The change threatens the concentration of power at Comodoro Py.',
    category: 'legal',
    sources: ['https://www.argentina.gob.ar'],
  },
  {
    id: 'tl-2026-procesamiento-msosa',
    date: '2026-02-10',
    title_es: 'Procesamiento de empresa de Martínez Sosa',
    title_en: 'Prosecution of Martínez Sosa company',
    description_es:
      'La justicia procesa a Héctor Martínez Sosa y Compañía S.A. como partícipe necesario en negociaciones incompatibles. Embargo por $2.870.729.545,61.',
    description_en:
      'The court prosecutes Héctor Martínez Sosa y Compañía S.A. as necessary participant in dealings incompatible with public office. Embargo for $2.87B ARS.',
    category: 'legal',
    sources: ['https://www.infobae.com/judiciales/2026/02/10/causa-seguros-procesaron-a-la-empresa-de-hector-martinez-sosa-el-broker-amigo-de-alberto-fernandez/'],
  },
  {
    id: 'tl-2024-gold-london',
    date: '2024-07',
    title_es: 'BCRA envía 37 toneladas de oro a Londres secretamente',
    title_en: 'BCRA secretly ships 37 tonnes of gold to London',
    description_es:
      'El Banco Central envió secretamente aproximadamente 37 toneladas de oro (valuadas en más de USD 1.000M) a Londres. Se negó a ser auditado, alegó que no existen contratos y bloqueó a la AGN.',
    description_en:
      'The Central Bank secretly shipped approximately 37 tonnes of gold (valued at over USD 1B) to London. Refused audits, claimed no contracts exist, and blocked the AGN.',
    category: 'financial',
    sources: ['https://www.infobae.com'],
  },
  {
    id: 'tl-2025-libra-crash',
    date: '2025-02-14',
    title_es: 'Caso $LIBRA: Milei promueve cripto que colapsa 90%',
    title_en: '$LIBRA case: Milei promotes crypto that crashes 90%',
    description_es:
      'El presidente Milei promovió la criptomoneda $LIBRA que alcanzó USD 4.5B de capitalización antes de colapsar 90%. Insiders cobraron USD 107M. Se abrió investigación congresional.',
    description_en:
      'President Milei promoted the $LIBRA cryptocurrency which hit USD 4.5B market cap before crashing 90%. Insiders cashed out USD 107M. Congressional investigation opened.',
    category: 'financial',
    sources: ['https://www.infobae.com'],
  },
  {
    id: 'tl-2025-food-crisis',
    date: '2025-06',
    title_es: 'Crisis alimentaria: Capital Humano retiene 5.000 toneladas',
    title_en: 'Food crisis: Capital Humano withholds 5,000 tonnes',
    description_es:
      'El Ministerio de Capital Humano, bajo Sandra Pettovello, retiene 5.000 toneladas de alimentos mientras aumenta la inseguridad alimentaria en el país.',
    description_en:
      'The Ministry of Capital Humano, under Sandra Pettovello, withholds 5,000 tonnes of food while food insecurity rises across the country.',
    category: 'political',
    sources: ['https://www.infobae.com'],
  },
  {
    id: 'tl-2025-cuadernos-trial',
    date: '2025-11',
    title_es: 'Inicio juicio oral Causa Cuadernos (87 imputados)',
    title_en: 'Cuadernos oral trial begins (87 defendants)',
    description_es:
      'Comienza el juicio oral de la Causa Cuadernos con 87 imputados, una de las mayores causas de corrupción de la historia argentina.',
    description_en:
      'The oral trial of the Cuadernos case begins with 87 defendants, one of the largest corruption cases in Argentine history.',
    category: 'legal',
    sources: ['https://www.infobae.com'],
  },
  {
    id: 'tl-2025-dnu941',
    date: '2025-12',
    title_es: 'DNU 941/2025: SIDE obtiene poderes de vigilancia masiva',
    title_en: 'DNU 941/2025: SIDE granted mass surveillance powers',
    description_es:
      'El DNU 941/2025 otorga a la SIDE poderes de detención y vigilancia masiva sin orden judicial. Los fondos reservados de inteligencia crecieron ~2.000% bajo Milei.',
    description_en:
      'DNU 941/2025 grants SIDE detention and mass surveillance powers without judicial order. Intelligence reserved funds grew ~2,000% under Milei.',
    category: 'political',
    sources: ['https://chequeado.com'],
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
      'Aparece en 5 datasets: donante, director de empresa, officer societario, DDJJ y nombramiento de gobierno. Offshore documentada (Fleg Trading, Kagemusha), campanas financiadas por contratistas (documentado por Chequeado), presencia legislativa del 17,6%. Correo Argentino: quita del 98,82% de deuda familiar. AUSOL: venta de acciones con prima de ~394%.',
    description_en:
      'Appears across 5 datasets: donor, board member, company officer, DDJJ, and government appointment. Documented offshore (Fleg Trading, Kagemusha), contractor-funded campaigns (documented by Chequeado), 17.6% legislative presence. Correo Argentino: 98.82% family debt forgiveness. AUSOL: share sale at ~394% premium.',
    party: 'PRO',
    datasets: 5,
    status_es: 'Sobreseido por Fleg Trading; la causa Correo Argentino continua',
    status_en: 'Cleared on Fleg Trading; Correo Argentino case continues',
    source_url: 'https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/',
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
    source_url: 'https://offshoreleaks.icij.org/nodes/10158328',
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
    source_url: 'https://offshoreleaks.icij.org',
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
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-cordero',
    name: 'Maria Eugenia Cordero',
    role_es: 'Contratista estatal + Officer offshore',
    role_en: 'Government contractor + Offshore officer',
    description_es:
      'Contratista del Estado y officer de BETHAN INVESTMENTS LIMITED (offshore). Posible coincidencia entre fondos publicos y jurisdicciones opacas. Caso referido para investigacion bajo Ley 25.246.',
    description_en:
      'Government contractor and officer of BETHAN INVESTMENTS LIMITED (offshore). Possible overlap between public funds and opaque jurisdictions. Case referred for investigation under Ley 25.246.',
    party: '-',
    datasets: 2,
    status_es: 'Presunto — Referido a UIF',
    status_en: 'Alleged — Referred to UIF',
    source_url: 'https://offshoreleaks.icij.org',
  },
  {
    id: 'actor-rodriguez',
    name: 'Juan Pablo Rodriguez',
    role_es: 'Contratista estatal + Donante de campana',
    role_en: 'Government contractor + Campaign donor',
    description_es:
      '4 contratos estatales (2018-2020) y donante de campana. Coincidencia directa con la prohibicion de Ley 26.215 Art. 15.',
    description_en:
      '4 government contracts (2018-2020) and campaign donor. Direct coincidence with the prohibition in Ley 26.215 Art. 15.',
    party: '-',
    datasets: 2,
    status_es: 'Confirmado — Coincidencia con prohibicion legal',
    status_en: 'Confirmed — Coincidence with legal prohibition',
    source_url: 'https://datos.gob.ar',
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
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-macri-gianfranco',
    name: 'Gianfranco Macri',
    role_es: 'Cabeza operativa de SOCMA — 12 empresas, BF Corporation Panamá',
    role_en: 'Operational head of SOCMA — 12 companies, BF Corporation Panama',
    description_es:
      'Cabeza operativa del grupo SOCMA, 12 empresas vinculadas. Copropietario de BF Corporation (Panamá). Declaró ARS 622M a través del blanqueo 2016. Fondos transferidos a Safra Bank (Suiza). Denunciado penalmente por su hermano Mariano en 2024.',
    description_en:
      'Operational head of SOCMA group, 12 linked companies. Co-owner of BF Corporation (Panama). Declared ARS 622M through 2016 blanqueo. Funds transferred to Safra Bank (Switzerland). Criminally denounced by brother Mariano in 2024.',
    party: 'PRO',
    datasets: 3,
    status_es: 'Denunciado penalmente por hermano (2024)',
    status_en: 'Criminally denounced by brother (2024)',
    source_url: 'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml',
  },
  {
    id: 'actor-kueider',
    name: 'Kueider, Edgardo',
    role_es: 'Ex Senador Nacional — 2 datasets',
    role_en: 'Former National Senator — 2 datasets',
    description_es:
      'Detenido en el cruce fronterizo de Paraguay con USD 211.000 en efectivo no declarado. Expulsado del Senado. Figura en datasets GovernmentAppointment y CompanyOfficer (BETAIL, EDEKOM).',
    description_en:
      'Detained at the Paraguay border crossing with USD 211,000 in undeclared cash. Expelled from the Senate. Appears in GovernmentAppointment and CompanyOfficer datasets (BETAIL, EDEKOM).',
    party: 'Unidad Federal',
    datasets: 2,
    status_es: 'Expulsado del Senado; la causa judicial continua',
    status_en: 'Expelled from Senate; judicial case continues',
    source_url: 'https://www.infobae.com/politica/2024/12/04/detuvieron-al-senador-edgardo-kueider-en-paraguay-llevaba-mas-de-usd-200-mil/',
  },
  {
    id: 'actor-lousteau',
    name: 'Lousteau, Martin',
    role_es: 'Senador Nacional, UCR — 4 datasets',
    role_en: 'National Senator, UCR — 4 datasets',
    description_es:
      'LCG SA, consultora vinculada a su nombre, habria facturado al Congreso ARS 1.690.000 entre 2020 y 2022 durante su mandato. La causa judicial continua activa.',
    description_en:
      'LCG SA, a consultancy linked to his name, reportedly billed Congress ARS 1,690,000 between 2020 and 2022 during his term. The judicial case continues.',
    party: 'UCR',
    datasets: 4,
    status_es: 'La causa judicial continua',
    status_en: 'Judicial case continues',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-denarvaez',
    name: 'De Narvaez, Francisco',
    role_es: 'Empresario / Ex Diputado — 4 datasets',
    role_en: 'Businessman / Former Deputy — 4 datasets',
    description_es:
      'Figura en 5 entidades offshore (ICIJ): Titan Consulting, Retrato Partners y otras. Fortuna estimada en USD 920M. Adquirio Walmart Argentina en noviembre de 2020.',
    description_en:
      'Appears in 5 offshore entities (ICIJ): Titan Consulting, Retrato Partners and others. Fortune estimated at USD 920M. Acquired Walmart Argentina in November 2020.',
    party: '-',
    datasets: 4,
    status_es: 'Coincidencias ICIJ confirmadas',
    status_en: 'ICIJ matches confirmed',
    source_url: 'https://offshoreleaks.icij.org',
  },
  {
    id: 'actor-grindetti',
    name: 'Grindetti, Nestor',
    role_es: 'Ex Funcionario / Empresario — 3 datasets',
    role_en: 'Former Official / Businessman — 3 datasets',
    description_es:
      'Vinculado a Mercier International (Panama) y cuenta en Clariden Leu (Suiza). 9 causas tributarias en Brasil. Aparece en 3 datasets.',
    description_en:
      'Linked to Mercier International (Panama) and account at Clariden Leu (Switzerland). 9 tax cases in Brazil. Appears in 3 datasets.',
    party: 'PRO',
    datasets: 3,
    status_es: 'Causas tributarias en Brasil activas',
    status_en: 'Active tax cases in Brazil',
    source_url: 'https://offshoreleaks.icij.org',
  },
  {
    id: 'actor-heller',
    name: 'Heller, Carlos',
    role_es: 'Diputado Nacional, Frente de Todos — 3 datasets',
    role_en: 'National Deputy, Frente de Todos — 3 datasets',
    description_es:
      'Presidente de Banco Credicoop. Legislo sobre regulacion bancaria y financiera mientras ejercia como presidente de una entidad bancaria. Coincidencia confirmada entre rol legislativo e interes corporativo.',
    description_en:
      'President of Banco Credicoop. Legislated on banking and financial regulation while serving as president of a banking entity. Confirmed coincidence between legislative role and corporate interest.',
    party: 'Frente de Todos',
    datasets: 3,
    status_es: 'Conflicto de interes confirmado — sin causa penal',
    status_en: 'Confirmed conflict of interest — no criminal case',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-lijo',
    name: 'Lijo, Ariel Oscar',
    role_es: 'Poder Judicial — Corte Suprema (decreto) — 3 datasets',
    role_en: 'Judiciary — Supreme Court (by decree) — 3 datasets',
    description_es:
      'Nombrado a la Corte Suprema por decreto 137/2025, eludiendo rechazo del Senado (43 en contra, 27 a favor, 1 abstención). Maneja la causa Correo Argentino contra la familia Macri. 89 causas de corrupción con solo 14 elevadas a juicio. Vive en departamento de USD 2M no declarado en DDJJ.',
    description_en:
      'Appointed to the Supreme Court by decree 137/2025, bypassing Senate rejection (43 against, 27 for, 1 abstention). Handles the Correo Argentino case against the Macri family. 89 corruption cases with only 14 sent to trial. Lives in a USD 2M apartment not declared in sworn assets.',
    party: 'Poder Judicial',
    datasets: 3,
    status_es: 'Designación por decreto — conflictos documentados',
    status_en: 'Decree appointment — documented conflicts',
    source_url: 'https://www.infobae.com/politica/2025/02/25/javier-milei-designo-por-decreto-en-la-corte-suprema-a-ariel-lijo-y-manuel-garcia-mansilla/',
  },
  {
    id: 'actor-martinez-sosa',
    name: 'Héctor Martínez Sosa',
    role_es: 'Broker de seguros, asociado de Alberto Fernández',
    role_en: 'Insurance broker, Alberto Fernández associate',
    description_es:
      'Segundo broker por comisiones de Nación Seguros ($366M ARS). Esposo de María Cantero (secretaria de Fernández). Asesor de Fernández entre 2010-2019. Se reunía en Olivos sin registro. Empresa procesada y embargada por $2.870M ARS.',
    description_en:
      'Second broker by Nación Seguros commissions ($366M ARS). Husband of María Cantero (Fernández secretary). Fernández advisor 2010-2019. Met at Olivos without records. Company prosecuted and embargoed for $2.87B ARS.',
    party: 'Peronismo / FdT',
    datasets: 3,
    status_es: 'Procesado — Causa Seguros activa',
    status_en: 'Prosecuted — Causa Seguros active',
    source_url: 'https://www.infobae.com/judiciales/2026/02/10/causa-seguros-procesaron-a-la-empresa-de-hector-martinez-sosa-el-broker-amigo-de-alberto-fernandez/',
  },
  {
    id: 'actor-plate',
    name: 'Guillermo Pedro Plate',
    role_es: 'Superintendente de Seguros — ex VP Provincia ART',
    role_en: 'Insurance Superintendent — former VP Provincia ART',
    description_es:
      'Pasó de VP de Provincia ART y asesor del Banco Provincia a Superintendente de Seguros, regulando el mercado donde fue ejecutivo. Protege selectivamente a Liderar Seguros y Libra Seguros. Su ex-jefe Juan Pazo (ARCA) rompió relación por el "pacto con Liderar".',
    description_en:
      'Went from VP of Provincia ART and Banco Provincia board advisor to Insurance Superintendent, regulating the market where he was executive. Selectively shields Liderar and Libra Seguros. Former boss Juan Pazo (ARCA) broke relationship over "Liderar pact".',
    party: 'PRO / LLA',
    datasets: 4,
    status_es: 'Puerta giratoria — conflicto de interés documentado',
    status_en: 'Revolving door — documented conflict of interest',
    source_url: 'https://www.letrap.com.ar/politica/como-funciona-el-blindaje-oficial-las-aseguradoras-protegidas-el-gobierno-n5416266',
  },
  {
    id: 'actor-catalan',
    name: 'Lisandro Catalán',
    role_es: 'Ex Ministro Interior → Director YPF',
    role_en: 'Former Interior Minister → YPF Director',
    description_es:
      'Dejó el Ministerio del Interior el 3/11/2025 y fue designado Director de YPF dos semanas después (~$140M/mes). Previamente presidente de Bapro Mandatos (escándalo fideicomisos "Estrella del Sur"), officer en Provincia Bursátil, Provincia Seguros y Grupo Bapro (2007-2015).',
    description_en:
      'Left Interior Ministry on 3/11/2025 and was appointed YPF Director two weeks later (~$140M/month). Previously president of Bapro Mandatos (housing trust scandal "Estrella del Sur"), officer at Provincia Bursátil, Provincia Seguros and Grupo Bapro (2007-2015).',
    party: 'PRO / LLA',
    datasets: 5,
    status_es: 'Puerta giratoria — sin causa penal',
    status_en: 'Revolving door — no criminal case',
    source_url: 'https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf',
  },
  {
    id: 'actor-frigerio',
    name: 'Rogelio Frigerio',
    role_es: 'Gobernador Entre Ríos — ex Ministro Interior',
    role_en: 'Governor of Entre Ríos — former Interior Minister',
    description_es:
      'Dinastia político-empresarial. Denunciado por la OA por invertir USD 776.000 en tierras fiscales que transfirió como titular de AABE (sobreseído 2022). Padre Octavio fue director de YPF mientras Rogelio era Ministro. Esposa designada en Desarrollo Social. Banco Ciudad: préstamo irregular a Lethe ($35M, 1500% de patrimonio).',
    description_en:
      'Political-business dynasty. Denounced by Anti-Corruption Office for investing USD 776K in fiscal lands he transferred as AABE head (cleared 2022). Father Octavio was YPF director while Rogelio was Minister. Wife appointed at Social Development. Banco Ciudad: irregular loan to Lethe ($35M, 1500% of equity).',
    party: 'PRO',
    datasets: 4,
    status_es: 'Sobreseído OA (2022); Causa Correo vinculada',
    status_en: 'Cleared by OA (2022); linked to Correo case',
    source_url: 'https://www.infobae.com/politica/2022/04/25/pidieron-citar-a-indagatoria-a-rogelio-frigerio-por-irregularidades-en-operaciones-inmobiliarias/',
  },
  {
    id: 'actor-cuneo-libarona',
    name: 'Mariano Cúneo Libarona',
    role_es: 'Ministro de Justicia — ex director legal Libra Seguros',
    role_en: 'Justice Minister — former legal director Libra Seguros',
    description_es:
      'Ministro de Justicia del gobierno de Milei. Fue director legal de Libra Seguros antes de asumir. Medios reportan "doble blindaje" para Libra: el Superintendente Plate la protege y el Ministro de Justicia que debería investigarla es su ex-abogado.',
    description_en:
      'Justice Minister in the Milei government. Was legal director of Libra Seguros before taking office. Media reports "double shielding" for Libra: Superintendent Plate protects it and the Justice Minister who should investigate is its former lawyer.',
    party: 'La Libertad Avanza',
    datasets: 3,
    status_es: 'Conflicto de interés — "doble blindaje"',
    status_en: 'Conflict of interest — "double shielding"',
    source_url: 'https://www.letrap.com.ar/politica/como-funciona-el-blindaje-oficial-las-aseguradoras-protegidas-el-gobierno-n5416266',
  },
  {
    id: 'actor-ercolini',
    name: 'Ercolini, Julián Daniel',
    role_es: 'Poder Judicial — Juez Federal Comodoro Py — 3 datasets',
    role_en: 'Judiciary — Federal Judge Comodoro Py — 3 datasets',
    description_es:
      'Voló en avión pagado por Clarín a Lago Escondido (estancia de Joe Lewis) junto a otros jueces, funcionarios macristas y agentes de inteligencia. Sobreyó a Frigerio en el caso Koolhaas. Chats de Telegram filtrados muestran coordinación para fabricar coartadas. Ordenó 24 allanamientos en la Causa Seguros.',
    description_en:
      'Flew on a Clarín-paid flight to Lago Escondido (Joe Lewis\'s estate) with other judges, Macri officials and intelligence agents. Cleared Frigerio in the Koolhaas case. Leaked Telegram chats show coordination to fabricate alibis. Ordered 24 raids in the Causa Seguros.',
    party: 'Poder Judicial',
    datasets: 3,
    status_es: 'Conflictos documentados — Lago Escondido',
    status_en: 'Documented conflicts — Lago Escondido',
    source_url: 'https://www.eldestapeweb.com/politica/los-jueces-de-clarin/clarin-invito-a-jueces-del-lawfare-a-lago-escondido-y-buscaron-encubrirlo-con-facturas-truchas-y-el-direccionamiento-de-una-causa-judicial-202212419450',
  },
  {
    id: 'actor-rosenkrantz',
    name: 'Rosenkrantz, Carlos',
    role_es: 'Corte Suprema — Presidente — 2 datasets',
    role_en: 'Supreme Court — President — 2 datasets',
    description_es:
      'Presidente de la Corte Suprema. Fue abogado de Clarín, La Nación, McDonald\'s, YPF y Repsol. En 2021 revirtió su política de recusación y comenzó a fallar en casos de ex clientes: al menos 56 fallos involucrando antiguos clientes.',
    description_en:
      'Supreme Court president. Was lawyer for Clarín, La Nación, McDonald\'s, YPF and Repsol. In 2021 reversed his recusal policy and began ruling on former clients\' cases: at least 56 rulings involving former clients.',
    party: 'Corte Suprema',
    datasets: 2,
    status_es: 'Conflicto de interés — 56 fallos con ex clientes',
    status_en: 'Conflict of interest — 56 rulings on former clients',
    source_url: 'https://www.pagina12.com.ar/204884-rosenkrantz-una-larga-historia-de-conflictos',
  },
  {
    id: 'actor-hornos-borinsky',
    name: 'Hornos, Gustavo / Borinsky, Mariano',
    role_es: 'Casación Penal — 2 datasets',
    role_en: 'Criminal Cassation Court — 2 datasets',
    description_es:
      'Visitaron a Macri en Olivos y Casa Rosada (6+ y 15+ veces respectivamente) mientras presidían causas contra dirigentes kirchneristas. Borinsky admitió que iba "a jugar al pádel". Las visitas coinciden con momentos clave de las causas.',
    description_en:
      'Visited Macri at Olivos and Casa Rosada (6+ and 15+ times respectively) while presiding over cases against Kirchnerist leaders. Borinsky claimed he went "to play paddle tennis". Visits coincide with key moments in the cases.',
    party: 'Casación',
    datasets: 2,
    status_es: 'Visitas a Olivos documentadas — conflicto de interés',
    status_en: 'Olivos visits documented — conflict of interest',
    source_url: 'https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034',
  },
  {
    id: 'actor-seijas',
    name: 'Seijas, Alberto',
    role_es: 'Poder Judicial — Asesor ad honorem — 1 dataset',
    role_en: 'Judiciary — Ad honorem advisor — 1 dataset',
    description_es:
      'Declaró ARS 1.750 millones en activos en 2024 siendo asesor ad honorem (no remunerado). La anomalía patrimonial fue detectada en el cruce de datos DDJJ.',
    description_en:
      'Declared ARS 1.75 billion in assets in 2024 as an ad honorem (unpaid) advisor. The wealth anomaly was detected in the DDJJ cross-dataset analysis.',
    party: 'Poder Judicial',
    datasets: 1,
    status_es: 'Anomalía patrimonial — ARS 1.75B declarados',
    status_en: 'Wealth anomaly — ARS 1.75B declared',
    source_url: 'https://datos.gob.ar',
  },
  // --- Milei-era key actors ---
  {
    id: 'actor-belocopitt',
    name: 'Belocopitt, Claudio',
    role_es: 'Empresario — Swiss Medical + Grupo América — 6 offshore',
    role_en: 'Businessman — Swiss Medical + Grupo America — 6 offshore',
    description_es:
      'Posee 76% de Swiss Medical y 40% de Grupo América (América TV, A24, La Red). Tiene 6 entidades offshore en BVI (Panama Papers). Red de 53 empresas. Cobró USD 13M en ayuda COVID estatal siendo top-50 más ricos.',
    description_en:
      'Owns 76% of Swiss Medical and 40% of Grupo America (America TV, A24, La Red). Has 6 BVI offshore entities (Panama Papers). 53-company network. Collected USD 13M COVID state aid while being top-50 richest.',
    party: 'Independiente',
    datasets: 3,
    status_es: 'Offshore confirmado (ICIJ) — Conflicto salud-medios',
    status_en: 'Offshore confirmed (ICIJ) — Health-media conflict',
    source_url: 'https://offshoreleaks.icij.org/nodes/12170966',
  },
  {
    id: 'actor-caputo-santiago',
    name: 'Caputo, Santiago',
    role_es: 'Asesor presidencial — Controlador SIDE — sin cargo formal',
    role_en: 'Presidential advisor — SIDE controller — no formal role',
    description_es:
      'Sobrino segundo de Luis "Toto" Caputo (Ministro de Economía). Controla la SIDE a través del designado Cristian Auguadra sin ser funcionario público. Los fondos reservados de inteligencia crecieron ~2.000% bajo su gestión.',
    description_en:
      'Second cousin of Luis "Toto" Caputo (Economy Minister). Controls SIDE through appointee Cristian Auguadra without being a public official. Intelligence reserved funds grew ~2,000% under his management.',
    party: 'La Libertad Avanza',
    datasets: 1,
    status_es: 'Control SIDE documentado — sin cargo público formal',
    status_en: 'SIDE control documented — no formal public role',
    source_url: 'https://www.perfil.com/noticias/politica/quien-es-quien-en-el-clan-caputo-una-familia-siempre-vinculada-a-la-politica-y-el-poder.phtml',
  },
  {
    id: 'actor-pettovello',
    name: 'Pettovello, Sandra',
    role_es: 'Ministra de Capital Humano — ARS 8.3B sin rendir',
    role_en: 'Minister of Capital Humano — ARS 8.3B unaccounted',
    description_es:
      'Ministra de Capital Humano bajo Milei. Retuvo 5.000 toneladas de alimentos durante crisis alimentaria. ARS 8.300 millones en gastos sin rendición de cuentas.',
    description_en:
      'Minister of Capital Humano under Milei. Withheld 5,000 tonnes of food during food crisis. ARS 8.3 billion in unaccounted spending.',
    party: 'La Libertad Avanza',
    datasets: 1,
    status_es: 'Investigación activa — retención de alimentos',
    status_en: 'Active investigation — food withholding',
    source_url: 'https://www.infobae.com/politica/2024/02/16/cartelizacion-y-sobreprecios-que-revelo-una-auditoria-de-capital-humano-sobre-la-compra-de-alimentos-para-los-comedores/',
  },
  // --- Missing critical persons ---
  {
    id: 'actor-fernandez-alberto',
    name: 'Alberto Fernández',
    role_es: 'Expresidente — firmó Decreto 823/2021 (monopolio seguros)',
    role_en: 'Former President — signed Decree 823/2021 (insurance monopoly)',
    description_es:
      'Firmó el decreto que obligó al Estado a contratar con Nación Seguros, creando el monopolio explotado por su amigo broker Martínez Sosa ($366M en comisiones). Procesado en Causa Seguros.',
    description_en:
      'Signed the decree mandating state contracting with Nación Seguros, creating the monopoly exploited by his broker friend Martínez Sosa ($366M in commissions). Prosecuted in Causa Seguros.',
    party: 'Frente de Todos',
    datasets: 3,
    status_es: 'Procesado — Causa Seguros activa',
    status_en: 'Prosecuted — Causa Seguros active',
    source_url: 'https://noticiasargentinas.com/politica/investigacion-sobre-seguros--alberto-fernandez-debera-explicar-el-decreto-823-2021-que-dio-millones-del-estado-a-sus-amigo-brokers_a6729edb7955e3f568c0df2a2',
  },
  {
    id: 'actor-macri-francisco',
    name: 'Francisco Macri',
    role_es: 'Patriarca Macri — fundador SOCMA — 17 empresas',
    role_en: 'Macri patriarch — SOCMA founder — 17 companies',
    description_es:
      'Fundador de SOCMA y patriarca del clan Macri. Red de 17 empresas. Base del emporio familiar que incluye Correo Argentino, IECSA, SIDECO y múltiples offshore. Pilar del esquema empresarial que se entrelaza con el poder político.',
    description_en:
      'Founder of SOCMA and patriarch of the Macri clan. Network of 17 companies. Foundation of the family empire including Correo Argentino, IECSA, SIDECO and multiple offshore entities. Pillar of the business structure intertwined with political power.',
    party: 'PRO',
    datasets: 4,
    status_es: 'Red empresarial documentada — 17 empresas',
    status_en: 'Business network documented — 17 companies',
    source_url: 'https://es.wikipedia.org/wiki/Franco_Macri',
  },
  {
    id: 'actor-macri-jorge',
    name: 'Jorge Macri',
    role_es: 'Jefe de Gobierno CABA — 4 empresas',
    role_en: 'Head of Government CABA — 4 companies',
    description_es:
      'Jefe de Gobierno de la Ciudad de Buenos Aires. Vinculado a 4 empresas. Absolución por lavado de dinero revocada en febrero de 2026. Primo de Mauricio Macri.',
    description_en:
      'Head of Government of Buenos Aires City. Linked to 4 companies. Money laundering acquittal revoked in February 2026. Cousin of Mauricio Macri.',
    party: 'PRO',
    datasets: 3,
    status_es: 'Absolución por lavado revocada (Feb 2026)',
    status_en: 'Money laundering acquittal revoked (Feb 2026)',
    source_url: 'https://www.infobae.com/judiciales/2026/02/26/la-corte-suprema-dejo-sin-efecto-el-sobreseimiento-de-jorge-macri-en-una-causa-por-presunto-lavado-de-dinero/',
  },
  {
    id: 'actor-caputo-luis',
    name: 'Luis Andrés Caputo',
    role_es: 'Ministro de Economía — 13 empresas (Anker), primo de Nicky',
    role_en: 'Economy Minister — 13 companies (Anker), Nicky\'s first cousin',
    description_es:
      'Ministro de Economía bajo Milei. Red de 13 empresas vinculadas incluyendo Anker Latinoamérica. Primo hermano de Nicolás Caputo (empresario PRO). Previamente presidente del BCRA y Ministro de Finanzas bajo Macri.',
    description_en:
      'Economy Minister under Milei. Network of 13 linked companies including Anker Latinoamérica. First cousin of Nicolás Caputo (PRO businessman). Previously BCRA president and Finance Minister under Macri.',
    party: 'La Libertad Avanza',
    datasets: 4,
    status_es: 'Conflicto de interés — 13 empresas vinculadas',
    status_en: 'Conflict of interest — 13 linked companies',
    source_url: 'https://www.perfil.com/noticias/politica/quien-es-quien-en-el-clan-caputo-una-familia-siempre-vinculada-a-la-politica-y-el-poder.phtml',
  },
  {
    id: 'actor-caputo-nicolas',
    name: 'Nicolás Caputo',
    role_es: 'Empresario — íntimo de Macri, fundador PENSAR — 13 empresas',
    role_en: 'Businessman — Macri intimate, PENSAR founder — 13 companies',
    description_es:
      'Amigo íntimo de Mauricio Macri y fundador de la Fundación PENSAR (think tank PRO). Red de 13 empresas. Beneficiario de contratos estatales durante la presidencia de Macri. Primo de Luis "Toto" Caputo.',
    description_en:
      'Intimate friend of Mauricio Macri and founder of Fundación PENSAR (PRO think tank). Network of 13 companies. Beneficiary of state contracts during Macri\'s presidency. Cousin of Luis "Toto" Caputo.',
    party: 'PRO',
    datasets: 4,
    status_es: 'Contratos estatales documentados — red de 13 empresas',
    status_en: 'State contracts documented — 13-company network',
    source_url: 'https://www.perfil.com/noticias/politica/quien-es-quien-en-el-clan-caputo-una-familia-siempre-vinculada-a-la-politica-y-el-poder.phtml',
  },
  {
    id: 'actor-mindlin',
    name: 'Marcos Mindlin',
    role_es: 'CEO Pampa Energía — 52 empresas, monopolio eléctrico Buenos Aires',
    role_en: 'CEO Pampa Energía — 52 companies, Buenos Aires electricity monopoly',
    description_es:
      'Controla Pampa Energía con red de 52 empresas. CITELEC-EDELAP con 81 officers compartidos. Monopolio eléctrico de la Provincia de Buenos Aires. Nexo entre sector energético y poder político.',
    description_en:
      'Controls Pampa Energía with a 52-company network. CITELEC-EDELAP with 81 shared officers. Buenos Aires Province electricity monopoly. Nexus between energy sector and political power.',
    party: '-',
    datasets: 3,
    status_es: 'Monopolio eléctrico documentado — 81 officers compartidos',
    status_en: 'Electricity monopoly documented — 81 shared officers',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-werthein',
    name: 'Darío Werthein',
    role_es: 'Imperio asegurador — 29 empresas, Caja de Seguros',
    role_en: 'Insurance empire — 29 companies, Caja de Seguros',
    description_es:
      'Cabeza del imperio asegurador Werthein. Red de 29 empresas. Caja de Seguros con 32 officers compartidos. Concentración de mercado en seguros y finanzas.',
    description_en:
      'Head of the Werthein insurance empire. Network of 29 companies. Caja de Seguros with 32 shared officers. Market concentration in insurance and finance.',
    party: '-',
    datasets: 3,
    status_es: 'Concentración de mercado documentada — 32 officers compartidos',
    status_en: 'Market concentration documented — 32 shared officers',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-herrera-de-noble',
    name: 'Ernestina Herrera de Noble',
    role_es: 'Fundadora/controladora Grupo Clarín',
    role_en: 'Clarín Group founder/controller',
    description_es:
      'Fundadora y controladora del Grupo Clarín, el mayor conglomerado mediático de Argentina. Influencia documentada sobre poder judicial (vuelos a Lago Escondido, financiamiento de viajes de jueces). Vínculo directo con casos de captura mediática del poder judicial.',
    description_en:
      'Founder and controller of Grupo Clarín, Argentina\'s largest media conglomerate. Documented influence over the judiciary (Lago Escondido flights, financing judges\' trips). Direct link to cases of judicial media capture.',
    party: '-',
    datasets: 2,
    status_es: 'Influencia mediática documentada sobre poder judicial',
    status_en: 'Documented media influence over judiciary',
    source_url: 'https://es.wikipedia.org/wiki/Ernestina_Herrera_de_Noble',
  },
  {
    id: 'actor-davis',
    name: 'Hayden Davis',
    role_es: 'Kelsier Ventures — $LIBRA cashout de $107M',
    role_en: 'Kelsier Ventures — $LIBRA $107M insider cashout',
    description_es:
      'Fundador de Kelsier Ventures. Organizador del token $LIBRA promovido por Milei. Cashout insider de $107M USD. Investigación penal activa en Argentina.',
    description_en:
      'Founder of Kelsier Ventures. Organizer of $LIBRA token promoted by Milei. $107M USD insider cashout. Active criminal investigation in Argentina.',
    party: '-',
    datasets: 2,
    status_es: 'Investigación penal activa — $107M cashout',
    status_en: 'Active criminal investigation — $107M cashout',
    source_url: 'https://www.infobae.com/politica/2025/02/16/la-fallida-cripto-libra-provoco-un-fuerte-impacto-politico-y-el-gobierno-enfrenta-una-ofensiva-opositora/',
  },
  {
    id: 'actor-hornos',
    name: 'Gustavo Hornos',
    role_es: 'Juez de Casación Penal — 6+ reuniones en Casa Rosada con Macri',
    role_en: 'Criminal Cassation judge — 6+ meetings at Casa Rosada with Macri',
    description_es:
      'Juez de la Cámara Federal de Casación Penal. Se reunió con Macri en Olivos y Casa Rosada al menos 6 veces mientras presidía causas contra dirigentes kirchneristas. Visitas coinciden con momentos clave de las causas.',
    description_en:
      'Judge of the Federal Criminal Cassation Court. Met with Macri at Olivos and Casa Rosada at least 6 times while presiding over cases against Kirchnerist leaders. Visits coincide with key moments in the cases.',
    party: 'Poder Judicial',
    datasets: 2,
    status_es: 'Visitas a Casa Rosada documentadas — conflicto de interés',
    status_en: 'Casa Rosada visits documented — conflict of interest',
    source_url: 'https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034',
  },
  {
    id: 'actor-borinsky',
    name: 'Mariano Borinsky',
    role_es: 'Juez de Casación Penal — 15+ visitas a Olivos',
    role_en: 'Criminal Cassation judge — 15+ Olivos visits',
    description_es:
      'Juez de la Cámara Federal de Casación Penal. Visitó a Macri en Olivos al menos 15 veces mientras presidía causas contra dirigentes kirchneristas. Admitió que iba "a jugar al pádel". Las visitas coinciden con momentos clave de las causas.',
    description_en:
      'Judge of the Federal Criminal Cassation Court. Visited Macri at Olivos at least 15 times while presiding over cases against Kirchnerist leaders. Claimed he went "to play paddle tennis". Visits coincide with key moments in the cases.',
    party: 'Poder Judicial',
    datasets: 2,
    status_es: 'Visitas a Olivos documentadas — conflicto de interés',
    status_en: 'Olivos visits documented — conflict of interest',
    source_url: 'https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034',
  },
  // --- Missing high-severity persons ---
  {
    id: 'actor-kirchner-maximo',
    name: 'Máximo Kirchner',
    role_es: 'Diputado Nacional — $8.31B declarados, Los Sauces/Hotesur',
    role_en: 'National Deputy — $8.31B declared, Los Sauces/Hotesur',
    description_es:
      'Diputado Nacional y líder de La Cámpora. Patrimonio declarado de $8.310 millones ARS. Vinculado a las causas Los Sauces y Hotesur por presunto lavado de dinero a través de alquileres ficticios.',
    description_en:
      'National Deputy and La Cámpora leader. Declared wealth of ARS $8.31 billion. Linked to Los Sauces and Hotesur cases for alleged money laundering through fictitious rentals.',
    party: 'Unión por la Patria',
    datasets: 3,
    status_es: 'Causas Los Sauces/Hotesur — vinculado',
    status_en: 'Los Sauces/Hotesur cases — linked',
    source_url: 'https://www.lanacion.com.ar/politica/el-patrimonio-de-maximo-kirchner-crecio-un-75-por-la-revaluacion-de-sus-inmuebles-y-acciones-nid23072025/',
  },
  {
    id: 'actor-sturzenegger',
    name: 'Federico Sturzenegger',
    role_es: 'Ministro de Desregulación — $2.37B, crecimiento 45x, miembro PENSAR',
    role_en: 'Deregulation Minister — $2.37B, 45x growth, PENSAR member',
    description_es:
      'Ministro de Desregulación y Transformación del Estado bajo Milei. Patrimonio declarado de $2.370 millones ARS con crecimiento de 45x. Miembro de la Fundación PENSAR (think tank PRO). Ex presidente del BCRA bajo Macri.',
    description_en:
      'Deregulation and State Transformation Minister under Milei. Declared wealth of ARS $2.37 billion with 45x growth. PENSAR Foundation member (PRO think tank). Former BCRA president under Macri.',
    party: 'La Libertad Avanza',
    datasets: 3,
    status_es: 'Crecimiento patrimonial anómalo — 45x',
    status_en: 'Anomalous wealth growth — 45x',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-closs',
    name: 'Maurice Closs',
    role_es: 'Senador Nacional — $8.82B declarados, crecimiento 367x',
    role_en: 'National Senator — $8.82B declared, 367x growth',
    description_es:
      'Senador Nacional por Misiones. Patrimonio declarado de $8.820 millones ARS con crecimiento de 367x. Una de las mayores anomalías patrimoniales detectadas en el cruce de DDJJ.',
    description_en:
      'National Senator for Misiones. Declared wealth of ARS $8.82 billion with 367x growth. One of the largest wealth anomalies detected in the DDJJ cross-reference.',
    party: 'Frente Nacional y Popular',
    datasets: 2,
    status_es: 'Anomalía patrimonial — crecimiento 367x',
    status_en: 'Wealth anomaly — 367x growth',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-carrizo',
    name: 'Ana Carla Carrizo',
    role_es: 'Diputada Nacional — $7.07B, crecimiento 1577x',
    role_en: 'National Deputy — $7.07B, 1577x growth',
    description_es:
      'Diputada Nacional. Patrimonio declarado de $7.070 millones ARS con crecimiento de 1577x. La mayor anomalía patrimonial porcentual detectada entre legisladores.',
    description_en:
      'National Deputy. Declared wealth of ARS $7.07 billion with 1577x growth. The largest percentage wealth anomaly detected among legislators.',
    party: 'Democracia para Siempre',
    datasets: 2,
    status_es: 'Anomalía patrimonial — crecimiento 1577x',
    status_en: 'Wealth anomaly — 1577x growth',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'actor-casanello',
    name: 'Sebastián Casanello',
    role_es: 'Juez Federal — a cargo de la Causa Seguros',
    role_en: 'Federal Judge — prosecuting Causa Seguros',
    description_es:
      'Juez Federal a cargo de la Causa Seguros contra Alberto Fernández y Martínez Sosa. Ordenó procesamientos y embargos en la causa por el monopolio de seguros estatales.',
    description_en:
      'Federal Judge handling the Causa Seguros against Alberto Fernández and Martínez Sosa. Ordered prosecutions and asset freezes in the state insurance monopoly case.',
    party: 'Poder Judicial',
    datasets: 2,
    status_es: 'A cargo de Causa Seguros',
    status_en: 'Handling Causa Seguros',
    source_url: 'https://www.infobae.com/judiciales/2026/02/10/causa-seguros-procesaron-a-la-empresa-de-hector-martinez-sosa-el-broker-amigo-de-alberto-fernandez/',
  },
  {
    id: 'actor-francos',
    name: 'Guillermo Francos',
    role_es: 'Ex Jefe de Gabinete — Director YPF',
    role_en: 'Former Chief of Staff — YPF Director',
    description_es:
      'Ex Jefe de Gabinete bajo Milei. Designado Director de YPF tras dejar el cargo. Puerta giratoria entre gobierno y empresa estatal energética.',
    description_en:
      'Former Chief of Staff under Milei. Appointed YPF Director after leaving office. Revolving door between government and state energy company.',
    party: 'La Libertad Avanza',
    datasets: 2,
    status_es: 'Puerta giratoria — gobierno a YPF',
    status_en: 'Revolving door — government to YPF',
    source_url: 'https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf',
  },
  {
    id: 'actor-auguadra',
    name: 'Cristian Auguadra',
    role_es: 'Jefe de la SIDE — proxy de Santiago Caputo',
    role_en: 'SIDE head — Santiago Caputo proxy',
    description_es:
      'Designado jefe de la SIDE (inteligencia). Actúa como proxy de Santiago Caputo. Los fondos reservados de inteligencia crecieron ~2.000% bajo su gestión. Sin experiencia previa en inteligencia.',
    description_en:
      'Appointed SIDE (intelligence) head. Acts as proxy for Santiago Caputo. Intelligence reserved funds grew ~2,000% under his management. No prior intelligence experience.',
    party: 'La Libertad Avanza',
    datasets: 1,
    status_es: 'Fondos reservados +2838% — proxy documentado',
    status_en: 'Reserved funds +2838% — documented proxy',
    source_url: 'https://chequeado.com/el-explicador/los-fondos-reservados-de-la-secretaria-de-inteligencia-el-gobierno-de-milei-los-amplio-por-tercera-vez/',
  },
  {
    id: 'actor-scatturice',
    name: 'Leonardo Scatturice',
    role_es: 'Asociado de Caputo — comprador de Flybondi',
    role_en: 'Caputo associate — Flybondi buyer',
    description_es:
      'Asociado de los Caputo. Compró Flybondi (aerolínea low-cost) con posible beneficio de desregulación aérea impulsada por el gobierno de Milei.',
    description_en:
      'Caputo associate. Bought Flybondi (low-cost airline) with possible benefit from airline deregulation pushed by the Milei government.',
    party: '-',
    datasets: 2,
    status_es: 'Vínculo Caputo-desregulación documentado',
    status_en: 'Caputo-deregulation link documented',
    source_url: 'https://noticias.perfil.com/noticias/politica/caputocracia-los-negocios-de-luis-nicky-y-santiago-en-el-poder.phtml',
  },
  {
    id: 'actor-rubinstein',
    name: 'Adolfo Rubinstein',
    role_es: 'Ex Secretario de Salud — aumentos post-licitación del 40%',
    role_en: 'Former Health Secretary — 40% post-bid increases',
    description_es:
      'Ex Secretario de Salud. Autorizó aumentos del 40% en contratos de salud después de las licitaciones, beneficiando a proveedores seleccionados. Patrón sistemático de sobrecostos.',
    description_en:
      'Former Health Secretary. Authorized 40% increases in health contracts after bidding, benefiting selected providers. Systematic pattern of cost overruns.',
    party: '-',
    datasets: 2,
    status_es: 'Sobrecostos post-licitación documentados — 40%',
    status_en: 'Post-bid cost overruns documented — 40%',
    source_url: 'https://www.tiempoar.com.ar/ta_article/denuncian-a-rubinstein-por-contrataciones-irregulares-por-1400-millones-de-pesos/amp/',
  },
] as const

// ---------------------------------------------------------------------------
// Money Flows
// ---------------------------------------------------------------------------

export const MONEY_FLOWS: readonly MoneyFlow[] = [
  {
    id: 'flow-nacion-seguros-total',
    from_label: 'Estado Nacional (20+ organismos)',
    to_label: 'Nación Seguros S.A.',
    amount_ars: 28_500_000_000,
    description_es:
      'Total estimado de contratos directos (sin licitación) entre el Estado y Nación Seguros bajo el Decreto 823/2021. TODOS los 20 contratos principales son Contratación Directa. Cada ministerio tiene contrato directo. Monto exacto no verificable en fuente primaria única; estimación basada en datos de contrataciones + comisiones de brokers.',
    description_en:
      'Estimated total of direct contracts (no tender) between the State and Nación Seguros under Decree 823/2021. ALL top 20 contracts are Direct Contracting. Every ministry has a direct contract. Exact amount not verifiable from a single primary source; estimate based on procurement data + broker commissions.',
    date: '2020-2024',
    source: 'Datos.gob.ar / Infobae',
    source_url: 'https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas',
  },
  {
    id: 'flow-brokers-commissions',
    from_label: 'Nación Seguros S.A.',
    to_label: 'Top 25 brokers (Bachellier, Martínez Sosa, etc.)',
    amount_ars: 3_500_000_000,
    description_es:
      'Comisiones pagadas a los 25 brokers principales. Bachellier S.A. facturó $1.665M (embargada por $9.669M). Martínez Sosa cobró $366M. Los brokers se insertaron como intermediarios entre el Estado y Nación Seguros gracias al Decreto 823.',
    description_en:
      'Commissions paid to top 25 brokers. Bachellier S.A. invoiced $1.665B (embargoed for $9.669B). Martínez Sosa collected $366M. Brokers inserted themselves as intermediaries between the State and Nación Seguros thanks to Decree 823.',
    date: '2021-2024',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/politica/2024/03/18/escandalo-de-los-seguros-las-empresas-del-broker-amigo-de-alberto-fernandez-y-sus-satelites-cobraron-mas-de-2000-millones-por-comisiones/',
  },
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
  {
    id: 'flow-lousteau-lcg',
    from_label: 'LCG SA (consultora vinculada a Lousteau)',
    to_label: 'Congreso Nacional',
    amount_ars: 1_690_000,
    description_es:
      'LCG SA habria facturado al Congreso Nacional ARS 1.690.000 entre 2020 y 2022, periodo en que Martin Lousteau ejercia como senador. La causa judicial continua activa.',
    description_en:
      'LCG SA reportedly billed the National Congress ARS 1,690,000 between 2020 and 2022, during which Martin Lousteau served as senator. The judicial case continues.',
    date: '2020-2022',
    source: 'Boletin Oficial / Cross-dataset analysis',
    source_url: 'https://datos.gob.ar',
  },
  {
    id: 'flow-aluar-coalitions',
    from_label: 'Aluar (empresa)',
    to_label: 'Ambas coaliciones (JxC + FdT)',
    amount_ars: 5_400_000,
    description_es:
      'Aluar SA realizo donaciones de campana por ARS 5.400.000 en 2019 distribuidas entre Juntos por el Cambio y Frente de Todos, financiando simultaneamente a ambas coaliciones principales.',
    description_en:
      'Aluar SA made campaign donations of ARS 5,400,000 in 2019 distributed between Juntos por el Cambio and Frente de Todos, simultaneously financing both main coalitions.',
    date: '2019',
    source: 'CNE',
    source_url: 'https://aportantes.electoral.gob.ar',
  },
  {
    id: 'flow-nacion-seguros-brokers-embargo',
    from_label: 'Bachellier S.A. (broker)',
    to_label: 'Embargo judicial',
    amount_ars: 9_669_000_000,
    description_es:
      'Bachellier S.A., principal broker del esquema Nación Seguros, fue embargada por $9.669 millones ARS. Facturó $1.665M en comisiones bajo el monopolio del Decreto 823/2021.',
    description_en:
      'Bachellier S.A., the top broker in the Nación Seguros scheme, was embargoed for $9.669B ARS. It invoiced $1.665B in commissions under the Decree 823/2021 monopoly.',
    date: '2024-2026',
    source: 'Infobae / Causa Seguros',
    source_url: 'https://www.infobae.com/politica/2024/03/18/escandalo-de-los-seguros-las-empresas-del-broker-amigo-de-alberto-fernandez-y-sus-satelites-cobraron-mas-de-2000-millones-por-comisiones/',
  },
  {
    id: 'flow-cuadernos-dismissals',
    from_label: '50 empresarios Cuadernos',
    to_label: 'Compra de sobreseimientos',
    amount_ars: 0,
    description_es:
      '50 empresarios de la causa Cuadernos ofrecieron entre USD 12M y USD 40M cada uno para comprar sobreseimientos. La tasa de condena por corrupción en Argentina es del 2% según auditoría de la propia Corte Suprema.',
    description_en:
      '50 businessmen in the Cuadernos case offered between USD 12M and USD 40M each to buy dismissals. Argentina\'s corruption conviction rate is 2% according to the Supreme Court\'s own audit.',
    date: '2018-2025',
    source: 'Corte Suprema / Chequeado',
    source_url: 'https://chequeado.com',
  },
  // --- Milei-era money flows ---
  {
    id: 'flow-libra-insider',
    from_label: '$LIBRA insiders (Kelsier Ventures)',
    to_label: '44,000 victims',
    amount_ars: 0,
    description_es:
      'Insiders cobraron USD 107M antes del colapso del 90% de $LIBRA. El presidente Milei promovió la criptomoneda que alcanzó USD 4.5B de capitalización. 44.000 víctimas afectadas.',
    description_en:
      'Insiders cashed out USD 107M before the 90% crash of $LIBRA. President Milei promoted the cryptocurrency which hit USD 4.5B market cap. 44,000 victims affected.',
    date: '2025-02',
    source: 'Infobae / Congressional investigation',
    source_url: 'https://www.infobae.com',
  },
  {
    id: 'flow-side-secret',
    from_label: 'Presupuesto Nacional',
    to_label: 'SIDE fondos reservados',
    amount_ars: 13_400_000_000,
    description_es:
      'Los fondos reservados de inteligencia crecieron ~2.000% bajo Milei. Santiago Caputo controla la SIDE a través del designado Cristian Auguadra sin cargo público formal.',
    description_en:
      'Intelligence reserved funds grew ~2,000% under Milei. Santiago Caputo controls SIDE through appointee Cristian Auguadra without a formal public role.',
    date: '2024-2025',
    source: 'Chequeado / Página/12 / elDiarioAR',
    source_url: 'https://chequeado.com',
  },
  {
    id: 'flow-pami-overpricing',
    from_label: 'PAMI',
    to_label: 'Drug cartel (Elea, GP Pharm, Kemex, etc.)',
    amount_ars: 0,
    description_es:
      'PAMI pagó hasta 16 veces el precio de mercado por medicamentos oncológicos en 2023. Anastrozol: $13.192 vs $924 en licitación. Cartel denunciado: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncología.',
    description_en:
      'PAMI paid up to 16x market price for oncological drugs in 2023. Anastrozole: $13,192 vs $924 at tender. Cartel complaint: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncologia.',
    date: '2023',
    source: 'Infobae',
    source_url: 'https://www.infobae.com',
  },
] as const
