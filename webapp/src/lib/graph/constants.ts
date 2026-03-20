import type { GraphNode } from '../neo4j/types'

// ---------------------------------------------------------------------------
// Node label → color mapping (superset across all graph components)
// ---------------------------------------------------------------------------

export const LABEL_COLORS: Readonly<Record<string, string>> = {
  // Argentine politics types
  Politician: '#3b82f6', // blue-500
  Party: '#8b5cf6', // violet-500
  Province: '#10b981', // emerald-500
  LegislativeVote: '#f59e0b', // amber-500
  Legislation: '#ef4444', // red-500
  Investigation: '#ec4899', // pink-500
  User: '#6b7280', // gray-500
  // Epstein investigation node types
  Person: '#3b82f6', // blue-500
  Flight: '#f97316', // orange-500
  Location: '#10b981', // emerald-500
  Document: '#ef4444', // red-500
  Event: '#f59e0b', // amber-500
  Organization: '#8b5cf6', // violet-500
  LegalCase: '#ec4899', // pink-500
}

export const DEFAULT_NODE_COLOR = '#94a3b8' // slate-400

// ---------------------------------------------------------------------------
// Node subcategories — fine-grained categories within large groups (Person, etc.)
// ---------------------------------------------------------------------------

/** Canonical subcategories for Person nodes */
export const PERSON_CATEGORY_COLORS: Readonly<Record<string, string>> = {
  'Key Figure':  '#dc2626', // red-600
  'Victim':      '#f59e0b', // amber-500
  'Associate':   '#6366f1', // indigo-500
  'Legal':       '#14b8a6', // teal-500
  'Political':   '#8b5cf6', // violet-500
  'Business':    '#22c55e', // green-500
  'Staff':       '#f97316', // orange-500
  'Intelligence': '#ec4899', // pink-500
  'Media':       '#06b6d4', // cyan-500
  'Other':       '#3b82f6', // blue-500 (default Person color)
}

export const PERSON_CATEGORY_DISPLAY: Readonly<Record<string, string>> = {
  'Key Figure':  'Figura clave',
  'Victim':      'Víctima',
  'Associate':   'Asociado',
  'Legal':       'Legal',
  'Political':   'Político',
  'Business':    'Empresarial',
  'Staff':       'Personal',
  'Intelligence': 'Inteligencia',
  'Media':       'Medios',
  'Other':       'Otro',
}

/** Canonical subcategories for Document nodes */
export const DOCUMENT_CATEGORY_COLORS: Readonly<Record<string, string>> = {
  'Court Filing': '#ef4444', // red-500
  'Flight Log':   '#f97316', // orange-500
  'Media':        '#06b6d4', // cyan-500
  'Research':     '#a855f7', // purple-500
  'Other':        '#ef4444', // red-500 (default Document color)
}

export const DOCUMENT_CATEGORY_DISPLAY: Readonly<Record<string, string>> = {
  'Court Filing': 'Judicial',
  'Flight Log':   'Vuelo',
  'Media':        'Medios',
  'Research':     'Investigación',
  'Other':        'Otro',
}

/** All subcategory configs keyed by node label */
export const SUBCATEGORY_CONFIGS: Readonly<Record<string, {
  colors: Readonly<Record<string, string>>
  display: Readonly<Record<string, string>>
}>> = {
  Person: { colors: PERSON_CATEGORY_COLORS, display: PERSON_CATEGORY_DISPLAY },
  Document: { colors: DOCUMENT_CATEGORY_COLORS, display: DOCUMENT_CATEGORY_DISPLAY },
}

// ---------------------------------------------------------------------------
// Category extraction — normalises category/person_type/role → canonical name
// ---------------------------------------------------------------------------

const PERSON_CATEGORY_KEYWORDS: ReadonlyArray<[string, readonly string[]]> = [
  ['Key Figure', ['epstein', 'maxwell', 'convicted sex', 'sex trafficker']],
  ['Victim', ['victim', 'accuser', 'survivor', 'alleged victim', 'key accuser']],
  ['Legal', ['attorney', 'lawyer', 'judge', 'prosecutor', 'legal', 'counsel']],
  ['Political', ['president', 'senator', 'governor', 'politician', 'prince', 'duke', 'political', 'diplomat', 'ambassador', 'secretary of state']],
  ['Business', ['ceo', 'executive', 'financier', 'founder', 'investor', 'hedge fund', 'banker', 'billionaire', 'co-founder', 'managing director']],
  ['Staff', ['pilot', 'assistant', 'housekeeper', 'butler', 'employee', 'chef', 'bodyguard', 'driver', 'staff', 'scheduler']],
  ['Intelligence', ['cia', 'fbi', 'mi6', 'mi5', 'mossad', 'intelligence', 'agent']],
  ['Media', ['journalist', 'reporter', 'editor', 'media', 'entertainer', 'illusionist', 'actor', 'model']],
  ['Associate', ['associate', 'socialite', 'friend', 'acquaintance', 'modeling agent']],
]

/** Derive canonical subcategory for a graph node */
export function getNodeCategory(node: GraphNode): string | null {
  const label = node.labels[0]
  if (!label || !SUBCATEGORY_CONFIGS[label]) return null

  const props = node.properties as Record<string, unknown>

  if (label === 'Person') {
    // Wave 2 explicit category
    const cat = (typeof props.category === 'string' ? props.category : '').toLowerCase()
    // Wave 1 person_type
    const personType = (typeof props.person_type === 'string' ? props.person_type : '').toLowerCase()
    // Wave 0 role
    const role = (typeof props.role === 'string' ? props.role : '').toLowerCase()
    // Combined text for keyword matching
    const combined = `${cat} ${personType} ${role}`

    if (!combined.trim()) return 'Other'

    for (const [category, keywords] of PERSON_CATEGORY_KEYWORDS) {
      for (const keyword of keywords) {
        if (combined.includes(keyword)) return category
      }
    }
    return 'Other'
  }

  if (label === 'Document') {
    const cat = (typeof props.category === 'string' ? props.category : '').toLowerCase()
    const title = (typeof props.title === 'string' ? props.title : '').toLowerCase()
    const combined = `${cat} ${title}`

    if (combined.includes('court') || combined.includes('legal') || combined.includes('deposition') || combined.includes('indictment')) return 'Court Filing'
    if (combined.includes('flight') || combined.includes('log') || combined.includes('manifest')) return 'Flight Log'
    if (combined.includes('article') || combined.includes('news') || combined.includes('media') || combined.includes('press')) return 'Media'
    if (combined.includes('research') || combined.includes('report') || combined.includes('analysis')) return 'Research'
    return 'Other'
  }

  return null
}

// ---------------------------------------------------------------------------
// Node label → display name mapping (superset across all graph components)
// ---------------------------------------------------------------------------

export const LABEL_DISPLAY: Readonly<Record<string, string>> = {
  // Argentine politics types
  Politician: 'Politico',
  Party: 'Partido',
  Province: 'Provincia',
  LegislativeVote: 'Votacion',
  Legislation: 'Legislacion',
  Investigation: 'Investigacion',
  User: 'Usuario',
  // Epstein investigation node types
  Person: 'Persona',
  Flight: 'Vuelo',
  Location: 'Ubicacion',
  Document: 'Documento',
  Event: 'Evento',
  Organization: 'Organizacion',
  LegalCase: 'Caso Legal',
}

// ---------------------------------------------------------------------------
// Link type → color mapping (from ForceGraph's linkColor switch)
// ---------------------------------------------------------------------------

export const LINK_COLORS: Readonly<Record<string, string>> = {
  CAST_VOTE: '#475569', // slate-600
  MEMBER_OF: '#7c3aed', // violet-600
  REPRESENTS: '#059669', // emerald-600
  REFERENCES: '#dc2626', // red-600
  // Epstein investigation relationship types
  ASSOCIATED_WITH: '#6366f1', // indigo-500
  FLEW_WITH: '#f97316', // orange-500
  VISITED: '#10b981', // emerald-500
  OWNED: '#a855f7', // purple-500
  EMPLOYED_BY: '#8b5cf6', // violet-500
  AFFILIATED_WITH: '#8b5cf6', // violet-500
  MENTIONED_IN: '#ef4444', // red-500
  PARTICIPATED_IN: '#f59e0b', // amber-500
  FILED_IN: '#ec4899', // pink-500
  DOCUMENTED_BY: '#ec4899', // pink-500
  FINANCED: '#22c55e', // green-500
}

export const DEFAULT_LINK_COLOR = '#334155' // slate-700

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getNodeColor(node: GraphNode): string {
  const label = node.labels[0]
  if (!label) return DEFAULT_NODE_COLOR

  // Use subcategory color when available
  const config = SUBCATEGORY_CONFIGS[label]
  if (config) {
    const category = getNodeCategory(node)
    if (category && config.colors[category]) return config.colors[category]
  }

  return LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR
}

export function getNodeLabel(node: GraphNode): string {
  const props = node.properties
  if (typeof props.name === 'string') return props.name
  if (typeof props.title === 'string') return props.title
  if (typeof props.full_name === 'string') return props.full_name
  return node.id
}

export function getLabelColor(label: string): string {
  return LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR
}

export function getLabelDisplayName(label: string): string {
  return LABEL_DISPLAY[label] ?? label
}

export function getLinkColor(type: string): string {
  return LINK_COLORS[type] ?? DEFAULT_LINK_COLOR
}
