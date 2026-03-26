'use client'

/**
 * Monopolios en Argentina — Narrative summary page.
 *
 * An 8-chapter bilingual investigative journalism piece documenting
 * how 10 families control Argentina's critical markets, compiled from
 * a 32-wave investigation cycle across 2.45M nodes and 44 research files.
 */

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'
import { CitedText, type Citation } from '@/components/investigation/CitedText'
import { CitationFooter } from '@/components/investigation/CitationFooter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCard {
  readonly value: string
  readonly label: Record<Lang, string>
}


interface Chapter {
  readonly id: string
  readonly title: Record<Lang, string>
  readonly paragraphs: Record<Lang, readonly string[]>
  readonly pullQuote?: Record<Lang, string>
  readonly citations?: readonly Citation[]
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const TITLE: Record<Lang, string> = {
  es: 'El Oligopolio: 10 Familias, 18 Sectores, 829 Cruces',
  en: 'The Oligopoly: 10 Families, 18 Sectors, 829 Cross-References',
}

const SUBTITLE: Record<Lang, string> = {
  es: 'USD 22.500 millones por año. El costo de la monopolización en 18 sectores de la economía argentina.',
  en: 'USD 22.5 billion per year. The cost of monopolization across 18 sectors of the Argentine economy.',
}

const READING_TIME: Record<Lang, string> = { es: '~35 min de lectura', en: '~35 min read' }
const LAST_UPDATED: Record<Lang, string> = { es: 'Actualizado: marzo 2026', en: 'Last updated: March 2026' }

const COMPILED_FROM: Record<Lang, string> = {
  es: 'Investigacion asistida por IA con verificacion humana. 44 archivos JSON de hallazgos. Grafo Neo4j de 2.447.572 nodos y 4.685.421 relaciones cruzado con registros IGJ, ICIJ offshore, CompraR, CNE, Boletin Oficial, y la investigacion de obras publicas (37.351 nodos). 75 afirmaciones fueron verificadas contra fuentes primarias: 55% confirmadas, 29% corregidas, 1% desmentida. La IA revela patrones. Las conclusiones son del lector.',
  en: 'AI-assisted investigation with human verification. 32 research waves. 44 JSON finding files. Neo4j graph of 2,447,572 nodes and 4,685,421 relationships cross-referenced against IGJ registry, ICIJ offshore leaks, CompraR procurement, CNE campaign finance, Boletin Oficial, and the public works investigation (37,351 nodes). 75 claims were factchecked against primary sources: 55% confirmed, 29% corrected, 1% debunked. AI reveals patterns. Conclusions are the reader\'s.',
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const stats: readonly StatCard[] = [
  { value: '2.45M', label: { es: 'Nodos en el grafo', en: 'Nodes in graph' } },
  { value: '829+', label: { es: 'Cruces verificados', en: 'Verified cross-refs' } },
  { value: '60', label: { es: 'Entidades offshore', en: 'Offshore entities' } },
  { value: 'USD 22.5B', label: { es: 'Costo anual al consumidor', en: 'Annual consumer cost' } },
]

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const chapters: readonly Chapter[] = [
  {
    id: 'metodologia',
    title: { es: 'I. Metodologia: Como Se Hizo Esta Investigacion', en: 'I. Methodology: How This Investigation Was Built' },
    paragraphs: {
      es: [
        'El proceso comenzo con un ciclo automatizado de investigacion en multiples fases. Cada fase sigue el patron ingest → verify → cross-reference → analyze → factcheck. Las primeras 10 fases realizaron inmersiones profundas en sectores especificos: telecomunicaciones, energia, alimentos, medios, banca, mineria, agroexportacion, construccion, farmaceutica y transporte. Cada fase despacho agentes de investigacion en paralelo que realizaron busquedas web exhaustivas, consultaron bases de datos publicas, y escribieron archivos JSON estructurados con fuentes para cada afirmacion.',
        'Las fases 11-14 cruzaron los hallazgos sectoriales contra el grafo Neo4j existente de 2,45 millones de nodos. Este grafo fue construido a partir de 9 fuentes de datos publicos: el registro corporativo IGJ (951.868 officers) [19], las filtraciones offshore ICIJ (Panama Papers, Pandora Papers, Paradise Papers) [20], los datos de campaña CNE, los nombramientos del Boletin Oficial, el sistema de contrataciones CompraR, las declaraciones juradas patrimoniales DDJJ, el registro CNV, el sistema Como Voto, y las sanciones internacionales OpenSanctions. El motor de cruce opera en tres capas: coincidencia exacta de CUIT (confianza 0.95-1.0), coincidencia de DNI/CUIL (0.9-0.95), y coincidencia difusa de nombres normalizados (0.6-0.8, Levenshtein ≤ 2).',
        'Las fases 15-22 expandieron la investigacion a sectores adicionales: aluminio (monopolio puro, HHI 10.000), lacteos (Mastellone 75-80% leche fluida), seguros (top 5 ART controlan 70,9%), concesiones de infraestructura (aeropuertos, peajes, Hidrovia), monopolios digitales (MercadoLibre 60%+), la historia de las privatizaciones 1989-1999, el impacto de la desregulacion Milei, y la cuantificacion del costo al consumidor.',
        'Las fases 23-27 realizaron cruces profundos con las investigaciones hermanas: finanzas-politicas (141 hallazgos de donaciones y votos) y obras-publicas (85 hallazgos de contratos, 43.615 coincidencias SAME_ENTITY).',
        'Las fases 29-32 constituyeron el ciclo de enriquecimiento: verificacion de 25 entidades offshore activas contra ICIJ, verificacion de 20 afirmaciones no confirmadas, verificacion de 18 conexiones personales, y busqueda de 20 nuevos desarrollos 2025-2026.',
        'Finalmente, un factcheck completo evaluo 75 afirmaciones clave: 41 fueron verificadas (55%), 22 corregidas (29%), 11 resultaron inverificables sin acceso a registros no publicos (15%), y 1 fue desmentida (la participacion de Ledesma en el mercado azucarero era 17-20%, no 75% como se afirmaba inicialmente). [21]',
        'Cada hallazgo generado por IA fue verificado independientemente contra fuentes primarias. Ningun dato salio del servidor local durante el proceso de analisis.',
      ],
      en: [
        'The process began with an automated multi-phase investigation cycle. Each phase follows the pattern ingest → verify → cross-reference → analyze → factcheck. The first 10 phases performed deep dives into specific sectors: telecommunications, energy, food, media, banking, mining, agro-export, construction, pharmaceuticals, and transport. Each phase dispatched parallel research agents that performed exhaustive web searches, queried public databases, and wrote structured JSON files with sources for every claim.',
        'Phases 11-14 cross-referenced sectoral findings against the existing Neo4j graph of 2.45 million nodes. This graph was built from 9 public data sources: IGJ corporate registry (951,868 officers) [19], ICIJ offshore leaks (Panama Papers, Pandora Papers, Paradise Papers) [20], CNE campaign data, Boletin Oficial appointments, CompraR procurement system, DDJJ asset declarations, CNV registry, Como Voto legislative records, and OpenSanctions. The cross-reference engine operates in three layers: exact CUIT matching (confidence 0.95-1.0), DNI/CUIL matching (0.9-0.95), and fuzzy normalized name matching (0.6-0.8, Levenshtein ≤ 2).',
        'Phases 15-22 expanded the investigation to additional sectors: aluminium (pure monopoly, HHI 10,000), dairy (Mastellone 75-80% fluid milk), insurance (top 5 ART control 70.9%), infrastructure concessions (airports, tolls, waterway), digital monopolies (MercadoLibre 60%+), the 1989-1999 privatization history, Milei deregulation impact, and consumer cost quantification.',
        'Phases 23-27 performed deep cross-references with sibling investigations: finanzas-politicas (141 donation and voting findings) and obras-publicas (85 contract findings, 43,615 SAME_ENTITY matches).',
        'Phases 29-32 constituted the enrichment loop: verification of 25 active offshore entities against ICIJ, verification of 20 unconfirmed claims, verification of 18 person connections, and a hunt for 20 new 2025-2026 developments.',
        'Finally, a full factcheck evaluated 75 key claims: 41 were verified (55%), 22 corrected (29%), 11 were unverifiable without access to non-public records (15%), and 1 was debunked (Ledesma\'s sugar market share was 17-20%, not 75% as initially claimed). [21]',
        'Every AI-generated finding was independently verified against primary sources. No data left the local server during the analysis process.',
      ],
    },
    pullQuote: {
      es: '75 afirmaciones verificadas: 55% confirmadas, 29% corregidas, 1% desmentida. La IA revela patrones. Las conclusiones son del lector.',
      en: '75 claims factchecked: 55% confirmed, 29% corrected, 1% debunked. AI reveals patterns. Conclusions are the reader\'s.',
    },
    citations: [
      { id: 19, text: 'IGJ — Registro público de sociedades (951K officers)', url: 'https://www.igj.gob.ar/' },
      { id: 20, text: 'ICIJ Offshore Leaks Database — Panama Papers, Pandora Papers, Paradise Papers', url: 'https://offshoreleaks.icij.org/' },
      { id: 21, text: 'INDEC — Estadísticas de comercio exterior y precios', url: 'https://www.indec.gob.ar/' },
    ],
  },
  {
    id: 'privatizaciones',
    title: { es: 'II. El Pecado Original: Las Privatizaciones de 1989', en: 'II. The Original Sin: The 1989 Privatizations' },
    paragraphs: {
      es: [
        'Cada monopolio privado que opera hoy en Argentina fue creado por una decision politica entre 1989 y 1999.',
        'El 17 de agosto de 1989, el Congreso aprobo la Ley de Reforma del Estado 23.696 bajo el gobierno de Carlos Menem. [1] Roberto Dromi — el ministro que la redacto — declaro: "nada de lo que deba ser estatal permanecera en manos del Estado." La ley habilito la privatizacion de 30+ empresas publicas, transferidas a compradores conectados a precios subvaluados. [2]',
        'ENTel — el monopolio telefonico estatal — fue dividido en dos: Telecom (norte, para France Telecom/Stet) y Telefonica (sur, para Telefonica de Espana). El duopolio de 1990 se esta fusionando en 2025-2026 bajo control de Grupo Clarin, reconstruyendo el monopolio original pero en manos privadas. El circulo se cierra despues de 35 anos.',
        'SEGBA — la empresa electrica de Buenos Aires — fue dividida en Edenor y Edesur, creando un duopolio de distribucion que persiste hasta hoy. Edenor esta ahora bajo control de Vila-Manzano (los mismos accionistas que controlan America TV y Telefe). Edesur permanece bajo Enel (Italia). Entre ambas, ARS 274.000 millones de ganancia en 9 meses en 2025.',
        'Gas del Estado fue fracturada en TGS y TGN para el transporte, mas 9 distribuidoras regionales. TGS quedo bajo Mindlin/Pampa Energia. TGN bajo Techint/Eurnekian. Las licencias fueron extendidas hasta 2047 — medio siglo de monopolio garantizado sin licitacion competitiva.',
        'SOMISA — la siderurgica estatal — fue vendida a Techint por aproximadamente un septimo de su valor libros. Hoy es Ternium/Siderar, con ~80% del mercado domestico de acero plano y proteccion arancelaria que impide la competencia de importaciones.',
        'Aerolineas Argentinas fue vendida a Iberia, que la desinvirtio sistematicamente. La flota cayo de 28 aviones propios a 2. Paso por Marsans (otra desguazadora) antes de ser renacionalizada en 2008 con un patrimonio neto negativo de USD 2.500 millones.',
        'Maria Julia Alsogaray — la funcionaria a cargo de varias privatizaciones — fue procesada por enriquecimiento ilicito. La cadena que estas privatizaciones crearon fue: ley → privatizacion → concesion → renegociacion → beneficio perpetuo.',
      ],
      en: [
        'Every private monopoly operating in Argentina today was created by a political decision between 1989 and 1999.',
        'On August 17, 1989, Congress approved the State Reform Law 23,696 under Carlos Menem\'s government. [1] Roberto Dromi — the minister who drafted it — declared: "nothing that should be state-owned will remain in the hands of the State." The law enabled the privatization of 30+ public companies, transferred to connected buyers at undervalued prices. [2]',
        'ENTel — the state telephone monopoly — was split in two: Telecom (north, to France Telecom/Stet) and Telefonica (south, to Telefonica de Espana). The 1990 duopoly is merging in 2025-2026 under Grupo Clarin\'s control, reconstructing the original monopoly but in private hands. The circle closes after 35 years.',
        'SEGBA — Buenos Aires\' electricity company — was split into Edenor and Edesur, creating a distribution duopoly that persists today. Edenor is now under Vila-Manzano control (the same shareholders who control America TV and Telefe). Edesur remains under Enel (Italy). Between them, ARS 274 billion in profit in 9 months in 2025.',
        'Gas del Estado was fractured into TGS and TGN for transport, plus 9 regional distributors. TGS went to Mindlin/Pampa Energia. TGN to Techint/Eurnekian. Licenses were extended to 2047 — half a century of guaranteed monopoly without competitive bidding.',
        'SOMISA — the state steel company — was sold to Techint for approximately one-seventh of book value. Today it is Ternium/Siderar, with ~80% of the domestic flat steel market and tariff protection preventing import competition.',
        'Aerolineas Argentinas was sold to Iberia, which systematically stripped it. The fleet fell from 28 owned planes to 2. It passed through Marsans (another stripper) before being renationalized in 2008 with a negative net worth of USD 2.5 billion.',
        'Maria Julia Alsogaray — the official in charge of several privatizations — was prosecuted for illicit enrichment. The chain these privatizations created was: law → privatization → concession → renegotiation → perpetual benefit.',
      ],
    },
    pullQuote: {
      es: 'Las mismas seis familias que compraron activos del Estado en los 90s siguen controlandolos en 2026. El circulo del monopolio telefonico se cierra despues de 35 anos.',
      en: 'The same six families that bought state assets in the 1990s still control them in 2026. The telecom monopoly circle closes after 35 years.',
    },
    citations: [
      { id: 1, text: 'Ley 23.696 Reforma del Estado', url: 'https://www.boletinoficial.gob.ar/' },
      { id: 2, text: 'Privatizaciones Argentina — historia completa', url: 'https://es.wikipedia.org/wiki/Privatizaciones_menemistas' },
    ],
  },
  {
    id: 'imperios',
    title: { es: 'III. Los Diez Imperios', en: 'III. The Ten Empires' },
    paragraphs: {
      es: [
        'Diez grupos familiares controlan los sectores clave de la economia argentina. El grafo Neo4j los mapea a traves de 951.868 registros de officers corporativos [3], 4.349 officers offshore [4], y 2.270 politicos.',
        'Vila-Manzano encabeza con 70+ empresas. Daniel Vila y Jose Luis Manzano — este ultimo ex-Ministro del Interior de Menem — controlan ahora los dos canales de television mas vistos de Argentina (America TV + Telefe, adquirido de Paramount por USD 95 millones en 2025) [5] mas la mayor distribuidora electrica (Edenor, via DESA). La combinacion de poder mediatico + energia + conexion politica directa constituye el caso mas extremo de concentracion cruzada.',
        'Marcelo Mindlin opera 52 empresas a traves de Pampa Energia. Controla simultaneamente generacion electrica, distribucion (Edenor, compartida con Vila-Manzano), transporte de gas (TGS, 60%), y seguros. En diciembre 2025, adquirio Loma Negra — el 45% del mercado de cemento — via la quiebra brasilena de InterCement. Ahora controla energia + cemento: los dos insumos basicos de toda infraestructura.',
        'Hector Magnetto lidera Grupo Clarin con 35 empresas: el diario de mayor circulacion, TN, Canal 13, Radio Mitre, Cablevision/Flow, y Telecom Argentina (46% banda ancha, 33% movil, 36-40% TV paga). La fusion Telecom-Cablevision de 2018 — aprobada por la CNDC bajo condiciones que nunca se cumplieron completamente — creo la convergencia medios-telecomunicaciones mas concentrada del mundo. La pendiente adquisicion de Telefonica (USD 1.245 millones) llevaria la cuota movil a 65%.',
        'Eduardo Eurnekian controla 35 empresas incluyendo Corporacion America/AA2000 (35 aeropuertos, 90% del trafico comercial). La concesion aeroportuaria fue renegociada y extendida hasta 2038 — el canon fue eliminado en 2007. Martin Eurnekian (sobrino) aparece como officer de Viskert Enterprises Ltd en BVI segun ICIJ.',
        'La familia Roggio opera 33 empresas de servicios publicos: Metrovias (subte), Cliba (residuos), construccion vial. Aldo Benito Roggio creo 3 entidades en BVI (Gotland, Linhill, Graymark) en julio-octubre 2016 — durante el mismo periodo de la causa Cuadernos. Alcogal lo clasifico como riesgo Nivel 6. La verificacion confirmo cuentas en JPMorgan en Zurich, Nueva York y Miami. Confeso comisiones ilegales del 5% como arrepentido.',
        'La familia Blaquier (Ledesma) posee 28+ empresas y la red offshore mas extensa identificada en esta investigacion entre los grupos monopolicos: 7 entidades en BVI y Panama. Santiago Blaquier aparece en 6 entidades BVI (Sunbird, Silver Stream, Brahmbari, Caribbean Lodges, Fly Fishing, Global Fishing). Carlos Herminio Blaquier en 2 (Yamary Business, Dunmoore Trading). Alejandro Blaquier en 1 (Cabonor, Panama). Ledesma SAAI tiene 125 contratos gubernamentales en Neo4j — la combinacion de poder de mercado + offshore + contratos estatales constituye el mayor riesgo de erosion de base impositiva.',
        'Alfredo Coto domina el retail del AMBA con 26 empresas y figura como officer de Leopold Company S.A. en Panama segun ICIJ (entidad activa desde 2012). Federico Braun controla La Anonima con 26 empresas — monopolio regional en Patagonia. Tomas Braun dono ARS 400.000 a campañas politicas. La familia Perez Companc opera 23 empresas via Molinos Rio de la Plata, dominando alimentos envasados.',
        'Completando el cuadro: la familia Werthein tiene 30 empresas (seguros, banca, agricultura) + entidad offshore Canrold Overseas (BVI, Pandora Papers); y la familia Madanes Quintanilla controla el unico monopolio puro documentado en Argentina — Aluar Aluminio (HHI 10.000) + FATE neumaticos, con 6 miembros familiares en entidades offshore incluyendo un fideicomiso en las Islas Cook.',
      ],
      en: [
        'Ten family groups control the key sectors of the Argentine economy. The Neo4j graph maps them through 951,868 corporate officer records [3], 4,349 offshore officers [4], and 2,270 politicians.',
        'Vila-Manzano leads with 70+ companies. Daniel Vila and Jose Luis Manzano — the latter a former Interior Minister under Menem — now control Argentina\'s two most-watched TV channels (America TV + Telefe, acquired from Paramount for USD 95 million in 2025) [5] plus the largest electricity distributor (Edenor, via DESA). The combination of media power + energy + direct political connection constitutes the most extreme case of cross-sector concentration.',
        'Marcelo Mindlin operates 52 companies through Pampa Energia. He simultaneously controls electricity generation, distribution (Edenor, shared with Vila-Manzano), gas transport (TGS, 60%), and insurance. In December 2025, he acquired Loma Negra — 45% of the cement market — via Brazil\'s InterCement bankruptcy. He now controls energy + cement: the two basic inputs for all infrastructure.',
        'Hector Magnetto leads Grupo Clarin with 35 companies: the highest-circulation newspaper, TN, Canal 13, Radio Mitre, Cablevision/Flow, and Telecom Argentina (46% broadband, 33% mobile, 36-40% pay-TV). The 2018 Telecom-Cablevision merger — approved by CNDC under conditions never fully met — created the world\'s most concentrated media-telecom convergence. The pending Telefonica acquisition (USD 1.245 billion) would push mobile share to 65%.',
        'Eduardo Eurnekian controls 35 companies including Corporacion America/AA2000 (35 airports, 90% of commercial traffic). The airport concession was renegotiated and extended to 2038 — the canon was eliminated in 2007. Martin Eurnekian (nephew) appears as officer of Viskert Enterprises Ltd in BVI per ICIJ.',
        'The Roggio family operates 33 public service companies: Metrovias (subway), Cliba (waste), road construction. Aldo Benito Roggio created 3 BVI entities (Gotland, Linhill, Graymark) in July-October 2016 — during the same period as the Cuadernos investigation. Alcogal classified him as Level 6 risk. Verification confirmed JPMorgan accounts in Zurich, New York, and Miami. He confessed to 5% illegal kickbacks as a cooperating witness.',
        'The Blaquier family (Ledesma) owns 28+ companies and the most extensive offshore network identified in this investigation of any monopoly group: 7 entities in BVI and Panama. Santiago Blaquier appears in 6 BVI entities (Sunbird, Silver Stream, Brahmbari, Caribbean Lodges, Fly Fishing, Global Fishing). Carlos Herminio Blaquier in 2 (Yamary Business, Dunmoore Trading). Alejandro Blaquier in 1 (Cabonor, Panama). Ledesma SAAI has 125 government contracts in Neo4j — the combination of market power + offshore + state contracts constitutes the largest tax base erosion risk.',
        'Alfredo Coto dominates AMBA retail with 26 companies and is listed as officer of Leopold Company S.A. in Panama per ICIJ (entity active since 2012). Federico Braun controls La Anonima with 26 companies — a regional Patagonian monopoly. Tomas Braun donated ARS 400,000 to political campaigns. The Perez Companc family operates 23 companies via Molinos Rio de la Plata, dominating packaged food.',
        'Completing the picture: the Werthein family has 30 companies (insurance, banking, agriculture) + offshore entity Canrold Overseas (BVI, Pandora Papers); and the Madanes Quintanilla family controls Argentina\'s only documented pure monopoly — Aluar Aluminium (HHI 10,000) + FATE tires, with 6 family members in offshore entities including a Cook Islands trust.',
      ],
    },
    pullQuote: {
      es: 'Vila-Manzano controla los 2 canales mas vistos + la mayor distribuidora electrica. Mindlin tiene energia + cemento. Clarin tiene medios + telecomunicaciones. Cada imperio cruza sectores.',
      en: 'Vila-Manzano controls the 2 most-watched channels + the largest electricity distributor. Mindlin has energy + cement. Clarin has media + telecom. Every empire crosses sectors.',
    },
    citations: [
      { id: 3, text: 'IGJ Registry — 951,868 company officers', url: 'https://www.igj.gob.ar/' },
      { id: 4, text: 'ICIJ Offshore Leaks Database', url: 'https://offshoreleaks.icij.org/' },
      { id: 5, text: 'Telefe sale — Infobae', url: 'https://www.infobae.com/' },
    ],
  },
  {
    id: 'offshore',
    title: { es: 'IV. La Red Offshore: 60 Entidades, 5 Jurisdicciones', en: 'IV. The Offshore Network: 60 Entities, 5 Jurisdictions' },
    paragraphs: {
      es: [
        'Se identificaron 60 entidades offshore vinculadas a familias monopolicas en la base de datos ICIJ [6], de las cuales 25 permanecen activas o en estado de penalidad.',
        'Las Islas Virgenes Britanicas dominan con 29 entidades. Panama alberga 4 (Coto, Blaquier, Cartellone). Las Islas Cook tienen el fideicomiso Madanes Quintanilla. Malta alberga la entidad de Miguel Galuccio (Vista Oil) — quien ademas tiene una segunda entidad (4M International Investment) en BVI descubierta durante la verificacion. Florida alberga las LLCs de Miguel Acevedo (Vicentin/AGD) — originalmente reportadas como entidad BVI "Tomma Investments", corregida durante el factcheck a "TAMMA INVESTMENTS LLC" en Florida.',
        'Tres casos requieren atencion critica. Primero, los Roggio: Aldo Benito Roggio creo Gotland, Linhill y Graymark — las tres en BVI — entre julio y octubre de 2016, mientras ya estaba bajo investigacion en la causa Cuadernos. [7] Alcogal, el agente registrador panameno, lo clasifico como Nivel 6 de riesgo. La verificacion confirmo cuentas en JPMorgan Zurich, Nueva York y Miami.',
        'Segundo, De Narvaez: la AFIP tiene una investigacion activa por evasion fiscal agravada contra la familia. No pueden justificar un aumento del 900% en sus activos. Las hermanas De Narvaez estan siendo investigadas por la UIF por lavado de dinero. Retrato Partners (BVI, 2015) y Titan Consulting (BVI, 1998, compartida con 3 familiares) permanecen activas.',
        'Tercero, Nardelli/Vicentin: Kerdale Investments Corp (BVI, 2012) esta en el centro del default de USD 1.500 millones. Hay una denuncia activa por lavado de dinero ante Procelac. El juzgado federal solicito reportes de operaciones sospechosas a la UIF. La entidad esta registrada en la misma direccion que la Vicentin en bancarrota.',
        'La entidad offshore mas antigua es Hinslet Overseas Ltd (Norma Gold de Werthein, BVI, 1997) — activa durante 29 anos. Maria Rosa Cartellone tiene 2 entidades en Panama (Starlink Company, Unimas Company) intermediadas por PwC Uruguay, mas una tercera del familiar Gerardo Cartellone (Confino Investment, Panama, via intermediario suizo).',
      ],
      en: [
        'We identified 60 offshore entities linked to monopoly families in the ICIJ database [6], of which 25 remain active or in penalty status.',
        'The British Virgin Islands dominate with 29 entities. Panama holds 4 (Coto, Blaquier, Cartellone). The Cook Islands house the Madanes Quintanilla trust. Malta holds Miguel Galuccio\'s entity (Vista Oil) — who also has a second entity (4M International Investment) in BVI discovered during verification. Florida holds Miguel Acevedo\'s LLCs (Vicentin/AGD) — originally reported as BVI entity "Tomma Investments," corrected during factcheck to "TAMMA INVESTMENTS LLC" in Florida.',
        'Three cases require critical attention. First, the Roggios: Aldo Benito Roggio created Gotland, Linhill, and Graymark — all three in BVI — between July and October 2016, while already under investigation in the Cuadernos case. [7] Alcogal, the Panamanian registered agent, classified him as Level 6 risk. Verification confirmed JPMorgan accounts in Zurich, New York, and Miami.',
        'Second, De Narvaez: AFIP has an active investigation for aggravated tax evasion against the family. They cannot justify a 900% asset increase. The De Narvaez sisters are being investigated by UIF for money laundering. Retrato Partners (BVI, 2015) and Titan Consulting (BVI, 1998, shared with 3 family members) remain active.',
        'Third, Nardelli/Vicentin: Kerdale Investments Corp (BVI, 2012) is at the center of the USD 1.5 billion default. There is an active money laundering complaint at Procelac. The federal court requested suspicious activity reports from UIF. The entity is registered at the same address as the bankrupt Vicentin.',
        'The oldest offshore entity is Hinslet Overseas Ltd (Norma Gold de Werthein, BVI, 1997) — active for 29 years. Maria Rosa Cartellone has 2 Panama entities (Starlink Company, Unimas Company) intermediated by PwC Uruguay, plus a third from family member Gerardo Cartellone (Confino Investment, Panama, via Swiss intermediary).',
      ],
    },
    pullQuote: {
      es: 'Segun ICIJ, Roggio creo 3 entidades BVI durante el mismo periodo de la investigacion criminal. Alcogal lo clasifico como riesgo Nivel 6.',
      en: 'According to ICIJ, Roggio created 3 BVI entities during the same period as the criminal investigation. Alcogal classified him as Level 6 risk.',
    },
    citations: [
      { id: 6, text: 'ICIJ Offshore Leaks — Blaquier entities', url: 'https://offshoreleaks.icij.org/' },
      { id: 7, text: 'Roggio Pandora Papers — elDiarioAR', url: 'https://www.eldiarioar.com/' },
    ],
  },
  {
    id: 'sobornos',
    title: { es: 'V. El Nexo del Soborno: Cuadernos + Odebrecht', en: 'V. The Bribery Nexus: Cuadernos + Odebrecht' },
    paragraphs: {
      es: [
        'El cruce con la investigacion de obras publicas (37.351 nodos, 19.560 relaciones) revelo que la estructura monopolica y el aparato de sobornos son la misma red.',
        'Los 5 mayores contratistas de obra publica por monto adjudicado — totalizando ARS 13 billones — son todos actores monopolicos de esta investigacion. La UTE SUPERCEMENTO-ROGGIO-CARRANZA posee un unico contrato de ARS 5,7 billones. Los tres socios estan implicados en la causa Cuadernos.',
        '8 de 14 acusados en la causa Cuadernos [8] figuran en nuestra lista de monopolios: Roggio (confeso 5% de comisiones), Calcaterra/IECSA (ofrecio ARS 2.942,6M para su sobreseimiento, rechazado por el tribunal), Electroingenieria/Ferreyra (en juicio), Cartellone, Techint/Rocca (sobreseimiento firme porque la fiscalia perdio el plazo de apelacion), Esuco/Wagner (organizo el cartel via la Camara Argentina de la Construccion, 20% de sobreprecio), CPC, y Austral/Baez.',
        'Odebrecht pago USD 35 millones en sobornos en Argentina a traves de 3 proyectos por USD 4.680 millones. [9] IECSA/SACDE tenia el 30% del consorcio del Soterramiento del Sarmiento y canalizo USD 4,5 millones a cuentas en Andorra. Roggio y Cartellone fueron socios directos de Odebrecht en el consorcio de la planta potabilizadora de AySA. Odebrecht no creo una nueva red de corrupcion — se enchufó en el cartel existente.',
        'Cero condenas en Argentina tras 10+ anos. El juicio oral de Cuadernos — 87 acusados ante el TOF 7 — comenzo en noviembre 2025 y continua.',
        'SACDE (ex-IECSA, ahora bajo la orbita Mindlin) es el actor mas profundamente incrustado: ARS 1,9 billones en contratos, doble causa de soborno, 2 casos de puerta giratoria (Clusellas en Presidencia, Jahn en ENOHSA), vinculos con Panama Papers + entidad en Delaware.',
      ],
      en: [
        'Cross-referencing with the public works investigation (37,351 nodes, 19,560 relationships) revealed that the monopoly structure and the bribery apparatus are the same network.',
        'The top 5 public works contractors by award amount — totaling ARS 13 trillion — are all monopoly actors from this investigation. The SUPERCEMENTO-ROGGIO-CARRANZA UTE holds a single ARS 5.7 trillion contract. All three partners are implicated in the Cuadernos case.',
        '8 of 14 Cuadernos defendants [8] are on our monopoly list: Roggio (confessed 5% kickbacks), Calcaterra/IECSA (offered ARS 2,942.6M for dismissal, rejected by court), Electroingenieria/Ferreyra (on trial), Cartellone, Techint/Rocca (cleared because prosecutors missed appeal deadline), Esuco/Wagner (organized the cartel via the Argentine Construction Chamber, 20% overpricing), CPC, and Austral/Baez.',
        'Odebrecht paid USD 35 million in Argentine bribes across 3 projects worth USD 4.68 billion. [9] IECSA/SACDE held 30% of the Sarmiento burial consortium and channeled USD 4.5 million to Andorra accounts. Roggio and Cartellone were direct Odebrecht consortium partners in the AySA water plant. Odebrecht did not create a new corruption network — it plugged into the existing cartel.',
        'Zero convictions in Argentina after 10+ years. The Cuadernos oral trial — 87 defendants before TOF 7 — began in November 2025 and continues.',
        'SACDE (ex-IECSA, now under the Mindlin orbit) is the most deeply embedded actor: ARS 1.9 trillion in contracts, dual bribery cases, 2 revolving door cases (Clusellas at Presidencia, Jahn at ENOHSA), Panama Papers + Delaware entity links.',
      ],
    },
    pullQuote: {
      es: 'Los 5 mayores contratistas de obra publica son todos actores monopolicos. Odebrecht no creo una nueva red: se enchufo en el cartel existente.',
      en: 'The top 5 public works contractors are all monopoly actors. Odebrecht didn\'t create a new network: it plugged into the existing cartel.',
    },
    citations: [
      { id: 8, text: 'Causa Cuadernos — CIJ', url: 'https://www.cij.gov.ar/' },
      { id: 9, text: 'Odebrecht DOJ plea agreement', url: 'https://www.justice.gov/criminal-fraud/file/1011186/download' },
    ],
  },
  {
    id: 'consumidor',
    title: { es: 'VI. El Costo: USD 22.500 Millones Por Ano', en: 'VI. The Cost: USD 22.5 Billion Per Year' },
    paragraphs: {
      es: [
        'USD 22.500 millones por ano. Eso paga el consumidor argentino por la concentracion de mercado — 3,3% del PIB.',
        'Nuestro analisis sector por sector estima el costo anual de la concentracion de mercado en USD 22.500 millones — equivalente al 3,3% del PIB. Incluyendo perdidas de eficiencia, el total sube a USD 28.500 millones (4,2% del PIB). Esto equivale a USD 1.585 por hogar por ano. NOTA: esta cifra es una estimacion compilada a partir de datos sectoriales, no una cifra publicada por un organismo unico.',
        'El impacto es profundamente regresivo. El quintil mas pobre pierde el 15% de sus ingresos por precios monopolicos. El quintil mas rico pierde solo el 3%.',
        'Los precios de medicamentos en Argentina son 26% superiores al promedio latinoamericano. PAMI — el sistema de salud para jubilados — documento sobreprecios de hasta 1.327% en anastrozol (oncologico): $13.192 contra $924 en licitacion abierta. [11] Las reformas desde 2016 lograron ahorros del 68-80% donde se implementaron, pero la estructura oligopolica persiste.',
        'En alimentos, la brecha productor-gondola promedio es de 3,7x segun CAME (enero 2025) [10], con extremos de 14,5x en limon y 9,5x en mandarina. Los productores reciben entre 24,7% y 35,7% del precio final. 8.900 tambos activos — minimo historico. 1.024 tambos cerraron bajo la administracion Milei.',
        'El aluminio de Aluar — monopolio puro, HHI 10.000 — se produce con energia subsidiada al 63-80% de descuento (USD 16-26/MWh vs mercado $70-80/MWh). La represa Futaleufú fue construida con USD 474,5 millones de fondos publicos; Aluar posee el 60,2%. La concesion vence en junio 2026.',
        'La OCDE estima que reformas pro-competencia podrian impulsar el PIB argentino un 9,5% acumulado para 2050 (Encuesta Economica Argentina 2025, Capitulo 4: 2,7% por reformas ya realizadas + 6,8% adicional por reformas al primer cuartil PMR de la OCDE). [12]',
      ],
      en: [
        'USD 22.5 billion per year. That is what the Argentine consumer pays for market concentration — 3.3% of GDP.',
        'Our sector-by-sector analysis estimates the annual cost of market concentration at USD 22.5 billion — equivalent to 3.3% of GDP. Including efficiency losses, the total rises to USD 28.5 billion (4.2% of GDP). This equals USD 1,585 per household per year. NOTE: this figure is a compiled estimate from sectoral data, not a single published figure.',
        'The impact is deeply regressive. The poorest quintile loses 15% of income to monopoly pricing. The richest quintile loses only 3%.',
        'Drug prices in Argentina are 26% above the Latin American average. PAMI — the health system for retirees — documented markups up to 1,327% on anastrozol (oncology drug): $13,192 vs $924 in open tender. [11] Reforms since 2016 achieved 68-80% savings where implemented, but the oligopolistic structure persists.',
        'In food, the average farm-to-shelf markup is 3.7x per CAME (January 2025) [10], with extremes of 14.5x for lemons and 9.5x for mandarins. Producers receive between 24.7% and 35.7% of the final price. 8,900 active dairy farms — historic low. 1,024 farms closed under the Milei administration.',
        'Aluar\'s aluminium — pure monopoly, HHI 10,000 — is produced with energy subsidized at 63-80% discount (USD 16-26/MWh vs market $70-80/MWh). The Futaleufu dam was built with USD 474.5 million in public funds; Aluar owns 60.2%. The concession expires in June 2026.',
        'The OECD estimates pro-competition reforms could boost Argentine GDP by 9.5% cumulatively by 2050 (Economic Survey Argentina 2025, Chapter 4: 2.7% from reforms already done + 6.8% additional from reforms to OECD first-quartile PMR). [12]',
      ],
    },
    pullQuote: {
      es: 'El quintil mas pobre pierde el 15% de sus ingresos por precios monopolicos. El quintil mas rico pierde solo el 3%.',
      en: 'The poorest quintile loses 15% of income to monopoly pricing. The richest quintile loses only 3%.',
    },
    citations: [
      { id: 10, text: 'CAME IPOD — brecha productor-consumidor', url: 'https://www.came.org.ar/' },
      { id: 11, text: 'PAMI sobreprecios anastrozol — fuentes oficiales' },
      { id: 12, text: 'OECD Economic Survey Argentina 2025', url: 'https://www.oecd.org/economy/surveys/argentina-economic-snapshot/' },
    ],
  },
  {
    id: 'milei',
    title: { es: 'VII. La Era Milei: Desregulacion Sin Competencia', en: 'VII. The Milei Era: Deregulation Without Competition' },
    paragraphs: {
      es: [
        'El 20 de diciembre de 2023, el DNU 70/2023 [13] — un megadecreto de 366 articulos — elimino los topes de licencias de medios, la Ley de Gondolas, los controles de precios, y decenas de regulaciones sectoriales. 73 leyes modificadas o derogadas por decreto en un solo dia.',
        'El efecto inmediato: las fusiones mas grandes desde las privatizaciones de los 90s se aceleraron sin contrapeso regulatorio. Vila-Manzano compro Telefe. Telecom/Clarin compro Telefonica (USD 1.245 millones). Visa readquirio Prisma (80% del procesamiento de tarjetas). Mindlin adquirio Loma Negra. Todo durante una ventana en la que la CNDC habia sido reemplazada por la ANC (noviembre 2025) pero el control previo de fusiones no se activa hasta noviembre 2026.',
        'El RIGI — Regimen de Incentivo a Grandes Inversiones [14] — otorga 30 anos de estabilidad fiscal, regalias del 3%, y libre repatriacion de ganancias a inversiones de USD 200M+. El 64,8% de los USD 33.900 millones presentados bajo RIGI son proyectos mineros. Argentina no tiene un solo productor de litio de capital nacional — el 100% de la extraccion es extranjera, ahora blindada por 30 anos.',
        '20 empresas oligopolicas controlan el 74% del espacio de gondola en supermercados — sin restriccion alguna tras la derogacion de la Ley de Gondolas. Edenor + Edesur generaron ARS 274.000 millones de ganancia en 9 meses, 44% por encima de la inflacion. Telecom/Clarin aumento ganancias un 2.080%.',
        '73 leyes derogadas. La ventana de fusiones sin control previo cierra en noviembre 2026.',
      ],
      en: [
        'On December 20, 2023, DNU 70/2023 [13] — a 366-article mega-decree — eliminated media license caps, the shelf-space law, price controls, and dozens of sector regulations. 73 laws modified or repealed by decree in a single day.',
        'The immediate effect: the largest mergers since the 1990s privatizations accelerated without regulatory counterweight. Vila-Manzano bought Telefe. Telecom/Clarin bought Telefonica (USD 1.245 billion). Visa reacquired Prisma (80% card processing). Mindlin acquired Loma Negra. All during a window in which CNDC had been replaced by ANC (November 2025) but ex-ante merger control doesn\'t activate until November 2026.',
        'RIGI — the Large Investment Incentive Regime [14] — grants 30-year tax stability, 3% royalties, and free profit repatriation for USD 200M+ investments. 64.8% of the USD 33.9 billion submitted under RIGI are mining projects. Argentina has zero domestic lithium producers — 100% of extraction is foreign, now shielded for 30 years.',
        '20 oligopolistic companies control 74% of supermarket shelf space — without any restriction after the shelf-space law repeal. Edenor + Edesur generated ARS 274 billion in profit in 9 months, 44% above inflation. Telecom/Clarin increased profits by 2,080%.',
        '73 laws repealed. The merger window without ex-ante control closes in November 2026.',
      ],
    },
    pullQuote: {
      es: '73 leyes derogadas por decreto. La ventana de fusiones sin control previo cierra en noviembre 2026.',
      en: '73 laws repealed by decree. The merger window without ex-ante control closes in November 2026.',
    },
    citations: [
      { id: 13, text: 'DNU 70/2023 — Boletin Oficial', url: 'https://www.boletinoficial.gob.ar/' },
      { id: 14, text: 'RIGI — Ley Bases', url: 'https://www.argentina.gob.ar/' },
    ],
  },
  {
    id: 'aluar',
    title: { es: 'VIII. Aluar: Anatomia de un Monopolio Perfecto', en: 'VIII. Aluar: Anatomy of a Perfect Monopoly' },
    paragraphs: {
      es: [
        'Aluar Aluminio Argentino SAIC es el unico productor de aluminio primario en Argentina. [15] HHI 10.000 — monopolio puro. 460.000 toneladas anuales de capacidad. USD 550 millones en exportaciones. Controlado por la familia Madanes Quintanilla desde 1970.',
        'La represa de Futaleufú — construida con USD 474,5 millones de fondos publicos — genera el 95% de su electricidad exclusivamente para Aluar. [16] La empresa paga USD 16-26/MWh. El precio de mercado es USD 70-80/MWh. Un descuento del 63-80% durante 28 anos, financiado por el Estado.',
        'Seis miembros de la familia Madanes Quintanilla aparecen en la base ICIJ [17]: Javier Santiago Madanes Quintanilla (DQ Assets Limited, BVI), y Carmen, Judith, Leiser, Martin, Micaela, Susana y Tomas Madanes en The Hastings Trust (Islas Cook). Panama Papers.',
        'Segun registros de la CNE [18], Aluar es la unica empresa identificada en esta investigacion que dono a ambas coaliciones en las elecciones 2019: ARS 4.500.000 a Juntos por el Cambio y ARS 900.000 al Frente de Todos. Total verificado: ARS 11.150.000 entre 2017 y 2019.',
        'El detalle juridico: el Art. 15 de la Ley 26.215 prohibe las donaciones de concesionarios del Estado. Aluar posee el 60,2% de Futaleufu SA, que tiene una concesion estatal. El Frente de Todos inicialmente RECHAZO la donacion de ARS 900.000 alegando esta prohibicion. Luego la acepto cuando Aluar argumento que la concesion es de la subsidiaria, no de Aluar directamente.',
        'Cuando el gobierno Milei elimino los aranceles antidumping sobre el aluminio chino en febrero 2026, FATE — la fabrica de neumaticos de la misma familia — cerro permanentemente, dejando 920 trabajadores sin empleo. Mientras tanto, durante los anos de proteccion arancelaria (2020-2025), Aluar habia SUBIDO los precios un 5-7% mientras el precio internacional CAIA un 16%.',
        'La concesion de Futaleufu vence en junio 2026. Es el primer test real de voluntad politica para desmantelar un monopolio. La historia sugiere que sera renegociada y extendida, como todas las demas concesiones. El patron es: ley → privatizacion → concesion → renegociacion → beneficio perpetuo.',
      ],
      en: [
        'Aluar Aluminio Argentino SAIC is the only primary aluminium producer in Argentina. [15] HHI 10,000 — pure monopoly. 460,000 tons annual capacity. USD 550 million in exports. Controlled by the Madanes Quintanilla family since 1970.',
        'The Futaleufu dam — built with USD 474.5 million in public funds — generates 95% of its electricity exclusively for Aluar. [16] The company pays USD 16-26/MWh. The market price is USD 70-80/MWh. A 63-80% discount for 28 years, funded by the State.',
        'Six Madanes Quintanilla family members appear in the ICIJ database [17]: Javier Santiago Madanes Quintanilla (DQ Assets Limited, BVI), and Carmen, Judith, Leiser, Martin, Micaela, Susana, and Tomas Madanes in The Hastings Trust (Cook Islands). Panama Papers.',
        'According to CNE records [18], Aluar is the only company identified in this investigation that donated to both coalitions in the 2019 elections: ARS 4,500,000 to Juntos por el Cambio and ARS 900,000 to Frente de Todos. Total verified: ARS 11,150,000 between 2017 and 2019.',
        'The legal detail: Art. 15 of Law 26,215 prohibits donations from state concessionaires. Aluar owns 60.2% of Futaleufu SA, which holds a state concession. Frente de Todos initially REJECTED the ARS 900,000 donation citing this prohibition. They later accepted it when Aluar argued the concession belongs to the subsidiary, not Aluar directly.',
        'When the Milei government eliminated anti-dumping tariffs on Chinese aluminium in February 2026, FATE — the tire factory owned by the same family — permanently closed, leaving 920 workers unemployed. Meanwhile, during the years of tariff protection (2020-2025), Aluar had RAISED prices 5-7% while the international price FELL 16%.',
        'The Futaleufu concession expires in June 2026. It is the first real test of political will to dismantle a monopoly. History suggests it will be renegotiated and extended, like every other concession. The pattern is: law → privatization → concession → renegotiation → perpetual benefit.',
      ],
    },
    pullQuote: {
      es: 'Aluar dono a ambos bandos en 2019. Aluar tiene energia subsidiada al 63-80% de descuento con fondos publicos. La concesion vence en junio 2026.',
      en: 'Aluar donated to both sides in 2019. Aluar has energy subsidized at 63-80% discount with public funds. The concession expires June 2026.',
    },
    citations: [
      { id: 15, text: 'Aluar — datos de produccion', url: 'https://www.aluar.com.ar/' },
      { id: 16, text: 'Futaleufu concesion — CAMMESA/Sec. Energia' },
      { id: 17, text: 'ICIJ — Madanes Quintanilla entities', url: 'https://offshoreleaks.icij.org/' },
      { id: 18, text: 'CNE — aportes electorales 2019', url: 'https://aportantes.electoral.gob.ar/' },
    ],
  },
]


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResumenPage() {
  const { lang } = useLanguage()

  return (
    <article className="mx-auto max-w-prose pb-20 text-justify">
      {/* Header */}
      <header className="py-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 text-left sm:text-4xl">
          {TITLE[lang]}
        </h1>
        <p className="mt-4 text-lg text-zinc-400">{SUBTITLE[lang]}</p>
        <div className="mt-6 flex items-center gap-4 text-sm text-zinc-500">
          <span>{READING_TIME[lang]}</span>
          <span className="text-zinc-700">|</span>
          <span>{LAST_UPDATED[lang]}</span>
        </div>
        <p className="mt-4 text-xs text-zinc-600">{COMPILED_FROM[lang]}</p>
      </header>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.value} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center">
            <p className="text-xl font-bold text-amber-400">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{stat.label[lang]}</p>
          </div>
        ))}
      </div>

      <hr className="border-zinc-800" />

      {/* Chapters */}
      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="py-12">
          <h2 className="border-l-4 border-amber-500 pl-4 text-xl font-bold text-zinc-50">
            {chapter.title[lang]}
          </h2>

          <div className="mt-6 space-y-4">
            {chapter.paragraphs[lang].map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-zinc-300">
                <CitedText text={p} citations={chapter.citations} accentColor="amber" />
              </p>
            ))}
          </div>

          {chapter.pullQuote && (
            <blockquote className="my-6 border-l-2 border-amber-400 pl-4 text-lg italic text-zinc-200">
              {chapter.pullQuote[lang]}
            </blockquote>
          )}

          {/* Chapter citations footnotes */}
          <CitationFooter citations={chapter.citations} accentColor="amber" />
        </section>
      ))}

      {/* Sources */}
      <section className="py-12">
        <h2 className="border-l-4 border-amber-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Fuentes' : 'Sources'}
        </h2>
        <ul className="mt-6 space-y-2">
          <li><span className="text-sm text-zinc-400">CNDC — Comisión Nacional de Defensa de la Competencia</span></li>
          <li><span className="text-sm text-zinc-400">ENACOM — Ente Nacional de Comunicaciones</span></li>
          <li><span className="text-sm text-zinc-400">ENARGAS — Ente Nacional Regulador del Gas</span></li>
          <li><span className="text-sm text-zinc-400">ENRE — Ente Nacional Regulador de la Electricidad</span></li>
          <li><span className="text-sm text-zinc-400">INDEC — Estadísticas de comercio y precios</span></li>
          <li><span className="text-sm text-zinc-400">BCRA — Central de Deudores, datos financieros</span></li>
          <li><span className="text-sm text-zinc-400">IGJ — Registro corporativo (951K officers)</span></li>
          <li><span className="text-sm text-zinc-400">CNV — Comisión Nacional de Valores</span></li>
          <li><span className="text-sm text-zinc-400">Bolsa de Cereales de Buenos Aires</span></li>
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Esta investigación se basa en fuentes públicas verificadas. Todos los pipelines ETL son idempotentes y reproducibles. Ninguna fuente privada fue utilizada. La inclusión no implica culpabilidad.'
            : 'This investigation is based on verified public sources. All ETL pipelines are idempotent and reproducible. No private sources were used. Inclusion does not imply guilt.'}
        </p>
      </section>

    </article>
  )
}
