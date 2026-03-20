'use client'

/**
 * Actor profile page — person details, mini timeline,
 * connections, related documents, and mini graph.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import type { GraphData } from '@/lib/neo4j/types'
import type { TimelineItem } from '@/lib/caso-libra/types'
import { ForceGraph } from '@/components/graph/ForceGraph'
import { EventCard } from '@/components/investigation/EventCard'
import { ShareButton } from '@/components/ui/ShareButton'

interface ActorData {
  readonly person: Record<string, unknown>
  readonly graph: GraphData
  readonly events: readonly TimelineItem[]
  readonly documents: readonly {
    readonly id: string
    readonly title: string
    readonly slug: string
  }[]
}

export default function ActorPage() {
  const params = useParams()
  const actorSlug = params.actorSlug as string
  const slug = params.slug as string

  const [data, setData] = useState<ActorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/caso-libra/person/${actorSlug}`)
        if (!res.ok) throw new Error('Actor no encontrado')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [actorSlug])

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-zinc-500">Cargando...</div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-red-400">
        {error ?? 'No encontrado'}
      </div>
    )
  }

  const { person, graph, events, documents } = data
  const name = String(person.name ?? '')
  const role = person.role ? String(person.role) : null
  const nationality = person.nationality ? String(person.nationality) : null
  const description = person.description ? String(person.description) : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-2xl font-bold text-blue-400">
          {name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">{name}</h1>
          {role && <p className="mt-1 text-sm text-zinc-400">{role}</p>}
          {nationality && (
            <span className="mt-1 inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
              {nationality}
            </span>
          )}
        </div>
      </div>

      {description && <p className="text-sm leading-relaxed text-zinc-400">{description}</p>}

      <ShareButton text={`Caso Libra — Perfil de ${name}`} title={`${name} — Caso Libra`} />

      {/* Mini graph */}
      {graph.nodes.length > 1 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-50">Conexiones</h2>
          <div className="mt-3 h-[40vh] overflow-hidden rounded-lg border border-zinc-800">
            <ForceGraph data={graph} selectedNodeId={`cl-person-${actorSlug}`} />
          </div>
        </section>
      )}

      {/* Timeline */}
      {events.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-50">Eventos Participados</h2>
          <div className="mt-3 space-y-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                eventType={event.event_type}
                sourceUrl={event.source_url}
                actors={[]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Related documents */}
      {documents.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-50">Documentos Relacionados</h2>
          <ul className="mt-3 space-y-2">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/caso/${slug}/evidencia/${doc.slug}`}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
