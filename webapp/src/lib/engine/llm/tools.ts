/**
 * Scoped tool definitions per pipeline stage.
 *
 * Each stage only sees the tools relevant to its work.
 * These are schema definitions — execution logic lives in the stage runners.
 */

import type { ToolDefinition } from './types.ts'
import type { StageKind } from '../types'

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const readGraph: ToolDefinition = {
  name: 'read_graph',
  description: 'Execute a read-only Cypher query against the investigation graph and return results.',
  parameters: {
    type: 'object',
    properties: {
      cypher: { type: 'string', description: 'Parameterized Cypher query (read-only)' },
      params: { type: 'object', description: 'Query parameters' },
    },
    required: ['cypher'],
  },
}

const proposeNode: ToolDefinition = {
  name: 'propose_node',
  description: 'Propose a new node to add to the investigation graph.',
  parameters: {
    type: 'object',
    properties: {
      label: { type: 'string', description: 'Node label (Person, Organization, Event, etc.)' },
      properties: { type: 'object', description: 'Node properties' },
      confidence: { type: 'number', description: 'Confidence score 0-1' },
      source: { type: 'string', description: 'Source reference for this data' },
    },
    required: ['label', 'properties'],
  },
}

const proposeEdge: ToolDefinition = {
  name: 'propose_edge',
  description: 'Propose a new relationship between two nodes in the investigation graph.',
  parameters: {
    type: 'object',
    properties: {
      from_id: { type: 'string', description: 'Source node ID' },
      to_id: { type: 'string', description: 'Target node ID' },
      type: { type: 'string', description: 'Relationship type' },
      properties: { type: 'object', description: 'Relationship properties' },
      confidence: { type: 'number', description: 'Confidence score 0-1' },
      source: { type: 'string', description: 'Source reference for this data' },
    },
    required: ['from_id', 'to_id', 'type'],
  },
}

const fetchUrl: ToolDefinition = {
  name: 'fetch_url',
  description: 'Fetch content from a URL for enrichment or verification.',
  parameters: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to fetch' },
      extract_text: { type: 'boolean', description: 'Extract plain text from HTML' },
    },
    required: ['url'],
  },
}

const extractEntities: ToolDefinition = {
  name: 'extract_entities',
  description: 'Extract named entities (persons, organizations, locations, dates) from text.',
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to extract entities from' },
      entity_types: {
        type: 'array',
        items: { type: 'string' },
        description: 'Entity types to extract (person, organization, location, date, event)',
      },
    },
    required: ['text'],
  },
}

const runAlgorithm: ToolDefinition = {
  name: 'run_algorithm',
  description: 'Run a graph algorithm (centrality, community detection, anomaly, temporal) on the investigation graph.',
  parameters: {
    type: 'object',
    properties: {
      algorithm: { type: 'string', description: 'Algorithm name (degree_centrality, betweenness, louvain, temporal_clustering, anomaly_detection)' },
      params: { type: 'object', description: 'Algorithm-specific parameters' },
    },
    required: ['algorithm'],
  },
}

const proposeHypothesis: ToolDefinition = {
  name: 'propose_hypothesis',
  description: 'Propose a hypothesis about relationships or patterns in the investigation.',
  parameters: {
    type: 'object',
    properties: {
      hypothesis: { type: 'string', description: 'The hypothesis statement' },
      supporting_evidence: {
        type: 'array',
        items: { type: 'string' },
        description: 'Node/edge IDs that support this hypothesis',
      },
      confidence: { type: 'number', description: 'Confidence score 0-1' },
    },
    required: ['hypothesis'],
  },
}

const compareTimelines: ToolDefinition = {
  name: 'compare_timelines',
  description: 'Compare temporal sequences of events to identify overlaps, gaps, or suspicious patterns.',
  parameters: {
    type: 'object',
    properties: {
      timeline_a: { type: 'string', description: 'First timeline query or node set ID' },
      timeline_b: { type: 'string', description: 'Second timeline query or node set ID' },
      window: { type: 'string', description: 'Time window for proximity matching (e.g. "7d", "30d")' },
    },
    required: ['timeline_a', 'timeline_b'],
  },
}

const draftSection: ToolDefinition = {
  name: 'draft_section',
  description: 'Draft a section of the investigation report.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Section title' },
      content: { type: 'string', description: 'Section content in markdown' },
      evidence_refs: {
        type: 'array',
        items: { type: 'string' },
        description: 'Node/edge IDs referenced as evidence',
      },
    },
    required: ['title', 'content'],
  },
}

// ---------------------------------------------------------------------------
// Stage → tools mapping
// ---------------------------------------------------------------------------

const stageToolMap: Record<StageKind, ToolDefinition[]> = {
  ingest: [readGraph, proposeNode, proposeEdge, fetchUrl, extractEntities],
  verify: [readGraph, fetchUrl, proposeNode, proposeEdge],
  enrich: [readGraph, proposeNode, proposeEdge, fetchUrl, extractEntities],
  analyze: [readGraph, runAlgorithm, proposeHypothesis, compareTimelines, proposeNode, proposeEdge],
  iterate: [readGraph, runAlgorithm, proposeHypothesis, compareTimelines, fetchUrl, extractEntities, proposeNode, proposeEdge],
  report: [readGraph, draftSection, compareTimelines],
}

/**
 * Get the tool definitions available for a given pipeline stage.
 */
export function getToolsForStage(stage: StageKind): ToolDefinition[] {
  return stageToolMap[stage]
}

/**
 * Get all tool definitions across all stages (deduplicated).
 */
export function getAllTools(): ToolDefinition[] {
  const seen = new Set<string>()
  const tools: ToolDefinition[] = []
  for (const defs of Object.values(stageToolMap)) {
    for (const tool of defs) {
      if (!seen.has(tool.name)) {
        seen.add(tool.name)
        tools.push(tool)
      }
    }
  }
  return tools
}
