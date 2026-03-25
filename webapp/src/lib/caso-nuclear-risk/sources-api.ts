/**
 * Nuclear risk sources — returns signals as "documents" for the evidencia page.
 */

import { getDriver } from '../neo4j/client'
import neo4j from 'neo4j-driver-lite'

/**
 * Get nuclear signals formatted as document-like objects for the EvidenciaContent component.
 */
export async function getNuclearSources(): Promise<Record<string, unknown>[]> {
  const driver = getDriver()
  const session = driver.session({ defaultAccessMode: 'READ' })

  try {
    const result = await session.run(
      `MATCH (s:NuclearSignal)
       WHERE s.date IS NOT NULL
       RETURN s
       ORDER BY s.date DESC
       LIMIT $limit`,
      { limit: neo4j.int(200) },
    )

    return result.records.map((record) => {
      const props = record.get('s').properties

      return {
        id: props.id,
        title: props.title_en ?? '',
        slug: props.id,
        doc_type: props.signal_type ?? 'signal',
        source_url: props.source_url ?? '',
        summary: props.summary_en ?? '',
        date_published: props.date ?? '',
        tier: props.tier ?? 'bronze',
        severity: props.severity,
        escalation_level: props.escalation_level,
        theater: props.theater,
        source_module: props.source_module,
      }
    })
  } finally {
    await session.close()
  }
}
