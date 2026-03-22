/**
 * Timeline page — events ordered chronologically for any investigation.
 */

import { getQueryBuilder } from '@/lib/investigations/query-builder'

import { CronologiaContent } from './CronologiaContent'

export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const events = await getQueryBuilder().getTimeline(slug)

  return <CronologiaContent events={events} />
}
