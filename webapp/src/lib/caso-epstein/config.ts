import type { InvestigationClientConfig } from '../investigations/types'

export const config: InvestigationClientConfig = {
  casoSlug: 'caso-epstein',
  name: { es: 'Caso Epstein', en: 'Epstein Case' },
  description: {
    es: 'Investigacion basada en evidencia compilada de 4.153 vuelos, 1.044 documentos, 350+ personas verificadas y 31 organizaciones.',
    en: 'Evidence-based investigation compiled from 4,153 flights, 1,044 documents, 350+ verified persons, and 31 organizations.',
  },
  tabs: ['resumen', 'investigacion', 'grafo', 'cronologia', 'vuelos', 'evidencia', 'proximidad', 'simular'],
  features: {
    wallets: false,
    simulation: true,
    flights: true,
    submissions: false,
    platformGraph: false,
  },
  hero: {
    title: {
      es: 'La Red Epstein',
      en: 'The Epstein Network',
    },
    subtitle: {
      es: 'Como una sola relacion financiera construyo un imperio de trafico protegido por riqueza, poder y fracaso institucional. 7,287 nodos conectados, 21,944 aristas, 0 huerfanos, puntuacion de calidad 8.5/10.',
      en: 'How a single financial relationship built a trafficking empire shielded by wealth, power, and institutional failure. 7,287 connected nodes, 21,944 edges, 0 orphans, quality score 8.5/10.',
    },
  },
  chapters: [
    {
      id: 'the-machine',
      title: {
        es: 'I. La Maquina',
        en: 'I. The Machine',
      },
      paragraphs: [
        {
          es: 'Jeffrey Epstein construyo una operacion de trafico que se disfrazaba de negocio de asesoria financiera legitimo. En su apogeo entre 2000 y 2005, sus aviones volaron 264 veces en un solo ano, recorriendo un triangulo de propiedades — la mansion de Palm Beach, la townhouse de Manhattan y la isla Little St. James en las Islas Virgenes de EE.UU. El Boeing 727 "Lolita Express" (N908JE) realizo 939 vuelos documentados. Dos Gulfstream sumaron otros 1.300.',
          en: 'Jeffrey Epstein built a trafficking operation that masqueraded as a legitimate financial advisory business. At its peak between 2000 and 2005, his planes flew 264 times in a single year, shuttling between a triangle of properties — the Palm Beach mansion, the Manhattan townhouse, and Little St. James Island in the US Virgin Islands. The Boeing 727 "Lolita Express" (N908JE) made 939 documented flights. Two Gulfstream jets added another 1,300.',
        },
        {
          es: 'La operacion no era un show de un solo hombre. El grafo identifica 5 principales con relaciones FACILITATED_ABUSE: Epstein (1.345 conexiones), Ghislaine Maxwell (685), Sarah Kellen (211), Jean-Luc Brunel (59) y Virginia Giuffre (57, quien fue victima y, bajo coercion, facilitadora). Debajo de ellos, un equipo de pilotos, organizadores y administradores de propiedades mantenia la infraestructura en funcionamiento.',
          en: 'The operation was not a one-man show. The graph identifies 5 principals with FACILITATED_ABUSE relationships: Epstein (1,345 connections), Ghislaine Maxwell (685), Sarah Kellen (211), Jean-Luc Brunel (59), and Virginia Giuffre (57, who was both victim and, under coercion, facilitator). Below them, a staff of pilots, schedulers, and property managers kept the infrastructure running.',
        },
      ],
    },
    {
      id: 'the-money',
      title: {
        es: 'II. El Dinero',
        en: 'II. The Money',
      },
      paragraphs: [
        {
          es: 'La arquitectura financiera fue disenada para ocultar. Epstein controlaba 9+ empresas fantasma — Great St. Jim LLC, Plan D LLC, Hyperion Air Inc/LLC, JSC Interiors LLC, Financial Strategy Group Ltd, Southern Trust Company — cada una con una funcion especifica. Detras de estas habia 4 fideicomisos: el 1953 Trust (firmado 2 dias antes de su muerte, $577M+), el Insurance Trust, el Caterpillar Trust (donde Epstein era simultaneamente otorgante Y beneficiario), y el Haze Trust ($49.5M en Deutsche Bank para operaciones de arte de Leon Black).',
          en: 'The financial architecture was designed to obscure. Epstein controlled 9+ shell companies — Great St. Jim LLC, Plan D LLC, Hyperion Air Inc/LLC, JSC Interiors LLC, Financial Strategy Group Ltd, Southern Trust Company — each serving a specific function. Behind these sat 4 trust firewalls: the 1953 Trust (signed 2 days before his death, $577M+), the Insurance Trust, the Caterpillar Trust (where Epstein was simultaneously grantor AND beneficiary), and the Haze Trust ($49.5M at Deutsche Bank for Leon Black art deals).',
        },
        {
          es: 'Leslie Wexner transfirio aproximadamente $1.000 millones a traves de un poder notarial amplio (1987-2007). Leon Black de Apollo Global Management pago $170 millones en honorarios bidireccionales de "asesoria financiera" — el Senado determino que este dinero fue "usado para financiar operaciones de trafico." Deutsche Bank y JPMorgan Chase acordaron pagos combinados de $365 millones.',
          en: 'Leslie Wexner transferred approximately $1 billion through a sweeping power of attorney (1987-2007). Leon Black of Apollo Global Management paid $170 million in bidirectional "financial advice" fees — the Senate found this money was "used to finance trafficking operations." Deutsche Bank and JPMorgan Chase settled for a combined $365 million.',
        },
        {
          es: 'El objetivo forense mas importante es Darren K. Indyke — el abogado personal de Epstein que aparece en el Insurance Trust, el Caterpillar Trust 2, Deutsche Bank Y Hyperion Air. Tenia 17 conexiones en el grafo y controlaba los documentos del patrimonio. Richard D. Kahn, el contador y co-ejecutor del patrimonio, tenia 16 socios de comunicacion verificados, incluyendo a Bill Clinton, Noam Chomsky y Marvin Minsky.',
          en: 'The single most important forensic target is Darren K. Indyke — Epstein\'s personal lawyer who appears across the Insurance Trust, Caterpillar Trust 2, Deutsche Bank, AND Hyperion Air. He had 17 graph connections and controlled the estate documents. Richard D. Kahn, the accountant and estate co-executor, had 16 verified communication partners including Bill Clinton, Noam Chomsky, and Marvin Minsky.',
        },
      ],
    },
    {
      id: 'the-recruitment',
      title: {
        es: 'III. El Reclutamiento',
        en: 'III. The Recruitment',
      },
      paragraphs: [
        {
          es: 'Las victimas entraban a la red a traves de tres canales. El canal de modelaje: Epstein financio la agencia MC2 Model Management de Jean-Luc Brunel con $1 millon, patrocinando visas P-1 que hacian que el estatus legal de las modelos dependiera de la agencia. El canal de reclutamiento directo: Maxwell recluto a Virginia Giuffre del spa de Mar-a-Lago a los 16 anos. El canal de Europa del Este rastreo nombres como Kovylina, Malyshov y Marcinko a traves de un patron geografico.',
          en: 'Victims entered the network through three pipelines. The modeling pipeline: Epstein funded Jean-Luc Brunel\'s MC2 Model Management with $1 million, sponsoring P-1 visas that made models\' legal status dependent on the agency. The direct recruitment pipeline: Maxwell recruited Virginia Giuffre from the Mar-a-Lago spa at age 16. The Eastern European pipeline traced names like Kovylina, Malyshov, and Marcinko across a geographic pattern.',
        },
        {
          es: 'Sarah Kellen era la portera. Notas manuscritas firmadas por Kellen, recuperadas de la residencia de Palm Beach, contenian frases: "I have girls for him" y "I have 2 girls for him." El analisis de centralidad del grafo muestra que ella conectaba 10.367 pares de nodos que de otra manera no estarian conectados — 3 veces mas que cualquiera debajo de Epstein y Maxwell. Conecta 3 victimas con 4 financistas Y 4 academicos con 7 politicos. Nunca fue acusada.',
          en: 'Sarah Kellen was the gatekeeper. Handwritten notes signed by Kellen, recovered from the Palm Beach residence, contained phrases: "I have girls for him" and "I have 2 girls for him." Graph betweenness analysis shows she bridged 10,367 otherwise-unconnected pairs in the network — 3x more than anyone below Epstein and Maxwell. She connects 3 victims to 4 financiers AND 4 academics to 7 politicians. She was never charged.',
        },
      ],
    },
    {
      id: 'the-cover',
      title: {
        es: 'IV. La Cobertura — Canal Academico',
        en: 'IV. The Cover — Academic Pipeline',
      },
      paragraphs: [
        {
          es: 'Epstein dono $9.1 millones a Harvard, incluyendo $6.5M para el Programa de Dinamica Evolutiva de Martin Nowak. Nowak le dio a Epstein una oficina personal en su laboratorio durante 9 anos, lo visito mas de 40 veces despues de su condena. El MIT Media Lab recibio $525K a traves de Joi Ito. El personal llamaba a Epstein "Voldemort."',
          en: 'Epstein donated $9.1 million to Harvard, including $6.5M for Martin Nowak\'s Program for Evolutionary Dynamics. Nowak gave Epstein a personal office in his lab for 9 years, visited 40+ times post-conviction. MIT Media Lab received $525K through Joi Ito. Staff called Epstein "Voldemort."',
        },
        {
          es: 'Melanie Walker conecto sistematicamente a Epstein con el mundo cientifico/tecnologico — presentando a profesores de Caltech, luego a Boris Nikolic (quien presento a Gates), mientras ocupaba posiciones en la Fundacion Gates y el Banco Mundial. Conocio a Epstein circa 1992 en el Hotel Plaza — Donald Trump hizo la presentacion.',
          en: 'Melanie Walker systematically bridged Epstein to the science/tech world — introducing Caltech faculty, then Boris Nikolic (who introduced Gates), while holding positions at the Gates Foundation and World Bank. She met Epstein circa 1992 at the Plaza Hotel — Donald Trump made the introduction.',
        },
        {
          es: 'Bedford/Hanscom Field era la puerta de entrada: 170 vuelos, el tercer aeropuerto mas usado, a 20 millas de Harvard. Larry Summers volo de Bedford a St. Thomas para su luna de miel en diciembre de 2005 con Maxwell a bordo.',
          en: 'Bedford/Hanscom Field was the gateway: 170 flights, the third most-used airport, 20 miles from Harvard. Larry Summers flew Bedford to St. Thomas for his December 2005 honeymoon with Maxwell aboard.',
        },
      ],
    },
    {
      id: 'the-kompromat',
      title: {
        es: 'V. La Operacion Kompromat — Gates, Nikolic y Antonova',
        en: 'V. The Kompromat Operation — Gates, Nikolic, and Antonova',
      },
      paragraphs: [
        {
          es: 'La cadena de introduccion Walker-Nikolic-Gates esta documentada en archivos del DOJ: (1) Trump presento a Melanie Walker a Epstein (~1992). (2) Walker presento a Boris Nikolic a Epstein. (3) Nikolic presento a Gates a Epstein (primer encuentro 2011). (4) Nikolic tambien presento a Mila Antonova — una jugadora de ajedrez nacida en Rusia con quien Gates tenia una relacion extramatrimonial. (5) Epstein comenzo a pagarle a Antonova $7.000/mes a traves de las cuentas de Richard D. Kahn. (6) Epstein exigio reembolso a Gates — usando el conocimiento de una relacion privada como palanca financiera.',
          en: 'The Walker-Nikolic-Gates introduction chain is documented across DOJ files: (1) Trump introduced Melanie Walker to Epstein (~1992). (2) Walker introduced Boris Nikolic to Epstein. (3) Nikolic introduced Gates to Epstein (first meeting 2011). (4) Nikolic also introduced Mila Antonova — a Russian-born chess player with whom Gates was having an extramarital affair. (5) Epstein began paying Antonova $7,000/month through Richard D. Kahn\'s accounts. (6) Epstein demanded reimbursement from Gates — leveraging knowledge of a private affair as financial leverage.',
        },
        {
          es: 'Esto constituye una operacion de kompromat documentada: un tercero presentado al principal, puesto en nomina silenciosamente, y usado para extraer dinero y potencialmente obediencia. Nikolic fue nombrado ejecutor sucesor en el testamento de Epstein, firmado el 8 de agosto de 2019 — dos dias antes de la muerte de Epstein.',
          en: 'This constitutes a documented kompromat operation: a third party introduced to the principal, quietly placed on payroll, and used to extract money and potentially compliance. Nikolic was named successor executor in Epstein\'s will, signed August 8, 2019 — two days before Epstein\'s death.',
        },
      ],
    },
    {
      id: 'social-capital',
      title: {
        es: 'VI. Capital Social e Inteligencia',
        en: 'VI. Social Capital and Intelligence',
      },
      paragraphs: [
        {
          es: 'El Grupo MEGA, cofundado por Wexner y Charles Bronfman, era una organizacion secreta de ~50 empresarios adinerados que proporcionaba acceso a circulos de multimillonarios. En octubre de 1995, el presidente del CFR Leslie Gelb organizo un briefing privado de un dia de la CIA para Epstein con el Director John Deutch — confirmado en los archivos de la Universidad de Princeton.',
          en: 'The MEGA Group, co-founded by Wexner and Charles Bronfman, was a secret organization of ~50 wealthy businessmen providing access to billionaire circles. In October 1995, CFR president Leslie Gelb arranged a private daylong CIA briefing for Epstein with Director John Deutch — confirmed in Princeton University archives.',
        },
        {
          es: 'Carbyne — co-invertida por Nicole Junkermann ($500K), Epstein ($1M via Southern Trust) y Ehud Barak (presidente) — tenia un directorio que incluia a un ex director de la Unidad 8200, la direccion de inteligencia de senales de Israel. La combinacion de liderazgo de la Unidad 8200, capital de Epstein y acceso a datos policiales es estructuralmente consistente con una operacion de vigilancia y recopilacion de inteligencia.',
          en: 'Carbyne — co-invested by Nicole Junkermann ($500K), Epstein ($1M via Southern Trust), and Ehud Barak (chairman) — had a board that included a former director of Unit 8200, Israel\'s signals intelligence directorate. The combination of Unit 8200 leadership, Epstein capital, and law enforcement data access is structurally consistent with a surveillance and intelligence-gathering operation.',
        },
        {
          es: 'Durante la transicion de Trump 2016-2017, Alexander Acosta supuestamente dijo a los miembros del equipo de transicion que Epstein "pertenecia a la inteligencia" y que habia que "dejarlo en paz," citando que el asunto estaba "por encima de mi nivel salarial."',
          en: 'During the 2016-2017 Trump transition, Alexander Acosta reportedly told transition team members that Epstein "belonged to intelligence" and to "leave it alone," citing that the matter was "above my pay grade."',
        },
      ],
    },
    {
      id: 'the-legal-architecture',
      title: {
        es: 'VII. La Arquitectura Legal',
        en: 'VII. The Legal Architecture',
      },
      paragraphs: [
        {
          es: 'Alan Dershowitz negocio el Acuerdo de No Enjuiciamiento (NPA) de 2008 en nombre de Epstein. El acuerdo era estructuralmente extraordinario: otorgaba inmunidad federal no solo a Epstein sino a todos los "conspiradores nombrados y no nombrados." Esta disposicion general protegia al Core 4, a cualquier cliente nombrado y a cualquier participante no nombrado del enjuiciamiento federal.',
          en: 'Alan Dershowitz negotiated the 2008 Non-Prosecution Agreement on Epstein\'s behalf. The agreement was structurally extraordinary: it granted federal immunity not only to Epstein but to all "named and unnamed co-conspirators." This blanket provision shielded the Core 4, any named clients, and any unnamed participant from federal prosecution.',
        },
        {
          es: 'Dershowitz volo a las USVI en el avion de Epstein con Sarah Kellen en al menos una ocasion documentada. Virginia Giuffre acuso a Dershowitz en una demanda civil (despues retractada bajo circunstancias disputadas). Posteriormente se convirtio en un prominente defensor publico de Donald Trump. Trump nombro a Alexander Acosta como Secretario de Trabajo en 2017.',
          en: 'Dershowitz flew to the USVI on Epstein\'s plane with Sarah Kellen on at least one documented occasion. Virginia Giuffre alleged Dershowitz in a civil complaint (later retracted under disputed circumstances). He subsequently became a prominent public defender of Donald Trump. Trump appointed Alexander Acosta as Secretary of Labor in 2017.',
        },
      ],
    },
    {
      id: 'the-flight-patterns',
      title: {
        es: 'VIII. Los Patrones de Vuelo',
        en: 'VIII. The Flight Patterns',
      },
      paragraphs: [
        {
          es: 'Pre-condena (2000-2008): 1.565 vuelos (196/ano). Post-condena (2008-2019): 945 vuelos (86/ano) — la operacion continuo al 44% de capacidad. Lo mas condenatorio: los vuelos a USVI AUMENTARON de 29 (2004) a 69 (2007) durante la investigacion del FBI.',
          en: 'Pre-conviction (2000-2008): 1,565 flights (196/year). Post-conviction (2008-2019): 945 flights (86/year) — the operation continued at 44% capacity. Most damning: USVI flights INCREASED from 29 (2004) to 69 (2007) during the FBI investigation.',
        },
        {
          es: 'El viaje a Africa de 2002 incluyo a Bill Clinton, Kevin Spacey, Ron Tucker, Sarah Kellen y Chauntae Davies (masajista/victima). Los documentos de victimas del FBI describen: una joven de 14 anos que visito a Epstein mas de 100 veces; una testigo chilena que reporto que Trump hablo por altavoz durante una sesion de Epstein; y una masajista que describio haberle dado un masaje de pies a Trump por indicacion de Epstein.',
          en: 'The 2002 Africa trip included Bill Clinton, Kevin Spacey, Ron Tucker, Sarah Kellen, and Chauntae Davies (massage therapist/victim). FBI victim documents describe: a 14-year-old who visited Epstein 100+ times; a Chilean witness who reported Trump speaking on speakerphone during an Epstein session; and a massage therapist who described giving Trump a foot massage at Epstein\'s direction.',
        },
      ],
    },
    {
      id: 'the-abuse-chains',
      title: {
        es: 'IX. Las Cadenas de Abuso — Victimas y Financistas Documentados',
        en: 'IX. The Abuse Chains — Documented Victims and Financiers',
      },
      paragraphs: [
        {
          es: 'La cadena de abuso documentada mas completa proviene de Virginia Giuffre. Ghislaine Maxwell recluto a Giuffre de Mar-a-Lago, la entreno como "masajista," la ofrecio como regalo al Principe Andrew. Glenn Dubin — nodo de triple capa: pago a Epstein $15M como corredor financiero, nombro a Epstein padrino de su hija, y Giuffre lo nombro en testimonio jurado como abusador.',
          en: 'The most complete documented abuse chain runs from Virginia Giuffre. Ghislaine Maxwell recruited Giuffre from Mar-a-Lago, trained her as a "masseuse," arranged her as a gift to Prince Andrew. Glenn Dubin — triple-layer node: paid Epstein $15M as a financial broker, named Epstein godfather to his daughter, and Giuffre named him in sworn testimony as an abuser.',
        },
        {
          es: 'Jes Staley — ejecutivo de JPMorgan que manejo la cuenta de Epstein, envio 1.100 emails, visito la isla en 2009 mientras Epstein cumplia su condena; la FCA le prohibio permanentemente la actividad bancaria en 2025. Leon Black — pago $170M; el Senado determino que el dinero "financio operaciones de trafico." Leslie Wexner — transfirio ~$1.000M; confirmo haber visitado Little St. James en su declaracion ante el Congreso de 2026.',
          en: 'Jes Staley — JPMorgan executive who managed the Epstein account, sent 1,100 emails, visited the island in 2009 while Epstein was serving his sentence; FCA permanently banned from banking in 2025. Leon Black — paid $170M; Senate found the money "financed trafficking operations." Leslie Wexner — transferred ~$1B; confirmed visiting Little St. James in his 2026 Congressional deposition.',
        },
      ],
    },
    {
      id: 'the-silence',
      title: {
        es: 'X. El Silencio',
        en: 'X. The Silence',
      },
      paragraphs: [
        {
          es: 'El NPA de 2008 — negociado por Acosta con Dershowitz — otorgo inmunidad al Core 4 y sello la evidencia. Siguio un agujero negro de 5 anos (2010-2015) sin ningun evento legal mientras Epstein se reconstruia al 50% de capacidad.',
          en: 'The 2008 NPA — negotiated by Acosta with Dershowitz — gave immunity to the Core 4 and sealed the evidence. A 5-year black hole followed (2010-2015) with zero legal events while Epstein rebuilt to 50% capacity.',
        },
        {
          es: 'El silencio fue roto por la investigacion de Julie K. Brown en el Miami Herald (noviembre de 2018), que llevo al arresto de 2019, la muerte de Epstein (con la guardia Tovah Noel acusada de falsificacion de registros) y la condena de Maxwell en 2021.',
          en: 'The silence was broken by Julie K. Brown\'s Miami Herald investigation (November 2018), leading to the 2019 arrest, Epstein\'s death (with guard Tovah Noel charged with falsifying records), and the 2021 Maxwell conviction.',
        },
      ],
    },
    {
      id: 'the-reckoning',
      title: {
        es: 'XI. El Ajuste de Cuentas',
        en: 'XI. The Reckoning',
      },
      paragraphs: [
        {
          es: 'Desclasificacion de documentos (enero 2024). Ley de Transparencia de Archivos Epstein (noviembre 2025). Publicaciones del DOJ totalizando 3.5 millones de paginas. Principe Andrew arrestado (febrero 2026). Peter Mandelson arrestado. Thorbjorn Jagland acusado de corrupcion agravada. Acuerdos financieros superiores a $470 millones.',
          en: 'Document unsealing (January 2024). Epstein Files Transparency Act (November 2025). DOJ releases totaling 3.5 million pages. Prince Andrew arrested (February 2026). Peter Mandelson arrested. Thorbjorn Jagland charged with aggravated corruption. Financial settlements exceeding $470 million.',
        },
        {
          es: 'Virginia Giuffre, la acusadora mas prominente, murio por suicidio el 25 de abril de 2025, a los 41 anos. Habia logrado mas cambio sistemico que todo el sistema de justicia combinado: reforma de NDA, extension de plazos de prescripcion, declaraciones de impacto de victimas obligatorias y revision de diligencia debida corporativa.',
          en: 'Virginia Giuffre, the most prominent accuser, died by suicide on April 25, 2025, at age 41. She had achieved more systemic change than the entire justice system combined: NDA reform, statute of limitations tolling, mandatory victim impact statements, and corporate due diligence overhaul.',
        },
      ],
    },
    {
      id: 'what-remains',
      title: {
        es: 'XII. Lo Que Queda',
        en: 'XII. What Remains',
      },
      paragraphs: [
        {
          es: '7.287 nodos conectados. 21.944 aristas. 4.153 vuelos. 350+ personas verificadas. 1.044 documentos. Pero: el 99,6% de los vuelos carecen de nombres de pasajeros. El Insurance Trust y el Caterpillar Trust nunca han sido auditados forensemente. La respuesta Glomar de la CIA no esta resuelta. 20+ personas de alto perfil necesitan enriquecimiento de relaciones. Los registros financieros de Darren K. Indyke son la unica llave que desarmaria la arquitectura.',
          en: '7,287 connected nodes. 21,944 edges. 4,153 flights. 350+ verified persons. 1,044 documents. But: 99.6% of flights lack passenger names. The Insurance Trust and Caterpillar Trust have never been forensically audited. The CIA\'s Glomar response is unresolved. 20+ high-profile persons need relationship enrichment. Darren K. Indyke\'s financial records are the single key that would unravel the architecture.',
        },
        {
          es: 'Boris Nikolic sigue siendo el arquitecto no acusado mas significativo: ejecutor nombrado, intermediario de la cadena de kompromat, puente hacia Gates e inversor en biotecnologia en emprendimientos post-Epstein. Nunca ha sido citado a declarar ni acusado. La investigacion continua.',
          en: 'Boris Nikolic remains the most significant uncharged architect: named executor, kompromat chain intermediary, Gates bridge, and biotech investor across post-Epstein ventures. He has never been deposed or charged. The investigation continues.',
        },
      ],
    },
  ],
  sources: [
    { name: 'rhowardstone/Epstein-research-data — DOJ flight logs', url: 'https://github.com/rhowardstone/Epstein-research-data' },
    { name: 'Epstein Exposed API', url: 'https://epstein.exposed' },
    { name: 'dleerdefi/epstein-network-data — Handwritten pilot logbooks', url: 'https://github.com/dleerdefi/epstein-network-data' },
    { name: 'DOJ file releases (2025-2026)', url: 'https://www.justice.gov' },
    { name: 'Fortune — Epstein coverage', url: 'https://fortune.com' },
    { name: 'Daily Beast — Epstein investigation', url: 'https://www.thedailybeast.com' },
    { name: 'Wall Street on Parade', url: 'https://wallstreetonparade.com' },
    { name: 'Jack Poulson/Substack — Carbyne analysis', url: 'https://jackpoulson.substack.com' },
    { name: 'Epstein Web Tracker', url: 'https://epstein.flights' },
    { name: 'Senate Finance Committee', url: 'https://www.finance.senate.gov' },
    { name: 'FCA — Jes Staley ruling', url: 'https://www.fca.org.uk' },
  ],
}
