/**
 * Caso Libra timeline page — events ordered chronologically.
 */

import { getTimeline } from '@/lib/caso-libra'
import { Timeline } from '@/components/investigation/Timeline'

export default async function CronologiaPage() {
  const events = await getTimeline()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Cronologia</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {events.length} eventos desde el lanzamiento del token hasta las investigaciones
          judiciales.
        </p>
      </div>
      <Timeline events={events} />
    </div>
  )
}
