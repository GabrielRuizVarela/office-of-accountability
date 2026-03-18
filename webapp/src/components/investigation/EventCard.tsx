interface EventCardEvent {
  readonly id: string
  readonly title: string
  readonly date: string
  readonly event_type: string
  readonly description: string
}

interface EventCardProps {
  readonly event: EventCardEvent
  readonly dotColor: string
  readonly isExpanded: boolean
  readonly onToggle: () => void
}

export function EventCard({ event, dotColor, isExpanded, onToggle }: EventCardProps) {
  const formattedDate = formatDate(event.date)

  return (
    <div className="relative mb-6 last:mb-0">
      {/* Timeline dot */}
      <div
        className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-zinc-950 ${dotColor}`}
      />

      {/* Card */}
      <button
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={isExpanded}
      >
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <time className="text-xs font-medium text-zinc-500">{formattedDate}</time>
              <h3 className="mt-0.5 text-sm font-semibold text-zinc-100">{event.title}</h3>
            </div>
            <span className="mt-1 text-xs text-zinc-600">{isExpanded ? '▲' : '▼'}</span>
          </div>

          {isExpanded && (
            <p className="mt-3 border-t border-zinc-800 pt-3 text-sm leading-relaxed text-zinc-400">
              {event.description}
            </p>
          )}
        </div>
      </button>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00Z')
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
  } catch {
    return dateStr
  }
}
