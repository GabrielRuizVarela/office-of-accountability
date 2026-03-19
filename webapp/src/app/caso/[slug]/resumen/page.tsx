'use client'

/**
 * Caso Epstein — Narrative summary page.
 *
 * An 11-chapter long-form bilingual investigative journalism piece that walks
 * readers through the complete story of the Epstein network, compiled from
 * 198 knowledge graph nodes and 431 documented relationships.
 */

import { useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Lang = 'en' | 'es'

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
  en: 'The Epstein Network: A Cohesive History Based on Evidence',
  es: 'La Red Epstein: Una Historia Cohesiva Basada en Evidencia',
}

const SUBTITLE: Record<Lang, string> = {
  en: 'How a single financial relationship built a trafficking empire shielded by wealth, power, and institutional failure',
  es: 'Como una sola relacion financiera construyo un imperio de trafico protegido por riqueza, poder y fracaso institucional',
}

const READING_TIME: Record<Lang, string> = {
  en: '~25 min read',
  es: '~25 min de lectura',
}

const LAST_UPDATED: Record<Lang, string> = {
  en: 'Last updated: March 2026',
  es: 'Actualizado: marzo 2026',
}

const COMPILED_FROM: Record<Lang, string> = {
  en: 'Compiled from 198 knowledge graph nodes, 431 documented relationships, 44 YouTube transcripts, and verified web research. Every claim is sourced from court records, congressional testimony, DOJ file releases, or verified investigative reporting.',
  es: 'Compilado a partir de 198 nodos del grafo de conocimiento, 431 relaciones documentadas, 44 transcripciones de YouTube e investigacion web verificada. Cada afirmacion proviene de registros judiciales, testimonios ante el Congreso, archivos del DOJ o periodismo de investigacion verificado.',
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const chapters: readonly Chapter[] = [
  {
    id: 'the-origin',
    title: {
      en: 'I. The Origin (1987–2001)',
      es: 'I. El Origen (1987–2001)',
    },
    paragraphs: {
      en: [
        'The Jeffrey Epstein story begins not with a crime, but with a relationship. In 1987, Leslie Wexner — founder of L Brands and one of America\'s wealthiest men — hired an obscure former math teacher named Jeffrey Epstein as his financial manager. [1] By 1991, Wexner had granted Epstein full power of attorney over his finances, giving him unfettered control over billions of dollars in assets.',
        'This single relationship is the origin of everything that followed.',
        'During the 11 years of the power of attorney (1991–2001), Epstein acquired the properties that would become the infrastructure of his operation: the 9 East 71st Street townhouse in Manhattan (transferred from Wexner for approximately $34 million), the Palm Beach mansion at 358 El Brillo Way, the Zorro Ranch in New Mexico, Little St. James Island in the US Virgin Islands, and the Paris apartment on Avenue Foch. [2] Each property would serve a specific function in the network\'s architecture.',
        'When the power of attorney was revoked in 2001, Epstein had already built the financial foundation. The question that remains unanswered — and that Congress confronted Wexner about in his February 2026 deposition [3] — is how much of this wealth was legitimately earned versus siphoned. Congressman Robert Garcia stated that approximately $1 billion was transferred to Epstein. Wexner claimed he was "duped by a world-class con man." Democrats on the committee formally accused him of lying.',
      ],
      es: [
        'La historia de Jeffrey Epstein no comienza con un crimen, sino con una relacion. En 1987, Leslie Wexner — fundador de L Brands y uno de los hombres mas ricos de Estados Unidos — contrato a un oscuro ex profesor de matematicas llamado Jeffrey Epstein como su administrador financiero. [1] Para 1991, Wexner le habia otorgado a Epstein un poder notarial completo sobre sus finanzas, dandole control absoluto sobre miles de millones de dolares en activos.',
        'Esta unica relacion es el origen de todo lo que siguio.',
        'Durante los 11 anos del poder notarial (1991–2001), Epstein adquirio las propiedades que se convertirian en la infraestructura de su operacion: la residencia de 9 East 71st Street en Manhattan (transferida de Wexner por aproximadamente $34 millones), la mansion de Palm Beach en 358 El Brillo Way, el Rancho Zorro en Nuevo Mexico, la isla Little St. James en las Islas Virgenes de EE.UU. y el apartamento de Paris en Avenue Foch. [2] Cada propiedad cumpliria una funcion especifica en la arquitectura de la red.',
        'Cuando el poder notarial fue revocado en 2001, Epstein ya habia construido la base financiera. La pregunta que sigue sin respuesta — y que el Congreso le planteo a Wexner en su deposicion de febrero de 2026 [3] — es cuanto de esta riqueza fue legitimamente ganada versus desviada. El congresista Robert Garcia declaro que aproximadamente $1.000 millones fueron transferidos a Epstein. Wexner afirmo que fue "enganado por un estafador de clase mundial." Los democratas del comite lo acusaron formalmente de mentir.',
      ],
    },
    pullQuote: {
      en: '"Approximately $1 billion was transferred to Epstein. Wexner claimed he was duped. Democrats accused him of lying."',
      es: '"Aproximadamente $1.000 millones fueron transferidos a Epstein. Wexner afirmo que fue enganado. Los democratas lo acusaron de mentir."',
    },
    citations: [
      { id: 1, text: 'Wexner–Epstein financial relationship', url: 'https://www.nytimes.com/2019/07/25/business/jeffrey-epstein-wexner-victorias-secret.html' },
      { id: 2, text: 'Epstein property acquisitions — court filings, Giuffre v. Maxwell unsealed documents (Jan 2024)' },
      { id: 3, text: 'Congressional hearing — Wexner deposition, Feb 18, 2026', url: 'https://www.congress.gov' },
    ],
  },
  {
    id: 'the-machine',
    title: {
      en: 'II. The Machine (1999–2005)',
      es: 'II. La Maquina (1999–2005)',
    },
    paragraphs: {
      en: [
        'The Epstein network was not a conventional criminal enterprise. It operated through a 10-layer protection architecture that made it nearly invisible to institutional oversight.',
        'The recruitment pipeline ran through the Palm Beach community, targeting young women from families experiencing financial strain despite living in an affluent area. [4] The Palm Beach Police investigation would later trace a referral chain beginning with a single 14-year-old victim. Each victim, once integrated, became social proof that the environment was safe, lowering the resistance of the next recruit.',
        'The modeling pipeline ran through Jean-Luc Brunel\'s MC2 Model Management in Paris, funded by Epstein. Brunel used the agency to identify and transport vulnerable young women under the cover of "auditions" and "photo shoots." [5] His flight logs documented him personally flying victims to Epstein\'s residences.',
        'The logistics relied on private aviation — specifically, Epstein\'s Boeing 727 (the "Lolita Express") and other aircraft piloted by Larry Visoski. [6] Private jets had minimal passenger screening, no TSA checks, and limited manifest requirements. Victims were listed as "staff" or "nannies" on passenger manifests.',
        'Ghislaine Maxwell was the operational co-architect. Our graph analysis reveals she maintained 22 connections — structurally independent of Epstein. [7] When we simulated removing Epstein from the graph, Maxwell held 11 of the remaining 14 persons together as a connected network. She was not merely his proxy; she was an independent hub who managed recruitment, logistics, and the social calendar that provided cover.',
      ],
      es: [
        'La red Epstein no era una empresa criminal convencional. Operaba a traves de una arquitectura de proteccion de 10 capas que la hacia casi invisible para la supervision institucional.',
        'El conducto de reclutamiento pasaba por la comunidad de Palm Beach, dirigido a mujeres jovenes de familias con dificultades financieras a pesar de vivir en una zona acomodada. [4] La investigacion de la Policia de Palm Beach rastrearia mas tarde una cadena de referidos que comenzaba con una sola victima de 14 anos. Cada victima, una vez integrada, se convertia en prueba social de que el entorno era seguro, reduciendo la resistencia de la siguiente recluta.',
        'El conducto de modelaje pasaba por MC2 Model Management de Jean-Luc Brunel en Paris, financiada por Epstein. Brunel usaba la agencia para identificar y transportar mujeres jovenes vulnerables bajo la cobertura de "audiciones" y "sesiones de fotos." [5] Sus registros de vuelo documentaban que el personalmente transportaba victimas a las residencias de Epstein.',
        'La logistica dependia de la aviacion privada — especificamente, el Boeing 727 de Epstein (el "Lolita Express") y otras aeronaves pilotadas por Larry Visoski. [6] Los jets privados tenian minimo control de pasajeros, sin controles de TSA y requisitos limitados de manifiesto. Las victimas figuraban como "personal" o "nineras" en los manifiestos de pasajeros.',
        'Ghislaine Maxwell fue la co-arquitecta operativa. Nuestro analisis de grafos revela que mantenia 22 conexiones — estructuralmente independientes de Epstein. [7] Cuando simulamos eliminar a Epstein del grafo, Maxwell mantenia unidos a 11 de las 14 personas restantes como una red conectada. No era simplemente su representante; era un nodo independiente que gestionaba reclutamiento, logistica y el calendario social que proporcionaba cobertura.',
      ],
    },
    pullQuote: {
      en: '"When we simulated removing Epstein from the graph, Maxwell held 11 of the remaining 14 persons together. She was not merely his proxy."',
      es: '"Cuando simulamos eliminar a Epstein del grafo, Maxwell mantenia unidos a 11 de las 14 personas restantes. No era simplemente su representante."',
    },
    citations: [
      { id: 4, text: 'Palm Beach Police investigation — probable cause affidavit, 2005', url: 'https://www.miamiherald.com/topics/jeffrey-epstein' },
      { id: 5, text: 'Brunel–MC2 connection — French prosecution case file; Giuffre deposition', url: 'https://www.courtlistener.com' },
      { id: 6, text: 'FAA flight logs — DOJ Epstein Files Phase 1, Dec 19, 2025', url: 'https://www.justice.gov' },
      { id: 7, text: 'ORC knowledge graph analysis — 198 nodes, 431 relationships' },
    ],
  },
  {
    id: 'the-shield',
    title: {
      en: 'III. The Shield (2005–2008)',
      es: 'III. El Escudo (2005–2008)',
    },
    paragraphs: {
      en: [
        'In March 2005, the Palm Beach Police Department began investigating Epstein following complaints from parents. [8] The investigation was competent — they traced the victim referral chain and built a case. In 2006, the FBI launched a federal investigation. In 2007, a Florida grand jury returned an indictment.',
        'Then the system broke.',
        'US Attorney Alexander Acosta negotiated a non-prosecution agreement (NPA) with Epstein\'s defense team, led by Alan Dershowitz. [9] The deal was extraordinary: Epstein pleaded guilty to state charges of soliciting prostitution (not trafficking), served 13 months in county jail with work release (allowing him to leave 6 days a week), and in exchange, all potential federal charges against Epstein and unnamed co-conspirators were dropped. Sarah Kellen and Nadia Marcinko — both named as potential co-conspirators — were granted immunity.',
        'Acosta reportedly later told the Trump transition team that he had been told to back off the case because Epstein "belonged to intelligence" and the matter was "above my pay grade." [10] This claim has never been verified or denied by any intelligence agency.',
        'The NPA created a legal immunity shield that would protect the network for 11 years. Combined with NDAs imposed on victims through civil settlements, and employment NDAs binding staff, the network had constructed a three-layer silence architecture: prosecution silence, victim silence, staff silence.',
      ],
      es: [
        'En marzo de 2005, el Departamento de Policia de Palm Beach comenzo a investigar a Epstein tras denuncias de padres. [8] La investigacion fue competente — rastrearon la cadena de referidos de victimas y construyeron un caso. En 2006, el FBI lanzo una investigacion federal. En 2007, un gran jurado de Florida emitio una acusacion formal.',
        'Entonces el sistema se quebro.',
        'El fiscal federal Alexander Acosta negocio un acuerdo de no enjuiciamiento (NPA) con el equipo de defensa de Epstein, liderado por Alan Dershowitz. [9] El acuerdo fue extraordinario: Epstein se declaro culpable de cargos estatales de solicitar prostitucion (no trafico), cumplio 13 meses en la carcel del condado con permiso de trabajo (permitiendole salir 6 dias a la semana), y a cambio, todos los posibles cargos federales contra Epstein y co-conspiradores no identificados fueron retirados. Sarah Kellen y Nadia Marcinko — ambas nombradas como posibles co-conspiradoras — recibieron inmunidad.',
        'Segun se informo, Acosta le dijo mas tarde al equipo de transicion de Trump que le habian dicho que se alejara del caso porque Epstein "pertenecia a inteligencia" y el asunto "estaba por encima de mi nivel de pago." [10] Esta afirmacion nunca ha sido verificada ni desmentida por ninguna agencia de inteligencia.',
        'El NPA creo un escudo de inmunidad legal que protegeria a la red durante 11 anos. Combinado con los acuerdos de confidencialidad (NDA) impuestos a las victimas a traves de acuerdos civiles, y los NDA laborales que vinculaban al personal, la red habia construido una arquitectura de silencio de tres capas: silencio judicial, silencio de victimas, silencio del personal.',
      ],
    },
    pullQuote: {
      en: '"Epstein belonged to intelligence. The matter was above my pay grade." — attributed to Alexander Acosta',
      es: '"Epstein pertenecia a inteligencia. El asunto estaba por encima de mi nivel de pago." — atribuido a Alexander Acosta',
    },
    citations: [
      { id: 8, text: 'Palm Beach PD case file — "Perversion of Justice," Miami Herald', url: 'https://www.miamiherald.com/topics/jeffrey-epstein' },
      { id: 9, text: 'Non-prosecution agreement — US v. Epstein, SDFL Case No. 08-8099', url: 'https://www.courtlistener.com' },
      { id: 10, text: 'Acosta "belonged to intelligence" claim — Daily Beast, Vicky Ward report (2019)' },
    ],
  },
  {
    id: 'the-silence',
    title: {
      en: 'IV. The Silence (2008–2018)',
      es: 'IV. El Silencio (2008–2018)',
    },
    paragraphs: {
      en: [
        'For ten years after the plea deal, the Epstein network operated with virtual impunity. Every institutional check failed.',
        'JPMorgan Chase continued banking Epstein until 2013, ignoring compliance red flags and processing billions in suspicious transactions. [11] Internal emails later revealed that senior executive Jes Staley maintained a close personal relationship with Epstein — 1,100 emails between 2008 and 2012, in which Staley called Epstein "one of my most cherished friends." [12] Staley even visited Little St. James Island in 2009 while Epstein was serving his prison sentence — proving the operation continued without its principal.',
        'When JPMorgan finally dropped Epstein in 2013, Deutsche Bank immediately took him on as a client — a convicted sex offender that America\'s largest bank had just terminated. [13] No inter-bank alert system existed to prevent this "bank shopping."',
        'Leon Black, co-founder of Apollo Global Management, paid Epstein approximately $170 million between 2012 and 2017 — a figure corrected upward by the Senate Finance Committee in March 2025, which also found evidence that the money was "used to finance Epstein\'s sex trafficking operations." [14] Black has not been charged with any crime.',
        'The silence was maintained not through conspiracy but through a Nash equilibrium of mutual complicity. Every actor in the network — from the banker to the attorney to the politician to the victim — had a rational incentive to stay silent. Speaking would destroy the equilibrium for everyone, including the speaker.',
      ],
      es: [
        'Durante diez anos despues del acuerdo judicial, la red Epstein opero con impunidad virtual. Todos los controles institucionales fallaron.',
        'JPMorgan Chase continuo como banco de Epstein hasta 2013, ignorando alertas de cumplimiento y procesando miles de millones en transacciones sospechosas. [11] Correos internos revelaron mas tarde que el ejecutivo senior Jes Staley mantenia una estrecha relacion personal con Epstein — 1.100 correos electronicos entre 2008 y 2012, en los que Staley llamaba a Epstein "uno de mis amigos mas queridos." [12] Staley incluso visito la isla Little St. James en 2009 mientras Epstein cumplia su condena — probando que la operacion continuaba sin su principal.',
        'Cuando JPMorgan finalmente dejo a Epstein en 2013, Deutsche Bank inmediatamente lo acepto como cliente — un delincuente sexual convicto que el banco mas grande de Estados Unidos acababa de desvincular. [13] No existia ningun sistema de alerta interbancaria para prevenir este "shopping bancario."',
        'Leon Black, cofundador de Apollo Global Management, pago a Epstein aproximadamente $170 millones entre 2012 y 2017 — una cifra corregida al alza por el Comite de Finanzas del Senado en marzo de 2025, que tambien encontro evidencia de que el dinero fue "usado para financiar las operaciones de trafico sexual de Epstein." [14] Black no ha sido acusado de ningun delito.',
        'El silencio se mantuvo no a traves de una conspiracion sino a traves de un equilibrio de Nash de complicidad mutua. Cada actor en la red — desde el banquero hasta el abogado, el politico y la victima — tenia un incentivo racional para guardar silencio. Hablar destruiria el equilibrio para todos, incluido el que hablara.',
      ],
    },
    pullQuote: {
      en: '"1,100 emails. Staley called Epstein one of my most cherished friends — and visited the island while Epstein was in prison."',
      es: '"1.100 correos electronicos. Staley llamaba a Epstein uno de mis amigos mas queridos — y visito la isla mientras Epstein estaba en prision."',
    },
    citations: [
      { id: 11, text: 'USVI v. JPMorgan Chase — $290M settlement, banking facilitation claims', url: 'https://www.courtlistener.com' },
      { id: 12, text: 'UK Financial Conduct Authority — Staley investigation, permanent banking ban (June 2025)' },
      { id: 13, text: 'Deutsche Bank $75M settlement — NY Dept. of Financial Services (2020)' },
      { id: 14, text: 'Senate Finance Committee — Leon Black investigation report, March 2025', url: 'https://www.finance.senate.gov' },
    ],
  },
  {
    id: 'the-break',
    title: {
      en: 'V. The Break (2018–2019)',
      es: 'V. La Ruptura (2018–2019)',
    },
    paragraphs: {
      en: [
        'In November 2018, Julie K. Brown of the Miami Herald published "Perversion of Justice," a three-part investigative series that reignited the case. [15] She identified nearly 80 victims and exposed the mechanics of the 2008 plea deal.',
        'Brown succeeded where every institution had failed because she was the only actor with no stake in the network. She was an external force that broke the Nash equilibrium by making silence more costly than speech. She used public records — flight logs, court filings, property records — the same data that had been available for a decade but that no one with institutional power had been willing to analyze.',
        'On July 6, 2019, Jeffrey Epstein was arrested by the FBI-NYPD Crimes Against Children Task Force at Teterboro Airport. [16] Two days later, a federal indictment was unsealed in the Southern District of New York charging him with sex trafficking of minors.',
        'When FBI agents raided his NYC townhouse, they found a locked safe. Using a saw to open it, they discovered CDs labeled with handwritten names, hard drives, diamonds, and a foreign passport under a false name. [17] But the initial warrant was too narrow — it did not permit seizing electronic media. The agents left the CDs and hard drives on top of the safe. When they returned with a broader warrant, the items were gone. Epstein\'s attorney Richard Kahn arrived at the FBI office "minutes later" with two suitcases containing the items. Whether they were tampered with during the gap remains one of the case\'s most significant unanswered questions.',
      ],
      es: [
        'En noviembre de 2018, Julie K. Brown del Miami Herald publico "Perversion of Justice," una serie investigativa de tres partes que reavivar el caso. [15] Identifico casi 80 victimas y expuso la mecanica del acuerdo judicial de 2008.',
        'Brown tuvo exito donde todas las instituciones habian fallado porque era la unica actora sin intereses en la red. Fue una fuerza externa que rompio el equilibrio de Nash haciendo que el silencio fuera mas costoso que hablar. Uso registros publicos — bitacoras de vuelo, expedientes judiciales, registros de propiedad — los mismos datos que habian estado disponibles durante una decada pero que nadie con poder institucional habia estado dispuesto a analizar.',
        'El 6 de julio de 2019, Jeffrey Epstein fue arrestado por el Grupo de Trabajo de Crimenes contra Menores FBI-NYPD en el aeropuerto de Teterboro. [16] Dos dias despues, una acusacion federal fue revelada en el Distrito Sur de Nueva York acusandolo de trafico sexual de menores.',
        'Cuando agentes del FBI allanaron su residencia en NYC, encontraron una caja fuerte cerrada. Usando una sierra para abrirla, descubrieron CDs con nombres escritos a mano, discos duros, diamantes y un pasaporte extranjero con nombre falso. [17] Pero la orden inicial era demasiado limitada — no permitia incautar medios electronicos. Los agentes dejaron los CDs y discos duros sobre la caja fuerte. Cuando regresaron con una orden mas amplia, los objetos habian desaparecido. El abogado de Epstein, Richard Kahn, llego a la oficina del FBI "minutos despues" con dos maletas conteniendo los objetos. Si fueron manipulados durante el intervalo sigue siendo una de las preguntas mas significativas sin respuesta del caso.',
      ],
    },
    pullQuote: {
      en: '"Julie K. Brown succeeded because she was the only actor with no stake in the network."',
      es: '"Julie K. Brown tuvo exito porque era la unica actora sin intereses en la red."',
    },
    citations: [
      { id: 15, text: '"Perversion of Justice" — Julie K. Brown, Miami Herald (Nov 2018)', url: 'https://www.miamiherald.com/topics/jeffrey-epstein' },
      { id: 16, text: 'US v. Epstein — SDNY indictment, Case 1:19-cr-00490 (Jul 2019)', url: 'https://www.courtlistener.com' },
      { id: 17, text: 'FBI safe seizure — SDNY bail hearing transcript; DOJ evidence inventory' },
    ],
  },
  {
    id: 'the-deaths',
    title: {
      en: 'VI. The Deaths (2019–2022)',
      es: 'VI. Las Muertes (2019–2022)',
    },
    paragraphs: {
      en: [
        'On August 10, 2019, Jeffrey Epstein was found dead in his cell at the Metropolitan Correctional Center in Manhattan. [18] The medical examiner ruled it a suicide by hanging. The circumstances were immediately controversial: two guards had been sleeping and shopping online instead of conducting required 30-minute checks, the surveillance cameras outside his cell malfunctioned, and Epstein had been taken off suicide watch just days earlier. [19]',
        'On February 19, 2022, Jean-Luc Brunel — the modeling agent who had been charged in France for sexual assaults on minors — was found dead in his Paris prison cell while awaiting trial. [20] His death mirrored Epstein\'s: a key witness who could have mapped the European dimension of the network, dead in custody before he could testify.',
        'The two people with the most comprehensive knowledge of the network\'s global operations — its American architect and its European logistics coordinator — both died in custody before trial. Whether murder or negligence, the systemic effect is identical: their testimony is permanently lost.',
      ],
      es: [
        'El 10 de agosto de 2019, Jeffrey Epstein fue encontrado muerto en su celda en el Centro Correccional Metropolitano de Manhattan. [18] El medico forense dictamino suicidio por ahorcamiento. Las circunstancias fueron inmediatamente controvertidas: dos guardias habian estado durmiendo y comprando en linea en lugar de realizar las rondas requeridas cada 30 minutos, las camaras de vigilancia fuera de su celda fallaron, y a Epstein le habian retirado la vigilancia de suicidio pocos dias antes. [19]',
        'El 19 de febrero de 2022, Jean-Luc Brunel — el agente de modelos acusado en Francia por agresiones sexuales contra menores — fue encontrado muerto en su celda de prision en Paris mientras esperaba juicio. [20] Su muerte reflejo la de Epstein: un testigo clave que podria haber mapeado la dimension europea de la red, muerto bajo custodia antes de poder testificar.',
        'Las dos personas con el conocimiento mas completo de las operaciones globales de la red — su arquitecto estadounidense y su coordinador logistico europeo — murieron bajo custodia antes del juicio. Ya sea asesinato o negligencia, el efecto sistemico es identico: su testimonio se perdio permanentemente.',
      ],
    },
    pullQuote: {
      en: '"The two people who knew the most about the network\'s global operations both died in custody before trial."',
      es: '"Las dos personas que mas sabian sobre las operaciones globales de la red murieron bajo custodia antes del juicio."',
    },
    citations: [
      { id: 18, text: 'NYC Chief Medical Examiner — Epstein death ruling (Aug 2019)' },
      { id: 19, text: 'US v. Noel & Thomas — MCC guard deferred prosecution agreement', url: 'https://www.courtlistener.com' },
      { id: 20, text: 'Brunel death — French prosecution statement, Paris (Feb 2022)' },
    ],
  },
  {
    id: 'the-reckoning',
    title: {
      en: 'VII. The Reckoning (2020–2024)',
      es: 'VII. El Ajuste de Cuentas (2020–2024)',
    },
    paragraphs: {
      en: [
        'On July 2, 2020, Ghislaine Maxwell was arrested at her home in Bradford, New Hampshire. [21] Her trial began in November 2021. On December 29, the jury found her guilty on five of six counts, including sex trafficking of a minor. She was sentenced to 20 years in prison. [22]',
        'Maxwell\'s conviction established the factual foundation that enabled all subsequent civil cases. Without it, the civil lawsuits against Prince Andrew, JPMorgan, and Deutsche Bank lacked the necessary predicate of "knowledge." Her conviction was the lynchpin.',
      ],
      es: [
        'El 2 de julio de 2020, Ghislaine Maxwell fue arrestada en su casa en Bradford, New Hampshire. [21] Su juicio comenzo en noviembre de 2021. El 29 de diciembre, el jurado la declaro culpable de cinco de seis cargos, incluyendo trafico sexual de una menor. Fue sentenciada a 20 anos de prision. [22]',
        'La condena de Maxwell establecio la base factual que habilito todas las demandas civiles posteriores. Sin ella, las demandas civiles contra el Principe Andrew, JPMorgan y Deutsche Bank carecian del requisito previo necesario de "conocimiento." Su condena fue la pieza clave.',
      ],
    },
    pullQuote: {
      en: '"Maxwell\'s conviction was the lynchpin — without it, every civil lawsuit lacked the necessary predicate."',
      es: '"La condena de Maxwell fue la pieza clave — sin ella, cada demanda civil carecia del requisito previo necesario."',
    },
    citations: [
      { id: 21, text: 'Maxwell arrest — FBI press release, Jul 2, 2020' },
      { id: 22, text: 'US v. Ghislaine Maxwell — SDNY Case 1:20-cr-00330, verdict Dec 29, 2021', url: 'https://www.courtlistener.com' },
    ],
  },
  {
    id: 'the-loss',
    title: {
      en: 'VIII. The Loss (2025)',
      es: 'VIII. La Perdida (2025)',
    },
    paragraphs: {
      en: [
        'On April 25, 2025, Virginia Giuffre — the most prominent Epstein accuser — died by suicide at age 41. [23] She had filed multiple lawsuits, testified in depositions, and pushed for legislative reform over more than a decade.',
        'Her posthumous memoir, "Nobody\'s Girl: A Memoir of Surviving Abuse and Fighting for Justice," was published on October 21, 2025. [24] Co-written with Amy Wallace, it contains new allegations including against an unnamed "well-known Prime Minister."',
        'Giuffre\'s death removed the most powerful voice for accountability in the case. She had achieved more systemic change than the entire justice system: NDA reform legislation, statute of limitations tolling for trafficking victims, mandatory victim impact statements, and corporate due diligence overhaul.',
      ],
      es: [
        'El 25 de abril de 2025, Virginia Giuffre — la acusadora mas prominente de Epstein — murio por suicidio a los 41 anos. [23] Habia presentado multiples demandas, testificado en deposiciones y presionado por reformas legislativas durante mas de una decada.',
        'Su memoria postuma, "Nobody\'s Girl: A Memoir of Surviving Abuse and Fighting for Justice," fue publicada el 21 de octubre de 2025. [24] Co-escrita con Amy Wallace, contiene nuevas acusaciones incluyendo contra un "conocido Primer Ministro" no identificado.',
        'La muerte de Giuffre elimino la voz mas poderosa por la rendicion de cuentas en el caso. Habia logrado mas cambio sistemico que todo el sistema judicial: reforma de leyes de confidencialidad (NDA), extension de plazos de prescripcion para victimas de trafico, declaraciones obligatorias de impacto en victimas y reforma de diligencia debida corporativa.',
      ],
    },
    pullQuote: {
      en: '"Giuffre achieved more systemic change than the entire justice system combined."',
      es: '"Giuffre logro mas cambio sistemico que todo el sistema judicial combinado."',
    },
    citations: [
      { id: 23, text: 'Giuffre death — Associated Press, Apr 25, 2025' },
      { id: 24, text: '"Nobody\'s Girl" — Alfred A. Knopf, Oct 21, 2025; co-written with Amy Wallace' },
    ],
  },
  {
    id: 'the-cascade',
    title: {
      en: 'IX. The Cascade (2025–2026)',
      es: 'IX. La Cascada (2025–2026)',
    },
    paragraphs: {
      en: [
        'On November 19, 2025, the Epstein Files Transparency Act was signed into law, requiring the DOJ to release all unclassified records within 30 days. [25] The DOJ identified six million pages of evidence.',
        'The releases came in waves: Phase 1 on December 19, 2025 brought flight logs and a redacted contact book. [26] January 30, 2026 brought 3 million pages, 2,000 videos, and 180,000 images — revealing Trump flew on Epstein\'s plane at least 8 times in the 1990s. March 6, 2026 brought 15 documents previously "miscoded as duplicates" containing an FBI interview alleging Trump assault in the 1980s.',
        'The file releases triggered arrests: Prince Andrew was arrested February 19, 2026 for misconduct in public office. [27] Peter Mandelson, former UK ambassador, was arrested February 23, 2026. Thorbjorn Jagland, former Prime Minister of Norway, was charged February 12, 2026 with aggravated corruption.',
        'At least 9 major corporate and institutional leaders resigned, including the CEO of DP World, the chairman of Paul Weiss, the executive chairman of Hyatt Hotels, and Goldman Sachs\' Chief Legal Officer.',
        'Congress subpoenaed Attorney General Pam Bondi over alleged file concealment in March 2026. Leslie Wexner was deposed for 5 hours by Congress on February 18, 2026 — confirming for the first time publicly that he had visited Little St. James Island.',
      ],
      es: [
        'El 19 de noviembre de 2025, la Ley de Transparencia de Archivos Epstein fue firmada como ley, requiriendo que el DOJ publicara todos los registros no clasificados dentro de 30 dias. [25] El DOJ identifico seis millones de paginas de evidencia.',
        'Las publicaciones llegaron en oleadas: la Fase 1 el 19 de diciembre de 2025 trajo bitacoras de vuelo y un libro de contactos censurado. [26] El 30 de enero de 2026 trajo 3 millones de paginas, 2.000 videos y 180.000 imagenes — revelando que Trump volo en el avion de Epstein al menos 8 veces en los anos 90. El 6 de marzo de 2026 trajo 15 documentos previamente "mal codificados como duplicados" conteniendo una entrevista del FBI alegando asalto de Trump en los anos 80.',
        'La publicacion de archivos desencadeno arrestos: el Principe Andrew fue arrestado el 19 de febrero de 2026 por mala conducta en cargo publico. [27] Peter Mandelson, ex embajador del Reino Unido, fue arrestado el 23 de febrero de 2026. Thorbjorn Jagland, ex Primer Ministro de Noruega, fue acusado el 12 de febrero de 2026 de corrupcion agravada.',
        'Al menos 9 lideres corporativos e institucionales importantes renunciaron, incluyendo el CEO de DP World, el presidente de Paul Weiss, el presidente ejecutivo de Hyatt Hotels y el Director Legal de Goldman Sachs.',
        'El Congreso cito a la Fiscal General Pam Bondi por presunta ocultacion de archivos en marzo de 2026. Leslie Wexner fue sometido a deposicion durante 5 horas por el Congreso el 18 de febrero de 2026 — confirmando por primera vez publicamente que habia visitado la isla Little St. James.',
      ],
    },
    pullQuote: {
      en: '"Six million pages. Three arrests. Nine resignations. The files changed everything."',
      es: '"Seis millones de paginas. Tres arrestos. Nueve renuncias. Los archivos lo cambiaron todo."',
    },
    citations: [
      { id: 25, text: 'Epstein Files Transparency Act — signed Nov 19, 2025', url: 'https://www.congress.gov' },
      { id: 26, text: 'DOJ file releases — Phase 1 (Dec 2025), Phase 2 (Jan 2026), Phase 3 (Mar 2026)', url: 'https://www.justice.gov' },
      { id: 27, text: 'UK Crown Prosecution — Prince Andrew arrest, Feb 19, 2026', url: 'https://www.cps.gov.uk' },
    ],
  },
  {
    id: 'the-pattern',
    title: {
      en: 'X. The Pattern',
      es: 'X. El Patron',
    },
    paragraphs: {
      en: [
        'Across 198 documented entities and 431 verified relationships, the Epstein network reveals a consistent architecture.',
        'Compartmentalization was the operating principle. The pilot saw flights but not the cabin. The banker saw transactions but not their purpose. The recruiter saw models but not victims. The lawyer saw plea deals but not the network\'s scope. Each actor had plausible deniability by design.',
        'Wealth was the foundation, not intelligence or criminal genius. The entire operation originated from a single trust relationship with Wexner. Epstein didn\'t earn his wealth — he was given access to it through a power of attorney.',
        'Only external actors could break through. When all institutional checks were captured — law enforcement, banking, courts, media, academia, corrections — the only mechanism that worked was independent investigative journalism.',
        'The international dimension moved first. Despite years of analysis predicting US prosecution of associates, the first arrests came from the UK (Prince Andrew, Mandelson) and Norway (Jagland). The US justice system\'s risk-aversion regarding powerful figures remains the primary barrier to domestic accountability.',
      ],
      es: [
        'A traves de 198 entidades documentadas y 431 relaciones verificadas, la red Epstein revela una arquitectura consistente.',
        'La compartimentacion era el principio operativo. El piloto veia vuelos pero no la cabina. El banquero veia transacciones pero no su proposito. El reclutador veia modelos pero no victimas. El abogado veia acuerdos judiciales pero no el alcance de la red. Cada actor tenia negacion plausible por diseno.',
        'La riqueza fue la base, no la inteligencia ni el genio criminal. Toda la operacion se origino en una sola relacion de confianza con Wexner. Epstein no gano su riqueza — se le dio acceso a ella a traves de un poder notarial.',
        'Solo actores externos pudieron penetrar. Cuando todos los controles institucionales fueron capturados — fuerzas del orden, banca, tribunales, medios, academia, sistema penitenciario — el unico mecanismo que funciono fue el periodismo de investigacion independiente.',
        'La dimension internacional se movio primero. A pesar de anos de analisis prediciendo enjuiciamientos en EE.UU. de asociados, los primeros arrestos vinieron del Reino Unido (Principe Andrew, Mandelson) y Noruega (Jagland). La aversion al riesgo del sistema judicial estadounidense respecto a figuras poderosas sigue siendo la principal barrera para la rendicion de cuentas domestica.',
      ],
    },
    pullQuote: {
      en: '"The pilot saw flights but not the cabin. The banker saw transactions but not their purpose. Each actor had plausible deniability by design."',
      es: '"El piloto veia vuelos pero no la cabina. El banquero veia transacciones pero no su proposito. Cada actor tenia negacion plausible por diseno."',
    },
  },
  {
    id: 'unanswered',
    title: {
      en: 'XI. What Remains Unanswered',
      es: 'XI. Lo Que Queda Sin Respuesta',
    },
    paragraphs: {
      en: [
        'What is on the CDs? The physical evidence seized from Epstein\'s safe — left unsecured between warrants, returned by his attorney in suitcases — has never been publicly analyzed.',
        'Who are the unnamed co-conspirators? The 2008 NPA granted immunity to unnamed individuals. Their identities remain sealed.',
        'Was there an intelligence connection? Acosta\'s reported claim that Epstein "belonged to intelligence" has never been confirmed or denied.',
        'What happened during the 2008–2019 gap? Staley\'s 2009 island visit proves the operation continued during Epstein\'s incarceration. The full scope of activities during this period is unknown.',
        'How many victims are there? Approximately 150 have come forward. The true number may be far higher, with many silenced by NDAs, fear, or the passage of time.',
      ],
      es: [
        'Que hay en los CDs? La evidencia fisica incautada de la caja fuerte de Epstein — dejada sin seguridad entre ordenes judiciales, devuelta por su abogado en maletas — nunca ha sido analizada publicamente.',
        'Quienes son los co-conspiradores no identificados? El NPA de 2008 otorgo inmunidad a individuos no identificados. Sus identidades permanecen selladas.',
        'Hubo una conexion con inteligencia? La declaracion reportada de Acosta de que Epstein "pertenecia a inteligencia" nunca ha sido confirmada ni desmentida.',
        'Que ocurrio durante el periodo 2008–2019? La visita de Staley a la isla en 2009 prueba que la operacion continuo durante el encarcelamiento de Epstein. El alcance completo de las actividades durante este periodo es desconocido.',
        'Cuantas victimas hay? Aproximadamente 150 se han presentado. El numero real puede ser mucho mayor, con muchas silenciadas por acuerdos de confidencialidad, miedo o el paso del tiempo.',
      ],
    },
    pullQuote: {
      en: '"Do not look for a smoking gun; look for the smoke that rises from a thousand small fires."',
      es: '"No busques un arma humeante; busca el humo que se eleva de mil pequenos incendios."',
    },
  },
]

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const stats: readonly StatCard[] = [
  { value: '$500M+', label: { en: 'Total settlements paid', es: 'Total en acuerdos pagados' } },
  { value: '198', label: { en: 'Knowledge graph nodes', es: 'Nodos del grafo de conocimiento' } },
  { value: '431', label: { en: 'Documented relationships', es: 'Relaciones documentadas' } },
  { value: '150+', label: { en: 'Known victims', es: 'Victimas conocidas' } },
  { value: '6M', label: { en: 'Pages of DOJ evidence', es: 'Paginas de evidencia del DOJ' } },
  { value: '11', label: { en: 'Years of NPA immunity', es: 'Anos de inmunidad del NPA' } },
  { value: '3', label: { en: 'Arrests (2026)', es: 'Arrestos (2026)' } },
  { value: '9', label: { en: 'Resignations (2026)', es: 'Renuncias (2026)' } },
  { value: '22', label: { en: 'Persons documented', es: 'Personas documentadas' } },
]

// ---------------------------------------------------------------------------
// Settlement breakdown (after The Reckoning)
// ---------------------------------------------------------------------------

const settlements: readonly { label: Record<Lang, string>; value: string }[] = [
  { label: { en: 'Victims Compensation Program', es: 'Programa de Compensacion a Victimas' }, value: '~$125M' },
  { label: { en: 'JPMorgan Settlement', es: 'Acuerdo JPMorgan' }, value: '$290M' },
  { label: { en: 'Deutsche Bank Settlement', es: 'Acuerdo Deutsche Bank' }, value: '$75M' },
  { label: { en: 'USVI Settlement', es: 'Acuerdo USVI' }, value: '$105M' },
  { label: { en: 'Prince Andrew Settlement', es: 'Acuerdo Principe Andrew' }, value: '~$12M' },
]

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const sources: readonly Source[] = [
  { name: 'Miami Herald — "Perversion of Justice" (Julie K. Brown)', url: 'https://www.miamiherald.com/topics/jeffrey-epstein' },
  { name: 'US DOJ — Epstein Files Releases', url: 'https://www.justice.gov' },
  { name: 'SDNY — US v. Ghislaine Maxwell, Case 1:20-cr-00330', url: 'https://www.courtlistener.com' },
  { name: 'Senate Finance Committee — Leon Black Investigation (March 2025)', url: 'https://www.finance.senate.gov' },
  { name: 'Giuffre v. Maxwell — Unsealed Documents (January 2024)', url: 'https://www.courtlistener.com' },
  { name: 'UK Crown Prosecution — Prince Andrew Charges (Feb 2026)', url: 'https://www.cps.gov.uk' },
  { name: 'Congressional Hearing — Wexner Deposition (Feb 18, 2026)', url: 'https://www.congress.gov' },
  { name: 'JPMorgan Settlement — USVI v. JPMorgan Chase ($290M)', url: 'https://www.courtlistener.com' },
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
  const [lang, setLang] = useState<Lang>('en')

  return (
    <article className="mx-auto max-w-prose pb-20">
      {/* Header */}
      <header className="py-12 text-center">
        {/* Language toggle */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setLang('en')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('es')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === 'es'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ES
          </button>
        </div>

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

          {/* Settlement breakdown — after The Reckoning chapter */}
          {chapter.id === 'the-reckoning' && (
            <>
              <h3 className="mt-8 text-lg font-semibold text-zinc-200">
                {lang === 'en' ? 'The Financial Aftermath' : 'Las Consecuencias Financieras'}
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {settlements.map((item) => (
                  <div
                    key={item.value}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
                  >
                    <p className="text-sm font-medium text-blue-400">{item.value}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.label[lang]}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <hr className="mt-12 border-zinc-800/60" />
        </section>
      ))}

      {/* By the Numbers */}
      <section className="py-12">
        <h2 className="border-l-4 border-blue-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'en' ? 'By the Numbers' : 'En Numeros'}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 text-center"
            >
              <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
              <p className="mt-1 text-sm text-zinc-400">{stat.label[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-zinc-800" />

      {/* Sources */}
      <section className="py-12">
        <h2 className="border-l-4 border-blue-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'en' ? 'Sources' : 'Fuentes'}
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
          {lang === 'en'
            ? 'This investigation is based on verified public sources, including court documents, congressional testimony, DOJ file releases, flight logs, and investigative journalism. All claims are sourced from the knowledge graph of the Office of Accountability platform (198 nodes, 431 relationships). This does not constitute legal advice.'
            : 'Esta investigacion se basa en fuentes publicas verificadas, incluyendo documentos judiciales, testimonios ante el Congreso, archivos del DOJ, bitacoras de vuelo y periodismo de investigacion. Todas las afirmaciones provienen del grafo de conocimiento de la plataforma Office of Accountability (198 nodos, 431 relaciones). Esto no constituye asesoramiento legal.'}
        </p>
      </section>

      {/* Closing */}
      <div className="mt-8 text-center">
        <p className="text-sm italic text-zinc-500">
          {lang === 'en'
            ? 'The investigation continues. The graph grows. The questions remain.'
            : 'La investigacion continua. El grafo crece. Las preguntas permanecen.'}
        </p>
      </div>
    </article>
  )
}
