/**
 * Gap detector — identifies structural gaps in the investigation graph.
 * Used by iterate.ts to focus autonomous research on weak areas.
 */

import neo4j from 'neo4j-driver-lite'
import { readQuery } from '../neo4j/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IsolatedNode {
  id: string
  labels: string[]
  name: string
}

export interface MissingRelationship {
  source_id: string
  source_name: string
  target_id: string
  target_name: string
  reason: string
}

export interface LowConfidenceCluster {
  node_id: string
  name: string
  confidence: number
  tier: string
}

export interface GapReport {
  isolated_nodes: IsolatedNode[]
  missing_relationships: MissingRelationship[]
  low_confidence_clusters: LowConfidenceCluster[]
  suggested_questions: string[]
}

// ---------------------------------------------------------------------------
// detectGaps
// ---------------------------------------------------------------------------

/**
 * Run structural gap-detection queries against the investigation graph.
 * Returns a prioritized GapReport with suggestions for further research.
 *
 * @param casoSlug - Investigation namespace (filters nodes by caso_slug)
 */
export async function detectGaps(casoSlug: string): Promise<GapReport> {
  const [isolated, lowConfidence, missingRels] = await Promise.all([
    findIsolatedNodes(casoSlug),
    findLowConfidenceNodes(casoSlug),
    findMissingRelationships(casoSlug),
  ])

  const suggested_questions = generateSuggestions(isolated, lowConfidence, missingRels)

  return {
    isolated_nodes: isolated,
    missing_relationships: missingRels,
    low_confidence_clusters: lowConfidence,
    suggested_questions,
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Nodes with zero relationships — disconnected from the graph. */
async function findIsolatedNodes(casoSlug: string): Promise<IsolatedNode[]> {
  const cypher = `
    MATCH (n)
    WHERE n.caso_slug = $casoSlug
      AND NOT (n)--()
    RETURN elementId(n) AS id, labels(n) AS labels, coalesce(n.name, n.title, '') AS name
    LIMIT $limit
  `
  const result = await readQuery(
    cypher,
    { casoSlug, limit: neo4j.int(50) },
    (record) => ({
      id: record.get('id') as string,
      labels: record.get('labels') as string[],
      name: record.get('name') as string,
    }),
  )
  return result.records as IsolatedNode[]
}

/** Nodes below the bronze confidence threshold — need verification. */
async function findLowConfidenceNodes(casoSlug: string): Promise<LowConfidenceCluster[]> {
  const cypher = `
    MATCH (n)
    WHERE n.caso_slug = $casoSlug
      AND n.confidence_score IS NOT NULL
      AND n.confidence_score < $threshold
    RETURN elementId(n) AS id,
           coalesce(n.name, n.title, '') AS name,
           n.confidence_score AS confidence,
           coalesce(n.tier, 'bronze') AS tier
    ORDER BY n.confidence_score ASC
    LIMIT $limit
  `
  const result = await readQuery(
    cypher,
    { casoSlug, threshold: 0.5, limit: neo4j.int(50) },
    (record) => ({
      node_id: record.get('id') as string,
      name: record.get('name') as string,
      confidence: (record.get('confidence') as { toNumber?: () => number }).toNumber
        ? (record.get('confidence') as { toNumber: () => number }).toNumber()
        : (record.get('confidence') as number),
      tier: record.get('tier') as string,
    }),
  )
  return result.records as LowConfidenceCluster[]
}

/**
 * Persons who share an Organization but have no direct relationship.
 * Suggests potential connections worth investigating.
 */
async function findMissingRelationships(casoSlug: string): Promise<MissingRelationship[]> {
  const cypher = `
    MATCH (a:Person)-[:AFFILIATED_WITH]->(o:Organization)<-[:AFFILIATED_WITH]-(b:Person)
    WHERE a.caso_slug = $casoSlug
      AND b.caso_slug = $casoSlug
      AND NOT (a)--(b)
      AND elementId(a) < elementId(b)
    RETURN elementId(a) AS source_id,
           coalesce(a.name, '') AS source_name,
           elementId(b) AS target_id,
           coalesce(b.name, '') AS target_name,
           o.name AS org_name
    LIMIT $limit
  `
  const result = await readQuery(
    cypher,
    { casoSlug, limit: neo4j.int(30) },
    (record) => ({
      source_id: record.get('source_id') as string,
      source_name: record.get('source_name') as string,
      target_id: record.get('target_id') as string,
      target_name: record.get('target_name') as string,
      reason: `Both affiliated with ${record.get('org_name') as string}`,
    }),
  )
  return result.records as MissingRelationship[]
}

// ---------------------------------------------------------------------------
// Suggestion generation
// ---------------------------------------------------------------------------

function generateSuggestions(
  isolated: IsolatedNode[],
  lowConfidence: LowConfidenceCluster[],
  missingRels: MissingRelationship[],
): string[] {
  const suggestions: string[] = []

  if (isolated.length > 0) {
    const names = isolated.slice(0, 3).map((n) => n.name || n.labels.join(',')).join(', ')
    suggestions.push(
      `${isolated.length} isolated nodes found (e.g. ${names}). Research their connections to other entities.`,
    )
  }

  if (lowConfidence.length > 0) {
    const names = lowConfidence.slice(0, 3).map((n) => n.name).join(', ')
    suggestions.push(
      `${lowConfidence.length} low-confidence nodes (e.g. ${names}). Seek additional sources to corroborate.`,
    )
  }

  if (missingRels.length > 0) {
    const sample = missingRels[0]
    suggestions.push(
      `${missingRels.length} potential missing relationships. E.g. ${sample.source_name} and ${sample.target_name} share an org but have no direct link.`,
    )
  }

  if (suggestions.length === 0) {
    suggestions.push('No significant gaps detected. Consider expanding scope or lowering confidence thresholds.')
  }

  return suggestions
}
