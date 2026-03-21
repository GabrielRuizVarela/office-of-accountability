/**
 * Caso Libra timeline page — events ordered chronologically.
 */

import { getTimeline } from '@/lib/caso-libra'

import { CronologiaContent } from './CronologiaContent'

export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const events = await getTimeline(slug)

  return <CronologiaContent events={events} />
}
