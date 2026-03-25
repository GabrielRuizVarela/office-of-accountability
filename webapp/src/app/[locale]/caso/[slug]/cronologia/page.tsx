/**
 * Timeline page — routes to correct data source based on investigation slug.
 */

import { getTimeline } from '@/lib/caso-libra'
import { getNuclearTimeline } from '@/lib/caso-nuclear-risk'

import { CronologiaContent } from './CronologiaContent'

export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // obras-publicas has its own dedicated cronologia page
  if (slug === 'obras-publicas' || slug === 'finanzas-politicas') {
    return null
  }

  if (slug === 'riesgo-nuclear') {
    const events = await getNuclearTimeline()
    return <CronologiaContent events={events} slug={slug} />
  }

  const events = await getTimeline()
  return <CronologiaContent events={events} slug={slug} />
}
