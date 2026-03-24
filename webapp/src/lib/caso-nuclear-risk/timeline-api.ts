/**
 * Nuclear risk timeline — fetches signals ordered by date for the timeline view.
 */

import { getDriver } from '../neo4j/client'
import neo4j from 'neo4j-driver-lite'

interface TimelineItem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly date: string
  readonly event_type: string
  readonly source_url: string | null
  readonly actors: readonly { readonly id: string; readonly name: string }[]
}

/**
 * Get nuclear signals as timeline events, ordered by date descending.
 */
export async function getNuclearTimeline(): Promise<TimelineItem[]> {
  const driver = getDriver()
  const session = driver.session({ defaultAccessMode: 'READ' })

  try {
    const result = await session.run(
      `MATCH (s:NuclearSignal)
       WHERE s.date IS NOT NULL
       OPTIONAL MATCH (s)-[:INVOLVES]->(a:NuclearActor)
       WITH s, collect(DISTINCT {id: a.id, name: a.name}) AS actors
       RETURN s, actors
       ORDER BY s.date DESC
       LIMIT $limit`,
      { limit: neo4j.int(200) },
    )

    return result.records.map((record) => {
      const props = record.get('s').properties
      const actors = (record.get('actors') as { id: string; name: string }[])
        .filter((a) => a.id != null)

      // Map signal_type or escalation_level to event_type for the Timeline component
      const escalation = props.escalation_level as string ?? 'routine'
      const eventType = escalation === 'critical' || escalation === 'serious'
        ? 'legal'  // red in the timeline
        : escalation === 'elevated'
          ? 'financial' // green
          : escalation === 'notable'
            ? 'media' // purple
            : 'political' // blue

      return {
        id: props.id as string,
        title: (props.title_en as string) ?? '',
        description: (props.summary_en as string) ?? '',
        date: (props.date as string) ?? '',
        event_type: eventType,
        source_url: (props.source_url as string) ?? null,
        actors,
      }
    })
  } finally {
    await session.close()
  }
}
