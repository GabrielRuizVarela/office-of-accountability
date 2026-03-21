/**
 * GET /api/caso/finanzas-politicas/money-trails
 *
 * Returns all 7 money trail query results from Neo4j.
 * Each trail crosses multiple data sources via the graph.
 */

import { readQuery } from '@/lib/neo4j/client'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

export const dynamic = 'force-dynamic'

// Trail 1: Campaign Donations → Politicians → Votes
const TRAIL_1 = `
  MATCH (p:Politician)-[:IS_DONOR]->(d:Donor)-[dt:DONATED_TO]->(pf:PoliticalPartyFinance)
  WHERE dt.amount > 50000
  WITH p, sum(dt.amount) AS donated, collect(DISTINCT pf.name) AS parties
  ORDER BY donated DESC LIMIT 20
  RETURN p.name AS politician, donated, parties
`

// Trail 2: Government Contracts → Companies → Owners
const TRAIL_2 = `
  MATCH (ct:Contractor)-[:AWARDED_TO]-(pc:PublicContract)
  WHERE pc.monto IS NOT NULL
  WITH ct, sum(pc.monto) AS total, count(pc) AS contracts
  ORDER BY total DESC LIMIT 20
  RETURN ct.name AS contractor, ct.cuit AS cuit, total, contracts
`

// Trail 3: Donor → Officer → Company → Contractor (the cross-trail)
const TRAIL_3 = `
  MATCH (d:Donor)-[:MAYBE_SAME_AS {source: "donor-officer-resolution"}]->(co:CompanyOfficer)
        -[:OFFICER_OF_COMPANY]->(c:Company)-[:SAME_ENTITY]-(ct:Contractor)
        -[:AWARDED_TO]-(pc:PublicContract)
  WHERE pc.monto IS NOT NULL
  WITH d.name AS donor, ct.name AS contractor, sum(pc.monto) AS contracts_value,
       count(pc) AS contract_count
  ORDER BY contracts_value DESC LIMIT 15
  OPTIONAL MATCH (d2:Donor {name: donor})-[dt:DONATED_TO]->(pf:PoliticalPartyFinance)
  RETURN donor, contractor, contracts_value, contract_count,
         collect(DISTINCT pf.name) AS parties, sum(dt.amount) AS donated
`

// Trail 4: Investigation persons with offshore connections
const TRAIL_4 = `
  MATCH (p:Person {caso_slug: "caso-finanzas-politicas"})-[:MAYBE_SAME_AS]-(off)
  WHERE "OffshoreOfficer" IN labels(off)
  OPTIONAL MATCH (off)-[:OFFICER_OF]->(entity:OffshoreEntity)
  RETURN p.name AS person, off.name AS offshore_officer,
         collect(DISTINCT {name: entity.name, jurisdiction: entity.jurisdiction_description}) AS entities
`

// Trail 5: BCRA debtor status for investigation orgs (via CUIT)
const TRAIL_5 = `
  MATCH (o:Organization {caso_slug: "caso-finanzas-politicas"})
  OPTIONAL MATCH (ct:Contractor) WHERE ct.name CONTAINS o.name AND ct.cuit IS NOT NULL
  WHERE ct IS NOT NULL
  RETURN DISTINCT o.name AS org, ct.cuit AS cuit
  LIMIT 20
`

// Trail 6: Revolving door — persons with both govt appointments AND company roles
const TRAIL_6 = `
  MATCH (co:CompanyOfficer)-[:OFFICER_OF_COMPANY]->(c:Company)
  MATCH (ga:GovernmentAppointment)
  WHERE co.document_number IS NOT NULL AND ga.dni IS NOT NULL
    AND co.document_number = ga.dni
  WITH co.name AS person, co.document_number AS dni,
       collect(DISTINCT c.name)[..3] AS companies,
       collect(DISTINCT ga.cargo)[..2] AS govt_roles
  RETURN person, dni, companies, govt_roles
  ORDER BY size(companies) DESC
  LIMIT 20
`

// Trail 7: Investigation graph — key paths
const TRAIL_7 = `
  MATCH (p:Person {caso_slug: "caso-finanzas-politicas"})-[r]-()
  WITH p, count(r) AS degree
  ORDER BY degree DESC LIMIT 15
  RETURN p.name AS person, degree,
         p.description_en AS description
`

interface TrailResult {
  id: string
  name_en: string
  name_es: string
  data: Record<string, unknown>[]
}

export async function GET(): Promise<Response> {
  try {
    const trails: TrailResult[] = []

    // Run trails in parallel where possible
    const [r1, r2, r3, r4, r5, r6, r7] = await Promise.allSettled([
      readQuery(TRAIL_1, {}, (r: Neo4jRecord) => r.toObject()),
      readQuery(TRAIL_2, {}, (r: Neo4jRecord) => r.toObject()),
      readQuery(TRAIL_3, {}, (r: Neo4jRecord) => r.toObject()),
      readQuery(TRAIL_4, {}, (r: Neo4jRecord) => r.toObject()),
      readQuery(TRAIL_5, {}, (r: Neo4jRecord) => r.toObject()),
      readQuery(TRAIL_6, {}, (r: Neo4jRecord) => r.toObject()),
      readQuery(TRAIL_7, {}, (r: Neo4jRecord) => r.toObject()),
    ])

    const extract = (r: PromiseSettledResult<{ records: Record<string, unknown>[] }>) =>
      r.status === 'fulfilled' ? r.value.records : []

    trails.push(
      { id: 'donations-politicians', name_en: 'Campaign Donations → Politicians', name_es: 'Donaciones → Politicos', data: extract(r1) },
      { id: 'contracts-companies', name_en: 'Contracts → Companies', name_es: 'Contratos → Empresas', data: extract(r2) },
      { id: 'donor-officer-contractor', name_en: 'Donor → Officer → Contractor', name_es: 'Donante → Directivo → Contratista', data: extract(r3) },
      { id: 'offshore-connections', name_en: 'Offshore Connections', name_es: 'Conexiones Offshore', data: extract(r4) },
      { id: 'investigation-cuits', name_en: 'Investigation CUITs', name_es: 'CUITs de Investigacion', data: extract(r5) },
      { id: 'revolving-door', name_en: 'Revolving Door', name_es: 'Puerta Giratoria', data: extract(r6) },
      { id: 'key-persons', name_en: 'Key Investigation Persons', name_es: 'Personas Clave', data: extract(r7) },
    )

    return Response.json({
      success: true,
      trails,
      meta: {
        trailCount: trails.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
