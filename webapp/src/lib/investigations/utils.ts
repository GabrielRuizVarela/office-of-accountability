/**
 * Investigation utilities — ID generation and slug helpers.
 *
 * Neo4j Community Edition lacks composite uniqueness constraints,
 * so node IDs are prefixed with the caso_slug for global uniqueness.
 */

/**
 * Generate a globally unique node ID by prefixing the caso slug.
 *
 * @example casoNodeId('caso-libra', 'cl-person-milei') => 'caso-libra:cl-person-milei'
 */
export function casoNodeId(casoSlug: string, localId: string): string {
  return `${casoSlug}:${localId}`
}

/**
 * Extract the local ID from a prefixed caso node ID.
 *
 * @example localIdFromCasoNodeId('caso-libra:cl-person-milei') => 'cl-person-milei'
 */
export function localIdFromCasoNodeId(prefixedId: string): string {
  const colonIdx = prefixedId.indexOf(':')
  return colonIdx === -1 ? prefixedId : prefixedId.slice(colonIdx + 1)
}

/**
 * Extract the caso slug from a prefixed caso node ID.
 *
 * @example casoSlugFromNodeId('caso-libra:cl-person-milei') => 'caso-libra'
 */
export function casoSlugFromNodeId(prefixedId: string): string {
  const colonIdx = prefixedId.indexOf(':')
  return colonIdx === -1 ? prefixedId : prefixedId.slice(0, colonIdx)
}

/**
 * Generate a URL-safe slug from a display name.
 *
 * Lowercases, replaces spaces/special chars with hyphens, removes accents.
 */
export function generateSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

/** Known caso slugs for validation. */
export const VALID_CASO_SLUGS = [
  'caso-libra',
  'caso-finanzas-politicas',
  'caso-epstein',
] as const

export type CasoSlug = (typeof VALID_CASO_SLUGS)[number]

export function isValidCasoSlug(slug: string): slug is CasoSlug {
  // Accept static slugs directly
  if ((VALID_CASO_SLUGS as readonly string[]).includes(slug)) return true
  // Accept any slug matching the caso- prefix pattern (dynamic investigations)
  return /^caso-[a-z0-9-]+$/.test(slug)
}
