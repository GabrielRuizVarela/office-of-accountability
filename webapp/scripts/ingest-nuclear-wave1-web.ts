#!/usr/bin/env npx tsx
/**
 * Wave 1: Web-enriched nuclear risk signals.
 * Ingests verified signals from web search into Neo4j.
 */
import 'dotenv/config'
import { getDriver } from '../src/lib/neo4j/client'
import { createHash } from 'node:crypto'

const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 16)

const signals = [
  // ── US-Russia Theater ──
  {
    id: `web-new-start-expired-${hash('new-start-expired-2026-02-05')}`,
    date: '2026-02-05',
    title_en: 'New START treaty expires — first time since 1970s with no US-Russia nuclear arms limits',
    title_es: 'Expira el tratado New START — primera vez desde los 1970s sin limites de armas nucleares EE.UU.-Rusia',
    summary_en: 'The New START treaty officially expired on February 5, 2026, ending the last remaining nuclear arms control agreement between Russia and the United States. No successor agreement is under negotiation.',
    summary_es: 'El tratado New START expiro oficialmente el 5 de febrero de 2026, poniendo fin al ultimo acuerdo de control de armas nucleares entre Rusia y Estados Unidos.',
    source_url: 'https://www.chathamhouse.org/2026/01/us-and-russias-nuclear-weapons-treaty-set-expire-heres-whats-stake',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.95,
    ingestion_hash: hash('new-start-expired'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-russia-abide-limits-${hash('russia-abide-limits-2026')}`,
    date: '2026-02-11',
    title_en: 'Russia says it will stick to New START limits if US does',
    title_es: 'Rusia dice que respetara los limites del New START si EE.UU. lo hace',
    summary_en: 'Russian officials stated Russia would continue to abide by New START central limits as long as the United States did so, despite the treaty having expired.',
    summary_es: '',
    source_url: 'https://www.aljazeera.com/news/2026/2/11/russia-says-it-will-stick-to-limits-of-expired-nuclear-treaty-if-us',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.85,
    ingestion_hash: hash('russia-abide'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-trump-new-treaty-${hash('trump-new-treaty-2026')}`,
    date: '2026-02-05',
    title_en: 'Trump calls for new modernized nuclear treaty to replace New START, pushes China inclusion',
    title_es: 'Trump pide un nuevo tratado nuclear modernizado para reemplazar New START, presiona por inclusion de China',
    summary_en: 'President Trump posted that rather than extend New START, the US should negotiate a new, improved treaty. Washington pushing for China inclusion in talks, but Beijing refuses.',
    summary_es: '',
    source_url: 'https://www.cfr.org/articles/nukes-without-limits-a-new-era-after-the-end-of-new-start',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.8,
    ingestion_hash: hash('trump-new-treaty'), submitted_by: 'etl:web-enrichment',
  },

  // ── Middle East Theater ──
  {
    id: `web-us-israel-iran-strikes-${hash('iran-strikes-natanz-2026')}`,
    date: '2026-02-01',
    title_en: 'US and Israel launch large-scale strikes against Iran targeting nuclear and missile programs',
    title_es: 'EE.UU. e Israel lanzan ataques a gran escala contra Iran dirigidos a programas nucleares y de misiles',
    summary_en: 'Following the largest US military buildup in the Middle East since 2003, Israel and the US launched strikes against Iran. Iranian nuclear and missile programs were one justification.',
    summary_es: '',
    source_url: 'https://www.iaea.org/sites/default/files/gov2026-8.pdf',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.95,
    ingestion_hash: hash('iran-strikes'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-natanz-inaccessible-${hash('natanz-inaccessible-2026')}`,
    date: '2026-03-03',
    title_en: 'IAEA confirms Natanz nuclear facility entrance destroyed, facility inaccessible',
    title_es: 'OIEA confirma que la entrada de la instalacion nuclear de Natanz fue destruida, instalacion inaccesible',
    summary_en: 'IAEA confirmed that while bombings failed to destroy Natanz, damage to entrance buildings made it inaccessible. IAEA has no access to any of Iran\'s four declared enrichment facilities.',
    summary_es: '',
    source_url: 'https://www.iaea.org/newscenter/statements/iaea-director-generals-introductory-statement-to-the-board-of-governors-2-6-march-2026',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.95,
    ingestion_hash: hash('natanz-inaccessible'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-us-bunker-busters-natanz-${hash('natanz-bunker-busters-2026')}`,
    date: '2026-03-21',
    title_en: 'US carries out second round of strikes at Natanz using bunker buster bombs',
    title_es: 'EE.UU. realiza segunda ronda de ataques en Natanz con bombas antibunker',
    summary_en: 'The United States carried out strikes again at Natanz on March 21, using bunker buster bombs against the underground enrichment facility.',
    summary_es: '',
    source_url: 'https://en.wikipedia.org/wiki/Nuclear_program_of_Iran',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.85,
    ingestion_hash: hash('natanz-bunker-busters'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-iran-heu-stockpile-${hash('iran-heu-440kg')}`,
    date: '2025-09-01',
    title_en: 'IAEA reports Iran had 440.9 kg of uranium enriched up to 60% before strikes',
    title_es: 'OIEA informa que Iran tenia 440.9 kg de uranio enriquecido al 60% antes de los ataques',
    summary_en: 'IAEA calculated that on the eve of June 2025 attacks, Iran possessed 440.9 kg of uranium enriched up to 60% U-235 — near weapons-grade threshold.',
    summary_es: '',
    source_url: 'https://armscontrolcenter.org/irans-stockpile-of-highly-enriched-uranium-worth-bargaining-for/',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.95,
    ingestion_hash: hash('iran-heu-stockpile'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-us-iran-negotiations-${hash('us-iran-talks-2026-02')}`,
    date: '2026-02-26',
    title_en: 'US-Iran nuclear negotiations underway with IAEA DG providing verification advice',
    title_es: 'Negociaciones nucleares EE.UU.-Iran en curso con el DG del OIEA asesorando sobre verificacion',
    summary_en: 'IAEA Director General attended negotiations between US and Iran, providing advice on verification of Iran\'s nuclear programme.',
    summary_es: '',
    source_url: 'https://www.iaea.org/newscenter/statements/iaea-director-generals-introductory-statement-to-the-board-of-governors-2-6-march-2026',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.9,
    ingestion_hash: hash('us-iran-talks'), submitted_by: 'etl:web-enrichment',
  },

  // ── Korean Peninsula Theater ──
  {
    id: `web-dprk-hypersonic-jan-${hash('dprk-hypersonic-jan-2026')}`,
    date: '2026-01-04',
    title_en: 'North Korea launches hypersonic missiles into Sea of Japan — first test of 2026',
    title_es: 'Corea del Norte lanza misiles hipersonicos al Mar de Japon — primera prueba de 2026',
    summary_en: 'North Korea launched hypersonic missiles hitting targets 1000km away in the Sea of Japan. Kim Jong Un oversaw the launches. First missile test of 2026.',
    summary_es: '',
    source_url: 'https://news.usni.org/2026/01/05/north-korea-conducts-first-missile-launch-of-2026-into-sea-of-japan',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.95,
    ingestion_hash: hash('dprk-hypersonic-jan'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-dprk-ballistic-jan27-${hash('dprk-ballistic-jan27')}`,
    date: '2026-01-27',
    title_en: 'North Korea fires suspected ballistic missiles — second launch of January 2026',
    title_es: 'Corea del Norte dispara presuntos misiles balisticos — segundo lanzamiento de enero 2026',
    summary_en: 'North Korea launched suspected ballistic missiles into the sea before a major political congress, marking the second missile test of 2026.',
    summary_es: '',
    source_url: 'https://www.aljazeera.com/news/2026/1/27/north-korea-fires-suspected-ballistic-missiles-into-sea-s-korea-japan-say',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.85,
    ingestion_hash: hash('dprk-ballistic-jan27'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-dprk-cruise-destroyer-${hash('dprk-cruise-destroyer')}`,
    date: '2026-03-04',
    title_en: 'North Korean destroyer test fires strategic cruise missile',
    title_es: 'Destructor norcoreano prueba misil crucero estrategico',
    summary_en: 'North Korean destroyer Choe Hyon successfully test fired a sea-to-surface strategic cruise missile. Kim called for two destroyers to be built annually.',
    summary_es: '',
    source_url: 'https://news.usni.org/2026/03/06/north-korean-destroyer-tests-strategic-cruise-missile',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.85,
    ingestion_hash: hash('dprk-cruise-destroyer'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-dprk-10-missiles-${hash('dprk-10-missiles-march')}`,
    date: '2026-03-16',
    title_en: 'North Korea fires 10 missiles from nuclear-capable rocket launchers into Sea of Japan',
    title_es: 'Corea del Norte dispara 10 misiles desde lanzadores nucleares al Mar de Japon',
    summary_en: 'North Korea test fired 10 ballistic missiles from upgraded MLRS, hitting island target 360km away. Third ballistic missile launch of 2026.',
    summary_es: '',
    source_url: 'https://news.usni.org/2026/03/16/north-korea-fires-10-missiles-over-sea-of-japan-in-latest-multiple-rocket-launcher-system-test',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.95,
    ingestion_hash: hash('dprk-10-missiles'), submitted_by: 'etl:web-enrichment',
  },

  // ── Indo-Pacific / China Theater ──
  {
    id: `web-china-600-warheads-${hash('china-600-warheads-2026')}`,
    date: '2026-01-15',
    title_en: 'China nuclear arsenal exceeds 600 warheads, tripled in 5 years, on track for 1000 by 2030',
    title_es: 'Arsenal nuclear de China supera las 600 ojivas, triplicado en 5 anos, rumbo a 1000 para 2030',
    summary_en: 'China\'s stockpile climbed from 410 warheads in 2023 to over 600 in 2025. PLA expected to field 1500 warheads. China building full nuclear triad.',
    summary_es: '',
    source_url: 'https://www.csmonitor.com/World/Asia-Pacific/2026/0303/As-US-and-Russia-unbind-from-nuclear-treaty-China-s-arsenal-has-been-growing',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.85,
    ingestion_hash: hash('china-600-warheads'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-china-covert-test-${hash('china-covert-nuclear-test')}`,
    date: '2026-02-21',
    title_en: 'US intelligence: China conducted covert nuclear explosive test, developing entirely new arsenal',
    title_es: 'Inteligencia EE.UU.: China realizo prueba nuclear encubierta, desarrolla arsenal completamente nuevo',
    summary_en: 'US intelligence believes China conducted at least one covert explosive test and is developing new generation nuclear weapons including low-yield tactical nukes for the first time.',
    summary_es: '',
    source_url: 'https://www.cnn.com/2026/02/21/politics/china-nuclear-arsenal-new-technology',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.75,
    ingestion_hash: hash('china-covert-test'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-china-storage-vuln-${hash('china-storage-vuln')}`,
    date: '2026-03-11',
    title_en: 'Vulnerabilities revealed in China\'s nuclear warhead storage and transportation system',
    title_es: 'Se revelan vulnerabilidades en el sistema de almacenamiento y transporte de ojivas nucleares de China',
    summary_en: 'Report reveals vulnerabilities in China\'s nuclear warhead storage and transportation infrastructure, raising concerns about safety of rapidly expanding arsenal.',
    summary_es: '',
    source_url: 'https://www.washingtontimes.com/news/2026/mar/11/inside-ring-vulnerabilities-revealed-chinas-nuclear-warhead-storage/',
    source_module: 'web-enrichment', tier: 'bronze', confidence_score: 0.6,
    ingestion_hash: hash('china-storage-vuln'), submitted_by: 'etl:web-enrichment',
  },

  // ── Europe Theater ──
  {
    id: `web-macron-nuclear-${hash('macron-nuclear-eu')}`,
    date: '2026-03-05',
    title_en: 'Macron announces advanced nuclear deterrence era, 8 European nations join cooperation dialogue',
    title_es: 'Macron anuncia era de disuasion nuclear avanzada, 8 naciones europeas se unen al dialogo de cooperacion',
    summary_en: 'France enters advanced nuclear deterrence period. Macron plans to increase warhead stockpile. UK, Germany, Poland, Netherlands, Belgium, Greece, Sweden, Denmark join dialogue.',
    summary_es: '',
    source_url: 'https://www.nato.int/en/news-and-events/articles/news/2026/02/27/nato-high-level-group-meets-in-brussels-on-natos-nuclear-deterrence',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.8,
    ingestion_hash: hash('macron-nuclear-eu'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-nato-hlg-${hash('nato-hlg-feb-2026')}`,
    date: '2026-02-25',
    title_en: 'NATO High Level Group meets to discuss nuclear deterrence in post-New START era',
    title_es: 'Grupo de Alto Nivel de la OTAN se reune para discutir disuasion nuclear en era post-New START',
    summary_en: 'NATO\'s senior nuclear advisory board met in Brussels to discuss nuclear capabilities for preserving peace, preventing coercion, and deterring aggression.',
    summary_es: '',
    source_url: 'https://www.nato.int/en/news-and-events/articles/news/2026/02/27/nato-high-level-group-meets-in-brussels-on-natos-nuclear-deterrence',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.9,
    ingestion_hash: hash('nato-hlg'), submitted_by: 'etl:web-enrichment',
  },

  // ── South Asia Theater ──
  {
    id: `web-india-pakistan-conflict-${hash('india-pakistan-conflict-2025')}`,
    date: '2025-05-15',
    title_en: 'India-Pakistan armed conflict with nuclear brinkmanship — first-ever drone and missile use',
    title_es: 'Conflicto armado India-Pakistan con riesgo nuclear — primer uso de drones y misiles',
    summary_en: 'Conflict between India and Pakistan broke out following cross-border terrorism. Conventional operations involved first-ever use of drones and missiles accompanied by nuclear brinkmanship.',
    summary_es: '',
    source_url: 'https://thebulletin.org/doomsday-clock/2026-statement/nuclear-risk/',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.9,
    ingestion_hash: hash('india-pak-conflict'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-gabbard-pakistan-${hash('gabbard-pakistan-threat')}`,
    date: '2026-03-19',
    title_en: 'US DNI Gabbard says Pakistan missiles a future threat to US — experts push back',
    title_es: 'Directora de Inteligencia de EE.UU. Gabbard dice que misiles de Pakistan son amenaza futura — expertos discrepan',
    summary_en: 'US Director of National Intelligence characterized Pakistan missiles as future threat to the US, though experts dispute this assessment.',
    summary_es: '',
    source_url: 'https://www.aljazeera.com/news/2026/3/19/gabbard-says-pakistan-missiles-a-future-threat-to-us-but-experts-push-back',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.8,
    ingestion_hash: hash('gabbard-pakistan'), submitted_by: 'etl:web-enrichment',
  },

  // ── Global ──
  {
    id: `web-doomsday-clock-2026-${hash('doomsday-clock-2026')}`,
    date: '2026-01-28',
    title_en: '2026 Doomsday Clock: Three simultaneous nuclear conflicts — Ukraine, Iran, India-Pakistan',
    title_es: 'Reloj del Juicio Final 2026: Tres conflictos nucleares simultaneos — Ucrania, Iran, India-Pakistan',
    summary_en: 'Bulletin of the Atomic Scientists identifies military operations in three theatres under shadow of nuclear weapons with risk of nuclear use in each.',
    summary_es: '',
    source_url: 'https://thebulletin.org/doomsday-clock/2026-statement/nuclear-risk/',
    source_module: 'web-enrichment', tier: 'gold', confidence_score: 0.95,
    ingestion_hash: hash('doomsday-clock-2026'), submitted_by: 'etl:web-enrichment',
  },
  {
    id: `web-proliferation-risk-${hash('proliferation-risk-2026')}`,
    date: '2026-01-10',
    title_en: 'Growing risk of nuclear proliferation in 2026 — Iran may accelerate weapons development',
    title_es: 'Creciente riesgo de proliferacion nuclear en 2026 — Iran podria acelerar desarrollo de armas',
    summary_en: 'Analysts believe Iran may accelerate nuclear weapons development if current leadership remains. Iran possesses significant quantities of highly enriched uranium.',
    summary_es: '',
    source_url: 'https://www.justsecurity.org/129480/risk-nuclear-proliferation-2026/',
    source_module: 'web-enrichment', tier: 'silver', confidence_score: 0.8,
    ingestion_hash: hash('proliferation-risk'), submitted_by: 'etl:web-enrichment',
  },
]

async function main() {
  const driver = getDriver()
  const session = driver.session()

  const result = await session.executeWrite((tx) =>
    tx.run(
      `UNWIND $signals AS s
       MERGE (n:NuclearSignal {id: s.id})
       SET n.date = s.date, n.title_en = s.title_en, n.title_es = s.title_es,
           n.summary_en = s.summary_en, n.summary_es = s.summary_es,
           n.source_url = s.source_url, n.source_module = s.source_module,
           n.tier = s.tier, n.confidence_score = s.confidence_score,
           n.ingestion_hash = s.ingestion_hash, n.submitted_by = s.submitted_by,
           n.created_at = datetime(), n.updated_at = datetime()
       RETURN count(n) AS count`,
      { signals },
    ),
  )

  console.log('Wave 1: Loaded', result.records[0].get('count').toNumber(), 'web-enriched signals')
  await session.close()
  await driver.close()
}

main()
