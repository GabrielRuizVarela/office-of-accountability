/**
 * Analyze stage runner — M10 Stage Implementations.
 *
 * Identifies gaps, patterns, and anomalies in verified data using LLM
 * analysis via tool calls, and proposes hypotheses and missing edges.
 */

import neo4j from 'neo4j-driver-lite'

import type { StageKind } from '../types'
import type { Message } from '../llm/types'
import { getToolsForStage } from '../llm/tools'
import { readQuery } from '../../neo4j/client'
import { resolveLLMProvider, processToolCall, getGraphSummary } from './shared'
import type { StageRunner, StageContext, StageResult } from './types'

const BATCH_SIZE = 10
const MAX_UNANALYZED_NODES = 40

const SYSTEM_PROMPT = `You are an analysis agent for an investigation graph. Your task is to identify gaps, patterns, and anomalies in the verified data.

Available tools:
- read_graph: Query the graph structure to find connections and patterns
- run_algorithm: Detect centrality and community patterns in the graph
- compare_timelines: Find temporal correlations between events
- propose_hypothesis: Propose investigative leads based on pattern analysis
- propose_node: Add missing nodes you identify during analysis
- propose_edge: Create missing connections between existing nodes

For each batch of nodes provided, along with the graph summary statistics, analyze the data for gaps in coverage, suspicious patterns, temporal anomalies, and missing connections. Propose hypotheses for investigative leads and any missing edges you identify.`

export class AnalyzeStageRunner implements StageRunner {
  kind: StageKind = 'analyze'

  async run(context: StageContext): Promise<StageResult> {
    const errors: string[] = []
    let proposalsCreated = 0
    let recordsProcessed = 0

    // Get current graph summary for context
    const graphSummary = await getGraphSummary(context.casoSlug)

    // Query silver/gold nodes that haven't been analyzed yet
    const unanalyzedResult = await readQuery(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.tier IN ['silver', 'gold']
         AND n.analyzed IS NULL
       RETURN n LIMIT $limit`,
      { casoSlug: context.casoSlug, limit: neo4j.int(MAX_UNANALYZED_NODES) },
      (record) => record.get('n').properties as Record<string, unknown>,
    )

    const unanalyzedNodes = unanalyzedResult.records
    if (unanalyzedNodes.length === 0) {
      return { proposals_created: 0, records_processed: 0, errors: [] }
    }

    // Process in batches
    const provider = await resolveLLMProvider(context.stage.model_config_id)
    const tools = getToolsForStage('analyze')

    for (let i = 0; i < unanalyzedNodes.length; i += BATCH_SIZE) {
      const batch = unanalyzedNodes.slice(i, i + BATCH_SIZE)
      recordsProcessed += batch.length

      try {
        const messages: Message[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Analyze the following ${batch.length} verified nodes for gaps, patterns, and anomalies. Here are the current graph statistics:\n\n${JSON.stringify(graphSummary, null, 2)}\n\nNodes to analyze:\n\n${JSON.stringify(batch, null, 2)}`,
          },
        ]

        const response = await provider.complete({
          messages,
          tools,
          temperature: 0.4,
        })

        if (response.tool_calls) {
          for (const toolCall of response.tool_calls) {
            try {
              const created = await processToolCall(
                toolCall,
                context.pipelineState.id,
                context.stage.id,
              )
              if (created) proposalsCreated++
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err)
              errors.push(`Tool call ${toolCall.name}: ${message}`)
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push(`Batch ${i / BATCH_SIZE + 1}: ${message}`)
      }
    }

    return {
      proposals_created: proposalsCreated,
      records_processed: recordsProcessed,
      errors,
    }
  }
}
