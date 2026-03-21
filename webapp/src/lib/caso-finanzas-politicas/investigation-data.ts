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
    value: '263',
    label_es: 'Nodos de investigación',
    label_en: 'Investigation nodes',
    source: 'Neo4j graph',
  },
  {
    value: '117',
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
    value: '1,428+',
    label_es: 'Puerta giratoria financiera-gobierno',
    label_en: 'Financial-government revolving door',
    source: 'IGJ + GovernmentAppointment cross-match',
  },
  {
    value: '9',
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
    source_url: 'https://offshoreleaks.icij.org/search?q=Camano&cat=0',
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
    source_url: 'https://aportantes.electoral.gob.ar/aportes/',
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
    source_url: 'https://offshoreleaks.icij.org/search?q=BETHAN+INVESTMENTS&cat=0',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
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
    source_url: 'https://offshoreleaks.icij.org/nodes/240040844',
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
    source_url: 'https://offshoreleaks.icij.org/stories/nestor-grindetti',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    source: 'Cuerpo de Auditores del Consejo de la Magistratura / La Nacion',
    source_url: 'https://www.lanacion.com.ar/politica/segun-una-auditoria-solo-el-2-de-los-acusados-de-corrupcion-son-condenados-nid2152492/',
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
    source_url: 'https://www.infobae.com/politica/2025/02/16/el-asesor-de-la-criptomoneda-promocionada-inicialmente-por-javier-milei-aseguro-que-el-presidente-no-cumplio-un-compromiso-asumido/',
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
    source_url: 'https://offshoreleaks.icij.org/nodes/12170966',
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
    source_url: 'https://www.infobae.com/economia/2024/09/02/el-banco-central-confirmo-que-termino-de-mandar-los-lingotes-de-oro-de-las-reservas-al-exterior/',
  },
  // --- Deep Dive: Caputo Revolving Door ---
  {
    id: 'caputo-anker-suspension',
    claim_es:
      'La consultora de Caputo (Anker Latinoamérica, CUIT 30-71690088-2) suspendió operaciones el 30 de noviembre de 2023, días antes de que asumiera como Ministro de Economía. Misma dirección que su cargo directivo.',
    claim_en:
      'Caputo\'s consulting firm (Anker Latinoamérica, CUIT 30-71690088-2) suspended operations on November 30, 2023, days before he became Economy Minister. Same address as his directorship.',
    status: 'confirmed',
    tier: 1,
    source: 'Ámbito Financiero / CUITOnline',
    source_url: 'https://www.ambito.com/economia/luis-caputo-cierra-su-consultora-y-suma-los-socios-su-equipo-n5889363',
  },
  {
    id: 'caputo-bcra-bond-2038',
    claim_es:
      'Caputo tomó USD 3.200M de reservas del BCRA (DNU 23/2024) y dejó una letra intransferible a 10 años, prácticamente sin valor.',
    claim_en:
      'Caputo took USD 3.2B from BCRA reserves (DNU 23/2024) and left a non-transferable 10-year letter, practically valueless.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / La Nación',
    source_url: 'https://www.infobae.com/economia/2024/01/05/el-gobierno-tomara-usd-3200-de-las-reservas-del-bcra-para-pagar-vencimientos-de-deuda/',
  },
  {
    id: 'caputo-jp-morgan-agent',
    claim_es:
      'Caputo designó a JP Morgan (su ex empleador 1994-1998) como agente fiduciario para recompra de bonos soberanos con fondos del Banco Mundial.',
    claim_en:
      'Caputo designated JP Morgan (his former employer 1994-1998) as fiduciary agent for sovereign bond repurchase using World Bank funds.',
    status: 'confirmed',
    tier: 1,
    source: 'La Letra P',
    source_url: 'https://www.letrap.com.ar/economia/deuda-educacion-toto-caputo-recomprara-bonos-plata-del-banco-mundial-y-el-jp-morgan-como-agente-n5419611',
  },
  {
    id: 'caputo-100yr-bond',
    claim_es:
      'La AGN calificó el bono a 100 años de Caputo (USD 2.750M, 2017) como "poco transparente e ineficiente, comprometiendo generaciones futuras". Argentina pagaría 900%+ del neto recibido.',
    claim_en:
      'AGN qualified Caputo\'s 100-year bond (USD 2.75B, 2017) as "little transparent and inefficient, compromising future generations." Argentina would repay 900%+ of net received.',
    status: 'confirmed',
    tier: 1,
    source: 'El Destape / AGN',
    source_url: 'https://www.eldestapeweb.com/economia/finanzas/caputo-y-el-bono-a-100-anos-la-uditoria-que-lo-califico-de-gravoso-para-el-pais-202311240548',
  },
  {
    id: 'bausili-deutsche-bank-conflict',
    claim_es:
      'Santiago Bausili recibió ~USD 200K en acciones/bonos de Deutsche Bank mientras era Secretario de Finanzas, dirigiendo operaciones de deuda estatal que beneficiaban a DB. Procesado por negociaciones incompatibles.',
    claim_en:
      'Santiago Bausili received ~USD 200K in DB stock/bonuses while serving as Finance Secretary, directing state debt operations benefiting DB. Processed for incompatible negotiations.',
    status: 'confirmed',
    tier: 1,
    source: 'Página/12',
    source_url: 'https://www.pagina12.com.ar/780526-bausili-investigado-por-corrupcion/',
  },
  {
    id: '6-jp-morgan-officials',
    claim_es:
      'Al menos 6 funcionarios de Milei tienen pasado en JP Morgan: Caputo, Daza, Bausili, Quirno, Werning y Reidel.',
    claim_en:
      'At least 6 Milei officials have JP Morgan backgrounds: Caputo, Daza, Bausili, Quirno, Werning, and Reidel.',
    status: 'confirmed',
    tier: 1,
    source: 'Buenos Aires Times',
    source_url: 'https://batimes.com.ar/news/argentina/jp-morgan-in-power-mileis-six-officials-with-a-past-there.phtml',
  },
  // --- Deep Dive: Finaig/Lijo Connection ---
  {
    id: 'finaig-lijo-brother',
    claim_es:
      'Finaig Consultores SA fue co-fundada por Alfredo Damián Lijo (CUIT 20-21885141-0), hermano del juez Ariel Lijo nominado a la Corte Suprema. Finaig vinculada a operaciones de seguros.',
    claim_en:
      'Finaig Consultores SA was co-founded by Alfredo Damián Lijo (CUIT 20-21885141-0), brother of Judge Ariel Lijo nominated to the Supreme Court. Finaig linked to insurance operations.',
    status: 'confirmed',
    tier: 1,
    source: 'Dateas / Boletín Oficial',
    source_url: 'https://www.dateas.com/es/bora/2014/12/24/finaig-consultores-sa-839473',
  },
  // --- Deep Dive: Macri Empire ---
  {
    id: 'macri-398-companies',
    claim_es:
      'Alejandra Macri (hija no reconocida de Franco) listó 398 empresas como patrimonio familiar en demanda de herencia (2025), abarcando Argentina, Brasil, Panamá, Hong Kong, UK, BVI, Dubái y Luxemburgo.',
    claim_en:
      'Alejandra Macri (Franco\'s unrecognized daughter) listed 398 companies as family patrimony in inheritance claim (2025), spanning Argentina, Brazil, Panama, Hong Kong, UK, BVI, Dubai, and Luxembourg.',
    status: 'confirmed',
    tier: 1,
    source: 'DataClave',
    source_url: 'https://www.dataclave.com.ar/poder/alejandra-macri-desafia-al-clan-familiar--bienes-ocultos-y-demandas-por-398-empresas_a677c201cefdaf93e3bd9db5b',
  },
  {
    id: 'gianfranco-wind-profit',
    claim_es:
      'Gianfranco Macri compró 6 parques eólicos por US$25M vía entidad luxemburguesa (Lares Corporation), vendió en 2017 por US$95M = US$70M de ganancia.',
    claim_en:
      'Gianfranco Macri bought 6 wind farms for US$25M via Luxembourg entity (Lares Corporation), sold in 2017 for US$95M = US$70M profit.',
    status: 'confirmed',
    tier: 1,
    source: 'OCCRP / OpenLux',
    source_url: 'https://www.occrp.org/es/openlux/gone-with-the-wind-argentinas-former-first-family-used-luxembourg-companies-to-reap-70-million',
  },
  {
    id: 'correo-bankruptcy-extension',
    claim_es:
      'Estado pidió extensión de quiebra de Correo Argentino a SOCMA y SIDECO (holdings Macri). 20 años de concurso, deuda de $4.500M. Correogate: reducción del 98,82% propuesta durante presidencia de Macri.',
    claim_en:
      'State requested bankruptcy extension from Correo Argentino to SOCMA and SIDECO (Macri holdings). 20-year concurso, $4.5B debt. Correogate: 98.82% reduction proposed during Macri presidency.',
    status: 'confirmed',
    tier: 1,
    source: 'Página/12 / Infobae',
    source_url: 'https://www.infobae.com/politica/2021/07/05/claves-para-entender-la-causa-del-correo-argentino-sa-un-proceso-en-la-justicia-comercial-que-duro-20-anos-y-termino-en-una-quiebra/',
  },
  {
    id: 'gianfranco-destroy-correspondence',
    claim_es:
      'Gianfranco Macri ordenó destruir correspondencia bancaria y trasladó fondos de UBS Hamburgo a Safra Bank Suiza, 6 días antes de la victoria electoral de Mauricio (octubre 2015).',
    claim_en:
      'Gianfranco Macri ordered bank correspondence destroyed and moved funds from UBS Hamburg to Safra Bank Switzerland, 6 days before Mauricio\'s electoral victory (October 2015).',
    status: 'confirmed',
    tier: 1,
    source: 'Perfil',
    source_url: 'https://www.perfil.com/noticias/politica/gianfranco-macri-blanqueo-us-4-millones-de-una-offshore-oculta-tras-ser-denunciado.phtml',
  },
  // --- Deep Dive: Health Cartel ---
  {
    id: 'cndc-prepaid-cartel',
    claim_es:
      'La CNDC imputó por cartelización a Swiss Medical, OSDE, Galeno, Medife, Omint, Hospital Británico, Hospital Alemán y a Belocopitt personalmente. Aumentos coordinados de ~150% vs inflación de ~70%.',
    claim_en:
      'CNDC charged Swiss Medical, OSDE, Galeno, Medife, Omint, Hospital Británico, Hospital Alemán, and Belocopitt personally for cartelization. Coordinated increases of ~150% vs ~70% inflation.',
    status: 'confirmed',
    tier: 1,
    source: 'Argentina.gob.ar',
    source_url: 'https://www.argentina.gob.ar/noticias/la-cndc-imputa-por-presunta-cartelizacion-las-principales-empresas-de-medicina-prepaga-0',
  },
  {
    id: 'pami-anastrozol-14x',
    claim_es:
      'PAMI pagó Anastrozol a $13.192 (convenio marco) vs $924 (licitación pública) = sobreprecio de 14,3x (1.327%). Gasto excedente documentado: $273M en 8 drogas oncológicas.',
    claim_en:
      'PAMI paid Anastrozol at $13,192 (framework agreement) vs $924 (public bidding) = 14.3x markup (1,327%). Documented excess spending: $273M across 8 oncological drugs.',
    status: 'confirmed',
    tier: 1,
    source: 'La Nación / Infobae',
    source_url: 'https://www.lanacion.com.ar/politica/denuncian-que-el-pami-pago-medicamentos-oncologicos-hasta-16-veces-mas-que-el-valor-de-las-compras-nid22012025/',
  },
  {
    id: 'andis-2013pct-markup',
    claim_es:
      'ANDIS: Macitentan adjudicado a $411.764, vendido 3 días después a $8.290.000 = sobreprecio de 2.013%. Cuatro droguerías recibieron $37.000M.',
    claim_en:
      'ANDIS: Macitentan awarded at $411,764, sold 3 days later at $8,290,000 = 2,013% markup. Four drugstores received $37B.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae',
    source_url: 'https://www.infobae.com/judiciales/2025/11/17/andis-cuatro-droguerias-recibieron-37000-millones-y-vendieron-algunos-medicamentos-al-2000-de-su-valor/',
  },
  {
    id: 'suizo-argentina-2678pct',
    claim_es:
      'Droguería Suizo Argentina: contratos con el Estado crecieron 2.678% en un año bajo gobierno Milei (de $3.898M a $108.299M). Implicada en audios de coimas ANDIS.',
    claim_en:
      'Droguería Suizo Argentina: state contracts grew 2,678% in one year under Milei government ($3,898M to $108,299M). Implicated in ANDIS bribery audio recordings.',
    status: 'confirmed',
    tier: 1,
    source: 'La Nación',
    source_url: 'https://www.lanacion.com.ar/politica/aumento-exponencial-suizo-argentina-paso-de-3900-millones-a-108000-millones-en-contratos-con-el-nid24082025/',
  },
  // --- Deep Dive: Nucleoeléctrica ---
  {
    id: 'nucleoelectrica-1066pct',
    claim_es:
      'Nucleoeléctrica: sobreprecio de 1.066,7% en sistema SAP (USD 7M vs USD 600K previo). Presidente Reidel pagó deudas personales de $880M a Banco Macro en 18 días, renunció 9/2/2026.',
    claim_en:
      'Nucleoeléctrica: 1,066.7% overpricing on SAP system (USD 7M vs USD 600K prior). President Reidel paid personal debts of $880M to Banco Macro in 18 days, resigned 2/9/2026.',
    status: 'confirmed',
    tier: 1,
    source: 'ATE / Infobae',
    source_url: 'https://ate.org.ar/260127-sobreprecio-nasa/',
  },
  // --- Deep Dive: Fundación Faro ---
  {
    id: 'fundacion-faro-dark-money',
    claim_es:
      'Fundación Faro (ex-Fundación Valorar): directorio reemplazado abr 2024, renombrada oct 2024, lanzada nov 2024 con Milei. Gastó $1.079B en publicidad política sin declarar donantes. Cenas a $25.000/plato.',
    claim_en:
      'Fundación Faro (ex-Fundación Valorar): board replaced Apr 2024, renamed Oct 2024, launched Nov 2024 with Milei. Spent $1.079B on political ads without disclosing donors. $25,000/plate dinners.',
    status: 'confirmed',
    tier: 1,
    source: 'Chequeado',
    source_url: 'https://chequeado.com/investigaciones/fundacion-faro-el-think-tank-libertario-que-mas-pauta-electoral-puso-en-2025-y-que-no-declara-el-origen-de-sus-fondos/',
  },
  // --- Deep Dive: AFA Gate ---
  {
    id: 'afa-gate-400m',
    claim_es:
      'AFAGate: ~USD 400M canalizados por sociedades fantasma en Florida. TourProdEnter LLC acumuló USD 260M+. 9 LLCs en oficinas virtuales de Miami. Tapia y Toviggino citados por fraude y lavado.',
    claim_en:
      'AFAGate: ~USD 400M channeled through Florida shell companies. TourProdEnter LLC accumulated USD 260M+. 9 LLCs at Miami virtual offices. Tapia and Toviggino summoned for fraud and laundering.',
    status: 'confirmed',
    tier: 1,
    source: 'La Nación',
    source_url: 'https://www.lanacion.com.ar/politica/investigacion-exclusiva-desde-la-cuenta-que-administra-los-fondos-de-la-afa-en-eeuu-se-desviaron-al-nid28122025/',
  },
  // --- Deep Dive: SIDE ---
  {
    id: 'side-1967pct-growth',
    claim_es:
      'Gastos reservados SIDE crecieron 1.967% bajo Milei ($650M a $13.436M). DNU 941/2025 habilita FFAA en inteligencia interna y capacidad de aprehensión. Orden secreta de vigilar opositores documentada por CELS.',
    claim_en:
      'SIDE secret funds grew 1,967% under Milei ($650M to $13.436B). DNU 941/2025 enables military in domestic intelligence and apprehension power. Secret order to surveil opponents documented by CELS.',
    status: 'confirmed',
    tier: 1,
    source: 'Perfil / CELS',
    source_url: 'https://www.perfil.com/noticias/economia/side-los-gastos-reservados-crecieron-1967-con-milei.phtml',
  },
  // --- Deep Dive: Judiciary ---
  {
    id: 'borinsky-15-olivos-visits',
    claim_es:
      'Juez de Casación Borinsky: 15 visitas a Quinta de Olivos coincidentes con fallos favorables en causas K (Nisman, Ruta del Dinero K, Dólar Futuro, Vialidad). Justificación: "iba a jugar al paddle".',
    claim_en:
      'Casación Judge Borinsky: 15 visits to Olivos coinciding with favorable rulings in K cases (Nisman, Ruta del Dinero K, Dólar Futuro, Vialidad). Justification: "went to play paddle tennis".',
    status: 'confirmed',
    tier: 1,
    source: 'El Destape',
    source_url: 'https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034',
  },
  {
    id: 'surely-sa-4x-price',
    claim_es:
      'SURELY SA (dueño: Mario Montoto, ex-Montonero, padre de Fernanda Raverta ex-ANSES): proveedor único de tobilleras electrónicas a USD 20,25/día vs USD 5/día internacional (4x benchmark).',
    claim_en:
      'SURELY SA (owner: Mario Montoto, ex-Montonero, father of Fernanda Raverta ex-ANSES): sole ankle bracelet provider at USD 20.25/day vs USD 5/day international (4x benchmark).',
    status: 'confirmed',
    tier: 1,
    source: 'La Nación',
    source_url: 'https://www.lanacion.com.ar/politica/polemica-y-denuncias-por-el-contrato-de-tobilleras-electronicas-que-se-encamina-a-ganar-montoto-por-nid27042025/',
  },
  {
    id: 'sturzenegger-99pct-abroad',
    claim_es:
      'Sturzenegger: 99% de depósitos en el exterior, salto patrimonial de $970M en 2024, mientras promueve que argentinos traigan dólares al sistema local. Un Ombú SAS: capital mínimo, objeto social ultra-amplio.',
    claim_en:
      'Sturzenegger: 99% of deposits abroad, $970M patrimony jump in 2024, while promoting policies encouraging Argentines to bring dollars into local system. Un Ombú SAS: minimal capital, ultra-broad corporate purpose.',
    status: 'confirmed',
    tier: 1,
    source: 'Perfil',
    source_url: 'https://www.perfil.com/noticias/politica/federico-sturzenegger-declaro-un-salto-patrimonial-de-casi-970-millones-en-2024.phtml',
  },
  {
    id: 'consejo-empresario-bridge',
    claim_es:
      'Consejo Empresario Argentino actúa como puente oligárquico: conecta a Caputo Nicolás, Mindlin Marcos, Macri Francisco y Werthein Darío en una sola organización.',
    claim_en:
      'Consejo Empresario Argentino acts as oligarchic bridge: connects Caputo Nicolás, Mindlin Marcos, Macri Francisco, and Werthein Darío in a single organization.',
    status: 'confirmed',
    tier: 1,
    source: 'Neo4j cross-reference',
    source_url: 'https://ceads.org.ar/sobre-ceads/autoridades/',
  },
  {
    id: 'belocopitt-pandemic-aid',
    claim_es:
      'Swiss Medical recibió $2.417M en subsidios ATP del Estado durante la pandemia, mientras adquiría competidores. Belocopitt cobró parte de su salario via ATP.',
    claim_en:
      'Swiss Medical received $2.417B in state ATP subsidies during pandemic, while acquiring competitors. Belocopitt collected part of his salary through ATP.',
    status: 'confirmed',
    tier: 1,
    source: 'Chaco Día por Día',
    source_url: 'https://www.laizquierdadiario.com/Claudio-Bellocopitt-cobro-el-ATP-del-Estado-radiografia-del-magnate-de-Swiss-Medical',
  },
  {
    id: 'rosenkrantz-clarin-conflict',
    claim_es:
      'Juez Rosenkrantz representó a Grupo Clarín, YPF, Cablevisión como abogado antes de llegar a la Corte. Firmó 25+ fallos involucrando a ex-clientes estando en la Corte. Se excusó en 85 causas, pero no en las de Clarín.',
    claim_en:
      'Justice Rosenkrantz represented Grupo Clarín, YPF, Cablevisión as lawyer before joining the Court. Signed 25+ rulings involving former clients while on the Court. Recused from 85 cases, but not Clarín ones.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae',
    source_url: 'https://www.infobae.com/politica/2020/10/28/carlos-rosenkrantz-se-excuso-de-votar-en-al-menos-85-causas-desde-que-llego-a-la-corte-suprema/',
  },
  {
    id: 'lijo-senate-rejection',
    claim_es:
      'Senado rechazó candidatura de Lijo a Corte Suprema: 43 negativos, 27 afirmativos, 1 abstención (3 abril 2025). Primera vez desde 1983 que se rechaza un candidato judicial en el recinto.',
    claim_en:
      'Senate rejected Lijo\'s Supreme Court candidacy: 43 against, 27 for, 1 abstention (April 3, 2025). First time since 1983 a judicial candidate was rejected in the chamber.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae',
    source_url: 'https://www.infobae.com/politica/2025/04/03/con-votos-del-pro-y-el-kirchnerismo-el-senado-rechazo-las-candidaturas-de-ariel-lijo-y-garcia-mansilla-a-la-corte-suprema/',
  },
  // --- Deep Dive: Graph Intelligence (March 2026) ---
  {
    id: 'eurnekian-milei-mentor',
    claim_es: 'Eduardo Eurnekian (Corporacion America, 35 aeropuertos, USD 1.900M) fue empleador de Milei por mas de una decada. Patanian lo presento a TV en 2016. Posse (ex-ejecutivo de Eurnekian) fue Jefe de Gabinete. Menem privatizo AA2000, Eurnekian la adquirio, Milei (su empleado) llego a presidente.',
    claim_en: 'Eduardo Eurnekian (Corporacion America, 35 airports, USD 1.9B) was Milei employer for over a decade. Patanian introduced him to TV in 2016. Posse (ex-Eurnekian exec) became Chief of Staff. Menem privatized AA2000, Eurnekian acquired it, Milei (his employee) became president.',
    status: 'confirmed',
    tier: 1,
    source: 'La Nacion / elDiarioAR',
    source_url: 'https://www.lanacion.com.ar/politica/milei-eurnekian-la-historia-detras-de-un-vinculo-que-define-el-nuevo-poder-nid10092023/',
  },
  {
    id: 'caputo-linchpin-268',
    claim_es: 'Luis Caputo es el nodo puente #1 del grafo de investigacion: conecta 268 pares de entidades que de otra forma estarian desconectados. Vincula redes Macri, Milei, Eurnekian, Burford/IMF, y el sector financiero.',
    claim_en: 'Luis Caputo is the #1 bridge node in the investigation graph: connects 268 entity pairs that would otherwise be disconnected. Links Macri, Milei, Eurnekian, Burford/IMF, and financial sector networks.',
    status: 'confirmed',
    tier: 1,
    source: 'Neo4j graph analysis',
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
  },
  {
    id: 'menem-privatization-chain',
    claim_es: 'Cadena de privatizacion de 30 anios: Menem privatizo Correo (1997) y AA2000 (1998). Macri adquirio Correo, Eurnekian adquirio AA2000. Macri llego a presidente, su Correo obtuvo 98,82% de quita. Milei (empleado de Eurnekian) llego a presidente, AA2000 extendida a 2038.',
    claim_en: '30-year privatization chain: Menem privatized Correo (1997) and AA2000 (1998). Macri acquired Correo, Eurnekian acquired AA2000. Macri became president, his Correo got 98.82% debt reduction. Milei (Eurnekian employee) became president, AA2000 extended to 2038.',
    status: 'confirmed',
    tier: 1,
    source: 'Multiple verified sources',
    source_url: 'https://www.infobae.com/economia/2020/11/30/el-estado-extendio-la-concesion-de-aeropuertos-argentina-2000-hasta-2038-y-la-compania-invertira-usd-2500-millones/',
  },
  {
    id: 'comodoro-py-30-triangles',
    claim_es: 'Comodoro Py forma 30 triangulos de poder: jueces interconectados a traves del mismo tribunal. 10 jueces/fiscales federales manejando todas las causas de corrupcion nacional. Tasa de condena: 2%.',
    claim_en: 'Comodoro Py forms 30 power triangles: judges interconnected through the same court. 10 federal judges/prosecutors handling all national corruption cases. Conviction rate: 2%.',
    status: 'confirmed',
    tier: 1,
    source: 'Neo4j graph analysis + ACIJ',
    source_url: 'https://www.lanacion.com.ar/politica/segun-una-auditoria-solo-el-2-de-los-acusados-de-corrupcion-son-condenados-nid2152492/',
  },
  {
    id: 'singer-milei-4-hops',
    claim_es: 'Ruta en el grafo Singer→Milei en 4 saltos: Singer (vulture fund) → Burford (apunta activos) → Caputo (controla BCRA) → Santiago Caputo (asesor) → Karina Milei. Los fondos buitre acceden al poder a traves de la cadena financiera.',
    claim_en: 'Graph path Singer→Milei in 4 hops: Singer (vulture fund) → Burford (targets assets) → Caputo (controls BCRA) → Santiago Caputo (advisor) → Karina Milei. Vulture funds access power through the financial chain.',
    status: 'confirmed',
    tier: 1,
    source: 'Neo4j shortest path analysis',
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
  },
  // --- Deep Dive: Caputo Corporate Dossier ---
  {
    id: 'caputo-paradise-papers-undeclared',
    claim_es: 'Caputo era dueno del 75% de Princess International Global Ltd (Islas Caiman) que controlaba Alto Global Fund (US$100M+ hedge fund). NINGUNA de estas entidades fue declarada en su declaracion jurada obligatoria al entrar al gobierno en 2015. Cuando fue confrontado, dijo ser "solo un administrador".',
    claim_en: 'Caputo owned 75% of Princess International Global Ltd (Cayman Islands) which controlled Alto Global Fund (US$100M+ hedge fund). NONE of these entities were declared in his mandatory financial disclosure upon entering government in 2015. When confronted, he claimed to be "only an administrator".',
    status: 'confirmed',
    tier: 1,
    source: 'La Nacion / Buenos Aires Times / ICIJ',
    source_url: 'https://www.batimes.com.ar/news/argentina/caputo-concealed-cayman-island-offshore-firms-from-argentine-authorities.phtml',
  },
  {
    id: 'caputo-axis-anses-self-dealing',
    claim_es: 'Caputo fundo AXIS SGFCI (2012, 60% dueno). Como Secretario de Finanzas, aprobo inversion de AR$500M del fondo de pensiones ANSES/FGS en AXIS Ahorro Plus FCI — SU PROPIO fondo mutual. Comisiones a AXIS (AR$1,4M) y Deutsche Bank (AR$500K). Denuncia penal de UFISES.',
    claim_en: 'Caputo founded AXIS SGFCI (2012, 60% owner). As Finance Secretary, approved AR$500M pension fund investment into AXIS Ahorro Plus FCI — HIS OWN mutual fund. Commissions to AXIS (AR$1.4M) and Deutsche Bank (AR$500K). Criminal complaint by UFISES.',
    status: 'confirmed',
    tier: 1,
    source: 'Pagina/12 / Fiscales.gob.ar',
    source_url: 'https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/',
  },
  {
    id: 'caputo-hidden-7b-debt',
    claim_es: 'La AGN verifico que la Resolucion 147/2017 (firma de Caputo) creo USD 7.368M en deuda indirecta mediante Letras del Tesoro Nacional garantizando el programa de energia renovable — oculta de las estadisticas oficiales de deuda.',
    claim_en: 'AGN verified that Resolution 147/2017 (Caputo signature) created USD 7.368B in indirect debt through National Treasury Notes guaranteeing the renewable energy program — hidden from official debt statistics.',
    status: 'confirmed',
    tier: 1,
    source: 'AGN / El Cronista',
    source_url: 'https://www.cronista.com/economia-politica/deuda-la-agn-cuestiono-la-colocacion-del-bono-del-siglo-en-el-gobierno-de-macri/',
  },
  {
    id: 'caputo-hermanos-morel-cFK',
    claim_es: 'Caputo Hermanos S.A. (CUIT 33-70897527-9, hermanos Flavio y Hugo) contrato a Jonathan Morel (lider de Revolucion Federal) con AR$8M+ en facturas. Morel esta vinculado a la investigacion del intento de asesinato de Cristina Fernandez de Kirchner.',
    claim_en: 'Caputo Hermanos S.A. (CUIT 33-70897527-9, brothers Flavio and Hugo) contracted Jonathan Morel (Revolucion Federal leader) with AR$8M+ in invoices. Morel is linked to the investigation of the CFK assassination attempt.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae',
    source_url: 'https://www.infobae.com/politica/2022/10/21/la-contratacion-de-caputo-hermanos-al-lider-de-revolucion-federal-facturas-y-transferencias-por-mas-de-8-millones-de-pesos/',
  },
  {
    id: 'caputo-patrimony-quintupled',
    claim_es: 'El patrimonio de Caputo se quintuplico desde que asumio como ministro. 99,9% de activos liquidos en el exterior. AR$11.851M declarados (2024). Campo de 81M m2 en Santiago del Estero. Yate, propiedades en 4 provincias.',
    claim_en: 'Caputo patrimony quintupled since becoming minister. 99.9% of liquid assets abroad. AR$11.851B declared (2024). Field of 81M sqm in Santiago del Estero. Yacht, properties in 4 provinces.',
    status: 'confirmed',
    tier: 1,
    source: 'Chequeado / Filo News',
    source_url: 'https://chequeado.com/el-explicador/la-declaracion-jurada-de-luis-caputo-informo-un-patrimonio-de-11-800-millones-y-casi-2-tercios-de-sus-bienes-estan-en-el-exterior/',
  },

  // ── Wave 4: Media-Politics Nexus ──────────────────────────────────────────
  {
    id: 'papel-prensa-coercion',
    claim_es: 'Clarin y La Nacion adquirieron Papel Prensa en 1976-77 mediante coercion a la familia Graiver bajo dictadura militar. Magnetto amenazo a Lidia Papaleo: "firme o le costara la vida de su hija y la suya". Seis miembros del grupo Graiver fueron detenidos ilegalmente.',
    claim_en: 'Clarin and La Nacion acquired Papel Prensa in 1976-77 through coercion of the Graiver family under the military dictatorship. Magnetto threatened Lidia Papaleo: "sign or it will cost the life of your daughter and yours." Six Graiver group members were illegally detained.',
    status: 'confirmed_cleared',
    tier: 1,
    source: 'Chequeado / FARCO',
    source_url: 'https://chequeado.com/el-explicador/claves-para-entender-el-caso-papel-prensa/',
    detail_es: 'La Corte Suprema cerro la causa en 2017, sobreseyendo a Magnetto, Mitre y Herrera de Noble. La apropiacion fue denunciada por organismos de derechos humanos y el Estado argentino en multiples ocasiones.',
    detail_en: 'The Supreme Court closed the case in 2017, dismissing Magnetto, Mitre and Herrera de Noble. The appropriation was denounced by human rights organizations and the Argentine State on multiple occasions.',
  },
  {
    id: 'clarin-cablevision-telecom-monopoly',
    claim_es: 'Grupo Clarin fusiono Cablevision con Telecom en 2018, concentrando ~70% de servicios de telecomunicaciones en un solo grupo economico. Magnetto controla 83% de acciones junto a herederos de Noble.',
    claim_en: 'Grupo Clarin merged Cablevision with Telecom in 2018, concentrating ~70% of telecommunications services in a single economic group. Magnetto controls 83% of shares with Noble heirs.',
    status: 'confirmed',
    tier: 1,
    source: 'La Izquierda Diario / Perfil',
    source_url: 'https://www.perfil.com/noticias/politica/aprobaron-la-fusion-entre-cablevision-y-telecom.phtml',
    detail_es: 'La fusion fue aprobada durante el gobierno de Macri. Telecom tiene posicion dominante en todos los mercados de telecomunicaciones excepto conectividad satelital.',
    detail_en: 'The merger was approved during the Macri government. Telecom has a dominant position in all telecommunications markets except satellite connectivity.',
  },
  {
    id: 'magnetto-pandora-papers',
    claim_es: 'Magnetto, Aranda (Clarin), Saguier (La Nacion) y Fontevecchia (Perfil) aparecen en Pandora Papers con sociedades en Islas Virgenes Britanicas y Uruguay. Mather Holdings Ltd y Silkwood Investments Ltd (BVI, anos 90). Beneficiarios finales: hijos de Magnetto y Aranda.',
    claim_en: 'Magnetto, Aranda (Clarin), Saguier (La Nacion) and Fontevecchia (Perfil) appear in Pandora Papers with companies in British Virgin Islands and Uruguay. Mather Holdings Ltd and Silkwood Investments Ltd (BVI, 1990s). Ultimate beneficiaries: children of Magnetto and Aranda.',
    status: 'confirmed',
    tier: 1,
    source: 'elDiarioAR / El Destape',
    source_url: 'https://www.eldiarioar.com/politica/pandora-papers/magnetto-fontevecchia-saguier-aranda-duenos-principales-medios-argentina-han-abierto-sociedades-paraisos-fiscales-uruguay_1_8403360.amp.html',
    detail_es: 'Los principales medios argentinos que cubrieron los Pandora Papers omitieron mencionar la presencia de sus propios duenos en los documentos filtrados.',
    detail_en: 'Major Argentine media outlets covering the Pandora Papers omitted mentioning the presence of their own owners in the leaked documents.',
  },
  {
    id: 'lago-escondido-judges-clarin',
    claim_es: 'Ejecutivos de Clarin (Jorge Rendo, Pablo Casey) invitaron a jueces federales de Comodoro Py (Ercolini, Mahiques) y funcionarios portenos a Lago Escondido. Se intento encubrir con facturas truchas y direccionamiento de la causa judicial.',
    claim_en: 'Clarin executives (Jorge Rendo, Pablo Casey) invited federal judges from Comodoro Py (Ercolini, Mahiques) and Buenos Aires officials to Lago Escondido. They attempted cover-up with fake invoices and directing the judicial case.',
    status: 'confirmed_cleared',
    tier: 1,
    source: 'El Destape / LA NACION',
    source_url: 'https://www.lanacion.com.ar/politica/la-causa-por-el-viaje-de-jueces-y-funcionarios-portenos-a-lago-escondido-se-investigara-en-comodoro-nid01022023/',
    detail_es: 'La causa fue transferida a Comodoro Py y todos los acusados fueron sobreseidos. Pablo Casey es sobrino de Hector Magnetto y director de Asuntos Legales de Telecom Argentina.',
    detail_en: 'The case was transferred to Comodoro Py and all defendants were dismissed. Pablo Casey is nephew of Hector Magnetto and director of Legal Affairs at Telecom Argentina.',
  },
  {
    id: 'edenor-vila-manzano-purchase',
    claim_es: 'Vila-Manzano-Filiberti compraron Edenor (mayor distribuidora electrica de Sudamerica, 3M clientes) a Mindlin/Pampa Energia por USD 100M en diciembre 2020. Solo desembolsaron USD 55M inicialmente. El gobierno de Alberto Fernandez autorizo la operacion.',
    claim_en: 'Vila-Manzano-Filiberti purchased Edenor (largest electricity distributor in South America, 3M customers) from Mindlin/Pampa Energia for USD 100M in December 2020. Only disbursed USD 55M initially. Alberto Fernandez government authorized the operation.',
    status: 'confirmed',
    tier: 1,
    source: 'Pagina 12 / econojournal',
    source_url: 'https://www.pagina12.com.ar/314110-mindlin-le-vendio-edenor-a-vila-manzano',
    detail_es: 'Manzano y Vila ya eran socios en Grupo America (medios), Andes Energia (petroleo), Edemsa y Edelar (distribuidoras electricas). La compra fue investigada por la justicia por posible compra de acciones previas.',
    detail_en: 'Manzano and Vila were already partners in Grupo America (media), Andes Energia (oil), Edemsa and Edelar (electrical distributors). The purchase was investigated by courts for possible prior share purchases.',
  },
  {
    id: 'manzano-media-energy-convergence',
    claim_es: 'Jose Luis Manzano (ex ministro del Interior de Menem) controla simultaneamente Grupo America (segundo multimedios), Edenor, Metrogas, Phoenix Global Resources (petroleo), y 243.000 ha de salares de litio en Catamarca y Jujuy. Opera desde Ginebra via Integra Capital.',
    claim_en: 'Jose Luis Manzano (ex Interior Minister under Menem) simultaneously controls Grupo America (2nd media group), Edenor, Metrogas, Phoenix Global Resources (oil), and 243,000 ha of lithium salt flats in Catamarca and Jujuy. Operates from Geneva via Integra Capital.',
    status: 'confirmed',
    tier: 1,
    source: 'elDiarioAR / Media Ownership Monitor',
    source_url: 'https://www.eldiarioar.com/politica/jose-luis-manzano-senor-litio-acumula-243-000-hectareas-salares-explotar-negocio-minero_1_10104893.html',
    detail_es: 'Manzano fue elegido entre las personas mas influyentes de America Latina. Se le atribuye la frase "yo robo para la corona" durante el menemismo, que el niega.',
    detail_en: 'Manzano was chosen among the most influential people in Latin America. He is attributed the phrase "I steal for the crown" during the Menem era, which he denies.',
  },
  {
    id: 'oil-combustibles-evasion',
    claim_es: 'Oil Combustibles (Cristobal Lopez) retuvo y no deposito $8.000M del Impuesto a la Transferencia de Combustibles (ITC) a AFIP. El titular de AFIP Ricardo Echegaray otorgo planes de 97 cuotas con tasas inferiores a la inflacion. Echegaray condenado a 4 anos y 8 meses.',
    claim_en: 'Oil Combustibles (Cristobal Lopez) withheld and did not deposit $8,000M in Fuel Transfer Tax (ITC) to AFIP. AFIP head Ricardo Echegaray granted 97-installment plans at below-inflation rates. Echegaray sentenced to 4 years and 8 months.',
    status: 'confirmed',
    tier: 1,
    source: 'LA NACION / Infobae',
    source_url: 'https://www.lanacion.com.ar/politica/cristobal-lopez-no-pago-a-la-afip-8000-millones-durante-el-kirchnerismo-nid1879369/',
    detail_es: 'La Corte Suprema anulo la absolucion de Lopez y De Sousa en mayo 2024. Lopez y De Sousa habian sido absueltos con beneficio de la duda. Lopez uso los fondos retenidos para expandir el Grupo Indalo.',
    detail_en: 'The Supreme Court annulled the acquittal of Lopez and De Sousa in May 2024. Lopez and De Sousa had been acquitted on benefit of the doubt. Lopez used the withheld funds to expand Grupo Indalo.',
  },
  {
    id: 'lopez-kirchner-state-contracts',
    claim_es: 'Cristobal Lopez obtuvo casinos, concesiones petroleras y contratos estatales a traves de relacion directa con Nestor Kirchner. DNU 475/05 firmado por Kirchner para privilegiar a Lopez. Familia Kirchner recibio al menos $2.8M via Los Sauces SA por alquileres a empresas de Lopez.',
    claim_en: 'Cristobal Lopez obtained casinos, oil concessions and state contracts through direct relationship with Nestor Kirchner. DNU 475/05 signed by Kirchner to privilege Lopez. Kirchner family received at least $2.8M via Los Sauces SA for rentals to Lopez companies.',
    status: 'confirmed',
    tier: 1,
    source: 'LA NACION / Perfil',
    source_url: 'https://www.lanacion.com.ar/editoriales/los-negocios-entre-cristobal-lopez-y-cristina-kirchner-nid1777564/',
    detail_es: 'Tres emprendimientos de Lopez fueron adjudicados directamente por Nestor Kirchner, incluyendo el casino de Rio Gallegos inaugurado en 2003. Lopez inauguro Casino Club en 1992, la primera casa de juego en Chubut.',
    detail_en: 'Three of Lopez ventures were directly awarded by Nestor Kirchner, including the Rio Gallegos casino inaugurated in 2003. Lopez inaugurated Casino Club in 1992, the first gambling house in Chubut.',
  },
  {
    id: 'indalo-media-acquisition',
    claim_es: 'En 2012, Lopez compro a Daniel Hadad cinco radios (Radio 10, FM Vale, One, Mega, Pop) y C5N. En 2025, Lopez desplazo a De Sousa y retomo control directo de C5N, Radio 10, Ambito Financiero y Minutouno. Lopez tiene 70% de Grupo Indalo, De Sousa 30%.',
    claim_en: 'In 2012, Lopez purchased from Daniel Hadad five radio stations (Radio 10, FM Vale, One, Mega, Pop) and C5N. In 2025, Lopez displaced De Sousa and retook direct control of C5N, Radio 10, Ambito Financiero and Minutouno. Lopez holds 70% of Grupo Indalo, De Sousa 30%.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / Wikipedia',
    source_url: 'https://www.infobae.com/politica/2017/12/15/c5n-radio-10-e-ideas-del-sur-los-nuevos-duenos-del-grupo-indalo-pidieron-el-concurso-para-todos-sus-medios/',
  },
  {
    id: 'lawfare-media-judiciary-feedback',
    claim_es: 'Investigadores documentan un circuito de retroalimentacion juridico-mediatico en Argentina: jueces filtran expedientes a medios, medios amplifican acusaciones, presion publica legitima acciones judiciales. La practica involucra jueces, fiscales, medios, servicios de inteligencia y empresas.',
    claim_en: 'Researchers document a juridical-media feedback loop in Argentina: judges leak files to media, media amplify accusations, public pressure legitimizes judicial actions. The practice involves judges, prosecutors, media, intelligence services and companies.',
    status: 'confirmed',
    tier: 2,
    source: 'UBA Espoiler / CELAG / ResearchGate',
    source_url: 'https://espoiler.sociales.uba.ar/2021/12/21/lawfare-y-periodismo-la-retroalimentacion-juridico-mediatica-en-argentina/',
    detail_es: 'Multiples papers academicos documentan la articulacion entre la persecucion judicial y la cobertura mediatica como mecanismo de descalificacion politica en Argentina y America Latina.',
    detail_en: 'Multiple academic papers document the articulation between judicial persecution and media coverage as a political disqualification mechanism in Argentina and Latin America.',
  },
  {
    id: 'goldman-sachs-clarin-stake',
    claim_es: 'Goldman Sachs obtuvo 18% de Grupo Clarin en 1999 a cambio de asumir deuda de USD 500M. En 2007, Clarin comenzo a cotizar en Londres y Buenos Aires. En 2012, Goldman vendio a Ralph Booth (EEUU). 80% de la oferta bursatil de Clarin fue a inversores extranjeros.',
    claim_en: 'Goldman Sachs obtained 18% of Grupo Clarin in 1999 in exchange for assuming USD 500M debt. In 2007, Clarin began trading in London and Buenos Aires. In 2012, Goldman sold to Ralph Booth (USA). 80% of Clarin stock offering went to foreign investors.',
    status: 'confirmed',
    tier: 1,
    source: 'El Cronista / iProfesional',
    source_url: 'https://eleconomista.com.ar/negocios/goldman-sachs-clarin-n2908',
  },
  {
    id: 'tether-adecoagro-acquisition',
    claim_es: 'Tether (emisor de la stablecoin USDT, USD 14.000M ganancia en 2024) adquirio hasta 70% de Adecoagro por USD 600M+ en 2025. Tether Investments tiene USD 3.000M para inversiones en Argentina en IA, energia, agro y medios digitales.',
    claim_en: 'Tether (USDT stablecoin issuer, USD 14B profit in 2024) acquired up to 70% of Adecoagro for USD 600M+ in 2025. Tether Investments has USD 3B for investments in Argentina in AI, energy, agro and digital media.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / LA NACION',
    source_url: 'https://www.infobae.com/economia/2025/03/27/un-gigante-cripto-invertira-usd-600-millones-en-la-argentina-para-quedarse-con-el-control-de-adecoagro/',
    detail_es: 'Adecoagro fue fundada con capital de George Soros. La transicion de Soros a Tether marca un cambio generacional en el capital extranjero que controla activos estrategicos argentinos.',
    detail_en: 'Adecoagro was founded with George Soros capital. The transition from Soros to Tether marks a generational shift in foreign capital controlling strategic Argentine assets.',
  },
  // --- Frente de Todos / Kirchnerismo factcheck items ---
  {
    id: 'cristina-vialidad-condena-firme',
    claim_es: 'Cristina Fernández de Kirchner fue condenada a 6 años de prisión e inhabilitación perpetua para cargos públicos por administración fraudulenta en la Causa Vialidad. La Corte Suprema dejó firme la condena en junio de 2025. Cumple prisión domiciliaria. Decomiso de bienes hasta USD 640M ordenado.',
    claim_en: 'Cristina Fernández de Kirchner was sentenced to 6 years in prison and perpetual disqualification from public office for fraudulent administration in the Vialidad Case. Supreme Court made the conviction final in June 2025. Serving house arrest. Asset forfeiture up to USD 640M ordered.',
    status: 'confirmed',
    tier: 1,
    source: 'LA NACION / Chequeado',
    source_url: 'https://www.lanacion.com.ar/politica/la-corte-suprema-confirmo-la-condena-a-cristina-kirchner-a-prision-y-no-podra-ser-candidata-nid10062025/',
    detail_es: 'La causa investigó la asignación irregular de 51 obras viales en Santa Cruz a Austral Construcciones (Lázaro Báez). Solo 26 obras completadas, ninguna en tiempo, sobreprecios de hasta 387%. El 80% de obra vial en la provincia fue para Báez.',
    detail_en: 'The case investigated irregular assignment of 51 road works in Santa Cruz to Austral Construcciones (Lázaro Báez). Only 26 works completed, none on time, overpricing up to 387%. 80% of provincial road work went to Báez.',
  },
  {
    id: 'lazaro-baez-ruta-dinero-k',
    claim_es: 'Lázaro Báez fue condenado a 15 años de prisión (sentencia unificada) por lavado de USD 54,87M y fraude en obra pública. Multa de USD 329,2M. Monopolizó 80% de obras viales en Santa Cruz con sobreprecios de hasta 387%.',
    claim_en: 'Lázaro Báez was sentenced to a unified 15 years in prison for laundering USD 54.87M and public works fraud. Fine of USD 329.2M. Monopolized 80% of road works in Santa Cruz with overpricing up to 387%.',
    status: 'confirmed',
    tier: 1,
    source: 'LA NACION / Infobae',
    source_url: 'https://www.lanacion.com.ar/politica/la-corte-confirmo-la-condena-a-diez-anos-de-prision-contra-lazaro-baez-por-lavado-de-dinero-nid29052025/',
  },
  {
    id: 'jose-lopez-bolsos-convento',
    claim_es: 'José López (ex Secretario de Obras Públicas) fue detenido en junio 2016 intentando ocultar USD 9M, joyas y un arma en un convento de General Rodríguez. Condena unificada: 13 años de prisión. Dinero decomisado donado a hospitales Garrahan y Gutiérrez.',
    claim_en: 'José López (former Public Works Secretary) was arrested in June 2016 trying to hide USD 9M, jewels and a firearm in a General Rodríguez convent. Unified sentence: 13 years prison. Seized money donated to Garrahan and Gutiérrez hospitals.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / LA NACION',
    source_url: 'https://www.infobae.com/judiciales/2025/12/11/casacion-dejo-firme-la-pena-de-13-anos-de-carcel-contra-jose-lopez-por-corrupcion-y-el-caso-de-los-bolsos-del-convento/',
  },
  {
    id: 'boudou-ciccone-condena',
    claim_es: 'Amado Boudou (ex Vicepresidente) fue condenado a 5 años y 10 meses por cohecho pasivo y negociaciones incompatibles al adquirir encubiertamente la imprenta Ciccone Calcográfica (única privada capaz de imprimir billetes). Primer vicepresidente con condena firme por corrupción.',
    claim_en: 'Amado Boudou (former VP) was sentenced to 5 years 10 months for passive bribery and incompatible negotiations for covertly acquiring Ciccone Calcográfica printing press (only private one capable of printing currency). First VP with final corruption conviction.',
    status: 'confirmed',
    tier: 1,
    source: 'Chequeado / LA NACION',
    source_url: 'https://chequeado.com/el-explicador/causa-ciccone-la-corte-confirmo-la-sentencia-de-boudou-y-se-convirtio-en-el-primer-vicepresidente-condenado-por-corrupcion/',
  },
  {
    id: 'devido-once-gnl-condenas',
    claim_es: 'Julio De Vido acumula dos condenas firmes: 4 años por la tragedia de Once (52 muertos, toleró uso indebido de fondos) y 4 años por fraude en compra de GNL (USD 5,5M en comisiones innecesarias). Procesado por enriquecimiento ilícito ($690.000 USD injustificados, feb 2026).',
    claim_en: 'Julio De Vido has two final convictions: 4 years for the Once tragedy (52 dead, tolerated misuse of funds) and 4 years for GNL purchase fraud (USD 5.5M in unnecessary commissions). Prosecuted for illicit enrichment (USD 690K unjustified, Feb 2026).',
    status: 'confirmed',
    tier: 1,
    source: 'LA NACION / Infobae',
    source_url: 'https://www.lanacion.com.ar/politica/la-corte-confirmo-la-condena-contra-julio-de-vido-por-la-tragedia-de-once-nid11112025/',
  },
  {
    id: 'jaime-transporte-condena',
    claim_es: 'Ricardo Jaime (ex Secretario de Transporte) condenado a 8 años por enriquecimiento ilícito y cohecho: poseía avión (USD 4M), yate, autos, departamentos y hotel sin justificación. Usaba testaferros (hija, ex pareja). Preso en Ezeiza desde noviembre 2024.',
    claim_en: 'Ricardo Jaime (former Transport Secretary) sentenced to 8 years for illicit enrichment and bribery: owned airplane (USD 4M), yacht, cars, apartments and hotel without justification. Used front people (daughter, ex-partner). Imprisoned at Ezeiza since November 2024.',
    status: 'confirmed',
    tier: 1,
    source: 'Fiscales.gob.ar / Infobae',
    source_url: 'https://www.fiscales.gob.ar/fiscalias/condenaron-al-ex-secretario-de-transporte-ricardo-jaime-a-8-anos-de-prision-por-enriquecimiento-ilicito-y-debera-pagar-una-multa-de-15-millones-de-pesos/',
  },
  {
    id: 'baratta-cuadernos-recaudador',
    claim_es: 'Roberto Baratta (ex Subsecretario de Planificación) identificado como principal recaudador de coimas del kirchnerismo. Condenado a 3 años 6 meses por fraude en compra de GNL. En juicio oral por Causa Cuadernos: acusado de cobrar USD 1,5M+ en sobornos. Su secretario Lazarte acusado de 68 entregas.',
    claim_en: 'Roberto Baratta (former Planning Undersecretary) identified as main Kirchnerist bribe collector. Sentenced to 3.5 years for GNL purchase fraud. On trial in Cuadernos Case: accused of collecting USD 1.5M+ in bribes. His secretary Lazarte accused of 68 deliveries.',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / Perfil',
    source_url: 'https://www.infobae.com/judiciales/2025/11/01/los-cuadernos-de-las-coimas-cuan-fuerte-aprieta-roberto-baratta/',
  },
  {
    id: 'massa-aysa-conflicto-interes',
    claim_es: 'Sergio Massa (Ministro de Economía) autorizó por decreto el déficit de AySA, empresa estatal presidida por su esposa Malena Galmarini. AySA contrató por $127M USD con Mauricio Filiberti ("Rey del Cloro") en condiciones denunciadas como irregulares. Massa no figura en Panama Papers (verificado).',
    claim_en: 'Sergio Massa (Economy Minister) authorized AySA deficit by decree — the state company chaired by his wife Malena Galmarini. AySA contracted for $127M USD with Mauricio Filiberti ("Chlorine King") under conditions denounced as irregular. Massa not in Panama Papers (verified).',
    status: 'confirmed',
    tier: 2,
    source: 'LA NACION / Chequeado',
    source_url: 'https://www.lanacion.com.ar/politica/sergio-massa-autorizo-por-decreto-el-deficit-de-aysa-la-empresa-que-preside-su-esposa-malena-nid07112022/',
    detail_es: 'La denuncia de Coalición Cívica contra Galmarini por el contrato con Filiberti fue desestimada judicialmente. Sin embargo, el conflicto de interés estructural (ministro autorizando déficit de empresa de su esposa) está documentado.',
    detail_en: 'The Civic Coalition complaint against Galmarini for the Filiberti contract was judicially dismissed. However, the structural conflict of interest (minister authorizing deficit of his wife\'s company) is documented.',
  },
  {
    id: 'alberto-fernandez-violencia-genero',
    claim_es: 'Alberto Fernández procesado por violencia de género contra Fabiola Yañez: lesiones leves agravadas (2 ocasiones), lesiones graves agravadas y amenazas coactivas. Violencia sistemática desde 2016. Pena esperada: hasta 18 años. A un paso del juicio oral (marzo 2026).',
    claim_en: 'Alberto Fernández prosecuted for gender violence against Fabiola Yañez: aggravated minor injuries (2 occasions), aggravated serious injuries and coercive threats. Systematic violence since 2016. Expected sentence: up to 18 years. Near oral trial (March 2026).',
    status: 'confirmed',
    tier: 1,
    source: 'Infobae / Fiscales.gob.ar',
    source_url: 'https://www.infobae.com/judiciales/2026/03/19/rafecas-rechazo-un-planteo-de-alberto-fernandez-y-la-causa-por-violencia-de-genero-quedo-a-un-paso-del-juicio-oral/',
  },
  {
    id: 'bonafini-suenos-compartidos-fraude',
    claim_es: 'Hebe de Bonafini (Madres de Plaza de Mayo) procesada por fraude en programa Sueños Compartidos: de $749M recaudados, $206M desviados por hermanos Schoklender para inmuebles, autos, motos y yates. Causa extinguida por fallecimiento de Bonafini en noviembre 2022.',
    claim_en: 'Hebe de Bonafini (Madres de Plaza de Mayo) prosecuted for fraud in Sueños Compartidos program: of $749M collected, $206M diverted by Schoklender brothers for properties, cars, motorcycles and yachts. Case extinguished upon Bonafini\'s death in November 2022.',
    status: 'confirmed',
    tier: 1,
    source: 'LA NACION / Infobae',
    source_url: 'https://www.lanacion.com.ar/politica/bonafini-y-los-schoklender-fueron-procesados-por-el-caso-suenos-compartidos-nid2024192/',
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
    id: 'tl-1976-papel-prensa',
    date: '1976-11-02',
    title_es: 'Clarin y La Nacion se apropian de Papel Prensa bajo dictadura',
    title_en: 'Clarin and La Nacion appropriate Papel Prensa under dictatorship',
    description_es: 'Magnetto amenaza a Lidia Papaleo (viuda de Graiver) para firmar la transferencia de acciones. El 19/4/1977 la dictadura detiene ilegalmente a 6 miembros del grupo Graiver y formaliza la apropiacion.',
    description_en: 'Magnetto threatens Lidia Papaleo (Graiver widow) to sign the share transfer. On 4/19/1977 the dictatorship illegally detains 6 Graiver group members and formalizes the appropriation.',
    category: 'corporate',
    sources: ['https://chequeado.com/el-explicador/claves-para-entender-el-caso-papel-prensa/', 'https://latinta.com.ar/2017/03/24/papel-prensa-cuatro-decadas-de-impunidad/'],
  },
  {
    id: 'tl-1992-lopez-casino-club',
    date: '1992',
    title_es: 'Cristobal Lopez inaugura Casino Club en Chubut',
    title_en: 'Cristobal Lopez inaugurates Casino Club in Chubut',
    description_es: 'Lopez abre la primera casa de juego en Chubut (Comodoro Rivadavia). Casino Club se convertiria en la mayor empresa de juego de Latinoamerica con mas de 20 salas en Misiones, La Pampa, Santa Cruz y Chubut.',
    description_en: 'Lopez opens the first gambling house in Chubut (Comodoro Rivadavia). Casino Club would become the largest gaming company in Latin America with more than 20 halls in Misiones, La Pampa, Santa Cruz and Chubut.',
    category: 'corporate',
    sources: ['https://www.perfil.com/noticias/domingo/como-armo-su-imperio-cristobal-lopez-20140511-0026.phtml'],
  },
  {
    id: 'tl-1992-manzano-exit-politics',
    date: '1992-12',
    title_es: 'Manzano deja la politica y funda Integra Capital',
    title_en: 'Manzano leaves politics and founds Integra Capital',
    description_es: 'Tras su renuncia como Ministro del Interior de Menem con alta imagen negativa, Manzano se autoexilia en EEUU. En 1995 funda Integra Capital en Washington, inicio de su imperio empresarial.',
    description_en: 'After resigning as Interior Minister under Menem with high negative image, Manzano self-exiles in the US. In 1995 he founds Integra Capital in Washington, beginning of his business empire.',
    category: 'corporate',
    sources: ['https://econojournal.com.ar/2021/02/jose-luis-manzano-el-renacido-la-historia-del-hombre-que-se-quedo-con-edenor/'],
  },
  {
    id: 'tl-1996-manzano-vila-america',
    date: '1996',
    title_es: 'Manzano y Vila crean Grupo America (medios)',
    title_en: 'Manzano and Vila create Grupo America (media)',
    description_es: 'Manzano regresa a Argentina y junto a Daniel Vila adquiere America TV, America 24, y multiples medios. Con Francisco de Narvaez construyen el segundo multimedios del pais.',
    description_en: 'Manzano returns to Argentina and with Daniel Vila acquires America TV, America 24, and multiple media outlets. With Francisco de Narvaez they build the country second-largest media group.',
    category: 'corporate',
    sources: ['https://es.wikipedia.org/wiki/Jos%C3%A9_Luis_Manzano_(empresario)'],
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
    id: 'tl-1999-goldman-clarin',
    date: '1999',
    title_es: 'Goldman Sachs adquiere 18% de Grupo Clarin',
    title_en: 'Goldman Sachs acquires 18% of Grupo Clarin',
    description_es: 'Goldman Sachs asume USD 500M de deuda de Clarin a cambio de 18% de acciones con derechos de veto. Marca la entrada del capital financiero internacional en el principal grupo mediatico argentino.',
    description_en: 'Goldman Sachs assumes USD 500M of Clarin debt in exchange for 18% of shares with veto rights. Marks the entry of international financial capital into Argentina main media group.',
    category: 'financial',
    sources: ['https://eleconomista.com.ar/negocios/goldman-sachs-clarin-n2908'],
  },
  {
    id: 'tl-2003-lopez-kirchner-casinos',
    date: '2003-02-01',
    title_es: 'Kirchner adjudica directamente casinos a Cristobal Lopez',
    title_en: 'Kirchner directly awards casinos to Cristobal Lopez',
    description_es: 'Lopez inaugura casino de Rio Gallegos junto al intendente y gobernador Kirchner. Tres emprendimientos de Lopez fueron adjudicados directamente por Nestor Kirchner.',
    description_en: 'Lopez inaugurates Rio Gallegos casino alongside the mayor and Governor Kirchner. Three Lopez ventures were directly awarded by Nestor Kirchner.',
    category: 'political',
    sources: ['https://www.lapoliticaonline.com/nota/nota-29588/'],
  },
  {
    id: 'tl-2005-dnu-475-lopez',
    date: '2005-05-13',
    title_es: 'Kirchner firma DNU 475/05 para privilegiar a Cristobal Lopez',
    title_en: 'Kirchner signs DNU 475/05 to privilege Cristobal Lopez',
    description_es: 'Nestor Kirchner firma Decreto de Necesidad y Urgencia 475/05 otorgando privilegios a Lopez, quien a su vez alquilaba habitaciones de hotel en El Calafate a los Kirchner.',
    description_en: 'Nestor Kirchner signs emergency decree 475/05 granting privileges to Lopez, who in turn rented hotel rooms in El Calafate to the Kirchners.',
    category: 'political',
    sources: ['https://www.lanacion.com.ar/politica/negocios-a-medida-para-cristobal-lopez-nid1747341/'],
  },
  {
    id: 'tl-2007-clarin-ipo',
    date: '2007-10',
    title_es: 'Clarin sale a bolsa en Londres y Buenos Aires',
    title_en: 'Clarin goes public in London and Buenos Aires',
    description_es: 'Grupo Clarin cotiza en London Stock Exchange y BCBA. 20% del capital sale a la venta, incluyendo mitad de participacion de Goldman Sachs. 80% de la oferta va a inversores extranjeros.',
    description_en: 'Grupo Clarin lists on London Stock Exchange and BCBA. 20% of capital goes on sale, including half of Goldman Sachs stake. 80% of the offering goes to foreign investors.',
    category: 'financial',
    sources: ['https://nacionalypopular.com/2018/02/10/los-accionistas-del-grupo-clarin/'],
  },
  {
    id: 'tl-2009-noctua-founded',
    date: '2009-01-01',
    title_es: 'Caputo funda Noctua Partners con estructura offshore',
    title_en: 'Caputo founds Noctua Partners with offshore structure',
    description_es: 'Caputo crea Princess International (Caiman, 75%) → Affinis Partners II → Noctua → Alto Global Fund (US$100M+). Nunca declarado.',
    description_en: 'Caputo creates Princess International (Cayman, 75%) → Affinis Partners II → Noctua → Alto Global Fund (US$100M+). Never declared.',
    category: 'financial',
    sources: ['https://www.lanacion.com.ar/politica/luis-caputo-estuvo-vinculado-a-un-entramado-de-fondos-offshore-nid2079604/'],
  },
  {
    id: 'tl-2012-lopez-buys-c5n',
    date: '2012',
    title_es: 'Cristobal Lopez compra C5N y Radio 10 a Daniel Hadad',
    title_en: 'Cristobal Lopez buys C5N and Radio 10 from Daniel Hadad',
    description_es: 'Lopez entra al mercado mediatico porteno comprando cinco radios (Radio 10, FM Vale, One, Mega, Pop) y la senal de noticias C5N. Grupo Indalo se expande de casinos y petroleo a medios.',
    description_en: 'Lopez enters the Buenos Aires media market buying five radio stations (Radio 10, FM Vale, One, Mega, Pop) and news channel C5N. Grupo Indalo expands from casinos and oil to media.',
    category: 'corporate',
    sources: ['https://es.wikipedia.org/wiki/Grupo_Indalo'],
  },
  {
    id: 'tl-2012-axis-founded',
    date: '2012-03-08',
    title_es: 'Caputo funda AXIS SGFCI (60% dueno)',
    title_en: 'Caputo founds AXIS SGFCI (60% owner)',
    description_es: 'Funda mutual fund manager con Carlos Planas. Luego aprobaria inversion de AR$500M de ANSES en su propio fondo.',
    description_en: 'Founds mutual fund manager with Carlos Planas. Would later approve AR$500M ANSES investment into his own fund.',
    category: 'financial',
    sources: ['https://www.pagina12.com.ar/61421-un-fondo-de-inversion-amigo'],
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
    id: 'tl-2016-axis-anses-scandal',
    date: '2016-04-01',
    title_es: 'Escandalo AXIS/ANSES: Caputo aprueba inversion en su propio fondo',
    title_en: 'AXIS/ANSES scandal: Caputo approves investment in his own fund',
    description_es: 'FGS invierte AR$500M en AXIS Ahorro Plus (fondo de Caputo). Comisiones a AXIS y Deutsche Bank. UFISES denuncia penalmente.',
    description_en: 'FGS invests AR$500M in AXIS Ahorro Plus (Caputo fund). Commissions to AXIS and Deutsche Bank. UFISES files criminal complaint.',
    category: 'legal',
    sources: ['https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/'],
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
    id: 'tl-2016-lopez-bolsos',
    date: '2016-06-14',
    title_es: 'José López detenido con USD 9M en convento de Gral. Rodríguez',
    title_en: 'José López arrested with USD 9M at General Rodríguez convent',
    description_es: 'El ex Secretario de Obras Públicas José López es detenido intentando ocultar bolsos con USD 9 millones, joyas y un arma en un convento de General Rodríguez. El episodio se convierte en símbolo de la corrupción kirchnerista.',
    description_en: 'Former Public Works Secretary José López arrested trying to hide bags with USD 9 million, jewels and a weapon at a General Rodríguez convent. The episode becomes a symbol of Kirchnerist corruption.',
    category: 'legal',
    sources: ['https://www.infobae.com/judiciales/2025/12/11/casacion-dejo-firme-la-pena-de-13-anos-de-carcel-contra-jose-lopez-por-corrupcion-y-el-caso-de-los-bolsos-del-convento/'],
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
    id: 'tl-2017-lopez-desousa-arrest',
    date: '2017-12',
    title_es: 'Detencion de Cristobal Lopez y Fabian De Sousa',
    title_en: 'Arrest of Cristobal Lopez and Fabian De Sousa',
    description_es: 'Juez Ercolini procesa y ordena detencion de ambos empresarios por defraudacion al Estado en causa Oil Combustibles. La detencion se extiende con idas y vueltas judiciales hasta 2018.',
    description_en: 'Judge Ercolini processes and orders arrest of both businessmen for fraud against the State in the Oil Combustibles case. Detention extends with judicial back-and-forth until 2018.',
    category: 'legal',
    sources: ['https://www.infobae.com/politica/2019/09/12/el-empresario-fabian-de-sousa-declaro-en-el-caso-oil-combustibles-soy-parte-de-un-proceso-de-persecucion-politica/'],
  },
  {
    id: 'tl-2018-cablevision-telecom',
    date: '2018-06',
    title_es: 'Clarin fusiona Cablevision y Telecom: ~70% del mercado de telecomunicaciones',
    title_en: 'Clarin merges Cablevision and Telecom: ~70% of telecom market',
    description_es: 'El gobierno de Macri aprueba la fusion. La nueva empresa controla TV cable, datos, telefonia movil y fija. Con David Martinez (Fintech, 40% de Cablevision) como socio minoritario.',
    description_en: 'Macri government approves the merger. The new company controls cable TV, data, mobile and fixed telephony. With David Martinez (Fintech, 40% of Cablevision) as minority partner.',
    category: 'corporate',
    sources: ['https://www.perfil.com/noticias/politica/aprobaron-la-fusion-entre-cablevision-y-telecom.phtml'],
  },
  {
    id: 'tl-2018-boudou-condena',
    date: '2018-08',
    title_es: 'Boudou condenado por Ciccone: primer vicepresidente con condena por corrupción',
    title_en: 'Boudou convicted in Ciccone: first VP with corruption conviction',
    description_es: 'Amado Boudou condenado a 5 años y 10 meses por cohecho pasivo y negociaciones incompatibles al adquirir encubiertamente la imprenta Ciccone Calcográfica.',
    description_en: 'Amado Boudou sentenced to 5 years 10 months for passive bribery and incompatible negotiations for covertly acquiring Ciccone Calcográfica printing press.',
    category: 'legal',
    sources: ['https://chequeado.com/el-explicador/causa-ciccone-la-corte-confirmo-la-sentencia-de-boudou-y-se-convirtio-en-el-primer-vicepresidente-condenado-por-corrupcion/'],
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
    id: 'tl-2020-edenor-vila-manzano',
    date: '2020-12-28',
    title_es: 'Vila-Manzano-Filiberti compran Edenor por USD 100M',
    title_en: 'Vila-Manzano-Filiberti buy Edenor for USD 100M',
    description_es: 'El consorcio de medios compra la mayor distribuidora electrica de Sudamerica a Pampa Energia (Mindlin). Desembolso inicial: USD 55M. Clausula de contingencia por cambio de control en primer ano.',
    description_en: 'The media consortium buys South America largest electricity distributor from Pampa Energia (Mindlin). Initial disbursement: USD 55M. Contingency clause for change of control in first year.',
    category: 'corporate',
    sources: ['https://www.pagina12.com.ar/314110-mindlin-le-vendio-edenor-a-vila-manzano', 'https://econojournal.com.ar/2020/12/la-curiosa-clausula-que-incluyo-mindlin-para-venderle-edenor-a-manzano/'],
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
    id: 'tl-2021-pandora-papers-media',
    date: '2021-10-18',
    title_es: 'Pandora Papers revelan offshores de duenos de Clarin, La Nacion y Perfil',
    title_en: 'Pandora Papers reveal offshores of Clarin, La Nacion and Perfil owners',
    description_es: 'Magnetto, Aranda, Saguier y Fontevecchia aparecen con sociedades en BVI y Uruguay. Los propios medios omiten la informacion en su cobertura de los Pandora Papers.',
    description_en: 'Magnetto, Aranda, Saguier and Fontevecchia appear with companies in BVI and Uruguay. The media outlets themselves omit the information in their Pandora Papers coverage.',
    category: 'financial',
    sources: ['https://www.eldiarioar.com/politica/pandora-papers/magnetto-fontevecchia-saguier-aranda-duenos-principales-medios-argentina-han-abierto-sociedades-paraisos-fiscales-uruguay_1_8403360.amp.html'],
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
    id: 'tl-2022-lago-escondido',
    date: '2022-11',
    title_es: 'Escandalo Lago Escondido: jueces de Comodoro Py con ejecutivos de Clarin',
    title_en: 'Lago Escondido scandal: Comodoro Py judges with Clarin executives',
    description_es: 'Se filtra que jueces Ercolini y Mahiques viajaron a Lago Escondido (estancia de Joe Lewis) invitados por Rendo y Casey (Clarin). Intentaron encubrir con facturas truchas.',
    description_en: 'It leaks that judges Ercolini and Mahiques traveled to Lago Escondido (Joe Lewis estate) invited by Rendo and Casey (Clarin). They tried to cover up with fake invoices.',
    category: 'legal',
    sources: ['https://www.eldestapeweb.com/politica/los-jueces-de-clarin/clarin-invito-a-jueces-del-lawfare-a-lago-escondido-y-buscaron-encubrirlo-con-facturas-truchas-y-el-direccionamiento-de-una-causa-judicial-202212419450'],
  },
  {
    id: 'tl-2022-cristina-vialidad-condena',
    date: '2022-12',
    title_es: 'Cristina Kirchner condenada a 6 años en Causa Vialidad',
    title_en: 'Cristina Kirchner sentenced to 6 years in Vialidad Case',
    description_es: 'El Tribunal Oral Federal condena a Cristina Fernández de Kirchner a 6 años de prisión e inhabilitación perpetua por administración fraudulenta en la adjudicación de obra pública a Lázaro Báez en Santa Cruz.',
    description_en: 'Federal Oral Tribunal sentences Cristina Fernández de Kirchner to 6 years prison and perpetual disqualification for fraudulent administration in awarding public works to Lázaro Báez in Santa Cruz.',
    category: 'legal',
    sources: ['https://chequeado.com/el-explicador/juicio-a-cristina-fernandez-de-kirchner-todas-las-respuestas-para-entender-la-causa-vialidad/'],
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
    id: 'tl-2024-corte-oil-combustibles',
    date: '2024-05',
    title_es: 'Corte Suprema anula absolucion de Lopez y De Sousa (Oil Combustibles)',
    title_en: 'Supreme Court annuls acquittal of Lopez and De Sousa (Oil Combustibles)',
    description_es: 'La Corte Suprema por unanimidad anula las absoluciones de Cristobal Lopez y Fabian De Sousa en la causa por evasion fiscal de $8.000M del ITC.',
    description_en: 'The Supreme Court unanimously annuls the acquittals of Cristobal Lopez and Fabian De Sousa in the $8,000M ITC tax evasion case.',
    category: 'legal',
    sources: ['https://www.eldiarioweb.com/2024/05/la-corte-anulo-la-absolucion-de-cristobal-lopez-y-fabian-de-sousa-por-evasion-fiscal/'],
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
    id: 'tl-2024-fundacion-faro-launch',
    date: '2024-11-13',
    title_es: 'Lanzamiento de Fundación Faro con Milei',
    title_en: 'Fundación Faro launch with Milei',
    description_es:
      'Fundación Faro (ex-Fundación Valorar) lanzada con presencia de Javier y Karina Milei. Cenas de recaudación a $25.000/plato.',
    description_en:
      'Fundación Faro (ex-Fundación Valorar) launched with Javier and Karina Milei present. $25,000/plate fundraising dinners.',
    category: 'political',
    sources: ['https://chequeado.com/investigaciones/fundacion-faro-el-think-tank-libertario-que-mas-pauta-electoral-puso-en-2025-y-que-no-declara-el-origen-de-sus-fondos/'],
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
    id: 'tl-2024-cndc-cartel-charge',
    date: '2024-12-12',
    title_es: 'CNDC imputa cartelización de prepagas',
    title_en: 'CNDC charges prepaid health cartel',
    description_es:
      'CNDC imputó a Swiss Medical, OSDE, Galeno, Medife, Omint y Belocopitt por cartelización. Aumentos coordinados de ~150% vs ~70% inflación.',
    description_en:
      'CNDC charged Swiss Medical, OSDE, Galeno, Medife, Omint, and Belocopitt for cartelization. Coordinated increases of ~150% vs ~70% inflation.',
    category: 'legal',
    sources: ['https://www.argentina.gob.ar/noticias/la-cndc-imputa-por-presunta-cartelizacion-las-principales-empresas-de-medicina-prepaga-0'],
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
    id: 'tl-2025-nucleoelectrica-overpricing',
    date: '2025-01-27',
    title_es: 'ATE denuncia sobreprecio de 1.066% en Nucleoeléctrica',
    title_en: 'ATE denounces 1,066% overpricing at Nucleoeléctrica',
    description_es:
      'Sobreprecio de 1.066,7% en sistema SAP S/4HANA: USD 7M por sistema que reemplazaba uno de ~USD 600K.',
    description_en:
      '1,066.7% overpricing on SAP S/4HANA system: USD 7M for system replacing one costing ~USD 600K.',
    category: 'financial',
    sources: ['https://ate.org.ar/260127-sobreprecio-nasa/'],
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
    id: 'tl-2025-tether-adecoagro',
    date: '2025-03-27',
    title_es: 'Tether compra Adecoagro por USD 600M: cripto entra al agro argentino',
    title_en: 'Tether buys Adecoagro for USD 600M: crypto enters Argentine agriculture',
    description_es: 'Tether Investments (USD 14.000M ganancia 2024) adquiere hasta 70% de Adecoagro, fundada por Soros. Plan de USD 3.000M en inversiones argentinas en IA, energia, agro y medios digitales.',
    description_en: 'Tether Investments (USD 14B profit 2024) acquires up to 70% of Adecoagro, founded by Soros. Plan for USD 3B in Argentine investments in AI, energy, agro and digital media.',
    category: 'financial',
    sources: ['https://www.infobae.com/economia/2025/03/27/un-gigante-cripto-invertira-usd-600-millones-en-la-argentina-para-quedarse-con-el-control-de-adecoagro/'],
  },
  {
    id: 'tl-2025-lijo-senate-rejection',
    date: '2025-04-03',
    title_es: 'Senado rechaza candidatura de Lijo a Corte Suprema (43-27)',
    title_en: 'Senate rejects Lijo Supreme Court candidacy (43-27)',
    description_es:
      'Primera vez desde 1983 que se rechaza un candidato judicial en el recinto. 43 negativos, 27 afirmativos, 1 abstención.',
    description_en:
      'First time since 1983 a judicial candidate was rejected in the chamber. 43 against, 27 for, 1 abstention.',
    category: 'legal',
    sources: ['https://www.infobae.com/politica/2025/04/03/con-votos-del-pro-y-el-kirchnerismo-el-senado-rechazo-las-candidaturas-de-ariel-lijo-y-garcia-mansilla-a-la-corte-suprema/'],
  },
  {
    id: 'tl-2025-lopez-retakes-c5n',
    date: '2025-05',
    title_es: 'Cristobal Lopez desplaza a De Sousa y retoma control de C5N',
    title_en: 'Cristobal Lopez displaces De Sousa and retakes control of C5N',
    description_es: 'Lopez (70% Indalo) desplaza a su socio De Sousa (30%) y retoma control directo de C5N, Radio 10, Ambito Financiero y Minutouno.',
    description_en: 'Lopez (70% Indalo) displaces his partner De Sousa (30%) and retakes direct control of C5N, Radio 10, Ambito Financiero and Minutouno.',
    category: 'corporate',
    sources: ['https://www.noticiasnqn.com.ar/noticias/2025/05/27/314143-cristobal-lopez-retomo-el-control-de-c5n-radio-10-y-mbito-financiero-tras-desplazar-a-fabian-de-sousa'],
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
    id: 'tl-2025-06-corte-confirma-cristina',
    date: '2025-06-10',
    title_es: 'Corte Suprema confirma condena a Cristina: prisión domiciliaria e inhabilitación',
    title_en: 'Supreme Court confirms Cristina conviction: house arrest and disqualification',
    description_es: 'La Corte Suprema deja firme la condena a Cristina Kirchner en Causa Vialidad. No podrá ser candidata. Cumple prisión domiciliaria. Decomiso de bienes por hasta USD 640M.',
    description_en: 'Supreme Court makes Cristina Kirchner Vialidad conviction final. Cannot be a candidate. Serves house arrest. Asset forfeiture up to USD 640M.',
    category: 'legal',
    sources: ['https://www.lanacion.com.ar/politica/la-corte-suprema-confirmo-la-condena-a-cristina-kirchner-a-prision-y-no-podra-ser-candidata-nid10062025/'],
  },
  {
    id: 'tl-2025-07-fernandez-seguros',
    date: '2025-07-10',
    title_es: 'Procesan a Alberto Fernández por Causa Seguros',
    title_en: 'Alberto Fernández prosecuted in Insurance Case',
    description_es: 'El juez Casanello procesa a Alberto Fernández por negociaciones incompatibles: el Decreto 823/2021 benefició al broker Héctor Martínez Sosa (esposo de su secretaria) con 59,6% de las comisiones de Nación Seguros.',
    description_en: 'Judge Casanello prosecutes Alberto Fernández for incompatible negotiations: Decree 823/2021 benefited broker Héctor Martínez Sosa (his secretary\'s husband) with 59.6% of Nación Seguros commissions.',
    category: 'legal',
    sources: ['https://www.lanacion.com.ar/politica/procesaron-a-alberto-fernandez-en-el-caso-de-los-seguros-por-negociaciones-incompatibles-con-su-nid10072025/'],
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
    id: 'tl-2025-09-devido-gnl',
    date: '2025-09-30',
    title_es: 'De Vido condenado por fraude en compra de GNL',
    title_en: 'De Vido convicted for fraud in LNG purchases',
    description_es: 'De Vido condenado a 4 años por defraudar al Estado en la compra de Gas Natural Licuado: pagos innecesarios de USD 5,5M a intermediarios con sobreprecios.',
    description_en: 'De Vido sentenced to 4 years for defrauding the State in LNG purchases: unnecessary payments of USD 5.5M to intermediaries with overpricing.',
    category: 'legal',
    sources: ['https://www.lanacion.com.ar/politica/fraude-millonario-condenaron-a-julio-de-vido-baratta-y-nicolas-dromi-por-la-compra-de-gas-licuado-nid30092025/'],
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
    id: 'tl-2025-11-devido-once-firme',
    date: '2025-11-11',
    title_es: 'Corte confirma condena a De Vido por tragedia de Once',
    title_en: 'Court confirms De Vido conviction for Once tragedy',
    description_es: 'La Corte Suprema deja firme la condena a 4 años de prisión a De Vido por administración fraudulenta vinculada a la tragedia de Once (52 muertos, 789 heridos en 2012).',
    description_en: 'Supreme Court makes final the 4-year conviction of De Vido for fraudulent administration linked to the Once tragedy (52 dead, 789 injured in 2012).',
    category: 'legal',
    sources: ['https://www.lanacion.com.ar/politica/la-corte-confirmo-la-condena-contra-julio-de-vido-por-la-tragedia-de-once-nid11112025/'],
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
  {
    id: 'tl-2025-12-baez-15-anos',
    date: '2025-12-15',
    title_es: 'Confirman condena unificada de 15 años a Lázaro Báez',
    title_en: 'Unified 15-year sentence for Lázaro Báez confirmed',
    description_es: 'Casación confirma pena unificada de 15 años de prisión a Lázaro Báez por Ruta del Dinero K (lavado USD 54,87M) y Vialidad (fraude en 51 obras). Multa de USD 329M.',
    description_en: 'Cassation confirms unified 15-year sentence for Lázaro Báez for Ruta del Dinero K (laundering USD 54.87M) and Vialidad (fraud in 51 works). Fine of USD 329M.',
    category: 'legal',
    sources: ['https://www.infobae.com/judiciales/2025/12/15/confirmaron-otra-condena-a-lazaro-baez-en-la-causa-el-entrevero-ya-acumula-penas-por-casi-20-anos-de-carcel/'],
  },
  {
    id: 'tl-2025-afagate-investigation',
    date: '2025-12-28',
    title_es: 'Investigación AFAGate: USD 400M desviados',
    title_en: 'AFAGate investigation: USD 400M diverted',
    description_es:
      'La Nación revela USD 400M desviados por sociedades fantasma en Florida desde cuentas de AFA.',
    description_en:
      'La Nación reveals USD 400M diverted through Florida shell companies from AFA accounts.',
    category: 'financial',
    sources: ['https://www.lanacion.com.ar/politica/investigacion-exclusiva-desde-la-cuenta-que-administra-los-fondos-de-la-afa-en-eeuu-se-desviaron-al-nid28122025/'],
  },
  {
    id: 'tl-2025-dnu-941-intelligence',
    date: '2025-12-31',
    title_es: 'DNU 941/2025: reforma sistema de inteligencia',
    title_en: 'DNU 941/2025: intelligence system reform',
    description_es:
      'Milei reestructura sistema de inteligencia. Habilita FFAA en inteligencia interna y capacidad de aprehensión. CELS alerta sobre vigilancia masiva.',
    description_en:
      'Milei restructures intelligence system. Enables military in domestic intelligence and apprehension power. CELS alerts about mass surveillance.',
    category: 'political',
    sources: ['https://www.infobae.com/politica/2026/01/02/reforma-de-la-side-las-claves-de-la-reestructuracion-del-sistema-de-inteligencia-que-dispuso-milei-por-decreto/'],
  },
  {
    id: 'tl-2026-02-devido-enriquecimiento',
    date: '2026-02-09',
    title_es: 'Procesan a De Vido por enriquecimiento ilícito',
    title_en: 'De Vido prosecuted for illicit enrichment',
    description_es: 'El juez Casanello procesa a De Vido y su esposa por enriquecimiento ilícito: USD 690.000 en patrimonio injustificado tras 18 años sin poder explicar origen de bienes.',
    description_en: 'Judge Casanello prosecutes De Vido and his wife for illicit enrichment: USD 690K in unjustified assets after 18 years unable to explain asset origins.',
    category: 'legal',
    sources: ['https://www.labrujula24.com/notas/2026/02/09/de-vido-no-pudo-justificar-su-patrimonio-y-lo-procesaron-por-enriquecimiento-ilicito-n483611/'],
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
    id: 'tl-2026-bachellier-embargo',
    date: '2026-02-10',
    title_es: 'Embargo de $9.669M a Bachellier SA',
    title_en: 'Bachellier SA assets frozen at $9.669B',
    description_es:
      'Juez Casanello embargó $9.669M en activos de Bachellier SA. Empresa recibió $1.666M en comisiones de Nación Seguros.',
    description_en:
      'Judge Casanello froze $9.669B in Bachellier SA assets. Company received $1.666B in commissions from Nación Seguros.',
    category: 'legal',
    sources: ['https://www.infobae.com/judiciales/2026/02/10/causa-seguros-procesaron-a-la-empresa-de-hector-martinez-sosa-el-broker-amigo-de-alberto-fernandez/'],
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
    source_url: 'https://offshoreleaks.icij.org/search?q=Camano&cat=0',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    source_url: 'https://offshoreleaks.icij.org/search?q=BETHAN+INVESTMENTS&cat=0',
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
    source_url: 'https://aportantes.electoral.gob.ar/aportes/',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    source_url: 'https://www.iprofesional.com/politica/380149-lousteau-le-facturaria-un-extra-al-congreso-desde-su-consultora',
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
    source_url: 'https://offshoreleaks.icij.org/nodes/240040844',
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
    source_url: 'https://offshoreleaks.icij.org/stories/nestor-grindetti',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    role_es: 'Expresidente — Causa Seguros + Violencia de género',
    role_en: 'Former President — Insurance Case + Gender violence',
    description_es:
      'Firmó Decreto 823/2021 que obligó al Estado a contratar con Nación Seguros, creando monopolio explotado por broker Martínez Sosa (59,6% de comisiones). Procesado y confirmado en Causa Seguros por negociaciones incompatibles. Procesado por violencia de género contra Fabiola Yañez (3 delitos, pena esperada 18 años). Patrimonio declarado: $14M ARS al salir de la presidencia. Bienes inhibidos por orden judicial.',
    description_en:
      'Signed Decree 823/2021 mandating state contracting with Nación Seguros, creating monopoly exploited by broker Martínez Sosa (59.6% of commissions). Prosecuted and confirmed in Insurance Case for incompatible negotiations. Prosecuted for gender violence against Fabiola Yañez (3 charges, expected sentence 18 years). Declared assets: ARS $14M upon leaving presidency. Assets frozen by court order.',
    party: 'Frente de Todos',
    datasets: 3,
    status_es: 'Procesado — Causa Seguros (Casación en revisión, Feb 2026) + Violencia de género (a un paso del juicio oral)',
    status_en: 'Prosecuted — Insurance Case (Cassation review, Feb 2026) + Gender violence (near oral trial)',
    source_url: 'https://www.lanacion.com.ar/politica/procesaron-a-alberto-fernandez-en-el-caso-de-los-seguros-por-negociaciones-incompatibles-con-su-nid10072025/',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
  {
    id: 'reidel-demian',
    name: 'Demian Reidel',
    role_es: 'Ex-presidente Nucleoeléctrica',
    role_en: 'Former president Nucleoeléctrica',
    description_es:
      'Aliado de Milei. Sobreprecio de 1.066% en sistema SAP. Pagó deudas personales de $880M a Banco Macro en 18 días. Renunció 9/2/2026.',
    description_en:
      'Milei ally. 1,066% overpricing on SAP system. Paid personal debts of $880M to Banco Macro in 18 days. Resigned 2/9/2026.',
    party: 'La Libertad Avanza',
    datasets: 3,
    status_es: 'Renunció — sobreprecio 1.066% documentado',
    status_en: 'Resigned — 1,066% overpricing documented',
    source_url: 'https://www.infobae.com/politica/2026/02/09/demian-reidel-renuncio-a-la-presidencia-de-nucleoelectrica/',
  },
  {
    id: 'tapia-claudio',
    name: 'Claudio Tapia',
    role_es: 'Presidente AFA',
    role_en: 'AFA President',
    description_es:
      'AFAGate: ~USD 400M desviados por sociedades fantasma en Florida. $19.353B en impuestos impagos. Citado por fraude y lavado.',
    description_en:
      'AFAGate: ~USD 400M diverted through Florida shell companies. $19.353B in unpaid taxes. Summoned for fraud and laundering.',
    party: 'Independiente',
    datasets: 2,
    status_es: 'Procesado — citado por fraude y lavado (AFAGate)',
    status_en: 'Processed — summoned for fraud and laundering (AFAGate)',
    source_url: 'https://www.lanacion.com.ar/politica/investigacion-exclusiva-desde-la-cuenta-que-administra-los-fondos-de-la-afa-en-eeuu-se-desviaron-al-nid28122025/',
  },
  {
    id: 'montoto-mario',
    name: 'Mario Montoto',
    role_es: 'Dueño SURELY SA',
    role_en: 'Owner SURELY SA',
    description_es:
      'Ex-Montonero. Padre de Fernanda Raverta (ex-ANSES). Proveedor único de tobilleras electrónicas a 4x precio internacional.',
    description_en:
      'Ex-Montonero. Father of Fernanda Raverta (ex-ANSES). Sole ankle bracelet provider at 4x international price.',
    party: 'Independiente',
    datasets: 2,
    status_es: 'Denunciado — sobreprecios 4x en contrato estatal',
    status_en: 'Denounced — 4x overpricing on state contract',
    source_url: 'https://www.lanacion.com.ar/politica/polemica-y-denuncias-por-el-contrato-de-tobilleras-electronicas-que-se-encamina-a-ganar-montoto-por-nid27042025/',
  },
  {
    id: 'laje-agustin',
    name: 'Agustín Laje',
    role_es: 'Director Ejecutivo Fundación Faro',
    role_en: 'Executive Director Fundación Faro',
    description_es:
      'Operador de dark money de Milei. Fundación gastó $1.079B en publicidad política sin declarar donantes.',
    description_en:
      'Milei dark money operator. Foundation spent $1.079B on political ads without disclosing donors.',
    party: 'La Libertad Avanza',
    datasets: 2,
    status_es: 'En funciones — financiamiento no declarado documentado',
    status_en: 'In office — undisclosed financing documented',
    source_url: 'https://chequeado.com/investigaciones/fundacion-faro-el-think-tank-libertario-que-mas-pauta-electoral-puso-en-2025-y-que-no-declara-el-origen-de-sus-fondos/',
  },
  {
    id: 'bausili-santiago',
    name: 'Santiago Bausili',
    role_es: 'Presidente BCRA',
    role_en: 'BCRA President',
    description_es:
      'Ex-Deutsche Bank (9 años). Recibió ~USD 200K de DB mientras era Secretario de Finanzas. Procesado por negociaciones incompatibles.',
    description_en:
      'Ex-Deutsche Bank (9 years). Received ~USD 200K from DB while Finance Secretary. Processed for incompatible negotiations.',
    party: 'La Libertad Avanza',
    datasets: 3,
    status_es: 'Procesado — negociaciones incompatibles',
    status_en: 'Processed — incompatible negotiations',
    source_url: 'https://www.pagina12.com.ar/780526-bausili-investigado-por-corrupcion/',
  },
  {
    id: 'pesce-agustin',
    name: 'Agustín Pesce',
    role_es: 'Director estatal + directivo privado',
    role_en: 'State Director + private board member',
    description_es:
      'Puerta giratoria: Director gubernamental + directivo de Nación Reaseguros, Red Link, Prisma Medios de Pago, BICE.',
    description_en:
      'Revolving door: Government Director + officer of Nación Reaseguros, Red Link, Prisma Medios de Pago, BICE.',
    party: 'Independiente',
    datasets: 4,
    status_es: 'Puerta giratoria — sin causa penal',
    status_en: 'Revolving door — no criminal case',
    source_url: 'https://www.ambito.com/economia/el-gobierno-designo-agustin-pesce-el-bice-su-paso-el-bcra-n6020992',
  },
  {
    id: 'eurnekian-eduardo',
    name: 'Eduardo Eurnekian',
    role_es: 'Mentor de Milei / Corporacion America',
    role_en: 'Milei Mentor / Corporacion America',
    description_es: 'Fortuna USD 1.900M. Corporacion America: 35 aeropuertos, CGC energia, Wilobank. Milei trabajo como su economista jefe 10+ anios. Posse (ex-ejecutivo) fue Jefe de Gabinete.',
    description_en: 'Fortune USD 1.9B. Corporacion America: 35 airports, CGC energy, Wilobank. Milei worked as his chief economist 10+ years. Posse (ex-exec) became Chief of Staff.',
    party: 'Independiente',
    datasets: 3,
    status_es: 'Conflicto de interés — vínculo directo con presidente',
    status_en: 'Conflict of interest — direct link to president',
    source_url: 'https://www.lanacion.com.ar/politica/milei-eurnekian-la-historia-detras-de-un-vinculo-que-define-el-nuevo-poder-nid10092023/',
  },
  {
    id: 'menem-carlos',
    name: 'Carlos Menem',
    role_es: 'Presidente 1989-1999',
    role_en: 'President 1989-1999',
    description_es: 'Privatizo Correo, AA2000, YPF, ferrocarriles. Zulemita opero 4 offshore durante su presidencia (Pandora Papers). Martin Menem (sobrino) preside Diputados bajo Milei.',
    description_en: 'Privatized Correo, AA2000, YPF, railways. Zulemita operated 4 offshore companies during his presidency (Pandora Papers). Martin Menem (nephew) chairs Deputies under Milei.',
    party: 'PJ',
    datasets: 3,
    status_es: 'Fallecido (2021)',
    status_en: 'Deceased (2021)',
    source_url: 'https://www.infobae.com/america/pandora-papers/2021/10/10/mientras-menem-era-presidente-zulemita-opero-en-paraisos-fiscales-para-cobrar-una-supuesta-deuda-familiar-y-hacer-negocios/',
  },
  {
    id: 'menem-martin',
    name: 'Martin Menem',
    role_es: 'Presidente Camara de Diputados',
    role_en: 'President Chamber of Deputies',
    description_es: 'Sobrino de Carlos Menem. Preside Diputados bajo Milei. Dueno de Gentech (suplementos). Dinastia politica La Rioja.',
    description_en: 'Carlos Menem nephew. Chairs Deputies under Milei. Owns Gentech (supplements). La Rioja political dynasty.',
    party: 'La Libertad Avanza',
    datasets: 2,
    status_es: 'En funciones — Presidente Diputados',
    status_en: 'In office — Chamber President',
    source_url: 'https://www.izquierdadiario.es/Martin-Menem-el-hijo-dilecto-de-la-casta-politica-empresarial-que-presidira-Diputados',
  },

  // ── Wave 4: Media-Politics Nexus Actors ───────────────────────────────────
  {
    id: 'hector-magnetto',
    name: 'Hector Magnetto',
    role_es: 'CEO Grupo Clarin (1974-presente)',
    role_en: 'CEO Grupo Clarin (1974-present)',
    description_es: 'Controla 83% de Grupo Clarin con herederos de Noble. 45+ anos al frente del mayor conglomerado mediatico argentino. Forzó fusion Cablevision-Telecom (~70% telecomunicaciones). Aparece en Pandora Papers (Mather Holdings, Silkwood Investments, BVI). Sobrino Pablo Casey involucrado en escandalo Lago Escondido con jueces federales.',
    description_en: 'Controls 83% of Grupo Clarin with Noble heirs. 45+ years leading Argentina largest media conglomerate. Forced Cablevision-Telecom merger (~70% telecom). Appears in Pandora Papers (Mather Holdings, Silkwood Investments, BVI). Nephew Pablo Casey involved in Lago Escondido scandal with federal judges.',
    party: 'Independiente (empresario)',
    datasets: 4,
    status_es: 'Sobreseido en causa Papel Prensa (2017). Pandora Papers revelaron offshores.',
    status_en: 'Cleared in Papel Prensa case (2017). Pandora Papers revealed offshores.',
    source_url: 'https://en.wikipedia.org/wiki/H%C3%A9ctor_Magnetto',
  },
  {
    id: 'jose-luis-manzano',
    name: 'Jose Luis Manzano',
    role_es: 'Empresario / Ex Ministro del Interior (Menem)',
    role_en: 'Businessman / Former Interior Minister (Menem)',
    description_es: 'Ex ministro menemista, hoy controla desde Ginebra: Grupo America (2do multimedios), Edenor (3M clientes), Metrogas, Phoenix Global Resources (petroleo), 243.000 ha de litio (Catamarca/Jujuy). Fundo Integra Capital (1995). Socio historico de Daniel Vila y Mauricio Filiberti. Visito a Milei en Miami (nov 2025).',
    description_en: 'Former Menem minister, now controls from Geneva: Grupo America (2nd media group), Edenor (3M customers), Metrogas, Phoenix Global Resources (oil), 243,000 ha of lithium (Catamarca/Jujuy). Founded Integra Capital (1995). Historical partner of Daniel Vila and Mauricio Filiberti. Visited Milei in Miami (Nov 2025).',
    party: 'PJ (ex politico)',
    datasets: 3,
    status_es: 'Activo. Investigado por compra de acciones Edenor (2022). Reposicionado con gobierno Milei.',
    status_en: 'Active. Investigated for Edenor share purchase (2022). Repositioned with Milei government.',
    source_url: 'https://es.wikipedia.org/wiki/Jos%C3%A9_Luis_Manzano_(empresario)',
  },
  {
    id: 'daniel-vila',
    name: 'Daniel Vila',
    role_es: 'Co-fundador Grupo America / Co-dueno Edenor',
    role_en: 'Co-founder Grupo America / Co-owner Edenor',
    description_es: 'Socio historico de Manzano. Co-controla Grupo America (America TV, America 24, El Cronista, Radio La Red) y Edenor. Desde medios de Mendoza construyo el segundo multimedios nacional.',
    description_en: 'Historical partner of Manzano. Co-controls Grupo America (America TV, America 24, El Cronista, Radio La Red) and Edenor. From Mendoza media he built the second-largest national media group.',
    party: 'Independiente (empresario)',
    datasets: 3,
    status_es: 'Concentración mediática documentada — sin causa penal',
    status_en: 'Media concentration documented — no criminal case',
    source_url: 'https://www.iprofesional.com/negocios/343752-como-vila-y-manzano-compraron-edenor-sin-violar-la-ley-de-medios',
  },
  {
    id: 'cristobal-lopez',
    name: 'Cristobal Lopez',
    role_es: 'Dueno Grupo Indalo',
    role_en: 'Owner Grupo Indalo',
    description_es: 'El "zar del juego" kirchnerista. Controla C5N, Radio 10, Ambito Financiero, Minutouno. Acumulo $8.000M de deuda fiscal (ITC) via Oil Combustibles durante kirchnerismo. Obtuvo casinos por adjudicacion directa de Nestor Kirchner. Absolucion anulada por Corte Suprema (2024). En 2025 desplazo a socio De Sousa para retomar medios.',
    description_en: 'The Kirchnerist "gambling czar." Controls C5N, Radio 10, Ambito Financiero, Minutouno. Accumulated $8,000M in tax debt (ITC) via Oil Combustibles during Kirchnerism. Obtained casinos by direct award from Nestor Kirchner. Acquittal annulled by Supreme Court (2024). In 2025 displaced partner De Sousa to retake media.',
    party: 'PJ / Kirchnerismo (alineado)',
    datasets: 4,
    status_es: 'Absolucion anulada por Corte Suprema (mayo 2024). Causa Oil Combustibles pendiente de nuevo juicio.',
    status_en: 'Acquittal annulled by Supreme Court (May 2024). Oil Combustibles case pending new trial.',
    source_url: 'https://argentina.mom-gmr.org/es/propietarios/propietarios-individuales/detail/owner//cristobal-lopez-1/',
  },
  {
    id: 'fabian-de-sousa',
    name: 'Fabian De Sousa',
    role_es: 'Co-fundador Grupo Indalo',
    role_en: 'Co-founder Grupo Indalo',
    description_es: 'Socio minoritario (30%) de Cristobal Lopez en Grupo Indalo. Controlaba operativamente los medios (C5N, Radio 10) hasta ser desplazado en mayo 2025. Detenido en 2017 por causa Oil Combustibles; absuelto y luego anulado por Corte Suprema. Denuncia persecucion politica del macrismo.',
    description_en: 'Minority partner (30%) of Cristobal Lopez in Grupo Indalo. Operationally controlled media (C5N, Radio 10) until displaced in May 2025. Detained in 2017 for Oil Combustibles case; acquitted and then annulled by Supreme Court. Denounces political persecution by Macri government.',
    party: 'Independiente (empresario)',
    datasets: 3,
    status_es: 'Absolucion anulada. Desplazado de control de medios por Lopez (2025).',
    status_en: 'Acquittal annulled. Displaced from media control by Lopez (2025).',
    source_url: 'https://www.perfil.com/noticias/politica/fabian-de-sousa-rompio-el-silencio-en-c5n-perdi-dos-anos-de-mi-vida-en-injusta-detencion.phtml',
  },
  {
    id: 'marcelo-tinelli',
    name: 'Marcelo Tinelli',
    role_es: 'Conductor TV / Presidente San Lorenzo / Empresario',
    role_en: 'TV Host / San Lorenzo President / Businessman',
    description_es: 'Patrimonio estimado en USD 40M. Presidio San Lorenzo (2019-2022) y Liga Profesional de Futbol. Vicepresidente 4to de AFA. Productora LaFlia. Factor decisivo en campanas electorales desde 1995 como gatekeeper mediatico. Exploro candidatura politica provincial multiples veces.',
    description_en: 'Estimated net worth USD 40M. Chaired San Lorenzo (2019-2022) and Professional Football League. AFA 4th Vice President. LaFlia production company. Decisive factor in electoral campaigns since 1995 as media gatekeeper. Explored provincial political candidacy multiple times.',
    party: 'Independiente (influencer politico)',
    datasets: 2,
    status_es: 'Influencia mediático-política documentada — sin causa penal',
    status_en: 'Media-political influence documented — no criminal case',
    source_url: 'https://en.wikipedia.org/wiki/Marcelo_Tinelli',
  },
  {
    id: 'ricardo-echegaray',
    name: 'Ricardo Echegaray',
    role_es: 'Ex titular AFIP',
    role_en: 'Former AFIP head',
    description_es: 'Como titular de AFIP durante el kirchnerismo, otorgo a Oil Combustibles (Cristobal Lopez) planes de pago de 97 cuotas con tasas inferiores a la inflacion para una deuda de $8.000M. Condenado a 4 anos y 8 meses por administracion fraudulenta.',
    description_en: 'As AFIP head during Kirchnerism, granted Oil Combustibles (Cristobal Lopez) 97-installment payment plans at below-inflation rates for a $8,000M debt. Sentenced to 4 years and 8 months for fraudulent administration.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Condenado a 4 anos y 8 meses por administracion fraudulenta.',
    status_en: 'Sentenced to 4 years and 8 months for fraudulent administration.',
    source_url: 'https://www.infobae.com/judiciales/2023/10/23/oil-combustibles-casacion-confirmo-la-condena-a-echegaray-y-la-absolucion-de-cristobal-lopez-y-fabian-de-sousa/',
  },
  {
    id: 'jorge-rendo',
    name: 'Jorge Rendo',
    role_es: 'Presidente Grupo Clarin',
    role_en: 'President Grupo Clarin',
    description_es: 'Presidente de Grupo Clarin. Involucrado en el escandalo de Lago Escondido: invito a jueces federales (Ercolini, Mahiques) y funcionarios a la estancia de Joe Lewis. La causa fue sobreseida tras transferirse a Comodoro Py.',
    description_en: 'President of Grupo Clarin. Involved in the Lago Escondido scandal: invited federal judges (Ercolini, Mahiques) and officials to Joe Lewis estate. Case dismissed after being transferred to Comodoro Py.',
    party: 'Independiente (ejecutivo)',
    datasets: 2,
    status_es: 'Sobreseido en causa Lago Escondido.',
    status_en: 'Cleared in Lago Escondido case.',
    source_url: 'https://www.eldestapeweb.com/politica/los-jueces-de-clarin/clarin-invito-a-jueces-del-lawfare-a-lago-escondido-y-buscaron-encubrirlo-con-facturas-truchas-y-el-direccionamiento-de-una-causa-judicial-202212419450',
  },
  // --- Frente de Todos / Kirchnerismo actors ---
  {
    id: 'actor-cristina-kirchner',
    name: 'Cristina Fernández de Kirchner',
    role_es: 'Expresidenta/Vicepresidenta — condena firme Vialidad, Hotesur/Los Sauces pendiente',
    role_en: 'Former President/VP — final Vialidad conviction, Hotesur/Los Sauces pending',
    description_es:
      'Condena firme a 6 años de prisión e inhabilitación perpetua para cargos públicos por administración fraudulenta (Causa Vialidad, confirmada por Corte Suprema jun 2025). Decomiso de bienes por hasta USD 640M. Cumple prisión domiciliaria. Causa Hotesur-Los Sauces enviada a juicio oral por la Corte Suprema (dic 2024) por lavado de dinero. Patrimonio declarado: $249M ARS (2023), incluye acciones de Mercado Libre y Apple. Cedió propiedades a hijos Máximo y Florencia en 2016.',
    description_en:
      'Final conviction: 6 years prison and perpetual disqualification from public office for fraudulent administration (Vialidad Case, confirmed by Supreme Court Jun 2025). Asset forfeiture up to USD 640M. Serving house arrest. Hotesur-Los Sauces case sent to oral trial by Supreme Court (Dec 2024) for money laundering. Declared assets: ARS $249M (2023), includes Mercado Libre and Apple shares. Transferred properties to children Máximo and Florencia in 2016.',
    party: 'PJ / Kirchnerismo',
    datasets: 4,
    status_es: 'Condenada — 6 años prisión + inhabilitación perpetua (firme). Hotesur-Los Sauces: juicio oral pendiente',
    status_en: 'Convicted — 6 years prison + perpetual disqualification (final). Hotesur-Los Sauces: oral trial pending',
    source_url: 'https://www.lanacion.com.ar/politica/la-corte-suprema-confirmo-la-condena-a-cristina-kirchner-a-prision-y-no-podra-ser-candidata-nid10062025/',
  },
  {
    id: 'actor-massa-sergio',
    name: 'Sergio Massa',
    role_es: 'Ex Ministro de Economía — AySA (Galmarini), conflicto de interés',
    role_en: 'Former Economy Minister — AySA (Galmarini), conflict of interest',
    description_es:
      'Ministro de Economía (2022-2023) y candidato presidencial FdT. Patrimonio declarado: $19,3M ARS; con esposa Malena Galmarini: $41,2M ARS conjunto. Galmarini presidió AySA (2019-2023); denunciada por contrato irregular de $127M USD con Mauricio Filiberti ("Rey del Cloro"). Massa autorizó por decreto el déficit de AySA, empresa que presidía su esposa. No figura en Panama Papers (verificado por Chequeado). Brecha cambiaria: asumió con 102% de brecha, dejó con el dólar blue en espiral.',
    description_en:
      'Economy Minister (2022-2023) and FdT presidential candidate. Declared assets: ARS $19.3M; with wife Malena Galmarini: ARS $41.2M combined. Galmarini chaired AySA (2019-2023); denounced for irregular $127M USD contract with Mauricio Filiberti ("Chlorine King"). Massa authorized AySA deficit by decree — the company his wife chaired. Not in Panama Papers (verified by Chequeado). Exchange gap: took over at 102%, left with spiraling blue dollar.',
    party: 'Frente de Todos',
    datasets: 3,
    status_es: 'Conflicto de interés AySA documentado. Denuncia Filiberti: desestimada judicialmente',
    status_en: 'AySA conflict of interest documented. Filiberti complaint: judicially dismissed',
    source_url: 'https://www.lanacion.com.ar/politica/sergio-massa-autorizo-por-decreto-el-deficit-de-aysa-la-empresa-que-preside-su-esposa-malena-nid07112022/',
  },
  {
    id: 'actor-baez-lazaro',
    name: 'Lázaro Báez',
    role_es: 'Empresario — condena unificada 15 años, multa USD 329M',
    role_en: 'Businessman — unified 15-year sentence, USD 329M fine',
    description_es:
      'Dueño de Austral Construcciones. Monopolizó 80% de obra vial en Santa Cruz (2003-2015). De 51 obras adjudicadas, solo 26 completadas; sobreprecios de hasta 387%. Condena unificada: 15 años de prisión por lavado de USD 54,87M (Ruta del Dinero K) y fraude en obra pública (Vialidad). Multa: USD 329,2M. Decomiso de activos por USD 65M. Perdió instalaciones de Austral Construcciones a manos del gobierno de Santa Cruz.',
    description_en:
      'Owner of Austral Construcciones. Monopolized 80% of road works in Santa Cruz (2003-2015). Of 51 works awarded, only 26 completed; overpricing up to 387%. Unified sentence: 15 years prison for laundering USD 54.87M (Ruta del Dinero K) and public works fraud (Vialidad). Fine: USD 329.2M. Asset forfeiture of USD 65M. Lost Austral Construcciones facilities to Santa Cruz government.',
    party: 'PJ / Kirchnerismo (alineado)',
    datasets: 3,
    status_es: 'Condenado — 15 años prisión (firme). Multa USD 329M',
    status_en: 'Convicted — 15 years prison (final). USD 329M fine',
    source_url: 'https://www.lanacion.com.ar/politica/la-corte-confirmo-la-condena-a-diez-anos-de-prision-contra-lazaro-baez-por-lavado-de-dinero-nid29052025/',
  },
  {
    id: 'actor-devido-julio',
    name: 'Julio De Vido',
    role_es: 'Ex Ministro de Planificación — múltiples condenas',
    role_en: 'Former Planning Minister — multiple convictions',
    description_es:
      'Ministro de Planificación Federal (2003-2015). Condenado a 4 años por tragedia de Once (52 muertos, firme Corte Suprema nov 2025). Condenado a 4 años por fraude en compra de GNL con sobreprecios (USD 5,5M en comisiones). Procesado por enriquecimiento ilícito: $690.000 USD injustificados (feb 2026). Caso Skanska: fiscalía pidió 5 años. Caso TV Digital: sobreprecios de 56,2%.',
    description_en:
      'Federal Planning Minister (2003-2015). Convicted to 4 years for Once tragedy (52 dead, Supreme Court final Nov 2025). Convicted to 4 years for GNL purchase fraud with overpricing (USD 5.5M in commissions). Prosecuted for illicit enrichment: USD 690K unjustified (Feb 2026). Skanska case: prosecution sought 5 years. Digital TV case: 56.2% overpricing.',
    party: 'PJ / Kirchnerismo',
    datasets: 3,
    status_es: 'Condenado — Once (4 años, firme) + GNL (4 años). Procesado: enriquecimiento ilícito',
    status_en: 'Convicted — Once (4 years, final) + LNG (4 years). Prosecuted: illicit enrichment',
    source_url: 'https://www.lanacion.com.ar/politica/la-corte-confirmo-la-condena-contra-julio-de-vido-por-la-tragedia-de-once-nid11112025/',
  },
  {
    id: 'actor-lopez-jose',
    name: 'José López',
    role_es: 'Ex Secretario de Obras Públicas — bolsos del convento, 13 años',
    role_en: 'Former Public Works Secretary — convent bags, 13 years',
    description_es:
      'Secretario de Obras Públicas durante kirchnerismo. Detenido en junio 2016 intentando ocultar bolsos con USD 9M, joyas y un arma en convento de General Rodríguez. Condena unificada: 13 años de prisión (enriquecimiento ilícito + causa Vialidad + tenencia de arma). Dinero decomisado (USD 8,98M + EUR 153.610) donado al Hospital Garrahan y al Hospital Gutiérrez.',
    description_en:
      'Public Works Secretary during Kirchnerism. Arrested June 2016 trying to hide bags with USD 9M, jewels and a firearm in General Rodríguez convent. Unified sentence: 13 years prison (illicit enrichment + Vialidad case + weapon possession). Seized money (USD 8.98M + EUR 153,610) donated to Hospital Garrahan and Hospital Gutiérrez.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Condenado — 13 años prisión (firme)',
    status_en: 'Convicted — 13 years prison (final)',
    source_url: 'https://www.infobae.com/judiciales/2025/12/11/casacion-dejo-firme-la-pena-de-13-anos-de-carcel-contra-jose-lopez-por-corrupcion-y-el-caso-de-los-bolsos-del-convento/',
  },
  {
    id: 'actor-boudou-amado',
    name: 'Amado Boudou',
    role_es: 'Ex Vicepresidente — condena firme Ciccone, 5 años 10 meses',
    role_en: 'Former Vice President — final Ciccone conviction, 5 years 10 months',
    description_es:
      'Vicepresidente (2011-2015). Primer vicepresidente condenado por corrupción con sentencia firme. Compró Ciccone Calcográfica (única imprenta privada capaz de imprimir billetes) mediante testaferro Vandenbroele. Condena: 5 años y 10 meses por cohecho pasivo y negociaciones incompatibles. Confirmada por Corte Suprema.',
    description_en:
      'Vice President (2011-2015). First VP convicted of corruption with final sentence. Purchased Ciccone Calcográfica (only private currency printing press) through front man Vandenbroele. Sentence: 5 years 10 months for passive bribery and incompatible negotiations. Confirmed by Supreme Court.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Condenado — 5 años 10 meses (firme)',
    status_en: 'Convicted — 5 years 10 months (final)',
    source_url: 'https://chequeado.com/el-explicador/causa-ciccone-la-corte-confirmo-la-sentencia-de-boudou-y-se-convirtio-en-el-primer-vicepresidente-condenado-por-corrupcion/',
  },
  {
    id: 'actor-jaime-ricardo',
    name: 'Ricardo Jaime',
    role_es: 'Ex Secretario de Transporte — condenado 8 años, preso en Ezeiza',
    role_en: 'Former Transport Secretary — 8-year sentence, imprisoned at Ezeiza',
    description_es:
      'Secretario de Transporte (2003-2009). Condenado a 8 años por enriquecimiento ilícito y cohecho: no justificó crecimiento patrimonial (avión, yate, autos, departamentos, hotel). Usó testaferros: hija, ex pareja y terceros. También condenado en causa Once. Preso en Ezeiza desde noviembre 2024.',
    description_en:
      'Transport Secretary (2003-2009). Sentenced to 8 years for illicit enrichment and bribery: could not justify asset growth (airplane, yacht, cars, apartments, hotel). Used front people: daughter, ex-partner and others. Also convicted in Once case. Imprisoned at Ezeiza since November 2024.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Condenado — 8 años prisión (preso en Ezeiza)',
    status_en: 'Convicted — 8 years prison (imprisoned at Ezeiza)',
    source_url: 'https://www.fiscales.gob.ar/fiscalias/condenaron-al-ex-secretario-de-transporte-ricardo-jaime-a-8-anos-de-prision-por-enriquecimiento-ilicito-y-debera-pagar-una-multa-de-15-millones-de-pesos/',
  },
  {
    id: 'actor-baratta-roberto',
    name: 'Roberto Baratta',
    role_es: 'Ex Subsecretario Planificación — recaudador, Cuadernos en juicio',
    role_en: 'Former Planning Undersecretary — collector, Cuadernos on trial',
    description_es:
      'Subsecretario de Coordinación del Ministerio de Planificación. Señalado como principal recaudador de coimas del kirchnerismo. Condenado a 3 años y 6 meses en causa GNL. Juicio oral en curso por Causa Cuadernos: acusado de cobrar al menos USD 1,5M en sobornos de empresarios. Su secretario Nelson Lazarte acusado de cobrar 68 coimas.',
    description_en:
      'Coordination Undersecretary of Planning Ministry. Identified as main bribe collector for Kirchnerism. Sentenced to 3.5 years in LNG case. Oral trial underway for Cuadernos Case: accused of collecting at least USD 1.5M in bribes from businessmen. His secretary Nelson Lazarte accused of collecting 68 bribes.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Condenado — GNL (3 años 6 meses). Cuadernos: juicio oral en curso',
    status_en: 'Convicted — LNG (3.5 years). Cuadernos: oral trial underway',
    source_url: 'https://www.infobae.com/judiciales/2025/11/01/los-cuadernos-de-las-coimas-cuan-fuerte-aprieta-roberto-baratta/',
  },
  {
    id: 'actor-kicillof-axel',
    name: 'Axel Kicillof',
    role_es: 'Gobernador Buenos Aires — patrimonio triplicado en 2020',
    role_en: 'Buenos Aires Governor — assets tripled in 2020',
    description_es:
      'Gobernador de Buenos Aires (desde 2019). Patrimonio triplicado en 2020 en plena crisis: de $7,7M a $23,3M ARS. Posee 4 propiedades (2 en Buenos Aires, 2 en Pilar). Declaró USD en ahorros. Sin causas judiciales directas por corrupción.',
    description_en:
      'Buenos Aires Governor (since 2019). Assets tripled in 2020 during crisis: from ARS $7.7M to ARS $23.3M. Owns 4 properties (2 in Buenos Aires, 2 in Pilar). Declared USD savings. No direct judicial corruption cases.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Sin causas judiciales directas',
    status_en: 'No direct judicial cases',
    source_url: 'https://infopilar.com.ar/declaracion-jurada-durante-el-2020-kicillof-triplico-su-patrimonio/',
  },
  {
    id: 'actor-depedro-wado',
    name: 'Eduardo "Wado" de Pedro',
    role_es: 'Ex Ministro del Interior — empresas agropecuarias Dos Luceros/Ustare',
    role_en: 'Former Interior Minister — agricultural companies Dos Luceros/Ustare',
    description_es:
      'Ministro del Interior (2019-2023). Patrimonio: $85M ARS incluyendo 4 inmuebles ($26M) y participaciones en Dos Luceros SA (95%, $637M, soja/maíz/ganadería) y Ustare SA (25%, $43M, servicios inmobiliarios rurales). Campo heredado de 890.000 m² en Mercedes. Fue vicepresidente de Aerolíneas Argentinas y directivo de Telecom en representación del Estado.',
    description_en:
      'Interior Minister (2019-2023). Assets: ARS $85M including 4 properties (ARS $26M) and stakes in Dos Luceros SA (95%, ARS $637M, soy/corn/cattle) and Ustare SA (25%, ARS $43M, rural real estate). Inherited 890,000 m² field in Mercedes. Was VP of Aerolíneas Argentinas and Telecom board member representing the State.',
    party: 'Frente de Todos',
    datasets: 2,
    status_es: 'Sin causas judiciales directas — empresas agropecuarias documentadas',
    status_en: 'No direct judicial cases — agricultural companies documented',
    source_url: 'https://www.infobae.com/politica/2021/09/21/que-patrimonio-declararon-17-ministros-de-alberto-fernandez-ante-la-oficina-anticorrupcion/',
  },
  {
    id: 'actor-anibal-fernandez',
    name: 'Aníbal Fernández',
    role_es: 'Ex Ministro de Seguridad — vinculado a tráfico de efedrina',
    role_en: 'Former Security Minister — linked to ephedrine trafficking',
    description_es:
      'Ministro de Seguridad (2021-2023), previamente Jefe de Gabinete. Vinculado al tráfico de efedrina por declaraciones de Martín Lanatta (condenado por triple crimen de Gral. Rodríguez). Investigado por enriquecimiento ilícito por fiscalía federal. Importaciones de efedrina crecieron de 4.000 a 15.000 kg entre 2005-2006 durante su gestión.',
    description_en:
      'Security Minister (2021-2023), previously Cabinet Chief. Linked to ephedrine trafficking by statements of Martín Lanatta (convicted for General Rodríguez triple murder). Investigated for illicit enrichment by federal prosecutors. Ephedrine imports grew from 4,000 to 15,000 kg between 2005-2006 during his tenure.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Investigado — enriquecimiento ilícito, vinculación efedrina',
    status_en: 'Investigated — illicit enrichment, ephedrine link',
    source_url: 'https://www.fiscales.gob.ar/fiscalias/impulsaron-la-accion-penal-para-determinar-si-anibal-fernandez-se-enriquecio-ilegitimamente/',
  },
  {
    id: 'actor-bonafini-hebe',
    name: 'Hebe de Bonafini',
    role_es: 'Madres de Plaza de Mayo — fraude Sueños Compartidos, $749M',
    role_en: 'Madres de Plaza de Mayo — Sueños Compartidos fraud, $749M',
    description_es:
      'Presidenta de Madres de Plaza de Mayo. Procesada por fraude al Estado en programa Sueños Compartidos (viviendas sociales). De $749M recaudados, $206M desviados por hermanos Schoklender para comprar inmuebles, autos, motos y yates. Bonafini otorgó poder amplio a los Schoklender. Falleció en noviembre 2022 antes del juicio oral.',
    description_en:
      'President of Madres de Plaza de Mayo. Prosecuted for state fraud in Sueños Compartidos social housing program. Of $749M collected, $206M diverted by Schoklender brothers to buy properties, cars, motorcycles and yachts. Bonafini granted broad power to the Schoklenders. Died November 2022 before oral trial.',
    party: 'PJ / Kirchnerismo (alineada)',
    datasets: 2,
    status_es: 'Procesada — causa extinguida por fallecimiento (nov 2022)',
    status_en: 'Prosecuted — case extinguished by death (Nov 2022)',
    source_url: 'https://www.lanacion.com.ar/politica/bonafini-y-los-schoklender-fueron-procesados-por-el-caso-suenos-compartidos-nid2024192/',
  },
  {
    id: 'actor-zannini-carlos',
    name: 'Carlos Zannini',
    role_es: 'Ex Secretario Legal y Técnico / Procurador del Tesoro',
    role_en: 'Former Legal Secretary / Treasury Prosecutor',
    description_es:
      'Secretario Legal y Técnico de Presidencia (2003-2015) bajo Néstor y Cristina Kirchner. Procurador del Tesoro (2019-2023). Investigado por enriquecimiento ilícito a través de presunto testaferro en Córdoba (causa cerrada). Como Procurador, controló la estrategia legal del Estado en cientos de miles de causas.',
    description_en:
      'Legal and Technical Secretary (2003-2015) under Néstor and Cristina Kirchner. Treasury Prosecutor (2019-2023). Investigated for illicit enrichment through alleged front man in Córdoba (case closed). As Prosecutor, controlled State legal strategy in hundreds of thousands of cases.',
    party: 'PJ / Kirchnerismo',
    datasets: 2,
    status_es: 'Causa enriquecimiento cerrada — sobreseído',
    status_en: 'Enrichment case closed — dismissed',
    source_url: 'https://www.lanacion.com.ar/politica/la-justicia-cerro-causa-zannini-presunto-enriquecimiento-nid2312890/',
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
    source_url: 'https://datos.gob.ar/dataset/justicia-declaraciones-juradas-patrimoniales-integrales-caracter-publico',
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
    amount_ars: 38_000_000, // ~USD 4M at 2015 ARS/USD rate (~9.5)
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
    source_url: 'https://www.iprofesional.com/politica/380149-lousteau-le-facturaria-un-extra-al-congreso-desde-su-consultora',
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
    source_url: 'https://aportantes.electoral.gob.ar/aportes/',
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
    amount_ars: 21_000_000, // USD 12-21M total offered collectively (rejected by TOF7)
    description_es:
      '50+ empresarios y ex funcionarios de la causa Cuadernos ofrecieron reparaciones por un total estimado entre USD 12M y USD 21M para evitar juicio oral. El TOF7 rechazó todas las propuestas. La tasa de condena por corrupción en Argentina es del 2% según auditoría de la propia Corte Suprema.',
    description_en:
      '50+ businessmen and former officials in the Cuadernos case offered reparations totaling an estimated USD 12-21M to avoid oral trial. TOF7 rejected all proposals. Argentina\'s corruption conviction rate is 2% according to the Supreme Court\'s own audit.',
    date: '2018-2025',
    source: 'Corte Suprema / Chequeado',
    source_url: 'https://chequeado.com/el-explicador/causa-cuadernos-las-5-claves-del-juicio-contra-cristina-fernandez-de-kirchner-ex-funcionarios-y-empresarios/',
  },
  // --- Milei-era money flows ---
  {
    id: 'flow-libra-insider',
    from_label: '$LIBRA insiders (Kelsier Ventures)',
    to_label: '44,000 victims',
    amount_ars: 114_490_000_000, // USD 107M at Feb 2025 rate (~1,070 ARS/USD)
    description_es:
      'Insiders cobraron USD 107M antes del colapso del 90% de $LIBRA. El presidente Milei promovió la criptomoneda que alcanzó USD 4.5B de capitalización. 44.000 víctimas afectadas.',
    description_en:
      'Insiders cashed out USD 107M before the 90% crash of $LIBRA. President Milei promoted the cryptocurrency which hit USD 4.5B market cap. 44,000 victims affected.',
    date: '2025-02',
    source: 'Infobae / Congressional investigation',
    source_url: 'https://www.infobae.com/politica/2025/02/16/el-asesor-de-la-criptomoneda-promocionada-inicialmente-por-javier-milei-aseguro-que-el-presidente-no-cumplio-un-compromiso-asumido/',
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
    source_url: 'https://chequeado.com/el-explicador/los-fondos-reservados-de-la-secretaria-de-inteligencia-el-gobierno-de-milei-los-amplio-por-tercera-vez/',
  },
  {
    id: 'flow-pami-overpricing',
    from_label: 'PAMI',
    to_label: 'Drug cartel (Elea, GP Pharm, Kemex, etc.)',
    amount_ars: 273_000_000, // ARS 273M documented excess paid via Convenio vs licitación (2023)
    description_es:
      'PAMI pagó hasta 16 veces el precio de mercado por medicamentos oncológicos en 2023. Anastrozol: $13.192 vs $924 en licitación. Cartel denunciado: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncología.',
    description_en:
      'PAMI paid up to 16x market price for oncological drugs in 2023. Anastrozole: $13,192 vs $924 at tender. Cartel complaint: Elea Phoenix, GP Pharm, Kemex, Biosidus, Raffo + ACE Oncologia.',
    date: '2023',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/',
  },
  {
    id: 'afa-tourprodenter',
    from_label: 'AFA',
    to_label: 'TourProdEnter LLC (Florida)',
    amount_ars: 260000000000,
    description_es:
      'USD 260M+ desviados de cuentas AFA a LLC en Florida administrada por Erica Gillette',
    description_en:
      'USD 260M+ diverted from AFA accounts to Florida LLC administered by Erica Gillette',
    date: '2020-2025',
    source: 'La Nación',
    source_url: 'https://www.lanacion.com.ar/politica/investigacion-exclusiva-desde-la-cuenta-que-administra-los-fondos-de-la-afa-en-eeuu-se-desviaron-al-nid28122025/',
  },
  {
    id: 'bcra-intransferable-bond',
    from_label: 'BCRA Reservas',
    to_label: 'Tesoro Nacional (DNU 23/2024)',
    amount_ars: 3200000000,
    description_es:
      'USD 3.200M de reservas BCRA convertidas a letra intransferible a 2038 por decreto de Caputo',
    description_en:
      'USD 3.2B BCRA reserves converted to non-transferable letter maturing 2038 by Caputo decree',
    date: '2024-01-05',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/economia/2024/01/05/el-gobierno-tomara-usd-3200-de-las-reservas-del-bcra-para-pagar-vencimientos-de-deuda/',
  },
  {
    id: 'fundacion-faro-ads',
    from_label: 'Fundación Faro (donantes ocultos)',
    to_label: 'Meta Platforms (publicidad política)',
    amount_ars: 1079000000,
    description_es:
      '$1.079B en publicidad política en Meta sin declarar origen de fondos',
    description_en:
      '$1.079B in political advertising on Meta without disclosing funding source',
    date: '2025-03',
    source: 'Chequeado',
    source_url: 'https://chequeado.com/investigaciones/fundacion-faro-el-think-tank-libertario-que-mas-pauta-electoral-puso-en-2025-y-que-no-declara-el-origen-de-sus-fondos/',
  },
  {
    id: 'andis-drugstores',
    from_label: 'ANDIS',
    to_label: 'Droguerías Profarma + Genesis',
    amount_ars: 37000000000,
    description_es:
      '$37.000M a 4 droguerías con sobreprecios de hasta 2.013%',
    description_en:
      '$37B to 4 drugstores with markups up to 2,013%',
    date: '2025-11',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/judiciales/2025/11/17/andis-cuatro-droguerias-recibieron-37000-millones-y-vendieron-algunos-medicamentos-al-2000-de-su-valor/',
  },
  {
    id: 'swiss-medical-atp',
    from_label: 'Estado (ATP/REPRO)',
    to_label: 'Swiss Medical Group',
    amount_ars: 2417000000,
    description_es:
      '$2.417M en subsidios ATP durante pandemia a Swiss Medical (mientras adquiría competidores)',
    description_en:
      '$2.417B in ATP subsidies during pandemic to Swiss Medical (while acquiring competitors)',
    date: '2020',
    source: 'Chaco Día por Día',
    source_url: 'https://www.laizquierdadiario.com/Claudio-Bellocopitt-cobro-el-ATP-del-Estado-radiografia-del-magnate-de-Swiss-Medical',
  },

  // ── Wave 4: Media-Politics Nexus Money Flows ──────────────────────────────
  {
    id: 'oil-combustibles-itc-evasion',
    from_label: 'Oil Combustibles (C. Lopez)',
    to_label: 'Grupo Indalo (expansion)',
    amount_ars: 8000000000,
    description_es:
      '$8.000M del ITC retenido y no depositado en AFIP. Fondos usados para expandir Grupo Indalo (medios, casinos, petroleo). Echegaray otorgo planes de 97 cuotas a tasas sub-inflacion.',
    description_en:
      '$8,000M in ITC withheld and not deposited to AFIP. Funds used to expand Grupo Indalo (media, casinos, oil). Echegaray granted 97-installment plans at sub-inflation rates.',
    date: '2008-2015',
    source: 'LA NACION',
    source_url: 'https://www.lanacion.com.ar/politica/cristobal-lopez-no-pago-a-la-afip-8000-millones-durante-el-kirchnerismo-nid1879369/',
  },
  {
    id: 'edenor-acquisition',
    from_label: 'Vila-Manzano-Filiberti',
    to_label: 'Pampa Energia (Mindlin)',
    amount_ars: 0,
    description_es:
      'USD 100M por 51% de Edenor (3M clientes). Desembolso inicial USD 55M, segundo tramo USD 40M en 2021. Compra autorizada por gobierno Fernandez.',
    description_en:
      'USD 100M for 51% of Edenor (3M customers). Initial disbursement USD 55M, second tranche USD 40M in 2021. Purchase authorized by Fernandez government.',
    date: '2020-12-28',
    source: 'Pagina 12',
    source_url: 'https://www.pagina12.com.ar/314110-mindlin-le-vendio-edenor-a-vila-manzano',
  },
  {
    id: 'goldman-sachs-clarin-debt',
    from_label: 'Goldman Sachs',
    to_label: 'Grupo Clarin (deuda)',
    amount_ars: 0,
    description_es:
      'USD 500M: Goldman Sachs asumio deuda de Clarin a cambio de 18% de acciones con derechos de veto (1999). En 2012 vendio a Ralph Booth (EEUU).',
    description_en:
      'USD 500M: Goldman Sachs assumed Clarin debt in exchange for 18% of shares with veto rights (1999). In 2012 sold to Ralph Booth (USA).',
    date: '1999',
    source: 'El Economista',
    source_url: 'https://eleconomista.com.ar/negocios/goldman-sachs-clarin-n2908',
  },
  {
    id: 'kirchner-lopez-los-sauces',
    from_label: 'Empresas de C. Lopez',
    to_label: 'Los Sauces SA (Kirchner)',
    amount_ars: 2800000,
    description_es:
      '$2.8M pagados por empresas de Lopez a Los Sauces SA (sociedad de la familia Kirchner) por alquileres en edificio Madero Center (jun 2014 - ene 2015).',
    description_en:
      '$2.8M paid by Lopez companies to Los Sauces SA (Kirchner family company) for rentals at Madero Center building (Jun 2014 - Jan 2015).',
    date: '2014-2015',
    source: 'LA NACION',
    source_url: 'https://www.lanacion.com.ar/politica/cuando-comenzo-el-vinculo-entre-la-familia-kirchner-y-cristobal-lopez-nid2039381/',
  },
  {
    id: 'tether-adecoagro-purchase',
    from_label: 'Tether Investments',
    to_label: 'Adecoagro (ex-Soros)',
    amount_ars: 0,
    description_es:
      'USD 600M+ por hasta 70% de Adecoagro. Tether (USD 14.000M ganancia 2024) entra al agro argentino con plan de USD 3.000M en inversiones locales (IA, energia, medios digitales).',
    description_en:
      'USD 600M+ for up to 70% of Adecoagro. Tether (USD 14B profit 2024) enters Argentine agriculture with USD 3B local investment plan (AI, energy, digital media).',
    date: '2025-03',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/economia/2025/03/27/un-gigante-cripto-invertira-usd-600-millones-en-la-argentina-para-quedarse-con-el-control-de-adecoagro/',
  },
  {
    id: 'tinelli-san-lorenzo-personal',
    from_label: 'Marcelo Tinelli (personal)',
    to_label: 'San Lorenzo (club)',
    amount_ars: 0,
    description_es:
      'USD 25M donados por Tinelli a San Lorenzo durante su presidencia (2019-2022). Aun mantiene prestamos de ~USD 6M sin saldar. El club tenia patrimonio neto negativo al asumir.',
    description_en:
      'USD 25M donated by Tinelli to San Lorenzo during his presidency (2019-2022). Still holds ~USD 6M in unsettled loans. The club had negative net worth when he took over.',
    date: '2019-2022',
    source: 'El Observador',
    source_url: 'https://www.elobservador.com.uy/futbol-internacional/las-bombas-que-tiro-marcelo-tinelli-su-gestion-como-presidente-san-lorenzo-puse-us-25-millones-yo-no-robe-ni-tocaria-un-peso-del-club-n6014438',
  },

  // ── Wave 5: Frente de Todos / Kirchnerismo Money Flows ───────────────────
  {
    id: 'baez-vialidad-sobreprecios',
    from_label: 'Estado (Vialidad Nacional)',
    to_label: 'Austral Construcciones (Báez)',
    amount_ars: 46000000000,
    description_es:
      '$46.000M (actualizado a 2016) en 51 obras viales en Santa Cruz adjudicadas a Báez. Solo 26 completadas, sobreprecios hasta 387%. 80% de obra provincial monopolizada.',
    description_en:
      '$46B (updated to 2016) in 51 road works in Santa Cruz awarded to Báez. Only 26 completed, overpricing up to 387%. 80% of provincial works monopolized.',
    date: '2003-2015',
    source: 'LA NACION / Infobae',
    source_url: 'https://www.lanacion.com.ar/politica/la-condena-a-cristina-kirchner-como-estan-hoy-las-rutas-de-lazaro-baez-en-santa-cruz-nid10062025/',
  },
  {
    id: 'baez-lavado-ruta-dinero',
    from_label: 'Austral Construcciones (Báez)',
    to_label: 'Circuito lavado (Ruta del Dinero K)',
    amount_ars: 0,
    description_es:
      'USD 54,87M lavados a través de circuito de sociedades offshore y operaciones inmobiliarias. Multa de USD 329M. Decomiso de activos por USD 65M.',
    description_en:
      'USD 54.87M laundered through offshore company circuit and real estate operations. Fine of USD 329M. Asset forfeiture of USD 65M.',
    date: '2003-2015',
    source: 'LA NACION',
    source_url: 'https://www.lanacion.com.ar/politica/la-corte-confirmo-la-condena-a-diez-anos-de-prision-contra-lazaro-baez-por-lavado-de-dinero-nid29052025/',
  },
  {
    id: 'lopez-bolsos-convento',
    from_label: 'José López (Sec. Obras Públicas)',
    to_label: 'Convento Gral. Rodríguez (ocultamiento)',
    amount_ars: 0,
    description_es:
      'USD 9M + EUR 153.610 + joyas encontrados en bolsos. Dinero decomisado donado a hospitales Garrahan y Gutiérrez.',
    description_en:
      'USD 9M + EUR 153,610 + jewels found in bags. Seized money donated to Garrahan and Gutiérrez hospitals.',
    date: '2016-06',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/judiciales/2025/12/11/casacion-dejo-firme-la-pena-de-13-anos-de-carcel-contra-jose-lopez-por-corrupcion-y-el-caso-de-los-bolsos-del-convento/',
  },
  {
    id: 'devido-gnl-sobreprecios',
    from_label: 'Estado (compra GNL)',
    to_label: 'Intermediarios/Familia Dromi',
    amount_ars: 0,
    description_es:
      'USD 5,5M pagados innecesariamente a intermediarios en compra de Gas Natural Licuado (2008-2015). Sobreprecios coordinados por De Vido y Baratta.',
    description_en:
      'USD 5.5M unnecessarily paid to intermediaries in LNG purchases (2008-2015). Overpricing coordinated by De Vido and Baratta.',
    date: '2008-2015',
    source: 'LA NACION',
    source_url: 'https://www.lanacion.com.ar/politica/fraude-millonario-condenaron-a-julio-de-vido-baratta-y-nicolas-dromi-por-la-compra-de-gas-licuado-nid30092025/',
  },
  {
    id: 'seguros-martinez-sosa',
    from_label: 'Nación Seguros (comisiones)',
    to_label: 'Héctor Martínez Sosa (broker)',
    amount_ars: 366000000,
    description_es:
      '$366M en comisiones — Martínez Sosa recibió 59,6% de todas las comisiones pagadas por Nación Seguros a intermediarios. Es esposo de la secretaria de Alberto Fernández.',
    description_en:
      '$366M in commissions — Martínez Sosa received 59.6% of all commissions paid by Nación Seguros to intermediaries. He is the husband of Alberto Fernández\'s secretary.',
    date: '2020-2023',
    source: 'Infobae',
    source_url: 'https://www.infobae.com/politica/2025/07/10/procesaron-al-ex-presidente-alberto-fernandez-en-la-causa-seguros/',
  },
  {
    id: 'suenos-compartidos-desvio',
    from_label: 'Estado (Sueños Compartidos)',
    to_label: 'Red Schoklender (desvío)',
    amount_ars: 206000000,
    description_es:
      '$206M desviados de programa de viviendas sociales Madres de Plaza de Mayo. Schoklender usó red de empresas para comprar inmuebles, autos, motos y yates.',
    description_en:
      '$206M diverted from Madres de Plaza de Mayo social housing program. Schoklender used company network to buy properties, cars, motorcycles and yachts.',
    date: '2007-2011',
    source: 'LA NACION',
    source_url: 'https://www.lanacion.com.ar/politica/bonafini-y-los-schoklender-fueron-procesados-por-el-caso-suenos-compartidos-nid2024192/',
  },
  {
    id: 'aysa-filiberti-cloro',
    from_label: 'AySA (Galmarini)',
    to_label: 'Transclor (Filiberti)',
    amount_ars: 0,
    description_es:
      'USD 127M en contrato de provisión de cloro hasta 2028. Precio de $504/ton vs $390-430/ton posible con extensión de contrato anterior. Denuncia desestimada judicialmente.',
    description_en:
      'USD 127M chlorine supply contract through 2028. Price $504/ton vs $390-430/ton possible with prior contract extension. Complaint judicially dismissed.',
    date: '2023',
    source: 'Perfil / LA NACION',
    source_url: 'https://www.perfil.com/noticias/politica/denunciaron-malena-galmarini-supuestas-irregularidades-contrato-millonario-aysa-rey-cloro.phtml',
  },
] as const
