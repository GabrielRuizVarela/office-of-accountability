/**
 * Wave 16: Ingest World Bank and IDB debarment/sanctions lists,
 * match against existing Contractor nodes by fuzzy name matching.
 *
 * Data sources:
 * - World Bank debarred firms (OpenSanctions CSV)
 * - IDB sanctioned firms and individuals (IDB Open Data CSV)
 *
 * Run with: npx tsx scripts/ingest-debarment-lists.ts
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = '60000'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { executeWrite, readQuery, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

const now = new Date().toISOString()
const CASO_SLUG = 'obras-publicas'
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'multilateral')

// ---------------------------------------------------------------------------
// CSV parsing (simple, handles quoted fields)
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []
  // Strip BOM if present
  const headerLine = lines[0].replace(/^\uFEFF/, '')
  const headers = parseCSVLine(headerLine)
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = values[i] ?? ''
    }
    return row
  })
}

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

interface DebarredEntity {
  debarment_id: string
  name: string
  entity_type: 'firm' | 'individual'
  country: string
  address: string
  source: 'world_bank' | 'idb'
  sanction_type: string
  prohibited_practice: string
  from_date: string
  to_date: string
  raw_data: string
}

// ---------------------------------------------------------------------------
// World Bank CSV parser (OpenSanctions format)
// ---------------------------------------------------------------------------

function parseWBDebarment(raw: string): DebarredEntity[] {
  const rows = parseCSV(raw)
  const entities: DebarredEntity[] = []

  for (const row of rows) {
    const countries = (row['countries'] ?? '').toLowerCase()
    const addresses = (row['addresses'] ?? '').toLowerCase()
    // Filter to Argentina (country code 'ar' or address mentions Argentina)
    if (countries !== 'ar' && !addresses.includes('argentina')) continue

    // Skip the Iranian firm that just has "Argentine Sq." in address
    if (countries === 'ir') continue

    const name = row['name'] ?? ''
    const sanctions = row['sanctions'] ?? ''

    // Parse sanction dates from sanctions field
    const dateMatch = sanctions.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2}|2999-12-31)/)
    const fromDate = dateMatch?.[1] ?? ''
    const toDate = dateMatch?.[2] ?? ''

    // Determine entity type heuristically
    const nameLower = name.toLowerCase()
    const isIndividual = nameLower.startsWith('mr.') || nameLower.startsWith('mrs.') ||
      nameLower.startsWith('ms.') || (!name.includes('S.A.') && !name.includes('S.R.L.') &&
      !name.includes('UTE') && !name.includes('CORP') && !name.includes('LTD') &&
      !name.includes('S.A.C.') && !name.includes('INC') &&
      name.split(' ').length <= 4 && name === name.toUpperCase())

    entities.push({
      debarment_id: `wb-${row['id'] ?? ''}`,
      name,
      entity_type: isIndividual ? 'individual' : 'firm',
      country: 'Argentina',
      address: row['addresses'] ?? '',
      source: 'world_bank',
      sanction_type: sanctions.split(' - ')[0] ?? '',
      prohibited_practice: sanctions.split(' - ')[0] ?? '',
      from_date: fromDate,
      to_date: toDate === '2999-12-31' ? 'permanent' : toDate,
      raw_data: JSON.stringify(row),
    })
  }

  return entities
}

// ---------------------------------------------------------------------------
// IDB CSV parser
// ---------------------------------------------------------------------------

function parseIDBSanctions(raw: string): DebarredEntity[] {
  const rows = parseCSV(raw)
  const entities: DebarredEntity[] = []

  for (const row of rows) {
    const nationality = (row['Nationality'] ?? '').toLowerCase()
    const country = (row['Country'] ?? '').toLowerCase()
    if (!nationality.includes('argentin') && !country.includes('argentin')) continue

    const name = row['Title'] ?? ''
    const entityField = (row['Entity'] ?? '').toLowerCase()

    entities.push({
      debarment_id: `idb-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`,
      name,
      entity_type: entityField === 'individual' ? 'individual' : 'firm',
      country: 'Argentina',
      address: '',
      source: 'idb',
      sanction_type: row['Tipo de sancion del BID'] ?? row['IDB Sanction Source'] ?? '',
      prohibited_practice: row['Prohibited Practice'] ?? '',
      from_date: (row['From'] ?? '').replace('T00:00', ''),
      to_date: (row['To'] ?? 'Ongoing').replace(' 00:00:00', ''),
      raw_data: JSON.stringify(row),
    })
  }

  return entities
}

// ---------------------------------------------------------------------------
// Fuzzy name matching utilities
// ---------------------------------------------------------------------------

function normalizeForMatching(name: string): string {
  return name
    .toUpperCase()
    // Normalize accented chars
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,\-'"()–]/g, ' ')
    .replace(/\bMR\b|\bMRS\b|\bMS\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Strip legal suffixes for firm matching */
function normalizeFirmName(name: string): string {
  return normalizeForMatching(name)
    .replace(/\bS\s*A\s*C?\s*I?\s*F?\b/g, '')
    .replace(/\bS\s*R\s*L\b/g, '')
    .replace(/\bUTE\b/g, '')
    .replace(/\bLTD\b/g, '')
    .replace(/\bCO\b/g, '')
    .replace(/\bINC\b/g, '')
    .replace(/\bSUCURSAL\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(name: string): string[] {
  return normalizeForMatching(name).split(' ').filter((t) => t.length > 1)
}

function tokenizeFirm(name: string): string[] {
  return normalizeFirmName(name).split(' ').filter((t) => t.length > 1)
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter((x) => setB.has(x))
  const union = new Set([...setA, ...setB])
  return union.size === 0 ? 0 : intersection.length / union.size
}

/**
 * For individuals: require ALL tokens from the debarred name
 * to appear in the contractor name AND vice versa (exact full-name match).
 * This prevents "Juan Pablo Haddad" from matching every "Juan Pablo X".
 */
function individualExactMatch(debarredTokens: string[], contractorTokens: string[]): boolean {
  if (debarredTokens.length < 2 || contractorTokens.length < 2) return false
  const setA = new Set(debarredTokens)
  const setB = new Set(contractorTokens)
  // All debarred tokens must be in contractor AND all contractor tokens in debarred
  return debarredTokens.every((t) => setB.has(t)) && contractorTokens.every((t) => setA.has(t))
}

interface MatchResult {
  contractor_name: string
  contractor_id: string
  debarred_name: string
  debarment_id: string
  score: number
  match_method: string
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j. Is the database running?')
    process.exit(1)
  }
  console.log('Connected to Neo4j.\n')

  // -- 1. Parse debarment data -----------------------------------------------
  console.log('=== PARSING DEBARMENT LISTS ===\n')

  const wbRaw = await readFile(join(DATA_DIR, 'wb-debarment.csv'), 'utf-8')
  const wbEntities = parseWBDebarment(wbRaw)
  console.log(`World Bank Argentine debarred entities: ${wbEntities.length}`)

  const idbRaw = await readFile(join(DATA_DIR, 'idb-sanctions.csv'), 'utf-8')
  const idbEntities = parseIDBSanctions(idbRaw)
  console.log(`IDB Argentine sanctioned entities: ${idbEntities.length}`)

  // Deduplicate across sources (same entity may appear in both via cross-debarment)
  const allEntities = new Map<string, DebarredEntity>()
  for (const e of [...wbEntities, ...idbEntities]) {
    const key = normalizeForMatching(e.name)
    if (!allEntities.has(key)) {
      allEntities.set(key, e)
    } else {
      // Merge: prefer IDB original data for IDB sanctions
      const existing = allEntities.get(key)!
      if (e.source === 'idb' && existing.source === 'world_bank') {
        allEntities.set(key, { ...e, debarment_id: existing.debarment_id })
      }
    }
  }

  const dedupedEntities = [...allEntities.values()]
  console.log(`Deduplicated total: ${dedupedEntities.length}\n`)

  for (const e of dedupedEntities) {
    console.log(`  [${e.source}] ${e.entity_type === 'individual' ? 'PERSON' : 'FIRM  '} ${e.name}`)
    console.log(`         Practice: ${e.prohibited_practice} | ${e.from_date} → ${e.to_date}`)
  }

  // -- 2. Create DebarredEntity nodes ----------------------------------------
  console.log('\n=== CREATING DEBARRED ENTITY NODES ===\n')

  let nodesCreated = 0
  for (const e of dedupedEntities) {
    const result = await executeWrite(
      `MERGE (de:DebarredEntity {debarment_id: $debarment_id})
       ON CREATE SET de.name = $name,
                     de.entity_type = $entity_type,
                     de.country = $country,
                     de.address = $address,
                     de.source = $source,
                     de.sanction_type = $sanction_type,
                     de.prohibited_practice = $prohibited_practice,
                     de.from_date = $from_date,
                     de.to_date = $to_date,
                     de.caso_slug = $caso_slug,
                     de.submitted_by = $submitted_by,
                     de.tier = 'silver',
                     de.confidence_score = 0.95,
                     de.created_at = $now
       ON MATCH SET  de.updated_at = $now,
                     de.sanction_type = $sanction_type,
                     de.prohibited_practice = $prohibited_practice,
                     de.to_date = $to_date`,
      {
        debarment_id: e.debarment_id,
        name: e.name,
        entity_type: e.entity_type,
        country: e.country,
        address: e.address,
        source: e.source,
        sanction_type: e.sanction_type,
        prohibited_practice: e.prohibited_practice,
        from_date: e.from_date,
        to_date: e.to_date,
        caso_slug: CASO_SLUG,
        submitted_by: 'wave-16:debarment-lists',
        now,
      },
    )
    nodesCreated += result.summary.counters.nodesCreated
    console.log(`  MERGE DebarredEntity: ${e.name} (${result.summary.counters.nodesCreated > 0 ? 'CREATED' : 'EXISTS'})`)
  }

  console.log(`\nDebarredEntity nodes created: ${nodesCreated}`)

  // -- 3. Fetch all contractors from Neo4j for matching -----------------------
  console.log('\n=== MATCHING AGAINST CONTRACTOR DATABASE ===\n')

  const contractors = await readQuery<{ name: string; id: string }>(
    `MATCH (c:Contractor)
     WHERE c.name IS NOT NULL
     RETURN c.name AS name, c.contractor_id AS id`,
    {},
    (rec) => ({ name: rec.get('name') as string, id: rec.get('id') as string }),
  )

  console.log(`Contractors loaded: ${contractors.records.length}`)

  // Pre-tokenize all contractors
  const contractorData = contractors.records.map((c) => ({
    ...c,
    tokens: tokenize(c.name),
    firmTokens: tokenizeFirm(c.name),
    normalized: normalizeForMatching(c.name),
    firmNormalized: normalizeFirmName(c.name),
  }))

  // -- 4. Run fuzzy matching --------------------------------------------------
  // Strategy:
  //   - Individuals: require exact full-name match (all tokens bidirectional)
  //   - Firms: Jaccard >= 0.7 on firm-normalized tokens, or exact normalized match
  const matches: MatchResult[] = []
  const FIRM_JACCARD_THRESHOLD = 0.7

  for (const de of dedupedEntities) {
    const deTokens = tokenize(de.name)
    const deNorm = normalizeForMatching(de.name)
    const deFirmTokens = tokenizeFirm(de.name)
    const deFirmNorm = normalizeFirmName(de.name)
    const isIndividual = de.entity_type === 'individual'

    for (const c of contractorData) {
      // Exact normalized match (works for both types)
      if (deNorm === c.normalized) {
        matches.push({
          contractor_name: c.name,
          contractor_id: c.id,
          debarred_name: de.name,
          debarment_id: de.debarment_id,
          score: 1.0,
          match_method: 'exact_normalized',
        })
        continue
      }

      if (isIndividual) {
        // For individuals: strict bidirectional token match
        if (individualExactMatch(deTokens, c.tokens)) {
          matches.push({
            contractor_name: c.name,
            contractor_id: c.id,
            debarred_name: de.name,
            debarment_id: de.debarment_id,
            score: 0.95,
            match_method: 'individual_exact_tokens',
          })
        }
      } else {
        // For firms: exact firm-normalized match
        if (deFirmNorm === c.firmNormalized) {
          matches.push({
            contractor_name: c.name,
            contractor_id: c.id,
            debarred_name: de.name,
            debarment_id: de.debarment_id,
            score: 0.98,
            match_method: 'firm_exact_normalized',
          })
          continue
        }

        // For firms: high Jaccard on firm tokens
        const jaccard = jaccardSimilarity(deFirmTokens, c.firmTokens)
        if (jaccard >= FIRM_JACCARD_THRESHOLD) {
          matches.push({
            contractor_name: c.name,
            contractor_id: c.id,
            debarred_name: de.name,
            debarment_id: de.debarment_id,
            score: jaccard,
            match_method: 'firm_jaccard',
          })
        }
      }
    }
  }

  // Deduplicate matches (keep highest score per pair)
  const bestMatches = new Map<string, MatchResult>()
  for (const m of matches) {
    const key = `${m.debarment_id}::${m.contractor_id}`
    const existing = bestMatches.get(key)
    if (!existing || m.score > existing.score) {
      bestMatches.set(key, m)
    }
  }

  const finalMatches = [...bestMatches.values()].sort((a, b) => b.score - a.score)

  console.log(`\nMatches found: ${finalMatches.length}\n`)

  for (const m of finalMatches) {
    console.log(`  [${m.score.toFixed(2)}] ${m.match_method}`)
    console.log(`    Debarred:   ${m.debarred_name}`)
    console.log(`    Contractor: ${m.contractor_name} (${m.contractor_id})`)
  }

  // -- 5. Create DEBARRED_SAME_AS relationships -------------------------------
  console.log('\n=== CREATING DEBARRED_SAME_AS RELATIONSHIPS ===\n')

  let relsCreated = 0
  for (const m of finalMatches) {
    const result = await executeWrite(
      `MATCH (de:DebarredEntity {debarment_id: $debarment_id})
       MATCH (c:Contractor {contractor_id: $contractor_id})
       MERGE (de)-[r:DEBARRED_SAME_AS]->(c)
       ON CREATE SET r.match_score = $score,
                     r.match_method = $match_method,
                     r.created_at = $now,
                     r.submitted_by = 'wave-16:debarment-matching'
       ON MATCH SET  r.match_score = $score,
                     r.match_method = $match_method,
                     r.updated_at = $now`,
      {
        debarment_id: m.debarment_id,
        contractor_id: m.contractor_id,
        score: m.score,
        match_method: m.match_method,
        now,
      },
    )
    relsCreated += result.summary.counters.relationshipsCreated
    console.log(`  MERGE DEBARRED_SAME_AS: ${m.debarred_name} → ${m.contractor_name} (${result.summary.counters.relationshipsCreated > 0 ? 'CREATED' : 'EXISTS'})`)
  }

  // -- 6. Summary -------------------------------------------------------------
  console.log('\n' + '='.repeat(60))
  console.log('WAVE 16 — DEBARMENT LIST INGESTION SUMMARY')
  console.log('='.repeat(60))
  console.log(`  World Bank debarred (Argentina):  ${wbEntities.length}`)
  console.log(`  IDB sanctioned (Argentina):       ${idbEntities.length}`)
  console.log(`  Deduplicated total:                ${dedupedEntities.length}`)
  console.log(`  DebarredEntity nodes created:      ${nodesCreated}`)
  console.log(`  Contractors in database:           ${contractors.records.length}`)
  console.log(`  Matches found:                     ${finalMatches.length}`)
  console.log(`  DEBARRED_SAME_AS rels created:     ${relsCreated}`)
  console.log('='.repeat(60))

  await closeDriver()
}

main().catch((error) => {
  console.error('Wave 16 ingestion failed:', error)
  closeDriver().finally(() => process.exit(1))
})
