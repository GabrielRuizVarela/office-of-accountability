/**
 * Caso investigation timeline page — events ordered chronologically.
 *
 * Slug-aware: dispatches to caso-libra or caso-epstein data source.
 */

import { getTimeline as getLibraTimeline } from '@/lib/caso-libra'
import { getTimeline as getEpsteinTimeline } from '@/lib/caso-epstein'
import type { TimelineItem } from '@/lib/caso-libra/types'
import { Timeline } from '@/components/investigation/Timeline'

export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug !== 'caso-libra' && slug !== 'caso-epstein') {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Investigacion no encontrada</h1>
        <p className="mt-4 text-zinc-400">No existe una investigacion con este identificador.</p>
      </div>
    )
  }

  let events: readonly TimelineItem[]

  if (slug === 'caso-epstein') {
    const epsteinEvents = await getEpsteinTimeline(slug)
    // Map EpsteinEvent to TimelineItem shape expected by the Timeline component
    // Epstein has additional event_type values (social, arrest, death) that
    // don't exist in Libra's EventType. They'll render but won't match filters.
    events = epsteinEvents.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      event_type: e.event_type as TimelineItem['event_type'],
      source_url: e.source ?? null,
      actors: [],
    }))
  } else {
    events = await getLibraTimeline()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Cronologia</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {events.length} eventos documentados en la investigacion.
        </p>
      </div>
      <Timeline events={events} />
    </div>
  )
}
