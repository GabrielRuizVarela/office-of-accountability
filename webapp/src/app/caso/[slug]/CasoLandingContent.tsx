'use client'

import Link from 'next/link'

import { useLanguage, type Lang } from '@/lib/language-context'
import { KeyStats } from '@/components/investigation/KeyStats'
import { ActorCard } from '@/components/investigation/ActorCard'
import { DocumentCard } from '@/components/investigation/DocumentCard'
import { ShareButton } from '@/components/ui/ShareButton'

const t = {
  tagline: {
    es: 'Investigacion de datos abiertos - Oficina de Rendicion de Cuentas',
    en: 'Open data investigation - Office of Accountability',
  },
  title: {
    es: 'Caso Libra: La Memecoin del Presidente',
    en: 'The Libra Case: The President\'s Memecoin',
  },
  heroDesc: {
    es: 'El 14 de febrero de 2025, el presidente Milei promovio el token $LIBRA a sus 19 millones de seguidores. En horas, el precio colapso un 94%. Aproximadamente 114,000 billeteras perdieron $251 millones. Un año despues, cero imputados.',
    en: 'On February 14, 2025, President Milei promoted the $LIBRA token to his 19 million followers. Within hours, the price collapsed 94%. Approximately 114,000 wallets lost $251 million. One year later, zero indictments.',
  },
  shareText: {
    es: 'Caso Libra: Investigacion comunitaria sobre la memecoin del presidente',
    en: 'The Libra Case: Community investigation into the president\'s memecoin',
  },
  readFullStory: {
    es: 'Leer la historia completa',
    en: 'Read the full story',
  },
  readFullStoryDesc: {
    es: '8 capitulos que cuentan como el presidente promovio una estafa de $251 millones',
    en: '8 chapters telling how the president promoted a $251 million scam',
  },
  seeEvidence: {
    es: 'Ver las pruebas',
    en: 'See the evidence',
  },
  seeEvidenceDesc: {
    es: '26 hechos verificados, 27 eventos, 14 actores, flujos de dinero - todo con fuentes',
    en: '26 verified facts, 27 events, 14 actors, money flows - all with sources',
  },
  timeline: { es: 'Cronologia', en: 'Timeline' },
  timelineDesc: {
    es: 'Todos los eventos desde el lanzamiento hasta las investigaciones judiciales.',
    en: 'All events from the launch to the judicial investigations.',
  },
  money: { es: 'El Dinero', en: 'The Money' },
  moneyDesc: {
    es: '$107M extraidos por insiders. Visualiza el flujo de fondos.',
    en: '$107M extracted by insiders. Visualize the fund flow.',
  },
  connections: { es: 'Conexiones', en: 'Connections' },
  connectionsDesc: {
    es: 'Red de actores: quien conoce a quien, quien pago a quien.',
    en: 'Actor network: who knows whom, who paid whom.',
  },
  submitEvidence: { es: 'Aportar pruebas', en: 'Submit evidence' },
  submitEvidenceDesc: {
    es: 'Tenes informacion? Envia datos verificables para la investigacion.',
    en: 'Have information? Submit verifiable data for the investigation.',
  },
  keyActors: { es: 'Actores Clave', en: 'Key Actors' },
  docsAndEvidence: { es: 'Documentos y Evidencia', en: 'Documents & Evidence' },
  viewAll: { es: 'Ver todos', en: 'View all' },
} satisfies Record<string, Record<Lang, string>>

interface Props {
  readonly slug: string
  readonly actors: readonly Record<string, unknown>[]
  readonly documents: readonly Record<string, unknown>[]
  readonly config?: { name: { es: string; en: string }; description: { es: string; en: string } }
  readonly stats?: { totalNodes: number; totalRelationships: number; nodeCountsByType: Record<string, number> }
}

export function CasoLandingContent({ slug, actors, documents, config, stats }: Props) {
  const { lang } = useLanguage()

  // Use dynamic config if available, fall back to hardcoded Libra content
  const isLibra = slug === 'caso-libra'
  const title = config ? config.name[lang] : t.title[lang]
  const description = config?.description?.[lang] || (isLibra ? t.heroDesc[lang] : '')

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-purple-400">
          {t.tagline[lang]}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {description}
          </p>
        )}
        <div className="mt-4">
          <ShareButton
            text={config ? config.name[lang] : t.shareText[lang]}
            title={title}
          />
        </div>
      </section>

      {/* Key stats — dynamic for all cases */}
      {stats && stats.totalNodes > 0 ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label={lang === 'es' ? 'Nodos' : 'Nodes'} value={String(stats.totalNodes)} />
          <StatCard label={lang === 'es' ? 'Relaciones' : 'Relationships'} value={String(stats.totalRelationships)} />
          {Object.entries(stats.nodeCountsByType)
            .filter(([label]) => !['InvestigationConfig', 'PipelineState', 'SchemaDefinition', 'NodeTypeDefinition', 'RelTypeDefinition', 'Proposal'].includes(label))
            .slice(0, 2)
            .map(([label, count]) => (
              <StatCard key={label} label={label} value={String(count)} />
            ))}
        </section>
      ) : isLibra ? (
        <KeyStats />
      ) : null}

      {/* Entry points — universal for all investigations */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EntryPoint
          href={`/caso/${slug}/grafo`}
          title={t.connections[lang]}
          description={lang === 'es' ? 'Explora la red de conexiones' : 'Explore the connections network'}
        />
        <EntryPoint
          href={`/caso/${slug}/cronologia`}
          title={t.timeline[lang]}
          description={t.timelineDesc[lang]}
        />
        <EntryPoint
          href={`/caso/${slug}/evidencia`}
          title={lang === 'es' ? 'Evidencia' : 'Evidence'}
          description={lang === 'es' ? 'Documentos y pruebas' : 'Documents and evidence'}
        />
        <EntryPoint
          href={`/caso/${slug}/motor`}
          title={lang === 'es' ? 'Motor' : 'Engine'}
          description={lang === 'es' ? 'Pipeline de investigacion, propuestas, datos' : 'Investigation pipeline, proposals, data'}
        />
      </section>

      {/* Actor grid */}
      {actors.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-zinc-50">{t.keyActors[lang]}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actors.map((actor) => (
              <ActorCard
                key={actor.id as string}
                slug={(actor.slug ?? actor.id ?? '') as string}
                investigationSlug={slug}
                name={(actor.name ?? 'Unknown') as string}
                role={actor.role as string | undefined}
                nationality={actor.nationality as string | undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest documents */}
      {documents.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-50">{t.docsAndEvidence[lang]}</h2>
            <Link
              href={`/caso/${slug}/evidencia`}
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              {t.viewAll[lang]} &rarr;
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.slice(0, 6).map((doc) => (
              <DocumentCard
                key={doc.id as string}
                slug={(doc.slug ?? doc.id ?? '') as string}
                investigationSlug={slug}
                title={(doc.title ?? doc.name ?? 'Untitled') as string}
                docType={doc.doc_type as string}
                summary={doc.summary as string | undefined}
                datePublished={doc.date_published as string | undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  )
}

function EntryPoint({
  href,
  title,
  description,
}: {
  readonly href: string
  readonly title: string
  readonly description: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-purple-600/50 hover:bg-zinc-900"
    >
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-purple-400">{title}</h3>
      <p className="text-xs leading-relaxed text-zinc-400">{description}</p>
    </Link>
  )
}
