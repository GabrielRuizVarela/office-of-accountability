import { getDriver } from '@/lib/neo4j/client'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ signalId: string }> },
) {
  const { signalId } = await params
  const driver = getDriver()
  const session = driver.session({ defaultAccessMode: 'READ' })

  try {
    const result = await session.run(
      `MATCH (s:NuclearSignal {id: $id})
       OPTIONAL MATCH (s)-[:INVOLVES]->(a:NuclearActor)
       RETURN s, collect(DISTINCT {id: a.id, name: a.name, type: 'NuclearActor'}) AS actors`,
      { id: signalId },
    )

    if (result.records.length === 0) {
      return Response.json({ error: 'Signal not found' }, { status: 404 })
    }

    const record = result.records[0]
    const props = record.get('s').properties
    const actors = (record.get('actors') as { id: string; name: string; type: string }[])
      .filter((a) => a.id != null)

    return Response.json({
      document: props,
      mentionedEntities: actors,
    })
  } catch {
    return Response.json({ error: 'Failed to load signal' }, { status: 500 })
  } finally {
    await session.close()
  }
}
