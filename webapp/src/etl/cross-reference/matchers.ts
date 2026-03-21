/**
 * Cross-reference matchers — three tiers of entity matching.
 *
 * Tier 1: CUIT (tax ID) — exact, confidence 1.0
 * Tier 2: DNI/CUIL (national ID) — exact after normalization, confidence 0.9-0.95
 * Tier 3: Name — normalized or fuzzy, confidence 0.6-0.8
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
 * Extract the DNI portion from a CUIL string.
 * CUIL format: XX-DDDDDDDD-X or XXDDDDDDDDX (11 digits).
 * The DNI is the middle 8 digits.
 */
function extractDniFromCuil(cuil: string): string {
  const digits = cuil.replace(/-/g, '').trim()
  if (digits.length === 11) {
    return digits.slice(2, 10)
  }
  return digits
}

// ---------------------------------------------------------------------------
// Tier 1: CUIT matching (Contractor <-> Company)
// ---------------------------------------------------------------------------

export async function matchByCuit(): Promise<CrossRefMatch[]> {
  // Fetch Contractors with non-empty CUIT
  const contractors = await readQuery(
    `MATCH (c:Contractor) WHERE c.cuit IS NOT NULL AND c.cuit <> ''
     RETURN c.contractor_id AS id, c.cuit AS cuit, c.name AS name`,
    {},
    (r) => ({
      id: r.get('id') as string,
      cuit: r.get('cuit') as string,
      name: r.get('name') as string,
    }),
  )

  // Fetch Companies with non-empty CUIT
  const companies = await readQuery(
    `MATCH (co:Company) WHERE co.cuit IS NOT NULL AND co.cuit <> ''
     RETURN co.igj_id AS id, co.cuit AS cuit, co.name AS name`,
    {},
    (r) => ({
      id: r.get('id') as string,
      cuit: r.get('cuit') as string,
      name: r.get('name') as string,
    }),
  )

  // Build lookup: normalized CUIT -> Company[]
  const companyByCuit = new Map<string, Array<{ id: string; cuit: string; name: string }>>()
  for (const co of companies.records) {
    const norm = normalizeCuit(co.cuit)
    if (!norm) continue
    const existing = companyByCuit.get(norm) || []
    existing.push(co)
    companyByCuit.set(norm, existing)
  }

  // Inner join on normalized CUIT
  const matches: CrossRefMatch[] = []
  for (const c of contractors.records) {
    const norm = normalizeCuit(c.cuit)
    if (!norm) continue
    const matched = companyByCuit.get(norm)
    if (!matched) continue

    for (const co of matched) {
      matches.push({
        source_id: c.id,
        target_id: co.id,
        source_label: 'Contractor',
        target_label: 'Company',
        match_key: norm,
        match_type: 'cuit',
        confidence: 1.0,
        evidence: `CUIT match: Contractor "${c.name}" (${c.cuit}) = Company "${co.name}" (${co.cuit})`,
      })
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Tier 2: DNI/CUIL matching (GovernmentAppointment <-> CompanyOfficer)
// ---------------------------------------------------------------------------

export async function matchByDni(): Promise<CrossRefMatch[]> {
  // GovernmentAppointments with DNI or CUIL
  const appointments = await readQuery(
    `MATCH (ga:GovernmentAppointment)
     WHERE (ga.dni IS NOT NULL AND ga.dni <> '') OR (ga.cuil IS NOT NULL AND ga.cuil <> '')
     RETURN ga.appointment_id AS id, ga.dni AS dni, ga.cuil AS cuil,
            ga.full_name AS name`,
    {},
    (r) => ({
      id: r.get('id') as string,
      dni: (r.get('dni') as string) || '',
      cuil: (r.get('cuil') as string) || '',
      name: r.get('name') as string,
    }),
  )

  // CompanyOfficers with DNI (document_type_code = '1')
  const officers = await readQuery(
    `MATCH (co:CompanyOfficer)
     WHERE co.document_type_code = '1' AND co.document_number IS NOT NULL AND co.document_number <> ''
     RETURN co.officer_id AS id, co.document_number AS dni, co.name AS name`,
    {},
    (r) => ({
      id: r.get('id') as string,
      dni: r.get('dni') as string,
      name: r.get('name') as string,
    }),
  )

  // Build lookup: DNI -> CompanyOfficer[]
  const officerByDni = new Map<string, Array<{ id: string; dni: string; name: string }>>()
  for (const o of officers.records) {
    const norm = o.dni.replace(/\D/g, '').trim()
    if (!norm) continue
    const existing = officerByDni.get(norm) || []
    existing.push(o)
    officerByDni.set(norm, existing)
  }

  const matches: CrossRefMatch[] = []

  for (const appt of appointments.records) {
    // Try DNI first, then extract from CUIL
    let dniValue = appt.dni.replace(/\D/g, '').trim()
    let matchType: 'dni' | 'cuil' = 'dni'
    let confidence = 0.95

    if (!dniValue && appt.cuil) {
      dniValue = extractDniFromCuil(appt.cuil)
      matchType = 'cuil'
      confidence = 0.9
    }

    if (!dniValue) continue

    const matched = officerByDni.get(dniValue)
    if (!matched) continue

    for (const officer of matched) {
      matches.push({
        source_id: appt.id,
        target_id: officer.id,
        source_label: 'GovernmentAppointment',
        target_label: 'CompanyOfficer',
        match_key: dniValue,
        match_type: matchType,
        confidence,
        evidence: `${matchType.toUpperCase()} match: Appointee "${appt.name}" (${matchType}=${dniValue}) = Officer "${officer.name}" (DNI=${officer.dni})`,
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

  // Fetch all entity types that might match by name (capped per type)
  const [contractorRes, companyRes, appointmentRes, officerRes] = await Promise.all([
    readQuery(
      `MATCH (c:Contractor) WHERE c.name IS NOT NULL AND c.name <> '' AND size(c.name) >= 3
       RETURN c.contractor_id AS id, c.name AS name
       LIMIT $limit`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
    readQuery(
      `MATCH (co:Company) WHERE co.name IS NOT NULL AND co.name <> '' AND size(co.name) >= 3
       RETURN co.igj_id AS id, co.name AS name
       LIMIT $limit`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
    readQuery(
      `MATCH (ga:GovernmentAppointment) WHERE ga.full_name IS NOT NULL AND ga.full_name <> '' AND size(ga.full_name) >= 3
       RETURN ga.appointment_id AS id, ga.full_name AS name
       LIMIT $limit`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
    readQuery(
      `MATCH (co:CompanyOfficer) WHERE co.name IS NOT NULL AND co.name <> '' AND size(co.name) >= 3
       RETURN co.officer_id AS id, co.name AS name
       LIMIT $limit`,
      { limit: NAME_MATCH_LIMIT },
      (r) => ({ id: r.get('id') as string, name: r.get('name') as string }),
    ),
  ])

  const totalEntities = contractorRes.records.length + companyRes.records.length +
    appointmentRes.records.length + officerRes.records.length
  console.log(`  [name-match] Fetched ${totalEntities} entities (contractors=${contractorRes.records.length}, companies=${companyRes.records.length}, appointments=${appointmentRes.records.length}, officers=${officerRes.records.length})`)

  // Filter out already-matched entities, normalize names, and require minimum length
  const filterAndNormalize = (
    records: { id: string; name: string }[],
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
    console.log('  [name-match] Consider using Neo4j fulltext search for fuzzy matching at this scale.')
    return []
  }

  console.log(`  [name-match] After filtering: contractors=${contractors.length}, companies=${companies.length}, appointments=${appointments.length}, officers=${officers.length}`)

  const matches: CrossRefMatch[] = []

  // Match Contractors to Companies by name
  console.log('  [name-match] Matching contractors <-> companies...')
  matchNamePair(contractors, companies, matches)

  // Match GovernmentAppointments to CompanyOfficers by name
  console.log('  [name-match] Matching appointments <-> officers...')
  matchNamePair(appointments, officers, matches)

  // Match Contractors to CompanyOfficers by name (person-based contractors)
  console.log('  [name-match] Matching contractors <-> officers...')
  matchNamePair(contractors, officers, matches)

  console.log(`  [name-match] Done. Found ${matches.length} name matches.`)

  return matches
}

/**
 * Match two sets of entities by normalized name.
 * Exact normalized match = 0.8 confidence.
 * Levenshtein <= 2 = 0.6 confidence.
 * Skips ambiguous matches (multiple candidates).
 */
function matchNamePair(
  sources: readonly NameEntity[],
  targets: readonly NameEntity[],
  matches: CrossRefMatch[],
): void {
  // Build target lookup by normalized name
  const targetByNorm = new Map<string, NameEntity[]>()
  for (const t of targets) {
    if (!t.normalized) continue
    const existing = targetByNorm.get(t.normalized) || []
    existing.push(t)
    targetByNorm.set(t.normalized, existing)
  }

  const matchedPairs = new Set<string>()
  let processed = 0
  const totalSources = sources.length

  for (const source of sources) {
    processed++
    if (processed % 10_000 === 0) {
      console.log(`    [name-match] Progress: ${processed}/${totalSources} sources processed, ${matchedPairs.size} matches so far`)
    }
    if (!source.normalized) continue

    // Exact normalized match
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
