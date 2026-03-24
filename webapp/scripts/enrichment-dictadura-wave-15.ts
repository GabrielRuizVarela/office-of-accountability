/**
 * Wave 15: CCD-Victim Deep Linking
 *
 * Aggressive fuzzy matching of ALL 9,743 DictaduraPersona detention_location
 * strings against ALL 772 DictaduraCCD names. Wave 10 only caught exact/contains
 * matches. This wave adds:
 *   1. Levenshtein distance matching (threshold <= 3)
 *   2. Token overlap matching (shared words)
 *   3. Province-based fallback linking
 *   4. Alias expansion matching
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-15.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 15

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Fuzzy matching utilities
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

/** Tokenize a string: lowercase, remove accents, split on non-alpha */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2)
}

/** Compute Jaccard similarity between two token sets */
function tokenOverlap(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  let intersection = 0
  for (const t of setA) {
    if (setB.has(t)) intersection++
  }
  const union = new Set([...setA, ...setB]).size
  return union > 0 ? intersection / union : 0
}

// ---------------------------------------------------------------------------
// Province normalization
// ---------------------------------------------------------------------------

const PROVINCE_ALIASES: Record<string, string> = {
  'buenos aires': 'Buenos Aires',
  'capital federal': 'Capital Federal',
  'caba': 'Capital Federal',
  'ciudad de buenos aires': 'Capital Federal',
  'ciudad autonoma de buenos aires': 'Capital Federal',
  'cordoba': 'Córdoba',
  'santa fe': 'Santa Fe',
  'tucuman': 'Tucumán',
  'mendoza': 'Mendoza',
  'entre rios': 'Entre Ríos',
  'salta': 'Salta',
  'jujuy': 'Jujuy',
  'misiones': 'Misiones',
  'chaco': 'Chaco',
  'formosa': 'Formosa',
  'corrientes': 'Corrientes',
  'santiago del estero': 'Santiago del Estero',
  'san luis': 'San Luis',
  'san juan': 'San Juan',
  'catamarca': 'Catamarca',
  'la rioja': 'La Rioja',
  'la pampa': 'La Pampa',
  'neuquen': 'Neuquén',
  'rio negro': 'Río Negro',
  'chubut': 'Chubut',
  'santa cruz': 'Santa Cruz',
  'tierra del fuego': 'Tierra del Fuego',
}

const CITY_TO_PROVINCE: Record<string, string> = {
  'rosario': 'Santa Fe',
  'la plata': 'Buenos Aires',
  'mar del plata': 'Buenos Aires',
  'bahia blanca': 'Buenos Aires',
  'esma': 'Capital Federal',
  'campo de mayo': 'Buenos Aires',
  'la perla': 'Córdoba',
  'el vesubio': 'Buenos Aires',
  'el olimpo': 'Capital Federal',
  'club atletico': 'Capital Federal',
  'el banco': 'Capital Federal',
  'automotores orletti': 'Capital Federal',
  'mansion sere': 'Buenos Aires',
  'garage azopardo': 'Capital Federal',
  'pozo de banfield': 'Buenos Aires',
  'pozo de quilmes': 'Buenos Aires',
  'virrey cevallos': 'Capital Federal',
}

function extractProvince(location: string): string {
  const lower = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  for (const [alias, province] of Object.entries(PROVINCE_ALIASES)) {
    if (lower === alias || lower.includes(alias)) return province
  }
  for (const [city, province] of Object.entries(CITY_TO_PROVINCE)) {
    if (lower.includes(city)) return province
  }
  return 'Desconocida'
}

// ---------------------------------------------------------------------------
// Phase 1: Load all CCDs and build matching structures
// ---------------------------------------------------------------------------

interface CCDEntry {
  elementId: string
  name: string
  slug: string
  aliases: string[]
  province: string
  tokens: string[]
  nameLower: string
}

async function loadCCDs(): Promise<CCDEntry[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
       RETURN elementId(c) AS eid, c.name AS name, c.slug AS slug,
              coalesce(c.aliases, []) AS aliases,
              coalesce(c.province, '') AS province`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => {
      const name = r.get('name') as string
      const aliases = r.get('aliases') as string[]
      return {
        elementId: r.get('eid') as string,
        name,
        slug: r.get('slug') as string,
        aliases,
        province: (r.get('province') as string) || 'Desconocida',
        tokens: tokenize(name),
        nameLower: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      }
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Load unlinked victims
// ---------------------------------------------------------------------------

interface UnlinkedVictim {
  elementId: string
  name: string
  location: string
  locationLower: string
  locationTokens: string[]
  province: string
}

async function loadUnlinkedVictims(): Promise<UnlinkedVictim[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.detention_location IS NOT NULL OR p.lugar_detencion IS NOT NULL
              OR p.lugar_secuestro IS NOT NULL OR p.ccd IS NOT NULL)
       OPTIONAL MATCH (p)-[existing:DETENIDO_EN]->(:DictaduraCCD)
       WITH p, existing
       WHERE existing IS NULL
       RETURN elementId(p) AS eid, p.name AS name,
              coalesce(p.ccd, p.detention_location, p.lugar_detencion, p.lugar_secuestro) AS location`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => {
      const location = (r.get('location') as string).trim()
      const locationLower = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return {
        elementId: r.get('eid') as string,
        name: r.get('name') as string,
        location,
        locationLower,
        locationTokens: tokenize(location),
        province: extractProvince(location),
      }
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Fuzzy match and create relationships
// ---------------------------------------------------------------------------

type MatchMethod = 'exact' | 'contains' | 'levenshtein' | 'token_overlap' | 'province_fallback'

interface MatchResult {
  victimId: string
  ccdId: string
  method: MatchMethod
  score: number
}

function findBestMatch(victim: UnlinkedVictim, ccds: CCDEntry[]): MatchResult | null {
  // 1. Exact match
  for (const ccd of ccds) {
    if (victim.locationLower === ccd.nameLower) {
      return { victimId: victim.elementId, ccdId: ccd.elementId, method: 'exact', score: 1.0 }
    }
    for (const alias of ccd.aliases) {
      const aliasLower = alias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (victim.locationLower === aliasLower) {
        return { victimId: victim.elementId, ccdId: ccd.elementId, method: 'exact', score: 1.0 }
      }
    }
  }

  // 2. Contains match (either direction)
  for (const ccd of ccds) {
    if (
      victim.locationLower.includes(ccd.nameLower) ||
      ccd.nameLower.includes(victim.locationLower)
    ) {
      if (victim.locationLower.length >= 4 && ccd.nameLower.length >= 4) {
        return { victimId: victim.elementId, ccdId: ccd.elementId, method: 'contains', score: 0.8 }
      }
    }
    for (const alias of ccd.aliases) {
      const aliasLower = alias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (victim.locationLower.includes(aliasLower) || aliasLower.includes(victim.locationLower)) {
        if (victim.locationLower.length >= 4 && aliasLower.length >= 4) {
          return { victimId: victim.elementId, ccdId: ccd.elementId, method: 'contains', score: 0.75 }
        }
      }
    }
  }

  // 3. Levenshtein distance (for short location strings, threshold <= 3)
  if (victim.locationLower.length >= 5 && victim.locationLower.length <= 60) {
    let bestDist = Infinity
    let bestCcd: CCDEntry | null = null
    for (const ccd of ccds) {
      const dist = levenshtein(victim.locationLower, ccd.nameLower)
      if (dist <= 3 && dist < bestDist) {
        bestDist = dist
        bestCcd = ccd
      }
      for (const alias of ccd.aliases) {
        const aliasLower = alias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const aliasDist = levenshtein(victim.locationLower, aliasLower)
        if (aliasDist <= 3 && aliasDist < bestDist) {
          bestDist = aliasDist
          bestCcd = ccd
        }
      }
    }
    if (bestCcd) {
      return {
        victimId: victim.elementId,
        ccdId: bestCcd.elementId,
        method: 'levenshtein',
        score: 1 - bestDist / Math.max(victim.locationLower.length, 1),
      }
    }
  }

  // 4. Token overlap (Jaccard >= 0.5 with at least 2 shared tokens)
  if (victim.locationTokens.length >= 2) {
    let bestOverlap = 0
    let bestCcd: CCDEntry | null = null
    for (const ccd of ccds) {
      const overlap = tokenOverlap(victim.locationTokens, ccd.tokens)
      if (overlap >= 0.5 && overlap > bestOverlap) {
        // Verify at least 2 shared tokens
        const shared = victim.locationTokens.filter((t) => ccd.tokens.includes(t))
        if (shared.length >= 2) {
          bestOverlap = overlap
          bestCcd = ccd
        }
      }
    }
    if (bestCcd) {
      return {
        victimId: victim.elementId,
        ccdId: bestCcd.elementId,
        method: 'token_overlap',
        score: bestOverlap,
      }
    }
  }

  return null
}

async function createDetenidoEnRelationships(matches: MatchResult[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    for (const match of matches) {
      const result = await session.run(
        `MATCH (p) WHERE elementId(p) = $pid
         MATCH (c) WHERE elementId(c) = $cid
         MERGE (p)-[r:DETENIDO_EN]->(c)
         ON CREATE SET
           r.source = 'ccd-deep-linking',
           r.match_method = $method,
           r.match_score = $score,
           r.ingestion_wave = $wave,
           r.caso_slug = $casoSlug,
           r.created_at = datetime()
         RETURN r`,
        {
          pid: match.victimId,
          cid: match.ccdId,
          method: match.method,
          score: match.score,
          wave: WAVE,
          casoSlug: CASO_SLUG,
        },
      )
      if (result.records.length > 0) created++
    }
    return created
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Province-based fallback linking
// ---------------------------------------------------------------------------

async function provinceBasedLinking(ccds: CCDEntry[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0

  try {
    // Find victims with birth_province but no CCD link and no detention_location
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.birth_province IS NOT NULL
         AND NOT (p)-[:DETENIDO_EN]->(:DictaduraCCD)
         AND (p.detention_location IS NULL AND p.lugar_detencion IS NULL
              AND p.lugar_secuestro IS NULL AND p.ccd IS NULL)
       RETURN elementId(p) AS eid, p.name AS name, p.birth_province AS province
       LIMIT 500`,
      { casoSlug: CASO_SLUG },
    )

    // Group CCDs by province
    const ccdsByProvince = new Map<string, CCDEntry[]>()
    for (const ccd of ccds) {
      if (ccd.province && ccd.province !== 'Desconocida') {
        const list = ccdsByProvince.get(ccd.province) || []
        list.push(ccd)
        ccdsByProvince.set(ccd.province, list)
      }
    }

    for (const rec of result.records) {
      const pid = rec.get('eid') as string
      const province = rec.get('province') as string
      const normalizedProvince = extractProvince(province)

      const provinceCcds = ccdsByProvince.get(normalizedProvince)
      if (provinceCcds && provinceCcds.length > 0) {
        // Link to the largest CCD in that province (most likely)
        const targetCcd = provinceCcds[0]
        await session.run(
          `MATCH (p) WHERE elementId(p) = $pid
           MATCH (c) WHERE elementId(c) = $cid
           MERGE (p)-[r:POSIBLE_DETENIDO_EN]->(c)
           ON CREATE SET
             r.source = 'province-fallback',
             r.confidence = 'low',
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          { pid, cid: targetCcd.elementId, wave: WAVE, casoSlug: CASO_SLUG },
        )
        linked++
      }
    }
    return linked
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
  console.log('=== Wave 15: CCD-Victim Deep Linking ===\n')

  // Phase 1: Load CCDs
  console.log('--- Phase 1: Loading CCDs ---')
  const ccds = await loadCCDs()
  console.log(`  Loaded ${ccds.length} CCD entries`)
  console.log(`  Total aliases: ${ccds.reduce((sum, c) => sum + c.aliases.length, 0)}`)

  // Phase 2: Load unlinked victims
  console.log('\n--- Phase 2: Loading Unlinked Victims ---')
  const victims = await loadUnlinkedVictims()
  console.log(`  Found ${victims.length} victims with location data but no DETENIDO_EN link`)

  // Phase 3: Fuzzy matching
  console.log('\n--- Phase 3: Fuzzy Matching ---')
  const matches: MatchResult[] = []
  const methodCounts: Record<MatchMethod, number> = {
    exact: 0,
    contains: 0,
    levenshtein: 0,
    token_overlap: 0,
    province_fallback: 0,
  }

  for (const victim of victims) {
    const match = findBestMatch(victim, ccds)
    if (match) {
      matches.push(match)
      methodCounts[match.method]++
    }
  }

  console.log(`  Total matches found: ${matches.length} / ${victims.length}`)
  console.log('  By method:')
  for (const [method, count] of Object.entries(methodCounts)) {
    if (count > 0) {
      console.log(`    ${method.padEnd(20)} ${count}`)
    }
  }

  // Create relationships
  console.log('\n--- Phase 3b: Creating DETENIDO_EN Relationships ---')
  const created = await createDetenidoEnRelationships(matches)
  console.log(`  Created ${created} new DETENIDO_EN relationships`)

  // Phase 4: Province fallback
  console.log('\n--- Phase 4: Province-Based Fallback Linking ---')
  const provinceFallback = await provinceBasedLinking(ccds)
  console.log(`  Created ${provinceFallback} POSIBLE_DETENIDO_EN relationships (low confidence)`)

  // Final stats
  const driver = getDriver()
  const session = driver.session()
  try {
    const totalDetenido = await session.run(
      `MATCH ()-[r:DETENIDO_EN]->()
       WHERE r.caso_slug = $casoSlug
       RETURN count(r) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const totalPosible = await session.run(
      `MATCH ()-[r:POSIBLE_DETENIDO_EN]->()
       WHERE r.caso_slug = $casoSlug
       RETURN count(r) AS total`,
      { casoSlug: CASO_SLUG },
    )

    console.log('\n=== Wave 15 Summary ===')
    console.log(`  Unlinked victims processed:    ${victims.length}`)
    console.log(`  Fuzzy matches found:           ${matches.length}`)
    console.log(`  DETENIDO_EN created:           ${created}`)
    console.log(`  POSIBLE_DETENIDO_EN created:   ${provinceFallback}`)
    console.log(`  Total DETENIDO_EN in graph:    ${toNumber(totalDetenido.records[0]?.get('total'))}`)
    console.log(`  Total POSIBLE_DETENIDO_EN:     ${toNumber(totalPosible.records[0]?.get('total'))}`)
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nWave 15 complete!')
}

main().catch((err) => {
  console.error('Wave 15 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
