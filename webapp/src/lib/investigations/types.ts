/**
 * Shared types for the investigation standardization system.
 *
 * These types define the common data model that all investigations
 * (caso-libra, caso-finanzas-politicas, caso-epstein) share.
 */

// ---------------------------------------------------------------------------
// Bilingual text
// ---------------------------------------------------------------------------

export interface BilingualText {
  readonly es: string
  readonly en: string
}

// ---------------------------------------------------------------------------
// Investigation configuration (stored in Neo4j)
// ---------------------------------------------------------------------------

export interface InvestigationConfig {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly caso_slug: string
  readonly status: 'active' | 'draft' | 'archived'
  readonly created_at: string
  readonly tags: readonly string[]
}

// ---------------------------------------------------------------------------
// Client-side investigation configuration (defined in code)
// ---------------------------------------------------------------------------

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
  readonly sources?: ReadonlyArray<{ readonly name: string; readonly url: string }>
}

// ---------------------------------------------------------------------------
// Narrative chapters (for /resumen editorial content)
// ---------------------------------------------------------------------------

export interface NarrativeChapter {
  readonly id: string
  readonly title: BilingualText
  readonly paragraphs: readonly BilingualText[]
  readonly pullQuote?: BilingualText
  readonly citations?: ReadonlyArray<{
    readonly id: number
    readonly text: string
    readonly url?: string
  }>
}

// ---------------------------------------------------------------------------
// Tab identifiers
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

// ---------------------------------------------------------------------------
// Schema system — node and relationship type definitions
// ---------------------------------------------------------------------------

export interface NodeTypeDefinition {
  readonly name: string
  readonly properties_json: string
  readonly color: string
  readonly icon: string
}

export interface RelTypeDefinition {
  readonly name: string
  readonly from_types: readonly string[]
  readonly to_types: readonly string[]
  readonly properties_json: string
}

export interface InvestigationSchema {
  readonly nodeTypes: readonly NodeTypeDefinition[]
  readonly relTypes: readonly RelTypeDefinition[]
}

// ---------------------------------------------------------------------------
// Generic investigation node (returned by the query builder)
// ---------------------------------------------------------------------------

export interface InvestigationNode {
  readonly id: string
  readonly label: string
  readonly caso_slug: string
  readonly slug: string
  readonly properties: Readonly<Record<string, unknown>>
  readonly color: string
  readonly icon: string
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export interface InvestigationStats {
  readonly nodeCounts: Readonly<Record<string, number>>
  readonly relationshipCount: number
  readonly nodeCount: number
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationOpts {
  readonly limit?: number
  readonly offset?: number
  readonly orderBy?: string
  readonly orderDir?: 'ASC' | 'DESC'
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export interface TimelineItem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly date: string
  readonly event_type: string
  readonly source_url: string | null
  readonly actors: ReadonlyArray<{ readonly id: string; readonly name: string }>
}
