/**
 * Shared helpers for stage runners.
 *
 * Extracted from iterate.ts to avoid duplicating LLM resolution,
 * tool-call processing, and graph summary queries across stages.
 */

import type { LLMProvider, ToolCall } from '../llm/types'
import type { GraphSummary } from '../research-metrics'
import { createProvider } from '../llm/factory'
import { getModelConfigById } from '../config'
import { readQuery } from '../../neo4j/client'
import { createProposal } from '../proposals'

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

export async function processToolCall(
  toolCall: ToolCall,
  pipelineStateId: string,
  stageId: string,
): Promise<boolean> {
  let args: Record<string, unknown>
  try {
    args = JSON.parse(toolCall.arguments) as Record<string, unknown>
  } catch {
    return false
  }

  switch (toolCall.name) {
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
// Helpers
// ---------------------------------------------------------------------------

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}
