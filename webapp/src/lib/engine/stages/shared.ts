/**
 * Shared helpers for stage runners.
 *
 * Extracted from iterate.ts to avoid duplicating LLM resolution,
 * tool-call processing, and graph summary queries across stages.
 */

import type { LLMProvider, ToolCall } from '../llm/types'
import type { GraphSummary } from '../research-metrics'
import type { AlgorithmKind } from '../algorithms/types'
import { createProvider } from '../llm/factory'
import { getModelConfigById } from '../config'
import { readQuery } from '../../neo4j/client'
import { createProposal } from '../proposals'
import { createAlgorithm, algorithmKinds } from '../algorithms'

// ---------------------------------------------------------------------------
// LLM provider resolution
// ---------------------------------------------------------------------------

export async function resolveLLMProvider(
  modelConfigId: string | undefined,
): Promise<LLMProvider> {
  if (modelConfigId) {
    const config = await getModelConfigById(modelConfigId)
    if (config) return createProvider(config)
  }

  // Fallback to default llamacpp
  const { createLlamaCppProvider } = await import('../llm/llamacpp')
  return createLlamaCppProvider({
    endpoint: process.env.MIROFISH_API_URL ?? 'http://localhost:8080',
    model: 'qwen-3.5-9b',
  })
}

// ---------------------------------------------------------------------------
// Graph summary query
// ---------------------------------------------------------------------------

export async function getGraphSummary(casoSlug: string): Promise<GraphSummary> {
  const cypher = `
    MATCH (n)
    WHERE n.caso_slug = $casoSlug
    WITH count(n) AS nodeCount,
         avg(CASE WHEN n.confidence_score IS NOT NULL THEN n.confidence_score ELSE null END) AS avgConf,
         sum(CASE WHEN n.corroborated = true THEN 1 ELSE 0 END) AS corrobCount
    OPTIONAL MATCH ()-[r]->()
    WHERE startNode(r).caso_slug = $casoSlug
    RETURN nodeCount,
           coalesce(avgConf, 0) AS avgConf,
           corrobCount,
           count(r) AS relCount
  `

  const result = await readQuery(
    cypher,
    { casoSlug },
    (record) => ({
      node_count: toNumber(record.get('nodeCount')),
      relationship_count: toNumber(record.get('relCount')),
      avg_confidence: toNumber(record.get('avgConf')),
      corroborated_count: toNumber(record.get('corrobCount')),
    }),
  )

  return (
    result.records[0] ?? {
      node_count: 0,
      relationship_count: 0,
      avg_confidence: 0,
      corroborated_count: 0,
    }
  )
}

// ---------------------------------------------------------------------------
// Tool call → Proposal processing
// ---------------------------------------------------------------------------

/**
 * Process a tool call from the LLM.
 *
 * Returns a result string for data-retrieval tools (read_graph, fetch_url,
 * extract_entities, run_algorithm, compare_timelines) that callers can feed
 * back as a tool-result message.  Returns `true` for proposal-creating tools,
 * `false` for unrecognised tools.  All truthy returns count as "handled".
 */
export async function processToolCall(
  toolCall: ToolCall,
  pipelineStateId: string,
  stageId: string,
  casoSlug?: string,
): Promise<string | boolean> {
  let args: Record<string, unknown>
  try {
    args = JSON.parse(toolCall.arguments) as Record<string, unknown>
  } catch {
    return false
  }

  switch (toolCall.name) {
    // ----- Data-retrieval tools (return result strings) -----

    case 'read_graph':
      return handleReadGraph(args)

    case 'fetch_url':
      return handleFetchUrl(args)

    case 'extract_entities':
      return handleExtractEntities(args)

    case 'run_algorithm':
      return handleRunAlgorithm(args, pipelineStateId, stageId, casoSlug)

    case 'compare_timelines':
      return handleCompareTimelines(args, casoSlug)

    // ----- Proposal-creating tools (return boolean) -----

    case 'propose_node':
      await createProposal({
        pipeline_state_id: pipelineStateId,
        stage_id: stageId,
        type: 'create_node',
        payload: {
          label: args.label as string,
          properties: args.properties as Record<string, unknown>,
        },
        confidence: (args.confidence as number) ?? 0.5,
        reasoning: (args.source as string) ?? 'LLM-generated proposal',
      })
      return true

    case 'propose_edge':
      await createProposal({
        pipeline_state_id: pipelineStateId,
        stage_id: stageId,
        type: 'create_relationship',
        payload: {
          from_id: args.from_id as string,
          to_id: args.to_id as string,
          type: args.type as string,
          properties: (args.properties as Record<string, unknown>) ?? {},
        },
        confidence: (args.confidence as number) ?? 0.5,
        reasoning: (args.source as string) ?? 'LLM-generated proposal',
      })
      return true

    case 'propose_hypothesis':
      await createProposal({
        pipeline_state_id: pipelineStateId,
        stage_id: stageId,
        type: 'create_node',
        payload: {
          label: 'Hypothesis',
          properties: {
            hypothesis: args.hypothesis as string,
            supporting_evidence: args.supporting_evidence ?? [],
          },
        },
        confidence: (args.confidence as number) ?? 0.3,
        reasoning: `Hypothesis: ${args.hypothesis as string}`,
      })
      return true

    case 'draft_section':
      await createProposal({
        pipeline_state_id: pipelineStateId,
        stage_id: stageId,
        type: 'report_section',
        payload: {
          title: args.title as string,
          content: args.content as string,
          evidence_refs: (args.evidence_refs as string[]) ?? [],
        },
        confidence: 0.7,
        reasoning: `Report section: ${args.title as string}`,
      })
      return true

    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Tool handler implementations
// ---------------------------------------------------------------------------

/** Execute a read-only Cypher query against the investigation graph. */
async function handleReadGraph(args: Record<string, unknown>): Promise<string> {
  const cypher = args.cypher as string | undefined
  if (!cypher) return JSON.stringify({ error: 'Missing required parameter: cypher' })

  // Security: reject write operations
  const normalized = cypher.toUpperCase().replace(/\s+/g, ' ')
  const writeKeywords = ['CREATE', 'MERGE', 'SET', 'DELETE', 'DETACH', 'REMOVE', 'DROP', 'CALL {']
  if (writeKeywords.some((kw) => normalized.includes(kw))) {
    return JSON.stringify({ error: 'read_graph only supports read-only queries' })
  }

  try {
    const params = (args.params as Record<string, unknown>) ?? {}
    const result = await readQuery(cypher, params, (record) => {
      const obj: Record<string, unknown> = {}
      for (const key of record.keys as string[]) {
        obj[key] = toJsValue(record.get(key))
      }
      return obj
    })
    return JSON.stringify({ records: result.records.slice(0, 100) })
  } catch (err) {
    return JSON.stringify({ error: err instanceof Error ? err.message : String(err) })
  }
}

/** Fetch content from a URL with safety limits. */
async function handleFetchUrl(args: Record<string, unknown>): Promise<string> {
  const url = args.url as string | undefined
  if (!url) return JSON.stringify({ error: 'Missing required parameter: url' })

  // Validate URL scheme
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return JSON.stringify({ error: 'Invalid URL' })
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return JSON.stringify({ error: 'Only http/https URLs are supported' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'OfficeOfAccountability-Engine/1.0' },
      redirect: 'follow',
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return JSON.stringify({ error: `HTTP ${response.status}: ${response.statusText}` })
    }

    // Cap response size at 100KB
    const maxBytes = 100 * 1024
    const contentType = response.headers.get('content-type') ?? ''
    const rawText = await response.text()
    const truncated = rawText.length > maxBytes ? rawText.slice(0, maxBytes) : rawText

    const extractText = args.extract_text as boolean | undefined
    if (extractText && contentType.includes('text/html')) {
      // Simple HTML text extraction: strip tags
      const text = truncated
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      return JSON.stringify({ url, content_type: contentType, text: text.slice(0, maxBytes) })
    }

    return JSON.stringify({
      url,
      content_type: contentType,
      text: truncated,
      truncated: rawText.length > maxBytes,
    })
  } catch (err) {
    return JSON.stringify({ error: err instanceof Error ? err.message : String(err) })
  }
}

/** Extract named entities from text using pattern matching. */
async function handleExtractEntities(args: Record<string, unknown>): Promise<string> {
  const text = args.text as string | undefined
  if (!text) return JSON.stringify({ error: 'Missing required parameter: text' })

  const requestedTypes = (args.entity_types as string[] | undefined) ?? [
    'person',
    'organization',
    'location',
    'date',
  ]

  const entities: Array<{ type: string; value: string; offset: number }> = []

  if (requestedTypes.includes('date')) {
    // ISO dates, common date formats
    const datePatterns = [
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    ]
    for (const pat of datePatterns) {
      let m
      while ((m = pat.exec(text)) !== null) {
        entities.push({ type: 'date', value: m[0], offset: m.index })
      }
    }
  }

  if (requestedTypes.includes('person') || requestedTypes.includes('organization')) {
    // Capitalized multi-word sequences (heuristic NER)
    const namePattern = /\b([A-Z][a-z]+(?:\s+(?:de\s+la\s+|del?\s+|van\s+|von\s+)?[A-Z][a-z]+){1,4})\b/g
    let m
    while ((m = namePattern.exec(text)) !== null) {
      // Skip common false positives
      const val = m[1]
      const skipPrefixes = ['The ', 'This ', 'That ', 'These ', 'Those ', 'When ', 'Where ', 'What ']
      if (skipPrefixes.some((p) => val.startsWith(p))) continue
      entities.push({ type: 'person', value: val, offset: m.index })
    }
  }

  if (requestedTypes.includes('location')) {
    // Known location indicators
    const locPattern = /\b(?:in|at|from|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g
    let m
    while ((m = locPattern.exec(text)) !== null) {
      entities.push({ type: 'location', value: m[1], offset: m.index })
    }
  }

  // Deduplicate by value+type
  const seen = new Set<string>()
  const unique = entities.filter((e) => {
    const key = `${e.type}:${e.value}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return JSON.stringify({ entities: unique, count: unique.length })
}

/** Run a graph algorithm via the algorithm factory. */
async function handleRunAlgorithm(
  args: Record<string, unknown>,
  pipelineStateId: string,
  stageId: string,
  casoSlug?: string,
): Promise<string> {
  const algorithmName = args.algorithm as string | undefined
  if (!algorithmName) return JSON.stringify({ error: 'Missing required parameter: algorithm' })

  // Map tool parameter names to AlgorithmKind
  const kindMap: Record<string, AlgorithmKind> = {
    degree_centrality: 'centrality',
    betweenness: 'centrality',
    centrality: 'centrality',
    louvain: 'community',
    community: 'community',
    community_detection: 'community',
    anomaly: 'anomaly',
    anomaly_detection: 'anomaly',
    temporal: 'temporal',
    temporal_clustering: 'temporal',
  }

  const kind = kindMap[algorithmName]
  if (!kind) {
    return JSON.stringify({
      error: `Unknown algorithm: ${algorithmName}. Available: ${algorithmKinds.join(', ')}`,
    })
  }

  if (!casoSlug) {
    return JSON.stringify({ error: 'casoSlug required to run algorithms' })
  }

  try {
    const algorithm = createAlgorithm(kind)
    const result = await algorithm.run({ casoSlug, pipelineStateId, stageId })
    return JSON.stringify({ algorithm: kind, result })
  } catch (err) {
    return JSON.stringify({ error: err instanceof Error ? err.message : String(err) })
  }
}

/** Compare temporal sequences of events to find overlaps or gaps. */
async function handleCompareTimelines(
  args: Record<string, unknown>,
  casoSlug?: string,
): Promise<string> {
  const timelineA = args.timeline_a as string | undefined
  const timelineB = args.timeline_b as string | undefined
  if (!timelineA || !timelineB) {
    return JSON.stringify({ error: 'Missing required parameters: timeline_a, timeline_b' })
  }

  if (!casoSlug) {
    return JSON.stringify({ error: 'casoSlug required for timeline comparison' })
  }

  const windowStr = (args.window as string) ?? '30d'
  const windowDays = parseInt(windowStr) || 30

  try {
    // Query events for both timelines — timeline_a/b are entity names or IDs
    const cypher = `
      UNWIND [$entityA, $entityB] AS entityRef
      MATCH (n)
      WHERE n.caso_slug = $casoSlug
        AND (n.name = entityRef OR n.id = entityRef OR n.normalized_name = entityRef)
      OPTIONAL MATCH (n)-[r]-(e)
      WHERE e.date IS NOT NULL OR e.start_date IS NOT NULL
      WITH entityRef,
           collect(DISTINCT {
             id: e.id,
             name: coalesce(e.name, e.title, 'unnamed'),
             date: coalesce(e.date, e.start_date),
             type: labels(e)[0]
           })[..50] AS events
      RETURN entityRef, events
    `
    const result = await readQuery(
      cypher,
      { casoSlug, entityA: timelineA, entityB: timelineB },
      (record) => ({
        entity: record.get('entityRef') as string,
        events: toJsValue(record.get('events')) as Array<Record<string, unknown>>,
      }),
    )

    const timelines = result.records
    if (timelines.length < 2) {
      return JSON.stringify({
        timeline_a: timelineA,
        timeline_b: timelineB,
        overlaps: [],
        note: 'Could not find events for one or both entities',
      })
    }

    // Find temporal overlaps within the window
    const eventsA = timelines[0].events.filter((e) => e.date)
    const eventsB = timelines[1].events.filter((e) => e.date)

    const overlaps: Array<{ event_a: string; event_b: string; days_apart: number }> = []
    for (const a of eventsA) {
      const dateA = new Date(a.date as string)
      if (isNaN(dateA.getTime())) continue
      for (const b of eventsB) {
        const dateB = new Date(b.date as string)
        if (isNaN(dateB.getTime())) continue
        const daysApart = Math.abs(dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24)
        if (daysApart <= windowDays) {
          overlaps.push({
            event_a: `${a.name as string} (${a.date as string})`,
            event_b: `${b.name as string} (${b.date as string})`,
            days_apart: Math.round(daysApart),
          })
        }
      }
    }

    overlaps.sort((a, b) => a.days_apart - b.days_apart)

    return JSON.stringify({
      timeline_a: { entity: timelineA, event_count: eventsA.length },
      timeline_b: { entity: timelineB, event_count: eventsB.length },
      window_days: windowDays,
      overlaps: overlaps.slice(0, 50),
    })
  } catch (err) {
    return JSON.stringify({ error: err instanceof Error ? err.message : String(err) })
  }
}

/** Convert Neo4j values (integers, nodes, etc.) to plain JS values. */
function toJsValue(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  if (Array.isArray(value)) return value.map(toJsValue)
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(obj)) {
      result[key] = toJsValue(obj[key])
    }
    return result
  }
  return value
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}
