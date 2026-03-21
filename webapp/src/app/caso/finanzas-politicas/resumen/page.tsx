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
      { id: 19, text: 'Causa seguros — allanamientos Ercolini, Infobae', url: 'https://www.infobae.com/politica/2024/04/' },
      { id: 20, text: 'Martinez Sosa procesamiento — Fiscalia Federal, feb 2026' },
      { id: 21, text: 'Bachellier embargo $9.669M — Ambito Financiero', url: 'https://www.ambito.com/politica/seguros-gate/' },
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
        'Guillermo Plate paso de Vicepresidente de Provincia ART a Superintendente de Seguros de la Nacion, regulando el mercado donde fue ejecutivo. No hay periodo de enfriamiento. No hay incompatibilidad efectiva. La puerta gira sin friccion.',
        'Lisandro Catalan dejo el Ministerio del Interior y dos semanas despues fue designado Director de YPF con un salario de $140 millones mensuales. Catorce dias entre el cargo politico y el directorio corporativo de la mayor empresa estatal del pais.',
        'El Ministro de Justicia Cuneo Libarona fue director legal de Libra Seguros antes de asumir. Desde el Ministerio, supervisa la regulacion de la industria donde trabajo — un "doble blindaje" que protege a su antigua empleadora tanto desde la regulacion como desde la justicia.',
        'La dinastia Frigerio ilustra la dimension hereditaria: el padre ocupo un puesto en el directorio de YPF mientras el hijo era Ministro del Interior. Dos generaciones, dos ramas del poder — ejecutivo y corporativo — operando simultaneamente sobre los mismos intereses.',
        'De los 72 casos documentados de puerta giratoria financiera, 48 involucran al sector de seguros, 15 al sector bancario, y 9 al mercado de capitales. El sector de seguros — con su regulacion opaca y sus enormes flujos de primas — es el terreno preferido para esta practica.',
      ],
      en: [
        'Guillermo Plate went from VP of Provincia ART to Superintendent of Insurance, regulating the very market where he was an executive. There is no cooling-off period. There is no effective incompatibility. The door revolves without friction.',
        'Lisandro Catalan left the Ministry of Interior and two weeks later was appointed YPF Director at $140 million pesos/month. Fourteen days between the political office and the corporate board of the country\'s largest state-owned company.',
        'Justice Minister Cuneo Libarona was legal director of Libra Seguros before taking office. From the Ministry, he oversees regulation of the industry where he worked — a "double shielding" that protects his former employer from both regulation and justice.',
        'The Frigerio dynasty illustrates the hereditary dimension: the father held a seat on YPF\'s board while the son was Interior Minister. Two generations, two branches of power — executive and corporate — operating simultaneously over the same interests.',
        'Of the 72 documented financial revolving door cases, 48 involve the insurance sector, 15 the banking sector, and 9 the capital markets. The insurance sector — with its opaque regulation and enormous premium flows — is the preferred terrain for this practice.',
      ],
    },
    pullQuote: {
      es: 'Lisandro Catalan dejo el Ministerio del Interior y fue designado Director de YPF dos semanas despues.',
      en: 'Lisandro Catalan left the Interior Ministry and was appointed YPF Director two weeks later.',
    },
    citations: [
      { id: 22, text: 'Plate designacion SSN — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar' },
      { id: 23, text: 'Catalan designacion YPF — Infobae', url: 'https://www.infobae.com/economia/2024/' },
      { id: 24, text: 'Cuneo Libarona conflicto de intereses — Pagina/12', url: 'https://www.pagina12.com.ar/' },
      { id: 25, text: 'Frigerio padre en YPF — registro CNV' },
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
        'Comodoro Py es el edificio de tribunales federales de Buenos Aires. Doce juzgados, los mismos jueces, todas las causas politicas del pais. Un embudo donde la justicia se concentra en un punado de despachos que deciden el destino de cada investigacion sobre corrupcion. La tasa de condena por corrupcion es del 2%.',
        'El juez Ercolini volo a Lago Escondido en un avion pagado por el Grupo Clarin. Despues, sobreseyo a Frigerio en una causa por enriquecimiento ilicito. Despues, fue asignado a la causa del escandalo de los seguros contra Fernandez. El mismo juez que acepto un vuelo corporativo de un grupo mediatico, libero a un funcionario vinculado a ese grupo, y luego investigo al presidente que estaba en conflicto con ese mismo grupo.',
        'Ariel Lijo lleva decadas en Comodoro Py. Su historial: 89 causas, 14 llegaron a juicio oral. El gobierno lo nomino a la Corte Suprema por decreto, eludiendo el procedimiento constitucional del Senado. La votacion: 43 a favor, 27 en contra. Posee un departamento de USD 2 millones no declarado en sus presentaciones patrimoniales.',
        'Los camaristas Hornos y Borinsky realizaron 15 o mas visitas a la Quinta de Olivos durante el gobierno de Macri — mientras juzgaban causas que involucraban al gobierno. El presidente recibia en su residencia oficial a los jueces que decidian sus causas.',
        'Rosenkrantz — presidente de la Corte Suprema — fue abogado del Grupo Clarin. Desde la Corte, emitio 56 fallos sobre casos que involucraban a sus antiguos clientes. Ninguna recusacion. Ninguna abstencion.',
      ],
      en: [
        'Comodoro Py is the federal courthouse in Buenos Aires. Twelve courts, the same judges, all of the country\'s political cases. A funnel where justice is concentrated in a handful of offices that decide the fate of every corruption investigation. The corruption conviction rate is 2%.',
        'Judge Ercolini flew to Lago Escondido on a plane paid for by the Clarin Group. Afterward, he cleared Frigerio in an illicit enrichment case. Then, he was assigned to the insurance scandal case against Fernandez. The same judge who accepted a corporate flight from a media group, cleared an official linked to that group, and then investigated the president who was in conflict with that same group.',
        'Ariel Lijo has spent decades at Comodoro Py. His record: 89 cases, 14 reached oral trial. The government nominated him to the Supreme Court by decree, bypassing the constitutional Senate procedure. The vote: 43 in favor, 27 against. He owns an undeclared USD 2 million apartment not included in his asset declarations.',
        'Appellate judges Hornos and Borinsky made 15 or more visits to the Olivos presidential residence during the Macri administration — while judging cases involving the government. The president received in his official residence the judges deciding his cases.',
        'Rosenkrantz — Supreme Court president — was a lawyer for the Clarin Group. From the Court, he issued 56 rulings on cases involving his former clients. No recusal. No abstention.',
      ],
    },
    pullQuote: {
      es: 'El mismo juez que sobreseyo a Frigerio y volo en el avion de Clarin fue luego asignado a investigar el escandalo de los seguros.',
      en: 'The same judge who cleared Frigerio and flew on Clarin\'s plane was then assigned to investigate the insurance scandal.',
    },
    citations: [
      { id: 26, text: 'Ercolini vuelo a Lago Escondido — Pagina/12', url: 'https://www.pagina12.com.ar/495000-lago-escondido-un-viaje-que-compromete-al-juez-ercolini' },
      { id: 27, text: 'Lijo nominacion Corte Suprema — Infobae', url: 'https://www.infobae.com/politica/2024/06/' },
      { id: 28, text: 'Hornos y Borinsky visitas a Olivos — CELS', url: 'https://www.cels.org.ar/web/2021/01/las-visitas-de-los-jueces-hornos-y-borinsky-a-olivos/' },
      { id: 29, text: 'Rosenkrantz ex-abogado de Clarin — Ambito', url: 'https://www.ambito.com/politica/rosenkrantz-y-su-pasado-como-abogado-del-grupo-clarin-n5044573' },
      { id: 30, text: 'Tasa de condena por corrupcion 2% — ACIJ', url: 'https://acij.org.ar/monitoreo-de-causas-de-corrupcion/' },
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
        'Las declaraciones juradas patrimoniales de los funcionarios publicos, cruzadas con sus salarios oficiales, revelan anomalias que la matematica no puede explicar.',
        'Alberto Seijas declaro un patrimonio de ARS 1.750 millones mientras servia como asesor ad honorem — un cargo sin remuneracion. El puesto no paga un centavo. El patrimonio declarado es de mil setecientos cincuenta millones de pesos.',
        'Pistone registro un crecimiento patrimonial del 457.000% durante su carrera en el sector publico. Castineira de Dios alcanzo un crecimiento del 62.000%. Estos no son retornos de inversiones bursatiles extraordinarias. Son numeros que desafian cualquier explicacion basada en ingresos legitimos de funcionarios publicos.',
        'El juez Lijo — el mismo nominado a la Corte Suprema — posee un departamento valuado en USD 2 millones que no aparece en sus declaraciones juradas. La Oficina Anticorrupcion, que deberia auditar estas declaraciones, ha sido sistematicamente debilitada o cooptada.',
        'El patron se repite: funcionarios que llegan al cargo con patrimonios modestos y egresan con fortunas. El sistema no tiene mecanismo efectivo para preguntar de donde viene el dinero.',
      ],
      en: [
        'Asset declarations of public officials, cross-referenced with their official salaries, reveal anomalies that mathematics cannot explain.',
        'Alberto Seijas declared assets worth ARS 1.75 billion while serving as an unpaid advisor — an ad honorem position. The post pays nothing. The declared wealth is one billion seven hundred fifty million pesos.',
        'Pistone registered a 457,000% asset growth during his public sector career. Castineira de Dios reached 62,000% growth. These are not returns from extraordinary stock market investments. They are numbers that defy any explanation based on legitimate public official income.',
        'Judge Lijo — the same one nominated to the Supreme Court — owns an apartment valued at USD 2 million that does not appear in his asset declarations. The Anti-Corruption Office, which should audit these declarations, has been systematically weakened or co-opted.',
        'The pattern repeats: officials who enter office with modest assets and leave with fortunes. The system has no effective mechanism to ask where the money comes from.',
      ],
    },
    pullQuote: {
      es: 'La jueza Seijas declaro 1.750 millones de pesos en patrimonio mientras servia como asesora ad honorem.',
      en: 'Judge Seijas declared 1.75 billion pesos in assets while serving as an unpaid advisor.',
    },
    citations: [
      { id: 31, text: 'Seijas patrimonio — declaracion jurada publica, Oficina Anticorrupcion' },
      { id: 32, text: 'Pistone crecimiento patrimonial 457.000% — DDJJ comparativas 2012-2024' },
      { id: 33, text: 'Lijo departamento no declarado — Infobae', url: 'https://www.infobae.com/politica/2024/07/' },
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
        'La infraestructura de datos: Como Voto aporta 2.258 politicos y 920.000 votos. Las filtraciones del ICIJ, 4.349 oficiales argentinos y 2.422 entidades. La CNE registra 1.714 donaciones. El Boletin Oficial, 6.044 nombramientos y 22.280 contratos. La IGJ, 951.863 oficiales y 398.000 empresas. La CNV, 1.528.931 cargos en directorios. Las declaraciones juradas patrimoniales, 718.865 registros del periodo 2012-2024.',
        'Total rastreado: $609.000 millones. Coincidencias de entidad: 1.840 SAME_ENTITY confirmadas + 10.393 MAYBE_SAME_AS pendientes de resolucion. La investigacion directa: 36 personas investigadas, 76 relaciones mapeadas.',
        'El motor de analisis MiroFish — basado en Qwen 3.5 corriendo localmente — proceso cada patron, confirmo las coincidencias y descarto los falsos positivos. Cada hallazgo fue verificado contra las fuentes primarias.',
        'Lo que los numeros no dicen: los totales patrimoniales no estan disponibles en todas las declaraciones juradas. Los vinculos offshore-juez aun no estan resueltos. La cadena donante-juez falta en los datos. La informacion del Boletin Oficial corresponde a diciembre 2019.',
        'El rigor de una investigacion se mide tanto por lo que encuentra como por lo que descarta. Algunas coincidencias iniciales resultaron ser homonimos — personas distintas con el mismo nombre. Cada caso descartado aumenta la confianza en los hallazgos restantes.',
      ],
      en: [
        'The data infrastructure: Como Voto provides 2,258 politicians and 920,000 votes. ICIJ leaks, 4,349 Argentine officers and 2,422 entities. The CNE records 1,714 donations. The Boletin Oficial, 6,044 appointments and 22,280 contracts. The IGJ, 951,863 officers and 398,000 companies. The CNV, 1,528,931 board positions. Asset declarations, 718,865 records from 2012-2024.',
        'Total tracked: $609 billion. Entity matches: 1,840 confirmed SAME_ENTITY + 10,393 MAYBE_SAME_AS pending resolution. Direct investigation: 36 persons investigated, 76 relationships mapped.',
        'The MiroFish analysis engine — based on Qwen 3.5 running locally — processed every pattern, confirmed matches and discarded false positives. Every finding was verified against primary sources.',
        'What the numbers do not say: asset totals are empty for most declarations. Offshore-judge links are not yet resolved. The donor-judge chain is missing from the data. The Boletin Oficial is a snapshot from December 2019.',
        'The rigor of an investigation is measured as much by what it discards as by what it finds. Some initial matches turned out to be namesakes — different people with the same name. Each discarded case increases confidence in the remaining findings.',
      ],
    },
    pullQuote: {
      es: 'El grafo no acusa. Revela patrones.',
      en: 'The graph does not accuse. It reveals patterns.',
    },
    citations: [
      { id: 34, text: 'Infraestructura Neo4j — Office of Accountability' },
      { id: 35, text: 'MiroFish/Qwen 3.5 — motor de analisis local' },
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
        'Alejandra Macri, hija no reconocida de Franco Macri, presento en 2025 una demanda judicial que revelo la magnitud del imperio familiar: 398 empresas distribuidas en Argentina, Brasil, Panama, Hong Kong, Reino Unido, Islas Virgenes Britanicas, Dubai y Luxemburgo.[36] La SOCMA (Sociedad Macri) fue fundada el 19 de enero de 1976 — dos meses antes del golpe militar — y crecio de 7 a 47 empresas bajo la dictadura.',
        'El caso emblematico es el Correo Argentino. Privatizado en 1997, el grupo Macri pago el canon un solo anio. Entro en concurso preventivo en septiembre de 2001. Veinte anios despues, en julio de 2021, fue declarado en quiebra.[37] Durante la presidencia de Mauricio Macri, el Estado ofrecio una reduccion del 98,82% de la deuda — un acuerdo que beneficiaba a la propia familia del presidente. El Tesoro pidio extender la quiebra a SOCMA y SIDECO, los holdings de la familia.',
        'Gianfranco Macri, a traves de la entidad luxemburguesa Lares Corporation, compro seis parques eolicos por US$25 millones y los vendio en 2017 por US$95 millones — una ganancia de US$70 millones.[38] Seis dias antes de la victoria electoral de Mauricio en octubre de 2015, Gianfranco ordeno trasladar fondos de UBS Hamburgo a Safra Bank en Suiza y destruir la correspondencia bancaria. Blanqueo US$4 millones de BF Corporation (Panama) durante la amnistia fiscal de 2016.',
        'Mariano Macri, el hermano disidente, denuncio penalmente al grupo empresarial en agosto de 2024 por administracion fraudulenta, lavado de activos, falsificacion de documentos y evasion tributaria. La causa recayo en el Juzgado Federal 6 — del juez Ariel Lijo.[39]',
      ],
      en: [
        'Alejandra Macri, Franco Macri\'s unrecognized daughter, filed a 2025 lawsuit that revealed the family empire\'s scale: 398 companies across Argentina, Brazil, Panama, Hong Kong, UK, British Virgin Islands, Dubai, and Luxembourg.[36] SOCMA (Sociedad Macri) was founded January 19, 1976 — two months before the military coup — and grew from 7 to 47 companies under the dictatorship.',
        'The emblematic case is Correo Argentino. Privatized in 1997, the Macri group paid the canon for one year only. It entered creditor protection in September 2001. Twenty years later, in July 2021, it was declared bankrupt.[37] During Mauricio Macri\'s presidency, the State offered a 98.82% debt reduction — a deal benefiting the president\'s own family. The Treasury requested extending bankruptcy to SOCMA and SIDECO, the family\'s holdings.',
        'Gianfranco Macri, through Luxembourg entity Lares Corporation, bought six wind farms for US$25 million and sold them in 2017 for US$95 million — a US$70 million profit.[38] Six days before Mauricio\'s electoral victory in October 2015, Gianfranco ordered funds moved from UBS Hamburg to Safra Bank Switzerland and correspondence destroyed. He laundered US$4 million from BF Corporation (Panama) during the 2016 tax amnesty.',
        'Mariano Macri, the dissident brother, filed a criminal complaint against the business group in August 2024 for fraudulent administration, money laundering, document forgery, and tax evasion. The case landed in Federal Court 6 — Judge Ariel Lijo\'s court.[39]',
      ],
    },
    citations: [
      { id: 36, text: 'Alejandra Macri desafia al clan familiar — DataClave', url: 'https://www.dataclave.com.ar/poder/alejandra-macri-desafia-al-clan-familiar--bienes-ocultos-y-demandas-por-398-empresas_a677c201cefdaf93e3bd9db5b' },
      { id: 37, text: 'Quiebra Correo Argentino — Infobae', url: 'https://www.infobae.com/politica/2021/07/05/claves-para-entender-la-causa-del-correo-argentino-sa-un-proceso-en-la-justicia-comercial-que-duro-20-anos-y-termino-en-una-quiebra/' },
      { id: 38, text: 'Lares Corporation parques eolicos — OCCRP', url: 'https://www.occrp.org/es/openlux/gone-with-the-wind-argentinas-former-first-family-used-luxembourg-companies-to-reap-70-million' },
      { id: 39, text: 'Mariano Macri denuncia — Infobae', url: 'https://www.infobae.com/judiciales/2024/08/07/el-hermano-de-mauricio-macri-denuncio-al-grupo-empresarial-de-la-familia-por-defraudacion-y-lavado-de-activos/' },
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
        'En diciembre de 2024, la CNDC imputo por cartelizacion a Swiss Medical, OSDE, Galeno, Medife, Omint, Hospital Britanico, Hospital Aleman y a Claudio Belocopitt personalmente.[40] Las prepagas habian coordinado aumentos de ~150% cuando la inflacion era ~70%. Belocopitt controla el 76% de Swiss Medical Group (53 subsidiarias) mientras simultaneamente posee el 40% de Grupo America (America TV, A24, La Red) — un conflicto de intereses entre salud y medios sin precedentes.',
        'El caso PAMI es demoledor: el Anastrozol se pago a $13.192 por unidad cuando la licitacion publica lo ofrecia a $924 — un sobreprecio de 14,3 veces.[41] En la ANDIS, el Macitentan fue adjudicado a $411.764 y vendido tres dias despues a $8.290.000 — un markup del 2.013%. Cuatro droguerias recibieron $37.000 millones. La Drogueria Suizo Argentina vio sus contratos estatales crecer 2.678% en un anio bajo el gobierno de Milei.',
        'Durante la pandemia, Swiss Medical recibio $2.417 millones en subsidios ATP del Estado — mientras Belocopitt cobraba parte de su salario con fondos publicos y simultaneamente adquiria competidores.[42] Forbes estima la fortuna de Belocopitt en USD 440 millones. El ICIJ documenta cinco entidades offshore en Islas Virgenes Britanicas: Karima Portfolio, Tiago Global, Ragnar Portfolio, Elyanne Business, Pensford Business.',
      ],
      en: [
        'In December 2024, the CNDC charged Swiss Medical, OSDE, Galeno, Medife, Omint, Hospital Britanico, Hospital Aleman, and Claudio Belocopitt personally for cartelization.[40] The prepaid health companies had coordinated increases of ~150% when inflation was ~70%. Belocopitt controls 76% of Swiss Medical Group (53 subsidiaries) while simultaneously owning 40% of Grupo America (America TV, A24, La Red) — an unprecedented health-media conflict of interest.',
        'The PAMI case is devastating: Anastrozol was paid at $13,192 per unit when public bidding offered it at $924 — a 14.3x markup.[41] At ANDIS, Macitentan was awarded at $411,764 and sold three days later at $8,290,000 — a 2,013% markup. Four drugstores received $37 billion. Drogueria Suizo Argentina saw its state contracts grow 2,678% in one year under the Milei government.',
        'During the pandemic, Swiss Medical received $2.417 billion in state ATP subsidies — while Belocopitt collected part of his salary with public funds and simultaneously acquired competitors.[42] Forbes estimates Belocopitt\'s fortune at USD 440 million. The ICIJ documents five BVI offshore entities: Karima Portfolio, Tiago Global, Ragnar Portfolio, Elyanne Business, Pensford Business.',
      ],
    },
    pullQuote: {
      es: 'Anastrozol: $13.192 por unidad vs $924 en licitacion publica. Sobreprecio de 14,3 veces.',
      en: 'Anastrozol: $13,192 per unit vs $924 in public bidding. 14.3x markup.',
    },
    citations: [
      { id: 40, text: 'CNDC imputa cartelizacion prepagas — Argentina.gob.ar', url: 'https://www.argentina.gob.ar/noticias/la-cndc-imputa-por-presunta-cartelizacion-las-principales-empresas-de-medicina-prepaga-0' },
      { id: 41, text: 'PAMI sobreprecios oncologicos — La Nacion', url: 'https://www.lanacion.com.ar/politica/denuncian-que-el-pami-pago-medicamentos-oncologicos-hasta-16-veces-mas-que-el-valor-de-las-compras-nid22012025/' },
      { id: 42, text: 'Swiss Medical ATP pandemia — La Izquierda Diario', url: 'https://www.laizquierdadiario.com/Claudio-Bellocopitt-cobro-el-ATP-del-Estado-radiografia-del-magnate-de-Swiss-Medical' },
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
        'Luis Caputo trabajo en JP Morgan (1994-1998) y Deutsche Bank (1998-2008). Como Ministro de Economia de Milei, designo a JP Morgan como agente fiduciario para recomprar bonos soberanos con fondos del Banco Mundial.[43] Su consultora Anker Latinoamerica (CUIT 30-71690088-2) — registrada en la misma direccion donde figuraba como presidente — suspendio operaciones el 30 de noviembre de 2023, dias antes de que asumiera como ministro.',
        'El patron es mas profundo: al menos seis funcionarios de Milei tienen pasado en JP Morgan — Caputo, Daza, Bausili, Quirno, Werning y Reidel.[44] Santiago Bausili, actual presidente del BCRA, recibio ~USD 200.000 en acciones y bonos de Deutsche Bank mientras era Secretario de Finanzas, dirigiendo operaciones de deuda estatal que beneficiaban a su ex empleador. Esta procesado por negociaciones incompatibles con la funcion publica.',
        'En enero de 2024, Caputo tomo USD 3.200 millones de reservas del BCRA mediante DNU 23/2024, dejando una letra intransferible a 10 anios — practicamente sin valor.[45] En 2017, emitio el bono a 100 anios (USD 2.750M) que la AGN califico como "poco transparente e ineficiente, comprometiendo generaciones futuras." Argentina pagaria mas del 900% del neto recibido a lo largo de la vida del bono.',
        'Sturzenegger mantiene el 99% de sus depositos en el exterior mientras promueve que los argentinos traigan dolares al sistema local. Su empresa Un Ombu SAS tiene capital minimo ($21.400) pero un objeto social que abarca agricultura, tecnologia, finanzas, energia, mineria, fideicomisos e inmobiliaria. Su mentor intelectual: el DNU 70/2023 que elimino regulaciones que benefician a las empresas de sus propios asesores.[46]',
      ],
      en: [
        'Luis Caputo worked at JP Morgan (1994-1998) and Deutsche Bank (1998-2008). As Milei\'s Economy Minister, he designated JP Morgan as fiduciary agent for sovereign bond repurchase using World Bank funds.[43] His consulting firm Anker Latinoamerica (CUIT 30-71690088-2) — registered at the same address where he served as president — suspended operations on November 30, 2023, days before he became minister.',
        'The pattern runs deeper: at least six Milei officials have JP Morgan backgrounds — Caputo, Daza, Bausili, Quirno, Werning, and Reidel.[44] Santiago Bausili, current BCRA president, received ~USD 200,000 in Deutsche Bank stock and bonuses while serving as Finance Secretary, directing state debt operations that benefited his former employer. He is processed for negotiations incompatible with public office.',
        'In January 2024, Caputo took USD 3.2 billion from BCRA reserves via DNU 23/2024, leaving a non-transferable 10-year letter — practically valueless.[45] In 2017, he issued the 100-year bond (USD 2.75B) that the AGN qualified as "little transparent and inefficient, compromising future generations." Argentina would repay over 900% of the net received over the bond\'s life.',
        'Sturzenegger maintains 99% of his deposits abroad while promoting policies encouraging Argentines to bring dollars into the local system. His company Un Ombu SAS has minimal capital ($21,400) but a corporate purpose spanning agriculture, technology, finance, energy, mining, trusts, and real estate. His intellectual creation: DNU 70/2023, which eliminated regulations benefiting his own advisors\' companies.[46]',
      ],
    },
    pullQuote: {
      es: 'Seis funcionarios de Milei con pasado en JP Morgan. El Ministro designa a su ex empleador como agente fiduciario.',
      en: 'Six Milei officials with JP Morgan backgrounds. The Minister designates his former employer as fiduciary agent.',
    },
    citations: [
      { id: 43, text: 'Caputo recompra bonos via JP Morgan — La Letra P', url: 'https://www.letrap.com.ar/economia/deuda-educacion-toto-caputo-recomprara-bonos-plata-del-banco-mundial-y-el-jp-morgan-como-agente-n5419611' },
      { id: 44, text: 'JP Morgan in Power — Buenos Aires Times', url: 'https://batimes.com.ar/news/argentina/jp-morgan-in-power-mileis-six-officials-with-a-past-there.phtml' },
      { id: 45, text: 'BCRA letra intransferible — Infobae', url: 'https://www.infobae.com/economia/2024/01/05/el-gobierno-tomara-usd-3200-de-las-reservas-del-bcra-para-pagar-vencimientos-de-deuda/' },
      { id: 46, text: 'Sturzenegger 99% exterior — Perfil', url: 'https://www.perfil.com/noticias/politica/declaracion-jurada-federico-sturzenegger.phtml' },
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
  { value: '$674B', label: { es: 'Total rastreado', en: 'Total tracked' } },
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
  { name: 'Causa seguros — allanamientos Ercolini', url: 'https://www.infobae.com/politica/2024/04/' },
  { name: 'Bachellier embargo — Ambito Financiero', url: 'https://www.ambito.com/politica/seguros-gate/' },
  { name: 'Plate designacion SSN — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar' },
  { name: 'Catalan designacion YPF — Infobae', url: 'https://www.infobae.com/economia/2024/' },
  { name: 'Cuneo Libarona conflicto de intereses — Pagina/12', url: 'https://www.pagina12.com.ar/' },
  { name: 'CEADS — Consejo Empresario', url: 'https://ceads.org.ar' },
  { name: 'Ercolini vuelo Lago Escondido — Pagina/12', url: 'https://www.pagina12.com.ar/495000-lago-escondido-un-viaje-que-compromete-al-juez-ercolini' },
  { name: 'Hornos y Borinsky visitas a Olivos — CELS', url: 'https://www.cels.org.ar/web/2021/01/las-visitas-de-los-jueces-hornos-y-borinsky-a-olivos/' },
  { name: 'Rosenkrantz ex-abogado Clarin — Ambito', url: 'https://www.ambito.com/politica/rosenkrantz-y-su-pasado-como-abogado-del-grupo-clarin-n5044573' },
  { name: 'Tasa condena corrupcion 2% — ACIJ', url: 'https://acij.org.ar/monitoreo-de-causas-de-corrupcion/' },
  { name: 'Lijo departamento no declarado — Infobae', url: 'https://www.infobae.com/politica/2024/07/' },
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
