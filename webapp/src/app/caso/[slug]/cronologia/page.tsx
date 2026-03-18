import type { Metadata } from 'next'

import { Timeline } from '../../../../components/investigation/Timeline'
import { CASO_EPSTEIN_SLUG } from '../../../../lib/caso-epstein/types'
import { getTimeline } from '../../../../lib/caso-epstein/queries'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'Chronological timeline of the Epstein investigation from 2005 to 2024.',
}

export default async function CronologiaPage({ params }: PageProps) {
  const { slug } = await params
  const events = await getTimeline(CASO_EPSTEIN_SLUG)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">Timeline</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Key events in the Epstein investigation, from the first Palm Beach Police investigation to the 2024 document releases.
      </p>
      <Timeline events={events} />
    </div>
  )
}
