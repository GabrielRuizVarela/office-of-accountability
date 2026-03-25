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
        { text: 'Un caso con miles de documentos, cientos de actores, décadas de historia. ' },
        { text: '7,276', bold: true },
        { text: ' entidades, ' },
        { text: '374', bold: true },
        { text: ' actores, ' },
        { text: '1,044', bold: true },
        { text: ' documentos judiciales procesados. El motor escaló.' },
      ],
      en: [
        { text: 'A case with thousands of documents, hundreds of actors, decades of history. ' },
        { text: '7,276', bold: true },
        { text: ' entities, ' },
        { text: '374', bold: true },
        { text: ' actors, ' },
        { text: '1,044', bold: true },
        { text: ' court documents processed. The engine scaled.' },
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
        { text: 'Empezamos con los datasets de Como Voto. Expandimos a declaraciones juradas, sociedades offshore, financiamiento de campañas. La investigación se convirtió en un buceo profundo en las conexiones entre ' },
        { text: 'políticos y dinero', bold: true },
        { text: '. ' },
        { text: '329', bold: true },
        { text: ' legisladores, ' },
        { text: '7', bold: true },
        { text: ' fuentes de datos cruzadas.' },
      ],
      en: [
        { text: 'We started with the Como Voto datasets. Expanded to asset declarations, offshore companies, campaign financing. The investigation became a deep dive into the connections between ' },
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
    title: 'Obras Públicas y Monopolios',
    links: [
      { href: '/caso/obras-publicas', label: t('Obras Públicas →', 'Public Works →'), color: 'sky' },
      { href: '/caso/monopolios', label: t('Monopolios →', 'Monopolies →'), color: 'amber' },
    ],
    content: {
      es: [
        { text: 'Contratos de obra pública: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos. ' },
        { text: '56,122', bold: true },
        { text: ' entidades, ' },
        { text: '7,486', bold: true },
        { text: ' obras, ' },
        { text: '13,277', bold: true },
        { text: ' cruces contra el grafo de finanzas. En paralelo, el estado de monopolización de ' },
        { text: '18 sectores', bold: true },
        { text: ' de la economía argentina. ' },
        { text: 'USD 22.5B', bold: true },
        { text: ' en costo anual estimado.' },
      ],
      en: [
        { text: 'Public works contracts: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos. ' },
        { text: '56,122', bold: true },
        { text: ' entities, ' },
        { text: '7,486', bold: true },
        { text: ' works, ' },
        { text: '13,277', bold: true },
        { text: ' crosses against the finance graph. In parallel, the monopolization status of ' },
        { text: '18 sectors', bold: true },
        { text: ' of the Argentine economy. ' },
        { text: 'USD 22.5B', bold: true },
        { text: ' in estimated annual cost.' },
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
        { text: ' nodos. Nuevas conexiones, nuevas pistas. La investigación continúa.' },
      ],
      en: [
        { text: 'Argentine military dictatorship. Multiple ingestion pipelines consolidated into a unified graph. ' },
        { text: '9,415', bold: true },
        { text: ' documented victims, ' },
        { text: '774', bold: true },
        { text: ' clandestine detention centers, ' },
        { text: '14,512', bold: true },
        { text: ' nodes. New connections, new leads. The investigation continues.' },
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
  t('El motor funcionó. Necesitábamos probarlo con volumen real de datos.', 'The engine worked. We needed to test it with real data volume.'),
  t('Los resultados mejoraban con cada caso. Menos intervención humana, más profundidad. Pero siempre con validación.', 'Results improved with each case. Less human intervention, more depth. But always with validation.'),
  t('Los resultados fueron sorprendentes. Decidimos probar con otros datos públicos abiertos.', 'The results were astonishing. We decided to test with other open public data.'),
  t('El 24 de marzo trajo nueva información. Creamos pipelines para consolidar datos de la dictadura en un grafo unificado.', 'March 24 brought new information. We created pipelines to consolidate dictatorship data into a unified graph.'),
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
