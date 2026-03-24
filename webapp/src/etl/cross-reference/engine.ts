/**
 * Cross-reference engine — orchestrates entity matching across all ETL sources.
 *
 * Runs three matching tiers sequentially (CUIT -> DNI/CUIL -> Name),
 * then generates investigation flags for suspicious patterns.
 */

import { readQuery } from '../../lib/neo4j/client'
import { matchByCuit, matchByDni, matchByName } from './matchers'
import type { CrossRefMatch, CrossRefResult, InvestigationFlag, FlagType } from './types'

// ---------------------------------------------------------------------------
// Flag detection
// ---------------------------------------------------------------------------

async function detectContractorDonorFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (c:Contractor)-[:SAME_ENTITY]-(co:Company)-[:OFFICER_OF_COMPANY]-(o:CompanyOfficer)-[:MAYBE_SAME_AS]-(p:Politician)-[:MAYBE_SAME_AS]-(d:Donor)
     RETURN DISTINCT c.contractor_id AS entity_id, c.name AS entity_name,
            co.name AS company_name, p.name AS politician_name, d.name AS donor_name`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      company_name: r.get('company_name') as string,
      politician_name: r.get('politician_name') as string,
      donor_name: r.get('donor_name') as string,
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'contractor_donor' as FlagType,
    evidence: `Contractor "${r.entity_name}" linked to company "${r.company_name}" whose officer is connected to politician "${r.politician_name}" who received donations from "${r.donor_name}"`,
    confidence: 0.85,
  }))
}

async function detectContractorOffshoreFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (c:Contractor)-[:SAME_ENTITY]-(co:Company)-[:OFFICER_OF_COMPANY]-(o:CompanyOfficer)-[:MAYBE_SAME_AS]-(off:OffshoreOfficer)
     RETURN DISTINCT c.contractor_id AS entity_id, c.name AS entity_name,
            co.name AS company_name, off.name AS offshore_name`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      company_name: r.get('company_name') as string,
      offshore_name: r.get('offshore_name') as string,
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'contractor_offshore' as FlagType,
    evidence: `Contractor "${r.entity_name}" linked to company "${r.company_name}" with officer appearing in offshore records as "${r.offshore_name}"`,
    confidence: 0.8,
  }))
}

async function detectOfficerAppointmentFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    // FIX: Exclude SOE board appointments (lesson from Correo Oficial false positive).
    // When a Company is a PublicCompany with state participation, officer-government
    // overlap is structural governance, not revolving door corruption.
    `MATCH (o:CompanyOfficer)-[:SAME_ENTITY]-(ga:GovernmentAppointment)
     OPTIONAL MATCH (o)-[:OFFICER_OF_COMPANY]->(co)
     WHERE co IS NULL OR NOT co:PublicCompany
     WITH o, ga, co
     WHERE co IS NOT NULL
     RETURN DISTINCT o.officer_id AS entity_id, o.name AS entity_name,
            ga.cargo AS cargo, ga.jurisdiccion AS jurisdiccion,
            co.name AS company_name`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      cargo: r.get('cargo') as string,
      jurisdiccion: r.get('jurisdiccion') as string,
      company_name: r.get('company_name') as string,
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'officer_appointment' as FlagType,
    evidence: `Company officer "${r.entity_name}" (${r.company_name}) also holds government appointment "${r.cargo}" in "${r.jurisdiccion}"`,
    confidence: 0.9,
  }))
}

async function detectRepeatWinnerFlags(): Promise<InvestigationFlag[]> {
  // Flag contractors with disproportionate contract counts (top 1% or >= 50 contracts)
  const result = await readQuery(
    `MATCH (c:Contractor)<-[:AWARDED_TO]-(pc:PublicContract)
     WITH c, count(pc) AS contractCount
     WHERE contractCount >= 50
     RETURN c.contractor_id AS entity_id, c.name AS entity_name, contractCount
     ORDER BY contractCount DESC`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      contractCount: (r.get('contractCount') as { toNumber(): number }).toNumber(),
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'repeat_winner' as FlagType,
    evidence: `Contractor "${r.entity_name}" won ${r.contractCount} public contracts`,
    confidence: 0.7,
  }))
}

async function detectShellCompanyFlags(): Promise<InvestigationFlag[]> {
  // FIX: Shell company heuristic has 80-90% false positive rate (Wave 23).
  // Most 0-1 officer companies are legitimate firms with incomplete IGJ data.
  // Only flag companies with ZERO officers AND active contracts to reduce noise.
  // Also exclude PublicCompany nodes (state enterprises) and filter out
  // professional sindicas (officers on 100+ companies are compliance providers).
  const result = await readQuery(
    `MATCH (co:Company)-[:SAME_ENTITY]-(c:Contractor)
     WHERE NOT co:PublicCompany
     OPTIONAL MATCH (co)<-[:OFFICER_OF_COMPANY]-(o:CompanyOfficer)
     WHERE NOT EXISTS {
       MATCH (o)-[:OFFICER_OF_COMPANY]->(other:Company)
       WITH count(other) AS total WHERE total > 100
     }
     WITH co, c, count(o) AS officerCount
     WHERE officerCount = 0
     OPTIONAL MATCH (c)<-[:AWARDED_TO]-(pc:PublicContract)
     WITH co, c, officerCount, count(pc) AS contracts
     WHERE contracts > 0
     RETURN co.igj_id AS entity_id, co.name AS entity_name,
            c.name AS contractor_name, officerCount, contracts`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      contractor_name: r.get('contractor_name') as string,
      officerCount: (r.get('officerCount') as { toNumber(): number }).toNumber(),
      contracts: (r.get('contracts') as { toNumber(): number }).toNumber(),
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'shell_company' as FlagType,
    evidence: `Company "${r.entity_name}" has ZERO registered officers but receives ${r.contracts} government contracts as "${r.contractor_name}" (note: 80-90% of 0-1 officer flags are data artifacts — verify independently)`,
    confidence: 0.4, // Lowered from 0.65 to reflect high false positive rate
  }))
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export async function runCrossReference(): Promise<CrossRefResult> {
  const start = Date.now()

  // Phase 1: CUIT matching
  const cuitMatches = await matchByCuit()

  // Phase 2: DNI/CUIL matching
  const dniMatches = await matchByDni()

  // Phase 3: Name matching (only unmatched entities)
  const alreadyMatchedIds = new Set<string>()
  for (const m of cuitMatches) {
    alreadyMatchedIds.add(m.source_id)
    alreadyMatchedIds.add(m.target_id)
  }
  for (const m of dniMatches) {
    alreadyMatchedIds.add(m.source_id)
    alreadyMatchedIds.add(m.target_id)
  }
  const nameMatches = await matchByName(alreadyMatchedIds)

  // Phase 4: Flag detection (runs against SAME_ENTITY rels already in graph)
  const flagResults = await Promise.all([
    detectContractorDonorFlags(),
    detectContractorOffshoreFlags(),
    detectOfficerAppointmentFlags(),
    detectRepeatWinnerFlags(),
    detectShellCompanyFlags(),
  ])
  const flags = flagResults.flat()

  return {
    cuitMatches,
    dniMatches,
    nameMatches,
    flags,
    durationMs: Date.now() - start,
  }
}
