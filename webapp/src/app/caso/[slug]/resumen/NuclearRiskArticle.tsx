'use client'

/**
 * Nuclear Risk Assessment 2026 — Bilingual investigative article.
 *
 * Tracks escalation signals across all theaters with OSINT and AI.
 * Yellow accent color theme. Named export (not default).
 */

import { useLanguage, type Lang } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCard {
  readonly value: string
  readonly label: Record<Lang, string>
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
  readonly stats?: readonly StatCard[]
  readonly sourceTable?: boolean
  readonly citations?: readonly Citation[]
}

// ---------------------------------------------------------------------------
// ETL Sources
// ---------------------------------------------------------------------------

const ETL_SOURCES = [
  { name: 'IAEA', tier: 'gold', method: 'RSS', status: 'Active' },
  { name: 'IAEA Board of Governors', tier: 'gold', method: 'Document scrape', status: 'Planned' },
  { name: 'CTBTO', tier: 'gold', method: 'Public API', status: 'Planned' },
  { name: 'CTBTO Official', tier: 'gold', method: 'Document scrape', status: 'Planned' },
  { name: 'UN Security Council', tier: 'gold', method: 'UN Documents API', status: 'Planned' },
  { name: 'US DoD', tier: 'gold', method: 'RSS', status: 'Active' },
  { name: 'US Congressional Research Service', tier: 'gold', method: 'Document scrape', status: 'Planned' },
  { name: 'NATO', tier: 'gold', method: 'Google News RSS proxy', status: 'Active' },
  { name: 'OPCW', tier: 'gold', method: 'RSS', status: 'Planned' },
  { name: 'US NRC', tier: 'gold', method: 'RSS/API', status: 'Planned' },
  { name: 'SIPRI', tier: 'gold', method: 'Scrape/CSV', status: 'Planned' },
  { name: 'US State Dept', tier: 'silver', method: 'RSS', status: 'Active' },
  { name: 'Russian MFA', tier: 'silver', method: 'RSS/scrape', status: 'Planned' },
  { name: 'Chinese MFA', tier: 'silver', method: 'RSS/scrape', status: 'Planned' },
  { name: 'DPRK (KCNA)', tier: 'silver', method: 'Scrape', status: 'Planned' },
  { name: 'UK MoD', tier: 'silver', method: 'RSS', status: 'Planned' },
  { name: 'French MoD', tier: 'silver', method: 'RSS', status: 'Planned' },
  { name: 'Indian MEA + DRDO', tier: 'silver', method: 'RSS/scrape', status: 'Planned' },
  { name: 'Pakistan MFA + SPD', tier: 'silver', method: 'RSS/scrape', status: 'Planned' },
  { name: 'EU EEAS', tier: 'silver', method: 'RSS', status: 'Planned' },
  { name: 'NPT Review Conference', tier: 'silver', method: 'Document scrape', status: 'Planned' },
  { name: 'MTCR', tier: 'silver', method: 'Document scrape', status: 'Planned' },
  { name: 'Nuclear Suppliers Group', tier: 'silver', method: 'Document scrape', status: 'Planned' },
  { name: 'Arms Control Association', tier: 'silver', method: 'RSS', status: 'Active' },
  { name: 'Bulletin of Atomic Scientists', tier: 'silver', method: 'WP REST API', status: 'Active' },
  { name: 'Federation of American Scientists', tier: 'silver', method: 'RSS', status: 'Planned' },
  { name: 'ASPI', tier: 'silver', method: 'RSS', status: 'Planned' },
  { name: 'Reuters/AP', tier: 'silver', method: 'News API', status: 'Planned' },
  { name: 'ADSB Exchange', tier: 'bronze', method: 'Flight tracking API', status: 'Planned' },
  { name: 'OSINT Twitter/X', tier: 'bronze', method: 'Curated feeds', status: 'Planned' },
  { name: 'USGS Earthquake', tier: 'bronze', method: 'Seismic API', status: 'Planned' },
] as const

// ---------------------------------------------------------------------------
// Header content
// ---------------------------------------------------------------------------

const TITLE: Record<Lang, string> = {
  en: 'Global Nuclear Risk Assessment 2026',
  es: 'Evaluacion Global de Riesgo Nuclear 2026',
}

const SUBTITLE: Record<Lang, string> = {
  en: 'Monitoring nuclear escalation signals across seven active theaters',
  es: 'Monitoreo de senales de escalada nuclear en siete teatros activos',
}

const READING_TIME: Record<Lang, string> = {
  en: '~12 min read',
  es: '~12 min de lectura',
}

const LAST_UPDATED: Record<Lang, string> = {
  en: 'Last updated: March 2026',
  es: 'Actualizado: marzo 2026',
}

const DISCLAIMER: Record<Lang, string> = {
  en: 'This investigation uses automated analysis supplemented by human review. All data comes from publicly available sources. Signal classification is performed by a local LLM and factchecked against known entity databases. The scoring model and methodology are published alongside this investigation.',
  es: 'Esta investigacion utiliza analisis automatizado complementado por revision humana. Todos los datos provienen de fuentes publicamente disponibles. La clasificacion de senales es realizada por un LLM local y verificada contra bases de datos de entidades conocidas. El modelo de puntuacion y la metodologia se publican junto con esta investigacion.',
}

const SOURCE_TABLE_INTRO: Record<Lang, string> = {
  en: 'These are the 31 data sources our pipeline monitors or plans to monitor. Active sources are currently being ingested daily. Planned sources will be integrated in upcoming waves.',
  es: 'Estas son las 31 fuentes de datos que nuestro pipeline monitorea o planea monitorear. Las fuentes activas se ingestan diariamente. Las fuentes planificadas se integraran en proximas olas.',
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const chapters: readonly Chapter[] = [
  {
    id: 'the-new-era',
    title: {
      en: 'I. The New Era',
      es: 'I. La Nueva Era',
    },
    paragraphs: {
      en: [
        'On February 5, 2026, the New START treaty expired [1] \u2014 the last remaining nuclear arms control agreement between the United States and Russia. For the first time since the early 1970s, there are no binding limits on the world\u2019s two largest nuclear arsenals. Combined, they hold over 10,000 warheads. [2]',
        'This expiration did not happen in a vacuum. It coincided with three active conflicts involving nuclear-armed or nuclear-aspiring states: the ongoing war in Ukraine under Russia\u2019s nuclear shadow, military strikes against Iran\u2019s nuclear program [3], and the India-Pakistan conflict of 2025 that brought nuclear brinkmanship to South Asia. [4]',
        'The Bulletin of the Atomic Scientists\u2019 2026 Doomsday Clock assessment identified all three as simultaneous nuclear risk zones \u2014 an unprecedented configuration in the atomic age. [5]',
      ],
      es: [
        'El 5 de febrero de 2026, el tratado New START expiro [1] \u2014 el ultimo acuerdo de control de armas nucleares vigente entre Estados Unidos y Rusia. Por primera vez desde principios de los 1970s, no hay limites vinculantes sobre los dos arsenales nucleares mas grandes del mundo. Juntos, poseen mas de 10.000 ojivas. [2]',
        'Esta expiracion no ocurrio en el vacio. Coincidio con tres conflictos activos que involucran estados con armas nucleares o aspiraciones nucleares: la guerra en curso en Ucrania bajo la sombra nuclear de Rusia, ataques militares contra el programa nuclear de Iran [3], y el conflicto India-Pakistan de 2025 que trajo el riesgo nuclear a Asia del Sur. [4]',
        'La evaluacion del Reloj del Juicio Final del Bulletin of the Atomic Scientists de 2026 identifico los tres como zonas de riesgo nuclear simultaneas \u2014 una configuracion sin precedentes en la era atomica. [5]',
      ],
    },
    pullQuote: {
      en: 'For the first time since the 1970s, there are no binding limits on the world\u2019s two largest nuclear arsenals.',
      es: 'Por primera vez desde los 1970s, no hay limites vinculantes sobre los dos arsenales nucleares mas grandes del mundo.',
    },
    citations: [
      { id: 1, text: 'New START Treaty expiration — Arms Control Association', url: 'https://www.armscontrol.org/factsheets/new-start-glance' },
      { id: 2, text: 'Status of World Nuclear Forces 2025 — Federation of American Scientists', url: 'https://fas.org/initiative/status-world-nuclear-forces/' },
      { id: 3, text: 'Iran nuclear program strikes — Reuters', url: 'https://www.reuters.com/world/middle-east/' },
      { id: 4, text: 'India-Pakistan 2025 crisis — CSIS analysis', url: 'https://www.csis.org/analysis' },
      { id: 5, text: '2026 Doomsday Clock Statement — Bulletin of the Atomic Scientists', url: 'https://thebulletin.org/doomsday-clock/' },
    ],
  },
  {
    id: 'methodology',
    title: {
      en: 'II. Methodology',
      es: 'II. Metodologia',
    },
    paragraphs: {
      en: [
        'This investigation uses an automated pipeline to collect, classify, and analyze nuclear risk signals from open sources. We monitor 31 data sources across three confidence tiers: gold (institutional sources like IAEA [6], CTBTO, NATO), silver (government press offices, policy think tanks, wire services), and bronze (OSINT, flight tracking, seismic data).',
        'Each signal passes through a four-phase daily pipeline: ingestion from RSS feeds and APIs, cross-referencing to deduplicate and link entities, AI-powered classification using a local LLM, and risk briefing generation. The AI assigns each signal a severity score (0-100), an escalation level, a theater of conflict, and links to known actors, weapons systems, and treaties.',
        'Our scoring model weights five factors: source tier reliability (20%), event type severity (30%), actor nuclear status (15%), signal novelty (15%), and multi-source corroboration (20%). The escalation ladder maps scores to five levels: routine (0-20), notable (21-40), elevated (41-60), serious (61-80), and critical (81-100). [7]',
        'All classification output is factchecked against known entity databases. The AI\u2019s actor references are validated against 14 known nuclear states. Severity scores are cross-checked against escalation levels. Hallucinated entities are rejected and logged.',
      ],
      es: [
        'Esta investigacion utiliza un pipeline automatizado para recopilar, clasificar y analizar senales de riesgo nuclear de fuentes abiertas. Monitoreamos 31 fuentes de datos en tres niveles de confianza: oro (fuentes institucionales como OIEA [6], OTPCE, OTAN), plata (oficinas de prensa gubernamentales, think tanks, agencias de noticias) y bronce (OSINT, seguimiento de vuelos, datos sismicos).',
        'Cada senal pasa por un pipeline diario de cuatro fases: ingestion desde feeds RSS y APIs, referencias cruzadas para deduplicar y vincular entidades, clasificacion con IA usando un LLM local, y generacion de informes de riesgo. La IA asigna a cada senal una puntuacion de severidad (0-100), un nivel de escalada, un teatro de conflicto, y vinculos a actores conocidos, sistemas de armas y tratados.',
        'Nuestro modelo de puntuacion pondera cinco factores: fiabilidad del nivel de fuente (20%), severidad del tipo de evento (30%), estatus nuclear del actor (15%), novedad de la senal (15%) y corroboracion multi-fuente (20%). La escalera de escalada mapea puntuaciones a cinco niveles: rutina (0-20), notable (21-40), elevado (41-60), serio (61-80) y critico (81-100). [7]',
        'Toda la salida de clasificacion es verificada contra bases de datos de entidades conocidas. Las referencias de actores de la IA se validan contra 14 estados nucleares conocidos. Las puntuaciones de severidad se cruzan con los niveles de escalada. Las entidades alucinadas son rechazadas y registradas.',
      ],
    },
    pullQuote: {
      en: 'All classification output is factchecked. Hallucinated entities are rejected and logged.',
      es: 'Toda la clasificacion es verificada. Las entidades alucinadas son rechazadas y registradas.',
    },
    citations: [
      { id: 6, text: 'IAEA NEWSCENTER — official reports and updates', url: 'https://www.iaea.org/newscenter' },
      { id: 7, text: 'Nuclear risk scoring methodology — NTI Nuclear Security Index', url: 'https://www.ntiindex.org/' },
    ],
  },
  {
    id: 'korean-peninsula',
    title: {
      en: 'III. Korean Peninsula',
      es: 'III. Peninsula Coreana',
    },
    paragraphs: {
      en: [
        'The Korean Peninsula registered the highest average severity of any theater at 87 out of 100, driven by four North Korean missile tests in the first three months of 2026. [8] On January 4, Pyongyang launched hypersonic missiles that struck targets 1,000 kilometers away in the Sea of Japan \u2014 the first test of the year. [9]',
        'Three weeks later, on January 27, a second launch of suspected ballistic missiles followed. By March, the cadence accelerated: on March 4, the destroyer Choe Hyon test-fired a sea-to-surface strategic cruise missile, and on March 16, North Korea fired 10 missiles from nuclear-capable rocket launchers, hitting an island target 360 kilometers away. [10]',
        'Kim Jong Un has called for two destroyers to be built annually, signaling a push toward a sea-based nuclear deterrent. [11] The shift from land-based to naval platforms represents a qualitative escalation in North Korea\u2019s nuclear posture \u2014 submarine-launched missiles are harder to preempt and give Pyongyang a survivable second-strike capability. [12]',
      ],
      es: [
        'La Peninsula Coreana registro la severidad promedio mas alta de cualquier teatro con 87 de 100, impulsada por cuatro pruebas de misiles norcoreanos en los primeros tres meses de 2026. [8] El 4 de enero, Pyongyang lanzo misiles hipersonicos que alcanzaron objetivos a 1.000 kilometros en el Mar de Japon \u2014 la primera prueba del ano. [9]',
        'Tres semanas despues, el 27 de enero, siguio un segundo lanzamiento de presuntos misiles balisticos. Para marzo, la cadencia se acelero: el 4 de marzo, el destructor Choe Hyon disparo un misil crucero estrategico superficie-superficie, y el 16 de marzo, Corea del Norte disparo 10 misiles desde lanzadores nucleares, alcanzando un objetivo insular a 360 kilometros. [10]',
        'Kim Jong Un ha pedido que se construyan dos destructores anualmente, senalando un impulso hacia una disuasion nuclear naval. [11] El cambio de plataformas terrestres a navales representa una escalada cualitativa en la postura nuclear de Corea del Norte \u2014 los misiles lanzados desde submarinos son mas dificiles de prevenir y otorgan a Pyongyang una capacidad de segundo golpe sobrevivible. [12]',
      ],
    },
    pullQuote: {
      en: 'Four missile tests in three months. Average severity: 87 out of 100.',
      es: 'Cuatro pruebas de misiles en tres meses. Severidad promedio: 87 de 100.',
    },
    citations: [
      { id: 8, text: 'North Korea Missile Launches 2026 — CSIS Missile Threat Project', url: 'https://missilethreat.csis.org/country/dprk/' },
      { id: 9, text: 'DPRK hypersonic missile test, Jan 4 2026 — Reuters', url: 'https://www.reuters.com/world/asia-pacific/' },
      { id: 10, text: 'North Korea missile test timeline — Arms Control Association', url: 'https://www.armscontrol.org/factsheets/missiles' },
      { id: 11, text: 'Kim Jong Un naval nuclear ambitions — AP News', url: 'https://apnews.com/hub/north-korea' },
      { id: 12, text: 'DPRK sea-based deterrent assessment — CRS Report', url: 'https://crsreports.congress.gov/' },
    ],
  },
  {
    id: 'middle-east',
    title: {
      en: 'IV. Middle East',
      es: 'IV. Medio Oriente',
    },
    paragraphs: {
      en: [
        'The Middle East theater recorded 9 signals with an average severity of 70, dominated by the US-Israeli military campaign against Iran\u2019s nuclear program. On February 1, following the largest American military buildup in the region since the 2003 invasion of Iraq, the United States and Israel launched large-scale strikes against Iranian nuclear and missile facilities. [13]',
        'The IAEA confirmed that while the bombings failed to destroy the underground Natanz enrichment facility, they caused significant damage to entrance buildings, rendering the facility inaccessible. [14] As of March 2026, the IAEA has no access to any of Iran\u2019s four declared enrichment facilities.',
        'On March 21, the US carried out a second round of strikes at Natanz, this time using bunker buster bombs against the underground complex. [15] Meanwhile, the IAEA reported that on the eve of strikes, Iran possessed 440.9 kilograms of uranium enriched up to 60% U-235 \u2014 close to weapons-grade. [16]',
        'Negotiations between the US and Iran are underway, with the IAEA Director General providing verification advice. [17] However, with IAEA inspectors locked out of all enrichment facilities, verification of any agreement remains a critical challenge.',
      ],
      es: [
        'El teatro del Medio Oriente registro 9 senales con una severidad promedio de 70, dominado por la campana militar estadounidense-israeli contra el programa nuclear de Iran. El 1 de febrero, tras la mayor concentracion militar estadounidense en la region desde la invasion de Irak en 2003, Estados Unidos e Israel lanzaron ataques a gran escala contra las instalaciones nucleares y de misiles iranies. [13]',
        'El OIEA confirmo que aunque los bombardeos no destruyeron la instalacion subterranea de enriquecimiento de Natanz, causaron danos significativos a los edificios de entrada, dejando la instalacion inaccesible. [14] A marzo de 2026, el OIEA no tiene acceso a ninguna de las cuatro instalaciones de enriquecimiento declaradas de Iran.',
        'El 21 de marzo, EE.UU. llevo a cabo una segunda ronda de ataques en Natanz, esta vez usando bombas antibunker contra el complejo subterraneo. [15] Mientras tanto, el OIEA informo que en visperas de los ataques, Iran poseia 440,9 kilogramos de uranio enriquecido hasta el 60% de U-235 \u2014 cerca del grado armamentistico. [16]',
        'Las negociaciones entre EE.UU. e Iran estan en curso, con el Director General del OIEA proporcionando asesoramiento de verificacion. [17] Sin embargo, con los inspectores del OIEA bloqueados de todas las instalaciones de enriquecimiento, la verificacion de cualquier acuerdo sigue siendo un desafio critico.',
      ],
    },
    pullQuote: {
      en: 'IAEA has no access to any of Iran\u2019s four declared enrichment facilities.',
      es: 'El OIEA no tiene acceso a ninguna de las cuatro instalaciones de enriquecimiento declaradas de Iran.',
    },
    citations: [
      { id: 13, text: 'US-Israel strikes on Iran nuclear facilities — Reuters', url: 'https://www.reuters.com/world/middle-east/' },
      { id: 14, text: 'IAEA Director General statement on Natanz facility damage', url: 'https://www.iaea.org/newscenter/statements' },
      { id: 15, text: 'Second round of Natanz strikes — AP News', url: 'https://apnews.com/hub/iran' },
      { id: 16, text: 'IAEA verification report — Iran HEU stockpile at 440.9 kg', url: 'https://www.iaea.org/newscenter/focus/iran' },
      { id: 17, text: 'US-Iran negotiations and IAEA verification role — Arms Control Association', url: 'https://www.armscontrol.org/factsheets/iran' },
    ],
  },
  {
    id: 'arms-race',
    title: {
      en: 'V. The New Arms Race',
      es: 'V. La Nueva Carrera Armamentista',
    },
    paragraphs: {
      en: [
        'China\u2019s nuclear arsenal has tripled in five years, from approximately 200 warheads in 2020 to over 600 in 2025. [18] The Pentagon projects China will field up to 1,500 warheads by the mid-2030s, fundamentally altering the global nuclear balance from a bipolar to a tripolar configuration. [19]',
        'In February 2026, US intelligence agencies reported that China had conducted at least one covert explosive nuclear test and is developing an entirely new generation of nuclear weapons, including low-yield tactical nuclear weapons for the first time. [20] If confirmed, this would violate the Comprehensive Nuclear-Test-Ban Treaty.',
        'The India-Pakistan conflict of May 2025 marked the first armed confrontation between nuclear-armed states involving drones and missiles, accompanied by explicit nuclear brinkmanship. [21] France announced an expansion of its nuclear deterrence posture, with 8 European nations joining a nuclear cooperation dialogue. [22]',
        'These developments unfold against the backdrop of no binding arms control agreements. Russia stated it would voluntarily abide by New START limits if the US did so, and President Trump called for a new modernized treaty \u2014 but with China\u2019s inclusion as a precondition that Beijing has rejected. [23]',
      ],
      es: [
        'El arsenal nuclear de China se ha triplicado en cinco anos, de aproximadamente 200 ojivas en 2020 a mas de 600 en 2025. [18] El Pentagono proyecta que China desplegara hasta 1.500 ojivas para mediados de los 2030, alterando fundamentalmente el equilibrio nuclear global de una configuracion bipolar a una tripolar. [19]',
        'En febrero de 2026, las agencias de inteligencia de EE.UU. informaron que China habia realizado al menos una prueba nuclear explosiva encubierta y esta desarrollando una generacion completamente nueva de armas nucleares, incluyendo armas nucleares tacticas de bajo rendimiento por primera vez. [20] De confirmarse, esto violaria el Tratado de Prohibicion Completa de Ensayos Nucleares.',
        'El conflicto India-Pakistan de mayo de 2025 marco la primera confrontacion armada entre estados con armas nucleares involucrando drones y misiles, acompanada de riesgo nuclear explicito. [21] Francia anuncio una expansion de su postura de disuasion nuclear, con 8 naciones europeas uniendose a un dialogo de cooperacion nuclear. [22]',
        'Estos desarrollos ocurren sin acuerdos de control de armas vinculantes. Rusia declaro que respetaria voluntariamente los limites del New START si EE.UU. lo hacia, y el presidente Trump pidio un nuevo tratado modernizado \u2014 pero con la inclusion de China como condicion previa que Beijing ha rechazado. [23]',
      ],
    },
    pullQuote: {
      en: 'China\u2019s arsenal tripled in 5 years. For the first time, three nuclear powers approach parity.',
      es: 'El arsenal de China se triplico en 5 anos. Por primera vez, tres potencias nucleares se acercan a la paridad.',
    },
    citations: [
      { id: 18, text: 'Chinese Nuclear Forces 2025 — Federation of American Scientists', url: 'https://fas.org/initiative/status-world-nuclear-forces/' },
      { id: 19, text: 'Military and Security Developments Involving the PRC — US DoD Annual Report', url: 'https://media.defense.gov/2024/Dec/18/2003615045/-1/-1/0/CMPR-FINAL.PDF' },
      { id: 20, text: 'China suspected covert nuclear test — Reuters intelligence report', url: 'https://www.reuters.com/world/china/' },
      { id: 21, text: 'India-Pakistan 2025 military confrontation — SIPRI analysis', url: 'https://www.sipri.org/research/armament-and-disarmament/nuclear-weapons' },
      { id: 22, text: 'France nuclear deterrence expansion — CSIS Europe analysis', url: 'https://www.csis.org/programs/europe-russia-and-eurasia-program' },
      { id: 23, text: 'Post-New START arms control prospects — Arms Control Association', url: 'https://www.armscontrol.org/act' },
    ],
  },
  {
    id: 'los-numeros',
    title: {
      en: 'VI. The Numbers',
      es: 'VI. Los Numeros',
    },
    paragraphs: {
      en: [
        'Our investigation graph contains 29 verified signals, 14 nuclear actors, 29 weapon systems, 8 treaties, and 28 facilities, connected by 166 relationships. These numbers represent the current state of our open-source nuclear risk knowledge base.',
      ],
      es: [
        'Nuestro grafo de investigacion contiene 29 senales verificadas, 14 actores nucleares, 29 sistemas de armas, 8 tratados y 28 instalaciones, conectados por 166 relaciones. Estos numeros representan el estado actual de nuestra base de conocimiento de riesgo nuclear de fuentes abiertas.',
      ],
    },
    stats: [
      { value: '29', label: { en: 'Signals classified', es: 'Senales clasificadas' } },
      { value: '14', label: { en: 'Nuclear states tracked', es: 'Estados nucleares rastreados' } },
      { value: '31', label: { en: 'Data sources (6 active)', es: 'Fuentes de datos (6 activas)' } },
      { value: '166', label: { en: 'Graph relationships', es: 'Relaciones del grafo' } },
      { value: '87', label: { en: 'Highest theater severity', es: 'Severidad maxima por teatro' } },
      { value: '6', label: { en: 'Active conflict theaters', es: 'Teatros de conflicto activos' } },
      { value: '600+', label: { en: 'Chinese warheads (2025)', es: 'Ojivas chinas (2025)' } },
      { value: '440.9 kg', label: { en: 'Iran HEU stockpile', es: 'Reserva de UEA de Iran' } },
      { value: '4', label: { en: 'DPRK missile tests (2026)', es: 'Pruebas de misiles RPDC (2026)' } },
    ],
  },
  {
    id: 'next-steps',
    title: {
      en: 'VII. Next Steps',
      es: 'VII. Proximos Pasos',
    },
    paragraphs: {
      en: [
        'This investigation is ongoing. Wave 1 will add 10 additional sources including the UN Security Council, SIPRI yearbook data [24], UK and French defense ministries, and USGS seismic data for cross-referencing with nuclear test monitoring. Wave 2 will integrate government press offices from Russia, China, India, Pakistan, and North Korea.',
        'The pipeline will flag when multiple independent signals converge on the same theater \u2014 a potential indicator of escalation.',
        'The knowledge graph will be expanded with cross-referencing between signals from different sources about the same event, escalation chains tracking how one development leads to another, and facility-level geospatial analysis. [25]',
      ],
      es: [
        'Esta investigacion esta en curso. La Ola 1 agregara 10 fuentes adicionales incluyendo el Consejo de Seguridad de la ONU, datos del anuario de SIPRI [24], ministerios de defensa del Reino Unido y Francia, y datos sismicos del USGS para referencias cruzadas con el monitoreo de pruebas nucleares. La Ola 2 integrara oficinas de prensa gubernamentales de Rusia, China, India, Pakistan y Corea del Norte.',
        'El pipeline marcara cuando multiples senales independientes converjan en el mismo teatro \u2014 un indicador potencial de escalada.',
        'El grafo de conocimiento se expandira con referencias cruzadas entre senales de diferentes fuentes sobre el mismo evento, cadenas de escalada que rastrean como un desarrollo lleva a otro, y analisis geoespacial a nivel de instalaciones. [25]',
      ],
    },
    citations: [
      { id: 24, text: 'SIPRI Yearbook — Armaments, Disarmament and International Security', url: 'https://www.sipri.org/yearbook' },
      { id: 25, text: 'NTI Nuclear Security Index — geospatial tracking methodology', url: 'https://www.ntiindex.org/' },
    ],
  },
  {
    id: 'sources',
    title: {
      en: 'VIII. Full Source Disclosure',
      es: 'VIII. Divulgacion Completa de Fuentes',
    },
    paragraphs: {
      en: [],
      es: [],
    },
    sourceTable: true,
  },
]

// ---------------------------------------------------------------------------
// Tier badge helper
// ---------------------------------------------------------------------------

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    gold: 'bg-yellow-500/20 text-yellow-400',
    silver: 'bg-zinc-500/20 text-zinc-300',
    bronze: 'bg-amber-500/20 text-amber-400',
  }

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[tier] ?? 'bg-zinc-700 text-zinc-400'}`}
    >
      {tier}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Status dot helper
// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: string }) {
  const isActive = status === 'Active'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`inline-block h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-zinc-600'}`}
      />
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Source table component
// ---------------------------------------------------------------------------

function SourceTable({ lang }: { lang: Lang }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        {SOURCE_TABLE_INTRO[lang]}
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">{lang === 'en' ? 'Source' : 'Fuente'}</th>
            <th className="px-3 py-2">Tier</th>
            <th className="px-3 py-2">{lang === 'en' ? 'Method' : 'Metodo'}</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {ETL_SOURCES.map((src, i) => (
            <tr
              key={src.name}
              className="border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/30"
            >
              <td className="px-3 py-2 text-zinc-500">{i + 1}</td>
              <td className="px-3 py-2 font-medium">{src.name}</td>
              <td className="px-3 py-2">
                <TierBadge tier={src.tier} />
              </td>
              <td className="px-3 py-2 text-zinc-400">{src.method}</td>
              <td className="px-3 py-2">
                <StatusDot status={src.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500/20 text-[10px] font-bold text-yellow-400 no-underline hover:bg-yellow-500/30 hover:text-yellow-300"
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

export function NuclearRiskArticle() {
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
      </header>

      <hr className="border-zinc-800" />

      {/* Chapters */}
      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="py-12">
          <h2 className="border-l-4 border-yellow-500 pl-4 text-xl font-bold text-zinc-50">
            {chapter.title[lang]}
          </h2>

          {/* Paragraphs */}
          {chapter.paragraphs[lang].length > 0 && (
            <div className="mt-6 space-y-4">
              {chapter.paragraphs[lang].map((p, i) => (
                <p key={i} className="text-base leading-relaxed text-zinc-300">
                  {renderWithCitations(p, chapter.citations)}
                </p>
              ))}
            </div>
          )}

          {/* Pull quote */}
          {chapter.pullQuote && (
            <blockquote className="my-6 border-l-2 border-yellow-400 pl-4 text-lg italic text-zinc-200">
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
                        className="text-yellow-400/70 underline decoration-yellow-400/20 hover:text-yellow-300"
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

          {/* Stats grid */}
          {chapter.stats && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {chapter.stats.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center"
                >
                  <p className="text-xl font-bold text-yellow-400">{stat.value}</p>
                  <p className="mt-1 text-xs text-zinc-400">{stat.label[lang]}</p>
                </div>
              ))}
            </div>
          )}

          {/* Source table */}
          {chapter.sourceTable && <SourceTable lang={lang} />}

          <hr className="mt-12 border-zinc-800/60" />
        </section>
      ))}

      {/* Methodology */}
      <section className="py-12">
        <h2 className="border-l-4 border-yellow-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Metodología' : 'Methodology'}
        </h2>
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
              {lang === 'es' ? 'Cómo Se Hizo Esta Investigación' : 'How This Investigation Was Built'}
            </h3>
            <div className="mt-3 space-y-3 text-sm text-zinc-300">
              <p>{lang === 'es'
                ? 'Esta investigación monitorea diariamente señales de escalada nuclear a partir de 31 fuentes OSINT. El pipeline procesa desarrollos militares, declaraciones oficiales, tratados, pruebas de misiles y datos abiertos para evaluar el nivel de riesgo en 7 teatros de operaciones.'
                : 'This investigation monitors daily nuclear escalation signals from 31 OSINT sources. The pipeline processes military developments, official statements, treaties, missile tests, and open data to assess risk levels across 7 theaters of operation.'}</p>
              <p>{lang === 'es'
                ? 'Cada hallazgo es verificado contra fuentes primarias. La IA detecta patrones; la verificación humana confirma o descarta. Las conclusiones son del lector.'
                : 'Every finding is verified against primary sources. AI detects patterns; human verification confirms or discards. The conclusions are the reader\'s.'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
              {lang === 'es' ? 'Protocolo de Verificación' : 'Verification Protocol'}
            </h3>
            <p className="mt-3 text-sm text-zinc-300">{lang === 'es'
                ? 'Las fuentes se clasifican en tres niveles de confianza: gold (curado), silver (verificado web) y bronze (sin verificar). El riesgo se puntua por teatro con decaimiento temporal, monitoreando continuamente 9 estados nucleares. Cada senal esta enlazada a una fuente publica verificable.'
                : 'Sources are classified into three confidence tiers: gold (curated), silver (web-verified), and bronze (unverified). Risk is scored per theater with time decay, continuously monitoring 9 nuclear states. Every signal is linked to a verifiable public source.'}</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {DISCLAIMER[lang]}
        </p>
      </section>

    </article>
  )
}
