/**
 * Investigation standardization types (Milestone 9).
 *
 * Shared across seed scripts, query builder, API routes, and frontend.
 * All investigation data uses generic Neo4j labels with `caso_slug`
 * namespace isolation.
 */

// ---------------------------------------------------------------------------
// Bilingual text
// ---------------------------------------------------------------------------

export interface BilingualText {
  readonly es: string
  readonly en: string
}

// ---------------------------------------------------------------------------
// Neo4j schema types (stored as nodes in the graph)
// ---------------------------------------------------------------------------

export interface InvestigationConfig {
  readonly id: string // "caso-libra", "caso-finanzas-politicas", "caso-epstein"
  readonly name: string
  readonly description: string
  readonly caso_slug: string // Namespace key - matches caso_slug on all data nodes
  readonly status: 'active' | 'draft' | 'archived'
  readonly created_at: string
  readonly tags: string[]
}

export interface NodeTypeDefinition {
  readonly name: string // e.g. "Person", "Organization", "Token"
  readonly properties_json: string // JSON-encoded array of property descriptors
  readonly color: string // hex color for graph visualization
  readonly icon: string // icon identifier
}

export interface RelTypeDefinition {
  readonly name: string // e.g. "CONTROLS", "SENT"
  readonly from_types: string // comma-separated source node types
  readonly to_types: string // comma-separated target node types
}

export interface InvestigationSchema {
  readonly nodeTypes: readonly NodeTypeDefinition[]
  readonly relTypes: readonly RelTypeDefinition[]
}

// ---------------------------------------------------------------------------
// Generic investigation node (returned by query builder)
// ---------------------------------------------------------------------------

export interface InvestigationNode {
  readonly id: string
  readonly label: string // Neo4j label (Person, Event, Document, etc.)
  readonly labels: readonly string[] // Array form for GraphNode compatibility
  readonly caso_slug: string
  readonly properties: Record<string, unknown>
  // Common fields extracted from properties for convenience
  readonly name?: string
  readonly slug?: string
  readonly description?: string
}

export interface InvestigationRelationship {
  readonly id: string
  readonly type: string // Neo4j relationship type
  readonly source: string // source node id
  readonly target: string // target node id
  readonly properties: Record<string, unknown>
}

export interface GraphData {
  readonly nodes: readonly InvestigationNode[]
  readonly links: readonly InvestigationRelationship[]
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export interface TimelineItem {
  readonly id: string
  readonly title: string | BilingualText
  readonly description: string | BilingualText
  readonly date: string
  readonly event_type?: EventType
  readonly category?: string
  readonly source_url?: string | null
  readonly actors?: readonly { readonly id: string; readonly name: string }[]
}

// ---------------------------------------------------------------------------
// Shared event type config (superset of all investigations)
// ---------------------------------------------------------------------------

export type EventType = 'political' | 'financial' | 'legal' | 'media' | 'corporate'

export const EVENT_TYPE_COLORS: Readonly<Record<EventType, string>> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  media: '#a855f7',
  corporate: '#f59e0b',
}

export const EVENT_TYPE_LABELS: Readonly<Record<EventType, string>> = {
  political: 'Politico',
  financial: 'Financiero',
  legal: 'Legal',
  media: 'Medios',
  corporate: 'Corporativo',
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface InvestigationStats {
  readonly totalNodes: number
  readonly totalRelationships: number
  readonly nodeCountsByType: Record<string, number>
}

// ---------------------------------------------------------------------------
// Client config (static, used by frontend for rendering)
// ---------------------------------------------------------------------------

export type TabId =
  | 'resumen'
  | 'investigacion'
  | 'cronologia'
  | 'evidencia'
  | 'grafo'
  | 'dinero'
  | 'simular'
  | 'vuelos'
  | 'proximidad'
  | 'conexiones'

export interface NarrativeChapter {
  readonly id: string
  readonly title: BilingualText
  readonly paragraphs: readonly BilingualText[]
  readonly pullQuote?: BilingualText
  readonly citations?: readonly { readonly id: number; readonly text: string; readonly url?: string }[]
}

export interface InvestigationClientConfig {
  readonly casoSlug: string
  readonly name: BilingualText
  readonly description: BilingualText
  readonly tabs: readonly TabId[]
  readonly features: {
    readonly wallets: boolean
    readonly simulation: boolean
    readonly flights: boolean
    readonly submissions: boolean
    readonly platformGraph: boolean
  }
  readonly hero: {
    readonly title: BilingualText
    readonly subtitle: BilingualText
  }
  readonly chapters?: readonly NarrativeChapter[]
  readonly sources?: readonly { readonly name: string; readonly url: string }[]
}

// ---------------------------------------------------------------------------
// Query builder interface
// ---------------------------------------------------------------------------

export interface PaginationOpts {
  readonly limit?: number
  readonly offset?: number
}

export interface InvestigationQueryBuilder {
  getGraph(casoSlug: string): Promise<GraphData>
  getNodesByType(
    casoSlug: string,
    nodeType: string,
    opts?: PaginationOpts,
  ): Promise<InvestigationNode[]>
  getNodeBySlug(
    casoSlug: string,
    nodeType: string,
    slug: string,
  ): Promise<InvestigationNode | null>
  getNodeConnections(casoSlug: string, nodeId: string, depth?: number): Promise<GraphData>
  getTimeline(casoSlug: string): Promise<TimelineItem[]>
  getStats(casoSlug: string): Promise<InvestigationStats>
  getConfig(casoSlug: string): Promise<InvestigationConfig>
  getSchema(casoSlug: string): Promise<InvestigationSchema>
  getNodeTypes(casoSlug: string): Promise<NodeTypeDefinition[]>
  getRelTypes(casoSlug: string): Promise<RelTypeDefinition[]>
}
