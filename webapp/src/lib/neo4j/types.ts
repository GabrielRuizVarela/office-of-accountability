/** Data provenance tier - reflects source reliability */
export type DataTier = 'gold' | 'silver' | 'bronze'

/** Provenance metadata attached to every node and relationship */
export interface Provenance {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: DataTier
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

/** Graph node as returned by Neo4j queries */
export interface GraphNode {
  readonly id: string
  readonly labels: readonly string[]
  readonly properties: Readonly<Record<string, unknown>>
}

/** Graph relationship as returned by Neo4j queries */
export interface GraphRelationship {
  readonly id: string
  readonly type: string
  readonly startNodeId: string
  readonly endNodeId: string
  readonly properties: Readonly<Record<string, unknown>>
}

/** Shape consumed by react-force-graph-2d */
export interface GraphData {
  readonly nodes: readonly GraphNode[]
  readonly links: readonly GraphLink[]
}

/** Link format for react-force-graph-2d */
export interface GraphLink {
  readonly source: string
  readonly target: string
  readonly type: string
  readonly properties: Readonly<Record<string, unknown>>
}

/** Typed result from a Neo4j query */
export interface QueryResult<T> {
  readonly records: readonly T[]
  readonly summary: {
    readonly counters: Readonly<Record<string, number>>
    readonly resultAvailableAfter: number
  }
}
