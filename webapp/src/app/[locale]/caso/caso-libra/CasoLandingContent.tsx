'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { Link } from '@/i18n/navigation'

import { KeyStats } from '@/components/investigation/KeyStats'
import { ActorCard } from '@/components/investigation/ActorCard'
import { DocumentCard } from '@/components/investigation/DocumentCard'
import { ShareButton } from '@/components/ui/ShareButton'

const t = {
  tagline: {
    es: 'Investigacion de datos abiertos — Oficina de Rendicion de Cuentas',
    en: 'Open data investigation — Office of Accountability',
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
    es: '26 hechos verificados, 27 eventos, 14 actores, flujos de dinero — todo con fuentes',
    en: '26 verified facts, 27 events, 14 actors, money flows — all with sources',
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
} satisfies Record<string, Record<Locale, string>>

interface Props {
  readonly slug: string
  readonly actors: readonly Record<string, unknown>[]
  readonly documents: readonly Record<string, unknown>[]
}

export function CasoLandingContent({ slug, actors, documents }: Props) {
  const locale = useLocale() as Locale

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-purple-400">
          {t.tagline[locale]}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          {t.title[locale]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {t.heroDesc[locale]}
        </p>
        <div className="mt-4">
          <ShareButton
            text={t.shareText[locale]}
            title="Caso Libra"
          />
        </div>
      </section>

      {/* Key stats */}
      <KeyStats />

      {/* Primary CTA — read the full story */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/caso/${slug}/resumen`}
          className="flex-1 rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 text-center transition-colors hover:border-purple-500/50 hover:bg-purple-500/15"
        >
          <h3 className="text-lg font-bold text-purple-300">{t.readFullStory[locale]}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {t.readFullStoryDesc[locale]}
          </p>
        </Link>
        <Link
          href={`/caso/${slug}/investigacion`}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/50 p-6 text-center transition-colors hover:border-zinc-600"
        >
          <h3 className="text-lg font-bold text-zinc-100">{t.seeEvidence[locale]}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {t.seeEvidenceDesc[locale]}
          </p>
        </Link>
      </section>

      {/* Entry points */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EntryPoint
          href={`/caso/${slug}/cronologia`}
          title={t.timeline[locale]}
          description={t.timelineDesc[locale]}
        />
        <EntryPoint
          href={`/caso/${slug}/dinero`}
          title={t.money[locale]}
          description={t.moneyDesc[locale]}
        />
        <EntryPoint
          href={`/caso/${slug}/grafo`}
          title={t.connections[locale]}
          description={t.connectionsDesc[locale]}
        />
        <EntryPoint
          href={`/caso/${slug}/investigacion#aportar`}
          title={t.submitEvidence[locale]}
          description={t.submitEvidenceDesc[locale]}
        />
      </section>

      {/* Actor grid */}
      {actors.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-zinc-50">{t.keyActors[locale]}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actors.map((actor) => (
              <ActorCard
                key={actor.id as string}
                slug={actor.slug as string}
                investigationSlug={slug}
                name={actor.name as string}
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
            <h2 className="text-xl font-bold text-zinc-50">{t.docsAndEvidence[locale]}</h2>
            <Link
              href={`/caso/${slug}/evidencia`}
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              {t.viewAll[locale]} &rarr;
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.slice(0, 6).map((doc) => (
              <DocumentCard
                key={doc.id as string}
                slug={doc.slug as string}
                investigationSlug={slug}
                title={doc.title as string}
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
