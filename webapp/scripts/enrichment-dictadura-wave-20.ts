/**
 * Wave 20: Missing Relationships Sweep
 *
 * Find "island" nodes (personas with only 1 relationship) and try to connect them:
 *   1. Match detention_location to a CCD → DETENIDO_EN
 *   2. Match birth_province to a Lugar → NACIDO_EN
 *   3. Match name slug against DictaduraDocumento MENCIONA
 *   4. Report how many islands were connected
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-20.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 20

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------------
// Phase 1: Find island nodes
// ---------------------------------------------------------------------------

interface IslandNode {
  elementId: string
  name: string
  slug: string
  label: string
  tier: string
  relCount: number
  detentionLocation: string | null
  birthProvince: string | null
}

async function findIslands(): Promise<IslandNode[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (n:DictaduraPersona)
       WHERE n.caso_slug = $casoSlug
       OPTIONAL MATCH (n)-[r]-()
       WITH n, count(r) AS relCount
       WHERE relCount <= 1
       RETURN elementId(n) AS eid,
              n.name AS name,
              coalesce(n.slug, '') AS slug,
              labels(n)[0] AS label,
              coalesce(n.confidence_tier, 'bronze') AS tier,
              relCount,
              coalesce(n.detention_location, n.lugar_detencion, n.lugar_secuestro, n.ccd) AS detentionLocation,
              n.birth_province AS birthProvince
       ORDER BY relCount ASC, n.name`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      elementId: r.get('eid') as string,
      name: r.get('name') as string,
      slug: r.get('slug') as string,
      label: r.get('label') as string,
      tier: r.get('tier') as string,
      relCount: toNumber(r.get('relCount')),
      detentionLocation: r.get('detentionLocation') as string | null,
      birthProvince: r.get('birthProvince') as string | null,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Match detention_location to CCD
// ---------------------------------------------------------------------------

async function matchLocationToCCD(islands: IslandNode[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let connected = 0

  try {
    // Load all CCDs
    const ccds = await session.run(
      `MATCH (c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
       RETURN elementId(c) AS eid, c.name AS name, coalesce(c.aliases, []) AS aliases`,
      { casoSlug: CASO_SLUG },
    )

    const ccdLookup = new Map<string, string>()
    for (const r of ccds.records) {
      const eid = r.get('eid') as string
      const name = (r.get('name') as string).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      ccdLookup.set(name, eid)
      for (const alias of r.get('aliases') as string[]) {
        ccdLookup.set(alias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), eid)
      }
    }

    for (const island of islands) {
      if (!island.detentionLocation) continue

      const locLower = island.detentionLocation.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      let matchedCid: string | null = null

      // Exact match
      if (ccdLookup.has(locLower)) {
        matchedCid = ccdLookup.get(locLower)!
      } else {
        // Contains match
        for (const [ccdName, cid] of ccdLookup) {
          if (locLower.includes(ccdName) || ccdName.includes(locLower)) {
            if (ccdName.length >= 4) {
              matchedCid = cid
              break
            }
          }
        }
      }

      if (matchedCid) {
        await session.run(
          `MATCH (p) WHERE elementId(p) = $pid
           MATCH (c) WHERE elementId(c) = $cid
           MERGE (p)-[r:DETENIDO_EN]->(c)
           ON CREATE SET
             r.source = 'island-sweep',
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          { pid: island.elementId, cid: matchedCid, wave: WAVE, casoSlug: CASO_SLUG },
        )
        connected++
      }
    }

    return connected
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Match birth_province to Lugar
// ---------------------------------------------------------------------------

async function matchProvinceToLugar(islands: IslandNode[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let connected = 0

  try {
    // Load all Lugar nodes
    const lugares = await session.run(
      `MATCH (l:DictaduraLugar)
       WHERE l.caso_slug = $casoSlug
       RETURN elementId(l) AS eid, l.name AS name, coalesce(l.province, '') AS province`,
      { casoSlug: CASO_SLUG },
    )

    const lugarByProvince = new Map<string, string>()
    const lugarByName = new Map<string, string>()
    for (const r of lugares.records) {
      const eid = r.get('eid') as string
      const name = (r.get('name') as string).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const province = (r.get('province') as string).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      lugarByName.set(name, eid)
      if (province) lugarByProvince.set(province, eid)
    }

    for (const island of islands) {
      if (!island.birthProvince) continue

      const provLower = island.birthProvince.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      let matchedLid: string | null = null

      if (lugarByProvince.has(provLower)) {
        matchedLid = lugarByProvince.get(provLower)!
      } else if (lugarByName.has(provLower)) {
        matchedLid = lugarByName.get(provLower)!
      } else {
        // Partial match
        for (const [name, eid] of lugarByName) {
          if (provLower.includes(name) || name.includes(provLower)) {
            matchedLid = eid
            break
          }
        }
      }

      if (matchedLid) {
        // Check no existing NACIDO_EN
        const existing = await session.run(
          `MATCH (p) WHERE elementId(p) = $pid
           OPTIONAL MATCH (p)-[r:NACIDO_EN]->()
           RETURN r`,
          { pid: island.elementId },
        )

        if (!existing.records[0]?.get('r')) {
          await session.run(
            `MATCH (p) WHERE elementId(p) = $pid
             MATCH (l) WHERE elementId(l) = $lid
             MERGE (p)-[r:NACIDO_EN]->(l)
             ON CREATE SET
               r.source = 'island-sweep',
               r.ingestion_wave = $wave,
               r.caso_slug = $casoSlug,
               r.created_at = datetime()`,
            { pid: island.elementId, lid: matchedLid, wave: WAVE, casoSlug: CASO_SLUG },
          )
          connected++
        }
      }
    }

    return connected
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Match name against DictaduraDocumento MENCIONA
// ---------------------------------------------------------------------------

async function matchNameToDocuments(islands: IslandNode[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let connected = 0

  try {
    // Load all documents
    const docs = await session.run(
      `MATCH (d:DictaduraDocumento)
       WHERE d.caso_slug = $casoSlug
       RETURN elementId(d) AS eid, d.title AS title, coalesce(d.summary, '') AS summary`,
      { casoSlug: CASO_SLUG },
    )

    // Build searchable index
    const docEntries = docs.records.map((r) => ({
      eid: r.get('eid') as string,
      title: (r.get('title') as string).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      summary: (r.get('summary') as string).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    }))

    // For each island, check if their name appears in any document title/summary
    for (const island of islands) {
      const nameSlug = slugify(island.name)
      const nameParts = island.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/)

      // Need at least last name (2+ chars) for matching
      const lastName = nameParts.find((p) => p.length >= 4)
      if (!lastName) continue

      for (const doc of docEntries) {
        if (doc.title.includes(lastName) || doc.summary.includes(lastName)) {
          // Verify with at least 2 name parts for precision
          const matchingParts = nameParts.filter(
            (p) => p.length >= 3 && (doc.title.includes(p) || doc.summary.includes(p)),
          )

          if (matchingParts.length >= 2) {
            // Check no existing MENCIONA relationship
            const existing = await session.run(
              `MATCH (d) WHERE elementId(d) = $did
               MATCH (p) WHERE elementId(p) = $pid
               OPTIONAL MATCH (d)-[r:MENCIONA]->(p)
               RETURN r`,
              { did: doc.eid, pid: island.elementId },
            )

            if (!existing.records[0]?.get('r')) {
              await session.run(
                `MATCH (d) WHERE elementId(d) = $did
                 MATCH (p) WHERE elementId(p) = $pid
                 MERGE (d)-[r:MENCIONA]->(p)
                 ON CREATE SET
                   r.source = 'island-sweep',
                   r.ingestion_wave = $wave,
                   r.caso_slug = $casoSlug,
                   r.created_at = datetime()`,
                { did: doc.eid, pid: island.elementId, wave: WAVE, casoSlug: CASO_SLUG },
              )
              connected++
              break // One document match is enough
            }
          }
        }
      }
    }

    return connected
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  process.env.NEO4J_QUERY_TIMEOUT_MS = '180000'

  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j')
    process.exit(1)
  }
  console.log('Connected to Neo4j\n')
  console.log('=== Wave 20: Missing Relationships Sweep ===\n')

  // Phase 1: Find islands
  console.log('--- Phase 1: Finding Island Nodes ---')
  const islands = await findIslands()
  const zeroRel = islands.filter((i) => i.relCount === 0)
  const oneRel = islands.filter((i) => i.relCount === 1)
  console.log(`  Total island nodes (0-1 relationships): ${islands.length}`)
  console.log(`    With 0 relationships: ${zeroRel.length}`)
  console.log(`    With 1 relationship:  ${oneRel.length}`)
  console.log(`    With detention_location: ${islands.filter((i) => i.detentionLocation).length}`)
  console.log(`    With birth_province:     ${islands.filter((i) => i.birthProvince).length}`)

  // Phase 2: Match location to CCD
  console.log('\n--- Phase 2: Matching Detention Locations to CCDs ---')
  const ccdConnected = await matchLocationToCCD(islands)
  console.log(`  Connected ${ccdConnected} islands via DETENIDO_EN`)

  // Phase 3: Match province to Lugar
  console.log('\n--- Phase 3: Matching Birth Province to Lugar ---')
  const lugarConnected = await matchProvinceToLugar(islands)
  console.log(`  Connected ${lugarConnected} islands via NACIDO_EN`)

  // Phase 4: Match names to documents
  console.log('\n--- Phase 4: Matching Names to Documents ---')
  const docConnected = await matchNameToDocuments(islands)
  console.log(`  Connected ${docConnected} islands via MENCIONA`)

  // Post-sweep stats
  const driver = getDriver()
  const session = driver.session()
  try {
    const remainingIslands = await session.run(
      `MATCH (n:DictaduraPersona)
       WHERE n.caso_slug = $casoSlug
       OPTIONAL MATCH (n)-[r]-()
       WITH n, count(r) AS relCount
       WHERE relCount <= 1
       RETURN count(n) AS remaining`,
      { casoSlug: CASO_SLUG },
    )

    const remaining = toNumber(remainingIslands.records[0]?.get('remaining'))
    const totalConnected = ccdConnected + lugarConnected + docConnected

    console.log('\n=== Wave 20 Summary ===')
    console.log(`  Islands found:           ${islands.length}`)
    console.log(`  Connected via CCD:       ${ccdConnected}`)
    console.log(`  Connected via Lugar:     ${lugarConnected}`)
    console.log(`  Connected via Documento: ${docConnected}`)
    console.log(`  Total newly connected:   ${totalConnected}`)
    console.log(`  Remaining islands:       ${remaining}`)
    console.log(`  Connection rate:         ${islands.length > 0 ? ((totalConnected / islands.length) * 100).toFixed(1) : 0}%`)
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nWave 20 complete!')
}

main().catch((err) => {
  console.error('Wave 20 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
