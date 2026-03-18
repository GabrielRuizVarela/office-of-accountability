interface Stat {
  readonly label: string
  readonly value: number | string
  readonly color: string
}

interface KeyStatsProps {
  readonly stats: readonly Stat[]
}

export function KeyStats({ stats }: KeyStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <div className="text-2xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="mt-1 text-xs text-zinc-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
