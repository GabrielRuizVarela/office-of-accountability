interface FlightCardProps {
  readonly flightNumber: string
  readonly date: string
  readonly origin: string
  readonly destination: string
  readonly aircraft: string
}

export function FlightCard({ flightNumber, date, origin, destination, aircraft }: FlightCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-orange-400">{flightNumber || 'N/A'}</span>
        <time className="text-xs text-zinc-500">{date}</time>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
        <span>{origin}</span>
        <span className="text-zinc-600">→</span>
        <span>{destination}</span>
      </div>
      {aircraft && (
        <div className="mt-1 text-xs text-zinc-600">{aircraft}</div>
      )}
    </div>
  )
}
