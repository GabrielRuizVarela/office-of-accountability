/**
 * Timeline page — routes to case-specific content based on slug.
 */

import { getTimeline } from '@/lib/caso-libra'

import { CronologiaContent } from './CronologiaContent'
import { EpsteinCronologiaContent } from './EpsteinCronologiaContent'

export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === 'caso-epstein') {
    return <EpsteinCronologiaContent slug={slug} />
  }

  const events = await getTimeline()

  return <CronologiaContent events={events} />
}
