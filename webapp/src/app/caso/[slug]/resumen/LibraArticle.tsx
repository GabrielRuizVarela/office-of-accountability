'use client'

/**
 * Caso Libra — Narrative summary page.
 *
 * A long-form, bilingual investigative journalism piece that walks readers
 * through the complete story of the $LIBRA token scandal.
 */

import { useLanguage, type Lang } from '@/lib/language-context'

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

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const TITLE: Record<Lang, string> = {
  es: 'Caso Libra: La Historia Completa',
  en: 'The Libra Case: The Complete Story',
}

const SUBTITLE: Record<Lang, string> = {
  es: 'Como un token cripto promocionado por el presidente de Argentina colapso un 94% y causo perdidas de $251 millones',
  en: 'How a crypto token promoted by the President of Argentina collapsed 94% and caused $251 million in losses',
}

const READING_TIME: Record<Lang, string> = {
  es: '~15 min de lectura',
  en: '~15 min read',
}

const LAST_UPDATED: Record<Lang, string> = {
  es: 'Actualizado: marzo 2026',
  en: 'Last updated: March 2026',
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

interface Chapter {
  readonly id: string
  readonly title: Record<Lang, string>
  readonly paragraphs: Record<Lang, readonly string[]>
  readonly pullQuote?: Record<Lang, string>
  readonly citations?: readonly Citation[]
}

const chapters: readonly Chapter[] = [
  {
    id: 'el-tweet',
    title: {
      es: 'Capitulo 1: El Tweet',
      en: 'Chapter 1: The Tweet',
    },
    paragraphs: {
      es: [
        'El 14 de febrero de 2025, Dia de San Valentin, a las 19:01 hora argentina, el presidente Javier Milei publico un tweet ante sus 19 millones de seguidores promocionando un token de criptomoneda llamado $LIBRA. El token habia sido creado apenas minutos antes.',
        'En los siguientes 40 minutos, el precio del token se disparo de $0.000001 a $5.20, alcanzando una capitalizacion de mercado de $4.500 millones. El presidente de la octava economia mas grande del mundo acababa de respaldar una criptomoneda recien creada a traves de su cuenta personal.',
        'Lo que los compradores no sabian era que el 82% del suministro del token estaba desbloqueado desde el lanzamiento — un detalle que la firma de analisis blockchain Bubblemaps documentaria mas tarde. [1]',
      ],
      en: [
        'On February 14, 2025 — Valentine\'s Day — at 7:01 PM Argentina time, President Javier Milei posted a tweet to his 19 million followers promoting a cryptocurrency token called $LIBRA. The token had been created just minutes earlier.',
        'Over the next 40 minutes, the token\'s price surged from $0.000001 to $5.20, reaching a market capitalization of $4.5 billion. The president of the eighth-largest economy had just endorsed a freshly minted cryptocurrency from his personal account.',
        'What buyers didn\'t know was that 82% of the token\'s supply was unlocked from launch — a detail blockchain forensics firm Bubblemaps would later document. [1]',
      ],
    },
    pullQuote: {
      es: '"El presidente de la Nacion promociono un token cuyo 82% del suministro estaba desbloqueado desde el minuto cero."',
      en: '"The President of the Nation promoted a token whose 82% supply was unlocked from minute zero."',
    },
    citations: [
      { id: 1, text: 'Bubblemaps — $LIBRA Token Supply Analysis (82% unlocked)', url: 'https://bubblemaps.io' },
    ],
  },
  {
    id: 'el-saqueo',
    title: {
      es: 'Capitulo 2: El Saqueo',
      en: 'Chapter 2: The Heist',
    },
    paragraphs: {
      es: [
        'Mientras miles de argentinos y traders internacionales compraban $LIBRA confiando en el respaldo presidencial, ocho billeteras vinculadas a los organizadores comenzaron a extraer fondos. En apenas tres horas, $107 millones fueron drenados del pool de liquidez. [1]',
        'El precio se desplomo un 94%. En tres horas, la capitalización pasó de $4.500 millones a menos de $300 millones. Un analisis posterior revelo que 114.410 billeteras perdieron un total de $251 millones. [2] Solo 36 billeteras obtuvieron ganancias superiores al millon de dolares.',
        'Los números no dejan margen de interpretación: por cada dolar que alguien gano, docenas de personas perdieron. El patron era clasico — un esquema de pump-and-dump: insiders compraron antes del tweet, vendieron en el pico, y drenaron la liquidez, pero con la escala que solo el endorsement presidencial podia proporcionar.',
      ],
      en: [
        'While thousands of Argentines and international traders bought $LIBRA trusting the presidential endorsement, eight wallets linked to the organizers began extracting funds. In just three hours, $107 million was drained from the liquidity pool. [1]',
        'The price crashed 94%. In three hours, market cap went from $4.5 billion to under $300 million. Later analysis revealed that 114,410 wallets lost a combined $251 million. [2] Only 36 wallets made profits exceeding one million dollars.',
        'The numbers leave no room for interpretation: for every dollar someone gained, dozens lost. The pattern was classic — a pump-and-dump scheme: insiders bought before the tweet, sold at the peak, and drained the liquidity, but at a scale only a presidential endorsement could provide.',
      ],
    },
    pullQuote: {
      es: '"114.410 billeteras perdieron $251 millones. Solo 36 ganaron mas de un millon."',
      en: '"114,410 wallets lost $251 million. Only 36 made over a million."',
    },
    citations: [
      { id: 1, text: 'Nansen — On-chain forensics: $107M drained from liquidity pool', url: 'https://www.nansen.ai' },
      { id: 2, text: 'Chainalysis — 114,410 wallets lost $251M in $LIBRA collapse', url: 'https://www.chainalysis.com' },
    ],
  },
  {
    id: 'la-trama',
    title: {
      es: 'Capitulo 3: La Trama',
      en: 'Chapter 3: The Web',
    },
    paragraphs: {
      es: [
        'La evidencia forense del telefono de Mauricio Novelli revelo una red de conexiones que contradecia la narrativa oficial de ignorancia. Un documento fechado el 11 de febrero — tres dias antes del lanzamiento — detallaba un acuerdo de $5 millones relacionado con el token. [1]',
        'La noche del lanzamiento, segun la investigacion congressional [2], se registraron mas de 30 contactos telefonicos entre los actores clave: Milei, su hermana Karina Milei, el ministro de Economia Luis Caputo y Novelli. Un video de Caputo, captado a las 23:37, muestra una videollamada de 4 minutos y 37 segundos durante las horas criticas de la operacion.',
        'La investigacion congressional revelo 16 reuniones entre funcionarios del gobierno y los organizadores del token, de las cuales solo 4 fueron declaradas oficialmente. [2] Julian Peh, uno de los intermediarios, fue registrado ingresando a la Casa Rosada el 10 de febrero, cuatro dias antes del lanzamiento.',
        'Segun la investigacion de Infobae [3], Novelli habria estado realizando pagos a Milei desde 2021, y esos pagos se habrian duplicado despues de que Milei asumiera la presidencia.',
      ],
      en: [
        'Forensic evidence from Mauricio Novelli\'s phone revealed a web of connections that contradicted the official narrative of ignorance. A document dated February 11 — three days before launch — detailed a $5 million agreement related to the token. [1]',
        'On launch night, according to the congressional investigation [2], over 30 phone contacts were recorded between key players: Milei, his sister Karina Milei, Economy Minister Luis Caputo, and Novelli. A video of Caputo, captured at 23:37, shows a 4-minute and 37-second video call during the critical hours of the operation.',
        'The congressional investigation revealed 16 meetings between government officials and the token organizers, of which only 4 were officially declared. [2] Julian Peh, one of the intermediaries, was recorded entering the Casa Rosada on February 10, four days before the launch.',
        'According to reporting by Infobae [3], Novelli had allegedly been making payments to Milei since 2021, and those payments reportedly doubled after Milei assumed the presidency.',
      ],
    },
    pullQuote: {
      es: '"16 reuniones entre funcionarios y organizadores. Solo 4 fueron declaradas."',
      en: '"16 meetings between officials and organizers. Only 4 were declared."',
    },
    citations: [
      { id: 1, text: 'Infobae — Evidencia forense del telefono de Novelli', url: 'https://www.infobae.com/tag/caso-libra/' },
      { id: 2, text: 'Congreso de la Nacion — Informe de la Comision Investigadora', url: 'https://www.congreso.gob.ar' },
      { id: 3, text: 'Infobae — Pagos de Novelli a Milei desde 2021', url: 'https://www.infobae.com/tag/caso-libra/' },
    ],
  },
  {
    id: 'los-organizadores',
    title: {
      es: 'Capitulo 4: Los Organizadores',
      en: 'Chapter 4: The Organizers',
    },
    paragraphs: {
      es: [
        'Detras del token $LIBRA se encontraba Kelsier Ventures, liderada por su CEO Hayden Davis. La firma no era nueva en el mundo de los lanzamientos de tokens controvertidos — el mismo equipo estuvo detras del token $MELANIA, lanzado poco antes. [1]',
        'Ben Chow, co-acusado en la demanda estadounidense, fue identificado como otro organizador clave. Dave Portnoy, el influencer financiero, recibio tokens a cambio de promocion, pero termino perdiendo $6.3 millones cuando el precio colapso — conviertiendose en victima de la misma operacion que ayudo a publicitar.',
        'Cuando la presion legal aumento, Davis propuso devolver $100 millones a los afectados — una oferta que muchos interpretaron como un intento de mitigar la responsabilidad legal. En agosto de 2025, un juez de Manhattan ordeno el descongelamiento de $57.6 millones en activos vinculados a la operacion. [2]',
      ],
      en: [
        'Behind the $LIBRA token was Kelsier Ventures, led by CEO Hayden Davis. The firm was no stranger to controversial token launches — the same team was behind the $MELANIA token, launched shortly before. [1]',
        'Ben Chow, co-defendant in the US lawsuit, was identified as another key organizer. Dave Portnoy, the financial influencer, received tokens in exchange for promotion but ended up losing $6.3 million when the price collapsed — becoming a victim of the very operation he helped publicize.',
        'When legal pressure mounted, Davis proposed returning $100 million to those affected — an offer many interpreted as an attempt to mitigate legal liability. In August 2025, a Manhattan judge ordered the unfreezing of $57.6 million in assets linked to the operation. [2]',
      ],
    },
    citations: [
      { id: 1, text: 'Infobae — Kelsier Ventures and the $MELANIA / $LIBRA connection', url: 'https://www.infobae.com/tag/caso-libra/' },
      { id: 2, text: 'Hurlock v. Kelsier Ventures — SDNY filing, asset freeze order', url: 'https://www.courtlistener.com' },
    ],
  },
  {
    id: 'la-familia',
    title: {
      es: 'Capitulo 5: La Familia Kelsier',
      en: 'Chapter 5: The Kelsier Family',
    },
    paragraphs: {
      es: [
        'Kelsier Ventures no era una empresa — era un negocio familiar. Hayden Mark Davis (CEO), su hermano Gideon (COO) y su padre Tom (Chairman, con antecedentes penales por fraude de identidad en EE.UU.) controlaban la operacion. Tom Davis habia pasado por prision federal antes de reinventarse como CEO de una ONG infantil.',
        'La billetera desplegadora del token (DefcyKc4...) fue identificada por Nansen como "Libra: Deployer". El contrato del token en Solana (Bo9jh3wsmc...) fue verificado contra Solscan. [1] El 82% del suministro estaba desbloqueado desde el lanzamiento.',
        'El rastro blockchain revelo que la billetera 0xcEA, que hizo sniping en $MELANIA por $2,4 millones, financio directamente el despliegue de $LIBRA. Bubblemaps rastro al menos 15 tokens adicionales del mismo cluster: $WOLF, $TRUST, $KACY, $VIBES, $HOOD, $ENRON. [2]',
        'Davis admitio en entrevista con Coffeezilla que su equipo uso bots para comprar tokens antes que los inversores minoristas ("sniping") en $LIBRA, $MELANIA y $TRUMP. [3] Arkham Intelligence identifico mas de 1.000 direcciones de Kelsier Ventures con casi $300 millones en fondos totales.',
      ],
      en: [
        'Kelsier Ventures was not a company — it was a family business. Hayden Mark Davis (CEO), his brother Gideon (COO), and his father Tom (Chairman, with a federal prison record for identity fraud in the US) controlled the operation. Tom Davis had served time before reinventing himself as CEO of a children\'s charity.',
        'The token deployer wallet (DefcyKc4...) was identified by Nansen as "Libra: Deployer." The Solana token contract (Bo9jh3wsmc...) was verified against Solscan. [1] 82% of supply was unlocked from launch.',
        'The blockchain trail revealed that wallet 0xcEA, which sniped $MELANIA for $2.4 million, directly funded the $LIBRA deployment. Bubblemaps traced at least 15 additional tokens from the same cluster: $WOLF, $TRUST, $KACY, $VIBES, $HOOD, $ENRON. [2]',
        'Davis admitted in a Coffeezilla interview that his team used bots to front-run retail investors ("sniping") on $LIBRA, $MELANIA, and $TRUMP. [3] Arkham Intelligence identified over 1,000 Kelsier Ventures addresses with nearly $300 million in total funds.',
      ],
    },
    pullQuote: {
      es: '"La misma billetera que hizo sniping en $MELANIA financio directamente el despliegue de $LIBRA."',
      en: '"The same wallet that sniped $MELANIA directly funded $LIBRA\'s deployment."',
    },
    citations: [
      { id: 1, text: 'Solscan — LIBRA token contract (Bo9jh3wsmc...) and deployer wallet', url: 'https://solscan.io/token/Bo9jh3wsmcC2AjakLWzNmKJ3SgtZmXEcSaW7L2FAvUsU' },
      { id: 2, text: 'Bubblemaps — 15+ tokens traced to same Kelsier cluster', url: 'https://bubblemaps.io' },
      { id: 3, text: 'Coffeezilla — Interview with Hayden Davis on sniping bots', url: 'https://www.youtube.com/watch?v=Ud6GuH7gSDw' },
    ],
  },
  {
    id: 'los-testaferros',
    title: {
      es: 'Capitulo 6: Los Testaferros',
      en: 'Chapter 6: The Straw Men',
    },
    paragraphs: {
      es: [
        'El dinero no desaparecio en el vacio. La justicia identifico una red de intermediarios usados para canalizar los fondos extraidos. Orlando Mellino, un jubilado de 75 anos sin ningun antecedente en criptomonedas, recibio mas de un millon de dolares de las billeteras de Hayden Davis y los transfirio en cuestion de horas.',
        'Favio Rodriguez Blanco, un intermediario colombiano, opero de forma similar. Ambos tienen bienes embargados por orden del juez Martinez De Giorgi.',
        'El patron sugiere una operacion de lavado clasica: fondos cripto convertidos a fiat a traves de personas sin perfil financiero sofisticado, diseciados para evadir los controles antifraude. Solo 8 de las 34 direcciones vinculadas a Davis han sido rastreadas en detalle. [1] Las 26 restantes, con parte de $124,6 millones en ganancias, permanecen sin identificar.',
      ],
      en: [
        'The money didn\'t vanish into thin air. The justice system identified a network of intermediaries used to channel the extracted funds. Orlando Mellino, a 75-year-old retiree with zero cryptocurrency background, received over one million dollars from Hayden Davis\'s wallets and transferred them within hours.',
        'Favio Rodriguez Blanco, a Colombian intermediary, operated similarly. Both have assets frozen by order of Judge Martinez De Giorgi.',
        'The pattern suggests a classic money laundering operation: crypto funds converted to fiat through individuals with no sophisticated financial profile, designed to evade anti-fraud controls. Only 8 of the 34 Davis-linked addresses have been traced in detail. [1] The remaining 26, with a portion of $124.6 million in profits, remain unidentified.',
      ],
    },
    pullQuote: {
      es: '"Un jubilado de 75 anos sin antecedentes cripto recibio mas de un millon de dolares y los transfirio en horas."',
      en: '"A 75-year-old retiree with no crypto background received over one million dollars and transferred them within hours."',
    },
    citations: [
      { id: 1, text: 'Arkham Intelligence — 34 Davis-linked addresses, 8 traced', url: 'https://info.arkm.com/announcements/1000-kelsier-ventures-addresses-now-on-arkham' },
    ],
  },
  {
    id: 'el-encubrimiento',
    title: {
      es: 'Capitulo 7: El Encubrimiento',
      en: 'Chapter 7: The Coverup',
    },
    paragraphs: {
      es: [
        'La respuesta del gobierno siguio un patron reconocible. Milei elimino su publicacion y declaro ignorancia sobre la naturaleza del token. Luego cambio de estrategia, defendiendo su accion como un esfuerzo por "impulsar el sector privado".',
        'En mayo de 2025, mediante el Decreto 332/2025, el gobierno disolvio la UTI (Unidad de Transparencia e Investigacion), eliminando uno de los mecanismos de control interno. [1] Un mes despues, la Oficina Anticorrupcion emitio un dictamen exonerando a Milei de responsabilidad.',
        'Una grabacion filtrada revelo al ministro Caputo advirtiendo sobre el "dolor de cabeza judicial" que el caso representaba. [2] Mientras tanto, el fiscal a cargo, Eduardo Taiano, fue acusado de obstruccion por su manejo de la investigacion.',
        'Al cumplirse un ano del escandalo en febrero de 2026, cero testigos citados a declarar, cero procesamientos, cero detenidos.',
      ],
      en: [
        'The government\'s response followed a recognizable pattern. Milei deleted his post and claimed ignorance about the token\'s nature. He then shifted strategy, defending his action as an effort to "boost the private sector."',
        'In May 2025, through Decree 332/2025, the government disbanded the UTI (Transparency and Investigation Unit), eliminating one of the internal oversight mechanisms. [1] A month later, the Anti-Corruption Office issued a ruling clearing Milei of responsibility.',
        'A leaked recording revealed Minister Caputo warning about the "judicial headache" the case represented. [2] Meanwhile, the prosecutor in charge, Eduardo Taiano, was accused of obstruction for his handling of the investigation.',
        'At the one-year anniversary of the scandal in February 2026, zero witnesses summoned, zero indictments, zero arrests.',
      ],
    },
    pullQuote: {
      es: '"Un ano despues: cero testigos, cero procesamientos, cero detenidos."',
      en: '"One year later: zero witnesses, zero indictments, zero arrests."',
    },
    citations: [
      { id: 1, text: 'Decreto 332/2025 — Disolucion de la UTI (Boletin Oficial)', url: 'https://www.boletinoficial.gob.ar' },
      { id: 2, text: 'Infobae — Grabacion filtrada del ministro Caputo', url: 'https://www.infobae.com/tag/caso-libra/' },
    ],
  },
  {
    id: 'la-justicia-lenta',
    title: {
      es: 'Capitulo 8: La Justicia Lenta',
      en: 'Chapter 8: Slow Justice',
    },
    paragraphs: {
      es: [
        'La causa penal recayo en el juez federal Martinez de Giorgi, mientras que el fiscal Eduardo Taiano — ahora acusado de obstruccion — mantenia el control de la investigacion. En Estados Unidos, la demanda colectiva Hurlock v. Kelsier Ventures fue presentada en el Tribunal del Distrito Sur de Nueva York (SDNY). [1]',
        'El informe de la comision congressional concluyo con un hallazgo de "colaboracion esencial" entre funcionarios del gobierno y los organizadores del token. [2] Sin embargo, la comision fue inicialmente disuelta antes de ser reactivada en marzo de 2026 con nueva evidencia forense del telefono de Novelli.',
        'A pesar de la evidencia acumulada — registros telefonicos, movimientos blockchain, documentos financieros, testimonios parlamentarios — la justicia argentina no ha producido un solo procesamiento al cierre de esta investigacion.',
      ],
      en: [
        'The criminal case fell to Federal Judge Martinez de Giorgi, while Prosecutor Eduardo Taiano — now accused of obstruction — maintained control of the investigation. In the United States, the class action Hurlock v. Kelsier Ventures was filed in the Southern District of New York (SDNY). [1]',
        'The congressional commission\'s report concluded with a finding of "essential collaboration" between government officials and the token organizers. [2] However, the commission was initially dissolved before being revived in March 2026 with new forensic evidence from Novelli\'s phone.',
        'Despite the accumulated evidence — phone records, blockchain transactions, financial documents, parliamentary testimony — Argentine justice has not produced a single indictment as of this investigation\'s close.',
      ],
    },
    pullQuote: {
      es: '"Registros telefónicos, blockchain, documentos, testimonios — y la justicia argentina no ha producido un solo procesamiento."',
      en: '"Phone records, blockchain, documents, testimony — and Argentine justice has not produced a single indictment."',
    },
    citations: [
      { id: 1, text: 'Hurlock v. Kelsier Ventures — Class action filing, SDNY', url: 'https://www.courtlistener.com' },
      { id: 2, text: 'Congreso de la Nacion — Hallazgo de "colaboracion esencial"', url: 'https://www.congreso.gob.ar' },
    ],
  },
  {
    id: 'los-numeros',
    title: {
      es: 'Capitulo 9: Los Numeros No Mienten',
      en: 'Chapter 9: The Numbers Don\'t Lie',
    },
    paragraphs: {
      es: [
        'Mas alla de las narrativas politicas y las maniobras legales, los numeros cuentan su propia historia — una que no admite interpretaciones alternativas. [1]',
      ],
      en: [
        'Beyond the political narratives and legal maneuvers, the numbers tell their own story — one that admits no alternative interpretation. [1]',
      ],
    },
    citations: [
      { id: 1, text: 'TRM Labs — The Libra Affair: on-chain data compilation', url: 'https://www.trmlabs.com/resources/blog/the-libra-affair-tracking-the-memecoin-that-launched-a-scandal-in-argentina' },
    ],
  },
  {
    id: 'que-sigue',
    title: {
      es: 'Capitulo 10: Que Sigue',
      en: 'Chapter 10: What\'s Next',
    },
    paragraphs: {
      es: [
        'En marzo de 2026, la comision congressional ha sido reactivada y exige explicaciones con nueva evidencia forense extraida del telefono de Novelli. La denuncia por obstruccion contra el fiscal Taiano abre un segundo frente judicial.',
        'Las preguntas fundamentales siguen sin respuesta: Quien autorizo la publicacion presidencial? Quienes son los beneficiarios de las 26 billeteras no rastreadas? Se concreto el pago de $5 millones documentado en el iPhone de Novelli? Cual fue el rol real de Julian Peh, cuya centralidad en la red supera a la de Milei y Davis?',
        'Esta investigacion de la Oficina de Rendicion de Cuentas ha verificado 43 items contra fuentes judiciales, parlamentarias, blockchain y periodisticas. [1] El grafo de conocimiento contiene 102 nodos y 141 aristas, todos verificados. La evidencia está ahí. Los números están ahí. Cero procesamientos.',
      ],
      en: [
        'In March 2026, the congressional commission has been revived and is demanding explanations with new forensic evidence extracted from Novelli\'s phone. The obstruction complaint against Prosecutor Taiano opens a second judicial front.',
        'The fundamental questions remain unanswered: Who authorized the presidential post? Who are the beneficiaries behind the 26 untraced wallets? Was the $5 million payment documented on Novelli\'s iPhone ever executed? What was the real role of Julian Peh, whose network centrality exceeds that of both Milei and Davis?',
        'This Office of Accountability investigation has verified 43 items against judicial, parliamentary, blockchain, and journalistic sources. [1] The knowledge graph contains 102 nodes and 141 edges, all verified. The evidence is there. The numbers are there. Zero indictments.',
      ],
    },
    pullQuote: {
      es: '"La evidencia está ahí. Los números están ahí. Cero procesamientos."',
      en: '"The evidence is there. The numbers are there. Zero indictments."',
    },
    citations: [
      { id: 1, text: 'Burwick Law — Class action: 43 verified claims against $LIBRA organizers', url: 'https://www.burwick.law/active-cases/libra-token-lawsuit' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Stats for Chapter 9 (Los Numeros)
// ---------------------------------------------------------------------------

const stats: readonly StatCard[] = [
  { value: '$251M', label: { es: 'Perdidos por inversores', en: 'Lost by investors' } },
  { value: '$107M', label: { es: 'Extraidos por insiders', en: 'Extracted by insiders' } },
  { value: '114,410', label: { es: 'Billeteras afectadas', en: 'Affected wallets' } },
  { value: '$4.5B', label: { es: 'Capitalizacion maxima', en: 'Peak market cap' } },
  { value: '94%', label: { es: 'Caida del precio', en: 'Price crash' } },
  { value: '0', label: { es: 'Procesamientos', en: 'Indictments' } },
  { value: '16 / 4', label: { es: 'Reuniones / declaradas', en: 'Meetings / declared' } },
  { value: '30+', label: { es: 'Contactos noche del lanzamiento', en: 'Launch night phone contacts' } },
  { value: '57.6%', label: { es: 'Desaprobacion del presidente', en: 'Presidential disapproval' } },
  { value: '1,000+', label: { es: 'Direcciones Kelsier identificadas', en: 'Kelsier addresses identified' } },
  { value: '$300M', label: { es: 'Fondos en cluster Kelsier', en: 'Funds in Kelsier cluster' } },
  { value: '15+', label: { es: 'Tokens del mismo cluster', en: 'Tokens from same cluster' } },
  { value: '43', label: { es: 'Items verificados (ORC)', en: 'Factchecked items (ORC)' } },
]

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const sources: readonly Source[] = [
  { name: 'Bubblemaps — $LIBRA Token Analysis', url: 'https://bubblemaps.io' },
  { name: 'Infobae — Caso Libra cobertura', url: 'https://www.infobae.com/tag/caso-libra/' },
  { name: 'Congreso de la Nacion — Comision Investigadora', url: 'https://www.congreso.gob.ar' },
  { name: 'Hurlock v. Kelsier Ventures — SDNY Filing', url: 'https://www.courtlistener.com' },
  { name: 'Nansen — Blockchain forensics', url: 'https://www.nansen.ai' },
  { name: 'Chainalysis — Wallet tracking', url: 'https://www.chainalysis.com' },
  { name: 'Decreto 332/2025 — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar' },
  { name: 'Oficina Anticorrupcion — Dictamen', url: 'https://www.argentina.gob.ar/anticorrupcion' },
  { name: 'Arkham Intelligence — Kelsier Ventures Addresses', url: 'https://info.arkm.com/announcements/1000-kelsier-ventures-addresses-now-on-arkham' },
  { name: 'TRM Labs — The Libra Affair', url: 'https://www.trmlabs.com/resources/blog/the-libra-affair-tracking-the-memecoin-that-launched-a-scandal-in-argentina' },
  { name: 'Coffeezilla — Davis Interview', url: 'https://www.youtube.com/watch?v=Ud6GuH7gSDw' },
  { name: 'Burwick Law — Class Action Filing', url: 'https://www.burwick.law/active-cases/libra-token-lawsuit' },
  { name: 'Solscan — LIBRA Token Contract', url: 'https://solscan.io/token/Bo9jh3wsmcC2AjakLWzNmKJ3SgtZmXEcSaW7L2FAvUsU' },
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
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400 no-underline hover:bg-purple-500/30 hover:text-purple-300"
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

export function LibraArticle() {
  const { lang } = useLanguage()

  return (
    <article className="mx-auto max-w-prose pb-20">
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
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
      </header>

      <hr className="border-zinc-800" />

      {/* ----------------------------------------------------------------- */}
      {/* Chapters                                                          */}
      {/* ----------------------------------------------------------------- */}
      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="py-12">
          <h2 className="border-l-4 border-purple-500 pl-4 text-xl font-bold text-zinc-50">
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
            <blockquote className="my-6 border-l-2 border-purple-400 pl-4 text-lg italic text-zinc-200">
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
                        className="text-purple-400/70 underline decoration-purple-400/20 hover:text-purple-300"
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

          {/* Stats grid — only for Chapter 7 */}
          {chapter.id === 'los-numeros' && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 text-center"
                >
                  <p className="text-2xl font-bold text-purple-400">{stat.value}</p>
                  <p className="mt-1 text-sm text-zinc-400">{stat.label[lang]}</p>
                </div>
              ))}
            </div>
          )}

          {/* Divider between chapters */}
          <hr className="mt-12 border-zinc-800/60" />
        </section>
      ))}

      {/* Sources */}
      <section className="py-12">
        <h2 className="border-l-4 border-purple-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Fuentes' : 'Sources'}
        </h2>
        <ul className="mt-6 space-y-2">
          {sources.map((src) => (
            <li key={src.name}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-400 underline decoration-purple-400/30 hover:text-purple-300 hover:decoration-purple-300/50"
              >
                {src.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Methodology */}
      <section className="py-12">
        <h2 className="border-l-4 border-purple-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Metodología' : 'Methodology'}
        </h2>
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
              {lang === 'es' ? 'Cómo Se Hizo Esta Investigación' : 'How This Investigation Was Built'}
            </h3>
            <div className="mt-3 space-y-3 text-sm text-zinc-300">
              <p>{lang === 'es'
                ? 'Esta investigación fue construida mediante inteligencia artificial asistida con verificación humana. El motor procesó transacciones blockchain, documentos parlamentarios, análisis de redes sociales y registros judiciales para construir el caso.'
                : 'This investigation was built through AI-assisted intelligence with human verification. The engine processed blockchain transactions, parliamentary documents, social media analysis, and court records to build the case.'}</p>
              <p>{lang === 'es'
                ? 'Cada hallazgo fue verificado contra fuentes primarias. La tecnología detecta patrones; la verificación humana confirma o descarta. Las conclusiones son del lector.'
                : 'Every finding was verified against primary sources. Technology detects patterns; human verification confirms or discards. The conclusions are the reader\'s.'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
              {lang === 'es' ? 'Protocolo de Verificación' : 'Verification Protocol'}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>{lang === 'es'
                ? 'Tres niveles de confianza: gold (curado), silver (verificado web), bronze (sin verificar)'
                : 'Three confidence tiers: gold (curated), silver (web-verified), bronze (unverified)'}</li>
              <li>{lang === 'es'
                ? 'Análisis on-chain verificado contra exploradores de blockchain públicos'
                : 'On-chain analysis verified against public blockchain explorers'}</li>
              <li>{lang === 'es'
                ? 'Documentos parlamentarios enlazados a fuentes oficiales del Congreso'
                : 'Parliamentary documents linked to official Congressional sources'}</li>
              <li>{lang === 'es'
                ? 'La inclusión no implica culpabilidad. Donde se indica "presunto", la conexión no ha sido verificada independientemente.'
                : 'Inclusion does not imply guilt. Where "alleged" is indicated, the connection has not been independently verified.'}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
              {lang === 'es' ? 'Fuentes de Datos' : 'Data Sources'}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <span>Blockchain (Solana)</span>
              <span>Bubblemaps</span>
              <span>Nansen</span>
              <span>Chainalysis</span>
              <span>Arkham Intelligence</span>
              <span>TRM Labs</span>
              <span>Solscan</span>
              <span>Congreso (actas)</span>
              <span>Boletín Oficial</span>
              <span>SDNY Court filings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Esta investigación se basa en fuentes públicas verificadas, incluyendo documentos judiciales, registros blockchain, informes parlamentarios y periodismo de investigación. No constituye asesoramiento legal ni financiero.'
            : 'This investigation is based on verified public sources, including court documents, blockchain records, parliamentary reports, and investigative journalism. It does not constitute legal or financial advice.'}
        </p>
      </section>

    </article>
  )
}
