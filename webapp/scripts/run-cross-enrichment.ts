/**
 * Cross-enrichment script - links entities across datasets.
 *
 * Finds people/organizations appearing in multiple data sources and creates
 * CROSS_REFERENCED relationships to flag high-priority investigation targets.
 *
 * Run after all ETL pipelines: Como Voto, ICIJ, CNE, OpenCorporates, Boletín Oficial.
 */

import 'dotenv/config'
import { readQuery, executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { normalizeName } from '../src/etl/como-voto/transformer'

async function main(): Promise<void> {
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // ── 1. Politicians in multiple datasets ──────────────────────────────
  console.log('=== Phase 1: Politicians in Multiple External Datasets ===')
  const multiDataset = await readQuery(`
    MATCH (p:Politician)-[r:MAYBE_SAME_AS]->(target)
    WITH p, collect(DISTINCT labels(target)[0]) AS datasets,
         collect({ type: labels(target)[0], name: CASE
           WHEN target:Donor THEN target.name
           WHEN target:OffshoreOfficer THEN target.name
           WHEN target:GovernmentAppointment THEN target.appointee_name
           WHEN target:CompanyOfficer THEN target.name
           ELSE 'unknown' END }) AS details
    WHERE size(datasets) > 1
    RETURN p.name AS name, p.id AS id, p.bloc AS party, p.province AS province,
           datasets, size(datasets) AS datasetCount, details
    ORDER BY size(datasets) DESC
  `, {}, (r) => ({
    name: r.get('name'), id: r.get('id'), party: r.get('party'),
    province: r.get('province'), datasets: r.get('datasets'),
    count: r.get('datasetCount').toNumber(), details: r.get('details'),
  }))

  console.log(`  Found ${multiDataset.records.length} politicians in 2+ datasets:\n`)
  for (const p of multiDataset.records) {
    console.log(`  ${p.name} (${p.party}, ${p.province})`)
    console.log(`    Datasets [${p.count}]: ${p.datasets.join(', ')}`)
  }

  // ── 2. Donors who are also ICIJ offshore officers ────────────────────
  console.log('\n=== Phase 2: Cross-matching Donors ↔ Offshore Officers ===')

  // Get all donors and offshore officers, match by normalized name
  const donors = await readQuery(
    'MATCH (d:Donor) RETURN d.name AS name, d.donor_id AS id',
    {}, (r) => ({ name: r.get('name') as string, id: r.get('id') as string }),
  )
  const officers = await readQuery(
    'MATCH (o:OffshoreOfficer) RETURN o.name AS name, o.icij_id AS id',
    {}, (r) => ({ name: r.get('name') as string, id: r.get('id') as string }),
  )

  // Build normalized name lookup for officers
  const officerByNorm = new Map<string, string[]>()
  for (const o of officers.records) {
    const cleanName = o.name.replace(/\s*\(\d+\)\s*/g, ' ').replace(/,?\s*as joint.*$/i, '').trim()
    const norm = normalizeName(cleanName)
    const existing = officerByNorm.get(norm) || []
    existing.push(o.id)
    officerByNorm.set(norm, existing)
  }

  // Match donors to officers
  const donorOfficerMatches: Array<{ donorId: string; officerId: string; name: string }> = []
  for (const d of donors.records) {
    const norm = normalizeName(d.name)
    const matched = officerByNorm.get(norm)
    if (matched && matched.length === 1) {
      donorOfficerMatches.push({ donorId: d.id, officerId: matched[0], name: d.name })
    }
  }

  console.log(`  Matched ${donorOfficerMatches.length} donors to offshore officers`)
  for (const m of donorOfficerMatches.slice(0, 10)) {
    console.log(`    ${m.name}`)
  }

  // Create CROSS_REFERENCED relationships
  if (donorOfficerMatches.length > 0) {
    await executeWrite(`
      UNWIND $batch AS m
      MATCH (d:Donor {donor_id: m.donorId})
      MATCH (o:OffshoreOfficer {icij_id: m.officerId})
      MERGE (d)-[r:CROSS_REFERENCED]->(o)
      SET r.source = 'donor-offshore-match',
          r.method = 'normalized_name',
          r.created_at = datetime()
    `, { batch: donorOfficerMatches })
    console.log(`  Created ${donorOfficerMatches.length} CROSS_REFERENCED rels (Donor→OffshoreOfficer)`)
  }

  // ── 3. Contractors who are also donors ───────────────────────────────
  console.log('\n=== Phase 3: Cross-matching Contractors ↔ Donors ===')

  const contractors = await readQuery(
    'MATCH (c:Contractor) RETURN c.name AS name, c.contractor_id AS id',
    {}, (r) => ({ name: r.get('name') as string, id: r.get('id') as string }),
  )

  const donorByNorm = new Map<string, string[]>()
  for (const d of donors.records) {
    const norm = normalizeName(d.name)
    const existing = donorByNorm.get(norm) || []
    existing.push(d.id)
    donorByNorm.set(norm, existing)
  }

  const contractorDonorMatches: Array<{ contractorId: string; donorId: string; name: string }> = []
  for (const c of contractors.records) {
    const norm = normalizeName(c.name)
    const matched = donorByNorm.get(norm)
    if (matched && matched.length === 1) {
      contractorDonorMatches.push({ contractorId: c.id, donorId: matched[0], name: c.name })
    }
  }

  console.log(`  Matched ${contractorDonorMatches.length} contractors to donors`)
  for (const m of contractorDonorMatches.slice(0, 10)) {
    console.log(`    ${m.name}`)
  }

  if (contractorDonorMatches.length > 0) {
    await executeWrite(`
      UNWIND $batch AS m
      MATCH (c:Contractor {contractor_id: m.contractorId})
      MATCH (d:Donor {donor_id: m.donorId})
      MERGE (c)-[r:CROSS_REFERENCED]->(d)
      SET r.source = 'contractor-donor-match',
          r.method = 'normalized_name',
          r.created_at = datetime()
    `, { batch: contractorDonorMatches })
    console.log(`  Created ${contractorDonorMatches.length} CROSS_REFERENCED rels (Contractor→Donor)`)
  }

  // ── 4. Contractors who have offshore entities ────────────────────────
  console.log('\n=== Phase 4: Cross-matching Contractors ↔ Offshore Officers ===')

  const contractorOffshoreMatches: Array<{ contractorId: string; officerId: string; name: string }> = []
  for (const c of contractors.records) {
    const norm = normalizeName(c.name)
    const matched = officerByNorm.get(norm)
    if (matched && matched.length === 1) {
      contractorOffshoreMatches.push({ contractorId: c.id, officerId: matched[0], name: c.name })
    }
  }

  console.log(`  Matched ${contractorOffshoreMatches.length} contractors to offshore officers`)
  for (const m of contractorOffshoreMatches.slice(0, 10)) {
    console.log(`    ${m.name}`)
  }

  if (contractorOffshoreMatches.length > 0) {
    await executeWrite(`
      UNWIND $batch AS m
      MATCH (c:Contractor {contractor_id: m.contractorId})
      MATCH (o:OffshoreOfficer {icij_id: m.officerId})
      MERGE (c)-[r:CROSS_REFERENCED]->(o)
      SET r.source = 'contractor-offshore-match',
          r.method = 'normalized_name',
          r.created_at = datetime()
    `, { batch: contractorOffshoreMatches })
    console.log(`  Created ${contractorOffshoreMatches.length} CROSS_REFERENCED rels`)
  }

  // ── 5. Summary ───────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('Cross-enrichment complete')
  console.log(`  Politicians in 2+ datasets: ${multiDataset.records.length}`)
  console.log(`  Donor↔Offshore matches:     ${donorOfficerMatches.length}`)
  console.log(`  Contractor↔Donor matches:   ${contractorDonorMatches.length}`)
  console.log(`  Contractor↔Offshore matches: ${contractorOffshoreMatches.length}`)

  // ── 6. High-priority targets ─────────────────────────────────────────
  console.log('\n=== HIGH-PRIORITY INVESTIGATION TARGETS ===')
  console.log('(Politicians appearing in most external datasets)\n')

  for (const p of multiDataset.records.slice(0, 10)) {
    console.log(`  🔴 ${p.name} (${p.party}, ${p.province})`)
    console.log(`     Appears in: ${p.datasets.join(', ')}`)
  }

  await closeDriver()
}

main().catch((error) => {
  console.error('Cross-enrichment failed:', error)
  closeDriver().finally(() => process.exit(1))
})
