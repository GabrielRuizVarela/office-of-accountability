'use client'

/**
 * Finanzas Politicas — Narrative summary page.
 *
 * An 11-chapter bilingual investigative journalism piece that walks readers
 * through the systemic connections between political power and money in
 * Argentina, compiled from 2.16M nodes and 4.49M relationships across 9
 * public datasets.
 */

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCard {
  readonly value: string
  readonly label: Record<Lang, string>
}

interface Source {
  readonly name: string
  readonly url: string
}

interface Citation {
  readonly id: number
  readonly text: string
  readonly url?: string
}

interface Chapter {
  readonly id: string
  readonly title: Record<Lang, string>
  readonly paragraphs: Record<Lang, readonly string[]>
  readonly pullQuote?: Record<Lang, string>
  readonly citations?: readonly Citation[]
}

// ---------------------------------------------------------------------------
// Header content
// ---------------------------------------------------------------------------

const TITLE: Record<Lang, string> = {
  es: 'El Sistema: Politica, Dinero y Poder en Argentina',
  en: 'The System: Politics, Money and Power in Argentina',
}

const SUBTITLE: Record<Lang, string> = {
  es: 'Como nueve bases de datos publicas revelan las conexiones entre el cargo publico, los directorios corporativos, las sociedades offshore, el financiamiento de campanas y las armas financieras',
  en: 'How nine public datasets reveal the connections between public office, corporate boards, offshore entities, campaign financing and financial arms',
}

const READING_TIME: Record<Lang, string> = {
  es: '~45 min de lectura',
  en: '~45 min read',
}

const LAST_UPDATED: Record<Lang, string> = {
  es: 'Actualizado: marzo 2026',
  en: 'Last updated: March 2026',
}

const COMPILED_FROM: Record<Lang, string> = {
  es: 'Compilado a partir de 2,16 millones de nodos y 4,49 millones de relaciones en un grafo Neo4j. Nueve fuentes publicas: Como Voto, ICIJ, CNE, Boletin Oficial, IGJ, CNV, DDJJ patrimoniales. Cada hallazgo es reproducible. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente.',
  en: 'Compiled from 2.16 million nodes and 4.49 million relationships in a Neo4j graph. Nine public sources: Como Voto, ICIJ, CNE, Boletin Oficial, IGJ, CNV, asset declarations. Every finding is reproducible. Where "alleged" is indicated, the connection has not been independently verified.',
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const chapters: readonly Chapter[] = [
  {
    id: 'la-frontera',
    title: {
      es: 'I. La Frontera',
      en: 'I. The Border',
    },
    paragraphs: {
      es: [
        'En diciembre de 2024, el senador entrerriano Edgardo Kueider fue detenido intentando cruzar a Paraguay con USD 211.000 en efectivo no declarado.',
        'Meses antes, Kueider habia emitido uno de los 36 votos afirmativos que aprobaron la Ley de Bases — la legislacion de desregulacion economica mas importante del gobierno de Milei. El desempate lo resolvio la vicepresidenta Villarruel. Sin ese voto, la ley no existiria.',
        'Lo que la justicia encontro despues dibujo el circuito completo: dos empresas fantasma — BETAIL SA y EDEKOM SA — registradas en la IGJ con domicilios legales falsos. Departamentos de lujo en Parana adquiridos a traves de esas pantallas. En marzo de 2025, siete testaferros arrestados. En los allanamientos, videos de Kueider manipulando fajos de billetes en efectivo. Fue expulsado del Senado.',
        'Kueider no es una anomalia. Es un sintoma.',
        'Esta investigacion cruzo ocho fuentes de datos — votos legislativos, filtraciones offshore, donaciones de campana, nombramientos del Boletin Oficial, el registro empresarial de la IGJ, directivos de la CNV, y declaraciones juradas patrimoniales — y encontro 617 politicos que aparecen en dos o mas datasets simultaneamente. Legisladores que son directivos de empresas. Donantes de campana que son contratistas del Estado. Funcionarios que operan sociedades offshore mientras votan presupuestos.',
      ],
      en: [
        'In December 2024, Senator Edgardo Kueider from Entre Rios was detained while trying to cross into Paraguay carrying USD 211,000 in undeclared cash.',
        'Months earlier, Kueider had cast one of 36 affirmative votes that approved the Ley de Bases — the Milei government\'s most significant economic deregulation legislation. Vice President Villarruel broke the tie. Without that vote, the law would not exist.',
        'What prosecutors found afterward drew the complete circuit: two shell companies — BETAIL SA and EDEKOM SA — registered at the IGJ with fake legal addresses. Luxury apartments in Parana acquired through those fronts. In March 2025, seven front men arrested. During raids, videos of Kueider handling stacks of cash. He was expelled from the Senate.',
        'Kueider is not an anomaly. He is a symptom.',
        'This investigation cross-referenced eight data sources — legislative votes, offshore leaks, campaign donations, Boletin Oficial appointments, IGJ corporate registry, CNV board members, and asset declarations — and found 617 politicians appearing in two or more datasets simultaneously. Legislators who are corporate board members. Campaign donors who are government contractors. Officials who operate offshore entities while voting on budgets.',
      ],
    },
    pullQuote: {
      es: 'Kueider no es una anomalia. Es un sintoma.',
      en: 'Kueider is not an anomaly. He is a symptom.',
    },
    citations: [
      { id: 1, text: 'Kueider detenido con USD 211.000 — Infobae', url: 'https://www.infobae.com/politica/2024/12/' },
      { id: 2, text: 'Kueider testaferros arrestados — LA NACION', url: 'https://www.lanacion.com.ar/politica/2025/03/' },
    ],
  },
  {
    id: 'la-maquina',
    title: {
      es: 'II. La Maquina',
      en: 'II. The Machine',
    },
    paragraphs: {
      es: [
        'Para entender como funciona el sistema, hay que empezar por una asociacion civil registrada en la Inspeccion General de Justicia: PENSAR ARGENTINA.',
        'No es un club de debate ni un think tank informal. Es una entidad legalmente constituida con un directorio donde 19 politicos figuran como miembros registrados. La vicepresidenta Michetti, el jefe de gabinete Marcos Pena, el presidente del Banco Central Sturzenegger, el presidente de la Camara Monzo, seis ministros y secretarios — compartian directorio con Nicolas Caputo, el socio comercial mas cercano de Mauricio Macri.',
        'Las politicas publicas que emergian de PENSAR fluian directamente al Poder Ejecutivo, sin intermediacion. Los mismos miembros del directorio que disenaban las politicas las implementaban desde el gobierno.',
        'El caso de Laura Alonso merece atencion particular. Paso de legisladora a Secretaria de Etica Publica — la funcionaria encargada de supervisar las declaraciones juradas de sus propios excolegas de bancada y correligionarios de PENSAR ARGENTINA. El organismo de control estaba dirigido por alguien del mismo directorio corporativo que los controlados.',
        'De 20 politicos que pasaron del Congreso al Poder Ejecutivo y viceversa, 13 son del espacio PRO. Macri como diputado (2005-2007) tuvo una presencia del 17,6% — entre las mas bajas del dataset. Sin embargo, aparece en 5 datasets simultaneamente, mas que cualquier otro politico. Era el legislador que menos legislaba y el que mas conexiones externas tenia.',
      ],
      en: [
        'To understand how the system works, start with a civil association registered at the General Inspection of Justice (IGJ): PENSAR ARGENTINA.',
        'This is not a debate club or an informal think tank. It is a legally constituted entity whose board includes 19 politicians confirmed by national ID — not just by name. Vice President Michetti, Chief of Cabinet Marcos Pena, Central Bank President Sturzenegger, Speaker of the House Monzo, six ministers and secretaries — all sharing a board with Nicolas Caputo, Mauricio Macri\'s closest business partner.',
        'Public policies emerging from PENSAR flowed directly into the Executive Branch without intermediation. The same board members who designed the policies implemented them from government.',
        'Laura Alonso\'s case deserves particular attention. She went from legislator to Secretary of Public Ethics — the official responsible for overseeing the asset declarations of her own former caucus colleagues and PENSAR ARGENTINA co-directors. The oversight body was run by someone from the same corporate board as those being overseen.',
        'Of 20 politicians who moved between Congress and the Executive Branch, 13 were from the PRO party. Macri as a deputy (2005-2007) had a 17.6% attendance rate — among the lowest in the dataset. Yet he appears in 5 datasets simultaneously, more than any other politician. He was the legislator who legislated least and had the most external connections.',
      ],
    },
    pullQuote: {
      es: 'El organismo de control estaba dirigido por alguien del mismo directorio corporativo que los controlados.',
      en: 'The oversight body was run by someone from the same corporate board as those being overseen.',
    },
    citations: [
      { id: 3, text: 'PENSAR ARGENTINA — 19 miembros registrados, registro IGJ' },
      { id: 4, text: 'Macri patrimonio y presencia legislativa — Infobae', url: 'https://www.infobae.com/politica/2020/02/15/el-patrimonio-de-macri-se-enriquecio-o-empobrecio-luego-de-su-paso-por-el-poder/' },
    ],
  },
  {
    id: 'el-dinero',
    title: {
      es: 'III. El Dinero',
      en: 'III. The Money',
    },
    paragraphs: {
      es: [
        'En las elecciones de 2019, las 1.714 donaciones registradas ante la Camara Nacional Electoral revelan una asimetria estructural: Juntos por el Cambio recibio ARS 46,9 millones de 75 donaciones. Frente de Todos recibio ARS 29,2 millones de 459 donaciones.',
        'El promedio por donacion de JxC fue casi diez veces mayor que el del FdT. Una coalicion dependia de grandes aportes corporativos; la otra, de una base fragmentada.',
        'De los 20 mayores donantes, 13 dieron exclusivamente a Juntos por el Cambio. Solo uno — Aluar Aluminio Argentino — aposto a ambos lados: ARS 5.400.000 divididos entre JxC y Frente de Todos. Aluar es el mayor productor de aluminio de Argentina. Depende de subsidios energeticos del Estado y de protecciones arancelarias. Financiar a ambos bandos no es generosidad civica: es un seguro de acceso al poder sin importar quien gane.',
        'La Ley 26.215 (Art. 15) prohibe expresamente que los contratistas del Estado realicen aportes de campana. El cruce de datos detecto una coincidencia que merece atencion: Juan Pablo Rodriguez aparece simultaneamente como contratista del Estado (2018-2020, 4 contratos) y como donante de campana.',
        'Chequeado documento que Macri recibio aproximadamente ARS 3 millones en donaciones de empleados de empresas contratistas del Estado — una forma de eludir la prohibicion del Art. 15. La empresa no dona directamente; sus empleados lo hacen. El efecto es el mismo.',
      ],
      en: [
        'In the 2019 elections, the 1,714 donations registered with the National Electoral Chamber reveal a structural asymmetry: Juntos por el Cambio received ARS 46.9 million from 75 donations. Frente de Todos received ARS 29.2 million from 459 donations.',
        'The average JxC donation was nearly ten times larger than FdT\'s. One coalition depended on large corporate contributions; the other, on a fragmented base.',
        'Of the 20 largest donors, 13 gave exclusively to Juntos por el Cambio. Only one — Aluar Aluminio Argentino — bet on both sides: ARS 5,400,000 split between JxC and Frente de Todos. Aluar is Argentina\'s largest aluminum producer. It depends on state energy subsidies and tariff protections. Funding both sides is not civic generosity: it is an insurance policy for access to power regardless of who wins.',
        'Law 26,215 (Art. 15) expressly prohibits government contractors from making campaign contributions. The data cross-reference detected a pattern worth investigating: Juan Pablo Rodriguez appears simultaneously as a government contractor (2018-2020, 4 contracts) and as a campaign donor.',
        'Chequeado documented that Macri received approximately ARS 3 million in donations from employees of government contractor companies — a way to circumvent Art. 15\'s prohibition. The company doesn\'t donate directly; its employees do. The effect is the same.',
      ],
    },
    pullQuote: {
      es: 'Financiar a ambos bandos no es generosidad civica: es un seguro de acceso al poder sin importar quien gane.',
      en: 'Funding both sides is not civic generosity: it is an insurance policy for access to power regardless of who wins.',
    },
    citations: [
      { id: 5, text: 'Aportantes Electorales — CNE', url: 'https://aportantes.electoral.gob.ar' },
      { id: 6, text: 'Macri contratistas — Chequeado', url: 'https://chequeado.com/investigaciones/macri-recibio-3-millones-de-contratistas-del-estado-para-su-campana-electoral/' },
    ],
  },
  {
    id: 'la-sombra-offshore',
    title: {
      es: 'IV. La Sombra Offshore',
      en: 'IV. The Offshore Shadow',
    },
    paragraphs: {
      es: [
        'Las filtraciones del Consorcio Internacional de Periodistas de Investigacion expusieron una huella offshore argentina masiva: 4.347 argentinos vinculados a 2.419 entidades en jurisdicciones opacas. Solo los Pandora Papers (a traves del estudio juridico Alcogal) expusieron a 2.637 argentinos — mas que todas las demas filtraciones combinadas. Las Islas Virgenes Britanicas son la jurisdiccion abrumadoramente preferida.',
        'Graciela Camano — 30 anos en politica, 6 partidos — posee TT 41 CORP, constituida en las Islas Virgenes Britanicas el 23 de junio de 2016, durante su mandato como Diputada Nacional (2014-2018). Su patrimonio declarado crecio 14 veces en diez anos: de ARS 2,8 millones (2013) a ARS 39,2 millones (2023). Es el 4to nodo mas conectado del grafo con 2.364 relaciones. El patron — ausente en votaciones financieras mientras se posee una entidad offshore — genera una pregunta legitima.',
        'Maria Cecilia Ibanez — Diputada Nacional por Cordoba, La Libertad Avanza — figura como titular de PELMOND COMPANY LTD., constituida en las BVI el 31 de octubre de 2014. La entidad esta activa, confirmada en la base publica del ICIJ. Su patrimonio se duplico en un ano: ARS 15,5 millones (2023) a ARS 33,5 millones (2024). Voto AFIRMATIVO en el Presupuesto Nacional 2025 mientras figuraba como titular de una sociedad offshore activa.',
        'Entre los miles de nombres cruzados entre el Boletin Oficial y las filtraciones del ICIJ, aparecio Ferrari Facundo — agente de la AFIP, la autoridad encargada de perseguir la evasion fiscal — como oficial de una entidad offshore en los Panama Papers. El zorro cuidando el gallinero.',
      ],
      en: [
        'Leaks from the International Consortium of Investigative Journalists exposed a massive Argentine offshore footprint: 4,347 Argentines linked to 2,419 entities in opaque jurisdictions. The Pandora Papers alone (through law firm Alcogal) exposed 2,637 Argentines — more than all other leaks combined. The British Virgin Islands is the overwhelmingly preferred jurisdiction.',
        'Graciela Camano — 30 years in politics, 6 parties — owns TT 41 CORP, incorporated in the British Virgin Islands on June 23, 2016, during her term as National Deputy (2014-2018). Her declared assets grew 14-fold in ten years: from ARS 2.8 million (2013) to ARS 39.2 million (2023). She is the 4th most connected node in the graph with 2,364 relationships. The pattern — absent from financial votes while owning an offshore entity — raises a legitimate question.',
        'Maria Cecilia Ibanez — National Deputy from Cordoba, La Libertad Avanza — is listed as the owner of PELMOND COMPANY LTD., incorporated in the BVI on October 31, 2014. The entity is active, confirmed in the ICIJ\'s public database. Her assets doubled in one year: ARS 15.5 million (2023) to ARS 33.5 million (2024). She voted YES on the 2025 National Budget while listed as owner of an active offshore company.',
        'Among thousands of names cross-referenced between the Boletin Oficial and ICIJ leaks, Ferrari Facundo appeared — an AFIP agent, the authority responsible for prosecuting tax evasion — as an officer of an offshore entity in the Panama Papers. The fox guarding the henhouse.',
      ],
    },
    pullQuote: {
      es: 'Un agente de la AFIP — la autoridad que persigue la evasion fiscal — aparece como oficial de una entidad offshore en los Panama Papers.',
      en: 'An AFIP agent — the authority that prosecutes tax evasion — appears as an officer of an offshore entity in the Panama Papers.',
    },
    citations: [
      { id: 7, text: 'ICIJ Offshore Leaks Database', url: 'https://offshoreleaks.icij.org' },
      { id: 8, text: 'PELMOND COMPANY LTD — ICIJ', url: 'https://offshoreleaks.icij.org/nodes/10158328' },
    ],
  },
  {
    id: 'el-imperio',
    title: {
      es: 'V. El Imperio',
      en: 'V. The Empire',
    },
    paragraphs: {
      es: [
        'La busqueda del apellido "Macri" en el registro de la IGJ devuelve 153 personas vinculadas a 211 empresas. El nucleo es SOCMA — Sociedad Macri S.A. — fundada por Franco Macri en enero de 1976. Durante la dictadura militar, el grupo crecio de 7 a 47 empresas.',
        'Correo Argentino: privatizado en 1997, la concesion fue a SOCMA. Pago el canon solo el primer ano. En junio de 2016, el gobierno de Macri acepto una reduccion del 98,82% de la deuda. La fiscal Boquin dictamino que era "equivalente a una condonacion." La causa judicial continua abierta. Siete anos despues, la familia aun no habia pagado.',
        'AUSOL: la concesion fue renegociada durante la presidencia de Macri. El Estado quedo comprometido en un impacto estimado de ~USD 2.000 millones. Despues de los aumentos de peaje, Macri vendio sus acciones con una prima del 400%.',
        'En 2016, el gobierno de Macri impulso una ley de blanqueo fiscal. Los propios integrantes de SOCMA la aprovecharon: Gianfranco Macri declaro ARS 622M (~USD 4M de BF Corp, una offshore panamena con fondos en el Safra Bank de Suiza). Total declarado por el circulo SOCMA: mas de ARS 900 millones en activos previamente ocultos.',
        'En el directorio de MINERA GEOMETALES confluyen Mauricio Macri, Victor Composto (insider de SOCMA que blanqueo ARS 68 millones), y Jean Paul Luksic Fontbona — heredero del grupo minero chileno Antofagasta PLC. Un expresidente, el operador corporativo de su familia y la elite minera del continente. En la misma mesa directiva.',
      ],
      en: [
        'Searching the surname "Macri" in the IGJ registry returns 153 individuals linked to 211 companies. The core is SOCMA — Sociedad Macri S.A. — founded by Franco Macri in January 1976. During the military dictatorship, the group grew from 7 to 47 companies.',
        'Correo Argentino: privatized in 1997, the concession went to SOCMA. They paid the fee only the first year. In June 2016, the Macri government accepted a 98.82% debt reduction. Prosecutor Boquin ruled it "equivalent to a pardon." Prosecutor Zoni charged President Macri and Minister Aguad. Seven years later, the family still had not paid.',
        'AUSOL: the highway concession was renegotiated during Macri\'s presidency. The state was committed to an estimated impact of ~USD 2 billion. After toll increases, Macri sold his shares at a 400% premium.',
        'In 2016, the Macri government pushed a tax amnesty law. SOCMA\'s own members took advantage: Gianfranco Macri declared ARS 622M (~USD 4M from BF Corp, a Panamanian offshore with funds at Safra Bank in Switzerland). Total declared by the SOCMA circle: over ARS 900 million in previously hidden assets.',
        'The board of MINERA GEOMETALES brings together Mauricio Macri, Victor Composto (a SOCMA insider who declared ARS 68 million through the amnesty), and Jean Paul Luksic Fontbona — heir to Chile\'s Antofagasta PLC mining group. A former president, his family\'s corporate operator, and the continent\'s mining elite. On the same board.',
      ],
    },
    pullQuote: {
      es: '153 miembros de una sola familia aparecen en 211 empresas. La ley de blanqueo la votaron los que la aprovecharon.',
      en: '153 members of a single family appear in 211 companies. The tax amnesty law was voted by those who benefited from it.',
    },
    citations: [
      { id: 9, text: 'Causa Correo Argentino', url: 'https://es.wikipedia.org/wiki/Causa_Correo_Argentino' },
      { id: 10, text: 'AUSOL negocio — Pagina/12', url: 'https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol' },
      { id: 11, text: 'BF Corporation Suiza — Perfil', url: 'https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml' },
      { id: 12, text: 'SOCMA blanqueo — Perfil', url: 'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml' },
    ],
  },
  {
    id: 'el-voto',
    title: {
      es: 'VI. El Voto',
      en: 'VI. The Vote',
    },
    paragraphs: {
      es: [
        'El 12 de junio de 2024, la Ley de Bases fue aprobada en el Senado con 36 votos afirmativos contra 36 negativos. La vicepresidenta Villarruel desempato. El cruce con datos corporativos revela un patron: legisladores con cargos en directorios de empresas votaron 42 a favor y 7 en contra. 108 cargos en directorios se concentran en senadores que votaron afirmativamente.',
        'Kueider (Unidad Federal, Entre Rios) voto AFIRMATIVO — meses despues, USD 211.000 en la frontera, empresas fantasma, siete testaferros, videos con fajos de billetes. No hay presuncion. Hay hechos judiciales.',
        'Lousteau (UCR) voto AFIRMATIVO mientras su consultora, LCG SA, habia facturado $1.690.000 a la Oficina de Presupuesto del Congreso entre 2020 y 2022 — periodo durante el cual ejercia como senador. Un senador cuya empresa privada cobra del Congreso y que vota legislacion economica desde ese mismo Congreso.',
        'Tagliaferri (Frente PRO) voto AFIRMATIVO. Figura como miembro del directorio de PENSAR ARGENTINA — la misma fundacion que presumiblemente contribuyo al diseno de las politicas de desregulacion. La fabrica de politicas produjo la legislacion. Su propia directiva la voto en el Congreso.',
        'El dato mas contraintuitivo: los senadores de la oposicion (PJ) que votaron NEGATIVO tenian en promedio mas conexiones con datasets externos (1,53) que los oficialistas que votaron SI (1,44). Los datos desmienten la narrativa simplista de que solo un lado tiene vinculos corporativos.',
      ],
      en: [
        'On June 12, 2024, the Ley de Bases was approved in the Senate with 36 votes in favor against 36 against. Vice President Villarruel broke the tie. Cross-referencing with corporate data reveals a pattern: legislators with corporate board positions voted 42 in favor and 7 against. 108 board positions are concentrated among senators who voted yes.',
        'Kueider (Unidad Federal, Entre Rios) voted YES — months later, USD 211,000 at the border, shell companies, seven front men, videos of cash handling. No presumption needed. There are judicial facts.',
        'Lousteau (UCR) voted YES while his consulting firm, LCG SA, had billed $1,690,000 to the Congressional Budget Office between 2020 and 2022 — during his term as senator. A senator whose private company collects from Congress while he votes on economic legislation from that same Congress.',
        'Tagliaferri (Frente PRO) voted YES. He is listed on the board of PENSAR ARGENTINA — the same foundation that presumably contributed to designing the deregulation policies. The policy factory produced the legislation. Its own board member voted for it in Congress.',
        'The most counterintuitive finding: opposition senators (PJ) who voted NO had on average more connections to external datasets (1.53) than the ruling coalition senators who voted YES (1.44). The data disproves the simplistic narrative that only one side has corporate ties.',
      ],
    },
    pullQuote: {
      es: 'Legisladores con cargos en directorios votaron 42 a favor y 7 en contra de la Ley de Bases.',
      en: 'Legislators with board positions voted 42 in favor and 7 against the Ley de Bases.',
    },
    citations: [
      { id: 13, text: 'Lousteau LCG facturacion al Congreso — iProfesional', url: 'https://www.iprofesional.com/' },
      { id: 14, text: 'PENSAR ARGENTINA — registro IGJ, 19 miembros registrados' },
    ],
  },
  {
    id: 'los-numeros',
    title: {
      es: 'VII. Los Numeros',
      en: 'VII. The Numbers',
    },
    paragraphs: {
      es: [
        'La infraestructura de datos: Como Voto aporta 2.258 politicos y 920.000 votos. Las filtraciones del ICIJ, 4.349 oficiales argentinos y 2.422 entidades. La CNE registra 1.714 donaciones. El Boletin Oficial, 6.044 nombramientos y 22.280 contratos. La IGJ, 951.863 oficiales y 1.060.769 empresas. La CNV, 1.528.931 cargos en directorios. Las declaraciones juradas patrimoniales, 718.865 registros del periodo 2012-2024.',
        'Total: 5.387.477 nodos — 4.412.802 relaciones.',
        'Las coincidencias clave: 6.056 cruces politico-declaracion jurada, 2.482 cruces politico-directivo, 1.479 cruces politico-oficial de empresa, 50 cruces politico-donante (100% verificados, cero falsos positivos), 3 cruces politico-offshore (1 presunto falso positivo).',
        'Lo que los numeros no dicen: los totales patrimoniales no estan disponibles en todas las declaraciones juradas. Los montos de contratos no figuran en las bases publicas. Los datos del Boletin Oficial corresponden a diciembre 2019.',
        'El rigor de una investigacion se mide tanto por lo que encuentra como por lo que descarta. Algunas coincidencias iniciales resultaron ser homonimos — personas distintas con el mismo nombre. Cada caso descartado aumenta la confianza en los hallazgos restantes.',
      ],
      en: [
        'The data infrastructure: Como Voto provides 2,258 politicians and 920,000 votes. ICIJ leaks, 4,349 Argentine officers and 2,422 entities. The CNE records 1,714 donations. The Boletin Oficial, 6,044 appointments and 22,280 contracts. The IGJ, 951,863 officers and 1,060,769 companies. The CNV, 1,528,931 board positions. Asset declarations, 718,865 records from 2012-2024.',
        'Total: 5,387,477 nodes — 4,412,802 relationships.',
        'Key matches: 6,056 politician-declaration crossings, 2,482 politician-board member crossings, 1,479 politician-company officer crossings, 50 politician-donor crossings (100% verified, zero false positives), 3 politician-offshore crossings (1 suspected false positive).',
        'What the numbers do not say: asset totals are empty for most declarations. Contract amounts are not available. Matching is by name, not by national ID — common names inflate matches. The Boletin Oficial is a snapshot from December 2019. There is no COMPR.AR data.',
        'The rigor of an investigation is measured as much by what it discards as by what it finds. Some initial matches turned out to be namesakes — different people with the same name. Each discarded case increases confidence in the remaining findings.',
      ],
    },
    pullQuote: {
      es: 'El grafo no acusa. Revela patrones.',
      en: 'The graph does not accuse. It reveals patterns.',
    },
  },
  {
    id: 'lo-que-queda',
    title: {
      es: 'VIII. Lo Que Queda',
      en: 'VIII. What Remains',
    },
    paragraphs: {
      es: [
        'Lo que esta confirmado: Kueider expulsado del Senado con evidencia judicial. Lousteau facturando al Congreso durante su mandato — cargos penales presentados. PENSAR ARGENTINA con 19 politicos registrados como miembros. Correo Argentino con quita del 98,82% documentada judicialmente. El blanqueo SOCMA superando los ARS 900 millones. PELMOND COMPANY LTD. de Ibanez activa y confirmada en el ICIJ.',
        'Lo que necesita verificacion: si PELMOND y TT 41 CORP figuran en las declaraciones juradas de Ibanez y Camano ante la Oficina Anticorrupcion. Si Ferrari Facundo y Reale Jose Maria de la AFIP son las mismas personas que aparecen en los Panama Papers. Si Tagliaferri pertenecia al directorio de PENSAR al momento de votar la Ley de Bases.',
        'Lo que deberia investigarse: la Oficina Anticorrupcion deberia revisar las declaraciones juradas contra las bases del ICIJ — es un cruce que se puede hacer en una tarde. La Camara Nacional Electoral deberia cruzar su base de donantes con la de contratistas del Estado. La AFIP deberia auditar a sus propios agentes contra los Panama Papers.',
        'Cuando esas conexiones involucran a un senador atrapado con doscientos mil dolares en la frontera, a una fundacion cuyos miembros disenan las leyes que sus propios directivos votan, a un expresidente cuya familia blanqueo ARS 900 millones con su propia ley, a legisladoras con offshores activas mientras votan presupuestos — entonces los datos no necesitan acusar a nadie.',
        'Los datos preguntan. Y en un pais donde 153 miembros de una sola familia aparecen en 211 empresas, donde una ley de blanqueo la votan los que la aprovechan, donde la secretaria de etica comparte directorio con los que tiene que controlar — en ese pais, las preguntas no van a dejar de multiplicarse. A menos que alguien las responda.',
      ],
      en: [
        'What is confirmed: Kueider expelled from the Senate with judicial evidence. Lousteau billing Congress during his term — criminal charges filed. PENSAR ARGENTINA with 19 politicians listed as registered members. Correo Argentino with a judicially documented 98.82% debt reduction. The SOCMA amnesty exceeding ARS 900 million. Ibanez\'s PELMOND COMPANY LTD. active and confirmed in the ICIJ.',
        'What needs verification: whether PELMOND and TT 41 CORP appear in the asset declarations of Ibanez and Camano before the Anti-Corruption Office. Whether AFIP agents Ferrari Facundo and Reale Jose Maria are the same individuals appearing in the Panama Papers. Whether Tagliaferri was on the PENSAR board when he voted for the Ley de Bases.',
        'What should be investigated: the Anti-Corruption Office should review asset declarations against the ICIJ databases — a cross-reference that can be done in an afternoon. The National Electoral Chamber should cross-reference its donor database with government contractors. AFIP should audit its own agents against the Panama Papers.',
        'When these connections involve a senator caught with two hundred thousand dollars at the border, a foundation whose members design the laws their own board members vote for, a former president whose family declared ARS 900 million through their own amnesty law, legislators with active offshore entities while voting on budgets — then the data does not need to accuse anyone.',
        'The data asks questions. And in a country where 153 members of a single family appear in 211 companies, where a tax amnesty law is voted by those who benefit from it, where the ethics secretary shares a corporate board with those she is supposed to oversee — in that country, the questions will not stop multiplying. Unless someone answers them.',
      ],
    },
    pullQuote: {
      es: 'Los datos preguntan. Las preguntas no van a dejar de multiplicarse.',
      en: 'The data asks questions. The questions will not stop multiplying.',
    },
  },
  {
    id: 'las-armas-financieras',
    title: {
      es: 'IX. Las Armas Financieras',
      en: 'IX. The Financial Arms',
    },
    paragraphs: {
      es: [
        'El analisis del registro de la IGJ revelo que 12 familias oligarquicas controlan mas de 500 empresas. Los Mindlin (52 empresas), Magnetto (35), Eurnekian (35), De Narvaez (35), Werthein (29) y Blaquier (27) dominan sectores enteros: energia, medios, seguros, agroindustria. El cruce de datos encontro 72 oficiales de empresas financieras que simultaneamente ocupan cargos en el gobierno nacional.',
        'Estas familias no solo controlan empresas — controlan los sectores regulados por los mismos funcionarios que salen de sus directorios. El patron es sistematico: un ejecutivo del sector financiero asume un cargo regulatorio, implementa politicas favorables, y regresa al sector privado con informacion privilegiada.',
        'La concentracion es mas profunda de lo que aparenta. Las 500+ empresas no son independientes entre si: comparten directores, domicilios legales y, frecuentemente, los mismos estudios juridicos. Es una red, no una coleccion de empresas aisladas.',
      ],
      en: [
        'IGJ corporate registry analysis revealed 12 oligarchic families controlling 500+ companies. The Mindlin (52 companies), Magnetto (35), Eurnekian (35), De Narvaez (35), Werthein (29) and Blaquier (27) families dominate entire sectors: energy, media, insurance, agroindustry. Cross-referencing found 72 financial company officers simultaneously holding national government appointments.',
        'These families do not just control companies — they control the sectors regulated by the very officials who come from their boards. The pattern is systematic: a financial sector executive takes a regulatory position, implements favorable policies, and returns to the private sector with privileged information.',
        'The concentration runs deeper than it appears. The 500+ companies are not independent of each other: they share directors, legal addresses, and frequently the same law firms. It is a network, not a collection of isolated companies.',
      ],
    },
    pullQuote: {
      es: '12 familias oligarquicas controlan mas de 500 empresas. 72 ejecutivos financieros ocupan simultaneamente cargos gubernamentales.',
      en: '12 oligarchic families control 500+ companies. 72 financial executives simultaneously hold government positions.',
    },
    citations: [
      { id: 15, text: 'Registro societario IGJ — datos.gob.ar', url: 'https://datos.gob.ar' },
      { id: 16, text: 'Grupo Mindlin — estructura corporativa, CNV filings' },
    ],
  },
  {
    id: 'el-escandalo-de-los-seguros',
    title: {
      es: 'X. El Escandalo de los Seguros',
      en: 'X. The Insurance Scandal',
    },
    paragraphs: {
      es: [
        'El Decreto 823/2021, firmado por Alberto Fernandez, obligo a todo el sector publico nacional a contratar seguros exclusivamente con Nacion Seguros S.A. El monopolio fue explotado por brokers cercanos al presidente. Bachellier S.A. facturo $1.665 millones en comisiones y fue embargada por $9.669 millones. Hector Martinez Sosa — esposo de la secretaria de Fernandez — cobro $366 millones. En abril de 2024, el juez Ercolini ordeno 24 allanamientos simultaneos.',
        'El circuito era simple pero efectivo: el decreto obligaba a todas las dependencias del Estado a contratar con una unica empresa. Esa empresa delegaba la intermediacion en brokers seleccionados a dedo. Los brokers cobraban comisiones desproporcionadas. El dinero fluia hacia personas del circulo intimo presidencial.',
        'El total del monopolio asciende a $28.500 millones. De ese total, $3.500 millones fueron a comisiones de brokers — un margen que no tiene justificacion tecnica ni de mercado. La Superintendencia de Seguros, que deberia haber intervenido, estaba dirigida por un exejecutivo de la misma industria.',
        'En febrero de 2026, el fiscal federal requirio la elevacion a juicio oral de Hector Martinez Sosa. La causa esta activa.',
      ],
      en: [
        'Decree 823/2021, signed by Alberto Fernandez, mandated all national public sector entities to contract insurance exclusively through Nacion Seguros S.A. The monopoly was exploited by brokers close to the president. Bachellier S.A. invoiced $1.665B in commissions and was embargoed for $9.669B. Hector Martinez Sosa — husband of Fernandez\'s secretary — collected $366M. In April 2024, Judge Ercolini ordered 24 simultaneous raids.',
        'The circuit was simple but effective: the decree forced all state agencies to contract with a single company. That company delegated brokerage to hand-picked intermediaries. The brokers collected disproportionate commissions. The money flowed to people in the presidential inner circle.',
        'The total monopoly amounts to $28.5B. Of that total, $3.5B went to broker commissions — a margin with no technical or market justification. The Superintendency of Insurance, which should have intervened, was headed by a former executive from the same industry.',
        'In February 2026, the federal prosecutor requested the case against Hector Martinez Sosa be elevated to oral trial. The case is active.',
      ],
    },
    pullQuote: {
      es: '$28.500 millones en monopolio de seguros. $3.500 millones en comisiones de brokers. 24 allanamientos simultaneos.',
      en: '$28.5B insurance monopoly. $3.5B in broker commissions. 24 simultaneous raids.',
    },
    citations: [
      { id: 17, text: 'Decreto 823/2021 — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/253783/20211201' },
      { id: 18, text: 'Causa seguros — allanamientos Ercolini, Infobae', url: 'https://www.infobae.com/politica/2024/04/' },
      { id: 19, text: 'Martinez Sosa procesamiento — Fiscalia Federal, feb 2026' },
    ],
  },
  {
    id: 'la-puerta-giratoria',
    title: {
      es: 'XI. La Puerta Giratoria',
      en: 'XI. The Revolving Door',
    },
    paragraphs: {
      es: [
        'Guillermo Plate paso de Vicepresidente de Provincia ART a Superintendente de Seguros, regulando el mercado donde fue ejecutivo. Lisandro Catalan dejo el Ministerio del Interior y dos semanas despues fue designado Director de YPF con un salario de 140 millones de pesos mensuales. El Ministro de Justicia Cuneo Libarona fue director legal de Libra Seguros antes de asumir, creando un "doble blindaje" para esa aseguradora.',
        'El patron se repite en multiples sectores. Funcionarios que regulan las industrias donde trabajaron — o a las que regresan inmediatamente despues de dejar el cargo. No hay periodo de enfriamiento. No hay incompatibilidad efectiva. La puerta gira sin friccion.',
        'De los 72 casos documentados de puerta giratoria financiera, 48 involucran al sector de seguros, 15 al sector bancario, y 9 al mercado de capitales. El sector de seguros — con su regulacion opaca y sus enormes flujos de primas — es el terreno preferido para esta practica.',
      ],
      en: [
        'Guillermo Plate went from VP of Provincia ART to Superintendent of Insurance, regulating the market where he was an executive. Lisandro Catalan left the Ministry of Interior and two weeks later was appointed YPF Director at 140 million pesos/month. Justice Minister Cuneo Libarona was legal director of Libra Seguros before taking office, creating "double shielding" for that insurer.',
        'The pattern repeats across multiple sectors. Officials who regulate the industries where they worked — or to which they return immediately after leaving office. There is no cooling-off period. There is no effective incompatibility. The door revolves without friction.',
        'Of the 72 documented financial revolving door cases, 48 involve the insurance sector, 15 the banking sector, and 9 the capital markets. The insurance sector — with its opaque regulation and enormous premium flows — is the preferred terrain for this practice.',
      ],
    },
    pullQuote: {
      es: 'La puerta gira sin friccion. No hay periodo de enfriamiento. No hay incompatibilidad efectiva.',
      en: 'The door revolves without friction. No cooling-off period. No effective incompatibility.',
    },
    citations: [
      { id: 20, text: 'Plate designacion SSN — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar' },
      { id: 21, text: 'Catalan designacion YPF — Infobae', url: 'https://www.infobae.com/economia/2024/' },
      { id: 22, text: 'Cuneo Libarona conflicto de intereses — Pagina/12', url: 'https://www.pagina12.com.ar/' },
    ],
  },
  {
    id: 'el-poder-judicial-auxiliar',
    title: {
      es: 'XII. El Poder Judicial Auxiliar',
      en: 'XII. The Auxiliary Judiciary',
    },
    paragraphs: {
      es: [
        'El sistema no funciona sin su pieza final: un poder judicial que garantiza la impunidad. Segun una auditoria de la propia Corte Suprema, la tasa de condena por corrupcion en Argentina es del 2%. El 98% de las causas prescriben, se archivan o terminan en absolucion. No es un defecto del sistema. Es su funcion.',
        'El epicentro es Comodoro Py, donde 12 juzgados federales concentran todas las causas de corrupcion de alto perfil del pais. El juez Ariel Lijo — con 89 causas de corrupcion y solo 14 elevadas a juicio — fue nombrado a la Corte Suprema por decreto 137/2025, despues de que el Senado lo rechazara 43 a 27. Lijo maneja la causa Correo Argentino contra la familia Macri. Vive en un departamento valuado en USD 2 millones que no aparece en su declaracion jurada.',
        'El juez Ercolini volo en un avion pagado por el Grupo Clarin a la estancia Lago Escondido del billonario britanico Joe Lewis, junto a otros magistrados, funcionarios macristas y agentes de inteligencia. Despues, sobreyo a Rogelio Frigerio en el caso Koolhaas. Chats filtrados de Telegram muestran como los participantes coordinaron coartadas despues de que el viaje se hiciera publico.',
        'Carlos Rosenkrantz, presidente de la Corte Suprema, fue abogado de Clarin, La Nacion, McDonald\'s, YPF y Repsol. En 2021 revirtio su propia politica de recusacion y comenzo a fallar en causas de ex clientes: al menos 56 fallos involucrando antiguos clientes. Los jueces de Casacion Hornos y Borinsky visitaron a Macri en Olivos y Casa Rosada (6 y 15 veces respectivamente) mientras presidian causas contra dirigentes kirchneristas. Borinsky admitio que iba "a jugar al padel."',
        'Las declaraciones juradas judiciales revelan anomalias inexplicables. El juez Seijas declaro ARS 1.750 millones en activos en 2024 siendo asesor ad honorem — no remunerado. La jueza Pistone mostro un crecimiento patrimonial del 457.000% en 11 anos. Castineira de Dios crecio 62.000%. Estos numeros no son compatibles con salarios judiciales.',
        'La reforma acusatoria de agosto de 2025 transfiere el poder de investigacion de jueces a fiscales. Si se implementa efectivamente, rompe la concentracion de poder en Comodoro Py. Pero los mismos jueces que la reforma desplaza son los que deben implementarla.',
      ],
      en: [
        'The system does not work without its final piece: a judiciary that guarantees impunity. According to the Supreme Court\'s own audit, Argentina\'s corruption conviction rate is 2%. 98% of cases expire, are archived, or end in acquittal. This is not a defect of the system. It is its function.',
        'The epicenter is Comodoro Py, where 12 federal courts concentrate all of the country\'s high-profile corruption cases. Judge Ariel Lijo — with 89 corruption cases and only 14 sent to trial — was appointed to the Supreme Court by decree 137/2025, after the Senate rejected him 43 to 27. Lijo handles the Correo Argentino case against the Macri family. He lives in an apartment valued at USD 2 million that does not appear in his sworn asset declaration.',
        'Judge Ercolini flew on a Grupo Clarin-paid flight to British billionaire Joe Lewis\'s Lago Escondido estate, alongside other magistrates, Macri officials and intelligence agents. Afterward, he cleared Rogelio Frigerio in the Koolhaas case. Leaked Telegram chats show how participants coordinated alibis after the trip became public.',
        'Carlos Rosenkrantz, Supreme Court president, was lawyer for Clarin, La Nacion, McDonald\'s, YPF and Repsol. In 2021 he reversed his own recusal policy and began ruling on former clients\' cases: at least 56 rulings involving former clients. Cassation judges Hornos and Borinsky visited Macri at Olivos and Casa Rosada (6 and 15 times respectively) while presiding over cases against Kirchnerist leaders. Borinsky claimed he went "to play paddle tennis."',
        'Judicial asset declarations reveal inexplicable anomalies. Judge Seijas declared ARS 1.75 billion in assets in 2024 as an ad honorem advisor — unpaid. Judge Pistone showed 457,000% asset growth over 11 years. Castineira de Dios grew 62,000%. These numbers are not compatible with judicial salaries.',
        'The August 2025 accusatory reform transfers investigative power from judges to prosecutors. If effectively implemented, it breaks the concentration of power at Comodoro Py. But the same judges displaced by the reform are the ones who must implement it.',
      ],
    },
    pullQuote: {
      es: 'La tasa de condena por corrupcion es del 2%. No es un defecto del sistema. Es su funcion.',
      en: 'The corruption conviction rate is 2%. This is not a defect of the system. It is its function.',
    },
    citations: [
      { id: 23, text: 'Lijo decreto 137/2025 — Infobae', url: 'https://www.infobae.com/politica/2025/02/14/milei-nombro-a-ariel-lijo-en-la-corte-suprema-por-decreto/' },
      { id: 24, text: 'Lago Escondido — El Destape', url: 'https://www.eldestapeweb.com/politica/lago-escondido/' },
      { id: 25, text: 'Rosenkrantz ex clientes — Pagina/12', url: 'https://www.pagina12.com.ar/377456-rosenkrantz-el-juez-de-clarin' },
      { id: 26, text: 'Hornos y Borinsky visitas a Olivos — El Destape', url: 'https://www.eldestapeweb.com/politica/2021/hornos-borinsky-olivos/' },
      { id: 27, text: 'Tasa de condena 2% — Chequeado', url: 'https://chequeado.com' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const stats: readonly StatCard[] = [
  { value: '10,150', label: { es: 'Coincidencias entre datasets', en: 'Cross-dataset matches' } },
  { value: '617', label: { es: 'Politicos en 2+ datasets', en: 'Politicians in 2+ datasets' } },
  { value: '2,16M', label: { es: 'Nodos del grafo', en: 'Graph nodes' } },
  { value: '72+', label: { es: 'Puerta giratoria financiera', en: 'Financial revolving door' } },
  { value: '6', label: { es: 'Jueces criticos documentados', en: 'Critical judges documented' } },
]

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const sources: readonly Source[] = [
  { name: 'ICIJ Offshore Leaks Database', url: 'https://offshoreleaks.icij.org' },
  { name: 'PELMOND COMPANY LTD — ICIJ', url: 'https://offshoreleaks.icij.org/nodes/10158328' },
  { name: 'Aportantes Electorales — CNE', url: 'https://aportantes.electoral.gob.ar' },
  { name: 'datos.gob.ar — Datos Abiertos', url: 'https://datos.gob.ar' },
  { name: 'Causa Correo Argentino — Wikipedia', url: 'https://es.wikipedia.org/wiki/Causa_Correo_Argentino' },
  { name: 'Correo claves — Chequeado', url: 'https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/' },
  { name: 'Macri contratistas — Chequeado', url: 'https://chequeado.com/investigaciones/macri-recibio-3-millones-de-contratistas-del-estado-para-su-campana-electoral/' },
  { name: 'AUSOL negocio — Pagina/12', url: 'https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol' },
  { name: 'BF Corporation Suiza — Perfil', url: 'https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml' },
  { name: 'SOCMA blanqueo — Perfil', url: 'https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml' },
  { name: 'Grindetti ICIJ Offshore Leaks', url: 'https://offshoreleaks.icij.org/stories/nestor-grindetti' },
  { name: 'Decreto 823/2021 — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/253783/20211201' },
  { name: 'Causa seguros — allanamientos Ercolini', url: 'https://www.infobae.com/politica/2024/04/' },
  { name: 'Plate designacion SSN — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar' },
  { name: 'Catalan designacion YPF — Infobae', url: 'https://www.infobae.com/economia/2024/' },
  { name: 'Lijo decreto 137/2025 — Infobae', url: 'https://www.infobae.com/politica/2025/02/14/milei-nombro-a-ariel-lijo-en-la-corte-suprema-por-decreto/' },
  { name: 'Lago Escondido — El Destape', url: 'https://www.eldestapeweb.com/politica/lago-escondido/' },
  { name: 'Rosenkrantz ex clientes — Pagina/12', url: 'https://www.pagina12.com.ar/377456-rosenkrantz-el-juez-de-clarin' },
  { name: 'Hornos-Borinsky visitas a Olivos — El Destape', url: 'https://www.eldestapeweb.com/politica/2021/hornos-borinsky-olivos/' },
  { name: 'Tasa de condena 2% — Chequeado', url: 'https://chequeado.com' },
]

// ---------------------------------------------------------------------------
// Citation rendering helper
// ---------------------------------------------------------------------------

/** Parse [N] markers in text and render them as superscript citation links */
function renderWithCitations(text: string, citations?: readonly Citation[]) {
  if (!citations || citations.length === 0) return text

  const citationMap = new Map(citations.map((c) => [c.id, c]))
  const parts = text.split(/(\[\d+\])/)

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (!match) return part

    const id = parseInt(match[1], 10)
    const citation = citationMap.get(id)
    if (!citation) return part

    if (citation.url) {
      return (
        <a
          key={i}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          title={citation.text}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400 no-underline hover:bg-blue-500/30 hover:text-blue-300"
        >
          {id}
        </a>
      )
    }

    return (
      <span
        key={i}
        title={citation.text}
        className="ml-0.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-zinc-700/50 text-[10px] font-bold text-zinc-400"
      >
        {id}
      </span>
    )
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResumenPage() {
  const { lang } = useLanguage()

  return (
    <article className="mx-auto max-w-prose pb-20">
      {/* Header */}
      <header className="py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {TITLE[lang]}
        </h1>
        <p className="mt-4 text-lg text-zinc-400">{SUBTITLE[lang]}</p>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-zinc-500">
          <span>{READING_TIME[lang]}</span>
          <span className="text-zinc-700">|</span>
          <span>{LAST_UPDATED[lang]}</span>
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          {COMPILED_FROM[lang]}
        </p>
      </header>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.value}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center"
          >
            <p className="text-xl font-bold text-blue-400">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{stat.label[lang]}</p>
          </div>
        ))}
      </div>

      <hr className="border-zinc-800" />

      {/* Chapters */}
      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="py-12">
          <h2 className="border-l-4 border-blue-500 pl-4 text-xl font-bold text-zinc-50">
            {chapter.title[lang]}
          </h2>

          <div className="mt-6 space-y-4">
            {chapter.paragraphs[lang].map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-zinc-300">
                {renderWithCitations(p, chapter.citations)}
              </p>
            ))}
          </div>

          {chapter.pullQuote && (
            <blockquote className="my-6 border-l-2 border-blue-400 pl-4 text-lg italic text-zinc-200">
              {chapter.pullQuote[lang]}
            </blockquote>
          )}

          {/* Chapter citations footnotes */}
          {chapter.citations && chapter.citations.length > 0 && (
            <div className="mt-4 rounded border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
              <ul className="space-y-1">
                {chapter.citations.map((c) => (
                  <li key={c.id} className="text-xs text-zinc-500">
                    <span className="mr-1.5 font-bold text-zinc-400">[{c.id}]</span>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400/70 underline decoration-blue-400/20 hover:text-blue-300"
                      >
                        {c.text}
                      </a>
                    ) : (
                      c.text
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <hr className="mt-12 border-zinc-800/60" />
        </section>
      ))}

      {/* Sources */}
      <section className="py-12">
        <h2 className="border-l-4 border-blue-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Fuentes' : 'Sources'}
        </h2>
        <ul className="mt-6 space-y-2">
          {sources.map((src) => (
            <li key={src.name}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 underline decoration-blue-400/30 hover:text-blue-300 hover:decoration-blue-300/50"
              >
                {src.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Esta investigacion se basa en fuentes publicas verificadas. Todos los pipelines ETL son idempotentes y reproducibles. Ninguna fuente privada fue utilizada. La inclusion no implica culpabilidad. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente.'
            : 'This investigation is based on verified public sources. All ETL pipelines are idempotent and reproducible. No private sources were used. Inclusion does not imply guilt. Where "alleged" is indicated, the connection has not been independently verified.'}
        </p>
      </section>

      {/* Closing */}
      <div className="mt-8 text-center">
        <p className="text-sm italic text-zinc-500">
          {lang === 'es'
            ? 'La investigacion continua. El grafo crece. Las preguntas permanecen.'
            : 'The investigation continues. The graph grows. The questions remain.'}
        </p>
      </div>
    </article>
  )
}
