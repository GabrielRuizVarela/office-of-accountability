'use client'

import { useLanguage, type Lang } from '@/lib/language-context'
import { Masthead } from '@/components/landing/Masthead'
import { NarrativeIntro } from '@/components/landing/NarrativeIntro'
import { Chapter } from '@/components/landing/Chapter'
import { Transition } from '@/components/landing/Transition'
import { WhatsNext } from '@/components/landing/WhatsNext'
import { CallToAction } from '@/components/landing/CallToAction'

const B = 'font-semibold text-zinc-200'

const t = (es: string, en: string) => ({ es, en })

const CHAPTERS: {
  number: string
  label: Record<Lang, string>
  color: string
  title: string
  links: { href: string; label: Record<Lang, string>; color: string }[]
  wip?: boolean
  content: Record<Lang, { text: string; bold?: boolean }[]>
}[] = [
  {
    number: 'I',
    label: t('La primera prueba', 'The first test'),
    color: 'purple',
    title: 'Caso Libra: La Memecoin del Presidente',
    links: [{ href: '/caso/caso-libra', label: t('Ver investigación →', 'View investigation →'), color: 'purple' }],
    content: {
      es: [
        { text: 'Milei promovió ' },
        { text: '$LIBRA', bold: true },
        { text: ' a 19 millones de seguidores. El precio colapsó 94% en horas. El motor procesó transacciones blockchain, documentos parlamentarios y redes sociales. ' },
        { text: '$251M+', bold: true },
        { text: ' en pérdidas, ' },
        { text: '114K', bold: true },
        { text: ' billeteras afectadas.' },
      ],
      en: [
        { text: 'Milei promoted ' },
        { text: '$LIBRA', bold: true },
        { text: ' to 19 million followers. The price collapsed 94% in hours. The engine processed blockchain transactions, parliamentary documents, and social media. ' },
        { text: '$251M+', bold: true },
        { text: ' in losses, ' },
        { text: '114K', bold: true },
        { text: ' wallets affected.' },
      ],
    },
  },
  {
    number: 'II',
    label: t('Prueba de escala', 'Scale test'),
    color: 'red',
    title: 'Caso Epstein: Red de tráfico y poder',
    links: [{ href: '/caso/caso-epstein', label: t('Ver investigación →', 'View investigation →'), color: 'red' }],
    content: {
      es: [
        { text: '7,276', bold: true },
        { text: ' entidades, ' },
        { text: '374', bold: true },
        { text: ' actores verificados, ' },
        { text: '1,044', bold: true },
        { text: ' documentos judiciales. Décadas de historia consolidadas en un solo grafo. Registros de vuelo, documentos judiciales, testimonios, flujos financieros — todo conectado.' },
      ],
      en: [
        { text: '7,276', bold: true },
        { text: ' entities, ' },
        { text: '374', bold: true },
        { text: ' verified actors, ' },
        { text: '1,044', bold: true },
        { text: ' court documents. Decades of history consolidated into a single graph. Flight records, court filings, testimonies, financial flows — all connected.' },
      ],
    },
  },
  {
    number: 'III',
    label: t('El descubrimiento', 'The discovery'),
    color: 'emerald',
    title: 'Finanzas Políticas Argentinas',
    links: [{ href: '/caso/finanzas-politicas', label: t('Ver investigación →', 'View investigation →'), color: 'emerald' }],
    content: {
      es: [
        { text: 'Empezamos con los datasets de Como Voto. Expandimos a declaraciones juradas, sociedades offshore, financiamiento de campañas. La investigación mapeó las conexiones entre ' },
        { text: 'políticos y dinero', bold: true },
        { text: '. ' },
        { text: '329', bold: true },
        { text: ' legisladores, ' },
        { text: '7', bold: true },
        { text: ' fuentes de datos cruzadas.' },
      ],
      en: [
        { text: 'We started with the Como Voto datasets. Expanded to asset declarations, offshore companies, campaign financing. The investigation mapped the connections between ' },
        { text: 'politicians and money', bold: true },
        { text: '. ' },
        { text: '329', bold: true },
        { text: ' legislators, ' },
        { text: '7', bold: true },
        { text: ' cross-referenced data sources.' },
      ],
    },
  },
  {
    number: 'IV',
    label: t('Datos abiertos', 'Open data'),
    color: 'sky',
    title: 'Obras Públicas, Monopolios y Caso Adorni',
    links: [
      { href: '/caso/obras-publicas', label: t('Obras Públicas →', 'Public Works →'), color: 'sky' },
      { href: '/caso/monopolios', label: t('Monopolios →', 'Monopolies →'), color: 'amber' },
      { href: '/caso/adorni', label: t('Caso Adorni →', 'Adorni Case →'), color: 'rose' },
    ],
    content: {
      es: [
        { text: '87,725', bold: true },
        { text: ' contratos de obra pública cruzados contra casos de soborno internacionales. ' },
        { text: '18 sectores', bold: true },
        { text: ' de la economía analizados por concentración de mercado. En marzo de 2026, el motor detectó algo: una licitación de ' },
        { text: '$3,650M', bold: true },
        { text: ' adjudicada por el Jefe de Gabinete a ATX S.A. — una empresa que ya estaba en la base con ' },
        { text: '11', bold: true },
        { text: ' cruces con investigaciones previas.' },
      ],
      en: [
        { text: '87,725', bold: true },
        { text: ' public works contracts cross-referenced against international bribery cases. ' },
        { text: '18 sectors', bold: true },
        { text: ' of the economy analyzed for market concentration. In March 2026, the engine flagged something: a ' },
        { text: '$3,650M', bold: true },
        { text: ' tender awarded by the Chief of Cabinet to ATX S.A. — a company already in the database with ' },
        { text: '11', bold: true },
        { text: ' cross-references to prior investigations.' },
      ],
    },
  },
  {
    number: 'V',
    label: t('24 de Marzo 2026', 'March 24, 2026'),
    color: 'stone',
    title: 'Caso Dictadura: 1976–1983',
    links: [{ href: '/caso/caso-dictadura', label: t('Ver investigación →', 'View investigation →'), color: 'stone' }],
    content: {
      es: [
        { text: 'Dictadura militar argentina. Múltiples pipelines de ingesta consolidados en un grafo unificado. ' },
        { text: '9,415', bold: true },
        { text: ' víctimas documentadas, ' },
        { text: '774', bold: true },
        { text: ' centros clandestinos de detención, ' },
        { text: '14,512', bold: true },
        { text: ' nodos. El 81,5% de los represores documentados no tiene vínculo judicial. Impunidad biológica: mueren antes de ser juzgados.' },
      ],
      en: [
        { text: 'Argentine military dictatorship. Multiple ingestion pipelines consolidated into a unified graph. ' },
        { text: '9,415', bold: true },
        { text: ' documented victims, ' },
        { text: '774', bold: true },
        { text: ' clandestine detention centers, ' },
        { text: '14,512', bold: true },
        { text: ' nodes. 81.5% of documented represors have no judicial link. Biological impunity: they die before facing trial.' },
      ],
    },
  },
  {
    number: 'VI',
    label: t('En desarrollo', 'In development'),
    color: 'yellow',
    title: 'Global Nuclear Risk',
    links: [{ href: '/caso/riesgo-nuclear', label: t('Ver progreso →', 'View progress →'), color: 'yellow' }],
    wip: true,
    content: {
      es: [
        { text: 'Monitoreo diario de señales de escalada nuclear: desarrollos militares, declaraciones oficiales, tratados, pruebas de misiles y datos OSINT. ' },
        { text: '31', bold: true },
        { text: ' fuentes, ' },
        { text: '9', bold: true },
        { text: ' estados nucleares monitoreados. Pipeline de ingesta y evaluación de riesgo en construcción.' },
      ],
      en: [
        { text: 'Daily monitoring of nuclear escalation signals: military developments, official statements, treaties, missile tests, and OSINT data. ' },
        { text: '31', bold: true },
        { text: ' sources, ' },
        { text: '9', bold: true },
        { text: ' nuclear states monitored. Ingestion and risk assessment pipeline under construction.' },
      ],
    },
  },
]

const TRANSITIONS: Record<Lang, string>[] = [
  t('Un caso no prueba un método. Hacía falta escala.', 'One case does not prove a method. Scale was needed.'),
  t('Los datos públicos argentinos están fragmentados en decenas de fuentes. Quisimos saber qué pasa cuando se los cruza.', 'Argentine public data is fragmented across dozens of sources. We wanted to know what happens when you cross-reference them.'),
  t('Cada dataset nuevo revelaba conexiones con los anteriores. La pregunta dejó de ser si había patrones — sino cuántos.', 'Each new dataset revealed connections to the previous ones. The question was no longer whether there were patterns — but how many.'),
  t('Cuatro décadas de registros públicos. Un solo grafo.', 'Four decades of public records. One graph.'),
]

function RenderContent({ parts }: { parts: { text: string; bold?: boolean }[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.bold ? (
          <strong key={i} className={B}>{part.text}</strong>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}

export default function Home() {
  const { lang } = useLanguage()

  return (
    <div className="bg-pattern-dots mx-auto max-w-3xl">
      <Masthead />
      <NarrativeIntro />

      {CHAPTERS.map((ch, i) => (
        <div key={ch.number}>
          <Chapter
            number={ch.number}
            label={ch.label[lang]}
            color={ch.color}
            title={ch.title}
            links={ch.links.map((l) => ({ ...l, label: l.label[lang] }))}
            wip={ch.wip}
          >
            <RenderContent parts={ch.content[lang]} />
          </Chapter>
          {i < TRANSITIONS.length && <Transition text={TRANSITIONS[i][lang]} />}
        </div>
      ))}

      <WhatsNext />
      <CallToAction />
    </div>
  )
}
