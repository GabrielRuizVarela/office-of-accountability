/**
 * Key statistics display for investigation landing pages.
 */

interface Stat {
  readonly label: string
  readonly value: string | number
  readonly color?: string
}

interface KeyStatsProps {
  readonly stats?: readonly Stat[]
}

function StatCard({ label, value, color }: Stat) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
      <span className="text-2xl font-bold sm:text-3xl" style={color ? { color } : { color: '#fafafa' }}>
        {value}
      </span>
      <span className="mt-1 text-xs text-zinc-400 sm:text-sm">{label}</span>
    </div>
  )
}

const DEFAULT_STATS: readonly Stat[] = [
  { value: '$251M+', label: 'en perdidas' },
  { value: '114,000+', label: 'billeteras afectadas' },
  { value: '94%', label: 'caida del precio' },
]

export function KeyStats({ stats }: KeyStatsProps) {
  const items = stats ?? DEFAULT_STATS

  return (
    <div className={`grid gap-3 sm:gap-4 ${items.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {items.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
