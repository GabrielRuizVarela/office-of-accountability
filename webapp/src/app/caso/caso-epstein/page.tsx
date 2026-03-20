/**
 * Caso Epstein landing page — investigation overview with stats,
 * entry points, actor grid, and latest documents.
 */

import Link from 'next/link'

import { getActors, getDocuments } from '@/lib/caso-epstein'
import { ActorCard } from '@/components/investigation/ActorCard'
import { DocumentCard } from '@/components/investigation/DocumentCard'
import { ShareButton } from '@/components/ui/ShareButton'

const SLUG = 'caso-epstein'

export default async function CasoEpsteinPage() {
  const [actors, documents] = await Promise.all([getActors(), getDocuments()])

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          Investigacion de datos abiertos — Oficina de Rendicion de Cuentas
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          Caso Epstein: Red de trafico y poder
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          7,287 entidades y 21,944 relaciones documentadas. Documentos judiciales, registros de
          vuelo, 72 verificaciones de hechos. Una red que conecta poder politico, financiero y
          judicial a escala global.
        </p>
        <div className="mt-4">
          <ShareButton
            text="Caso Epstein: Red de trafico y poder — investigacion con datos abiertos"
            title="Caso Epstein"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { value: '7,287', label: 'Entidades' },
          { value: '21,944', label: 'Relaciones' },
          { value: '355', label: 'Actores' },
          { value: '1,044', label: 'Documentos' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
          >
            <p className="text-2xl font-bold text-red-400">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Primary CTAs */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/caso/${SLUG}/resumen`}
          className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center transition-colors hover:border-red-500/50 hover:bg-red-500/15"
        >
          <h3 className="text-lg font-bold text-red-300">Leer la investigacion</h3>
          <p className="mt-1 text-sm text-zinc-400">
            72 hechos verificados, documentos judiciales y registros de vuelo
          </p>
        </Link>
        <Link
          href={`/caso/${SLUG}/grafo`}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/50 p-6 text-center transition-colors hover:border-zinc-600"
        >
          <h3 className="text-lg font-bold text-zinc-100">Explorar el grafo</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Visualiza las conexiones entre actores, lugares y organizaciones
          </p>
        </Link>
      </section>

      {/* Entry points */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EntryPoint
          href={`/caso/${SLUG}/cronologia`}
          title="Cronologia"
          description="Desde los primeros abusos hasta las condenas y los documentos desclasificados."
        />
        <EntryPoint
          href={`/caso/${SLUG}/evidencia`}
          title="Evidencia"
          description="Documentos judiciales, registros de vuelo, testimonios y fuentes verificadas."
        />
        <EntryPoint
          href={`/caso/${SLUG}/grafo`}
          title="Conexiones"
          description="Red de actores: politicos, financistas, complices y victimas."
        />
        <EntryPoint
          href={`/caso/${SLUG}/investigacion`}
          title="Investigacion"
          description="Hechos verificados, fuentes y analisis de la red."
        />
      </section>

      {/* Actor grid */}
      {actors.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-zinc-50">Actores Clave</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actors.slice(0, 12).map((actor) => (
              <ActorCard
                key={actor.id as string}
                slug={actor.slug as string}
                investigationSlug={SLUG}
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
              href={`/caso/${SLUG}/evidencia`}
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
                investigationSlug={SLUG}
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
      className="group flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-red-600/50 hover:bg-zinc-900"
    >
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-red-400">{title}</h3>
      <p className="text-xs leading-relaxed text-zinc-400">{description}</p>
    </Link>
  )
}
