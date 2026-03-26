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
    label: t('Febrero 2025', 'February 2025'),
    color: 'purple',
    title: 'Caso Libra',
    links: [{ href: '/caso/caso-libra', label: t('Ver investigacion', 'View investigation'), color: 'purple' }],
    content: {
      es: [
        { text: 'El presidente Milei promociono el token ' },
        { text: '$LIBRA', bold: true },
        { text: ' a 19 millones de seguidores. El precio colapso 94% en horas. Transacciones blockchain, documentos parlamentarios y comunicaciones cruzadas. ' },
        { text: '$251M+', bold: true },
        { text: ' en perdidas documentadas. ' },
        { text: '114K', bold: true },
        { text: ' billeteras afectadas. FBI y DOJ investigan.' },
      ],
      en: [
        { text: 'President Milei promoted the ' },
        { text: '$LIBRA', bold: true },
        { text: ' token to 19 million followers. The price collapsed 94% in hours. Blockchain transactions, parliamentary documents, and cross-referenced communications. ' },
        { text: '$251M+', bold: true },
        { text: ' in documented losses. ' },
        { text: '114K', bold: true },
        { text: ' wallets affected. FBI and DOJ investigating.' },
      ],
    },
  },
  {
    number: 'II',
    label: t('Caso internacional', 'International case'),
    color: 'red',
    title: 'Caso Epstein',
    links: [{ href: '/caso/caso-epstein', label: t('Ver investigacion', 'View investigation'), color: 'red' }],
    content: {
      es: [
        { text: 'Miles de documentos judiciales, cientos de actores, decadas de encubrimiento. ' },
        { text: '7,276', bold: true },
        { text: ' entidades, ' },
        { text: '374', bold: true },
        { text: ' actores, ' },
        { text: '1,044', bold: true },
        { text: ' documentos judiciales procesados y cruzados en una base de datos relacional.' },
      ],
      en: [
        { text: 'Thousands of court documents, hundreds of actors, decades of cover-up. ' },
        { text: '7,276', bold: true },
        { text: ' entities, ' },
        { text: '374', bold: true },
        { text: ' actors, ' },
        { text: '1,044', bold: true },
        { text: ' court documents processed and cross-referenced in a relational database.' },
      ],
    },
  },
  {
    number: 'III',
    label: t('14 fuentes publicas', '14 public sources'),
    color: 'emerald',
    title: 'Finanzas Politicas Argentinas',
    links: [{ href: '/caso/finanzas-politicas', label: t('Ver investigacion', 'View investigation'), color: 'emerald' }],
    content: {
      es: [
        { text: 'Votaciones legislativas, declaraciones juradas, sociedades offshore, financiamiento de campanas, registros corporativos. ' },
        { text: '14', bold: true },
        { text: ' fuentes de datos publicos cruzadas. ' },
        { text: '329', bold: true },
        { text: ' legisladores, ' },
        { text: '48,212', bold: true },
        { text: ' coincidencias entre datasets. Las conexiones entre ' },
        { text: 'cargo publico, directorios corporativos y dinero de campana', bold: true },
        { text: '.' },
      ],
      en: [
        { text: 'Legislative votes, asset declarations, offshore entities, campaign financing, corporate registries. ' },
        { text: '14', bold: true },
        { text: ' public data sources cross-referenced. ' },
        { text: '329', bold: true },
        { text: ' legislators, ' },
        { text: '48,212', bold: true },
        { text: ' cross-dataset matches. The connections between ' },
        { text: 'public office, corporate boards, and campaign money', bold: true },
        { text: '.' },
      ],
    },
  },
  {
    number: 'IV',
    label: t('87,725 contratos', '87,725 contracts'),
    color: 'sky',
    title: 'Obras Publicas y Monopolios',
    links: [
      { href: '/caso/obras-publicas', label: t('Obras Publicas', 'Public Works'), color: 'sky' },
      { href: '/caso/monopolios', label: t('Monopolios', 'Monopolies'), color: 'amber' },
    ],
    content: {
      es: [
        { text: 'Contrataciones publicas: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos. ' },
        { text: '87,725', bold: true },
        { text: ' contratos, ' },
        { text: '30,829', bold: true },
        { text: ' contratistas, ' },
        { text: '7,486', bold: true },
        { text: ' obras. Cruce sistematico contra la base de finanzas politicas. En paralelo, concentracion de mercado en ' },
        { text: '18 sectores', bold: true },
        { text: ' de la economia argentina.' },
      ],
      en: [
        { text: 'Public procurement: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos. ' },
        { text: '87,725', bold: true },
        { text: ' contracts, ' },
        { text: '30,829', bold: true },
        { text: ' contractors, ' },
        { text: '7,486', bold: true },
        { text: ' works. Systematic cross-reference against the political finance database. In parallel, market concentration across ' },
        { text: '18 sectors', bold: true },
        { text: ' of the Argentine economy.' },
      ],
    },
  },
  {
    number: 'V',
    label: t('24 de Marzo 2026', 'March 24, 2026'),
    color: 'stone',
    title: 'Caso Dictadura: 1976-1983',
    links: [{ href: '/caso/caso-dictadura', label: t('Ver investigacion', 'View investigation'), color: 'stone' }],
    content: {
      es: [
        { text: 'Dictadura militar argentina. Registros de victimas, centros de detencion, cadenas de mando y sentencias judiciales consolidados en una base de datos unificada. ' },
        { text: '9,415', bold: true },
        { text: ' victimas documentadas, ' },
        { text: '774', bold: true },
        { text: ' centros clandestinos de detencion, ' },
        { text: '14,512', bold: true },
        { text: ' registros.' },
      ],
      en: [
        { text: 'Argentine military dictatorship. Victim records, detention centers, chains of command, and judicial sentences consolidated into a unified database. ' },
        { text: '9,415', bold: true },
        { text: ' documented victims, ' },
        { text: '774', bold: true },
        { text: ' clandestine detention centers, ' },
        { text: '14,512', bold: true },
        { text: ' records.' },
      ],
    },
  },
  {
    number: 'VI',
    label: t('En desarrollo', 'In development'),
    color: 'yellow',
    title: 'Global Nuclear Risk',
    links: [{ href: '/caso/riesgo-nuclear', label: t('Ver progreso', 'View progress'), color: 'yellow' }],
    wip: true,
    content: {
      es: [
        { text: 'Monitoreo de senales de escalada nuclear: desarrollos militares, declaraciones oficiales, tratados, pruebas de misiles y datos OSINT. ' },
        { text: '31', bold: true },
        { text: ' fuentes, ' },
        { text: '9', bold: true },
        { text: ' estados nucleares monitoreados.' },
      ],
      en: [
        { text: 'Nuclear escalation signal monitoring: military developments, official statements, treaties, missile tests, and OSINT data. ' },
        { text: '31', bold: true },
        { text: ' sources, ' },
        { text: '9', bold: true },
        { text: ' nuclear states monitored.' },
      ],
    },
  },
  {
    number: 'VII',
    label: t('Marzo 2026', 'March 2026'),
    color: 'rose',
    title: 'Caso Adorni',
    links: [{ href: '/caso/adorni', label: t('Ver investigacion', 'View investigation'), color: 'rose' }],
    content: {
      es: [
        { text: 'El Jefe de Gabinete adjudico una licitacion de ' },
        { text: '$3,650M', bold: true },
        { text: ' en mensajeria a ATX S.A. Los registros corporativos (IGJ) muestran que el presidente de ATX controla ' },
        { text: '11 empresas', bold: true },
        { text: ', y que las tres oferentes comparten directivos, socios y direcciones. ' },
        { text: '5', bold: true },
        { text: ' de las 7 empresas de la red ya figuraban en la base de ' },
        { text: '30,829 contratistas', bold: true },
        { text: '. En paralelo: vuelos privados pagados por un contratista de TV Publica, propiedades no declaradas, y el propio Decreto 712/2024 de Adorni prohibiendo lo que luego hizo. ' },
        { text: '6', bold: true },
        { text: ' causas judiciales abiertas.' },
      ],
      en: [
        { text: 'The Chief of Cabinet awarded a ' },
        { text: '$3,650M', bold: true },
        { text: ' messaging tender to ATX S.A. Corporate registry records (IGJ) show that ATX\'s president controls ' },
        { text: '11 companies', bold: true },
        { text: ', and that all three bidders share directors, partners, and addresses. ' },
        { text: '5', bold: true },
        { text: ' of the 7 network companies were already in the database of ' },
        { text: '30,829 contractors', bold: true },
        { text: '. In parallel: private flights paid by a state TV contractor, undeclared properties, and Adorni\'s own Decree 712/2024 prohibiting what he later did. ' },
        { text: '6', bold: true },
        { text: ' open judicial cases.' },
      ],
    },
  },
]

const TRANSITIONS: Record<Lang, string>[] = [
  t('El caso LIBRA abrio una linea de investigacion sobre el entorno presidencial que continua expandiendose.', 'The LIBRA case opened an investigation line on the presidential inner circle that continues expanding.'),
  t('Cada caso agrega datos al mismo grafo. Las conexiones entre investigaciones aparecen automaticamente por cruce de identificadores fiscales.', 'Each case adds data to the same graph. Connections between investigations appear automatically through tax ID cross-referencing.'),
  t('Los cruces entre financiamiento politico y contrataciones publicas revelaron patrones estructurales.', 'Cross-references between political financing and public procurement revealed structural patterns.'),
  t('Los registros historicos se sumaron a la misma base de datos. Las herramientas de cruce aplican tanto a casos actuales como a investigaciones de archivo.', 'Historical records were added to the same database. Cross-referencing tools apply to current cases and archival investigations alike.'),
  t('La base de contratistas, con 87,725 contratos y 30,829 proveedores, se convirtio en referencia para casos en curso.', 'The contractor database, with 87,725 contracts and 30,829 suppliers, became a reference for ongoing cases.'),
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
