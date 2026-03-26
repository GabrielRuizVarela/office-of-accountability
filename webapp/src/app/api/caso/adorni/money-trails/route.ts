/**
 * GET /api/caso/adorni/money-trails
 *
 * Returns money trail query results from Neo4j for the Adorni investigation.
 * Each trail crosses multiple data sources via the graph.
 */

import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'

export const dynamic = 'force-dynamic'

// Trail 1: Contracts to Adorni-network entities
const TRAIL_1 = `
  MATCH (p:Person {caso_slug: 'caso-adorni'})-[:ASSOCIATE_OF|OFFICER_OF_COMPANY*1..2]-(c:Company)
        -[:SAME_ENTITY]-(ct:Contractor)-[:AWARDED_TO]-(pc:PublicContract)
  WHERE pc.monto IS NOT NULL
  WITH p.name AS person, ct.name AS contractor, sum(pc.monto) AS total, count(pc) AS contracts
  ORDER BY total DESC LIMIT 20
  RETURN person, contractor, total, contracts
`

// Trail 2: Campaign donations from network entities
const TRAIL_2 = `
  MATCH (p:Person {caso_slug: 'caso-adorni'})-[:ASSOCIATE_OF*1..2]-(d:Donor)-[dt:DONATED_TO]->(pf:PoliticalPartyFinance)
  WITH p.name AS person, d.name AS donor, sum(dt.amount) AS donated, collect(DISTINCT pf.name) AS parties
  ORDER BY donated DESC LIMIT 20
  RETURN person, donor, donated, parties
`

// Trail 3: Asset declaration changes over time
const TRAIL_3 = `
  MATCH (p:Person {caso_slug: 'caso-adorni'})-[:SAME_ENTITY]-(ad:AssetDeclaration)
  RETURN p.name AS person, ad.year AS year, ad.patrimonio_neto AS net_worth,
         ad.cargo AS position
  ORDER BY ad.year
`

// Trail 4: Government advertising (pauta oficial) distribution
const TRAIL_4 = `
  MATCH (mo:MediaOutlet {caso_slug: 'caso-adorni'})-[r:ADVERTISING_CONTRACT]->(ga)
  RETURN mo.name AS media_outlet, r.amount AS amount, r.year AS year
  ORDER BY r.amount DESC LIMIT 20
`

// Trail 5: Cross-investigation money matches
const TRAIL_5 = `
  MATCH (a {caso_slug: 'caso-adorni'})-[:SAME_ENTITY]-(b)
  WHERE b.caso_slug <> 'caso-adorni'
  MATCH (b)-[:AWARDED_TO|DONATED_TO|FUNDED_BY]-(target)
  RETURN a.name AS adorni_entity, b.name AS matched_entity,
         b.caso_slug AS source_case, target.name AS connected_to,
         labels(target)[0] AS connected_type
  LIMIT 30
`

interface TrailResult {
  id: string
  name_es: string
  name_en: string
  data: Record<string, unknown>[]
}

async function runTrail(
  id: string,
  nameEs: string,
  nameEn: string,
  cypher: string,
): Promise<TrailResult> {
  try {
    const result = await readQuery(
      cypher,
      {},
      (record: Neo4jRecord) => record.toObject() as Record<string, unknown>,
    )
    return {
      id,
      name_es: nameEs,
      name_en: nameEn,
      data: [...result.records],
    }
  } catch {
    return { id, name_es: nameEs, name_en: nameEn, data: [] }
  }
}

export async function GET() {
  try {
    const trails = await Promise.all([
      runTrail(
        'network-contracts',
        'Contratos a entidades de la red',
        'Contracts to network entities',
        TRAIL_1,
      ),
      runTrail(
        'campaign-donations',
        'Donaciones de campana desde la red',
        'Campaign donations from network',
        TRAIL_2,
      ),
      runTrail(
        'asset-declarations',
        'Evolucion patrimonial',
        'Asset declaration changes',
        TRAIL_3,
      ),
      runTrail(
        'pauta-oficial',
        'Distribucion de pauta oficial',
        'Government advertising distribution',
        TRAIL_4,
      ),
      runTrail(
        'cross-investigation',
        'Cruces con otras investigaciones',
        'Cross-investigation matches',
        TRAIL_5,
      ),
    ])

    return Response.json({ success: true, trails })
  } catch (error) {
    console.error('[adorni/money-trails] Error:', error)
    return Response.json(
      { success: false, trails: [], error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
