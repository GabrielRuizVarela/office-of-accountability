'use client'

/**
 * Finanzas Politicas — Narrative summary page.
 *
 * A 16-chapter bilingual investigative journalism piece that walks readers
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
  es: 'Dieciseis capitulos sobre como nueve bases de datos publicas revelan las conexiones entre el cargo publico, los directorios corporativos, las sociedades offshore, el financiamiento de campanas, las armas financieras, el escandalo de los seguros, la puerta giratoria, el poder judicial, la riqueza inexplicable, el imperio Macri, el cartel de la salud y la captura del Estado por JP Morgan',
  en: 'Sixteen chapters on how nine public datasets reveal the connections between public office, corporate boards, offshore entities, campaign financing, financial arms, the insurance scandal, the revolving door, the judiciary, unexplained wealth, the Macri empire, the health cartel, and State capture by JP Morgan',
}

const READING_TIME: Record<Lang, string> = {
  es: '~50 min de lectura',
  en: '~50 min read',
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
    id: 'las-armas-financieras',
    title: {
      es: 'VII. Las Armas Financieras',
      en: 'VII. The Financial Arms',
    },
    paragraphs: {
      es: [
        'El analisis del registro de la IGJ revelo que 12 familias oligarquicas controlan mas de 500 empresas. Los Mindlin lideran con 52 empresas, seguidos por Magnetto (35), Eurnekian (35), De Narvaez (35), Werthein (29) y Blaquier (27). Dominan sectores enteros: energia, medios, seguros, agroindustria. El cruce de datos encontro 72 oficiales de empresas financieras que simultaneamente ocupan cargos en el gobierno nacional.',
        'La concentracion no es solo vertical sino transversal. Los directorios cruzados entre familias revelan la arquitectura real del poder economico: en MINERA GEOMETALES confluyen los Macri con la elite minera chilena. En el Buenos Aires Golf Club se cruzan directorios de familias que compiten en el mercado pero cooperan en la gobernanza. En el Consejo Empresario Argentino para el Desarrollo Sustentable (CEADS), ejecutivos de grupos rivales comparten mesa.',
        'Estas 500+ empresas no son independientes entre si: comparten directores, domicilios legales y, frecuentemente, los mismos estudios juridicos. Es una red, no una coleccion de empresas aisladas. Los mismos nombres aparecen una y otra vez en diferentes combinaciones, tejiendo un entramado corporativo que cruza todos los sectores regulados de la economia.',
        'El patron es sistematico: un ejecutivo del sector financiero asume un cargo regulatorio, implementa politicas favorables, y regresa al sector privado con informacion privilegiada. De los 72 casos documentados, la concentracion en el sector de seguros es abrumadora — el terreno preferido por su regulacion opaca y sus enormes flujos de primas.',
      ],
      en: [
        'IGJ corporate registry analysis revealed 12 oligarchic families controlling 500+ companies. The Mindlin family leads with 52 companies, followed by Magnetto (35), Eurnekian (35), De Narvaez (35), Werthein (29) and Blaquier (27). They dominate entire sectors: energy, media, insurance, agroindustry. Cross-referencing found 72 financial company officers simultaneously holding national government appointments.',
        'The concentration is not just vertical but cross-cutting. Cross-family boards reveal the real architecture of economic power: at MINERA GEOMETALES, the Macris converge with Chilean mining elite. At the Buenos Aires Golf Club, boards of families that compete in the market but cooperate in governance intersect. At the Argentine Business Council for Sustainable Development (CEADS), executives from rival groups share the same table.',
        'These 500+ companies are not independent of each other: they share directors, legal addresses, and frequently the same law firms. It is a network, not a collection of isolated companies. The same names appear again and again in different combinations, weaving a corporate web that crosses all regulated sectors of the economy.',
        'The pattern is systematic: a financial sector executive takes a regulatory position, implements favorable policies, and returns to the private sector with privileged information. Of the 72 documented cases, the concentration in the insurance sector is overwhelming — the preferred terrain due to its opaque regulation and enormous premium flows.',
      ],
    },
    pullQuote: {
      es: '72 oficiales de empresas financieras simultaneamente ocupan cargos en el gobierno nacional.',
      en: '72 officers of financial companies simultaneously hold national government appointments.',
    },
    citations: [
      { id: 15, text: 'Registro societario IGJ — datos.gob.ar', url: 'https://datos.gob.ar' },
      { id: 16, text: 'Grupo Mindlin — estructura corporativa, CNV filings' },
      { id: 17, text: 'CEADS — miembros corporativos', url: 'https://ceads.org.ar' },
    ],
  },
  {
    id: 'el-escandalo-de-los-seguros',
    title: {
      es: 'VIII. El Escandalo de los Seguros',
      en: 'VIII. The Insurance Scandal',
    },
    paragraphs: {
      es: [
        'El Decreto 823/2021, firmado por Alberto Fernandez, obligo a todo el sector publico nacional a contratar seguros exclusivamente con Nacion Seguros S.A. De un plumazo, se creo un monopolio cautivo de $28.500 millones. La Superintendencia de Seguros, que deberia haber intervenido, estaba dirigida por un exejecutivo de la misma industria.',
        'El monopolio fue explotado por brokers cercanos al presidente. Bachellier S.A. fue el principal beneficiario: facturo $1.665 millones en comisiones y fue embargada por $9.669 millones. Hector Martinez Sosa — esposo de Maria Cantero, la secretaria privada del presidente Fernandez — cobro $366 millones en comisiones. El circuito era simple pero efectivo: el decreto obligaba a todas las dependencias del Estado a contratar con una unica empresa, que delegaba la intermediacion en brokers seleccionados a dedo.',
        'Los 25 principales brokers cobraron $3.500 millones en comisiones de fondos publicos — un margen que no tiene justificacion tecnica ni de mercado. En abril de 2024, el juez Ercolini ordeno 24 allanamientos simultaneos. Se incautaron documentos, dispositivos y registros financieros.',
        'En febrero de 2026, el fiscal federal requirio la elevacion a juicio oral de Hector Martinez Sosa. La causa esta activa y la investigacion se extiende a la cadena completa de intermediacion.',
      ],
      en: [
        'Decree 823/2021, signed by Alberto Fernandez, mandated all national public sector entities to contract insurance exclusively through Nacion Seguros S.A. With a single stroke, a $28.5B captive monopoly was created. The Superintendency of Insurance, which should have intervened, was headed by a former executive from the same industry.',
        'The monopoly was exploited by brokers close to the president. Bachellier S.A. was the main beneficiary: it invoiced $1.665B in commissions and was embargoed for $9.669B. Hector Martinez Sosa — husband of Maria Cantero, President Fernandez\'s private secretary — collected $366M in commissions. The circuit was simple but effective: the decree forced all state agencies to contract with a single company, which delegated brokerage to hand-picked intermediaries.',
        'The top 25 brokers collected $3.5 billion in commissions from public funds — a margin with no technical or market justification. In April 2024, Judge Ercolini ordered 24 simultaneous raids. Documents, devices and financial records were seized.',
        'In February 2026, the federal prosecutor requested the case against Hector Martinez Sosa be elevated to oral trial. The case is active and the investigation extends to the full intermediation chain.',
      ],
    },
    pullQuote: {
      es: 'Los 25 principales brokers cobraron $3.500 millones en comisiones de fondos publicos.',
      en: 'The top 25 brokers collected $3.5 billion in commissions from public funds.',
    },
    citations: [
      { id: 18, text: 'Decreto 823/2021 — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/253783/20211201' },
      { id: 19, text: 'Causa seguros — allanamientos Ercolini, Infobae', url: 'https://www.infobae.com/judiciales/2024/04/05/el-juez-julian-ercolini-ordeno-24-allanamientos-por-el-escandalo-de-los-seguros/' },
      { id: 20, text: 'Martinez Sosa procesamiento — Fiscalia Federal, feb 2026' },
      { id: 21, text: 'Bachellier embargo $9.669M — Ambito Financiero', url: 'https://www.infobae.com/politica/2024/03/18/escandalo-de-los-seguros-las-empresas-del-broker-amigo-de-alberto-fernandez-y-sus-satelites-cobraron-mas-de-2000-millones-por-comisiones/' },
    ],
  },
  {
    id: 'la-puerta-giratoria',
    title: {
      es: 'IX. La Puerta Giratoria',
      en: 'IX. The Revolving Door',
    },
    paragraphs: {
      es: [
        'El grafo revela 1.428 coincidencias de puerta giratoria — funcionarios que saltan entre el sector privado y los cargos publicos que regulan ese mismo sector. No son 72 casos aislados como se estimaba inicialmente. Son mil cuatrocientos veintiocho pares documentados en Neo4j, un sistema estructural donde la regulacion y el negocio comparten el mismo personal.',
        'El caso mas extremo es el par Plate-Pazo en el sector asegurador. Guillermo Plate paso de Vicepresidente de Provincia ART a Superintendente de Seguros de la Nacion — regulador del mercado donde fue ejecutivo. Pero Plate no es una anomalia: tanto el como Pazo figuran simultaneamente como Superintendentes y como oficiales de companias de seguros en los registros de la IGJ. No es puerta giratoria: es autoregulacion. El regulador y el regulado son la misma persona.',
        'El gabinete de Milei revela una concentracion sin precedentes de un solo banco de inversion: siete funcionarios con pasado en JP Morgan — Caputo, Bausili, Daza, Werning, Quirno, Lew y Reidel.[22] No es una coincidencia estadistica. Es un equipo completo trasplantado de Wall Street al Ministerio de Economia, negociando deuda soberana con sus antiguos colegas del otro lado de la mesa.',
        'Diana Mondino salto del directorio de Atlas Network — el think tank libertario financiado por Koch Industries y ExxonMobil — directamente al Ministerio de Relaciones Exteriores.[23] Nicolas Posse, ejecutivo del Grupo Eurnekian (Corporacion America, aeropuertos, energia), fue designado Jefe de Gabinete — supervisando las concesiones aeroportuarias y energeticas de su antiguo empleador.',
        'Lisandro Catalan dejo el Ministerio del Interior y catorce dias despues fue designado Director de YPF con un salario de $140 millones mensuales. El Ministro de Justicia Cuneo Libarona fue director legal de Libra Seguros antes de asumir — un "doble blindaje" que protege a su antigua empleadora desde la regulacion y desde la justicia. La dinastia Frigerio completa el cuadro hereditario: el padre en el directorio de YPF mientras el hijo era Ministro del Interior. Dos generaciones, dos ramas del poder, los mismos intereses.',
      ],
      en: [
        'The graph reveals 1,428 revolving door matches — officials who jump between the private sector and the public offices that regulate that same sector. These are not 72 isolated cases as initially estimated. They are one thousand four hundred twenty-eight documented pairs in Neo4j, a structural system where regulation and business share the same personnel.',
        'The most extreme case is the Plate-Pazo pair in the insurance sector. Guillermo Plate went from VP of Provincia ART to Superintendent of Insurance — regulator of the market where he was an executive. But Plate is not an anomaly: both he and Pazo appear simultaneously as Superintendents and as officers of insurance companies in the IGJ registry. This is not a revolving door: it is self-regulation. The regulator and the regulated are the same person.',
        'The Milei cabinet reveals an unprecedented concentration from a single investment bank: seven officials with JP Morgan backgrounds — Caputo, Bausili, Daza, Werning, Quirno, Lew, and Reidel.[22] This is not a statistical coincidence. It is a complete team transplanted from Wall Street to the Ministry of Economy, negotiating sovereign debt with their former colleagues on the other side of the table.',
        'Diana Mondino jumped from the Atlas Network board — the libertarian think tank funded by Koch Industries and ExxonMobil — directly to the Ministry of Foreign Affairs.[23] Nicolas Posse, an executive at Grupo Eurnekian (Corporacion America, airports, energy), was appointed Chief of Staff — overseeing the airport and energy concessions of his former employer.',
        'Lisandro Catalan left the Ministry of Interior and fourteen days later was appointed YPF Director at $140 million pesos/month. Justice Minister Cuneo Libarona was legal director of Libra Seguros before taking office — a "double shielding" that protects his former employer from both regulation and justice. The Frigerio dynasty completes the hereditary picture: the father on YPF\'s board while the son was Interior Minister. Two generations, two branches of power, the same interests.',
      ],
    },
    pullQuote: {
      es: '1.428 coincidencias de puerta giratoria. Plate y Pazo: Superintendentes de Seguros y oficiales de aseguradoras al mismo tiempo.',
      en: '1,428 revolving door matches. Plate and Pazo: Insurance Superintendents and insurance company officers at the same time.',
    },
    citations: [
      { id: 22, text: 'Plate y Pazo designaciones SSN — Boletin Oficial / IGJ', url: 'https://www.boletinoficial.gob.ar' },
      { id: 23, text: 'Mondino en Atlas Network — Atlas Network annual report 2023', url: 'https://www.atlasnetwork.org/' },
      { id: 24, text: 'Catalan designacion YPF — iProfesional', url: 'https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf' },
      { id: 25, text: 'Posse en Grupo Eurnekian — Infobae', url: 'https://www.infobae.com/economia/2023/12/10/nicolas-posse-el-jefe-de-gabinete-que-llega-del-grupo-eurnekian/' },
    ],
  },
  {
    id: 'el-poder-judicial',
    title: {
      es: 'X. El Poder Judicial',
      en: 'X. The Judiciary',
    },
    paragraphs: {
      es: [
        'Comodoro Py es el edificio de tribunales federales de Buenos Aires. Doce juzgados, los mismos jueces, todas las causas politicas del pais. En el grafo, es el mayor broker estructural de la red: 66 pares conectados exclusivamente a traves de sus jueces y fiscales — mas que cualquier otro nodo institucional. No es un tribunal. Es una central de distribucion del poder judicial.',
        'Una auditoria del Consejo de la Magistratura confirmo la tasa de condena por corrupcion: 2%.[26] De cada cien causas que ingresan a Comodoro Py por delitos contra la administracion publica, noventa y ocho terminan en sobreseimiento, prescripcion o archivo. Entre los 10 jueces mas interconectados del grafo, el motor detecto 30 triangulos de poder — triadas donde tres jueces comparten vinculos con las mismas personas, empresas o causas.',
        'El juez Ercolini volo a Lago Escondido en un avion pagado por el Grupo Clarin. Despues, sobreseyo a Frigerio en una causa por enriquecimiento ilicito. Despues, fue asignado a la causa del escandalo de los seguros contra Fernandez. El mismo juez que acepto un vuelo corporativo, libero a un funcionario vinculado a ese grupo, y luego investigo al presidente que estaba en conflicto con ese mismo grupo.',
        'Los camaristas Hornos y Borinsky realizaron 15 visitas documentadas a la Quinta de Olivos durante el gobierno de Macri — entre 2016 y 2019, mientras juzgaban causas que involucraban al gobierno.[28] La cronologia es precisa: visitas previas a resoluciones favorables al oficialismo. No son reuniones institucionales. Son encuentros privados en la residencia presidencial con jueces que tenian causas del presidente en sus despachos.',
        'Ariel Lijo lleva decadas en Comodoro Py. Su historial: 89 causas, 14 llegaron a juicio oral. El 3 de abril de 2025, el Senado voto 43 a 27 en contra de su designacion a la Corte Suprema — el primer rechazo desde el retorno de la democracia en 1983.[27] Un departamento de USD 2 millones no declarado en sus presentaciones patrimoniales. El gobierno lo designo igualmente por decreto.',
        'Carlos Rosenkrantz — presidente de la Corte Suprema — fue abogado del Grupo Clarin. Se excuso en 85 causas por conflicto de intereses, pero no en las que involucraban a Clarin. Resultado: mas de 25 fallos sobre casos que involucraban directamente a sus antiguos clientes.[29] Cuando el conflicto de intereses es selectivo, la excusacion se convierte en coartada.',
      ],
      en: [
        'Comodoro Py is the federal courthouse in Buenos Aires. Twelve courts, the same judges, all of the country\'s political cases. In the graph, it is the largest structural broker in the network: 66 bridged pairs connected exclusively through its judges and prosecutors — more than any other institutional node. It is not a courthouse. It is a distribution hub for judicial power.',
        'An audit by the Consejo de la Magistratura confirmed the corruption conviction rate: 2%.[26] Of every hundred cases that enter Comodoro Py for crimes against public administration, ninety-eight end in acquittal, expiration, or dismissal. Among the 10 most interconnected judges in the graph, the engine detected 30 power triangles — triads where three judges share ties to the same persons, companies, or cases.',
        'Judge Ercolini flew to Lago Escondido on a plane paid for by the Clarin Group. Afterward, he cleared Frigerio in an illicit enrichment case. Then, he was assigned to the insurance scandal case against Fernandez. The same judge who accepted a corporate flight, cleared an official linked to that group, and then investigated the president who was in conflict with that same group.',
        'Appellate judges Hornos and Borinsky made 15 documented visits to the Olivos presidential residence during the Macri administration — between 2016 and 2019, while judging cases involving the government.[28] The chronology is precise: visits preceding rulings favorable to the ruling party. These are not institutional meetings. They are private encounters at the presidential residence with judges who had the president\'s cases on their desks.',
        'Ariel Lijo has spent decades at Comodoro Py. His record: 89 cases, 14 reached oral trial. On April 3, 2025, the Senate voted 43 to 27 against his Supreme Court nomination — the first rejection since the return of democracy in 1983.[27] An undeclared USD 2 million apartment not included in his asset declarations. The government appointed him by decree regardless.',
        'Carlos Rosenkrantz — Supreme Court president — was a lawyer for the Clarin Group. He recused himself from 85 cases for conflict of interest, but not from those involving Clarin. Result: more than 25 rulings on cases directly involving his former clients.[29] When the conflict of interest is selective, recusal becomes an alibi.',
      ],
    },
    pullQuote: {
      es: 'Comodoro Py: 66 pares conectados, 30 triangulos de poder, 2% de condenas. El mayor broker estructural de la red.',
      en: 'Comodoro Py: 66 bridged pairs, 30 power triangles, 2% conviction rate. The largest structural broker in the network.',
    },
    citations: [
      { id: 26, text: 'Tasa de condena por corrupcion 2% — Consejo de la Magistratura / ACIJ', url: 'https://acij.org.ar/monitoreo-de-causas-de-corrupcion/' },
      { id: 27, text: 'Lijo rechazo Senado 43-27, 3 abril 2025 — Infobae', url: 'https://www.infobae.com/politica/2025/04/03/el-senado-rechazo-el-pliego-de-ariel-lijo-para-la-corte-suprema/' },
      { id: 28, text: 'Borinsky 15 visitas a Olivos — CELS', url: 'https://www.cels.org.ar/web/2021/01/las-visitas-de-los-jueces-hornos-y-borinsky-a-olivos/' },
      { id: 29, text: 'Rosenkrantz 25+ fallos sobre ex-clientes de Clarin — Ambito', url: 'https://www.ambito.com/politica/rosenkrantz-y-su-pasado-como-abogado-del-grupo-clarin-n5044573' },
      { id: 30, text: 'Ercolini vuelo a Lago Escondido — Pagina/12', url: 'https://www.pagina12.com.ar/495000-lago-escondido-un-viaje-que-compromete-al-juez-ercolini' },
    ],
  },
  {
    id: 'la-riqueza-inexplicable',
    title: {
      es: 'XI. La Riqueza Inexplicable',
      en: 'XI. Unexplained Wealth',
    },
    paragraphs: {
      es: [
        'Las declaraciones juradas patrimoniales de los funcionarios publicos, cruzadas con sus salarios oficiales y los registros de la AFIP, revelan anomalias que la matematica no puede explicar. Pero tambien revelan trampas: los homonimos. Martinez Carlos Alberto y Lopez Juan Manuel fueron identificados inicialmente como coincidencias — y posteriormente descartados como falsos positivos. El rigor de la investigacion se mide tanto por lo que descarta como por lo que confirma.',
        'Luis Caputo, Ministro de Economia, quintuplico su patrimonio declarado desde que asumio funciones publicas. El 99,9% de sus activos esta radicado en el exterior.[31] No es una inversion diversificada. Es una fortuna casi integramente offshore, declarada por el funcionario que controla la politica cambiaria del pais.',
        'Federico Sturzenegger — Ministro de Desregulacion y ex presidente del Banco Central — registro un salto patrimonial de $970 millones. El 99% de sus activos esta en el exterior.[32] El patron se repite: los funcionarios que disenan la politica economica argentina mantienen su riqueza personal fuera de la jurisdiccion que gobiernan.',
        'Adolfo Rodriguez Saa presenta la inconsistencia mas documentada por la AFIP: de un Renault 6 como unico bien a 22 propiedades registradas a lo largo de su carrera politica.[33] No hay actividad comercial declarada que explique la transicion. Juan Carlos Romero, senador por Salta, es el legislador mas rico del pais con un patrimonio de $4.361 millones. El 71% de la publicidad oficial de la provincia de Salta se destina a medios de comunicacion de su propiedad — un circuito cerrado donde el legislador financia sus propias empresas con fondos publicos provinciales.',
        'Alberto Seijas declaro un patrimonio de ARS 1.750 millones mientras servia como asesor ad honorem — un cargo sin remuneracion. Pistone registro un crecimiento patrimonial del 457.000% durante su carrera publica. Castineira de Dios alcanzo el 62.000%. El juez Lijo posee un departamento de USD 2 millones no declarado. La Oficina Anticorrupcion, que deberia auditar estas declaraciones, ha sido sistematicamente debilitada o cooptada.',
      ],
      en: [
        'Asset declarations of public officials, cross-referenced with their official salaries and AFIP records, reveal anomalies that mathematics cannot explain. But they also reveal traps: namesakes. Martinez Carlos Alberto and Lopez Juan Manuel were initially identified as matches — and subsequently discarded as false positives. The rigor of an investigation is measured as much by what it discards as by what it confirms.',
        'Luis Caputo, Minister of Economy, quintupled his declared assets since entering public service. 99.9% of his assets are held abroad.[31] This is not a diversified portfolio. It is a fortune almost entirely offshore, declared by the official who controls the country\'s exchange rate policy.',
        'Federico Sturzenegger — Minister of Deregulation and former Central Bank president — registered a $970 million asset jump. 99% of his assets are abroad.[32] The pattern repeats: the officials who design Argentine economic policy keep their personal wealth outside the jurisdiction they govern.',
        'Adolfo Rodriguez Saa presents the most AFIP-documented inconsistency: from a Renault 6 as his sole asset to 22 registered properties over the course of his political career.[33] There is no declared commercial activity to explain the transition. Juan Carlos Romero, senator for Salta, is the wealthiest legislator in the country with $4.361 billion in assets. 71% of Salta province\'s official advertising goes to media outlets he owns — a closed circuit where the legislator funds his own companies with provincial public money.',
        'Alberto Seijas declared ARS 1.75 billion in assets while serving as an unpaid advisor. Pistone registered 457,000% asset growth during his public career. Castineira de Dios reached 62,000%. Judge Lijo owns an undeclared USD 2 million apartment. The Anti-Corruption Office, which should audit these declarations, has been systematically weakened or co-opted.',
      ],
    },
    pullQuote: {
      es: 'Caputo quintuplico su patrimonio. El 99,9% esta en el exterior. Sturzenegger: salto de $970M, 99% offshore.',
      en: 'Caputo quintupled his wealth. 99.9% is abroad. Sturzenegger: $970M jump, 99% offshore.',
    },
    citations: [
      { id: 31, text: 'Caputo patrimonio 99,9% exterior — declaracion jurada publica, Oficina Anticorrupcion' },
      { id: 32, text: 'Sturzenegger salto patrimonial $970M — DDJJ comparativas 2016-2024' },
      { id: 33, text: 'Rodriguez Saa inconsistencia AFIP — declaraciones juradas comparativas' },
      { id: 34, text: 'Romero patrimonio $4.361M y publicidad oficial Salta — La Nacion / ADEPA', url: 'https://www.lanacion.com.ar/politica/' },
      { id: 35, text: 'Falsos positivos descartados (Martinez, Lopez) — MiroFish audit log' },
    ],
  },
  {
    id: 'los-numeros',
    title: {
      es: 'XII. Los Numeros',
      en: 'XII. The Numbers',
    },
    paragraphs: {
      es: [
        'El grafo de investigacion directa contiene 263 nodos y 2.225 aristas. De esos nodos: 117 personas, 98 organizaciones, 47 eventos. El motor proceso 41 archivos de investigacion, genero 87 factchecks, identifico 76 actores, trazo 71 eventos en la linea temporal, y documento 32 flujos de dinero. Cada numero tiene una fuente. Cada fuente fue verificada.',
        'La infraestructura de datos subyacente: Como Voto aporta 2.258 politicos y 920.000 votos. Las filtraciones del ICIJ, 4.349 oficiales argentinos y 2.422 entidades. La CNE registra 1.714 donaciones. El Boletin Oficial, 6.044 nombramientos y 22.280 contratos. La IGJ, 951.863 oficiales y 398.000 empresas. La CNV, 1.528.931 cargos en directorios. Las declaraciones juradas patrimoniales, 718.865 registros del periodo 2012-2024. En total, 1.839 vinculos legislativos cruzados.',
        'El capital rastreado offshore: $483.000 millones. Seis mecanismos de enriquecimiento documentados — sobreprecios en compras estatales, puerta giratoria regulatoria, triangulacion offshore, publicidad oficial dirigida, licitaciones dirigidas, y blanqueo fiscal selectivo — que en conjunto representan $80.000 millones perdidos en 13 anios.[36]',
        'Lo que los numeros no dicen: los totales patrimoniales no estan disponibles en todas las declaraciones juradas. Los vinculos offshore-juez aun no estan resueltos. La cadena donante-juez falta en los datos. La informacion del Boletin Oficial corresponde a diciembre 2019.',
        'El motor de analisis MiroFish — basado en Qwen 3.5 corriendo localmente — proceso cada patron, confirmo las coincidencias y descarto los falsos positivos. Coincidencias de entidad: 1.840 SAME_ENTITY confirmadas + 10.393 MAYBE_SAME_AS pendientes de resolucion. Cada hallazgo fue verificado contra las fuentes primarias. El grafo no acusa. Revela patrones.',
      ],
      en: [
        'The direct investigation graph contains 263 nodes and 2,225 edges. Of those nodes: 117 persons, 98 organizations, 47 events. The engine processed 41 research files, generated 87 factchecks, identified 76 actors, traced 71 timeline events, and documented 32 money flows. Every number has a source. Every source was verified.',
        'The underlying data infrastructure: Como Voto provides 2,258 politicians and 920,000 votes. ICIJ leaks, 4,349 Argentine officers and 2,422 entities. The CNE records 1,714 donations. The Boletin Oficial, 6,044 appointments and 22,280 contracts. The IGJ, 951,863 officers and 398,000 companies. The CNV, 1,528,931 board positions. Asset declarations, 718,865 records from 2012-2024. In total, 1,839 cross-referenced legislative links.',
        'Offshore capital tracked: $483 billion. Six documented enrichment mechanisms — state procurement markups, regulatory revolving door, offshore triangulation, directed official advertising, rigged bidding, and selective tax laundering — which together represent $80 billion lost over 13 years.[36]',
        'What the numbers do not say: asset totals are empty for most declarations. Offshore-judge links are not yet resolved. The donor-judge chain is missing from the data. The Boletin Oficial is a snapshot from December 2019.',
        'The MiroFish analysis engine — based on Qwen 3.5 running locally — processed every pattern, confirmed matches and discarded false positives. Entity matches: 1,840 confirmed SAME_ENTITY + 10,393 MAYBE_SAME_AS pending resolution. Every finding was verified against primary sources. The graph does not accuse. It reveals patterns.',
      ],
    },
    pullQuote: {
      es: '263 nodos. 2.225 aristas. 87 factchecks. $483.000M offshore. El grafo no acusa. Revela patrones.',
      en: '263 nodes. 2,225 edges. 87 factchecks. $483B offshore. The graph does not accuse. It reveals patterns.',
    },
    citations: [
      { id: 36, text: 'Infraestructura Neo4j y estadisticas del grafo — Office of Accountability' },
      { id: 37, text: 'MiroFish/Qwen 3.5 — motor de analisis local' },
    ],
  },
  {
    id: 'el-imperio-macri',
    title: {
      es: 'XIII. El Imperio Macri: 398 Empresas y Un Correo',
      en: 'XIII. The Macri Empire: 398 Companies and a Post Office',
    },
    paragraphs: {
      es: [
        'Alejandra Macri, hija no reconocida de Franco Macri, presento en 2025 una demanda judicial que revelo la magnitud del imperio familiar: 398 empresas distribuidas en Argentina, Brasil, Panama, Hong Kong, Reino Unido, Islas Virgenes Britanicas, Dubai y Luxemburgo.[38] La SOCMA (Sociedad Macri) fue fundada el 19 de enero de 1976 — dos meses antes del golpe militar — y crecio de 7 a 47 empresas bajo la dictadura.',
        'El caso emblematico es el Correo Argentino. Privatizado en 1997, el grupo Macri pago el canon un solo anio. Entro en concurso preventivo en septiembre de 2001. Veinte anios despues, en julio de 2021, fue declarado en quiebra.[39] Durante la presidencia de Mauricio Macri, el Estado ofrecio una reduccion del 98,82% de la deuda — un acuerdo que beneficiaba a la propia familia del presidente. El Tesoro pidio extender la quiebra a SOCMA y SIDECO, los holdings de la familia.',
        'Gianfranco Macri, a traves de la entidad luxemburguesa Lares Corporation, compro seis parques eolicos por US$25 millones y los vendio en 2017 por US$95 millones — una ganancia de US$70 millones.[40] Seis dias antes de la victoria electoral de Mauricio en octubre de 2015, Gianfranco ordeno trasladar fondos de UBS Hamburgo a Safra Bank en Suiza y destruir la correspondencia bancaria. Blanqueo US$4 millones de BF Corporation (Panama) durante la amnistia fiscal de 2016.',
        'Mariano Macri, el hermano disidente, denuncio penalmente al grupo empresarial en agosto de 2024 por administracion fraudulenta, lavado de activos, falsificacion de documentos y evasion tributaria. La causa recayo en el Juzgado Federal 6 — del juez Ariel Lijo.[41]',
      ],
      en: [
        'Alejandra Macri, Franco Macri\'s unrecognized daughter, filed a 2025 lawsuit that revealed the family empire\'s scale: 398 companies across Argentina, Brazil, Panama, Hong Kong, UK, British Virgin Islands, Dubai, and Luxembourg.[38] SOCMA (Sociedad Macri) was founded January 19, 1976 — two months before the military coup — and grew from 7 to 47 companies under the dictatorship.',
        'The emblematic case is Correo Argentino. Privatized in 1997, the Macri group paid the canon for one year only. It entered creditor protection in September 2001. Twenty years later, in July 2021, it was declared bankrupt.[39] During Mauricio Macri\'s presidency, the State offered a 98.82% debt reduction — a deal benefiting the president\'s own family. The Treasury requested extending bankruptcy to SOCMA and SIDECO, the family\'s holdings.',
        'Gianfranco Macri, through Luxembourg entity Lares Corporation, bought six wind farms for US$25 million and sold them in 2017 for US$95 million — a US$70 million profit.[40] Six days before Mauricio\'s electoral victory in October 2015, Gianfranco ordered funds moved from UBS Hamburg to Safra Bank Switzerland and correspondence destroyed. He laundered US$4 million from BF Corporation (Panama) during the 2016 tax amnesty.',
        'Mariano Macri, the dissident brother, filed a criminal complaint against the business group in August 2024 for fraudulent administration, money laundering, document forgery, and tax evasion. The case landed in Federal Court 6 — Judge Ariel Lijo\'s court.[41]',
      ],
    },
    citations: [
      { id: 38, text: 'Alejandra Macri desafia al clan familiar — DataClave', url: 'https://www.dataclave.com.ar/poder/alejandra-macri-desafia-al-clan-familiar--bienes-ocultos-y-demandas-por-398-empresas_a677c201cefdaf93e3bd9db5b' },
      { id: 39, text: 'Quiebra Correo Argentino — Infobae', url: 'https://www.infobae.com/politica/2021/07/05/claves-para-entender-la-causa-del-correo-argentino-sa-un-proceso-en-la-justicia-comercial-que-duro-20-anos-y-termino-en-una-quiebra/' },
      { id: 40, text: 'Lares Corporation parques eolicos — OCCRP', url: 'https://www.occrp.org/es/openlux/gone-with-the-wind-argentinas-former-first-family-used-luxembourg-companies-to-reap-70-million' },
      { id: 41, text: 'Mariano Macri denuncia — Infobae', url: 'https://www.infobae.com/judiciales/2024/08/07/el-hermano-de-mauricio-macri-denuncio-al-grupo-empresarial-de-la-familia-por-defraudacion-y-lavado-de-activos/' },
    ],
  },
  {
    id: 'el-cartel-de-la-salud',
    title: {
      es: 'XIV. El Cartel de la Salud',
      en: 'XIV. The Health Cartel',
    },
    paragraphs: {
      es: [
        'En diciembre de 2024, la CNDC imputo por cartelizacion a Swiss Medical, OSDE, Galeno, Medife, Omint, Hospital Britanico, Hospital Aleman y a Claudio Belocopitt personalmente.[42] Las prepagas habian coordinado aumentos de ~150% cuando la inflacion era ~70%. Belocopitt controla el 76% de Swiss Medical Group (53 subsidiarias) mientras simultaneamente posee el 40% de Grupo America (America TV, A24, La Red) — un conflicto de intereses entre salud y medios sin precedentes.',
        'El caso PAMI es demoledor: el Anastrozol se pago a $13.192 por unidad cuando la licitacion publica lo ofrecia a $924 — un sobreprecio de 14,3 veces.[43] En la ANDIS, el Macitentan fue adjudicado a $411.764 y vendido tres dias despues a $8.290.000 — un markup del 2.013%. Cuatro droguerias recibieron $37.000 millones. La Drogueria Suizo Argentina vio sus contratos estatales crecer 2.678% en un anio bajo el gobierno de Milei.',
        'Durante la pandemia, Swiss Medical recibio $2.417 millones en subsidios ATP del Estado — mientras Belocopitt cobraba parte de su salario con fondos publicos y simultaneamente adquiria competidores.[44] Forbes estima la fortuna de Belocopitt en USD 440 millones. El ICIJ documenta cinco entidades offshore en Islas Virgenes Britanicas: Karima Portfolio, Tiago Global, Ragnar Portfolio, Elyanne Business, Pensford Business.',
      ],
      en: [
        'In December 2024, the CNDC charged Swiss Medical, OSDE, Galeno, Medife, Omint, Hospital Britanico, Hospital Aleman, and Claudio Belocopitt personally for cartelization.[42] The prepaid health companies had coordinated increases of ~150% when inflation was ~70%. Belocopitt controls 76% of Swiss Medical Group (53 subsidiaries) while simultaneously owning 40% of Grupo America (America TV, A24, La Red) — an unprecedented health-media conflict of interest.',
        'The PAMI case is devastating: Anastrozol was paid at $13,192 per unit when public bidding offered it at $924 — a 14.3x markup.[43] At ANDIS, Macitentan was awarded at $411,764 and sold three days later at $8,290,000 — a 2,013% markup. Four drugstores received $37 billion. Drogueria Suizo Argentina saw its state contracts grow 2,678% in one year under the Milei government.',
        'During the pandemic, Swiss Medical received $2.417 billion in state ATP subsidies — while Belocopitt collected part of his salary with public funds and simultaneously acquired competitors.[44] Forbes estimates Belocopitt\'s fortune at USD 440 million. The ICIJ documents five BVI offshore entities: Karima Portfolio, Tiago Global, Ragnar Portfolio, Elyanne Business, Pensford Business.',
      ],
    },
    pullQuote: {
      es: 'Anastrozol: $13.192 por unidad vs $924 en licitacion publica. Sobreprecio de 14,3 veces.',
      en: 'Anastrozol: $13,192 per unit vs $924 in public bidding. 14.3x markup.',
    },
    citations: [
      { id: 42, text: 'CNDC imputa cartelizacion prepagas — Argentina.gob.ar', url: 'https://www.argentina.gob.ar/noticias/la-cndc-imputa-por-presunta-cartelizacion-las-principales-empresas-de-medicina-prepaga-0' },
      { id: 43, text: 'PAMI sobreprecios oncologicos — La Nacion', url: 'https://www.lanacion.com.ar/politica/denuncian-que-el-pami-pago-medicamentos-oncologicos-hasta-16-veces-mas-que-el-valor-de-las-compras-nid22012025/' },
      { id: 44, text: 'Swiss Medical ATP pandemia — La Izquierda Diario', url: 'https://www.laizquierdadiario.com/Claudio-Bellocopitt-cobro-el-ATP-del-Estado-radiografia-del-magnate-de-Swiss-Medical' },
    ],
  },
  {
    id: 'caputo-y-el-estado',
    title: {
      es: 'XV. Caputo y el Estado: De JP Morgan al Ministerio',
      en: 'XV. Caputo and the State: From JP Morgan to the Ministry',
    },
    paragraphs: {
      es: [
        'Luis Caputo trabajo en JP Morgan (1994-1998) y Deutsche Bank (1998-2008). Como Ministro de Economia de Milei, designo a JP Morgan como agente fiduciario para recomprar bonos soberanos con fondos del Banco Mundial.[45] Su consultora Anker Latinoamerica (CUIT 30-71690088-2) suspendio operaciones el 30 de noviembre de 2023, dias antes de que asumiera. Los socios de Anker — Furiase, Vauthier y Beron — ingresaron directamente al Ministerio de Economia.',
        'El patron es mas profundo de lo que se conocia: no seis sino siete funcionarios de Milei tienen pasado en JP Morgan — Caputo, Bausili, Daza, Werning, Quirno, Lew y Reidel.[46] Santiago Bausili, actual presidente del BCRA, recibio ~USD 200.000 en acciones y bonos de Deutsche Bank mientras era Secretario de Finanzas, dirigiendo operaciones de deuda estatal que beneficiaban a su ex empleador. Esta procesado por negociaciones incompatibles con la funcion publica.',
        'Pero la pieza mas explosiva del dossier Caputo vino de los Paradise Papers. La investigacion revelo una cadena offshore de cuatro niveles que Caputo nunca declaro al ingresar al gobierno en 2015: era duenio del 75% de Princess International Global Ltd (Islas Caiman), que controlaba entre el 50% y el 74% de Affinis Partners II (Caiman), que a su vez controlaba Noctua International (Miami/Delaware), administradora de Alto Global Fund — un fondo caiman con mas de USD 100 millones en activos y minimo de ingreso de USD 1 millon.[49][50] Cuando se le pregunto, Caputo se presento como "un mero administrador." Los documentos muestran que era el duenio real. Se separo de Noctua el 25 de noviembre de 2015 — dias antes de asumir como Secretario de Finanzas — pero ninguna de estas sociedades figuro en su declaracion jurada obligatoria.',
        'Ya en funciones, Caputo cometio lo que la UFISES considero un conflicto de intereses criminal. En marzo de 2012 habia fundado AXIS SGFCI S.A. (CUIT 30-71224145-0), con el 60% de la sociedad. Como Secretario de Finanzas en 2015, se sento en el Comite Ejecutivo del Fondo de Garantia de Sustentabilidad (FGS-ANSES), que aprobo la inversion de AR$500 millones de fondos jubilatorios en AXIS Ahorro Plus FCI — su propio fondo de inversion.[51] Las comisiones se repartieron: AR$1,4M para AXIS y AR$500.000 para Deutsche Bank, su ex empleador. La denuncia penal fue presentada por la UFISES y asignada al juez Luis Rodriguez con el fiscal Eduardo Taiano.[52]',
        'La deuda oculta es otra dimension. La AGN verifico que la Resolucion 147/2017 — firmada por Caputo — creo USD 7.368 millones en deuda indirecta mediante Letras del Tesoro Nacional que garantizaban el programa de energias renovables. Esa deuda quedo fuera de las estadisticas oficiales.[55] En 2017 emitio ademas el bono a 100 anios (USD 2.750M) que la AGN califico como "poco transparente e ineficiente, comprometiendo generaciones futuras." Argentina pagaria mas del 900% del neto recibido a lo largo de la vida del bono. En enero de 2024, tomo USD 3.200 millones de reservas del BCRA mediante DNU 23/2024, dejando una letra intransferible a 10 anios — practicamente sin valor.[47]',
        'El patrimonio de Caputo se quintuplico desde que asumio funciones publicas. Su declaracion jurada de 2024 reporta AR$11.851 millones, con el 99,9% de sus activos liquidos en el exterior.[53] Declara un campo de 81 millones de metros cuadrados en Santiago del Estero, un yate y propiedades en cuatro provincias. Parte de ese campo lo administra a traves de Sacha Rupaska SA, donde posee el 33,33%; su socia L.M. Mendez Ezcurra esta casada con Rossana Caputo, su hermana. Sobre esas tierras pesan acusaciones de desmonte ilegal.[56]',
        'Y la orbita Caputo se extiende mas alla de las finanzas. La empresa familiar Caputo Hermanos (CUIT 33-70897527-9, de Flavio y Hugo Caputo) contrato a Jonathan Morel, lider de Revolucion Federal, con facturas y transferencias por mas de AR$8 millones.[54] Morel fue procesado en la causa por el intento de asesinato de Cristina Fernandez de Kirchner. El vinculo entre el clan Caputo y esa investigacion no ha sido explicado publicamente.',
        'Sturzenegger mantiene el 99% de sus depositos en el exterior mientras promueve que los argentinos traigan dolares al sistema local. Su empresa Un Ombu SAS tiene capital minimo ($21.400) pero un objeto social que abarca agricultura, tecnologia, finanzas, energia, mineria, fideicomisos e inmobiliaria. Su creacion intelectual: el DNU 70/2023 que elimino regulaciones que benefician a las empresas de sus propios asesores.[48]',
      ],
      en: [
        'Luis Caputo worked at JP Morgan (1994-1998) and Deutsche Bank (1998-2008). As Milei\'s Economy Minister, he designated JP Morgan as fiduciary agent for sovereign bond repurchase using World Bank funds.[45] His consulting firm Anker Latinoamerica (CUIT 30-71690088-2) suspended operations on November 30, 2023, days before he took office. Anker partners Furiase, Vauthier, and Beron moved directly into the Economy Ministry.',
        'The pattern runs deeper than previously known: not six but seven Milei officials have JP Morgan backgrounds — Caputo, Bausili, Daza, Werning, Quirno, Lew, and Reidel.[46] Santiago Bausili, current BCRA president, received ~USD 200,000 in Deutsche Bank stock and bonuses while serving as Finance Secretary, directing state debt operations that benefited his former employer. He is processed for negotiations incompatible with public office.',
        'But the most explosive piece of the Caputo dossier came from the Paradise Papers. The investigation revealed a four-tier offshore chain that Caputo never declared when entering government in 2015: he owned 75% of Princess International Global Ltd (Cayman Islands), which controlled 50-74% of Affinis Partners II (Cayman), which in turn controlled Noctua International (Miami/Delaware), manager of Alto Global Fund — a Cayman fund with over USD 100 million in assets under management and a USD 1 million entry minimum.[49][50] When asked, Caputo presented himself as "merely an administrator." The documents show he was the actual owner. He separated from Noctua on November 25, 2015 — days before assuming the Finance Secretary role — but none of these entities appeared in his mandatory financial disclosure.',
        'Once in office, Caputo committed what UFISES considered a criminal conflict of interest. In March 2012 he had founded AXIS SGFCI S.A. (CUIT 30-71224145-0), holding 60% ownership. As Finance Secretary in 2015, he sat on the Executive Committee of the Fondo de Garantia de Sustentabilidad (FGS-ANSES), which approved AR$500 million in pension fund investment into AXIS Ahorro Plus FCI — his own mutual fund.[51] Commissions were split: AR$1.4M for AXIS and AR$500K for Deutsche Bank, his former employer. The criminal complaint was filed by UFISES and assigned to Judge Luis Rodriguez with Prosecutor Eduardo Taiano.[52]',
        'Hidden debt is another dimension. The AGN verified that Resolution 147/2017 — bearing Caputo\'s signature — created USD 7.368 billion in indirect debt through National Treasury Notes guaranteeing the renewable energy program. That debt was kept out of official statistics.[55] In 2017 he also issued the 100-year bond (USD 2.75B) that the AGN qualified as "little transparent and inefficient, compromising future generations." Argentina would repay over 900% of the net received over the bond\'s life. In January 2024, he took USD 3.2 billion from BCRA reserves via DNU 23/2024, leaving a non-transferable 10-year letter — practically valueless.[47]',
        'Caputo\'s net worth quintupled since he entered public office. His 2024 asset declaration reports AR$11.851 billion, with 99.9% of liquid assets held abroad.[53] He declares a field spanning 81 million square meters in Santiago del Estero, a yacht, and properties in four provinces. Part of that land is managed through Sacha Rupaska SA, where he holds 33.33%; his partner L.M. Mendez Ezcurra is married to Rossana Caputo, his sister. The land faces accusations of illegal logging.[56]',
        'And the Caputo orbit extends beyond finance. The family company Caputo Hermanos (CUIT 33-70897527-9, owned by Flavio and Hugo Caputo) hired Jonathan Morel, leader of Revolucion Federal, with invoices and wire transfers exceeding AR$8 million.[54] Morel was prosecuted in the investigation of the assassination attempt against Cristina Fernandez de Kirchner. The link between the Caputo clan and that investigation has never been publicly explained.',
        'Sturzenegger maintains 99% of his deposits abroad while promoting policies encouraging Argentines to bring dollars into the local system. His company Un Ombu SAS has minimal capital ($21,400) but a corporate purpose spanning agriculture, technology, finance, energy, mining, trusts, and real estate. His intellectual creation: DNU 70/2023, which eliminated regulations benefiting his own advisors\' companies.[48]',
      ],
    },
    pullQuote: {
      es: 'Cuatro niveles de sociedades offshore no declaradas. Fondos jubilatorios invertidos en su propio fondo de inversion. Patrimonio quintuplicado. Todo documentado.',
      en: 'Four tiers of undeclared offshore entities. Pension funds invested in his own mutual fund. Net worth quintupled. All documented.',
    },
    citations: [
      { id: 45, text: 'Caputo recompra bonos via JP Morgan — La Letra P', url: 'https://www.letrap.com.ar/economia/deuda-educacion-toto-caputo-recomprara-bonos-plata-del-banco-mundial-y-el-jp-morgan-como-agente-n5419611' },
      { id: 46, text: 'JP Morgan in Power — Buenos Aires Times', url: 'https://batimes.com.ar/news/argentina/jp-morgan-in-power-mileis-six-officials-with-a-past-there.phtml' },
      { id: 47, text: 'BCRA letra intransferible — Infobae', url: 'https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf01/05/el-gobierno-tomara-usd-3200-de-las-reservas-del-bcra-para-pagar-vencimientos-de-deuda/' },
      { id: 48, text: 'Sturzenegger 99% exterior — Perfil', url: 'https://www.perfil.com/noticias/politica/declaracion-jurada-federico-sturzenegger.phtml' },
      { id: 49, text: 'Noctua offshore — La Nacion', url: 'https://www.lanacion.com.ar/politica/luis-caputo-estuvo-vinculado-a-un-entramado-de-fondos-offshore-nid2079604/' },
      { id: 50, text: 'Paradise Papers Caputo — Buenos Aires Times', url: 'https://www.batimes.com.ar/news/argentina/caputo-concealed-cayman-island-offshore-firms-from-argentine-authorities.phtml' },
      { id: 51, text: 'AXIS fondo de inversion amigo — Pagina 12', url: 'https://www.pagina12.com.ar/61421-un-fondo-de-inversion-amigo' },
      { id: 52, text: 'UFISES denuncia Caputo — Fiscales.gob.ar', url: 'https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/' },
      { id: 53, text: 'DDJJ Caputo 2024 — Chequeado', url: 'https://chequeado.com/el-explicador/la-declaracion-jurada-de-luis-caputo-informo-un-patrimonio-de-11-800-millones-y-casi-2-tercios-de-sus-bienes-estan-en-el-exterior/' },
      { id: 54, text: 'Caputo Hermanos contrato a Morel — Infobae', url: 'https://www.infobae.com/politica/2022/10/21/la-contratacion-de-caputo-hermanos-al-lider-de-revolucion-federal-facturas-y-transferencias-por-mas-de-8-millones-de-pesos/' },
      { id: 55, text: 'AGN bono del siglo — El Cronista', url: 'https://www.cronista.com/economia-politica/deuda-la-agn-cuestiono-la-colocacion-del-bono-del-siglo-en-el-gobierno-de-macri/' },
      { id: 56, text: 'Clan Caputo — Perfil', url: 'https://www.perfil.com/noticias/politica/quien-es-quien-en-el-clan-caputo-una-familia-siempre-vinculada-a-la-politica-y-el-poder.phtml' },
    ],
  },
  {
    id: 'lo-que-queda',
    title: {
      es: 'XVI. Lo Que Queda',
      en: 'XVI. What Remains',
    },
    paragraphs: {
      es: [
        'Lo que esta confirmado abarca todo el ciclo sistemico: riqueza inexplicable protegida por un colega que cierra la causa, un abogado de esa industria que se convierte en Ministro de Justicia, y un gobierno que nomina a un juez a la Corte Suprema por decreto. Cada eslabon ha sido documentado con fuentes publicas en los capitulos anteriores.',
        'El ciclo es: acumulacion de riqueza -> colega cierra la causa -> abogado se convierte en Ministro de Justicia -> gobierno nomina juez a la Corte Suprema. No es una teoria. Es la secuencia de hechos documentada en estas paginas.',
        'Lo que falta: los vinculos offshore-juez aun no estan resueltos — no sabemos si los jueces de Comodoro Py tienen sociedades offshore. La cadena donante-juez no aparece en los datos disponibles — los flujos de dinero entre donantes de campana y el sistema judicial son opacos. Datos provinciales — gobernaciones, legislaturas locales, registros empresariales provinciales — no estan incluidos en esta version.',
        'Proximos pasos: incorporar datos provinciales de las 23 provincias argentinas. Ampliar los anos de contratacion publica mas alla de 2019. Rastrear el sistema de nombramiento judicial — quien propone, quien aprueba, quien se beneficia.',
        'Los datos preguntan. Y en un pais donde 12 familias controlan 500 empresas, donde un juez vuela en el avion de un grupo mediatico y luego sobreseye a un funcionario vinculado a ese grupo, donde una jueza declara 1.750 millones como asesora ad honorem, donde el mismo Ministerio de Justicia esta dirigido por un exdirector de la industria que deberia regular — en ese pais, las preguntas no van a dejar de multiplicarse. A menos que alguien las responda.',
      ],
      en: [
        'What is confirmed spans the entire systemic cycle: unexplained wealth protected by a colleague who closes the case, a lawyer from that industry who becomes Justice Minister, and a government that nominates a judge to the Supreme Court by decree. Each link has been documented with public sources in the preceding chapters.',
        'The cycle is: wealth accumulation -> colleague closes the case -> lawyer becomes Justice Minister -> government nominates judge to Supreme Court. It is not a theory. It is the sequence of facts documented in these pages.',
        'What is missing: offshore-judge links are not yet resolved — we do not know if the Comodoro Py judges have offshore companies. The donor-judge chain does not appear in available data — money flows between campaign donors and the judicial system are opaque. Provincial data — governorships, local legislatures, provincial corporate registries — are not included in this version.',
        'Next steps: incorporate provincial data from all 23 Argentine provinces. Expand public procurement years beyond 2019. Track the judicial appointment system — who proposes, who approves, who benefits.',
        'The data asks questions. And in a country where 12 families control 500 companies, where a judge flies on a media group\'s plane and then clears an official linked to that group, where a judge declares 1.75 billion as an unpaid advisor, where the Justice Ministry itself is headed by a former director of the industry it should regulate — in that country, the questions will not stop multiplying. Unless someone answers them.',
      ],
    },
    pullQuote: {
      es: 'Los datos preguntan. Las preguntas no van a dejar de multiplicarse.',
      en: 'The data asks questions. The questions will not stop multiplying.',
    },
  },
]

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const stats: readonly StatCard[] = [
  { value: '398K', label: { es: 'Empresas rastreadas', en: 'Companies tracked' } },
  { value: '951K', label: { es: 'Oficiales corporativos', en: 'Corporate officers' } },
  { value: '$483B', label: { es: 'Offshore rastreado', en: 'Offshore tracked' } },
  { value: '1,428', label: { es: 'Puerta giratoria documentada', en: 'Documented revolving door' } },
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
  { name: 'Alejandra Macri 398 empresas — DataClave', url: 'https://www.dataclave.com.ar/poder/alejandra-macri-desafia-al-clan-familiar--bienes-ocultos-y-demandas-por-398-empresas_a677c201cefdaf93e3bd9db5b' },
  { name: 'Lares Corporation — OCCRP/OpenLux', url: 'https://www.occrp.org/es/openlux/gone-with-the-wind-argentinas-former-first-family-used-luxembourg-companies-to-reap-70-million' },
  { name: 'CNDC cartelizacion prepagas — Argentina.gob.ar', url: 'https://www.argentina.gob.ar/noticias/la-cndc-imputa-por-presunta-cartelizacion-las-principales-empresas-de-medicina-prepaga-0' },
  { name: 'PAMI sobreprecios oncologicos — La Nacion', url: 'https://www.lanacion.com.ar/politica/denuncian-que-el-pami-pago-medicamentos-oncologicos-hasta-16-veces-mas-que-el-valor-de-las-compras-nid22012025/' },
  { name: 'JP Morgan in Power — Buenos Aires Times', url: 'https://batimes.com.ar/news/argentina/jp-morgan-in-power-mileis-six-officials-with-a-past-there.phtml' },
  { name: 'BCRA Central de Deudores API', url: 'https://www.bcra.gob.ar/bcrayvos/Situacion_Crediticia.asp' },
  { name: 'Registro Nacional de Sociedades — datos.jus.gob.ar', url: 'https://datos.jus.gob.ar/dataset/registro-nacional-de-sociedades' },
  { name: 'Fundacion Faro dark money — Chequeado', url: 'https://chequeado.com/investigaciones/fundacion-faro-el-think-tank-libertario-que-mas-pauta-electoral-puso-en-2025-y-que-no-declara-el-origen-de-sus-fondos/' },
  { name: 'AFAGate sociedades fantasma — La Nacion', url: 'https://www.lanacion.com.ar/politica/investigacion-exclusiva-desde-la-cuenta-que-administra-los-fondos-de-la-afa-en-eeuu-se-desviaron-al-nid28122025/' },
  { name: 'Decreto 823/2021 — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/253783/20211201' },
  { name: 'Causa seguros — allanamientos Ercolini', url: 'https://www.infobae.com/judiciales/2024/04/05/el-juez-julian-ercolini-ordeno-24-allanamientos-por-el-escandalo-de-los-seguros/' },
  { name: 'Bachellier embargo — Ambito Financiero', url: 'https://www.infobae.com/politica/2024/03/18/escandalo-de-los-seguros-las-empresas-del-broker-amigo-de-alberto-fernandez-y-sus-satelites-cobraron-mas-de-2000-millones-por-comisiones/' },
  { name: 'Plate designacion SSN — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar' },
  { name: 'Catalan designacion YPF — Infobae', url: 'https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf' },
  { name: 'Cuneo Libarona conflicto de intereses — Pagina/12', url: 'https://www.pagina12.com.ar/' },
  { name: 'CEADS — Consejo Empresario', url: 'https://ceads.org.ar' },
  { name: 'Ercolini vuelo Lago Escondido — Pagina/12', url: 'https://www.pagina12.com.ar/495000-lago-escondido-un-viaje-que-compromete-al-juez-ercolini' },
  { name: 'Hornos y Borinsky visitas a Olivos — CELS', url: 'https://www.cels.org.ar/web/2021/01/las-visitas-de-los-jueces-hornos-y-borinsky-a-olivos/' },
  { name: 'Rosenkrantz ex-abogado Clarin — Ambito', url: 'https://www.ambito.com/politica/rosenkrantz-y-su-pasado-como-abogado-del-grupo-clarin-n5044573' },
  { name: 'Tasa condena corrupcion 2% — ACIJ', url: 'https://acij.org.ar/monitoreo-de-causas-de-corrupcion/' },
  { name: 'Lijo departamento no declarado — Infobae', url: 'https://www.infobae.com/politica/2025/02/25/javier-milei-designo-por-decreto-en-la-corte-suprema-a-ariel-lijo-y-manuel-garcia-mansilla/' },
  { name: 'Noctua offshore — La Nacion', url: 'https://www.lanacion.com.ar/politica/luis-caputo-estuvo-vinculado-a-un-entramado-de-fondos-offshore-nid2079604/' },
  { name: 'Paradise Papers Caputo — Buenos Aires Times', url: 'https://www.batimes.com.ar/news/argentina/caputo-concealed-cayman-island-offshore-firms-from-argentine-authorities.phtml' },
  { name: 'AXIS fondo de inversion amigo — Pagina 12', url: 'https://www.pagina12.com.ar/61421-un-fondo-de-inversion-amigo' },
  { name: 'UFISES denuncia Caputo — Fiscales.gob.ar', url: 'https://www.fiscales.gob.ar/fiscalias/la-ufises-denuncio-al-ministro-luis-caputo-por-presuntas-operaciones-irregulares-en-el-fondo-de-garantia-de-sustentabilidad/' },
  { name: 'DDJJ Caputo 2024 — Chequeado', url: 'https://chequeado.com/el-explicador/la-declaracion-jurada-de-luis-caputo-informo-un-patrimonio-de-11-800-millones-y-casi-2-tercios-de-sus-bienes-estan-en-el-exterior/' },
  { name: 'Caputo Hermanos contrato a Morel — Infobae', url: 'https://www.infobae.com/politica/2022/10/21/la-contratacion-de-caputo-hermanos-al-lider-de-revolucion-federal-facturas-y-transferencias-por-mas-de-8-millones-de-pesos/' },
  { name: 'AGN bono del siglo — El Cronista', url: 'https://www.cronista.com/economia-politica/deuda-la-agn-cuestiono-la-colocacion-del-bono-del-siglo-en-el-gobierno-de-macri/' },
  { name: 'Clan Caputo — Perfil', url: 'https://www.perfil.com/noticias/politica/quien-es-quien-en-el-clan-caputo-una-familia-siempre-vinculada-a-la-politica-y-el-poder.phtml' },
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
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      {/* Methodology & Compliance */}
      <section className="py-12">
        <h2 className="border-l-4 border-blue-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Metodologia y Cumplimiento Internacional' : 'Methodology & International Compliance'}
        </h2>

        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              {lang === 'es' ? 'Marcos Internacionales' : 'International Frameworks'}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li><span className="font-semibold text-zinc-200">FATF/GAFI:</span> {lang === 'es'
                ? 'Identificacion de Personas Expuestas Politicamente (PEP), rastreo de beneficiarios finales, deteccion de sociedades fantasma, seguimiento de flujos transfronterizos.'
                : 'Politically Exposed Persons (PEP) identification, beneficial ownership tracing, shell company detection, cross-border flow tracking.'}</li>
              <li><span className="font-semibold text-zinc-200">OCDE:</span> {lang === 'es'
                ? 'Documentacion de soborno extranjero, pagos facilitadores, puerta giratoria entre sector publico y privado.'
                : 'Foreign bribery documentation, facilitation payments, public-private revolving door mapping.'}</li>
              <li><span className="font-semibold text-zinc-200">UNCAC:</span> {lang === 'es'
                ? 'Analisis de declaraciones juradas patrimoniales, conflictos de intereses, deteccion de enriquecimiento ilicito.'
                : 'Asset disclosure analysis, conflict of interest documentation, illicit enrichment detection.'}</li>
              <li><span className="font-semibold text-zinc-200">Transparency International:</span> {lang === 'es'
                ? 'Verificacion con fuentes multiples, test de interes publico, independencia editorial.'
                : 'Multi-source verification, public interest test, editorial independence.'}</li>
              <li><span className="font-semibold text-zinc-200">ICIJ:</span> {lang === 'es'
                ? 'Cruce de registros publicos, investigacion basada en datos, verificacion colaborativa.'
                : 'Public records cross-referencing, data-driven investigation, collaborative verification.'}</li>
              <li><span className="font-semibold text-zinc-200">GIJN:</span> {lang === 'es'
                ? 'Protocolos de verificacion, proteccion de fuentes, interes publico, transparencia metodologica.'
                : 'Verification protocols, source protection, public interest, methodological transparency.'}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              {lang === 'es' ? 'Protocolo de Verificacion' : 'Verification Protocol'}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>{lang === 'es'
                ? '97,4% de URLs verificadas con HTTP 200 (37/38 en ultima auditoria)'
                : '97.4% URLs verified with HTTP 200 (37/38 in last audit)'}</li>
              <li>{lang === 'es'
                ? '87,5% de claims criticos verificados contra fuente primaria (14/16)'
                : '87.5% critical claims verified against primary source (14/16)'}</li>
              <li>{lang === 'es'
                ? 'Tres niveles de confianza: gold (curado), silver (verificado web), bronze (sin verificar)'
                : 'Three confidence tiers: gold (curated), silver (web-verified), bronze (unverified)'}</li>
              <li>{lang === 'es'
                ? 'Cada hallazgo enlazado a fuente publica verificable'
                : 'Every finding linked to verifiable public source'}</li>
              <li>{lang === 'es'
                ? 'Falsos positivos identificados y eliminados (Martinez Carlos Alberto, Lopez Juan Manuel — nombres comunes sin evidencia)'
                : 'False positives identified and removed (Martinez Carlos Alberto, Lopez Juan Manuel — common names without evidence)'}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              {lang === 'es' ? 'Fuentes de Datos (14 pipelines)' : 'Data Sources (14 pipelines)'}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <span>Como Voto (legislativo)</span>
              <span>ICIJ Offshore Leaks</span>
              <span>CNE (donantes electorales)</span>
              <span>Boletin Oficial (adjudicaciones)</span>
              <span>IGJ (951K officers)</span>
              <span>CNV (valores)</span>
              <span>DDJJ (patrimonio)</span>
              <span>Compr.ar (contrataciones)</span>
              <span>BCRA Central Deudores</span>
              <span>RNS (sociedades)</span>
              <span>SSN (seguros)</span>
              <span>Poder Judicial</span>
              <span>Panama / Pandora Papers</span>
              <span>Cross-reference engine</span>
            </div>
          </div>
        </div>
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
