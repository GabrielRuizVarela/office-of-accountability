/**
 * Cross-reference matchers - three tiers of entity matching.
 *
 * Tier 1: CUIT (tax ID) - exact match + DNI extraction, confidence 0.95-1.0
 * Tier 2: DNI/CUIL (national ID) - exact after normalization, confidence 0.9-0.95
 * Tier 3: Name - normalized or fuzzy, confidence 0.6-0.8
 *
 * Tier 1 & 2 use in-memory Map joins (fast, <1s).
 * Tier 3 uses in-memory normalized name + Levenshtein fallback.
 */

import { readQuery } from '../../lib/neo4j/client'
import { normalizeName } from '../como-voto/transformer'
import { levenshtein } from '../../lib/ingestion/dedup'
import type { CrossRefMatch } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip hyphens from CUIT/CUIL for normalized comparison */
function normalizeCuit(cuit: string): string {
  return cuit.replace(/-/g, '').trim()
}

/**
 * Extract the DNI portion from a CUIT/CUIL string.
 * Format: XX-DDDDDDDD-X or XXDDDDDDDDX (11 digits).
 * The DNI is the middle 8 digits (positions 2-9).
 */
function extractDni(cuit: string): string | null {
  const digits = normalizeCuit(cuit)
  if (digits.length !== 11) return null
  const dni = digits.slice(2, 10)
  // Trim leading zero for matching
  return dni.startsWith('0') ? dni.slice(1) : dni
}

/** Is this a person CUIT (prefix 20/23/24/27) vs company (30/33/34)? */
function isPersonCuit(cuit: string): boolean {
  const prefix = normalizeCuit(cuit).slice(0, 2)
  return ['20', '23', '24', '27'].includes(prefix)
}

// ---------------------------------------------------------------------------
// Shared fetch helpers
// ---------------------------------------------------------------------------

interface CuitEntity {
  id: string
  cuit: string
  name: string
  label: string
}

interface DniEntity {
  id: string
  dni: string
  name: string
  label: string
}

async function fetchAllCuitEntities(): Promise<CuitEntity[]> {
  const results = await Promise.all([
    readQuery(
      `MATCH (c:Contractor) WHERE c.cuit IS NOT NULL AND c.cuit <> ''
       RETURN c.contractor_id AS id, c.cuit AS cuit, c.name AS name`,
      {},
      (r) => ({ id: r.get('id') as string, cuit: r.get('cuit') as string, name: r.get('name') as string, label: 'Contractor' }),
    ),
    readQuery(
      `MATCH (co:Company) WHERE co.cuit IS NOT NULL AND co.cuit <> ''
       RETURN co.igj_id AS id, co.cuit AS cuit, co.name AS name`,
      {},
      (r) => ({ id: r.get('id') as string, cuit: r.get('cuit') as string, name: r.get('name') as string, label: 'Company' }),
    ),
    readQuery(
      `MATCH (d:Donor) WHERE d.cuit IS NOT NULL AND d.cuit <> ''
       RETURN d.donor_id AS id, d.cuit AS cuit, d.name AS name`,
      {},
      (r) => ({ id: r.get('id') as string, cuit: r.get('cuit') as string, name: r.get('name') as string, label: 'Donor' }),
    ),
    readQuery(
      `MATCH (a:AssetDeclaration) WHERE a.cuit IS NOT NULL AND a.cuit <> ''
       RETURN a.ddjj_id AS id, a.cuit AS cuit, a.name AS name`,
      {},
      (r) => ({ id: r.get('id') as string, cuit: r.get('cuit') as string, name: (r.get('name') as string) || '', label: 'AssetDeclaration' }),
    ),
  ])
  return results.flatMap((r) => r.records)
}

async function fetchAllDniEntities(): Promise<DniEntity[]> {
  const results = await Promise.all([
    readQuery(
      `MATCH (ga:GovernmentAppointment)
       WHERE ga.dni IS NOT NULL AND ga.dni <> ''
       RETURN ga.appointment_id AS id, replace(ga.dni, '.', '') AS dni, ga.full_name AS name`,
      {},
      (r) => ({ id: r.get('id') as string, dni: r.get('dni') as string, name: r.get('name') as string, label: 'GovernmentAppointment' }),
    ),
    readQuery(
      `MATCH (ga:GovernmentAppointment)
       WHERE (ga.dni IS NULL OR ga.dni = '') AND ga.cuil IS NOT NULL AND ga.cuil <> ''
       RETURN ga.appointment_id AS id, ga.cuil AS cuil, ga.full_name AS name`,
      {},
      (r) => {
        const cuil = r.get('cuil') as string
        const dni = extractDni(cuil)
        return dni ? { id: r.get('id') as string, dni, name: r.get('name') as string, label: 'GovernmentAppointment' } : null
      },
    ),
    readQuery(
      `MATCH (co:CompanyOfficer)
       WHERE co.document_type_code = '1' AND co.document_number IS NOT NULL AND co.document_number <> ''
       RETURN co.officer_id AS id, co.document_number AS dni, co.name AS name`,
      {},
      (r) => ({ id: r.get('id') as string, dni: r.get('dni') as string, name: r.get('name') as string, label: 'CompanyOfficer' }),
    ),
  ])
  return results.flatMap((r) => r.records).filter((e): e is DniEntity => e !== null)
}

// ---------------------------------------------------------------------------
// Tier 1: CUIT matching - all CUIT-bearing labels, in-memory Map join
// ---------------------------------------------------------------------------

/**
 * CUIT-based entity resolution across all label pairs.
 *
 * Fetches all entities with CUIT, builds a normalized CUIT map, and
 * cross-matches:
 * - Exact CUIT match across different labels
 * - DNI extraction from person CUITs to match CompanyOfficer/GovernmentAppointment
 */
export async function matchByCuit(): Promise<CrossRefMatch[]> {
  const entities = await fetchAllCuitEntities()
  console.log(`  [cuit] Fetched ${entities.length} entities with CUIT`)

  // Build map: normalized CUIT -> entities
  const byCuit = new Map<string, CuitEntity[]>()
  for (const e of entities) {
    const norm = normalizeCuit(e.cuit)
    if (!norm) continue
    const list = byCuit.get(norm) || []
    list.push(e)
    byCuit.set(norm, list)
  }

  const matches: CrossRefMatch[] = []
  const seen = new Set<string>()

  // ---- Cross-match by exact CUIT across different labels ----
  for (const [norm, group] of byCuit) {
    if (group.length < 2) continue
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        if (a.label === b.label) continue // skip same-label matches
        const key = [a.id, b.id].sort().join('::')
        if (seen.has(key)) continue
        seen.add(key)
        matches.push({
          source_id: a.id,
          target_id: b.id,
          source_label: a.label,
          target_label: b.label,
          match_key: norm,
          match_type: 'cuit',
          confidence: 1.0,
          evidence: `CUIT match: ${a.label} "${a.name}" (${a.cuit}) = ${b.label} "${b.name}" (${b.cuit})`,
        })
      }
    }
  }

  // ---- CUIT → DNI extraction for person matching ----
  // Person CUITs (prefix 20/23/24/27) contain DNI in positions 2-9.
  // Match extracted DNI against CompanyOfficer and GovernmentAppointment.
  const dniEntities = await fetchAllDniEntities()
  const byDni = new Map<string, DniEntity[]>()
  for (const e of dniEntities) {
    const norm = e.dni.replace(/\D/g, '').trim()
    if (!norm) continue
    // Also store trimmed version (no leading zero)
    const trimmed = norm.startsWith('0') ? norm.slice(1) : norm
    for (const key of new Set([norm, trimmed])) {
      const list = byDni.get(key) || []
      list.push(e)
      byDni.set(key, list)
    }
  }

  for (const e of entities) {
    if (!isPersonCuit(e.cuit)) continue
    const dni = extractDni(e.cuit)
    if (!dni) continue

    const dniMatches = byDni.get(dni)
    if (!dniMatches) continue

    for (const target of dniMatches) {
      if (e.label === target.label) continue
      const key = [e.id, target.id].sort().join('::')
      if (seen.has(key)) continue
      seen.add(key)
      matches.push({
        source_id: e.id,
        target_id: target.id,
        source_label: e.label,
        target_label: target.label,
        match_key: dni,
        match_type: 'cuit',
        confidence: 0.95,
        evidence: `CUIT→DNI match: ${e.label} "${e.name}" (CUIT ${e.cuit}, DNI=${dni}) = ${target.label} "${target.name}"`,
      })
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Tier 2: DNI/CUIL matching (GovernmentAppointment <-> CompanyOfficer)
// In-memory Map join on normalized DNI.
// ---------------------------------------------------------------------------

export async function matchByDni(): Promise<CrossRefMatch[]> {
  const entities = await fetchAllDniEntities()
  console.log(`  [dni] Fetched ${entities.length} entities with DNI/CUIL`)

  // Build lookup: DNI -> CompanyOfficer[]
  const officerByDni = new Map<string, DniEntity[]>()
  for (const e of entities) {
    if (e.label !== 'CompanyOfficer') continue
    const norm = e.dni.replace(/\D/g, '').trim()
    if (!norm) continue
    const list = officerByDni.get(norm) || []
    list.push(e)
    officerByDni.set(norm, list)
  }

  const matches: CrossRefMatch[] = []

  for (const e of entities) {
    if (e.label !== 'GovernmentAppointment') continue
    const norm = e.dni.replace(/\D/g, '').trim()
    if (!norm) continue

    const matched = officerByDni.get(norm)
    if (!matched) continue

    for (const officer of matched) {
      matches.push({
        source_id: e.id,
        target_id: officer.id,
        source_label: 'GovernmentAppointment',
        target_label: 'CompanyOfficer',
        match_key: norm,
        match_type: 'dni',
        confidence: 0.95,
        evidence: `DNI match: Appointee "${e.name}" (DNI=${norm}) = Officer "${officer.name}"`,
      })
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Tier 3: Name matching (unmatched entities only)
// ---------------------------------------------------------------------------

interface NameEntity {
  id: string
  name: string
  label: string
  normalized: string
}

/** Maximum entities to fetch per type for name matching to prevent OOM / hangs */
const NAME_MATCH_LIMIT = 50_000

/** Minimum normalized name length to consider for matching */
const MIN_NAME_LENGTH = 3

export async function matchByName(
  alreadyMatchedIds: ReadonlySet<string>,
): Promise<CrossRefMatch[]> {
  console.log('  [name-match] Fetching entities for name matching...')

  const matches: CrossRefMatch[] = []
  const matchedPairs = new Set<string>()

  const [contractorRes, companyRes, appointmentRes, officerRes] = await Promise.all([
    readQuery(
      `MATCH (c:Contractor) WHERE c.name IS NOT NULL AND c.name <> '' AND size(c.name) >= 3
       RETURN c.contractor_id AS id, c.name AS name
       LIMIT toInteger($limit)`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
    readQuery(
      `MATCH (co:Company) WHERE co.name IS NOT NULL AND co.name <> '' AND size(co.name) >= 3
       RETURN co.igj_id AS id, co.name AS name
       LIMIT toInteger($limit)`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
    readQuery(
      `MATCH (ga:GovernmentAppointment) WHERE ga.full_name IS NOT NULL AND ga.full_name <> '' AND size(ga.full_name) >= 3
       RETURN ga.appointment_id AS id, ga.full_name AS name
       LIMIT toInteger($limit)`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
    readQuery(
      `MATCH (co:CompanyOfficer) WHERE co.name IS NOT NULL AND co.name <> '' AND size(co.name) >= 3
       RETURN co.officer_id AS id, co.name AS name
       LIMIT toInteger($limit)`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
  ])

  const totalEntities = contractorRes.records.length + companyRes.records.length +
    appointmentRes.records.length + officerRes.records.length
  console.log(`  [name-match] Fetched ${totalEntities} entities`)

  // Filter out already-matched entities, normalize names, and require minimum length
  const filterAndNormalize = (
    records: readonly { id: string; name: string }[],
    label: string,
  ): NameEntity[] =>
    records
      .filter((r) => !alreadyMatchedIds.has(r.id))
      .map((r) => ({ ...r, label, normalized: normalizeName(r.name) }))
      .filter((r) => r.normalized.length >= MIN_NAME_LENGTH)

  const contractors = filterAndNormalize(contractorRes.records, 'Contractor')
  const companies = filterAndNormalize(companyRes.records, 'Company')
  const appointments = filterAndNormalize(appointmentRes.records, 'GovernmentAppointment')
  const officers = filterAndNormalize(officerRes.records, 'CompanyOfficer')

  // Early exit if entity set is too large for in-memory matching
  const maxPairwise = Math.max(
    contractors.length * companies.length,
    appointments.length * officers.length,
    contractors.length * officers.length,
  )
  if (maxPairwise > 5_000_000_000) {
    console.log(`  [name-match] WARNING: Pairwise comparison space too large (${maxPairwise.toExponential(1)}). Skipping fuzzy name matching.`)
    return []
  }

  console.log(`  [name-match] After filtering: contractors=${contractors.length}, companies=${companies.length}, appointments=${appointments.length}, officers=${officers.length}`)

  // Match Contractors to Companies by name
  console.log('  [name-match] Matching contractors <-> companies...')
  matchNamePair(contractors, companies, matches, matchedPairs)

  // Match GovernmentAppointments to CompanyOfficers by name
  console.log('  [name-match] Matching appointments <-> officers...')
  matchNamePair(appointments, officers, matches, matchedPairs)

  // Match Contractors to CompanyOfficers by name (person-based contractors)
  console.log('  [name-match] Matching contractors <-> officers...')
  matchNamePair(contractors, officers, matches, matchedPairs)

  console.log(`  [name-match] Done. Found ${matches.length} name matches.`)

  return matches
}

/**
 * Match two sets of entities by normalized name.
 * Exact normalized match = 0.8 confidence.
 * Levenshtein <= 2 = 0.6 confidence.
 * Skips ambiguous matches (multiple candidates).
 */
/** Max target set size for Levenshtein fuzzy loop (O(sources * targets)) */
const FUZZY_TARGET_CAP = 10_000

function matchNamePair(
  sources: readonly NameEntity[],
  targets: readonly NameEntity[],
  matches: CrossRefMatch[],
  matchedPairs: Set<string>,
): void {
  // Build target lookup by normalized name
  const targetByNorm = new Map<string, NameEntity[]>()
  for (const t of targets) {
    if (!t.normalized) continue
    const existing = targetByNorm.get(t.normalized) || []
    existing.push(t)
    targetByNorm.set(t.normalized, existing)
  }

  const skipFuzzy = targetByNorm.size > FUZZY_TARGET_CAP
  if (skipFuzzy) {
    console.log(`    [name-match] Target set too large (${targetByNorm.size} unique names > ${FUZZY_TARGET_CAP}), skipping Levenshtein - exact only`)
  }

  let processed = 0
  const totalSources = sources.length

  for (const source of sources) {
    processed++
    if (processed % 10_000 === 0) {
      console.log(`    [name-match] Progress: ${processed}/${totalSources} sources processed, ${matchedPairs.size} matches so far`)
    }
    if (!source.normalized) continue

    // Exact normalized match (Map lookup - O(1))
    const exactMatch = targetByNorm.get(source.normalized)
    if (exactMatch && exactMatch.length === 1) {
      const pairKey = `${source.id}::${exactMatch[0].id}`
      if (matchedPairs.has(pairKey)) continue
      matchedPairs.add(pairKey)

      matches.push({
        source_id: source.id,
        target_id: exactMatch[0].id,
        source_label: source.label,
        target_label: exactMatch[0].label,
        match_key: source.normalized,
        match_type: 'normalized_name',
        confidence: 0.8,
        evidence: `Name match: "${source.name}" (${source.label}) = "${exactMatch[0].name}" (${exactMatch[0].label})`,
      })
      continue
    }

    // Skip if exact match is ambiguous (multiple candidates)
    if (exactMatch && exactMatch.length > 1) continue

    // Skip Levenshtein when target set is too large
    if (skipFuzzy) continue

    // Fuzzy match: Levenshtein <= 2
    let bestDistance = Infinity
    let bestTarget: NameEntity | null = null
    let ambiguous = false

    for (const [norm, candidates] of targetByNorm) {
      if (Math.abs(source.normalized.length - norm.length) > 2) continue
      const dist = levenshtein(source.normalized, norm)
      if (dist <= 2) {
        if (candidates.length > 1) {
          ambiguous = true
          break
        }
        if (dist < bestDistance) {
          bestDistance = dist
          bestTarget = candidates[0]
          ambiguous = false
        } else if (dist === bestDistance && bestTarget && bestTarget.id !== candidates[0].id) {
          ambiguous = true
        }
      }
    }

    if (!ambiguous && bestTarget && bestDistance <= 2) {
      const pairKey = `${source.id}::${bestTarget.id}`
      if (matchedPairs.has(pairKey)) continue
      matchedPairs.add(pairKey)

      matches.push({
        source_id: source.id,
        target_id: bestTarget.id,
        source_label: source.label,
        target_label: bestTarget.label,
        match_key: source.normalized,
        match_type: 'fuzzy_name',
        confidence: 0.6,
        evidence: `Fuzzy name match (distance=${bestDistance}): "${source.name}" (${source.label}) ~ "${bestTarget.name}" (${bestTarget.label})`,
      })
    }
  }
}
