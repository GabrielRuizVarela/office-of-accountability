/**
 * Nuclear-relevant keyword filter for incoming RSS/API data.
 *
 * Filters raw feed items to only those containing nuclear-relevant terms.
 * Reduces noise before loading into Neo4j.
 */

/** Keywords that indicate nuclear relevance (case-insensitive) */
const NUCLEAR_KEYWORDS = [
  // Weapons & tests
  'nuclear', 'atomic', 'warhead', 'thermonuclear', 'hydrogen bomb',
  'nuclear test', 'nuclear weapon', 'nuclear arsenal', 'nuclear stockpile',
  'fissile material', 'weapons-grade', 'plutonium', 'highly enriched uranium',
  'HEU', 'WMD', 'weapons of mass destruction',

  // Delivery systems
  'ICBM', 'SLBM', 'ballistic missile', 'cruise missile', 'hypersonic',
  'missile launch', 'missile test', 'missile defense', 'anti-ballistic',
  'Minuteman', 'Trident', 'Topol', 'Sarmat', 'DF-41', 'DF-5',
  'Hwasong', 'Shaheen', 'Agni', 'Jericho',

  // Treaties & organizations
  'NPT', 'Non-Proliferation Treaty', 'New START', 'CTBT',
  'INF Treaty', 'JCPOA', 'Iran deal', 'IAEA', 'CTBTO',
  'arms control', 'disarmament', 'non-proliferation', 'proliferation',
  'nuclear safeguards', 'nuclear inspection',

  // Facilities & programs
  'enrichment', 'centrifuge', 'reprocessing', 'nuclear reactor',
  'Natanz', 'Fordow', 'Yongbyon', 'Dimona', 'Punggye-ri',
  'nuclear facility', 'nuclear plant', 'nuclear program',

  // Escalation indicators
  'nuclear threat', 'nuclear deterrence', 'nuclear posture',
  'first strike', 'second strike', 'nuclear doctrine',
  'DEFCON', 'nuclear alert', 'nuclear readiness',
  'doomsday clock', 'nuclear risk', 'nuclear escalation',

  // Military nuclear
  'strategic forces', 'nuclear submarine', 'nuclear bomber',
  'nuclear triad', 'tactical nuclear', 'battlefield nuclear',
  'STRATCOM', 'Strategic Command',
]

/** Compiled lowercase keywords for fast matching */
const KEYWORDS_LOWER = NUCLEAR_KEYWORDS.map((k) => k.toLowerCase())

/**
 * Check if a text string contains any nuclear-relevant keywords.
 */
export function isNuclearRelevant(text: string): boolean {
  const lower = text.toLowerCase()
  return KEYWORDS_LOWER.some((keyword) => lower.includes(keyword))
}

/**
 * Filter an array of items to only those with nuclear-relevant content.
 *
 * @param items - Array of objects with text fields
 * @param textFields - Which fields to check for keywords
 */
export function filterNuclearRelevant<T extends Record<string, unknown>>(
  items: T[],
  textFields: (keyof T)[],
): T[] {
  return items.filter((item) => {
    const text = textFields
      .map((field) => String(item[field] ?? ''))
      .join(' ')
    return isNuclearRelevant(text)
  })
}

/**
 * Count keyword matches in a text string.
 * Useful for ranking signal relevance.
 */
export function countNuclearKeywords(text: string): number {
  const lower = text.toLowerCase()
  return KEYWORDS_LOWER.filter((keyword) => lower.includes(keyword)).length
}
