/**
 * Entity Resolution: Donor <-> CompanyOfficer
 *
 * Match strategy: Extract DNI from donor CUIT (positions 2-10) and match against
 * CompanyOfficer.document_number. This is more reliable than name matching since
 * donors use "First Last" format while officers use "LAST FIRST" or "LAST, First".
 *
 * Money trail: Donor -> MAYBE_SAME_AS -> CompanyOfficer -> OFFICER_OF_COMPANY -> Company
 *   -> SAME_ENTITY -> Contractor -> AWARDED_TO -> PublicContract
 */
import neo4j from 'neo4j-driver-lite'

const URI = process.env.NEO4J_URI || 'bolt://localhost:7687'
const USER = process.env.NEO4J_USER || 'neo4j'
const PASS = process.env.NEO4J_PASSWORD || ''

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASS))

async function run(cypher: string, params: Record<string, unknown> = {}) {
  const session = driver.session()
  try {
    return await session.run(cypher, params, { timeout: 120_000 })
  } finally {
    await session.close()
  }
}

async function main() {
  await driver.verifyConnectivity()
  console.log('Connected to Neo4j\n')

  // ── Phase 1: Match donors to company officers via CUIT->DNI ──
  console.log('=== Phase 1: CUIT-to-DNI matches (Donor <-> CompanyOfficer) ===\n')

  const phase1 = await run(`
    MATCH (d:Donor)
    WHERE d.cuit IS NOT NULL AND size(d.cuit) = 11
    WITH d, substring(d.cuit, 2, 8) AS dni
    WITH d, dni,
      CASE WHEN left(dni, 1) = '0' THEN substring(dni, 1) ELSE dni END AS dni_trimmed
    MATCH (co:CompanyOfficer)
    WHERE co.document_number = dni OR co.document_number = dni_trimmed
    RETURN DISTINCT d.name AS donor, d.cuit AS cuit, dni AS extracted_dni,
      co.name AS officer, co.document_number AS doc
    ORDER BY d.name
  `)

  // Deduplicate by donor name (one donor may match multiple officer records)
  const matchMap = new Map<string, { cuit: string; dni: string; officers: string[] }>()

  for (const rec of phase1.records) {
    const donor = rec.get('donor') as string
    const cuit = rec.get('cuit') as string
    const dni = rec.get('extracted_dni') as string
    const officer = rec.get('officer') as string

    if (!matchMap.has(donor)) {
      matchMap.set(donor, { cuit, dni, officers: [] })
    }
    matchMap.get(donor)!.officers.push(officer)
  }

  console.log(`  Found ${matchMap.size} unique donor-officer matches\n`)

  for (const [donor, info] of matchMap) {
    console.log(`  MATCH: ${donor} (CUIT: ${info.cuit}, DNI: ${info.dni})`)
    for (const off of info.officers.slice(0, 3)) {
      console.log(`         -> officer: ${off}`)
    }
    if (info.officers.length > 3) {
      console.log(`         ... and ${info.officers.length - 3} more officer records`)
    }
  }
  console.log()

  const matchedNames = [...matchMap.keys()]

  // ── Phase 2: Trace the full money trail for each match ──
  console.log('=== Phase 2: Full money trail ===\n')

  let trailsWithContracts = 0
  let totalContractValue = 0
  let totalDonationValue = 0

  for (const name of matchedNames) {
    const info = matchMap.get(name)!
    const dni = info.dni
    const dniTrimmed = dni.startsWith('0') ? dni.substring(1) : dni

    const trail = await run(`
      MATCH (d:Donor {name: $name})-[dt:DONATED_TO]->(pf:PoliticalPartyFinance)
      WITH d, pf, dt.amount AS amount
      MATCH (co:CompanyOfficer)-[:OFFICER_OF_COMPANY]->(c:Company)
      WHERE co.document_number = $dni OR co.document_number = $dniTrimmed
      OPTIONAL MATCH (c)-[:SAME_ENTITY]-(ct:Contractor)-[:AWARDED_TO]-(pc:PublicContract)
      RETURN d.name AS donor, pf.name AS party, amount,
        c.name AS company, co.name AS officer, co.role AS role,
        ct.name AS contractor, pc.monto AS contract_value, pc.description AS contract_desc
    `, { name, dni, dniTrimmed })

    if (trail.records.length === 0) {
      // Try just checking if they are officers of companies
      const offOnly = await run(`
        MATCH (co:CompanyOfficer)-[:OFFICER_OF_COMPANY]->(c:Company)
        WHERE co.document_number = $dni OR co.document_number = $dniTrimmed
        RETURN co.name AS officer, co.role AS role, c.name AS company
        LIMIT 10
      `, { dni, dniTrimmed })

      if (offOnly.records.length > 0) {
        console.log(`  ${name} (no donation records, but officer of):`)
        for (const rec of offOnly.records) {
          console.log(`    Company: ${rec.get('company')} [${rec.get('role') || 'unknown role'}]`)
        }
        console.log()
      } else {
        console.log(`  ${name}: officer match but no company relationship found\n`)
      }
      continue
    }

    // Aggregate
    const companies = new Map<string, Set<string>>() // company -> roles
    const contractors = new Set<string>()
    const parties = new Map<string, number>() // party -> total donated
    let contractTotal = 0

    for (const rec of trail.records) {
      const party = rec.get('party') as string | null
      const amt = rec.get('amount')
      if (party) {
        const n = amt != null
          ? (typeof amt === 'object' && 'toNumber' in amt ? (amt as any).toNumber() : Number(amt))
          : 0
        parties.set(party, (parties.get(party) || 0) + (isNaN(n) ? 0 : n))
      }

      const company = rec.get('company') as string | null
      const role = (rec.get('role') as string | null) || 'unknown'
      if (company) {
        if (!companies.has(company)) companies.set(company, new Set())
        companies.get(company)!.add(role)
      }

      const contractor = rec.get('contractor') as string | null
      if (contractor) contractors.add(contractor)

      const cv = rec.get('contract_value')
      if (cv != null) {
        const n = typeof cv === 'object' && 'toNumber' in cv ? (cv as any).toNumber() : Number(cv)
        if (!isNaN(n)) contractTotal += n
      }
    }

    const hasContracts = contractors.size > 0
    if (hasContracts) trailsWithContracts++
    totalContractValue += contractTotal

    let donorDonationTotal = 0
    for (const v of parties.values()) donorDonationTotal += v
    totalDonationValue += donorDonationTotal

    console.log(`  ${name} (DNI: ${dni})`)
    for (const [party, amt] of parties) {
      console.log(`    Donated $${amt.toLocaleString('es-AR')} to: ${party}`)
    }
    for (const [company, roles] of companies) {
      console.log(`    Officer of: ${company} [${[...roles].join(', ')}]`)
    }
    if (hasContracts) {
      console.log(`    >>> CONTRACTORS: ${[...contractors].join(', ')}`)
      console.log(`    >>> CONTRACT VALUE: $${contractTotal.toLocaleString('es-AR')}`)
    }
    console.log()
  }

  // ── Phase 3: Create MAYBE_SAME_AS links ──
  console.log('=== Phase 3: Creating MAYBE_SAME_AS links ===\n')

  const phase3 = await run(`
    MATCH (d:Donor)
    WHERE d.cuit IS NOT NULL AND size(d.cuit) = 11
    WITH d, substring(d.cuit, 2, 8) AS dni
    WITH d, dni,
      CASE WHEN left(dni, 1) = '0' THEN substring(dni, 1) ELSE dni END AS dni_trimmed
    MATCH (co:CompanyOfficer)
    WHERE co.document_number = dni OR co.document_number = dni_trimmed
    MERGE (d)-[r:MAYBE_SAME_AS {
      match_type: "cuit_dni",
      confidence: 0.95,
      source: "donor-officer-resolution",
      donor_cuit: d.cuit,
      officer_doc: co.document_number
    }]->(co)
    RETURN count(r) AS links_created
  `)

  const linksCreated = phase3.records[0]?.get('links_created')
  const linkCount = typeof linksCreated === 'object' && 'toNumber' in linksCreated
    ? (linksCreated as any).toNumber()
    : Number(linksCreated ?? 0)

  console.log(`  -> ${linkCount} MAYBE_SAME_AS links created/verified\n`)

  // ── Phase 4: Summary report ──
  console.log('============================================')
  console.log('  MONEY TRAIL REPORT: Donor <-> Officer')
  console.log('============================================\n')
  console.log(`  Donor-Officer matches (CUIT/DNI):  ${matchMap.size}`)
  console.log(`  Matches with contractor trail:     ${trailsWithContracts}`)
  console.log(`  Total donations from matched:      $${totalDonationValue.toLocaleString('es-AR')}`)
  console.log(`  Total contract value via donors:   $${totalContractValue.toLocaleString('es-AR')}`)
  console.log(`  MAYBE_SAME_AS links created:       ${linkCount}`)
  console.log()

  // Verification
  const verify = await run(`
    MATCH (:Donor)-[r:MAYBE_SAME_AS]->(:CompanyOfficer)
    RETURN count(r) AS total_links
  `)
  const totalLinks = verify.records[0]?.get('total_links')
  const tl = typeof totalLinks === 'object' && 'toNumber' in totalLinks
    ? (totalLinks as any).toNumber()
    : Number(totalLinks ?? 0)
  console.log(`  Total MAYBE_SAME_AS links in DB:   ${tl}\n`)

  // Full path count
  const fullPath = await run(`
    MATCH (d:Donor)-[:MAYBE_SAME_AS]->(co:CompanyOfficer)-[:OFFICER_OF_COMPANY]->(c:Company)
    OPTIONAL MATCH (c)-[:SAME_ENTITY]-(ct:Contractor)-[:AWARDED_TO]-(pc:PublicContract)
    WITH d, co, c, ct, pc
    RETURN count(DISTINCT d) AS donors_with_companies,
      count(DISTINCT ct) AS linked_contractors,
      count(DISTINCT pc) AS linked_contracts
  `)
  if (fullPath.records.length > 0) {
    const rec = fullPath.records[0]
    const dwc = rec.get('donors_with_companies')
    const lct = rec.get('linked_contractors')
    const lpc = rec.get('linked_contracts')
    console.log(`  Donors with company links:         ${typeof dwc === 'object' ? (dwc as any).toNumber() : dwc}`)
    console.log(`  Linked contractors:                 ${typeof lct === 'object' ? (lct as any).toNumber() : lct}`)
    console.log(`  Linked public contracts:            ${typeof lpc === 'object' ? (lpc as any).toNumber() : lpc}`)
  }
  console.log()

  await driver.close()
}

main().catch((err) => {
  console.error('Entity resolution failed:', err)
  driver.close().then(() => process.exit(1))
})
