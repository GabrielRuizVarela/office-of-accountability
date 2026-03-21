'use client'

/**
 * Vertical timeline component for Caso Libra events.
 * Mobile-first, with event type filtering and expandable cards.
 */

import { useState, useMemo } from 'react'

import type { TimelineItem } from '@/lib/caso-libra/types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type EventType } from '@/lib/investigations/types'

import { EventCard } from './EventCard'

interface TimelineProps {
  readonly events: readonly TimelineItem[]
}

const EVENT_TYPES: readonly EventType[] = ['political', 'financial', 'legal', 'media']

export function Timeline({ events }: TimelineProps) {
  const [activeFilter, setActiveFilter] = useState<EventType | null>(null)

  const filteredEvents = useMemo(
    () => (activeFilter ? events.filter((e) => e.event_type === activeFilter) : events),
    [events, activeFilter],
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeFilter === null
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Todos ({events.length})
        </button>
        {EVENT_TYPES.map((type) => {
          const count = events.filter((e) => e.event_type === type).length
          if (count === 0) return null
          const color = EVENT_TYPE_COLORS[type]
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveFilter(activeFilter === type ? null : type)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter === type ? 'text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
              style={activeFilter === type ? { backgroundColor: color } : undefined}
            >
              {EVENT_TYPE_LABELS[type]} ({count})
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="relative space-y-3 pl-4">
        <div className="absolute left-[5px] top-0 bottom-0 w-px bg-zinc-800" />
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            title={event.title}
            description={event.description}
            date={event.date}
            eventType={event.event_type}
            sourceUrl={event.source_url}
            actors={event.actors}
          />
        ))}
        {filteredEvents.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">No hay eventos para este filtro.</p>
        )}
      </div>
    </div>
  )
}
