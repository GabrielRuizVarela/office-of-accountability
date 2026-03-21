/**
 * Investigation timeline page — events ordered chronologically.
 */

import { getQueryBuilder } from '@/lib/investigations/query-builder'

import { CronologiaContent } from './CronologiaContent'

export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const qb = getQueryBuilder()
  const events = await qb.getTimeline(slug)

  return <CronologiaContent events={events} />
}
