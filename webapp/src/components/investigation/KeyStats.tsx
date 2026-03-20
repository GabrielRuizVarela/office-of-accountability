/**
 * Key statistics display for the Caso Libra landing page.
 */

interface StatProps {
  readonly label: string
  readonly value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
      <span className="text-2xl font-bold text-zinc-50 sm:text-3xl">{value}</span>
      <span className="mt-1 text-xs text-zinc-400 sm:text-sm">{label}</span>
    </div>
  )
}

export function KeyStats() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <Stat value="$251M+" label="en perdidas" />
      <Stat value="114,000+" label="billeteras afectadas" />
      <Stat value="94%" label="caida del precio" />
    </div>
  )
}
