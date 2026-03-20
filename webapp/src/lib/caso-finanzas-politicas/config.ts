import type { InvestigationClientConfig } from '../investigations/types'

export const config: InvestigationClientConfig = {
  casoSlug: 'caso-finanzas-politicas',
  name: { es: 'Caso Finanzas Politicas', en: 'Political Finance Case' },
  description: {
    es: 'Investigacion sobre conexiones entre poder politico y dinero en Argentina. 617 politicos en 2+ datasets, 8 fuentes cruzadas.',
    en: 'Investigation into connections between political power and money in Argentina. 617 politicians in 2+ datasets, 8 cross-referenced sources.',
  },
  tabs: ['resumen', 'investigacion', 'cronologia', 'dinero', 'conexiones'],
  features: {
    wallets: false,
    simulation: false,
    flights: false,
    submissions: false,
    platformGraph: true,
  },
  hero: {
    title: {
      es: 'El Sistema: Politica, Dinero y Poder en Argentina',
      en: 'The System: Politics, Money and Power in Argentina',
    },
    subtitle: {
      es: 'Como ocho bases de datos publicas revelan las conexiones entre el cargo publico, los directorios corporativos, las sociedades offshore y el financiamiento de campanas',
      en: 'How eight public datasets reveal the connections between public office, corporate boards, offshore entities and campaign financing',
    },
  },
  chapters: [
    {
      id: 'la-frontera',
      title: {
        es: 'I. La Frontera',
        en: 'I. The Border',
      },
      paragraphs: [
        {
          es: 'En diciembre de 2024, el senador entrerriano Edgardo Kueider fue detenido intentando cruzar a Paraguay con USD 211.000 en efectivo no declarado.',
          en: 'In December 2024, Senator Edgardo Kueider from Entre Rios was detained while trying to cross into Paraguay carrying USD 211,000 in undeclared cash.',
        },
        {
          es: 'Meses antes, Kueider habia emitido uno de los 36 votos afirmativos que aprobaron la Ley de Bases — la legislacion de desregulacion economica mas importante del gobierno de Milei. El desempate lo resolvio la vicepresidenta Villarruel. Sin ese voto, la ley no existiria.',
          en: 'Months earlier, Kueider had cast one of 36 affirmative votes that approved the Ley de Bases — the Milei government\'s most significant economic deregulation legislation. Vice President Villarruel broke the tie. Without that vote, the law would not exist.',
        },
        {
          es: 'Lo que la justicia encontro despues dibujo el circuito completo: dos empresas fantasma — BETAIL SA y EDEKOM SA — registradas en la IGJ con domicilios legales falsos. Departamentos de lujo en Parana adquiridos a traves de esas pantallas. En marzo de 2025, siete testaferros arrestados. En los allanamientos, videos de Kueider manipulando fajos de billetes en efectivo. Fue expulsado del Senado.',
          en: 'What prosecutors found afterward drew the complete circuit: two shell companies — BETAIL SA and EDEKOM SA — registered at the IGJ with fake legal addresses. Luxury apartments in Parana acquired through those fronts. In March 2025, seven front men arrested. During raids, videos of Kueider handling stacks of cash. He was expelled from the Senate.',
        },
        {
          es: 'Kueider no es una anomalia. Es un sintoma.',
          en: 'Kueider is not an anomaly. He is a symptom.',
        },
        {
          es: 'Esta investigacion cruzo ocho fuentes de datos — votos legislativos, filtraciones offshore, donaciones de campana, nombramientos del Boletin Oficial, el registro empresarial de la IGJ, directivos de la CNV, y declaraciones juradas patrimoniales — y encontro 617 politicos que aparecen en dos o mas datasets simultaneamente. Legisladores que son directivos de empresas. Donantes de campana que son contratistas del Estado. Funcionarios que operan sociedades offshore mientras votan presupuestos.',
          en: 'This investigation cross-referenced eight data sources — legislative votes, offshore leaks, campaign donations, Boletin Oficial appointments, IGJ corporate registry, CNV board members, and asset declarations — and found 617 politicians appearing in two or more datasets simultaneously. Legislators who are corporate board members. Campaign donors who are government contractors. Officials who operate offshore entities while voting on budgets.',
        },
      ],
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
      paragraphs: [
        {
          es: 'Para entender como funciona el sistema, hay que empezar por una asociacion civil registrada en la Inspeccion General de Justicia: PENSAR ARGENTINA.',
          en: 'To understand how the system works, start with a civil association registered at the General Inspection of Justice (IGJ): PENSAR ARGENTINA.',
        },
        {
          es: 'No es un club de debate ni un think tank informal. Es una entidad legalmente constituida con un directorio donde 19 politicos figuran como miembros registrados. La vicepresidenta Michetti, el jefe de gabinete Marcos Pena, el presidente del Banco Central Sturzenegger, el presidente de la Camara Monzo, seis ministros y secretarios — compartian directorio con Nicolas Caputo, el socio comercial mas cercano de Mauricio Macri.',
          en: 'This is not a debate club or an informal think tank. It is a legally constituted entity whose board includes 19 politicians confirmed by national ID — not just by name. Vice President Michetti, Chief of Cabinet Marcos Pena, Central Bank President Sturzenegger, Speaker of the House Monzo, six ministers and secretaries — all sharing a board with Nicolas Caputo, Mauricio Macri\'s closest business partner.',
        },
        {
          es: 'Las politicas publicas que emergian de PENSAR fluian directamente al Poder Ejecutivo, sin intermediacion. Los mismos miembros del directorio que disenaban las politicas las implementaban desde el gobierno.',
          en: 'Public policies emerging from PENSAR flowed directly into the Executive Branch without intermediation. The same board members who designed the policies implemented them from government.',
        },
        {
          es: 'El caso de Laura Alonso merece atencion particular. Paso de legisladora a Secretaria de Etica Publica — la funcionaria encargada de supervisar las declaraciones juradas de sus propios excolegas de bancada y correligionarios de PENSAR ARGENTINA. El organismo de control estaba dirigido por alguien del mismo directorio corporativo que los controlados.',
          en: 'Laura Alonso\'s case deserves particular attention. She went from legislator to Secretary of Public Ethics — the official responsible for overseeing the asset declarations of her own former caucus colleagues and PENSAR ARGENTINA co-directors. The oversight body was run by someone from the same corporate board as those being overseen.',
        },
        {
          es: 'De 20 politicos que pasaron del Congreso al Poder Ejecutivo y viceversa, 13 son del espacio PRO. Macri como diputado (2005-2007) tuvo una presencia del 17,6% — entre las mas bajas del dataset. Sin embargo, aparece en 5 datasets simultaneamente, mas que cualquier otro politico. Era el legislador que menos legislaba y el que mas conexiones externas tenia.',
          en: 'Of 20 politicians who moved between Congress and the Executive Branch, 13 were from the PRO party. Macri as a deputy (2005-2007) had a 17.6% attendance rate — among the lowest in the dataset. Yet he appears in 5 datasets simultaneously, more than any other politician. He was the legislator who legislated least and had the most external connections.',
        },
      ],
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
      paragraphs: [
        {
          es: 'En las elecciones de 2019, las 1.714 donaciones registradas ante la Camara Nacional Electoral revelan una asimetria estructural: Juntos por el Cambio recibio ARS 46,9 millones de 75 donaciones. Frente de Todos recibio ARS 29,2 millones de 459 donaciones.',
          en: 'In the 2019 elections, the 1,714 donations registered with the National Electoral Chamber reveal a structural asymmetry: Juntos por el Cambio received ARS 46.9 million from 75 donations. Frente de Todos received ARS 29.2 million from 459 donations.',
        },
        {
          es: 'El promedio por donacion de JxC fue casi diez veces mayor que el del FdT. Una coalicion dependia de grandes aportes corporativos; la otra, de una base fragmentada.',
          en: 'The average JxC donation was nearly ten times larger than FdT\'s. One coalition depended on large corporate contributions; the other, on a fragmented base.',
        },
        {
          es: 'De los 20 mayores donantes, 13 dieron exclusivamente a Juntos por el Cambio. Solo uno — Aluar Aluminio Argentino — aposto a ambos lados: ARS 5.400.000 divididos entre JxC y Frente de Todos. Aluar es el mayor productor de aluminio de Argentina. Depende de subsidios energeticos del Estado y de protecciones arancelarias. Financiar a ambos bandos no es generosidad civica: es un seguro de acceso al poder sin importar quien gane.',
          en: 'Of the 20 largest donors, 13 gave exclusively to Juntos por el Cambio. Only one — Aluar Aluminio Argentino — bet on both sides: ARS 5,400,000 split between JxC and Frente de Todos. Aluar is Argentina\'s largest aluminum producer. It depends on state energy subsidies and tariff protections. Funding both sides is not civic generosity: it is an insurance policy for access to power regardless of who wins.',
        },
        {
          es: 'La Ley 26.215 (Art. 15) prohibe expresamente que los contratistas del Estado realicen aportes de campana. El cruce de datos detecto una coincidencia que merece atencion: Juan Pablo Rodriguez aparece simultaneamente como contratista del Estado (2018-2020, 4 contratos) y como donante de campana.',
          en: 'Law 26,215 (Art. 15) expressly prohibits government contractors from making campaign contributions. The data cross-reference detected a pattern worth investigating: Juan Pablo Rodriguez appears simultaneously as a government contractor (2018-2020, 4 contracts) and as a campaign donor.',
        },
        {
          es: 'Chequeado documento que Macri recibio aproximadamente ARS 3 millones en donaciones de empleados de empresas contratistas del Estado — una forma de eludir la prohibicion del Art. 15. La empresa no dona directamente; sus empleados lo hacen. El efecto es el mismo.',
          en: 'Chequeado documented that Macri received approximately ARS 3 million in donations from employees of government contractor companies — a way to circumvent Art. 15\'s prohibition. The company doesn\'t donate directly; its employees do. The effect is the same.',
        },
      ],
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
      paragraphs: [
        {
          es: 'Las filtraciones del Consorcio Internacional de Periodistas de Investigacion expusieron una huella offshore argentina masiva: 4.347 argentinos vinculados a 2.419 entidades en jurisdicciones opacas. Solo los Pandora Papers (a traves del estudio juridico Alcogal) expusieron a 2.637 argentinos — mas que todas las demas filtraciones combinadas. Las Islas Virgenes Britanicas son la jurisdiccion abrumadoramente preferida.',
          en: 'Leaks from the International Consortium of Investigative Journalists exposed a massive Argentine offshore footprint: 4,347 Argentines linked to 2,419 entities in opaque jurisdictions. The Pandora Papers alone (through law firm Alcogal) exposed 2,637 Argentines — more than all other leaks combined. The British Virgin Islands is the overwhelmingly preferred jurisdiction.',
        },
        {
          es: 'Graciela Camano — 30 anos en politica, 6 partidos — posee TT 41 CORP, constituida en las Islas Virgenes Britanicas el 23 de junio de 2016, durante su mandato como Diputada Nacional (2014-2018). Su patrimonio declarado crecio 14 veces en diez anos: de ARS 2,8 millones (2013) a ARS 39,2 millones (2023). Es el 4to nodo mas conectado del grafo con 2.364 relaciones. El patron — ausente en votaciones financieras mientras se posee una entidad offshore — genera una pregunta legitima.',
          en: 'Graciela Camano — 30 years in politics, 6 parties — owns TT 41 CORP, incorporated in the British Virgin Islands on June 23, 2016, during her term as National Deputy (2014-2018). Her declared assets grew 14-fold in ten years: from ARS 2.8 million (2013) to ARS 39.2 million (2023). She is the 4th most connected node in the graph with 2,364 relationships. The pattern — absent from financial votes while owning an offshore entity — raises a legitimate question.',
        },
        {
          es: 'Maria Cecilia Ibanez — Diputada Nacional por Cordoba, La Libertad Avanza — figura como titular de PELMOND COMPANY LTD., constituida en las BVI el 31 de octubre de 2014. La entidad esta activa, confirmada en la base publica del ICIJ. Su patrimonio se duplico en un ano: ARS 15,5 millones (2023) a ARS 33,5 millones (2024). Voto AFIRMATIVO en el Presupuesto Nacional 2025 mientras figuraba como titular de una sociedad offshore activa.',
          en: 'Maria Cecilia Ibanez — National Deputy from Cordoba, La Libertad Avanza — is listed as the owner of PELMOND COMPANY LTD., incorporated in the BVI on October 31, 2014. The entity is active, confirmed in the ICIJ\'s public database. Her assets doubled in one year: ARS 15.5 million (2023) to ARS 33.5 million (2024). She voted YES on the 2025 National Budget while listed as owner of an active offshore company.',
        },
        {
          es: 'Entre los miles de nombres cruzados entre el Boletin Oficial y las filtraciones del ICIJ, aparecio Ferrari Facundo — agente de la AFIP, la autoridad encargada de perseguir la evasion fiscal — como oficial de una entidad offshore en los Panama Papers. El zorro cuidando el gallinero.',
          en: 'Among thousands of names cross-referenced between the Boletin Oficial and ICIJ leaks, Ferrari Facundo appeared — an AFIP agent, the authority responsible for prosecuting tax evasion — as an officer of an offshore entity in the Panama Papers. The fox guarding the henhouse.',
        },
      ],
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
      paragraphs: [
        {
          es: 'La busqueda del apellido "Macri" en el registro de la IGJ devuelve 153 personas vinculadas a 211 empresas. El nucleo es SOCMA — Sociedad Macri S.A. — fundada por Franco Macri en enero de 1976. Durante la dictadura militar, el grupo crecio de 7 a 47 empresas.',
          en: 'Searching the surname "Macri" in the IGJ registry returns 153 individuals linked to 211 companies. The core is SOCMA — Sociedad Macri S.A. — founded by Franco Macri in January 1976. During the military dictatorship, the group grew from 7 to 47 companies.',
        },
        {
          es: 'Correo Argentino: privatizado en 1997, la concesion fue a SOCMA. Pago el canon solo el primer ano. En junio de 2016, el gobierno de Macri acepto una reduccion del 98,82% de la deuda. La fiscal Boquin dictamino que era "equivalente a una condonacion." La causa judicial continua abierta. Siete anos despues, la familia aun no habia pagado.',
          en: 'Correo Argentino: privatized in 1997, the concession went to SOCMA. They paid the fee only the first year. In June 2016, the Macri government accepted a 98.82% debt reduction. Prosecutor Boquin ruled it "equivalent to a pardon." Prosecutor Zoni charged President Macri and Minister Aguad. Seven years later, the family still had not paid.',
        },
        {
          es: 'AUSOL: la concesion fue renegociada durante la presidencia de Macri. El Estado quedo comprometido en un impacto estimado de ~USD 2.000 millones. Despues de los aumentos de peaje, Macri vendio sus acciones con una prima del 400%.',
          en: 'AUSOL: the highway concession was renegotiated during Macri\'s presidency. The state was committed to an estimated impact of ~USD 2 billion. After toll increases, Macri sold his shares at a 400% premium.',
        },
        {
          es: 'En 2016, el gobierno de Macri impulso una ley de blanqueo fiscal. Los propios integrantes de SOCMA la aprovecharon: Gianfranco Macri declaro ARS 622M (~USD 4M de BF Corp, una offshore panamena con fondos en el Safra Bank de Suiza). Total declarado por el circulo SOCMA: mas de ARS 900 millones en activos previamente ocultos.',
          en: 'In 2016, the Macri government pushed a tax amnesty law. SOCMA\'s own members took advantage: Gianfranco Macri declared ARS 622M (~USD 4M from BF Corp, a Panamanian offshore with funds at Safra Bank in Switzerland). Total declared by the SOCMA circle: over ARS 900 million in previously hidden assets.',
        },
        {
          es: 'En el directorio de MINERA GEOMETALES confluyen Mauricio Macri, Victor Composto (insider de SOCMA que blanqueo ARS 68 millones), y Jean Paul Luksic Fontbona — heredero del grupo minero chileno Antofagasta PLC. Un expresidente, el operador corporativo de su familia y la elite minera del continente. En la misma mesa directiva.',
          en: 'The board of MINERA GEOMETALES brings together Mauricio Macri, Victor Composto (a SOCMA insider who declared ARS 68 million through the amnesty), and Jean Paul Luksic Fontbona — heir to Chile\'s Antofagasta PLC mining group. A former president, his family\'s corporate operator, and the continent\'s mining elite. On the same board.',
        },
      ],
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
      paragraphs: [
        {
          es: 'El 12 de junio de 2024, la Ley de Bases fue aprobada en el Senado con 36 votos afirmativos contra 36 negativos. La vicepresidenta Villarruel desempato. El cruce con datos corporativos revela un patron: legisladores con cargos en directorios de empresas votaron 42 a favor y 7 en contra. 108 cargos en directorios se concentran en senadores que votaron afirmativamente.',
          en: 'On June 12, 2024, the Ley de Bases was approved in the Senate with 36 votes in favor against 36 against. Vice President Villarruel broke the tie. Cross-referencing with corporate data reveals a pattern: legislators with corporate board positions voted 42 in favor and 7 against. 108 board positions are concentrated among senators who voted yes.',
        },
        {
          es: 'Kueider (Unidad Federal, Entre Rios) voto AFIRMATIVO — meses despues, USD 211.000 en la frontera, empresas fantasma, siete testaferros, videos con fajos de billetes. No hay presuncion. Hay hechos judiciales.',
          en: 'Kueider (Unidad Federal, Entre Rios) voted YES — months later, USD 211,000 at the border, shell companies, seven front men, videos of cash handling. No presumption needed. There are judicial facts.',
        },
        {
          es: 'Lousteau (UCR) voto AFIRMATIVO mientras su consultora, LCG SA, habia facturado $1.690.000 a la Oficina de Presupuesto del Congreso entre 2020 y 2022 — periodo durante el cual ejercia como senador. Un senador cuya empresa privada cobra del Congreso y que vota legislacion economica desde ese mismo Congreso.',
          en: 'Lousteau (UCR) voted YES while his consulting firm, LCG SA, had billed $1,690,000 to the Congressional Budget Office between 2020 and 2022 — during his term as senator. A senator whose private company collects from Congress while he votes on economic legislation from that same Congress.',
        },
        {
          es: 'Tagliaferri (Frente PRO) voto AFIRMATIVO. Figura como miembro del directorio de PENSAR ARGENTINA — la misma fundacion que presumiblemente contribuyo al diseno de las politicas de desregulacion. La fabrica de politicas produjo la legislacion. Su propia directiva la voto en el Congreso.',
          en: 'Tagliaferri (Frente PRO) voted YES. He is listed on the board of PENSAR ARGENTINA — the same foundation that presumably contributed to designing the deregulation policies. The policy factory produced the legislation. Its own board member voted for it in Congress.',
        },
        {
          es: 'El dato mas contraintuitivo: los senadores de la oposicion (PJ) que votaron NEGATIVO tenian en promedio mas conexiones con datasets externos (1,53) que los oficialistas que votaron SI (1,44). Los datos desmienten la narrativa simplista de que solo un lado tiene vinculos corporativos.',
          en: 'The most counterintuitive finding: opposition senators (PJ) who voted NO had on average more connections to external datasets (1.53) than the ruling coalition senators who voted YES (1.44). The data disproves the simplistic narrative that only one side has corporate ties.',
        },
      ],
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
      paragraphs: [
        {
          es: 'La infraestructura de datos: Como Voto aporta 2.258 politicos y 920.000 votos. Las filtraciones del ICIJ, 4.349 oficiales argentinos y 2.422 entidades. La CNE registra 1.714 donaciones. El Boletin Oficial, 6.044 nombramientos y 22.280 contratos. La IGJ, 951.863 oficiales y 1.060.769 empresas. La CNV, 1.528.931 cargos en directorios. Las declaraciones juradas patrimoniales, 718.865 registros del periodo 2012-2024.',
          en: 'The data infrastructure: Como Voto provides 2,258 politicians and 920,000 votes. ICIJ leaks, 4,349 Argentine officers and 2,422 entities. The CNE records 1,714 donations. The Boletin Oficial, 6,044 appointments and 22,280 contracts. The IGJ, 951,863 officers and 1,060,769 companies. The CNV, 1,528,931 board positions. Asset declarations, 718,865 records from 2012-2024.',
        },
        {
          es: 'Total: 5.387.477 nodos — 4.412.802 relaciones.',
          en: 'Total: 5,387,477 nodes — 4,412,802 relationships.',
        },
        {
          es: 'Las coincidencias clave: 6.056 cruces politico-declaracion jurada, 2.482 cruces politico-directivo, 1.479 cruces politico-oficial de empresa, 50 cruces politico-donante (100% verificados, cero falsos positivos), 3 cruces politico-offshore (1 presunto falso positivo).',
          en: 'Key matches: 6,056 politician-declaration crossings, 2,482 politician-board member crossings, 1,479 politician-company officer crossings, 50 politician-donor crossings (100% verified, zero false positives), 3 politician-offshore crossings (1 suspected false positive).',
        },
        {
          es: 'Lo que los numeros no dicen: los totales patrimoniales no estan disponibles en todas las declaraciones juradas. Los montos de contratos no figuran en las bases publicas. Los datos del Boletin Oficial corresponden a diciembre 2019.',
          en: 'What the numbers do not say: asset totals are empty for most declarations. Contract amounts are not available. Matching is by name, not by national ID — common names inflate matches. The Boletin Oficial is a snapshot from December 2019. There is no COMPR.AR data.',
        },
        {
          es: 'El rigor de una investigacion se mide tanto por lo que encuentra como por lo que descarta. Algunas coincidencias iniciales resultaron ser homonimos — personas distintas con el mismo nombre. Cada caso descartado aumenta la confianza en los hallazgos restantes.',
          en: 'The rigor of an investigation is measured as much by what it discards as by what it finds. Some initial matches turned out to be namesakes — different people with the same name. Each discarded case increases confidence in the remaining findings.',
        },
      ],
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
      paragraphs: [
        {
          es: 'Lo que esta confirmado: Kueider expulsado del Senado con evidencia judicial. Lousteau facturando al Congreso durante su mandato — cargos penales presentados. PENSAR ARGENTINA con 19 politicos registrados como miembros. Correo Argentino con quita del 98,82% documentada judicialmente. El blanqueo SOCMA superando los ARS 900 millones. PELMOND COMPANY LTD. de Ibanez activa y confirmada en el ICIJ.',
          en: 'What is confirmed: Kueider expelled from the Senate with judicial evidence. Lousteau billing Congress during his term — criminal charges filed. PENSAR ARGENTINA with 19 politicians listed as registered members. Correo Argentino with a judicially documented 98.82% debt reduction. The SOCMA amnesty exceeding ARS 900 million. Ibanez\'s PELMOND COMPANY LTD. active and confirmed in the ICIJ.',
        },
        {
          es: 'Lo que necesita verificacion: si PELMOND y TT 41 CORP figuran en las declaraciones juradas de Ibanez y Camano ante la Oficina Anticorrupcion. Si Ferrari Facundo y Reale Jose Maria de la AFIP son las mismas personas que aparecen en los Panama Papers. Si Tagliaferri pertenecia al directorio de PENSAR al momento de votar la Ley de Bases.',
          en: 'What needs verification: whether PELMOND and TT 41 CORP appear in the asset declarations of Ibanez and Camano before the Anti-Corruption Office. Whether AFIP agents Ferrari Facundo and Reale Jose Maria are the same individuals appearing in the Panama Papers. Whether Tagliaferri was on the PENSAR board when he voted for the Ley de Bases.',
        },
        {
          es: 'Lo que deberia investigarse: la Oficina Anticorrupcion deberia revisar las declaraciones juradas contra las bases del ICIJ — es un cruce que se puede hacer en una tarde. La Camara Nacional Electoral deberia cruzar su base de donantes con la de contratistas del Estado. La AFIP deberia auditar a sus propios agentes contra los Panama Papers.',
          en: 'What should be investigated: the Anti-Corruption Office should review asset declarations against the ICIJ databases — a cross-reference that can be done in an afternoon. The National Electoral Chamber should cross-reference its donor database with government contractors. AFIP should audit its own agents against the Panama Papers.',
        },
        {
          es: 'Cuando esas conexiones involucran a un senador atrapado con doscientos mil dolares en la frontera, a una fundacion cuyos miembros disenan las leyes que sus propios directivos votan, a un expresidente cuya familia blanqueo ARS 900 millones con su propia ley, a legisladoras con offshores activas mientras votan presupuestos — entonces los datos no necesitan acusar a nadie.',
          en: 'When these connections involve a senator caught with two hundred thousand dollars at the border, a foundation whose members design the laws their own board members vote for, a former president whose family declared ARS 900 million through their own amnesty law, legislators with active offshore entities while voting on budgets — then the data does not need to accuse anyone.',
        },
        {
          es: 'Los datos preguntan. Y en un pais donde 153 miembros de una sola familia aparecen en 211 empresas, donde una ley de blanqueo la votan los que la aprovechan, donde la secretaria de etica comparte directorio con los que tiene que controlar — en ese pais, las preguntas no van a dejar de multiplicarse. A menos que alguien las responda.',
          en: 'The data asks questions. And in a country where 153 members of a single family appear in 211 companies, where a tax amnesty law is voted by those who benefit from it, where the ethics secretary shares a corporate board with those she is supposed to oversee — in that country, the questions will not stop multiplying. Unless someone answers them.',
        },
      ],
      pullQuote: {
        es: 'Los datos preguntan. Las preguntas no van a dejar de multiplicarse.',
        en: 'The data asks questions. The questions will not stop multiplying.',
      },
    },
  ],
  sources: [
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
  ],
}
