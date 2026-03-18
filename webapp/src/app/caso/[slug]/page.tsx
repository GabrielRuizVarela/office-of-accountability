/**
 * Caso Libra landing page — investigation overview with stats,
 * entry points, actor grid, and latest documents.
 */

import Link from 'next/link'

import { getStats, getActors, getDocuments } from '@/lib/caso-libra'
import { KeyStats } from '@/components/investigation/KeyStats'
import { ActorCard } from '@/components/investigation/ActorCard'
import { DocumentCard } from '@/components/investigation/DocumentCard'
import { ShareButton } from '@/components/ui/ShareButton'

export default async function CasoLandingPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [_stats, actors, documents] = await Promise.all([getStats(), getActors(), getDocuments()])

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          Caso Libra: La Memecoin del Presidente
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          El 14 de febrero de 2025, el presidente Milei promovio el token $LIBRA a sus 19 millones
          de seguidores. En horas, el precio colapso un 94%. Aproximadamente 114,000 billeteras
          perdieron entre $251M y $286M.
        </p>
        <div className="mt-4">
          <ShareButton
            text="Caso Libra: Investigacion comunitaria sobre la memecoin del presidente"
            title="Caso Libra"
          />
        </div>
      </section>

      {/* Key stats */}
      <KeyStats />

      {/* Entry points */}
      <section className="grid gap-3 sm:grid-cols-3">
        <EntryPoint
          href={`/caso/${slug}/grafo`}
          title="Grafo de Conocimiento"
          description="Explora las conexiones entre actores, eventos, documentos y billeteras."
        />
        <EntryPoint
          href={`/caso/${slug}/cronologia`}
          title="Cronologia"
          description="Todos los eventos ordenados por fecha, desde el lanzamiento hasta las investigaciones."
        />
        <EntryPoint
          href={`/caso/${slug}/dinero`}
          title="Flujo de Dinero"
          description="Visualiza el movimiento de fondos entre billeteras en la blockchain de Solana."
        />
      </section>

      {/* Actor grid */}
      {actors.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-zinc-50">Actores Clave</h2>
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
            <h2 className="text-xl font-bold text-zinc-50">Documentos y Evidencia</h2>
            <Link
              href={`/caso/${slug}/evidencia`}
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              Ver todos &rarr;
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
