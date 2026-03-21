/**
 * Read InvestigationConfig nodes and their schema subgraphs from Neo4j.
 *
 * Graph structure:
 *   (InvestigationConfig) -[:HAS_SCHEMA]-> (SchemaDefinition)
 *     -[:DEFINES_NODE_TYPE]-> (NodeTypeDefinition) × N
 *     -[:DEFINES_REL_TYPE]-> (RelTypeDefinition) × N
 */

import { readQuery } from '../neo4j/client'
import type {
  InvestigationConfig,
  InvestigationSchema,
  NodeTypeDefinition,
  RelTypeDefinition,
} from './types'
import { isValidCasoSlug } from './utils'

// ---------------------------------------------------------------------------
// Read InvestigationConfig by caso_slug
// ---------------------------------------------------------------------------

export async function getInvestigationConfig(
  casoSlug: string,
): Promise<InvestigationConfig | null> {
  if (!isValidCasoSlug(casoSlug)) return null

  const { records } = await readQuery<InvestigationConfig>(
    `MATCH (c:InvestigationConfig {caso_slug: $casoSlug})
     RETURN c`,
    { casoSlug },
    (record) => {
      const props = record.get('c').properties
      return {
        id: props.id,
        name: props.name,
        description: props.description,
        caso_slug: props.caso_slug,
        status: props.status,
        created_at: props.created_at,
        tags: props.tags ?? [],
      }
    },
  )

  return records[0] ?? null
}

// ---------------------------------------------------------------------------
// List all InvestigationConfig nodes
// ---------------------------------------------------------------------------

export async function listInvestigationConfigs(): Promise<
  InvestigationConfig[]
> {
  const { records } = await readQuery<InvestigationConfig>(
    `MATCH (c:InvestigationConfig)
     RETURN c
     ORDER BY c.name`,
    {},
    (record) => {
      const props = record.get('c').properties
      return {
        id: props.id,
        name: props.name,
        description: props.description,
        caso_slug: props.caso_slug,
        status: props.status,
        created_at: props.created_at,
        tags: props.tags ?? [],
      }
    },
  )

  return [...records]
}

// ---------------------------------------------------------------------------
// Read schema (node types + relationship types) for an investigation
// ---------------------------------------------------------------------------

export async function getInvestigationSchema(
  casoSlug: string,
): Promise<InvestigationSchema | null> {
  if (!isValidCasoSlug(casoSlug)) return null

  const [nodeTypes, relTypes] = await Promise.all([
    getNodeTypeDefinitions(casoSlug),
    getRelTypeDefinitions(casoSlug),
  ])

  if (nodeTypes.length === 0 && relTypes.length === 0) return null

  return { nodeTypes, relTypes }
}

// ---------------------------------------------------------------------------
// Read NodeTypeDefinition nodes for an investigation
// ---------------------------------------------------------------------------

export async function getNodeTypeDefinitions(
  casoSlug: string,
): Promise<NodeTypeDefinition[]> {
  const { records } = await readQuery<NodeTypeDefinition>(
    `MATCH (c:InvestigationConfig {caso_slug: $casoSlug})
           -[:HAS_SCHEMA]->(s:SchemaDefinition)
           -[:DEFINES_NODE_TYPE]->(nt:NodeTypeDefinition)
     RETURN nt
     ORDER BY nt.name`,
    { casoSlug },
    (record) => {
      const props = record.get('nt').properties
      return {
        name: props.name,
        properties_json: props.properties_json,
        color: props.color,
        icon: props.icon,
      }
    },
  )

  return [...records]
}

// ---------------------------------------------------------------------------
// Read RelTypeDefinition nodes for an investigation
// ---------------------------------------------------------------------------

export async function getRelTypeDefinitions(
  casoSlug: string,
): Promise<RelTypeDefinition[]> {
  const { records } = await readQuery<RelTypeDefinition>(
    `MATCH (c:InvestigationConfig {caso_slug: $casoSlug})
           -[:HAS_SCHEMA]->(s:SchemaDefinition)
           -[:DEFINES_REL_TYPE]->(rt:RelTypeDefinition)
     RETURN rt
     ORDER BY rt.name`,
    { casoSlug },
    (record) => {
      const props = record.get('rt').properties
      return {
        name: props.name,
        from_types: props.from_types,
        to_types: props.to_types,
      }
    },
  )

  return [...records]
}

// ---------------------------------------------------------------------------
// Validate that a caso_slug has a corresponding InvestigationConfig in Neo4j
// ---------------------------------------------------------------------------

export async function isKnownInvestigation(
  casoSlug: string,
): Promise<boolean> {
  if (!isValidCasoSlug(casoSlug)) return false

  const { records } = await readQuery<boolean>(
    `MATCH (c:InvestigationConfig {caso_slug: $casoSlug})
     RETURN true AS exists
     LIMIT 1`,
    { casoSlug },
    (record) => record.get('exists') as boolean,
  )

  return records.length > 0
}
