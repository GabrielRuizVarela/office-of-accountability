'use client'

import { useState } from 'react'

import { EventCard } from './EventCard'

interface TimelineEvent {
  readonly id: string
  readonly title: string
  readonly date: string
  readonly event_type: string
  readonly description: string
}

const EVENT_TYPE_COLORS: Record<string, { dot: string; label: string; bg: string }> = {
  legal: { dot: 'bg-red-500', label: 'Legal', bg: 'bg-red-500/10' },
  social: { dot: 'bg-blue-500', label: 'Social', bg: 'bg-blue-500/10' },
  financial: { dot: 'bg-green-500', label: 'Financial', bg: 'bg-green-500/10' },
  arrest: { dot: 'bg-orange-500', label: 'Arrest', bg: 'bg-orange-500/10' },
  death: { dot: 'bg-zinc-500', label: 'Death', bg: 'bg-zinc-500/10' },
  media: { dot: 'bg-purple-500', label: 'Media', bg: 'bg-purple-500/10' },
}

interface TimelineProps {
  readonly events: readonly TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const eventTypes = [...new Set(events.map((e) => e.event_type))]
  const filtered = activeFilter ? events.filter((e) => e.event_type === activeFilter) : events

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !activeFilter ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          All ({events.length})
        </button>
        {eventTypes.map((type) => {
          const config = EVENT_TYPE_COLORS[type] ?? EVENT_TYPE_COLORS.legal
          const count = events.filter((e) => e.event_type === type).length
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(activeFilter === type ? null : type)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter === type
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${config.dot}`} />
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Vertical timeline */}
      <div className="relative ml-4 border-l border-zinc-700 pl-6">
        {filtered.map((event) => {
          const config = EVENT_TYPE_COLORS[event.event_type] ?? EVENT_TYPE_COLORS.legal
          const isExpanded = expandedId === event.id

          return (
            <EventCard
              key={event.id}
              event={event}
              dotColor={config.dot}
              isExpanded={isExpanded}
              onToggle={() => setExpandedId(isExpanded ? null : event.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
