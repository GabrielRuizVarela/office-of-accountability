/**
 * Timeline page — routes to correct data source based on investigation slug.
 */

import { getTimeline } from '@/lib/caso-libra'
import { getNuclearTimeline } from '@/lib/caso-nuclear-risk/timeline-api'

import { CronologiaContent } from './CronologiaContent'

export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === 'riesgo-nuclear') {
    const events = await getNuclearTimeline()
    return <CronologiaContent events={events} />
  }

  const events = await getTimeline()
  return <CronologiaContent events={events} />
}
