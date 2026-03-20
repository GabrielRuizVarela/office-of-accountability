import { getDriver } from '../neo4j/client'
import type { DedupResult } from './types'

const FUZZY_THRESHOLD = 2

/** Normalize a name for comparison: lowercase, strip accents, collapse whitespace */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Levenshtein distance between two strings */
export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/** Slugify a name for slug-based matching */
export function toSlug(name: string): string {
  return normalizeName(name).replace(/\s+/g, '-')
}

export interface DedupMatch {
  result: DedupResult
  existingId: string | null
  existingName: string | null
  distance: number
}

/**
 * Check an incoming name against a map of existing names.
 * existingEntries: Map<normalizedName, { id, originalName }>
 * Also checks slug match.
 */
export function dedup(
  incomingName: string,
  existingEntries: Map<string, { id: string; name: string }>,
  existingSlugs: Map<string, { id: string; name: string }>,
): DedupMatch {
  const normalized = normalizeName(incomingName)
  const slug = toSlug(incomingName)

  // Exact normalized name match
  const exact = existingEntries.get(normalized)
  if (exact) {
    return { result: 'exact_match', existingId: exact.id, existingName: exact.name, distance: 0 }
  }

  // Exact slug match
  const slugMatch = existingSlugs.get(slug)
  if (slugMatch) {
    return { result: 'exact_match', existingId: slugMatch.id, existingName: slugMatch.name, distance: 0 }
  }

  // Fuzzy match: check Levenshtein against all existing
  let bestDistance = Infinity
  let bestMatch: { id: string; name: string } | null = null

  for (const [existingNorm, entry] of existingEntries) {
    if (Math.abs(normalized.length - existingNorm.length) > FUZZY_THRESHOLD) continue
    const dist = levenshtein(normalized, existingNorm)
    if (dist <= FUZZY_THRESHOLD && dist < bestDistance) {
      bestDistance = dist
      bestMatch = entry
    }
  }

  if (bestMatch) {
    return { result: 'fuzzy_match', existingId: bestMatch.id, existingName: bestMatch.name, distance: bestDistance }
  }

  return { result: 'no_match', existingId: null, existingName: null, distance: -1 }
}

/**
 * Build maps of existing entity names and slugs for deduplication.
 * Queries all nodes with the given caso_slug that have a name property.
 */
export async function buildExistingMaps(casoSlug: string): Promise<{
  nameMap: Map<string, { id: string; name: string }>
  slugMap: Map<string, { id: string; name: string }>
}> {
  const session = getDriver().session()
  try {
    const result = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.name IS NOT NULL
       RETURN n.id AS id, n.name AS name, n.slug AS slug`,
      { casoSlug },
    )
    const nameMap = new Map<string, { id: string; name: string }>()
    const slugMap = new Map<string, { id: string; name: string }>()
    for (const record of result.records) {
      const id = record.get('id') as string
      const name = record.get('name') as string
      const slug = record.get('slug') as string | null
      const entry = { id, name }
      nameMap.set(normalizeName(name), entry)
      if (slug) slugMap.set(slug, entry)
    }
    return { nameMap, slugMap }
  } finally {
    await session.close()
  }
}
