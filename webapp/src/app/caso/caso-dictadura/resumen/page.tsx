'use client'

/**
 * Caso Dictadura — Resumen (narrative summary).
 *
 * Complete investigation narrative with methodology, findings, and
 * accountability analysis from 25 waves of data ingestion and analysis.
 * Primary language: Spanish. UI chrome is bilingual.
 */

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'

const SLUG = 'caso-dictadura'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  headerBadge: { en: 'Investigation summary', es: 'Resumen de la investigacion' },
  headerTitle: {
    en: 'Argentine Dictatorship: What 14,512 nodes reveal',
    es: 'Dictadura Argentina: Lo que revelan 14.512 nodos',
  },
  headerDesc: {
    en: 'An evidence-based investigation compiled from 9,415 RUVTE victims, 774 clandestine detention centers, 987 pages of declassified SIDE intelligence documents, 281 Junta meeting minutes, and 31,607 mapped relationships across 12 data sources.',
    es: 'Una investigacion basada en evidencia compilada a partir de 9.415 victimas del RUVTE, 774 centros clandestinos de detencion, 987 paginas de documentos desclasificados de la SIDE, 281 actas de la Junta Militar y 31.607 relaciones mapeadas a traves de 12 fuentes de datos.',
  },
  viewData: { en: 'View data & evidence', es: 'Ver datos y evidencia' },
  timeline: { en: 'Timeline', es: 'Cronologia' },
  sources: { en: 'Sources', es: 'Fuentes' },
  methodology: { en: 'Methodology', es: 'Metodologia' },
  disclaimer: {
    en: 'This investigation is based on verified public sources, including government registries (RUVTE, SNEEP), court records, declassified intelligence documents, congressional archives, and academic datasets. It does not constitute legal advice. Where "flagged" or "unprosecuted" is indicated, it reflects the current state of the knowledge graph and may not capture all judicial proceedings. Inclusion of a person does not imply guilt beyond what is documented in judicial records.',
    es: 'Esta investigacion se basa en fuentes publicas verificadas, incluyendo registros gubernamentales (RUVTE, SNEEP), expedientes judiciales, documentos de inteligencia desclasificados, archivos parlamentarios y datasets academicos. No constituye asesoramiento legal. Donde se indica "senalado" o "sin procesamiento", refleja el estado actual del grafo de conocimiento y puede no capturar todos los procedimientos judiciales. La inclusion de una persona no implica culpabilidad mas alla de lo documentado en registros judiciales.',
  },
  navOverview: { en: '\u2190 Overview', es: '\u2190 Inicio' },
  navData: { en: 'Data & evidence \u2192', es: 'Datos y evidencia \u2192' },
} as const

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const CHAPTERS: {
  num: string
  title_en: string
  title_es: string
  paragraphs_en: string[]
  paragraphs_es: string[]
}[] = [
  {
    num: 'I',
    title_en: 'The Apparatus',
    title_es: 'El Aparato',
    paragraphs_en: [
      'The Argentine military dictatorship (1976-1983) built a state terror apparatus of industrial scale. The knowledge graph maps 14,512 entities and 31,607 relationships — from the Junta Militar at the apex down through 5 Army Corps, 14 military units, 774 clandestine detention centers, and the intelligence service (SIDE) with its 881 documented departments.',
      'The chain of command flowed through three branches: the Army (Ejército) controlled Zones 1 through 5 via Corps commands, the Navy (Armada) operated the ESMA through Task Force 3.3.2, and the Air Force operated sites like Mansión Seré. Below this military structure, the Buenos Aires Provincial Police under Ramón Camps ran a parallel detention network of at least 4 major CCDs, and the Federal Police (PFA) operated the ABO circuit (Club Atlético, El Banco, El Olimpo).',
      'The SIDE (Secretaría de Inteligencia de Estado) operated Automotores Orletti — the nerve center of Plan Cóndor in Argentina — with 71 documented cross-border victims. Declassified documents from 2026 reveal 98 named SIDE agents, a codification system using numerical codes to hide department identities, and a mandatory cover-name system for all personnel.',
    ],
    paragraphs_es: [
      'La dictadura militar argentina (1976-1983) construyo un aparato de terrorismo de Estado de escala industrial. El grafo de conocimiento mapea 14.512 entidades y 31.607 relaciones — desde la Junta Militar en la cupula hasta 5 Cuerpos de Ejercito, 14 unidades militares, 774 centros clandestinos de detencion y el servicio de inteligencia (SIDE) con sus 881 departamentos documentados.',
      'La cadena de mando fluia a traves de tres fuerzas: el Ejercito controlaba las Zonas 1 a 5 mediante los Cuerpos, la Armada operaba la ESMA a traves del Grupo de Tareas 3.3.2, y la Fuerza Aerea operaba sitios como Mansion Sere. Por debajo de esta estructura militar, la Policia de la Provincia de Buenos Aires bajo Ramon Camps manejaba una red paralela de detencion con al menos 4 CCD principales, y la Policia Federal (PFA) operaba el circuito ABO (Club Atletico, El Banco, El Olimpo).',
      'La SIDE (Secretaria de Inteligencia de Estado) operaba Automotores Orletti — el centro neuralgico del Plan Condor en Argentina — con 71 victimas transfronterizas documentadas. Los documentos desclasificados de 2026 revelan 98 agentes de la SIDE nombrados, un sistema de codificacion con numeros para ocultar la identidad de los departamentos, y un sistema obligatorio de nombres de encubrimiento para todo el personal.',
    ],
  },
  {
    num: 'II',
    title_en: 'The Victims',
    title_es: 'Las Victimas',
    paragraphs_en: [
      'The RUVTE (Unified Registry of Victims of State Terrorism) documents 9,415 victims with individual records — 8,632 with formal complaints and 783 from CONADEP listings without formal complaint. The median age at the time of disappearance was 26 years. 334 pregnant women were detained or disappeared. 193 minors under 18 were documented, including the students of the Noche de los Lápices.',
      '589 foreign nationals from 32 countries appear in the registry — not only Uruguayans, Chileans, and Paraguayans (expected from Plan Cóndor), but victims from Japan, Greece, Russia, Lithuania, Belgium, Hungary, Finland, and beyond. The international dimension is broader than commonly documented.',
      'Temporal analysis reveals that March 1976 was the deadliest month with 396 documented disappearances. The repressive apparatus reached full operational capacity within weeks of the coup, sustaining 300+ disappearances per month through October 1976. Buenos Aires province consistently accounted for 40-50% of all disappearances. Tucumán spiked early due to Operativo Independencia, which predated the coup by a year.',
      'Of the approximately 500 children born in captivity, Abuelas de Plaza de Mayo have restored the identity of approximately 140. The graph includes 135 niños apropiados with restitution data.',
    ],
    paragraphs_es: [
      'El RUVTE (Registro Unificado de Victimas del Terrorismo de Estado) documenta 9.415 victimas con registros individuales — 8.632 con denuncia formal y 783 de listados de la CONADEP sin denuncia formal. La edad mediana al momento de la desaparicion era de 26 anos. 334 mujeres embarazadas fueron detenidas o desaparecidas. 193 menores de 18 anos fueron documentados, incluyendo a los estudiantes de la Noche de los Lapices.',
      '589 nacionales extranjeros de 32 paises aparecen en el registro — no solo uruguayos, chilenos y paraguayos (esperables por el Plan Condor), sino victimas de Japon, Grecia, Rusia, Lituania, Belgica, Hungria, Finlandia y mas. La dimension internacional es mas amplia de lo comunmente documentado.',
      'El analisis temporal revela que marzo de 1976 fue el mes mas letal con 396 desapariciones documentadas. El aparato represivo alcanzo su capacidad operativa plena a pocas semanas del golpe, sosteniendo mas de 300 desapariciones por mes hasta octubre de 1976. La provincia de Buenos Aires concentro consistentemente el 40-50% de todas las desapariciones. Tucuman tuvo un pico temprano debido al Operativo Independencia, que antecedio al golpe por un ano.',
      'De los aproximadamente 500 ninos nacidos en cautiverio, Abuelas de Plaza de Mayo han restituido la identidad de aproximadamente 140. El grafo incluye 135 ninos apropiados con datos de restitucion.',
    ],
  },
  {
    num: 'III',
    title_en: 'The Detention Network',
    title_es: 'La Red de Detencion',
    paragraphs_en: [
      'The graph maps 774 clandestine detention centers with GPS coordinates from the presentes dataset. 747 have confirmed lat/lon coordinates — enough to build a complete national map. 19 have been converted to memory sites (espacios de memoria).',
      'Cross-referencing RUVTE victim detention locations against CCD names produced 2,528 DETENIDO_EN relationships — placing documented victims in specific detention centers. The largest site by this measure is not ESMA but Comisaría 26ª de Capital Federal with 1,884 linked victims, followed by Automotores Orletti (71), and a network of Buenos Aires province comisarías each processing 20-50 victims.',
      'This reveals a critical finding: the police station network was the primary initial detention apparatus, not the military CCDs that dominate the historical narrative. Police comisarías across Greater Buenos Aires processed far more documented victims than the well-known military sites.',
    ],
    paragraphs_es: [
      'El grafo mapea 774 centros clandestinos de detencion con coordenadas GPS del dataset presentes. 747 tienen coordenadas lat/lon confirmadas — suficientes para construir un mapa nacional completo. 19 han sido convertidos en espacios de memoria.',
      'El cruce de datos entre las ubicaciones de detencion de victimas del RUVTE y los nombres de CCD produjo 2.528 relaciones DETENIDO_EN — ubicando victimas documentadas en centros de detencion especificos. El sitio mas grande por esta medida no es la ESMA sino la Comisaria 26a de Capital Federal con 1.884 victimas vinculadas, seguido por Automotores Orletti (71), y una red de comisarias de la provincia de Buenos Aires procesando cada una entre 20 y 50 victimas.',
      'Esto revela un hallazgo critico: la red de comisarias policiales fue el aparato de detencion inicial primario, no los CCD militares que dominan la narrativa historica. Las comisarias de la policia del Gran Buenos Aires procesaron muchas mas victimas documentadas que los sitios militares conocidos.',
    ],
  },
  {
    num: 'IV',
    title_en: 'The Justice',
    title_es: 'La Justicia',
    paragraphs_en: [
      'The graph tracks 10 major causas (judicial proceedings), 16 federal tribunals, and 12 sentencias (verdicts). The judicial timeline spans four decades: the Trial of the Juntas (1985), the impunity laws (1986-1987), the Menem pardons (1989-1990), the constitutional annulment (2005), and the reopened megacausas (2006-present).',
      'Of 130 represors in the graph, only 24 (18.5%) have any judicial link — either ACUSADO_EN or CONDENADO_A. Only 12 have documented convictions. The conviction rate for identified SIDE agents is 0% — the intelligence service achieved near-total institutional impunity.',
      'The graph identifies a structural legal inconsistency: Junta I members (Videla, Massera, Agosti) were convicted under command responsibility doctrine, but Junta III members (Galtieri, Anaya, Lami Dozo) and Junta IV members (Nicolaides, Franco, Hughes) held identical positions and powers yet have no documented convictions in the graph for crimes against humanity. The same legal doctrine should apply.',
      '97.9% of the 9,553 documented victims have their case referenced in at least one judicial proceeding. However, 204 victims remain without any documented judicial coverage, and 2,636 victims were detained in CCDs with no link to any causa.',
    ],
    paragraphs_es: [
      'El grafo rastrea 10 causas judiciales principales, 16 tribunales federales y 12 sentencias. La linea temporal judicial abarca cuatro decadas: el Juicio a las Juntas (1985), las leyes de impunidad (1986-1987), los indultos de Menem (1989-1990), la anulacion constitucional (2005) y las megacausas reabiertas (2006-presente).',
      'De los 130 represores en el grafo, solo 24 (18,5%) tienen algun vinculo judicial — ya sea ACUSADO_EN o CONDENADO_A. Solo 12 tienen condenas documentadas. La tasa de condena para los agentes de la SIDE identificados es del 0% — el servicio de inteligencia logro una impunidad institucional casi total.',
      'El grafo identifica una inconsistencia juridica estructural: los miembros de la Junta I (Videla, Massera, Agosti) fueron condenados bajo la doctrina de responsabilidad de mando, pero los miembros de la Junta III (Galtieri, Anaya, Lami Dozo) y la Junta IV (Nicolaides, Franco, Hughes) ocuparon posiciones y poderes identicos y sin embargo no tienen condenas documentadas en el grafo por delitos de lesa humanidad. La misma doctrina juridica deberia aplicarse.',
      'El 97,9% de las 9.553 victimas documentadas tienen su caso referenciado en al menos un procedimiento judicial. Sin embargo, 204 victimas permanecen sin ninguna cobertura judicial documentada, y 2.636 victimas fueron detenidas en CCD sin vinculo con ninguna causa.',
    ],
  },
  {
    num: 'V',
    title_en: 'The International Dimension',
    title_es: 'La Dimension Internacional',
    paragraphs_en: [
      'Plan Cóndor connected the intelligence services of six South American dictatorships — Argentina, Chile, Uruguay, Paraguay, Brazil, and Bolivia — with CIA knowledge. The graph maps 28 intelligence-sharing flows between 14 agencies across 7 countries. Automotores Orletti, operated by SIDE agent Aníbal Gordon, served as the transnational hub with 71 documented cross-border victims.',
      '30 declassified US intelligence documents are mapped — cables from the CIA, FBI, State Department, DIA, and NSC spanning 1975-1983. These documents cross-reference 20 personas already in the graph, confirming US awareness of disappearances, the ESMA operations, the Night of the Pencils, and the Kissinger-Guzzetti meeting.',
      '281 Junta meeting minutes (actas) from the official government archive are linked to key decisions — including the Malvinas invasion, the strategy for the CIDH visit, and the propaganda use of the 1978 World Cup. These actas create decision-to-action chains: Junta meeting → operational decision → event.',
    ],
    paragraphs_es: [
      'El Plan Condor conecto los servicios de inteligencia de seis dictaduras sudamericanas — Argentina, Chile, Uruguay, Paraguay, Brasil y Bolivia — con conocimiento de la CIA. El grafo mapea 28 flujos de intercambio de inteligencia entre 14 agencias de 7 paises. Automotores Orletti, operado por el agente de la SIDE Anibal Gordon, sirvio como el centro transnacional con 71 victimas transfronterizas documentadas.',
      '30 documentos de inteligencia desclasificados de EE.UU. estan mapeados — cables de la CIA, FBI, Departamento de Estado, DIA y NSC abarcando 1975-1983. Estos documentos cruzan referencias con 20 personas ya existentes en el grafo, confirmando el conocimiento estadounidense de las desapariciones, las operaciones de la ESMA, la Noche de los Lapices y la reunion Kissinger-Guzzetti.',
      '281 actas de reuniones de la Junta Militar del archivo oficial del gobierno estan vinculadas a decisiones clave — incluyendo la invasion de Malvinas, la estrategia para la visita de la CIDH y el uso propagandistico del Mundial 1978. Estas actas crean cadenas de decision-a-accion: reunion de la Junta → decision operativa → evento.',
    ],
  },
  {
    num: 'VI',
    title_en: 'Corporate Complicity',
    title_es: 'La Complicidad Empresarial',
    paragraphs_en: [
      'The graph documents 7 corporations with explicit collaboration relationships linking them to CCDs and military units: Ford Motor Argentina, Mercedes-Benz Argentina, Acindar, Ledesma SAAI, Techint, Loma Negra, and Ingenio La Fronterita. These COLABORO_CON and ENTREGO_A relationships represent the direct handover of workers to the repressive apparatus.',
      'After 50 years, the corporate accountability scorecard is devastating: only Ford has produced a conviction (2018, executives Müller and Sibilla). Acindar saw all 17 defendants acquitted in November 2025. Ledesma\'s Carlos Pedro Blaquier died at 95 in 2023 without ever being tried — "biological impunity." Techint has never been charged despite having the highest documented count of disappeared workers. La Fronterita\'s trial was suspended hours before it was to begin in 2026.',
      'The pattern across all corporate cases is consistent: judicial delays, biological impunity through defendants dying before trial, narrow framing of charges, and institutional reluctance to hold economic actors accountable for their role in state terrorism.',
    ],
    paragraphs_es: [
      'El grafo documenta 7 corporaciones con relaciones explicitas de colaboracion vinculandolas a CCD y unidades militares: Ford Motor Argentina, Mercedes-Benz Argentina, Acindar, Ledesma SAAI, Techint, Loma Negra e Ingenio La Fronterita. Las relaciones COLABORO_CON y ENTREGO_A representan la entrega directa de trabajadores al aparato represivo.',
      'Despues de 50 anos, el balance de rendicion de cuentas corporativa es devastador: solo Ford ha producido una condena (2018, ejecutivos Muller y Sibilla). Acindar vio a sus 17 imputados absueltos en noviembre de 2025. Carlos Pedro Blaquier de Ledesma murio a los 95 en 2023 sin haber sido juzgado — "impunidad biologica." Techint jamas fue imputada a pesar de tener el mayor numero documentado de trabajadores desaparecidos. El juicio de La Fronterita fue suspendido horas antes de comenzar en 2026.',
      'El patron en todos los casos corporativos es consistente: demoras judiciales, impunidad biologica por muerte de imputados antes del juicio, encuadre restrictivo de cargos y renuencia institucional a responsabilizar a los actores economicos por su rol en el terrorismo de Estado.',
    ],
  },
  {
    num: 'VII',
    title_en: 'The Intelligence Service',
    title_es: 'El Servicio de Inteligencia',
    paragraphs_en: [
      'On March 24, 2026 — the 50th anniversary of the coup — the Argentine government declassified 987 pages of internal SIDE documents spanning 1973-1983. This investigation ingested the entire corpus through a pre-processed knowledge graph containing 3,752 entities and 4,056 relationships.',
      'The documents reveal the SIDE\'s complete organizational structure: Subsecretaría A (Interior Intelligence), Subsecretaría B (Foreign Intelligence), Subsecretaría C (Logistics/Support), and the CNI (Central Nacional de Inteligencia). 881 departments are mapped. The declassified documents also reveal the SIDE\'s ideological classification system, its surveillance of human rights organizations, and its secret psychological operations directives.',
      'Of the 10 SIDE leadership officials identified by name and rank in the declassified documents, only 1 was ever convicted: Colonel Carlos Alberto Tepedino (25 years for the ABO circuit + 20 years for Campo de Mayo, died in prison 2011). Vicealmirante Aldo Alberto Peyronel died in 2003 — two years before the amnesty laws were struck down. General Otto Carlos Paladino, who commanded SIDE during the Automotores Orletti operations, died before the Orletti trial could conclude. The remaining 7 officials have no prosecution record.',
    ],
    paragraphs_es: [
      'El 24 de marzo de 2026 — 50 aniversario del golpe — el gobierno argentino desclasificó 987 paginas de documentos internos de la SIDE del periodo 1973-1983. Esta investigacion ingirio el corpus completo a traves de un grafo de conocimiento preprocesado conteniendo 3.752 entidades y 4.056 relaciones.',
      'Los documentos revelan la estructura organizativa completa de la SIDE: Subsecretaria A (Inteligencia Interior), Subsecretaria B (Inteligencia Exterior), Subsecretaria C (Apoyo Logistico) y la CNI (Central Nacional de Inteligencia). 881 departamentos estan mapeados. Los documentos desclasificados tambien revelan el sistema de clasificacion ideologica de la SIDE, su vigilancia de organizaciones de derechos humanos y sus directivas secretas de operaciones psicologicas.',
      'De los 10 funcionarios de la SIDE identificados por nombre y rango en los documentos desclasificados, solo 1 fue condenado: el Coronel Carlos Alberto Tepedino (25 anos por el circuito ABO + 20 anos por Campo de Mayo, murio en prision en 2011). El Vicealmirante Aldo Alberto Peyronel murio en 2003 — dos anos antes de que las leyes de amnistia fueran anuladas. El General Otto Carlos Paladino, que comando la SIDE durante las operaciones de Automotores Orletti, murio antes de que el juicio de Orletti pudiera concluir. Los 7 funcionarios restantes no tienen registro de procesamiento.',
    ],
  },
  {
    num: 'VIII',
    title_en: 'The Accountability Gap',
    title_es: 'La Brecha de Rendicion de Cuentas',
    paragraphs_en: [
      'This investigation flags 54 accountability gaps in the Neo4j graph: 27 high-victim CCDs with no judicial proceedings, 16 SIDE officials with zero judicial links, 8 represors with documented evidence but no prosecution, and 6 Junta III/IV members with a command responsibility gap.',
      'The single largest accountability void is Comisaría 26ª de Capital Federal: 1,884 documented victims, zero identified perpetrators, zero judicial link. This police station processed more victims than any other site in the graph — more than ESMA, Campo de Mayo, and Automotores Orletti combined. Yet no commander, no officer, no guard has been named.',
      'The three structural patterns of impunity are: (1) The police blind spot — police comisarías operated as the primary detention apparatus but their command chains were never mapped into judicial proceedings. (2) The SIDE shield — the intelligence service as an institution achieved near-total impunity; only 1 of 98 agents was ever convicted. (3) Corporate biological impunity — judicial delays until defendants die, trials suspended on medical grounds, or full acquittals.',
    ],
    paragraphs_es: [
      'Esta investigacion senala 54 brechas de rendicion de cuentas en el grafo Neo4j: 27 CCD con muchas victimas sin procedimientos judiciales, 16 funcionarios de la SIDE sin vinculos judiciales, 8 represores con evidencia documentada pero sin procesamiento, y 6 miembros de las Juntas III/IV con una brecha de responsabilidad de mando.',
      'El vacio de rendicion de cuentas mas grande es la Comisaria 26a de Capital Federal: 1.884 victimas documentadas, cero perpetradores identificados, cero vinculo judicial. Esta comisaria proceso mas victimas que cualquier otro sitio en el grafo — mas que la ESMA, Campo de Mayo y Automotores Orletti combinados. Sin embargo, ningun comisario, ningun oficial, ningun guardia ha sido nombrado.',
      'Los tres patrones estructurales de impunidad son: (1) El punto ciego policial — las comisarias operaron como el aparato de detencion inicial primario pero sus cadenas de mando nunca fueron mapeadas en procedimientos judiciales. (2) El escudo de la SIDE — el servicio de inteligencia como institucion logro impunidad casi total; solo 1 de 98 agentes fue condenado. (3) Impunidad biologica corporativa — demoras judiciales hasta que los imputados mueren, juicios suspendidos por razones medicas o absoluciones totales.',
    ],
  },
  {
    num: 'IX',
    title_en: 'Methodology',
    title_es: 'Metodologia',
    paragraphs_en: [
      'This investigation was conducted through 25 automated ingestion waves using the Office of Accountability\'s investigation loop: ingest → verify → deduplicate → analyze (LLM) → promote → update → commit. Each wave builds on findings from the previous wave.',
      'Data sources: (1) RUVTE government victim registry from datos.jus.gob.ar — 9,415 records. (2) presentes R package CCD dataset with 762 GPS-located detention centers. (3) Judicial records from SNEEP census and causas penales. (4) Declassified US intelligence from desclasificados.org.ar — CIA, FBI, State Department cables. (5) Plan Cóndor victim database from plancondor.org. (6) Abuelas de Plaza de Mayo nietos restituidos data. (7) Junta meeting minutes from datos.gob.ar. (8) Nunca Más testimonies and Memoria Abierta archives. (9) PCCH Dossier de Sentencias. (10) Wikidata SPARQL cross-reference. (11) Military archives from Archivos Defensa. (12) Declassified SIDE documents from ManuelR-D/datos-desclasificados-prn (987 pages, released 2026-03-24).',
      'Confidence tiers: Gold (164 nodes) = manually curated seed data from established historical sources. Silver (10,564 nodes) = government-sourced or multi-source confirmed. Bronze (3,550 nodes) = single-source, unverified. 88.4% of nodes are verified (gold + silver).',
      'Entity resolution merged 86 duplicate entries across datasets. Fuzzy name matching (Levenshtein, token overlap, province matching) produced 2,528 victim-to-CCD links. LLM analysis (Qwen 3.5 9B on local GPU) provided network analysis, temporal pattern detection, and accountability gap identification. Web verification confirmed prosecution status for SIDE officials and corporate defendants.',
      'Quality score: 77.9% (weighted: 60% tier quality + 40% connectivity). Average 5.02 relationships per node. 40 distinct relationship types across 14 node types.',
    ],
    paragraphs_es: [
      'Esta investigacion fue conducida a traves de 25 olas automatizadas de ingestion usando el bucle de investigacion de la Oficina de Rendicion de Cuentas: ingerir → verificar → deduplicar → analizar (LLM) → promover → actualizar → commit. Cada ola construye sobre los hallazgos de la ola anterior.',
      'Fuentes de datos: (1) RUVTE registro gubernamental de victimas de datos.jus.gob.ar — 9.415 registros. (2) Dataset de CCD del paquete R presentes con 762 centros de detencion geolocalizados. (3) Registros judiciales del censo SNEEP y causas penales. (4) Inteligencia desclasificada de EE.UU. de desclasificados.org.ar — cables de CIA, FBI, Departamento de Estado. (5) Base de datos de victimas del Plan Condor de plancondor.org. (6) Datos de nietos restituidos de Abuelas de Plaza de Mayo. (7) Actas de la Junta Militar de datos.gob.ar. (8) Testimonios del Nunca Mas y archivos de Memoria Abierta. (9) Dossier de Sentencias del PCCH. (10) Cruce de referencia SPARQL de Wikidata. (11) Archivos militares de Archivos Defensa. (12) Documentos desclasificados de la SIDE de ManuelR-D/datos-desclasificados-prn (987 paginas, liberados 2026-03-24).',
      'Niveles de confianza: Oro (164 nodos) = datos semilla curados manualmente de fuentes historicas establecidas. Plata (10.564 nodos) = fuentes gubernamentales o confirmados por multiples fuentes. Bronce (3.550 nodos) = fuente unica, sin verificar. El 88,4% de los nodos estan verificados (oro + plata).',
      'La resolucion de entidades fusiono 86 entradas duplicadas entre datasets. El matching difuso de nombres (Levenshtein, solapamiento de tokens, matching por provincia) produjo 2.528 vinculos victima-a-CCD. El analisis con LLM (Qwen 3.5 9B en GPU local) proporciono analisis de redes, deteccion de patrones temporales e identificacion de brechas de rendicion de cuentas. La verificacion web confirmo el estado de procesamiento de funcionarios de la SIDE e imputados corporativos.',
      'Puntaje de calidad: 77,9% (ponderado: 60% calidad de tier + 40% conectividad). Promedio de 5,02 relaciones por nodo. 40 tipos de relacion distintos a traves de 14 tipos de nodos.',
    ],
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResumenPage() {
  const { lang } = useLanguage()

  return (
    <article className="space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          {t.headerBadge[lang]}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          {t.headerTitle[lang]}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400">
          {t.headerDesc[lang]}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`/caso/${SLUG}/investigacion`}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
          >
            {t.viewData[lang]}
          </Link>
          <Link
            href={`/caso/${SLUG}/cronologia`}
            className="rounded border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500"
          >
            {t.timeline[lang]}
          </Link>
        </div>
      </header>

      {/* Chapters */}
      {CHAPTERS.map((ch) => (
        <section
          key={ch.num}
          id={`chapter-${ch.num.toLowerCase()}`}
          className="scroll-mt-24 space-y-4 border-t border-zinc-800 pt-8"
        >
          <h2 className="text-xl font-semibold text-zinc-100">
            <span className="mr-2 text-amber-500">{ch.num}.</span>
            {lang === 'es' ? ch.title_es : ch.title_en}
          </h2>
          {(lang === 'es' ? ch.paragraphs_es : ch.paragraphs_en).map((p, i) => (
            <p key={i} className="max-w-3xl leading-relaxed text-zinc-400">
              {p}
            </p>
          ))}
        </section>
      ))}

      {/* Sources */}
      <section className="space-y-3 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-semibold text-zinc-100">{t.sources[lang]}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-500">
          <li>RUVTE — Registro Unificado de Victimas del Terrorismo de Estado (datos.jus.gob.ar)</li>
          <li>presentes — R package, DiegoKoz/presentes (762 CCDs, coordinates)</li>
          <li>SNEEP — Sistema Nacional de Estadisticas sobre Ejecucion de la Pena (datos.jus.gob.ar)</li>
          <li>desclasificados.org.ar — 3,200+ declassified US intelligence documents</li>
          <li>plancondor.org — Plan Condor victims database (805 victims)</li>
          <li>Abuelas de Plaza de Mayo — nietos restituidos registry</li>
          <li>datos.gob.ar — Actas Junta Militar, Archivos Defensa</li>
          <li>desaparecidos.org — Nunca Mas full text</li>
          <li>PCCH — Procuraduria de Crimenes contra la Humanidad, dossier de sentencias</li>
          <li>Wikidata — Argentine enforced disappearance SPARQL query</li>
          <li>ManuelR-D/datos-desclasificados-prn — 987 pages SIDE documents (2026-03-24)</li>
          <li>CONADEP — Informe Nunca Mas (1984)</li>
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="text-xs leading-relaxed text-zinc-500">
          {t.disclaimer[lang]}
        </p>
      </section>

      {/* Navigation */}
      <nav className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <Link
          href={`/caso/${SLUG}`}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          {t.navOverview[lang]}
        </Link>
        <Link
          href={`/caso/${SLUG}/investigacion`}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          {t.navData[lang]}
        </Link>
      </nav>
    </article>
  )
}
