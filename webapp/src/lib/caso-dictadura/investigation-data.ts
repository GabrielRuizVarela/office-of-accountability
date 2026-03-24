/**
 * Argentine Military Dictatorship investigation structured data for the webapp.
 *
 * Bilingual (ES primary, EN secondary) factcheck items, timeline events,
 * actors, evidence documents, impact stats, and judicial responses.
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
  | 'represion'
  | 'judicial'
  | 'diplomatico'
  | 'economico'
  | 'ddhh'
  | 'politico'

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

export interface JudicialResponse {
  id: string
  date: string
  action_en: string
  action_es: string
  effect_en: string
  effect_es: string
  source_url?: string
}

// ---------------------------------------------------------------------------
// FACTCHECK_ITEMS
// ---------------------------------------------------------------------------

export const FACTCHECK_ITEMS: FactcheckItem[] = [
  {
    id: 'fc-30000-desaparecidos',
    claim_en: 'Approximately 30,000 people were disappeared during the Argentine dictatorship (1976-1983).',
    claim_es: 'Aproximadamente 30.000 personas fueron desaparecidas durante la dictadura argentina (1976-1983).',
    status: 'confirmed',
    source: 'CONADEP, organismos de DDHH, registros judiciales',
    source_url: 'https://www.argentina.gob.ar/derechoshumanos/ANM',
    detail_en: 'The figure of 30,000 is based on estimates by human rights organizations. CONADEP documented 8,961 cases in 1984, but noted many cases were never reported due to fear. The RUVTE registry currently contains 8,753 documented victims with formal complaints plus 784 without.',
    detail_es: 'La cifra de 30.000 se basa en estimaciones de organismos de derechos humanos. La CONADEP documentó 8.961 casos en 1984, pero señaló que muchos casos nunca fueron denunciados por miedo. El registro RUVTE contiene actualmente 8.753 víctimas documentadas con denuncia formal más 784 sin denuncia.',
  },
  {
    id: 'fc-762-ccds',
    claim_en: 'At least 762 clandestine detention centers operated during the dictatorship.',
    claim_es: 'Al menos 762 centros clandestinos de detención funcionaron durante la dictadura.',
    status: 'confirmed',
    source: 'Registro Nacional de CCD, Subsecretaría de DDHH',
    source_url: 'https://www.argentina.gob.ar/derechoshumanos/ANM/ccds',
    detail_en: 'The National Registry of CCDs, maintained by the Human Rights Secretariat, has identified 762 clandestine detention centers that operated across Argentina during the dictatorship. These ranged from military installations to police stations, private properties, and even schools.',
    detail_es: 'El Registro Nacional de CCD, mantenido por la Secretaría de Derechos Humanos, ha identificado 762 centros clandestinos de detención que funcionaron en toda Argentina durante la dictadura. Estos abarcaban desde instalaciones militares hasta comisarías, propiedades privadas e incluso escuelas.',
  },
  {
    id: 'fc-plan-condor',
    claim_en: 'Plan Cóndor was a coordinated intelligence operation among six South American dictatorships with CIA knowledge.',
    claim_es: 'El Plan Cóndor fue una operación de inteligencia coordinada entre seis dictaduras sudamericanas con conocimiento de la CIA.',
    status: 'confirmed',
    source: 'Sentencia Causa Plan Cóndor (2016), documentos desclasificados CIA/State Dept',
    source_url: 'https://desclasificados.org.ar',
    detail_en: 'In 2016, Argentine courts convicted 15 former officials for crimes committed under Plan Cóndor. Declassified US documents confirm CIA and State Department awareness of the coordination between Argentina, Chile, Uruguay, Paraguay, Brazil, and Bolivia.',
    detail_es: 'En 2016, tribunales argentinos condenaron a 15 ex funcionarios por crímenes cometidos bajo el Plan Cóndor. Documentos desclasificados de EE.UU. confirman el conocimiento de la CIA y el Departamento de Estado sobre la coordinación entre Argentina, Chile, Uruguay, Paraguay, Brasil y Bolivia.',
  },
  {
    id: 'fc-corporate-complicity',
    claim_en: 'Major corporations including Ford and Mercedes-Benz collaborated with the military to disappear union workers.',
    claim_es: 'Grandes corporaciones como Ford y Mercedes-Benz colaboraron con los militares para desaparecer trabajadores sindicales.',
    status: 'confirmed',
    source: 'Sentencias judiciales, testimonios en causas de lesa humanidad',
    source_url: '',
    detail_en: 'Court proceedings have established that Ford Motor Argentina allowed military forces to use its factory premises to detain and interrogate workers. Mercedes-Benz Argentina similarly cooperated with security forces in the disappearance of union delegates.',
    detail_es: 'Los procesos judiciales han establecido que Ford Motor Argentina permitió que las fuerzas militares usaran las instalaciones de su fábrica para detener e interrogar trabajadores. Mercedes-Benz Argentina cooperó de manera similar con las fuerzas de seguridad en la desaparición de delegados sindicales.',
  },
  {
    id: 'fc-nietos-restituidos',
    claim_en: 'Abuelas de Plaza de Mayo have identified and restored the identity of approximately 140 grandchildren appropriated during the dictatorship.',
    claim_es: 'Abuelas de Plaza de Mayo han identificado y restituido la identidad de aproximadamente 140 nietos apropiados durante la dictadura.',
    status: 'confirmed',
    source: 'Abuelas de Plaza de Mayo',
    source_url: 'https://www.abuelas.org.ar',
    detail_en: 'Through DNA databases and investigations, Abuelas have identified approximately 140 of an estimated 500 children born in captivity or stolen from their families. The search continues.',
    detail_es: 'A través de bases de datos de ADN e investigaciones, Abuelas han identificado aproximadamente 140 de un estimado de 500 niños nacidos en cautiverio o robados de sus familias. La búsqueda continúa.',
  },
]

// ---------------------------------------------------------------------------
// TIMELINE_EVENTS
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: InvestigationTimelineEvent[] = [
  {
    id: 'evt-golpe',
    date: '1976-03-24',
    title_en: 'Military coup deposes Isabel Perón',
    title_es: 'Golpe militar depone a Isabel Perón',
    description_en: 'The armed forces, led by Jorge Rafael Videla, Emilio Massera, and Orlando Agosti, overthrow the constitutional government and establish the "Process of National Reorganization."',
    description_es: 'Las fuerzas armadas, lideradas por Jorge Rafael Videla, Emilio Massera y Orlando Agosti, derrocan al gobierno constitucional e instauran el "Proceso de Reorganización Nacional."',
    category: 'politico',
    sources: ['Historical record'],
  },
  {
    id: 'evt-noche-lapices',
    date: '1976-09-16',
    title_en: 'Night of the Pencils — students kidnapped',
    title_es: 'Noche de los Lápices — estudiantes secuestrados',
    description_en: 'Security forces kidnap a group of secondary school students in La Plata who had been protesting for a student bus fare discount. Most were never seen again.',
    description_es: 'Las fuerzas de seguridad secuestran a un grupo de estudiantes secundarios en La Plata que habían protestado por el boleto estudiantil. La mayoría nunca fue vista de nuevo.',
    category: 'represion',
    sources: ['Sentencia Causa Camps', 'Nunca Más'],
  },
  {
    id: 'evt-visita-cidh',
    date: '1979-09-06',
    title_en: 'Inter-American Commission on Human Rights visits Argentina',
    title_es: 'Visita de la CIDH a la Argentina',
    description_en: 'The IACHR conducts an on-site visit to Argentina, receiving thousands of complaints. During the visit, the military hastily transfers and murders detainees to hide evidence.',
    description_es: 'La CIDH realiza una visita in loco a la Argentina, recibiendo miles de denuncias. Durante la visita, los militares trasladan y asesinan apresuradamente a detenidos para ocultar pruebas.',
    category: 'diplomatico',
    sources: ['CIDH, OEA/Ser.L/V/II.49'],
  },
  {
    id: 'evt-mundial-78',
    date: '1978-06-01',
    title_en: 'FIFA World Cup held in Argentina amid ongoing disappearances',
    title_es: 'Copa Mundial FIFA en Argentina mientras continúan las desapariciones',
    description_en: 'Argentina hosts and wins the World Cup while the ESMA detention center operates blocks away from the River Plate stadium. The regime uses the tournament for propaganda.',
    description_es: 'Argentina organiza y gana el Mundial mientras el centro de detención ESMA funciona a pocas cuadras del estadio de River Plate. El régimen usa el torneo como propaganda.',
    category: 'politico',
    sources: ['Historical record'],
  },
  {
    id: 'evt-nunca-mas',
    date: '1984-09-20',
    title_en: 'CONADEP delivers Nunca Más report',
    title_es: 'CONADEP entrega el informe Nunca Más',
    description_en: 'The National Commission on the Disappearance of Persons delivers its report documenting 8,961 disappearances, 340 clandestine detention centers, and systematic state terrorism.',
    description_es: 'La Comisión Nacional sobre la Desaparición de Personas entrega su informe documentando 8.961 desapariciones, 340 centros clandestinos de detención y terrorismo de estado sistemático.',
    category: 'ddhh',
    sources: ['CONADEP, Nunca Más (1984)'],
  },
  {
    id: 'evt-juicio-juntas',
    date: '1985-04-22',
    title_en: 'Trial of the Juntas begins',
    title_es: 'Comienza el Juicio a las Juntas',
    description_en: 'The civilian trial of the nine military commanders of the first three juntas begins. Prosecutor Julio Strassera and assistant Luis Moreno Ocampo present 709 cases. Five are convicted, including life sentences for Videla and Massera.',
    description_es: 'Comienza el juicio civil a los nueve comandantes militares de las tres primeras juntas. El fiscal Julio Strassera y el adjunto Luis Moreno Ocampo presentan 709 casos. Cinco son condenados, incluyendo cadena perpetua para Videla y Massera.',
    category: 'judicial',
    sources: ['Causa 13/84, Cámara Nacional de Apelaciones en lo Criminal y Correccional Federal'],
  },
  {
    id: 'evt-punto-final',
    date: '1986-12-24',
    title_en: 'Full Stop Law enacted',
    title_es: 'Ley de Punto Final sancionada',
    description_en: 'Congress passes Law 23.492 setting a 60-day deadline to initiate criminal proceedings against military personnel for crimes during the dictatorship, effectively halting new prosecutions.',
    description_es: 'El Congreso sanciona la Ley 23.492 fijando un plazo de 60 días para iniciar causas penales contra militares por crímenes durante la dictadura, deteniendo efectivamente las nuevas persecuciones.',
    category: 'judicial',
    sources: ['Ley 23.492'],
  },
  {
    id: 'evt-obediencia-debida',
    date: '1987-06-04',
    title_en: 'Due Obedience Law enacted',
    title_es: 'Ley de Obediencia Debida sancionada',
    description_en: 'Congress passes Law 23.521 establishing a presumption that lower-ranking military officers acted under orders, effectively immunizing hundreds of perpetrators.',
    description_es: 'El Congreso sanciona la Ley 23.521 estableciendo una presunción de que los oficiales de menor rango actuaron bajo órdenes, inmunizando efectivamente a cientos de represores.',
    category: 'judicial',
    sources: ['Ley 23.521'],
  },
  {
    id: 'evt-indultos',
    date: '1989-10-07',
    title_en: 'Menem pardons military commanders',
    title_es: 'Menem indulta a los comandantes militares',
    description_en: 'President Carlos Menem issues presidential pardons for the convicted junta commanders and other military officers, releasing Videla, Massera, and others from prison.',
    description_es: 'El presidente Carlos Menem dicta indultos presidenciales para los comandantes de las juntas condenados y otros oficiales militares, liberando a Videla, Massera y otros de prisión.',
    category: 'politico',
    sources: ['Decretos 1002/89, 1003/89, 1004/89, 1005/89'],
  },
  {
    id: 'evt-anulacion-leyes',
    date: '2005-06-14',
    title_en: 'Supreme Court declares impunity laws unconstitutional',
    title_es: 'Corte Suprema declara inconstitucionales las leyes de impunidad',
    description_en: 'The Argentine Supreme Court declares the Full Stop and Due Obedience laws unconstitutional in the Simón case, reopening the path to prosecution for crimes against humanity.',
    description_es: 'La Corte Suprema declara inconstitucionales las leyes de Punto Final y Obediencia Debida en el caso Simón, reabriendo el camino a la persecución penal por delitos de lesa humanidad.',
    category: 'judicial',
    sources: ['CSJN, "Simón, Julio Héctor y otros s/ privación ilegítima de la libertad" (2005)'],
  },
  {
    id: 'evt-sentencia-esma',
    date: '2011-10-26',
    title_en: 'ESMA mega-trial verdict — 16 convicted',
    title_es: 'Sentencia megacausa ESMA — 16 condenados',
    description_en: 'Tribunal Oral Federal 5 convicts 16 former Navy officers for crimes against humanity committed at ESMA, including Alfredo Astiz and Jorge Acosta. 12 receive life sentences.',
    description_es: 'El Tribunal Oral Federal 5 condena a 16 ex oficiales de la Armada por delitos de lesa humanidad cometidos en la ESMA, incluyendo a Alfredo Astiz y Jorge Acosta. 12 reciben cadena perpetua.',
    category: 'judicial',
    sources: ['TOF 5, Causa ESMA'],
  },
  {
    id: 'evt-sentencia-plan-condor',
    date: '2016-05-27',
    title_en: 'Plan Cóndor trial verdict',
    title_es: 'Sentencia juicio Plan Cóndor',
    description_en: 'After 3 years of trial, Argentine court convicts 15 former military and intelligence officials for their participation in the transnational Plan Cóndor operation.',
    description_es: 'Tras 3 años de juicio, tribunal argentino condena a 15 ex oficiales militares y de inteligencia por su participación en la operación transnacional Plan Cóndor.',
    category: 'judicial',
    sources: ['TOF 1, Causa Plan Cóndor'],
  },
]

// ---------------------------------------------------------------------------
// KEY_ACTORS
// ---------------------------------------------------------------------------

export const KEY_ACTORS: Actor[] = [
  {
    id: 'actor-videla',
    name: 'Jorge Rafael Videla',
    role_en: 'De facto President, Commander-in-Chief',
    role_es: 'Presidente de facto, Comandante en Jefe',
    description_en: 'Leader of the first military junta (1976-1981). Convicted in the Trial of the Juntas (1985), pardoned by Menem (1990), re-convicted to life imprisonment (2010).',
    description_es: 'Líder de la primera junta militar (1976-1981). Condenado en el Juicio a las Juntas (1985), indultado por Menem (1990), recondenado a cadena perpetua (2010).',
    nationality: 'Argentine',
    status_en: 'Died in prison (2013)',
    status_es: 'Murió en prisión (2013)',
  },
  {
    id: 'actor-massera',
    name: 'Emilio Eduardo Massera',
    role_en: 'Admiral, Navy Commander, Junta I member',
    role_es: 'Almirante, Comandante de la Armada, miembro Junta I',
    description_en: 'Commander of the Navy and ESMA, the most notorious detention center. Convicted in 1985, pardoned in 1990, later convicted for baby theft.',
    description_es: 'Comandante de la Armada y la ESMA, el centro de detención más notorio. Condenado en 1985, indultado en 1990, luego condenado por robo de bebés.',
    nationality: 'Argentine',
    status_en: 'Died (2010)',
    status_es: 'Fallecido (2010)',
  },
  {
    id: 'actor-astiz',
    name: 'Alfredo Astiz',
    role_en: 'Navy captain, ESMA infiltrator',
    role_es: 'Capitán de navío, infiltrado de la ESMA',
    description_en: 'Known as the "Angel of Death." Infiltrated the Madres de Plaza de Mayo, leading to the kidnapping of founders including Azucena Villaflor and the French nuns. Convicted to life imprisonment.',
    description_es: 'Conocido como el "Ángel de la Muerte." Infiltró las Madres de Plaza de Mayo, llevando al secuestro de fundadoras incluyendo Azucena Villaflor y las monjas francesas. Condenado a cadena perpetua.',
    nationality: 'Argentine',
    status_en: 'Life imprisonment',
    status_es: 'Cadena perpetua',
  },
  {
    id: 'actor-strassera',
    name: 'Julio César Strassera',
    role_en: 'Prosecutor, Trial of the Juntas',
    role_es: 'Fiscal, Juicio a las Juntas',
    description_en: 'Lead prosecutor in the historic 1985 Trial of the Juntas. His closing statement "Nunca Más" became a symbol of the fight for justice.',
    description_es: 'Fiscal principal en el histórico Juicio a las Juntas de 1985. Su alegato final "Nunca Más" se convirtió en símbolo de la lucha por la justicia.',
    nationality: 'Argentine',
    status_en: 'Died (2015)',
    status_es: 'Fallecido (2015)',
  },
  {
    id: 'actor-carlotto',
    name: 'Estela de Carlotto',
    role_en: 'President, Abuelas de Plaza de Mayo',
    role_es: 'Presidenta, Abuelas de Plaza de Mayo',
    description_en: 'Has led Abuelas de Plaza de Mayo since 1989, searching for children stolen during the dictatorship. Found her own grandson, Guido, in 2014 after 36 years.',
    description_es: 'Preside Abuelas de Plaza de Mayo desde 1989, buscando a los niños robados durante la dictadura. Encontró a su propio nieto, Guido, en 2014 tras 36 años.',
    nationality: 'Argentine',
    status_en: 'Active',
    status_es: 'Activa',
  },
  {
    id: 'actor-walsh',
    name: 'Rodolfo Walsh',
    role_en: 'Writer, investigative journalist',
    role_es: 'Escritor, periodista investigativo',
    description_en: 'Author of "Operación Masacre" (1957), a pioneering work of investigative journalism. Wrote an open letter to the Junta on the first anniversary of the coup. Killed by a military task group the next day.',
    description_es: 'Autor de "Operación Masacre" (1957), obra pionera del periodismo investigativo. Escribió una carta abierta a la Junta en el primer aniversario del golpe. Asesinado por un grupo de tareas militar al día siguiente.',
    nationality: 'Argentine',
    status_en: 'Killed (1977)',
    status_es: 'Asesinado (1977)',
  },
]

// ---------------------------------------------------------------------------
// EVIDENCE_DOCS
// ---------------------------------------------------------------------------

export const EVIDENCE_DOCS: EvidenceDoc[] = [
  {
    id: 'doc-nunca-mas',
    title: 'Nunca Más — Informe CONADEP',
    type_en: 'Truth Commission Report',
    type_es: 'Informe de Comisión de Verdad',
    date: '1984-09-20',
    summary_en: 'The foundational report of the National Commission on the Disappearance of Persons, documenting 8,961 cases of disappearance and 340 clandestine detention centers.',
    summary_es: 'El informe fundacional de la Comisión Nacional sobre la Desaparición de Personas, documentando 8.961 casos de desaparición y 340 centros clandestinos de detención.',
    source_url: 'http://www.desaparecidos.org/nuncamas/web/investig/articulo/nuncamas/nmas0001.htm',
    verification_status: 'verified',
  },
  {
    id: 'doc-ruvte',
    title: 'RUVTE — Registro Unificado de Víctimas del Terrorismo de Estado',
    type_en: 'Official Victim Registry',
    type_es: 'Registro Oficial de Víctimas',
    date: '2024-01-01',
    summary_en: 'Unified registry maintained by the Ministry of Justice containing 8,753 documented victims with formal complaints plus 784 without formal complaints.',
    summary_es: 'Registro unificado mantenido por el Ministerio de Justicia conteniendo 8.753 víctimas documentadas con denuncia formal más 784 sin denuncia formal.',
    source_url: 'https://datos.jus.gob.ar/dataset/registro-unificado-de-victimas-del-terrorismo-de-estado-ruvte',
    verification_status: 'verified',
  },
  {
    id: 'doc-desclasificados',
    title: 'Documentos Desclasificados de EE.UU.',
    type_en: 'Declassified Intelligence',
    type_es: 'Inteligencia Desclasificada',
    date: '2019-04-12',
    summary_en: 'Over 3,200 declassified documents from CIA, FBI, State Department, DIA, and NSC relating to the Argentine dictatorship, released in multiple tranches since 2002.',
    summary_es: 'Más de 3.200 documentos desclasificados de CIA, FBI, Departamento de Estado, DIA y NSC relativos a la dictadura argentina, liberados en múltiples tandas desde 2002.',
    source_url: 'https://desclasificados.org.ar',
    verification_status: 'verified',
  },
  {
    id: 'doc-sentencia-causa13',
    title: 'Sentencia Causa 13/84 — Juicio a las Juntas',
    type_en: 'Court Verdict',
    type_es: 'Sentencia Judicial',
    date: '1985-12-09',
    summary_en: 'Landmark verdict convicting five of nine junta commanders. Videla and Massera received life sentences. Established jurisprudence for crimes against humanity in Argentine law.',
    summary_es: 'Sentencia histórica condenando a cinco de nueve comandantes de las juntas. Videla y Massera recibieron cadena perpetua. Estableció jurisprudencia para delitos de lesa humanidad en el derecho argentino.',
    source_url: '',
    verification_status: 'verified',
  },
]

// ---------------------------------------------------------------------------
// IMPACT_STATS
// ---------------------------------------------------------------------------

export const IMPACT_STATS: ImpactStat[] = [
  {
    value: '~30,000',
    label_en: 'Persons disappeared',
    label_es: 'Personas desaparecidas',
    source: 'CONADEP, organismos de DDHH',
  },
  {
    value: '762',
    label_en: 'Clandestine detention centers',
    label_es: 'Centros clandestinos de detención',
    source: 'Registro Nacional de CCD',
  },
  {
    value: '361+',
    label_en: 'Court sentences for crimes against humanity',
    label_es: 'Sentencias por delitos de lesa humanidad',
    source: 'PCCH, Fiscalía Federal',
  },
  {
    value: '~140',
    label_en: 'Grandchildren with restored identity',
    label_es: 'Nietos con identidad restituida',
    source: 'Abuelas de Plaza de Mayo',
  },
  {
    value: '~500',
    label_en: 'Children born in captivity (estimated)',
    label_es: 'Niños nacidos en cautiverio (estimados)',
    source: 'Abuelas de Plaza de Mayo',
  },
  {
    value: '1,000+',
    label_en: 'Persons convicted for crimes against humanity',
    label_es: 'Personas condenadas por delitos de lesa humanidad',
    source: 'PCCH Annual Report',
  },
]

// ---------------------------------------------------------------------------
// JUDICIAL_RESPONSES
// ---------------------------------------------------------------------------

export const JUDICIAL_RESPONSES: JudicialResponse[] = [
  {
    id: 'jr-causa-13',
    date: '1985-12-09',
    action_en: 'Trial of the Juntas — convictions',
    action_es: 'Juicio a las Juntas — condenas',
    effect_en: 'Five of nine commanders convicted. First time a civilian court convicted military dictators in Latin America.',
    effect_es: 'Cinco de nueve comandantes condenados. Primera vez que un tribunal civil condenó a dictadores militares en Latinoamérica.',
  },
  {
    id: 'jr-punto-final',
    date: '1986-12-24',
    action_en: 'Full Stop Law — impunity',
    action_es: 'Ley de Punto Final — impunidad',
    effect_en: 'Halted new criminal proceedings. Prosecutors raced to file cases before deadline, resulting in over 300 cases filed in 60 days.',
    effect_es: 'Detuvo nuevos procesos penales. Los fiscales corrieron a presentar causas antes del plazo, resultando en más de 300 causas en 60 días.',
  },
  {
    id: 'jr-obediencia-debida',
    date: '1987-06-04',
    action_en: 'Due Obedience Law — impunity',
    action_es: 'Ley de Obediencia Debida — impunidad',
    effect_en: 'Exempted lower-ranking officers. Combined with Full Stop, effectively ended criminal accountability until 2005.',
    effect_es: 'Eximió a oficiales de menor rango. Combinada con Punto Final, terminó efectivamente la rendición de cuentas penal hasta 2005.',
  },
  {
    id: 'jr-indultos',
    date: '1990-12-29',
    action_en: 'Presidential pardons — impunity',
    action_es: 'Indultos presidenciales — impunidad',
    effect_en: 'Menem pardoned convicted junta members and pending defendants. Released Videla, Massera, and others from prison.',
    effect_es: 'Menem indultó a miembros condenados de las juntas y a imputados pendientes. Liberó a Videla, Massera y otros de prisión.',
  },
  {
    id: 'jr-anulacion',
    date: '2005-06-14',
    action_en: 'Impunity laws declared unconstitutional',
    action_es: 'Leyes de impunidad declaradas inconstitucionales',
    effect_en: 'Supreme Court ruling in Simón case reopened all cases. Led to the largest wave of human rights trials in history.',
    effect_es: 'Fallo de la Corte Suprema en caso Simón reabrió todas las causas. Llevó a la mayor ola de juicios por derechos humanos de la historia.',
  },
]
