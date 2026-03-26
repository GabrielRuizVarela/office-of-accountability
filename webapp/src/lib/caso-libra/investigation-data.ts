/**
 * Caso Libra - factchecked investigation data.
 *
 * All data is bilingual (Spanish / English) and sourced from
 * court filings, blockchain forensics, congressional reports,
 * and verified journalism. Every item carries its primary source URL.
 *
 * This module is the single source of truth for the interactive
 * investigation page.
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
  readonly id: string
  readonly claim_es: string
  readonly claim_en: string
  readonly status: FactcheckStatus
  readonly source: string
  readonly source_url: string
  readonly detail_es?: string
  readonly detail_en?: string
}

export type InvestigationCategory =
  | 'political'
  | 'financial'
  | 'legal'
  | 'media'
  | 'coverup'

export interface InvestigationTimelineEvent {
  readonly id: string
  readonly date: string
  readonly title_es: string
  readonly title_en: string
  readonly description_es: string
  readonly description_en: string
  readonly category: InvestigationCategory
  readonly sources: readonly { readonly name: string; readonly url: string }[]
  readonly is_new?: boolean
}

export interface Actor {
  readonly id: string
  readonly name: string
  readonly role_es: string
  readonly role_en: string
  readonly description_es: string
  readonly description_en: string
  readonly nationality: string
  readonly is_new?: boolean
  readonly status_es?: string
  readonly status_en?: string
}

export interface MoneyFlow {
  readonly id: string
  readonly from_label: string
  readonly to_label: string
  readonly amount_usd: number
  readonly date: string
  readonly source: string
}

export type VerificationStatus = 'verified' | 'partially_verified' | 'unverified'

export interface EvidenceDoc {
  readonly id: string
  readonly title: string
  readonly type_es: string
  readonly type_en: string
  readonly date: string
  readonly summary_es: string
  readonly summary_en: string
  readonly source_url: string
  readonly verification_status: VerificationStatus
}

export interface ImpactStat {
  readonly value: string
  readonly label_es: string
  readonly label_en: string
  readonly source: string
}

export interface GovernmentResponse {
  readonly id: string
  readonly date: string
  readonly action_es: string
  readonly action_en: string
  readonly effect_es: string
  readonly effect_en: string
  readonly source: string
  readonly source_url: string
}

// ---------------------------------------------------------------------------
// FACTCHECK ITEMS
// ---------------------------------------------------------------------------

export const FACTCHECK_ITEMS: readonly FactcheckItem[] = [
  // ---- CONFIRMED ----
  {
    id: 'fc-milei-post',
    claim_es:
      'Milei publicó promoviendo $LIBRA con la dirección del contrato el 14 de febrero de 2025 a las 19:01 hora argentina en X, Instagram y Facebook.',
    claim_en:
      'Milei posted promoting $LIBRA with the contract address on February 14, 2025 at 7:01 PM Argentina time on X, Instagram, and Facebook.',
    status: 'confirmed',
    source: 'Wikipedia / Multiple outlets',
    source_url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
    detail_es:
      'Las publicaciones incluían la dirección del contrato del token en Solana e invitaban a "apoyar el proyecto".',
    detail_en:
      'The posts included the Solana token contract address and invited people to "support the project".',
  },
  {
    id: 'fc-price-surge',
    claim_es:
      'El precio subió de ~$0,000001 a $5,20 en 40 minutos tras la publicación de Milei.',
    claim_en:
      "The price surged from ~$0.000001 to $5.20–$5.54 within 40 minutes of Milei's post.",
    status: 'confirmed',
    source: 'Blockchain data / CoinGecko',
    source_url:
      'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
    detail_es:
      'Un incremento de más de 5 millones por ciento en menos de una hora. El precio exacto del pico varía según la fuente ($5,20–$5,54).',
    detail_en: 'An increase of over 5 million percent in under one hour. Exact peak price varies by source ($5.20–$5.54).',
  },
  {
    id: 'fc-peak-market-cap',
    claim_es:
      'La capitalización de mercado alcanzó un pico de $4.500–4.600 millones.',
    claim_en: 'Market cap peaked at $4.5–4.6 billion.',
    status: 'confirmed',
    source: 'CoinGecko / Multiple',
    source_url:
      'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
  },
  {
    id: 'fc-86pct-losses',
    claim_es:
      'El 86% de los traders perdieron un total de $251 millones (confirmado por Nansen).',
    claim_en:
      '86% of traders lost $251M total (confirmed by Nansen Research).',
    status: 'confirmed',
    source: 'Nansen Research',
    source_url: 'https://research.nansen.ai/articles/libra-the-aftermath',
  },
  {
    id: 'fc-affected-wallets',
    claim_es:
      '114.410 billeteras sufrieron pérdidas según el informe del Congreso argentino.',
    claim_en:
      '114,410 wallets suffered losses according to the Argentine Congressional report.',
    status: 'confirmed',
    source: 'Argentine Congress',
    source_url:
      'https://buenosairesherald.com/politics/libra-crypto-scandal-milei-used-presidential-role-to-spread-alleged-scam-congress-report-concludes',
  },
  {
    id: 'fc-36-profiteers',
    claim_es:
      '36 individuos obtuvieron ganancias superiores a $1 millón cada uno.',
    claim_en: '36 individuals profited more than $1M each.',
    status: 'confirmed',
    source: 'Argentine Congressional report',
    source_url:
      'https://buenosairesherald.com/politics/libra-crypto-scandal-milei-used-presidential-role-to-spread-alleged-scam-congress-report-concludes',
  },
  {
    id: 'fc-insider-extraction',
    claim_es:
      '8 billeteras internas extrajeron $107M (Lookonchain). Un análisis más amplio de Nansen/Chainalysis identificó 34 direcciones vinculadas con ganancias de $124,6M.',
    claim_en:
      '8 insider wallets extracted $107M (Lookonchain). A broader Nansen/Chainalysis analysis identified 34 linked addresses with $124.6M in profits.',
    status: 'confirmed',
    source: 'Lookonchain / Nansen / Chainalysis',
    source_url:
      'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
  },
  {
    id: 'fc-supply-unlocked',
    claim_es:
      'El 82% del suministro estaba desbloqueado desde el lanzamiento, concentrado en un solo grupo de billeteras.',
    claim_en:
      '82% of supply was unlocked from launch, concentrated in a single wallet cluster.',
    status: 'confirmed',
    source: 'Bubblemaps',
    source_url:
      'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
  },
  {
    id: 'fc-token-creation-timing',
    claim_es:
      'El token fue creado minutos antes de la publicación de Milei.',
    claim_en: "The token was created minutes before Milei's post.",
    status: 'confirmed',
    source: 'Blockchain data',
    source_url:
      'https://www.trmlabs.com/post/the-libra-affair-tracking-the-memecoin-that-launched-a-scandel-in-argentina',
  },
  {
    id: 'fc-novelli-milei-calls',
    claim_es:
      'Novelli y Milei tuvieron 7 llamadas (13 min 10 s en total) el 14 de febrero y más de 30 contactos en el período más amplio.',
    claim_en:
      'Novelli and Milei had 7 calls (13 min 10 s total) on February 14, and 30+ contacts over the broader period.',
    status: 'confirmed',
    source: 'Forensic phone analysis / Congressional commission',
    source_url:
      'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
  },
  {
    id: 'fc-5m-document',
    claim_es:
      'Documento de pago de $5 millones encontrado en el iPhone de Novelli. Borrador redactado entre octubre y noviembre de 2024, antes de que Davis viajara a Argentina.',
    claim_en:
      "$5M payment document found on Novelli's iPhone. Draft written between October and November 2024, before Davis traveled to Argentina.",
    status: 'confirmed',
    source: 'MercoPress / The Block / DL News',
    source_url:
      'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
    detail_es:
      'Estructura de pago en 3 tramos: $1,5M en tokens o efectivo como anticipo; $1,5M al anunciar Milei a Davis como asesor en X; $2M por contrato de consultoría blockchain/IA firmado en persona por Milei, con revisión de Karina Milei. Hallado durante análisis forense ordenado por el tribunal.',
    detail_en:
      "3-tier payment structure: $1.5M in liquid tokens or cash as advance; $1.5M upon Milei publicly naming Davis as adviser on X; $2M for in-person blockchain/AI consulting contract signed by Milei, with review by Karina Milei. Found during court-ordered forensic analysis.",
  },
  {
    id: 'fc-caputo-video-call',
    claim_es:
      'Caputo participó en una videollamada a las 23:37 la noche del lanzamiento (4 min 37 s) con Novelli y Karina Milei.',
    claim_en:
      'Caputo was on a video call at 23:37 on launch night (4 min 37 s) with Novelli and Karina Milei.',
    status: 'confirmed',
    source: 'Buenos Aires Herald',
    source_url:
      'https://buenosairesherald.com/politics/libra-scandal-leaked-evidence-shows-calls-incriminating-milei-in-scam',
  },
  {
    id: 'fc-davis-melania',
    claim_es:
      'Davis/Kelsier también estuvieron detrás del token $MELANIA.',
    claim_en: 'Davis/Kelsier were also behind the $MELANIA token.',
    status: 'confirmed',
    source: 'Bubblemaps / Cointelegraph',
    source_url:
      'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
  },
  {
    id: 'fc-16-meetings',
    claim_es:
      'Informe del Congreso: 16 reuniones entre el presidente y los promotores, solo 4 declaradas oficialmente.',
    claim_en:
      'Congressional report: 16 meetings between the president and promoters, only 4 officially declared.',
    status: 'confirmed',
    source: 'Argentine Congress (November 2025)',
    source_url:
      'https://buenosairesherald.com/politics/libra-crypto-scandal-milei-used-presidential-role-to-spread-alleged-scam-congress-report-concludes',
  },
  {
    id: 'fc-uti-disbanded',
    claim_es:
      'El gobierno disolvió la Unidad de Tareas de Investigación (UTI) en mayo de 2025 (Decreto 332/2025).',
    claim_en:
      'The government disbanded the UTI investigation unit in May 2025 (Decree 332/2025).',
    status: 'confirmed',
    source: 'Bloomberg',
    source_url:
      'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
  },
  {
    id: 'fc-anticorruption-cleared',
    claim_es:
      'La Oficina Anticorrupción absolvió a Milei en junio de 2025.',
    claim_en: 'The Anti-Corruption Office cleared Milei in June 2025.',
    status: 'confirmed',
    source: 'Bloomberg',
    source_url:
      'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
  },
  {
    id: 'fc-assets-unfrozen',
    claim_es:
      'Un juez de Manhattan descongeló $57,6 millones en activos de Davis/Chow en agosto de 2025.',
    claim_en:
      'A Manhattan judge unfroze $57.6M in Davis/Chow assets in August 2025.',
    status: 'confirmed',
    source: 'Decrypt',
    source_url:
      'https://decrypt.co/336060/libra-promoters-regain-access-57-6-million-crypto-judge-unfreezes-assets',
  },
  {
    id: 'fc-us-class-action',
    claim_es:
      'Demanda colectiva en EE.UU.: Hurlock v. Kelsier Ventures (SDNY Caso 1:25-cv-03891).',
    claim_en:
      'US class action: Hurlock v. Kelsier Ventures (SDNY Case 1:25-cv-03891).',
    status: 'confirmed',
    source: 'Court records',
    source_url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
  },
  {
    id: 'fc-zero-indictments',
    claim_es: 'Cero imputaciones tras un año de investigación.',
    claim_en: 'Zero indictments after one year of investigation.',
    status: 'confirmed',
    source: 'Buenos Aires Times (February 2026)',
    source_url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
  },
  {
    id: 'fc-prosecutor-obstruction',
    claim_es:
      'La oposición presentó denuncia contra el fiscal Taiano por obstrucción.',
    claim_en:
      'The opposition filed a complaint against prosecutor Taiano for obstruction.',
    status: 'confirmed',
    source: 'MercoPress (March 2026)',
    source_url:
      'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
  },
  {
    id: 'fc-approval-drop',
    claim_es:
      'La aprobación de Milei cayó por debajo del 40%, con un 57,6% de desaprobación en marzo de 2025.',
    claim_en:
      "Milei's approval fell below 40%, with 57.6% disapproval in March 2025.",
    status: 'confirmed',
    source: 'Cointelegraph / UPI',
    source_url:
      'https://cointelegraph.com/news/libra-investors-lost-251-million-memecoin-javier-milei',
  },
  {
    id: 'fc-novelli-payments-2021',
    claim_es:
      'Novelli pagó a Milei $2.000/mes desde 2021 (como diputado). En abril de 2024, los pagos subieron a $4.000/mes dirigidos a Karina Milei, a través de N&W Profesional Traders.',
    claim_en:
      'Novelli paid Milei $2,000/month since 2021 (as deputy). By April 2024, payments jumped to $4,000/month directed to Karina Milei, via N&W Profesional Traders.',
    status: 'confirmed',
    source: 'DL News / MercoPress',
    source_url:
      'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
  },
  {
    id: 'fc-portnoy-tokens',
    claim_es:
      'Dave Portnoy recibió tokens LIBRA para promoción y perdió $6,3 millones.',
    claim_en:
      'Dave Portnoy received LIBRA tokens for promotion and lost $6.3M.',
    status: 'confirmed',
    source: 'Multiple outlets',
    source_url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
    detail_es:
      'Portnoy devolvió 6 millones de tokens a Davis y terminó con pérdidas netas de $6,3M.',
    detail_en:
      'Portnoy returned 6 million tokens to Davis and ended with net losses of $6.3M.',
  },

  {
    id: 'fc-second-video-plan',
    claim_es:
      'Davis reveló que Milei debía grabar un segundo video promocional. Davis fue instruido a no reinyectar fondos hasta que Milei publicara la segunda ronda de videos.',
    claim_en:
      'Davis revealed Milei was supposed to record a second promotional video. Davis was instructed not to reinject funds until Milei posted the second round of videos.',
    status: 'confirmed',
    source: 'Coffeezilla interview with Davis (Feb 17, 2025)',
    source_url:
      'https://www.youtube.com/watch?v=Ud6GuH7gSDw',
    detail_es:
      'Davis declaró: "Me dijeron: no reinyectes nada hasta el segundo video de Milei". El segundo video nunca llegó - Milei borró la publicación original. Esto contradice la defensa de Milei de que solo "compartió" información.',
    detail_en:
      'Davis stated: "I was instructed: don\'t inject anything back in until Milei\'s second video." The second video never came - Milei deleted the original post. This contradicts Milei\'s defense that he merely "shared" information.',
  },
  {
    id: 'fc-davis-sniping-admission',
    claim_es:
      'Davis admitió que su equipo usó bots para comprar tokens antes que los inversores minoristas ("sniping") en $LIBRA, $MELANIA y $TRUMP.',
    claim_en:
      'Davis admitted his team used bots to front-run retail investors ("sniping") on $LIBRA, $MELANIA, and $TRUMP.',
    status: 'confirmed',
    source: 'Coffeezilla interview (Feb 17, 2025)',
    source_url:
      'https://www.youtube.com/watch?v=Ud6GuH7gSDw',
    detail_es:
      'Una billetera que hizo sniping en $LIBRA también lo hizo en $MELANIA, generando $6M de ganancia solo por sniping. La billetera 0xcEA obtuvo $2,4M del sniping de $MELANIA y luego financió el despliegue de $LIBRA.',
    detail_en:
      'One wallet that sniped $LIBRA also sniped $MELANIA, generating $6M profit from sniping alone. Wallet 0xcEA netted $2.4M from sniping $MELANIA and then funded $LIBRA deployment.',
  },
  {
    id: 'fc-davis-unpaid-adviser',
    claim_es:
      'Davis firmó un acuerdo confidencial con el gobierno argentino como asesor no remunerado en blockchain e IA, dos semanas antes del lanzamiento del token.',
    claim_en:
      'Davis signed a confidential agreement with the Argentine government as an unpaid adviser on blockchain and AI, two weeks before the token launch.',
    status: 'confirmed',
    source: 'Clarin / Wikipedia',
    source_url:
      'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
  },
  {
    id: 'fc-davis-argentina-trip',
    claim_es:
      'Davis viajó urgentemente a Argentina el 30 de enero de 2025 para un viaje de 38 horas para firmar un pacto de confidencialidad.',
    claim_en:
      'Davis traveled urgently to Argentina on January 30, 2025 for a 38-hour trip to sign a confidentiality pact.',
    status: 'confirmed',
    source: 'Congressional commission / Infobae',
    source_url:
      'https://www.infobae.com/politica/2026/03/16/la-comision-investigadora-del-congreso-revelo-transferencias-y-contratos-en-el-caso-libra-el-presidente-tiene-que-dar-explicaciones/',
  },
  {
    id: 'fc-vulcano-game-precedent',
    claim_es:
      'Milei promovió el token "Vulcano Game" de Novelli en febrero de 2022, que luego colapsó en medio de acusaciones de fraude. Establece un patrón previo.',
    claim_en:
      'Milei promoted Novelli\'s "Vulcano Game" token in February 2022, which later collapsed amid fraud allegations. Establishes a prior pattern.',
    status: 'confirmed',
    source: 'DL News',
    source_url:
      'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
    detail_es:
      'El 18 de febrero de 2022, Milei publicó que el proyecto era "muy interesante". Esto demuestra una colaboración previa con Novelli en promociones cripto.',
    detail_en:
      'On February 18, 2022, Milei posted that the project was "very interesting." This demonstrates prior collaboration with Novelli on crypto promotions.',
  },
  {
    id: 'fc-first-buyer-insider',
    claim_es:
      'El primer comprador adquirió $LIBRA al mismo instante de la publicación de Milei a $0,216, y vendió 37 minutos después con una ganancia neta de $6,5 millones.',
    claim_en:
      "The first buyer purchased $LIBRA at the exact instant of Milei's post at $0.216, and sold 37 minutes later for a net profit of $6.5 million.",
    status: 'confirmed',
    source: 'Wikipedia / Blockchain data',
    source_url:
      'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
  },
  {
    id: 'fc-congress-planned-operation',
    claim_es:
      'La comisión del Congreso concluyó que el lanzamiento fue "una operación planificada, coordinada y ejecutada con premeditación".',
    claim_en:
      'Congressional commission concluded the launch was "a planned, coordinated, and premeditated operation."',
    status: 'confirmed',
    source: 'LMNeuquen / Congressional commission (March 2026)',
    source_url:
      'https://www.lmneuquen.com/pais/caso-libra-la-comision-investigadora-la-promocion-la-criptomoneda-fue-una-operacion-planificada-n1231806',
  },
  {
    id: 'fc-taiano-concealment',
    claim_es:
      'La analista legal Natalia Volosin acusó al fiscal Taiano de ocultar información clave del caso durante 4 meses.',
    claim_en:
      'Legal analyst Natalia Volosin accused prosecutor Taiano of concealing key case information for 4 months.',
    status: 'confirmed',
    source: 'Perfil',
    source_url:
      'https://www.perfil.com/noticias/modo-fontevecchia/natalia-volosin-taiano-oculto-4-meses-informacion-clave-para-la-causa-libra-modof.phtml',
  },
  {
    id: 'fc-stock-market-drop',
    claim_es:
      'La bolsa argentina cayó un 6% el 17 de febrero de 2025, vinculada directamente al escándalo.',
    claim_en:
      'The Argentine stock market dropped 6% on February 17, 2025, directly linked to the scandal.',
    status: 'confirmed',
    source: 'Multiple outlets',
    source_url:
      'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
  },
  {
    id: 'fc-davis-wolf-token',
    claim_es:
      'Davis lanzó un nuevo memecoin "WOLF" el 8 de marzo de 2025, que alcanzó $40M antes de colapsar. Bubblemaps rastreó la billetera desplegadora a través de 17 direcciones hasta el mismo cluster de Davis.',
    claim_en:
      'Davis launched a new memecoin "WOLF" on March 8, 2025, which peaked at $40M before crashing. Bubblemaps traced the deployer wallet through 17 addresses back to the same Davis cluster.',
    status: 'confirmed',
    source: 'CCN / Bubblemaps',
    source_url:
      'https://www.ccn.com/news/crypto/libra-hayden-davis-new-memecoin-interpol-red-notice/',
    detail_es:
      'Tokens adicionales del mismo cluster: $TRUST, $KACY, $VIBES, $HOOD, $ENRON, $BOB. Bubblemaps rastreó 5 transferencias cross-chain.',
    detail_en:
      'Additional tokens from the same cluster: $TRUST, $KACY, $VIBES, $HOOD, $ENRON, $BOB. Bubblemaps traced 5 cross-chain transfers.',
  },

  // ---- ALLEGED ----
  {
    id: 'fc-milei-paid-promotion',
    claim_es: 'Milei recibió un pago por la promoción del token.',
    claim_en: 'Milei received payment for promoting the token.',
    status: 'alleged',
    source: 'Multiple investigations',
    source_url:
      'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
    detail_es:
      'El documento de $5M fue encontrado pero está descrito como borrador sin firma. No se ha probado en sede judicial.',
    detail_en:
      'The $5M document was found but is described as a draft without a signature. Not proven in court.',
  },
  {
    id: 'fc-caputo-advance-knowledge',
    claim_es:
      'Caputo tenía conocimiento previo del lanzamiento del token.',
    claim_en: 'Caputo had advance knowledge of the token launch.',
    status: 'alleged',
    source: 'Buenos Aires Herald',
    source_url:
      'https://buenosairesherald.com/politics/libra-scandal-leaked-evidence-shows-calls-incriminating-milei-in-scam',
    detail_es:
      'Los registros telefónicos confirman la videollamada, pero el contenido de la conversación no ha sido establecido.',
    detail_en:
      'Phone records confirm the video call, but the content of the conversation has not been established.',
  },
  {
    id: 'fc-davis-karina-payments',
    claim_es:
      'Mensajes filtrados de Davis (diciembre 2023): "Yo controlo a ese tipo. Le mando plata a su hermana y él firma lo que yo diga y hace lo que yo quiera."',
    claim_en:
      'Leaked Davis messages (December 2023): "I control that guy. I send money to his sister and he signs whatever I say and does whatever I want."',
    status: 'alleged',
    source: 'La Nacion / CoinDesk',
    source_url:
      'https://www.coindesk.com/business/2025/02/17/javier-milei-memecoin-creator-also-launched-melania-admits-to-sniping-tokens',
    detail_es:
      'El portavoz de Davis negó estos mensajes. Davis declaró en entrevista con Coffeezilla: "Nunca les hice pagos, ni ellos los solicitaron."',
    detail_en:
      'Davis\'s spokesperson denied these messages. Davis stated in Coffeezilla interview: "I never made any payments to them, nor did they request any."',
  },
  {
    id: 'fc-interpol-red-notice',
    claim_es:
      'Notificación roja de Interpol emitida para Hayden Davis.',
    claim_en: 'Interpol Red Notice issued for Hayden Davis.',
    status: 'alleged',
    source: 'Fortune',
    source_url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
    detail_es:
      'El fiscal la solicitó, pero no se ha confirmado su emisión oficial por parte de Interpol.',
    detail_en:
      'The prosecutor requested it, but official issuance by Interpol has not been confirmed.',
  },

  // ---- Wave 4: Graph analysis + LLM forensic findings ----
  {
    id: 'fc-peh-highest-centrality',
    claim_es:
      'Julian Peh tiene la mayor centralidad en la red del grafo (10 conexiones), superando a Milei y Davis (7 cada uno), lo que sugiere un rol de coordinación más amplio del conocido públicamente.',
    claim_en:
      'Julian Peh has the highest centrality in the graph network (10 connections), surpassing Milei and Davis (7 each), suggesting a broader coordination role than publicly known.',
    status: 'under_investigation',
    source: 'Graph database analysis (Office of Accountability)',
    source_url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
    detail_es:
      'El análisis del grafo muestra a Peh como el nodo más conectado, vinculado a eventos, organizaciones y personas clave. Su rol como cofundador de KIP Protocol y sus conexiones con la infraestructura técnica del lanzamiento requieren mayor investigación.',
    detail_en:
      'Graph analysis shows Peh as the most connected node, linked to key events, organizations, and persons. His role as KIP Protocol co-founder and connections to the technical launch infrastructure require further investigation.',
  },
  {
    id: 'fc-cross-token-wallet-chain',
    claim_es:
      'La billetera 0xcEA que hizo sniping en $MELANIA ($2,4M de ganancia) financió directamente el despliegue de $LIBRA, demostrando que ambos esquemas estaban operativamente vinculados desde el inicio.',
    claim_en:
      'Wallet 0xcEA that sniped $MELANIA ($2.4M profit) directly funded the $LIBRA deployment, proving both schemes were operationally linked from the start.',
    status: 'confirmed',
    source: 'Bubblemaps blockchain forensics',
    source_url:
      'https://blog.bubblemaps.io/how-hayden-davis-rugged-libra-for-100m-with-president-milei/',
    detail_es:
      'Esto establece una cadena de financiamiento cross-token: las ganancias de $MELANIA fueron recicladas para desplegar $LIBRA. El patrón se repitió con $WOLF y al menos 15 tokens adicionales del mismo cluster.',
    detail_en:
      'This establishes a cross-token funding chain: $MELANIA profits were recycled to deploy $LIBRA. The pattern repeated with $WOLF and at least 15 additional tokens from the same cluster.',
  },
  {
    id: 'fc-velocity-pump-pattern',
    claim_es:
      'La velocidad del pump ($0,000001 a $5,20 en 40 minutos) es estadísticamente incompatible con compras orgánicas y requiere coordinación previa entre billeteras insiders y el momento exacto de la publicación presidencial.',
    claim_en:
      'The pump velocity ($0.000001 to $5.20 in 40 minutes) is statistically incompatible with organic buying and requires prior coordination between insider wallets and the exact timing of the presidential post.',
    status: 'confirmed',
    source: 'Blockchain data / TRM Labs / Nansen',
    source_url:
      'https://www.trmlabs.com/post/the-libra-affair-tracking-the-memecoin-that-launched-a-scandel-in-argentina',
    detail_es:
      'El análisis forense de la LLM señala que una subida de más de 5 millones por ciento en 40 minutos, con el primer comprador entrando al instante exacto de la publicación, es una firma inequívoca de coordinación previa. Los bots de sniping estaban preposicionados.',
    detail_en:
      'LLM forensic analysis notes that a 5-million-percent surge in 40 minutes, with the first buyer entering at the exact instant of the post, is an unequivocal signature of prior coordination. Sniping bots were pre-positioned.',
  },
  {
    id: 'fc-34-vs-8-wallets-gap',
    claim_es:
      'Solo 8 de las 34 direcciones vinculadas a Davis han sido rastreadas en detalle. Las 26 restantes (con parte de $124,6M en ganancias) permanecen sin identificar.',
    claim_en:
      'Only 8 of the 34 Davis-linked addresses have been traced in detail. The remaining 26 (with a portion of $124.6M in profits) remain unidentified.',
    status: 'under_investigation',
    source: 'Nansen / Chainalysis / Graph analysis',
    source_url:
      'https://research.nansen.ai/articles/libra-the-aftermath',
    detail_es:
      'El grafo solo contiene 8 nodos de billetera, pero Nansen/Chainalysis identificaron 34 direcciones vinculadas. Este déficit de 26 billeteras representa una brecha crítica en la investigación y posibles beneficiarios sin identificar.',
    detail_en:
      'The graph contains only 8 wallet nodes, but Nansen/Chainalysis identified 34 linked addresses. This 26-wallet deficit represents a critical investigation gap and potentially unidentified beneficiaries.',
  },
  {
    id: 'fc-mellino-testaferro',
    claim_es:
      'Orlando Mellino, jubilado de 75 años sin antecedentes cripto, recibio USD 1M+ de wallets de Hayden Davis y los transfirio en horas. Sospechado de ser testaferro.',
    claim_en:
      'Orlando Mellino, a 75-year-old retiree with no crypto background, received $1M+ from Hayden Davis wallets and transferred them within hours. Suspected straw man.',
    status: 'confirmed',
    source: 'elDiarioAR / Juzgado Federal No. 8',
    source_url:
      'https://www.eldiarioar.com/politica/orlando-mellino-jubilado-pasado-cripto-recibio-us-1-millon-hayden-davis_1_13002649.html',
    detail_es:
      'El juez Martinez De Giorgi ordeno el embargo de sus bienes. Mellino no tiene formacion ni historial en criptomonedas, lo que refuerza la hipotesis de lavado de dinero a traves de terceros.',
    detail_en:
      'Judge Martinez De Giorgi ordered his assets frozen. Mellino has no training or history in cryptocurrency, reinforcing the money laundering through third parties hypothesis.',
  },
  {
    id: 'fc-contract-solana-verified',
    claim_es:
      'El contrato del token $LIBRA en Solana es Bo9jh3wsmcC2AjakLWzNmKJ3SgtZmXEcSaW7L2FAvUsU. El 82% del suministro estaba desbloqueado al lanzamiento.',
    claim_en:
      'The $LIBRA token contract on Solana is Bo9jh3wsmcC2AjakLWzNmKJ3SgtZmXEcSaW7L2FAvUsU. 82% of supply was unlocked at launch.',
    status: 'confirmed',
    source: 'Solscan / Bubblemaps',
    source_url:
      'https://solscan.io/token/Bo9jh3wsmcC2AjakLWzNmKJ3SgtZmXEcSaW7L2FAvUsU',
  },
  {
    id: 'fc-circle-usdc-freeze',
    claim_es:
      'Circle congelo $57.65M USDC en dos wallets vinculadas a LIBRA ($44.59M + $13.06M) por orden judicial del SDNY el 28 de mayo de 2025.',
    claim_en:
      'Circle froze $57.65M USDC across two LIBRA-linked wallets ($44.59M + $13.06M) by SDNY court order on May 28, 2025.',
    status: 'confirmed',
    source: 'Burwick Law / SDNY TRO',
    source_url:
      'https://decrypt.co/322558/circle-freezes-58-million-usdc-solana-wallets-libra-scandal',
  },
]

// ---------------------------------------------------------------------------
// TIMELINE EVENTS
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: readonly InvestigationTimelineEvent[] = [
  {
    id: 'tl-vulcano-game',
    date: '2022-02-18',
    title_es: 'Milei promueve token "Vulcano Game" de Novelli',
    title_en: 'Milei promotes Novelli\'s "Vulcano Game" token',
    description_es:
      'Milei publicó que el proyecto cripto de Novelli era "muy interesante". Vulcano Game colapsó poco después en medio de acusaciones de fraude, estableciendo un patrón previo de colaboración en promociones cripto.',
    description_en:
      'Milei posted that Novelli\'s crypto project was "very interesting." Vulcano Game collapsed shortly after amid fraud allegations, establishing a prior pattern of collaboration on crypto promotions.',
    category: 'financial',
    sources: [
      {
        name: 'DL News',
        url: 'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-5m-document-drafted',
    date: '2024-11-01',
    title_es: 'Borrador de documento de pago de $5M redactado (Oct–Nov 2024)',
    title_en: '$5M payment document drafted (Oct–Nov 2024)',
    description_es:
      'Se redactó un documento de pago de $5 millones con estructura de 3 tramos: $1,5M anticipo, $1,5M al anunciar a Davis como asesor, $2M por contrato de consultoría firmado por Milei.',
    description_en:
      'A $5 million payment document was drafted with a 3-tier structure: $1.5M advance, $1.5M upon announcing Davis as adviser, $2M for consulting contract signed by Milei.',
    category: 'financial',
    sources: [
      {
        name: 'The Block',
        url: 'https://www.theblock.co/post/393639/probe-reveals-document-detailing-alleged-5-million-deal-linking-milei-to-libra-promotion-report',
      },
      {
        name: 'Heise',
        url: 'https://www.heise.de/en/news/Libra-crypto-scandal-Five-million-US-dollar-contract-surfaces-11212960.html',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-davis-unpaid-adviser',
    date: '2025-01-28',
    title_es: 'Davis firma como asesor no remunerado del gobierno argentino',
    title_en: 'Davis signs on as unpaid Argentine government adviser',
    description_es:
      'Davis firmó un acuerdo confidencial con el gobierno argentino como asesor especializado no remunerado en blockchain e IA, dos semanas antes del lanzamiento del token.',
    description_en:
      'Davis signed a confidential agreement with the Argentine government as an unpaid specialized adviser on blockchain and AI, two weeks before the token launch.',
    category: 'political',
    sources: [
      {
        name: 'Clarin / Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-davis-argentina-trip',
    date: '2025-01-30',
    title_es: 'Davis viaja a Argentina 38 horas para firmar pacto de confidencialidad',
    title_en: 'Davis flies to Argentina for 38-hour trip to sign confidentiality pact',
    description_es:
      'Davis viajó urgentemente a Argentina para un viaje de 38 horas para firmar un pacto de confidencialidad. Corroborado por análisis forense de dispositivos y chats de Novelli.',
    description_en:
      "Davis traveled urgently to Argentina for a 38-hour trip to sign a confidentiality pact. Corroborated through digital device forensics and Novelli's chats.",
    category: 'political',
    sources: [
      {
        name: 'Infobae / Congressional commission',
        url: 'https://www.infobae.com/politica/2026/03/16/la-comision-investigadora-del-congreso-revelo-transferencias-y-contratos-en-el-caso-libra-el-presidente-tiene-que-dar-explicaciones/',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-payment-document',
    date: '2025-02-11',
    title_es: 'Documento de $5M fechado en teléfono de Novelli (11 Feb)',
    title_en: '$5M document dated on Novelli phone (Feb 11)',
    description_es:
      'El documento de pago de $5M (redactado en Oct–Nov 2024) fue registrado en el iPhone de Novelli con fecha 11 de febrero, 3 días antes del lanzamiento.',
    description_en:
      "The $5M payment document (drafted Oct–Nov 2024) was recorded on Novelli's iPhone with a February 11 date, 3 days before launch.",
    category: 'financial',
    sources: [
      {
        name: 'MercoPress',
        url: 'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
      },
      {
        name: 'DL News',
        url: 'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-token-created',
    date: '2025-02-14',
    title_es: 'Token $LIBRA creado en Solana',
    title_en: '$LIBRA token created on Solana',
    description_es:
      'El token fue creado en la blockchain de Solana minutos antes de la publicación de Milei.',
    description_en:
      "The token was created on the Solana blockchain minutes before Milei's post.",
    category: 'financial',
    sources: [
      {
        name: 'TRM Labs',
        url: 'https://www.trmlabs.com/post/the-libra-affair-tracking-the-memecoin-that-launched-a-scandel-in-argentina',
      },
    ],
  },
  {
    id: 'tl-milei-post',
    date: '2025-02-14',
    title_es: 'Milei publica promoviendo $LIBRA (19:01 ART)',
    title_en: 'Milei posts promoting $LIBRA (7:01 PM ART)',
    description_es:
      'Milei publicó en X, Instagram y Facebook la dirección del contrato del token, invitando a apoyar "un proyecto para el crecimiento de Argentina".',
    description_en:
      'Milei posted the token contract address on X, Instagram, and Facebook, inviting people to support "a project for Argentina\'s growth".',
    category: 'political',
    sources: [
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
  },
  {
    id: 'tl-price-peak',
    date: '2025-02-14',
    title_es: 'Precio alcanza $5,20 - capitalización de $4.500M',
    title_en: 'Price hits $5.20 - $4.5B market cap',
    description_es:
      'En 40 minutos el precio subió de ~$0,000001 a $5,20. La capitalización de mercado alcanzó $4.500–4.600 millones.',
    description_en:
      'Within 40 minutes the price surged from ~$0.000001 to $5.20. Market cap reached $4.5–4.6 billion.',
    category: 'financial',
    sources: [
      {
        name: 'Cointelegraph',
        url: 'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
      },
    ],
  },
  {
    id: 'tl-insiders-extract',
    date: '2025-02-14',
    title_es: 'Billeteras internas extraen $107M',
    title_en: 'Insider wallets extract $107M',
    description_es:
      '8 billeteras internas retiraron $107 millones (57,6M USDC + 249.671 SOL) provocando el desplome del precio.',
    description_en:
      '8 insider wallets withdrew $107 million (57.6M USDC + 249,671 SOL), crashing the price.',
    category: 'financial',
    sources: [
      {
        name: 'Lookonchain / Cointelegraph',
        url: 'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
      },
    ],
  },
  {
    id: 'tl-price-crash',
    date: '2025-02-14',
    title_es: 'Precio se desploma un 94%',
    title_en: 'Price crashes 94%',
    description_es:
      'Tras las extracciones masivas, el precio colapsó un 94% desde su máximo, dejando pérdidas de $251 millones a los inversores.',
    description_en:
      'After the massive withdrawals, the price collapsed 94% from its peak, leaving $251 million in investor losses.',
    category: 'financial',
    sources: [
      {
        name: 'Nansen',
        url: 'https://research.nansen.ai/articles/libra-the-aftermath',
      },
      {
        name: 'Cointelegraph',
        url: 'https://cointelegraph.com/news/libra-investors-lost-251-million-memecoin-javier-milei',
      },
    ],
  },
  {
    id: 'tl-caputo-videocall',
    date: '2025-02-14',
    title_es: 'Videollamada de Caputo con Novelli y Karina Milei (23:37)',
    title_en: 'Caputo video call with Novelli and Karina Milei (11:37 PM)',
    description_es:
      'Santiago Caputo participó en una videollamada de 4 minutos y 37 segundos con Novelli y Karina Milei la noche del lanzamiento.',
    description_en:
      'Santiago Caputo joined a 4-minute-37-second video call with Novelli and Karina Milei on launch night.',
    category: 'political',
    sources: [
      {
        name: 'Buenos Aires Herald',
        url: 'https://buenosairesherald.com/politics/libra-scandal-leaked-evidence-shows-calls-incriminating-milei-in-scam',
      },
    ],
  },
  {
    id: 'tl-first-buyer-profit',
    date: '2025-02-14',
    title_es: 'Primer comprador obtiene $6,5M de ganancia en 37 minutos',
    title_en: 'First buyer makes $6.5M profit in 37 minutes',
    description_es:
      'El primer comprador de $LIBRA adquirió tokens al instante exacto de la publicación de Milei a $0,216 por token. Vendió la mayoría 37 minutos después con una ganancia neta de $6,5 millones.',
    description_en:
      "The first $LIBRA buyer purchased tokens at the exact instant of Milei's post at $0.216 per token. Sold most 37 minutes later for a net profit of $6.5 million.",
    category: 'financial',
    sources: [
      {
        name: 'Wikipedia / Blockchain data',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-milei-deletes-post',
    date: '2025-02-15',
    title_es: 'Milei borra las publicaciones',
    title_en: 'Milei deletes the posts',
    description_es:
      'Milei eliminó las publicaciones promocionales de todas las plataformas tras la caída del precio.',
    description_en:
      'Milei deleted the promotional posts from all platforms after the price crash.',
    category: 'political',
    sources: [
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
  },
  {
    id: 'tl-bubblemaps-report',
    date: '2025-02-17',
    title_es: 'Bubblemaps identifica manipulación de suministro',
    title_en: 'Bubblemaps identifies supply manipulation',
    description_es:
      'La firma de análisis Bubblemaps reveló que el 82% del suministro estaba desbloqueado y que Davis/Kelsier estuvieron detrás del token $MELANIA.',
    description_en:
      'Analytics firm Bubblemaps revealed that 82% of supply was unlocked and that Davis/Kelsier were behind the $MELANIA token.',
    category: 'media',
    sources: [
      {
        name: 'Cointelegraph',
        url: 'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
      },
    ],
  },
  {
    id: 'tl-nansen-report',
    date: '2025-02-17',
    title_es: 'Nansen confirma: 86% de traders perdieron $251M',
    title_en: 'Nansen confirms: 86% of traders lost $251M',
    description_es:
      'Nansen Research publicó su análisis confirmando que el 86% de los traders sufrieron pérdidas por un total de $251 millones.',
    description_en:
      'Nansen Research published its analysis confirming that 86% of traders suffered losses totaling $251 million.',
    category: 'media',
    sources: [
      {
        name: 'Nansen Research',
        url: 'https://research.nansen.ai/articles/libra-the-aftermath',
      },
    ],
  },
  {
    id: 'tl-opposition-committee',
    date: '2025-02-16',
    title_es: '12 legisladores opositores crean comisión investigadora',
    title_en: '12 opposition lawmakers establish investigation committee',
    description_es:
      'Legisladores de la oposición establecieron una comisión investigadora en el Congreso para examinar el escándalo cripto.',
    description_en:
      'Opposition lawmakers established an investigation committee in Congress to examine the crypto scandal.',
    category: 'political',
    sources: [
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-coffeezilla-interview',
    date: '2025-02-17',
    title_es: 'Coffeezilla publica entrevista con Davis: admite ~$100M y sniping',
    title_en: 'Coffeezilla publishes Davis interview: admits ~$100M and sniping',
    description_es:
      'El investigador Coffeezilla publicó una entrevista con Hayden Davis donde este admitió controlar ~$100M, haber hecho sniping en $LIBRA y $MELANIA, y reveló el plan del "segundo video" de Milei. Davis describió los fondos como "custodia" y ofreció devolverlos.',
    description_en:
      'Investigator Coffeezilla published an interview with Hayden Davis where he admitted controlling ~$100M, sniping $LIBRA and $MELANIA, and revealed the "second video" plan with Milei. Davis described the funds as "custodied" and offered to return them.',
    category: 'media',
    sources: [
      {
        name: 'Coffeezilla (YouTube)',
        url: 'https://www.youtube.com/watch?v=Ud6GuH7gSDw',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-stock-market-drop',
    date: '2025-02-17',
    title_es: 'Bolsa argentina cae 6% por el escándalo',
    title_en: 'Argentine stock market drops 6% due to scandal',
    description_es:
      'La bolsa argentina registró una caída del 6%, vinculada directamente al escándalo $LIBRA y la incertidumbre política generada.',
    description_en:
      'The Argentine stock market dropped 6%, directly linked to the $LIBRA scandal and the political uncertainty it generated.',
    category: 'financial',
    sources: [
      {
        name: 'Multiple outlets',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-milei-first-defense',
    date: '2025-02-18',
    title_es: 'Primera defensa pública de Milei',
    title_en: "Milei's first public defense",
    description_es:
      'Milei defendió públicamente sus acciones, afirmando que no sabía los detalles del proyecto y que simplemente difundió información.',
    description_en:
      'Milei publicly defended his actions, claiming he did not know the details of the project and merely shared information.',
    category: 'political',
    sources: [
      {
        name: 'Bloomberg',
        url: 'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
      },
    ],
  },
  {
    id: 'tl-criminal-complaint',
    date: '2025-02-19',
    title_es: 'Denuncias penales presentadas contra Milei',
    title_en: 'Criminal complaints filed against Milei',
    description_es:
      'Múltiples denuncias penales fueron presentadas ante la justicia argentina contra Milei y los promotores del token.',
    description_en:
      'Multiple criminal complaints were filed in Argentine courts against Milei and the token promoters.',
    category: 'legal',
    sources: [
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
  },
  {
    id: 'tl-trm-labs-report',
    date: '2025-02-20',
    title_es: 'TRM Labs publica rastreo completo de fondos',
    title_en: 'TRM Labs publishes complete fund tracing',
    description_es:
      'TRM Labs rastreó los movimientos en cadena, documentando cómo los fondos fluyeron de los inversores a las billeteras internas.',
    description_en:
      'TRM Labs traced on-chain movements, documenting how funds flowed from investors to insider wallets.',
    category: 'media',
    sources: [
      {
        name: 'TRM Labs',
        url: 'https://www.trmlabs.com/post/the-libra-affair-tracking-the-memecoin-that-launched-a-scandel-in-argentina',
      },
    ],
  },
  {
    id: 'tl-us-class-action',
    date: '2025-02-21',
    title_es: 'Demanda colectiva en EE.UU.: Hurlock v. Kelsier Ventures',
    title_en: 'US class action: Hurlock v. Kelsier Ventures',
    description_es:
      'Se presentó demanda colectiva en el Distrito Sur de Nueva York (Caso 1:25-cv-03891) contra Kelsier Ventures y los promotores.',
    description_en:
      'A class action suit was filed in the Southern District of New York (Case 1:25-cv-03891) against Kelsier Ventures and the promoters.',
    category: 'legal',
    sources: [
      {
        name: 'Court records / Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
  },
  {
    id: 'tl-impeachment-request',
    date: '2025-02-24',
    title_es: 'Pedido de juicio político contra Milei',
    title_en: 'Impeachment request filed against Milei',
    description_es:
      'Legisladores de la oposición presentaron un pedido de juicio político contra Milei por su rol en la promoción del token.',
    description_en:
      'Opposition lawmakers filed an impeachment request against Milei for his role in promoting the token.',
    category: 'political',
    sources: [
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
  },
  {
    id: 'tl-approval-drop',
    date: '2025-03-01',
    title_es: 'Aprobación de Milei cae al 40%, desaprobación al 57,6%',
    title_en: "Milei's approval drops to 40%, disapproval hits 57.6%",
    description_es:
      'Encuestas mostraron que la aprobación de Milei cayó por debajo del 40%, con un 57,6% de desaprobación, vinculado directamente al escándalo.',
    description_en:
      "Polls showed Milei's approval fell below 40%, with 57.6% disapproval, directly linked to the scandal.",
    category: 'political',
    sources: [
      {
        name: 'Cointelegraph',
        url: 'https://cointelegraph.com/news/libra-investors-lost-251-million-memecoin-javier-milei',
      },
    ],
  },
  {
    id: 'tl-interpol-request',
    date: '2025-03-13',
    title_es: 'Fiscal solicita notificación roja de Interpol para Davis',
    title_en: 'Prosecutor requests Interpol Red Notice for Davis',
    description_es:
      'El fiscal solicitó una notificación roja de Interpol para la captura internacional de Hayden Davis.',
    description_en:
      'The prosecutor requested an Interpol Red Notice for the international capture of Hayden Davis.',
    category: 'legal',
    sources: [
      {
        name: 'Fortune / Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
  },
  {
    id: 'tl-asset-freeze-us',
    date: '2025-03-15',
    title_es: 'Tribunal de EE.UU. congela activos de Davis y Chow',
    title_en: 'US court freezes Davis and Chow assets',
    description_es:
      'Un tribunal de Manhattan ordenó el congelamiento de los activos cripto de Davis y Chow, incluyendo $57,6 millones.',
    description_en:
      "A Manhattan court ordered the freezing of Davis and Chow's crypto assets, including $57.6 million.",
    category: 'legal',
    sources: [
      {
        name: 'Decrypt',
        url: 'https://decrypt.co/336060/libra-promoters-regain-access-57-6-million-crypto-judge-unfreezes-assets',
      },
    ],
  },
  {
    id: 'tl-davis-wolf-token',
    date: '2025-03-08',
    title_es: 'Davis lanza nuevo memecoin "WOLF" pese a solicitud de Interpol',
    title_en: 'Davis launches new memecoin "WOLF" despite Interpol request',
    description_es:
      'Davis lanzó el token WOLF, que alcanzó $40M antes de colapsar. Bubblemaps rastreó la billetera desplegadora a través de 17 direcciones y 5 transferencias cross-chain hasta el mismo cluster de Davis.',
    description_en:
      'Davis launched the WOLF token, which peaked at $40M before crashing. Bubblemaps traced the deployer wallet through 17 addresses and 5 cross-chain transfers back to the same Davis cluster.',
    category: 'financial',
    sources: [
      {
        name: 'CCN',
        url: 'https://www.ccn.com/news/crypto/libra-hayden-davis-new-memecoin-interpol-red-notice/',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-novelli-terrones-transfer',
    date: '2025-04-01',
    title_es: 'Novelli y Terrones Godoy transfieren hasta $500K en cripto',
    title_en: 'Novelli and Terrones Godoy transfer up to $500K in crypto',
    description_es:
      'Antes de la congelación de activos, Novelli y Terrones Godoy transfirieron hasta $500.000 en criptomonedas.',
    description_en:
      'Before the asset freeze, Novelli and Terrones Godoy transferred up to $500,000 in cryptocurrency.',
    category: 'financial',
    sources: [
      {
        name: 'DL News',
        url: 'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
      },
    ],
  },
  {
    id: 'tl-servini-asset-freeze',
    date: '2025-05-14',
    title_es: 'Jueza Servini congela activos y levanta secreto bancario de Milei y Karina',
    title_en: 'Judge Servini freezes assets and lifts banking secrecy for Milei and Karina',
    description_es:
      'La jueza María Servini ordenó el congelamiento de activos de Novelli, Terrones Godoy y Morales, y levantó el secreto bancario de Javier y Karina Milei.',
    description_en:
      'Judge María Servini ordered the asset freeze of Novelli, Terrones Godoy, and Morales, and lifted banking secrecy for Javier and Karina Milei.',
    category: 'legal',
    sources: [
      {
        name: 'Cointelegraph',
        url: 'https://cointelegraph.com/news/argentina-freezes-assets-libra-token-scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-uti-disbanded',
    date: '2025-05-20',
    title_es: 'Gobierno disuelve la UTI (Decreto 332/2025)',
    title_en: 'Government disbands UTI (Decree 332/2025)',
    description_es:
      'El gobierno de Milei disolvió la Unidad de Tareas de Investigación que estaba investigando el escándalo cripto, mediante el Decreto 332/2025.',
    description_en:
      "Milei's government disbanded the Investigation Task Unit that was probing the crypto scandal, via Decree 332/2025.",
    category: 'coverup',
    sources: [
      {
        name: 'Bloomberg',
        url: 'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
      },
    ],
  },
  {
    id: 'tl-anticorruption-cleared',
    date: '2025-06-07',
    title_es: 'Oficina Anticorrupción absuelve a Milei',
    title_en: 'Anti-Corruption Office clears Milei',
    description_es:
      'La Oficina Anticorrupción, dependiente del Poder Ejecutivo, determinó que Milei no cometió irregularidades.',
    description_en:
      'The Anti-Corruption Office, which reports to the Executive Branch, determined that Milei committed no irregularities.',
    category: 'coverup',
    sources: [
      {
        name: 'Bloomberg',
        url: 'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
      },
    ],
  },
  {
    id: 'tl-assets-unfrozen',
    date: '2025-08-15',
    title_es: 'Juez de Manhattan descongela $57,6M de Davis',
    title_en: 'Manhattan judge unfreezes $57.6M Davis assets',
    description_es:
      'Un juez federal de Manhattan levantó la orden de congelamiento de $57,6 millones en activos de Davis y Chow.',
    description_en:
      'A Manhattan federal judge lifted the freeze order on $57.6 million in Davis and Chow assets.',
    category: 'legal',
    sources: [
      {
        name: 'Decrypt',
        url: 'https://decrypt.co/336060/libra-promoters-regain-access-57-6-million-crypto-judge-unfreezes-assets',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-broader-class-action',
    date: '2025-10-01',
    title_es: 'Demanda colectiva ampliada: 15 tokens en esquema coordinado',
    title_en: 'Broader class action: 15 tokens in coordinated scheme',
    description_es:
      'Davis y Chow fueron nombrados en una demanda colectiva ampliada que alega que 15 tokens, incluyendo $MELANIA, formaban parte de un esquema coordinado de manipulación.',
    description_en:
      "Davis and Chow were named in a broader class action alleging that 15 tokens, including $MELANIA, were part of a coordinated manipulation scheme.",
    category: 'legal',
    sources: [
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-congressional-report',
    date: '2025-11-18',
    title_es: 'Informe del Congreso: "colaboración esencial" de Milei',
    title_en: 'Congressional report: Milei\'s "essential collaboration"',
    description_es:
      'La comisión investigadora del Congreso publicó su informe concluyendo que Milei prestó "colaboración esencial" al fraude, documentando 16 reuniones con promotores y 114.410 billeteras afectadas.',
    description_en:
      'The congressional investigation commission published its report concluding that Milei provided "essential collaboration" to the fraud, documenting 16 meetings with promoters and 114,410 affected wallets.',
    category: 'legal',
    sources: [
      {
        name: 'Buenos Aires Herald',
        url: 'https://buenosairesherald.com/politics/libra-crypto-scandal-milei-used-presidential-role-to-spread-alleged-scam-congress-report-concludes',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-one-year-anniversary',
    date: '2026-02-14',
    title_es: 'Un año sin imputaciones ni testigos citados',
    title_en: 'One year: zero indictments, no witnesses summoned',
    description_es:
      'Se cumplió un año del escándalo sin que el fiscal Taiano hubiera emitido imputaciones ni citado testigos clave.',
    description_en:
      'One year passed since the scandal without prosecutor Taiano issuing indictments or summoning key witnesses.',
    category: 'coverup',
    sources: [
      {
        name: 'Buenos Aires Times',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-5m-document-revealed',
    date: '2026-03-16',
    title_es:
      'Análisis forense revela documento de $5M en teléfono de Novelli',
    title_en:
      "Forensic analysis reveals $5M document on Novelli's phone",
    description_es:
      'El análisis forense del iPhone de Novelli reveló un documento de pago de $5 millones fechado el 11 de febrero, tres días antes del lanzamiento.',
    description_en:
      "Forensic analysis of Novelli's iPhone revealed a $5 million payment document dated February 11, three days before launch.",
    category: 'legal',
    sources: [
      {
        name: 'MercoPress',
        url: 'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
      },
      {
        name: 'DL News',
        url: 'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-congress-demands-explanations',
    date: '2026-03-16',
    title_es: 'Comisión del Congreso exige explicaciones a Milei',
    title_en: 'Congressional commission demands explanations from Milei',
    description_es:
      'La comisión investigadora del Congreso exigió explicaciones formales a Milei tras la revelación del documento de $5 millones.',
    description_en:
      'The congressional investigation commission demanded formal explanations from Milei following the $5 million document revelation.',
    category: 'political',
    sources: [
      {
        name: 'Infobae',
        url: 'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-congress-planned-conclusion',
    date: '2026-03-16',
    title_es: 'Comisión concluye: "operación planificada, coordinada y premeditada"',
    title_en: 'Commission concludes: "planned, coordinated, premeditated operation"',
    description_es:
      'La comisión investigadora del Congreso emitió su conclusión formal: el lanzamiento y promoción de $LIBRA "no fue improvisado ni accidental, fue una operación planificada, coordinada y ejecutada con premeditación."',
    description_en:
      'The congressional investigation commission issued its formal conclusion: the launch and promotion of $LIBRA "was not improvised or accidental, it was a planned, coordinated, and premeditated operation."',
    category: 'political',
    sources: [
      {
        name: 'LMNeuquen',
        url: 'https://www.lmneuquen.com/pais/caso-libra-la-comision-investigadora-la-promocion-la-criptomoneda-fue-una-operacion-planificada-n1231806',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-interpellation-demand',
    date: '2026-03-16',
    title_es: 'Comisión exige interpelación de Karina Milei y Manuel Adorni',
    title_en: 'Commission demands interpellation of Karina Milei and Manuel Adorni',
    description_es:
      'La comisión investigadora solicitó la interpelación formal de Karina Milei (por participación directa como funcionaria con rango ministerial) y del vocero Manuel Adorni.',
    description_en:
      'The investigation commission demanded the formal interpellation of Karina Milei (for direct participation as an official with ministerial rank) and spokesman Manuel Adorni.',
    category: 'political',
    sources: [
      {
        name: 'Infobae',
        url: 'https://www.infobae.com/politica/2026/03/16/causa-libra-todos-los-pedidos-de-la-comision-investigadora-que-encabeza-la-oposicion-en-el-congreso/',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-prosecutor-obstruction',
    date: '2026-03-17',
    title_es:
      'Oposición busca remoción del fiscal Taiano por obstrucción',
    title_en:
      'Opposition seeks prosecutor Taiano removal for obstruction',
    description_es:
      'Legisladores de la oposición presentaron denuncia contra el fiscal Taiano por presunta obstrucción. La analista Volosin acusó a Taiano de ocultar información clave durante 4 meses.',
    description_en:
      'Opposition lawmakers filed a complaint against prosecutor Taiano for alleged obstruction. Analyst Volosin accused Taiano of concealing key information for 4 months.',
    category: 'legal',
    sources: [
      {
        name: 'MercoPress',
        url: 'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
      },
      {
        name: 'Perfil',
        url: 'https://www.perfil.com/noticias/modo-fontevecchia/natalia-volosin-taiano-oculto-4-meses-informacion-clave-para-la-causa-libra-modof.phtml',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-graph-analysis-wave4',
    date: '2026-03-20',
    title_es: 'Análisis forense del grafo revela centralidad de Peh y brecha de 26 billeteras',
    title_en: 'Graph forensic analysis reveals Peh centrality and 26-wallet gap',
    description_es:
      'El análisis automatizado del grafo de investigación (106 nodos, 144 aristas) reveló que Julian Peh tiene la mayor centralidad (10 conexiones), superando a Milei y Davis. También identificó que solo 8 de 34 billeteras vinculadas han sido rastreadas, dejando 26 sin identificar. La cadena de financiamiento cross-token ($MELANIA → $LIBRA → $WOLF) fue confirmada por datos de Bubblemaps.',
    description_en:
      'Automated analysis of the investigation graph (106 nodes, 144 edges) revealed Julian Peh has the highest centrality (10 connections), surpassing Milei and Davis. Also identified that only 8 of 34 linked wallets have been traced, leaving 26 unidentified. The cross-token funding chain ($MELANIA → $LIBRA → $WOLF) was confirmed by Bubblemaps data.',
    category: 'media',
    sources: [
      {
        name: 'Office of Accountability graph analysis',
        url: 'https://blog.bubblemaps.io/how-hayden-davis-rugged-libra-for-100m-with-president-milei/',
      },
    ],
    is_new: true,
  },
  {
    id: 'tl-government-sidelines',
    date: '2026-03-17',
    title_es: 'Gobierno dice que "se mantendrá al margen" del caso',
    title_en: 'Government says it "will stay on the sidelines"',
    description_es:
      'El gobierno de Milei declaró que se mantendrá al margen del caso Libra y minimizó el impacto de las nuevas revelaciones de la comisión investigadora.',
    description_en:
      "Milei's government stated it will remain uninvolved in the Libra case and minimized the impact of the new revelations from the investigation commission.",
    category: 'coverup',
    sources: [
      {
        name: 'Infobae',
        url: 'https://www.infobae.com/politica/2026/03/17/el-gobierno-afirma-que-se-mantendra-al-margen-del-caso-libra-y-minimiza-el-impacto-de-las-nuevas-revelaciones/',
      },
    ],
    is_new: true,
  },
]

// ---------------------------------------------------------------------------
// ACTORS
// ---------------------------------------------------------------------------

export const ACTORS: readonly Actor[] = [
  // ---- Original actors ----
  {
    id: 'actor-milei',
    name: 'Javier Milei',
    role_es: 'Presidente de Argentina',
    role_en: 'President of Argentina',
    description_es:
      'Publicó la dirección del contrato de $LIBRA en sus redes sociales el 14 de febrero de 2025, desencadenando la compra masiva que llevó al pico de $4.500M.',
    description_en:
      'Posted the $LIBRA contract address on his social media on February 14, 2025, triggering the massive buying spree that led to the $4.5B peak.',
    nationality: 'Argentine',
    status_es:
      'Absuelto por la Oficina Anticorrupción; bajo investigación judicial',
    status_en:
      'Cleared by the Anti-Corruption Office; under judicial investigation',
  },
  {
    id: 'actor-karina-milei',
    name: 'Karina Milei',
    role_es:
      'Secretaria General de la Presidencia, hermana de Javier Milei',
    role_en:
      "Secretary General of the Presidency, Javier Milei's sister",
    description_es:
      'Participó en la videollamada nocturna con Caputo y Novelli. Destinataria directa de los pagos de Novelli ($4.000/mes desde abril 2024). Mensajes filtrados de Davis alegan que recibía dinero para que Milei "firmara lo que yo diga". Secreto bancario levantado por la jueza Servini. Interpelación solicitada por la comisión del Congreso.',
    description_en:
      "Participated in the late-night video call with Caputo and Novelli. Direct recipient of Novelli's payments ($4,000/month from April 2024). Leaked Davis messages allege she received money so Milei would 'sign whatever I say.' Banking secrecy lifted by Judge Servini. Interpellation demanded by congressional commission.",
    nationality: 'Argentine',
    status_es: 'Secreto bancario levantado; interpelación solicitada',
    status_en: 'Banking secrecy lifted; interpellation demanded',
  },
  {
    id: 'actor-hayden-davis',
    name: 'Hayden Davis',
    role_es: 'CEO de Kelsier Ventures, promotor principal del token',
    role_en: 'CEO of Kelsier Ventures, primary token promoter',
    description_es:
      'Texano de 28 años, autodenominado "estratega de lanzamiento". Cerebro financiero detrás de $LIBRA, $MELANIA, $WOLF, $TRUST, $KACY y otros tokens. Admitió sniping y controlar ~$100M. Firmó como asesor no remunerado del gobierno argentino en enero de 2025. Viajó 38 horas a Argentina para pacto de confidencialidad. Mensajes filtrados alegan pagos a Karina Milei. Activos de $57,6M congelados y luego descongelados.',
    description_en:
      '28-year-old Texan, self-described "launch strategist." Financial mastermind behind $LIBRA, $MELANIA, $WOLF, $TRUST, $KACY and other tokens. Admitted to sniping and controlling ~$100M. Signed as unpaid Argentine government adviser in January 2025. Flew 38 hours to Argentina for confidentiality pact. Leaked messages allege payments to Karina Milei. $57.6M assets frozen then unfrozen.',
    nationality: 'American',
    status_es:
      'Demandado en EE.UU.; solicitud de Interpol pendiente; lanzó nuevos tokens pese a investigación',
    status_en:
      'Sued in the US; Interpol request pending; launched new tokens despite investigation',
  },
  {
    id: 'actor-santiago-caputo',
    name: 'Santiago Caputo',
    role_es: 'Asesor estratégico del presidente Milei',
    role_en: "President Milei's strategic adviser",
    description_es:
      'Participó en videollamada de 4 min 37 s con Novelli y Karina Milei a las 23:37 la noche del lanzamiento. Los registros confirman el contacto pero no el contenido.',
    description_en:
      'Joined a 4 min 37 s video call with Novelli and Karina Milei at 11:37 PM on launch night. Records confirm the contact but not the content.',
    nationality: 'Argentine',
    status_es: 'Mencionado en investigación; no imputado',
    status_en: 'Mentioned in investigation; not indicted',
  },
  {
    id: 'actor-julian-peh',
    name: 'Julian Peh',
    role_es: 'Co-fundador/CEO de KIP Protocol, intermediario tecnológico',
    role_en: 'KIP Protocol co-founder/CEO, technology intermediary',
    description_es:
      'Co-fundador y CEO de KIP Protocol. Vinculado a la infraestructura tecnológica del lanzamiento del token. Afirmó no tener participación directa pese a sus asociaciones iniciales con la red de promotores.',
    description_en:
      'Co-founder and CEO of KIP Protocol. Linked to the technical infrastructure of the token launch. Claimed no direct involvement despite initial associations with the promoter network.',
    nationality: 'Argentine',
    status_es: 'Bajo investigación; niega participación directa',
    status_en: 'Under investigation; denies direct involvement',
  },
  {
    id: 'actor-mauricio-novelli',
    name: 'Mauricio Novelli',
    role_es: 'Lobista y operador político',
    role_en: 'Lobbyist and political operator',
    description_es:
      'Intermediario clave entre Davis y el círculo de Milei. Su teléfono reveló más de 30 contactos con Milei la noche del lanzamiento y un documento de pago de $5M. Pagó a Milei desde 2021 por clases de Zoom.',
    description_en:
      "Key intermediary between Davis and Milei's inner circle. His phone revealed 30+ contacts with Milei on launch night and a $5M payment document. Paid Milei since 2021 for Zoom classes.",
    nationality: 'Argentine',
    status_es: 'Bajo investigación; teléfono confiscado',
    status_en: 'Under investigation; phone seized',
  },
  {
    id: 'actor-monica-terrones',
    name: 'Manuel Terrones Godoy',
    role_es: 'Asociado de Novelli',
    role_en: "Novelli's associate",
    description_es:
      'Vinculado a transferencias de hasta $500.000 en criptomonedas antes de la congelación de activos. Activos congelados por la jueza Servini en mayo de 2025.',
    description_en:
      "Linked to transfers of up to $500,000 in cryptocurrency before the asset freeze. Assets frozen by Judge Servini in May 2025.",
    nationality: 'Argentine',
    status_es: 'Bajo investigación; activos congelados',
    status_en: 'Under investigation; assets frozen',
  },
  {
    id: 'actor-sergio-morales',
    name: 'Sergio Morales',
    role_es: 'Promotor vinculado a la red de lanzamiento',
    role_en: 'Promoter linked to the launch network',
    description_es:
      'Vinculado a la red de promotores del token $LIBRA.',
    description_en: 'Linked to the $LIBRA token promoter network.',
    nationality: 'Argentine',
    status_es: 'Bajo investigación',
    status_en: 'Under investigation',
  },
  // ---- New actors ----
  {
    id: 'actor-demian-reidel',
    name: 'Demian Reidel',
    role_es: 'Presidente del Consejo de Asesores / empresa nuclear estatal',
    role_en: 'Chairman of the Council of Advisors / state nuclear company',
    description_es:
      'Presidente del Consejo de Asesores y de la empresa estatal de energía nuclear. Registros telefónicos muestran comunicaciones con Novelli. Afirmó que no hizo "nada" con cripto y que solo participó en "control de daños".',
    description_en:
      'Chairman of the Council of Advisors and president of the state nuclear power company. Phone records show communications with Novelli. Claimed he did "nothing" with crypto and only participated in "damage control."',
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Mencionado en registros; niega participación',
    status_en: 'Mentioned in records; denies involvement',
  },
  {
    id: 'actor-ben-chow',
    name: 'Ben Chow',
    role_es: 'Co-demandado con Davis en causa estadounidense',
    role_en: 'Co-defendant with Davis in US case',
    description_es:
      'Activos congelados junto con Davis por $57,6 millones por un tribunal de Manhattan. Activos posteriormente descongelados en agosto de 2025.',
    description_en:
      'Assets frozen alongside Davis for $57.6 million by a Manhattan court. Assets subsequently unfrozen in August 2025.',
    nationality: 'American',
    is_new: true,
    status_es: 'Co-demandado en causa federal de EE.UU.',
    status_en: 'Co-defendant in US federal case',
  },
  {
    id: 'actor-dave-portnoy',
    name: 'Dave Portnoy',
    role_es: 'Fundador de Barstool Sports, promotor pagado',
    role_en: 'Barstool Sports founder, paid promoter',
    description_es:
      'Recibió tokens LIBRA para promocionar el proyecto. Devolvió 6 millones de tokens a Davis y terminó con pérdidas netas de $6,3 millones.',
    description_en:
      'Received LIBRA tokens to promote the project. Returned 6 million tokens to Davis and ended with net losses of $6.3 million.',
    nationality: 'American',
    is_new: true,
    status_es: 'Víctima y promotor; no imputado',
    status_en: 'Victim and promoter; not indicted',
  },
  {
    id: 'actor-maximiliano-ferraro',
    name: 'Maximiliano Ferraro',
    role_es:
      'Presidente de la comisión investigadora del Congreso',
    role_en:
      'President of the congressional investigation commission',
    description_es:
      'Lideró la comisión del Congreso que investigó el escándalo y publicó el informe concluyendo la "colaboración esencial" de Milei.',
    description_en:
      'Led the congressional commission that investigated the scandal and published the report concluding Milei\'s "essential collaboration".',
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Legislador en funciones',
    status_en: 'Sitting legislator',
  },
  {
    id: 'actor-judge-martinez',
    name: 'Judge Martinez de Giorgi',
    role_es: 'Juez federal a cargo de la causa penal',
    role_en: 'Federal judge overseeing the criminal case',
    description_es:
      'Juez federal a cargo de la investigación penal del caso Libra en Argentina.',
    description_en:
      'Federal judge overseeing the criminal investigation of the Libra case in Argentina.',
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Juez en funciones',
    status_en: 'Sitting judge',
  },
  {
    id: 'actor-eduardo-taiano',
    name: 'Eduardo Taiano',
    role_es: 'Fiscal federal a cargo de la investigación',
    role_en: 'Federal prosecutor leading the investigation',
    description_es:
      'Fiscal federal que no emitió imputaciones ni citó testigos clave en más de un año. Acusado por la analista Volosin de ocultar información clave durante 4 meses. La oposición presentó denuncia ante el Tribunal Disciplinario del Ministerio Público.',
    description_en:
      'Federal prosecutor who issued no indictments and summoned no key witnesses in over a year. Accused by analyst Volosin of concealing key information for 4 months. Opposition filed complaint at the Public Prosecutor\'s Disciplinary Court.',
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Denunciado por obstrucción y ocultamiento',
    status_en: 'Accused of obstruction and concealment',
  },
  {
    id: 'actor-maria-servini',
    name: 'María Servini',
    role_es: 'Jueza federal - primera investigación penal',
    role_en: 'Federal judge - initial criminal investigation',
    description_es:
      'Jueza federal que emitió las primeras órdenes de congelamiento de activos de Novelli, Terrones Godoy y Morales. Levantó el secreto bancario de Javier y Karina Milei. Davis le ofreció devolver $100M como gesto de "buena fe".',
    description_en:
      "Federal judge who issued the first asset freeze orders on Novelli, Terrones Godoy, and Morales. Lifted banking secrecy for Javier and Karina Milei. Davis offered to return $100M to her as a 'good faith' gesture.",
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Jueza en funciones',
    status_en: 'Sitting judge',
  },
  {
    id: 'actor-manuel-adorni',
    name: 'Manuel Adorni',
    role_es: 'Vocero presidencial',
    role_en: 'Presidential spokesman',
    description_es:
      'Vocero del gobierno de Milei. La comisión investigadora del Congreso exigió su interpelación formal junto con Karina Milei.',
    description_en:
      "Milei government's spokesman. The congressional investigation commission demanded his formal interpellation alongside Karina Milei.",
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Interpelación solicitada por el Congreso',
    status_en: 'Interpellation demanded by Congress',
  },
  {
    id: 'actor-gregorio-dalbon',
    name: 'Gregorio Dalbón',
    role_es: 'Abogado - solicitó notificación roja de Interpol',
    role_en: 'Lawyer - filed Interpol Red Notice request',
    description_es:
      'Abogado argentino que presentó la solicitud formal de notificación roja de Interpol para la captura internacional de Hayden Davis.',
    description_en:
      'Argentine lawyer who filed the formal request for an Interpol Red Notice for the international capture of Hayden Davis.',
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Abogado querellante',
    status_en: 'Plaintiff\'s attorney',
  },
  {
    id: 'actor-gideon-davis',
    name: 'Gideon Davis',
    role_es: 'Familiar de Hayden Davis, co-demandado',
    role_en: "Hayden Davis's relative, co-defendant",
    description_es:
      'Nombrado como co-demandado en la causa Hurlock v. Kelsier Ventures en Nueva York.',
    description_en:
      'Named as co-defendant in the Hurlock v. Kelsier Ventures case in New York.',
    nationality: 'American',
    is_new: true,
    status_es: 'Co-demandado en causa federal de EE.UU.',
    status_en: 'Co-defendant in US federal case',
  },
  {
    id: 'actor-thomas-davis',
    name: 'Thomas Davis',
    role_es: 'Familiar de Hayden Davis, co-demandado',
    role_en: "Hayden Davis's relative, co-defendant",
    description_es:
      'Nombrado como co-demandado en la causa Hurlock v. Kelsier Ventures en Nueva York.',
    description_en:
      'Named as co-defendant in the Hurlock v. Kelsier Ventures case in New York.',
    nationality: 'American',
    is_new: true,
    status_es: 'Co-demandado en causa federal de EE.UU.',
    status_en: 'Co-defendant in US federal case',
  },
  {
    id: 'actor-orlando-mellino',
    name: 'Orlando Rodolfo Mellino',
    role_es: 'Operador argentino vinculado a Davis',
    role_en: 'Argentine operator linked to Davis',
    description_es:
      'Nombrado en la orden de congelamiento del juez Martínez de Giorgi junto con Davis y Rodríguez Blanco. Activos digitales, cuentas bancarias y bienes inmuebles congelados.',
    description_en:
      "Named in Judge Martínez de Giorgi's asset freeze order alongside Davis and Rodríguez Blanco. Digital wallets, bank accounts, and real estate frozen.",
    nationality: 'Argentine',
    is_new: true,
    status_es: 'Activos congelados',
    status_en: 'Assets frozen',
  },
  {
    id: 'actor-rodriguez-blanco',
    name: 'Favio Camilo Rodríguez Blanco',
    role_es: 'Trader colombiano vinculado a la red de Davis',
    role_en: "Colombian trader linked to Davis's network",
    description_es:
      'Nombrado en la orden de congelamiento del juez Martínez de Giorgi. Vinculado a la operación de billeteras de Davis.',
    description_en:
      "Named in Judge Martínez de Giorgi's asset freeze order. Linked to Davis's wallet operations.",
    nationality: 'Colombian',
    is_new: true,
    status_es: 'Activos congelados',
    status_en: 'Assets frozen',
  },
]

// ---------------------------------------------------------------------------
// MONEY FLOWS
// ---------------------------------------------------------------------------

export const MONEY_FLOWS: readonly MoneyFlow[] = [
  {
    id: 'mf-insider-usdc',
    from_label: '8 insider wallets',
    to_label: 'External wallets (USDC)',
    amount_usd: 57_600_000,
    date: '2025-02-14',
    source: 'Lookonchain / Cointelegraph',
  },
  {
    id: 'mf-insider-sol',
    from_label: '8 insider wallets',
    to_label: 'External wallets (SOL)',
    amount_usd: 49_700_000,
    date: '2025-02-14',
    source: 'Lookonchain / Cointelegraph',
  },
  {
    id: 'mf-investor-losses',
    from_label: '114,410 retail wallets',
    to_label: '$LIBRA token (losses)',
    amount_usd: 251_000_000,
    date: '2025-02-14',
    source: 'Nansen Research',
  },
  {
    id: 'mf-portnoy-received',
    from_label: 'Kelsier Ventures',
    to_label: 'Dave Portnoy (tokens for promotion)',
    amount_usd: 6_300_000,
    date: '2025-02-14',
    source: 'Multiple outlets',
  },
  {
    id: 'mf-portnoy-return',
    from_label: 'Dave Portnoy',
    to_label: 'Hayden Davis (6M tokens returned)',
    amount_usd: 0,
    date: '2025-02-15',
    source: 'Multiple outlets',
  },
  {
    id: 'mf-novelli-terrones-transfer',
    from_label: 'Novelli / Terrones Godoy',
    to_label: 'Unknown wallets',
    amount_usd: 500_000,
    date: '2025-04-01',
    source: 'DL News',
  },
  {
    id: 'mf-davis-return-proposal',
    from_label: 'Hayden Davis (proposed - never executed)',
    to_label: 'Victims fund (offered to Judge Servini)',
    amount_usd: 100_000_000,
    date: '2025-03-01',
    source: 'Multiple outlets',
  },
  {
    id: 'mf-first-buyer-profit',
    from_label: '$LIBRA token (launch)',
    to_label: 'First buyer (insider)',
    amount_usd: 6_500_000,
    date: '2025-02-14',
    source: 'Wikipedia / Blockchain data',
  },
  {
    id: 'mf-sniping-profit',
    from_label: '$LIBRA + $MELANIA (sniping bots)',
    to_label: 'Davis team wallet',
    amount_usd: 6_000_000,
    date: '2025-02-14',
    source: 'Coffeezilla / Bubblemaps',
  },
  {
    id: 'mf-portnoy-refund',
    from_label: 'Hayden Davis (sniping wallets)',
    to_label: 'Dave Portnoy (refund)',
    amount_usd: 5_000_000,
    date: '2025-02-15',
    source: 'Coffeezilla / The Crypto Basic',
  },
  {
    id: 'mf-novelli-monthly-payments',
    from_label: 'Novelli (N&W Profesional Traders)',
    to_label: 'Karina Milei ($4K/month from Apr 2024)',
    amount_usd: 48_000,
    date: '2024-04-01',
    source: 'DL News / MercoPress',
  },
  {
    id: 'mf-0xcea-melania-to-libra',
    from_label: 'Wallet 0xcEA ($MELANIA sniping profit)',
    to_label: '$LIBRA deployment funding',
    amount_usd: 2_400_000,
    date: '2025-02-14',
    source: 'Bubblemaps',
  },
]

// ---------------------------------------------------------------------------
// EVIDENCE DOCUMENTS
// ---------------------------------------------------------------------------

export const EVIDENCE_DOCS: readonly EvidenceDoc[] = [
  {
    id: 'doc-wikipedia',
    title: '$Libra cryptocurrency scandal - Wikipedia',
    type_es: 'Enciclopedia',
    type_en: 'Encyclopedia',
    date: '2025-02-15',
    summary_es:
      'Artículo enciclopédico completo con cronología, actores y fuentes verificadas sobre el escándalo.',
    summary_en:
      'Encyclopedia article with timeline, actors, and verified sources on the scandal.',
    source_url:
      'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
    verification_status: 'verified',
  },
  {
    id: 'doc-trm-labs',
    title:
      'The Libra Affair: Tracking the Memecoin - TRM Labs',
    type_es: 'Análisis forense blockchain',
    type_en: 'Blockchain forensic analysis',
    date: '2025-02-20',
    summary_es:
      'Rastreo completo de los flujos de fondos en cadena, identificando billeteras internas y patrones de extracción.',
    summary_en:
      'Complete tracing of on-chain fund flows, identifying insider wallets and extraction patterns.',
    source_url:
      'https://www.trmlabs.com/post/the-libra-affair-tracking-the-memecoin-that-launched-a-scandel-in-argentina',
    verification_status: 'verified',
  },
  {
    id: 'doc-nansen',
    title: 'LIBRA: The Aftermath - Nansen Research',
    type_es: 'Análisis de mercado',
    type_en: 'Market analysis',
    date: '2025-02-17',
    summary_es:
      'Análisis que confirma que el 86% de los traders sufrieron pérdidas por un total de $251 millones.',
    summary_en:
      'Analysis confirming that 86% of traders suffered losses totaling $251 million.',
    source_url:
      'https://research.nansen.ai/articles/libra-the-aftermath',
    verification_status: 'verified',
  },
  {
    id: 'doc-herald-leaked-evidence',
    title:
      'Leaked evidence shows calls incriminating Milei - Buenos Aires Herald',
    type_es: 'Filtración de evidencia judicial',
    type_en: 'Leaked court evidence',
    date: '2025-03-10',
    summary_es:
      'Evidencia filtrada que muestra registros de llamadas y videollamadas que vinculan a Milei, Karina Milei, Caputo y Novelli la noche del lanzamiento.',
    summary_en:
      'Leaked evidence showing call and video call records linking Milei, Karina Milei, Caputo, and Novelli on launch night.',
    source_url:
      'https://buenosairesherald.com/politics/libra-scandal-leaked-evidence-shows-calls-incriminating-milei-in-scam',
    verification_status: 'verified',
  },
  {
    id: 'doc-herald-congress-report',
    title:
      'Milei used presidential role to spread alleged scam - Buenos Aires Herald',
    type_es: 'Informe del Congreso',
    type_en: 'Congressional report',
    date: '2025-11-01',
    summary_es:
      'Informe del Congreso que concluye que Milei utilizó su rol presidencial para difundir el fraude, documentando 16 reuniones con promotores y 114.410 billeteras afectadas.',
    summary_en:
      'Congressional report concluding that Milei used his presidential role to spread the scam, documenting 16 meetings with promoters and 114,410 affected wallets.',
    source_url:
      'https://buenosairesherald.com/politics/libra-crypto-scandal-milei-used-presidential-role-to-spread-alleged-scam-congress-report-concludes',
    verification_status: 'verified',
  },
  {
    id: 'doc-mercopress-5m',
    title:
      'Alleged US$5 million deal tied to Milei promotion - MercoPress',
    type_es: 'Investigación judicial',
    type_en: 'Court investigation',
    date: '2026-03-16',
    summary_es:
      'El análisis forense del teléfono de Novelli reveló un documento de pago de $5 millones fechado el 11 de febrero de 2025.',
    summary_en:
      "Forensic analysis of Novelli's phone revealed a $5 million payment document dated February 11, 2025.",
    source_url:
      'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
    verification_status: 'verified',
  },
  {
    id: 'doc-dlnews-forensics',
    title:
      'Argentina forensics: payments from Libra lobbyist to Milei - DL News',
    type_es: 'Investigación periodística',
    type_en: 'Investigative journalism',
    date: '2026-03-16',
    summary_es:
      'Investigación que revela los pagos de Novelli a Milei desde 2021 por clases de Zoom, con montos que se duplicaron tras la presidencia.',
    summary_en:
      'Investigation revealing payments from Novelli to Milei since 2021 for Zoom classes, with amounts doubling after the presidency.',
    source_url:
      'https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/',
    verification_status: 'verified',
  },
  {
    id: 'doc-cointelegraph-107m',
    title:
      'Milei LIBRA token scandal: $107M rug pull - Cointelegraph',
    type_es: 'Análisis cripto',
    type_en: 'Crypto analysis',
    date: '2025-02-15',
    summary_es:
      'Análisis de cómo 8 billeteras internas extrajeron $107 millones, incluyendo datos de Bubblemaps y Lookonchain.',
    summary_en:
      'Analysis of how 8 insider wallets extracted $107 million, including Bubblemaps and Lookonchain data.',
    source_url:
      'https://cointelegraph.com/news/milei-libra-token-scandal-107m-rug-pull',
    verification_status: 'verified',
  },
  {
    id: 'doc-cointelegraph-251m',
    title:
      'Libra investors lost $251 million - Cointelegraph',
    type_es: 'Análisis de impacto',
    type_en: 'Impact analysis',
    date: '2025-02-17',
    summary_es:
      'Informe sobre las pérdidas de $251 millones sufridas por inversores, con datos del impacto político en la aprobación de Milei.',
    summary_en:
      "Report on the $251 million losses suffered by investors, with data on the political impact on Milei's approval ratings.",
    source_url:
      'https://cointelegraph.com/news/libra-investors-lost-251-million-memecoin-javier-milei',
    verification_status: 'verified',
  },
  {
    id: 'doc-bloomberg-uti',
    title:
      'Milei shuts down unit investigating crypto scandal - Bloomberg',
    type_es: 'Investigación periodística',
    type_en: 'Investigative journalism',
    date: '2025-05-20',
    summary_es:
      'Bloomberg informó sobre la disolución de la UTI por Decreto 332/2025 y la absolución posterior por parte de la Oficina Anticorrupción.',
    summary_en:
      'Bloomberg reported on the disbanding of the UTI via Decree 332/2025 and the subsequent clearance by the Anti-Corruption Office.',
    source_url:
      'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
    verification_status: 'verified',
  },
  {
    id: 'doc-decrypt-unfrozen',
    title:
      'Libra promoters regain access to $57.6M - Decrypt',
    type_es: 'Decisión judicial',
    type_en: 'Court ruling',
    date: '2025-08-15',
    summary_es:
      'Decrypt informó sobre la decisión del juez de Manhattan de descongelar $57,6 millones en activos de Davis y Chow. Dos billeteras: $13,06M y $44,59M USDC.',
    summary_en:
      "Decrypt reported on the Manhattan judge's decision to unfreeze $57.6 million in Davis and Chow assets. Two wallets: $13.06M and $44.59M USDC.",
    source_url:
      'https://decrypt.co/336060/libra-promoters-regain-access-57-6-million-crypto-judge-unfreezes-assets',
    verification_status: 'verified',
  },
  {
    id: 'doc-coffeezilla-investigation',
    title:
      "Argentina's Memecoin Disaster Is Worse Than You Think - Coffeezilla",
    type_es: 'Investigación periodística (video)',
    type_en: 'Investigative journalism (video)',
    date: '2025-02-17',
    summary_es:
      'Entrevista con Hayden Davis donde admitió controlar ~$100M, hacer sniping en $LIBRA y $MELANIA, y reveló el plan del "segundo video" de Milei. Davis describió los fondos como "custodia".',
    summary_en:
      'Interview with Hayden Davis where he admitted controlling ~$100M, sniping $LIBRA and $MELANIA, and revealed the "second video" plan with Milei. Davis described the funds as "custodied."',
    source_url: 'https://www.youtube.com/watch?v=Ud6GuH7gSDw',
    verification_status: 'verified',
  },
  {
    id: 'doc-bubblemaps-analysis',
    title:
      'How Hayden Davis Rugged LIBRA for $100M with President Milei - Bubblemaps',
    type_es: 'Análisis forense blockchain',
    type_en: 'Blockchain forensic analysis',
    date: '2025-02-15',
    summary_es:
      'Bubblemaps identificó $93,7M en billeteras vinculadas a Davis. Rastreó la billetera 0xcEA que hizo sniping en $MELANIA y luego financió el despliegue de $LIBRA. 82% del suministro desbloqueado desde el lanzamiento.',
    summary_en:
      'Bubblemaps identified $93.7M in Davis-linked wallets. Traced wallet 0xcEA that sniped $MELANIA and then funded $LIBRA deployment. 82% of supply unlocked from launch.',
    source_url:
      'https://blog.bubblemaps.io/how-hayden-davis-rugged-libra-for-100m-with-president-milei/',
    verification_status: 'verified',
  },
  {
    id: 'doc-theblock-5m-contract',
    title:
      'Probe reveals $5M deal linking Milei to Libra promotion - The Block',
    type_es: 'Investigación periodística',
    type_en: 'Investigative journalism',
    date: '2026-03-16',
    summary_es:
      'The Block informó sobre el documento de $5M con estructura de 3 tramos encontrado en el análisis forense. Borrador redactado entre octubre y noviembre de 2024.',
    summary_en:
      'The Block reported on the $5M 3-tier payment document found in forensic analysis. Draft written between October and November 2024.',
    source_url:
      'https://www.theblock.co/post/393639/probe-reveals-document-detailing-alleged-5-million-deal-linking-milei-to-libra-promotion-report',
    verification_status: 'verified',
  },
  {
    id: 'doc-infobae-commission-revelations',
    title:
      'Comisión investigadora revela transferencias y contratos - Infobae',
    type_es: 'Informe del Congreso',
    type_en: 'Congressional report',
    date: '2026-03-16',
    summary_es:
      'Infobae reportó las revelaciones de la comisión del Congreso: viaje de Davis a Argentina, pacto de confidencialidad, 7 llamadas con Milei, y conclusión de "operación planificada".',
    summary_en:
      'Infobae reported the congressional commission revelations: Davis\'s trip to Argentina, confidentiality pact, 7 calls with Milei, and "planned operation" conclusion.',
    source_url:
      'https://www.infobae.com/politica/2026/03/16/la-comision-investigadora-del-congreso-revelo-transferencias-y-contratos-en-el-caso-libra-el-presidente-tiene-que-dar-explicaciones/',
    verification_status: 'verified',
  },
  {
    id: 'doc-mercopress-payments-2021',
    title:
      'Forensic report points to payments from Novelli to Milei since 2021 - MercoPress',
    type_es: 'Investigación judicial',
    type_en: 'Court investigation',
    date: '2026-03-17',
    summary_es:
      'MercoPress detalló los pagos de Novelli: $2.000/mes desde 2021, subiendo a $4.000/mes en abril 2024, dirigidos a Karina Milei, a través de N&W Profesional Traders.',
    summary_en:
      'MercoPress detailed Novelli\'s payments: $2,000/month since 2021, rising to $4,000/month by April 2024, directed to Karina Milei, via N&W Profesional Traders.',
    source_url:
      'https://en.mercopress.com/2026/03/17/libra-case-forensic-report-points-to-payments-from-novelli-to-milei-since-2021-la-nacion-says',
    verification_status: 'verified',
  },
  {
    id: 'doc-ccn-wolf-token',
    title:
      'Davis launches new memecoin despite Interpol Red Notice - CCN',
    type_es: 'Investigación periodística',
    type_en: 'Investigative journalism',
    date: '2025-03-08',
    summary_es:
      'CCN informó que Davis lanzó el token WOLF pese a la solicitud de Interpol. Bubblemaps rastreó la billetera a través de 17 direcciones hasta el cluster de Davis.',
    summary_en:
      'CCN reported Davis launched the WOLF token despite the Interpol request. Bubblemaps traced the deployer wallet through 17 addresses back to Davis cluster.',
    source_url:
      'https://www.ccn.com/news/crypto/libra-hayden-davis-new-memecoin-interpol-red-notice/',
    verification_status: 'verified',
  },
  {
    id: 'doc-batimes-one-year',
    title:
      'A year on, courts have yet to summon witnesses or suspects - Buenos Aires Times',
    type_es: 'Investigación periodística',
    type_en: 'Investigative journalism',
    date: '2026-02-14',
    summary_es:
      'Buenos Aires Times documentó que tras un año completo, los tribunales argentinos no citaron testigos ni sospechosos en el caso.',
    summary_en:
      'Buenos Aires Times documented that after a full year, Argentine courts had yet to summon witnesses or suspects in the case.',
    source_url:
      'https://www.batimes.com.ar/news/argentina/a-year-on-libra-crypto-scandal-argentinas-courts-have-yet-to-summon-witnesses-or-suspects.phtml',
    verification_status: 'verified',
  },
]

// ---------------------------------------------------------------------------
// IMPACT STATS
// ---------------------------------------------------------------------------

export const IMPACT_STATS: readonly ImpactStat[] = [
  {
    value: '$251M',
    label_es: 'Pérdidas de inversores',
    label_en: 'Investor losses',
    source: 'Nansen Research',
  },
  {
    value: '114,410',
    label_es: 'Billeteras afectadas',
    label_en: 'Affected wallets',
    source: 'Argentine Congressional report',
  },
  {
    value: '$4.5B',
    label_es: 'Capitalización máxima',
    label_en: 'Peak market cap',
    source: 'CoinGecko',
  },
  {
    value: '$107–124.6M',
    label_es: 'Extracción por insiders (8–34 billeteras)',
    label_en: 'Insider extraction (8–34 wallets)',
    source: 'Lookonchain / Nansen / Chainalysis',
  },
  {
    value: '94%',
    label_es: 'Caída del precio',
    label_en: 'Price crash',
    source: 'Blockchain data',
  },
  {
    value: '0',
    label_es: 'Imputaciones (1 año después)',
    label_en: 'Indictments (1 year later)',
    source: 'Buenos Aires Times',
  },
  {
    value: '16 / 4',
    label_es: 'Reuniones reales / declaradas',
    label_en: 'Actual meetings / declared',
    source: 'Argentine Congressional report',
  },
  {
    value: '30+',
    label_es: 'Contactos telefónicos la noche del lanzamiento',
    label_en: 'Phone contacts on launch night',
    source: 'Forensic phone analysis',
  },
  {
    value: '57.6%',
    label_es: 'Desaprobación de Milei',
    label_en: 'Milei disapproval rating',
    source: 'UPI / Cointelegraph',
  },
  {
    value: '6%',
    label_es: 'Caída de bolsa argentina (17 Feb)',
    label_en: 'Argentine stock market drop (Feb 17)',
    source: 'Multiple outlets',
  },
  {
    value: '34',
    label_es: 'Direcciones vinculadas a Davis con ganancias',
    label_en: 'Davis-linked addresses with profits',
    source: 'Nansen / Chainalysis',
  },
  {
    value: '$124.6M',
    label_es: 'Ganancias totales de direcciones vinculadas',
    label_en: 'Total profits across linked addresses',
    source: 'Nansen / Chainalysis',
  },
  {
    value: '15+',
    label_es: 'Tokens vinculados al mismo cluster de Davis',
    label_en: 'Tokens linked to the same Davis cluster',
    source: 'Bubblemaps / CCN',
  },
  {
    value: '26',
    label_es: 'Billeteras vinculadas sin rastrear (de 34)',
    label_en: 'Linked wallets untraced (of 34)',
    source: 'Graph analysis vs Nansen/Chainalysis',
  },
  {
    value: '102 / 141',
    label_es: 'Nodos / aristas en el grafo de investigación',
    label_en: 'Nodes / edges in investigation graph',
    source: 'Office of Accountability graph database (factchecked)',
  },
]

// ---------------------------------------------------------------------------
// GOVERNMENT RESPONSES
// ---------------------------------------------------------------------------

export const GOVERNMENT_RESPONSES: readonly GovernmentResponse[] = [
  {
    id: 'gr-milei-deletes-posts',
    date: '2025-02-15',
    action_es: 'Milei borra todas las publicaciones promocionales',
    action_en: 'Milei deletes all promotional posts',
    effect_es:
      'Intentó distanciarse del token tras el desplome de precios.',
    effect_en:
      'Attempted to distance himself from the token after the price crash.',
    source: 'Wikipedia',
    source_url:
      'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
  },
  {
    id: 'gr-milei-defense',
    date: '2025-02-18',
    action_es:
      'Milei defiende públicamente la promoción, niega responsabilidad',
    action_en:
      'Milei publicly defends the promotion, denies responsibility',
    effect_es:
      'Afirmó que no conocía los detalles del proyecto y que solo difundió información.',
    effect_en:
      'Claimed he did not know the project details and merely shared information.',
    source: 'Bloomberg',
    source_url:
      'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
  },
  {
    id: 'gr-uti-disbanded',
    date: '2025-05-20',
    action_es:
      'Gobierno disuelve la Unidad de Tareas de Investigación (UTI) mediante Decreto 332/2025',
    action_en:
      'Government disbands the Investigation Task Unit (UTI) via Decree 332/2025',
    effect_es:
      'Eliminó la unidad que estaba investigando el escándalo cripto, debilitando la capacidad investigativa.',
    effect_en:
      'Eliminated the unit investigating the crypto scandal, weakening investigative capacity.',
    source: 'Bloomberg',
    source_url:
      'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
  },
  {
    id: 'gr-anticorruption-clearance',
    date: '2025-06-07',
    action_es: 'Oficina Anticorrupción absuelve a Milei',
    action_en: 'Anti-Corruption Office clears Milei',
    effect_es:
      'La oficina, dependiente del Poder Ejecutivo, determinó que no hubo irregularidades. Criticada por falta de independencia.',
    effect_en:
      'The office, which reports to the Executive Branch, found no irregularities. Criticized for lack of independence.',
    source: 'Bloomberg',
    source_url:
      'https://www.bloomberg.com/news/articles/2025-05-20/milei-shuts-down-argentina-unit-investigating-crypto-scandal',
  },
  {
    id: 'gr-prosecutor-inaction',
    date: '2026-02-14',
    action_es:
      'Fiscal Taiano: cero imputaciones y cero testigos citados tras un año',
    action_en:
      'Prosecutor Taiano: zero indictments and zero witnesses summoned after one year',
    effect_es:
      'La investigación judicial permanece estancada sin avances significativos.',
    effect_en:
      'The judicial investigation remains stalled with no significant progress.',
    source: 'Buenos Aires Times',
    source_url:
      'https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal',
  },
  {
    id: 'gr-opposition-complaint',
    date: '2026-03-17',
    action_es:
      'Oposición denuncia a Taiano por obstrucción y ocultamiento de evidencia',
    action_en:
      'Opposition files complaint against Taiano for obstruction and evidence concealment',
    effect_es:
      'La analista Volosin acusó a Taiano de ocultar información clave durante 4 meses. Denuncia presentada ante el Tribunal Disciplinario del Ministerio Público.',
    effect_en:
      'Analyst Volosin accused Taiano of concealing key information for 4 months. Complaint filed at the Public Prosecutor\'s Disciplinary Court.',
    source: 'MercoPress / Perfil',
    source_url:
      'https://en.mercopress.com/2026/03/16/argentine-court-probe-finds-alleged-us-5-million-deal-tied-to-milei-s-promotion-of-libra',
  },
  {
    id: 'gr-government-sidelines',
    date: '2026-03-17',
    action_es:
      'Gobierno declara que "se mantendrá al margen" del caso y minimiza revelaciones',
    action_en:
      'Government declares it "will stay on the sidelines" and minimizes revelations',
    effect_es:
      'El gobierno se negó a responder a las nuevas revelaciones de la comisión investigadora del Congreso.',
    effect_en:
      "The government refused to respond to the new revelations from the congressional investigation commission.",
    source: 'Infobae',
    source_url:
      'https://www.infobae.com/politica/2026/03/17/el-gobierno-afirma-que-se-mantendra-al-margen-del-caso-libra-y-minimiza-el-impacto-de-las-nuevas-revelaciones/',
  },
]
