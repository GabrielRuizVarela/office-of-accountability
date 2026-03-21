/**
 * Caso Libra timeline page — events ordered chronologically.
 */

import { getTimeline } from '@/lib/caso-libra'

import { CronologiaContent } from './CronologiaContent'

export default async function CronologiaPage() {
  const events = await getTimeline()

  return <CronologiaContent events={events} />
}
