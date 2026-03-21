'use client'

/**
 * Expandable event card for the timeline view.
 */

import { useState } from 'react'

import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type EventType } from '@/lib/investigations/types'

interface EventCardProps {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly date: string
  readonly eventType: EventType
  readonly sourceUrl: string | null
  readonly actors: readonly { readonly id: string; readonly name: string }[]
}

export function EventCard({
  title,
  description,
  date,
  eventType,
  sourceUrl,
  actors,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const color = EVENT_TYPE_COLORS[eventType]
  const label = EVENT_TYPE_LABELS[eventType]

  return (
    <button type="button" onClick={() => setExpanded((prev) => !prev)} className="w-full text-left">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <time className="shrink-0 text-xs text-zinc-500" dateTime={date}>
                {formatDate(date)}
              </time>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {label}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-zinc-100">{title}</p>

            {expanded && (
              <div className="mt-2 space-y-2">
                {description && (
                  <p className="text-xs leading-relaxed text-zinc-400">{description}</p>
                )}
                {actors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {actors.map((actor) => (
                      <span
                        key={actor.id}
                        className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[10px] text-blue-400"
                      >
                        {actor.name}
                      </span>
                    ))}
                  </div>
                )}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-purple-400 hover:text-purple-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver fuente
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}
