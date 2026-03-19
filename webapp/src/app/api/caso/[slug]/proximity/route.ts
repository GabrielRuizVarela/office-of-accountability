import { getDriver } from '../../../../../lib/neo4j/client'

const CASO_SLUG = 'caso-epstein'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (slug !== CASO_SLUG) {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const url = new URL(request.url)
  const personsParam = url.searchParams.get('persons')
  const driver = getDriver()
  const session = driver.session()

  try {
    const personsResult = await session.run(
      'MATCH (p:Person {caso_slug: $slug}) RETURN p.name AS name, p.slug AS slug ORDER BY p.name',
      { slug: CASO_SLUG },
    )

    const persons = personsResult.records.map((r) => ({
      name: String(r.get('name') ?? ''),
      slug: String(r.get('slug') ?? ''),
    }))

    if (!personsParam) {
      return Response.json({
        success: true,
        data: { coLocations: [], sharedEvents: [], sharedDocuments: [], persons },
      })
    }

    const slugs = personsParam.split(',').map((s) => s.trim()).filter((s) => /^[a-z0-9-]+$/.test(s)).slice(0, 3)

    if (slugs.length < 2) {
      return Response.json({ success: false, error: 'Need 2+ persons' }, { status: 400 })
    }

    await session.close()

    // Use separate sessions for each query
    const s1 = driver.session()
    const coLocResult = await s1.run(
      `MATCH (p1:Person)-[r1]->(loc:Location)<-[r2]-(p2:Person)
       WHERE p1.slug IN $slugs AND p2.slug IN $slugs AND p1.slug < p2.slug
         AND (type(r1) = 'VISITED' OR type(r1) = 'OWNED')
         AND (type(r2) = 'VISITED' OR type(r2) = 'OWNED')
       RETURN p1.name AS person1, p2.name AS person2, loc.name AS location,
              r1.description AS visit1, r2.description AS visit2`,
      { slugs },
    )
    await s1.close()

    const s2 = driver.session()
    const eventsResult = await s2.run(
      `MATCH (p1:Person)-[:PARTICIPATED_IN]->(evt:Event)<-[:PARTICIPATED_IN]-(p2:Person)
       WHERE p1.slug IN $slugs AND p2.slug IN $slugs AND p1.slug < p2.slug
       RETURN p1.name AS person1, p2.name AS person2, evt.title AS event, evt.date AS date, evt.event_type AS type
       ORDER BY evt.date`,
      { slugs },
    )
    await s2.close()

    const s3 = driver.session()
    const docsResult = await s3.run(
      `MATCH (p1:Person)-[:MENTIONED_IN]->(doc:Document)<-[:MENTIONED_IN]-(p2:Person)
       WHERE p1.slug IN $slugs AND p2.slug IN $slugs AND p1.slug < p2.slug
       RETURN p1.name AS person1, p2.name AS person2, doc.title AS document, doc.doc_type AS type`,
      { slugs },
    )
    await s3.close()

    const str = (r: typeof coLocResult.records[0], key: string) => String(r.get(key) ?? '')

    return Response.json({
      success: true,
      data: {
        coLocations: coLocResult.records.map((r) => ({
          person1: str(r, 'person1'), person2: str(r, 'person2'),
          location: str(r, 'location'), visit1: str(r, 'visit1'), visit2: str(r, 'visit2'),
        })),
        sharedEvents: eventsResult.records.map((r) => ({
          person1: str(r, 'person1'), person2: str(r, 'person2'),
          event: str(r, 'event'), date: str(r, 'date'), type: str(r, 'type'),
        })),
        sharedDocuments: docsResult.records.map((r) => ({
          person1: str(r, 'person1'), person2: str(r, 'person2'),
          document: str(r, 'document'), type: str(r, 'type'),
        })),
        persons,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[proximity]', msg)
    if (msg.includes('connect') || msg.includes('ECONNREFUSED')) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    return Response.json({ success: false, error: msg }, { status: 500 })
  } finally {
    try { await session.close() } catch { /* already closed */ }
  }
}
