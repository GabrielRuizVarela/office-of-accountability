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
  return label ? (LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR) : DEFAULT_NODE_COLOR
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
