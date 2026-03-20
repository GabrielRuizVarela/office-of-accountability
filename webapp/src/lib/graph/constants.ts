import type { GraphNode } from '../neo4j/types'

// ---------------------------------------------------------------------------
// Label → color mapping (all known node types)
// ---------------------------------------------------------------------------

export const LABEL_COLORS: Readonly<Record<string, string>> = {
  // Argentine politics
  Politician: '#3b82f6', // blue-500
  Party: '#8b5cf6', // violet-500
  Province: '#10b981', // emerald-500
  LegislativeVote: '#f59e0b', // amber-500
  Legislation: '#ef4444', // red-500
  Investigation: '#ec4899', // pink-500
  User: '#6b7280', // gray-500
  // Caso Libra node types
  CasoLibraPerson: '#3b82f6', // blue-500
  CasoLibraEvent: '#f59e0b', // amber-500
  CasoLibraDocument: '#ef4444', // red-500
  CasoLibraWallet: '#10b981', // emerald-500
  CasoLibraOrganization: '#8b5cf6', // violet-500
  CasoLibraToken: '#ec4899', // pink-500
  // Epstein investigation types
  Person: '#6366f1', // indigo-500
  Flight: '#0ea5e9', // sky-500
  Location: '#22c55e', // green-500
  Document: '#ef4444', // red-500
  Event: '#f59e0b', // amber-500
  Organization: '#8b5cf6', // violet-500
  LegalCase: '#14b8a6', // teal-500
}

export const DEFAULT_NODE_COLOR = '#94a3b8' // slate-400

// ---------------------------------------------------------------------------
// Label → display name
// ---------------------------------------------------------------------------

export const LABEL_DISPLAY: Readonly<Record<string, string>> = {
  Politician: 'Politicos',
  Party: 'Partidos',
  Province: 'Provincias',
  LegislativeVote: 'Votaciones',
  Legislation: 'Legislacion',
  Investigation: 'Investigaciones',
  User: 'Usuarios',
  CasoLibraPerson: 'Personas (Libra)',
  CasoLibraEvent: 'Eventos (Libra)',
  CasoLibraDocument: 'Documentos (Libra)',
  CasoLibraWallet: 'Wallets (Libra)',
  CasoLibraOrganization: 'Organizaciones (Libra)',
  CasoLibraToken: 'Tokens (Libra)',
  Person: 'Personas',
  Flight: 'Vuelos',
  Location: 'Ubicaciones',
  Document: 'Documentos',
  Event: 'Eventos',
  Organization: 'Organizaciones',
  LegalCase: 'Casos Legales',
}

// ---------------------------------------------------------------------------
// Link → color mapping
// ---------------------------------------------------------------------------

export const LINK_COLORS: Readonly<Record<string, string>> = {
  CAST_VOTE: '#475569', // slate-600
  MEMBER_OF: '#7c3aed', // violet-600
  REPRESENTS: '#059669', // emerald-600
  REFERENCES: '#dc2626', // red-600
  FLEW_ON: '#0284c7', // sky-600
  ASSOCIATED_WITH: '#4f46e5', // indigo-600
  EMPLOYED_BY: '#0d9488', // teal-600
  LOCATED_AT: '#16a34a', // green-600
  MENTIONED_IN: '#d97706', // amber-600
  CHARGED_IN: '#dc2626', // red-600
  VICTIM_OF: '#e11d48', // rose-600
  WITNESS_IN: '#9333ea', // purple-600
}

export const DEFAULT_LINK_COLOR = '#334155' // slate-700

// ---------------------------------------------------------------------------
// Person subcategory system
// ---------------------------------------------------------------------------

export const PERSON_CATEGORY_COLORS: Readonly<Record<string, string>> = {
  'Key Figure': '#dc2626', // red-600
  Victim: '#f59e0b', // amber-500
  Associate: '#6366f1', // indigo-500
  Legal: '#14b8a6', // teal-500
  Political: '#8b5cf6', // violet-500
  Business: '#22c55e', // green-500
  Staff: '#f97316', // orange-500
  Intelligence: '#ec4899', // pink-500
  Media: '#06b6d4', // cyan-500
  Other: '#3b82f6', // blue-500
}

export const PERSON_CATEGORY_DISPLAY: Readonly<Record<string, string>> = {
  'Key Figure': 'Figura Clave',
  Victim: 'Victima',
  Associate: 'Asociado',
  Legal: 'Legal',
  Political: 'Politico',
  Business: 'Negocios',
  Staff: 'Personal',
  Intelligence: 'Inteligencia',
  Media: 'Medios',
  Other: 'Otro',
}

/** Labels that support subcategory breakdown */
export const SUBCATEGORY_CONFIGS: Readonly<
  Record<string, { colors: Readonly<Record<string, string>>; display: Readonly<Record<string, string>> }>
> = {
  Person: {
    colors: PERSON_CATEGORY_COLORS,
    display: PERSON_CATEGORY_DISPLAY,
  },
}

// ---------------------------------------------------------------------------
// Category derivation from node properties
// ---------------------------------------------------------------------------

const KEY_FIGURE_KEYWORDS = ['epstein', 'maxwell', 'ghislaine', 'jeffrey']
const VICTIM_KEYWORDS = ['victim', 'survivor', 'minor', 'jane doe', 'john doe']
const LEGAL_KEYWORDS = ['judge', 'attorney', 'lawyer', 'prosecutor', 'fbi', 'detective', 'agent', 'law enforcement', 'police']
const POLITICAL_KEYWORDS = ['senator', 'governor', 'president', 'politician', 'congressman', 'political', 'minister', 'prince', 'royal']
const BUSINESS_KEYWORDS = ['ceo', 'executive', 'investor', 'banker', 'business', 'finance', 'hedge fund', 'venture']
const STAFF_KEYWORDS = ['pilot', 'butler', 'maid', 'assistant', 'driver', 'housekeeper', 'chef', 'scheduler', 'secretary', 'employee', 'staff']
const INTELLIGENCE_KEYWORDS = ['cia', 'mossad', 'intelligence', 'spy', 'mi6', 'mi5', 'nsa']
const MEDIA_KEYWORDS = ['journalist', 'reporter', 'media', 'editor', 'publisher', 'anchor', 'correspondent']

function matchesAny(text: string, keywords: readonly string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(kw))
}

/** Derive a person subcategory from node properties */
export function getNodeCategory(node: GraphNode): string {
  const props = node.properties
  // Explicit category property takes priority
  const explicit = props.category ?? props.person_type ?? props.subcategory
  if (typeof explicit === 'string' && explicit in PERSON_CATEGORY_COLORS) {
    return explicit
  }

  // Build a searchable text blob from relevant properties
  const parts: string[] = []
  for (const key of ['name', 'full_name', 'role', 'title', 'description', 'category', 'person_type', 'occupation'] as const) {
    const v = props[key]
    if (typeof v === 'string') parts.push(v)
  }
  const text = parts.join(' ')
  if (!text) return 'Other'

  if (matchesAny(text, KEY_FIGURE_KEYWORDS)) return 'Key Figure'
  if (matchesAny(text, VICTIM_KEYWORDS)) return 'Victim'
  if (matchesAny(text, INTELLIGENCE_KEYWORDS)) return 'Intelligence'
  if (matchesAny(text, LEGAL_KEYWORDS)) return 'Legal'
  if (matchesAny(text, POLITICAL_KEYWORDS)) return 'Political'
  if (matchesAny(text, STAFF_KEYWORDS)) return 'Staff'
  if (matchesAny(text, MEDIA_KEYWORDS)) return 'Media'
  if (matchesAny(text, BUSINESS_KEYWORDS)) return 'Business'

  return 'Other'
}

// ---------------------------------------------------------------------------
// Color / label helpers
// ---------------------------------------------------------------------------

/** Get the rendered color for a node — uses subcategory colors for Person */
export function getNodeColor(node: GraphNode): string {
  const label = node.labels[0]
  if (!label) return DEFAULT_NODE_COLOR

  if (label in SUBCATEGORY_CONFIGS) {
    const category = getNodeCategory(node)
    return SUBCATEGORY_CONFIGS[label].colors[category] ?? DEFAULT_NODE_COLOR
  }

  return LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR
}

/** Get a human-readable label for a node (name / title / id) */
export function getNodeLabel(node: GraphNode): string {
  const props = node.properties
  if (typeof props.name === 'string') return props.name
  if (typeof props.title === 'string') return props.title
  if (typeof props.full_name === 'string') return props.full_name
  return node.id
}

/** Get the color for a label type */
export function getLabelColor(label: string): string {
  return LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR
}

/** Get the display name for a label type */
export function getLabelDisplayName(label: string): string {
  return LABEL_DISPLAY[label] ?? label
}

/** Get the color for a relationship type */
export function getLinkColor(type: string): string {
  return LINK_COLORS[type] ?? DEFAULT_LINK_COLOR
}
