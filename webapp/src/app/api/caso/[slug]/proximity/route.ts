import { type Record as Neo4jRecord } from 'neo4j-driver-lite'

import { NextRequest } from 'next/server'

import { getDriver } from '../../../../../lib/neo4j/client'
import { CASO_EPSTEIN_SLUG } from '../../../../../lib/caso-epstein/types'

/** Maximum query execution time in milliseconds */
const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

/** Maximum number of person slugs allowed in a single query */
const MAX_PERSONS = 3

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (slug !== CASO_EPSTEIN_SLUG) {
    return Response.json(
      { success: false, error: 'Investigation not found' },
      { status: 404 },
    )
  }

  const personsParam = request.nextUrl.searchParams.get('persons')

  // Always fetch available persons for the selector
  const session = getDriver().session()

  try {
    const personsResult = await session.run(
      `MATCH (p:Person {caso_slug: $casoSlug})
       RETURN p.name AS name, p.slug AS slug
       ORDER BY p.name`,
      { casoSlug: CASO_EPSTEIN_SLUG },
      TX_CONFIG,
    )

    const persons = personsResult.records.map((r: Neo4jRecord) => ({
      name: asString(r.get('name')),
      slug: asString(r.get('slug')),
    }))

    // If no persons selected, return empty results with the person list
    if (!personsParam) {
      return Response.json({
        success: true,
        data: {
          coLocations: [],
          sharedEvents: [],
          sharedDocuments: [],
          persons,
        },
      })
    }

    // Validate and limit slugs
    const slugs = personsParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^[a-z0-9-]+$/.test(s))
      .slice(0, MAX_PERSONS)

    if (slugs.length < 2) {
      return Response.json(
        { success: false, error: 'At least 2 person slugs are required' },
        { status: 400 },
      )
    }

    // Run all three queries in parallel
    const [coLocResult, eventsResult, docsResult] = await Promise.all([
      session.run(
        `MATCH (p1:Person)-[r1:VISITED|OWNED]->(loc:Location)<-[r2:VISITED|OWNED]-(p2:Person)
         WHERE p1.slug IN $slugs AND p2.slug IN $slugs AND p1.slug < p2.slug
         RETURN p1.name AS person1, p1.slug AS slug1, p2.name AS person2, p2.slug AS slug2,
                loc.name AS location, loc.slug AS loc_slug, loc.coordinates AS coordinates,
                r1.description AS visit1_desc, r2.description AS visit2_desc
         ORDER BY loc.name`,
        { slugs },
        TX_CONFIG,
      ),
      session.run(
        `MATCH (p1:Person)-[:PARTICIPATED_IN]->(evt:Event)<-[:PARTICIPATED_IN]-(p2:Person)
         WHERE p1.slug IN $slugs AND p2.slug IN $slugs AND p1.slug < p2.slug
         RETURN p1.name AS person1, p2.name AS person2, evt.title AS event, evt.date AS date, evt.event_type AS type
         ORDER BY evt.date`,
        { slugs },
        TX_CONFIG,
      ),
      session.run(
        `MATCH (p1:Person)-[:MENTIONED_IN]->(doc:Document)<-[:MENTIONED_IN]-(p2:Person)
         WHERE p1.slug IN $slugs AND p2.slug IN $slugs AND p1.slug < p2.slug
         RETURN p1.name AS person1, p2.name AS person2, doc.title AS document, doc.doc_type AS type
         ORDER BY doc.title`,
        { slugs },
        TX_CONFIG,
      ),
    ])

    const coLocations = coLocResult.records.map((r: Neo4jRecord) => ({
      person1: asString(r.get('person1')),
      slug1: asString(r.get('slug1')),
      person2: asString(r.get('person2')),
      slug2: asString(r.get('slug2')),
      location: asString(r.get('location')),
      locSlug: asString(r.get('loc_slug')),
      coordinates: asString(r.get('coordinates')),
      visit1Desc: asString(r.get('visit1_desc')),
      visit2Desc: asString(r.get('visit2_desc')),
    }))

    const sharedEvents = eventsResult.records.map((r: Neo4jRecord) => ({
      person1: asString(r.get('person1')),
      person2: asString(r.get('person2')),
      event: asString(r.get('event')),
      date: asString(r.get('date')),
      type: asString(r.get('type')),
    }))

    const sharedDocuments = docsResult.records.map((r: Neo4jRecord) => ({
      person1: asString(r.get('person1')),
      person2: asString(r.get('person2')),
      document: asString(r.get('document')),
      type: asString(r.get('type')),
    }))

    return Response.json({
      success: true,
      data: {
        coLocations,
        sharedEvents,
        sharedDocuments,
        persons,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to load proximity data' },
      { status: 500 },
    )
  } finally {
    await session.close()
  }
}
