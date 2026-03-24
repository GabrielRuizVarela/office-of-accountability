/**
 * Report stage runner — M10 Stage Implementations.
 *
 * Synthesizes verified data and hypotheses into structured report sections
 * using LLM analysis via draft_section tool calls, creating report_section proposals.
 */

import neo4j from 'neo4j-driver-lite'

import type { StageKind } from '../types'
import type { Message } from '../llm/types'
import { getToolsForStage } from '../llm/tools'
import { readQuery } from '../../neo4j/client'
import { resolveLLMProvider, processToolCall, getGraphSummary } from './shared'
import type { StageRunner, StageContext, StageResult } from './types'

const MAX_REPORT_NODES = 100

const SYSTEM_PROMPT = `You are a report drafting agent for an investigation graph. Your task is to synthesize verified data and hypotheses into structured report sections.

Available tools:
- read_graph: Query the graph for additional connections and details
- compare_timelines: Analyze temporal relationships between events
- draft_section: Create a report section with a title, content, and evidence references

Create sections covering:
1. Key findings — the most significant verified facts and connections
2. Timeline of events — chronological sequence of key events
3. Network analysis — important relationships and patterns between entities
4. Unresolved questions — gaps in the data and areas needing further investigation
5. Recommended next steps — prioritized actions for advancing the investigation

Each section should reference specific evidence by node ID where possible.`

export class ReportStageRunner implements StageRunner {
  kind: StageKind = 'report'

  async run(context: StageContext): Promise<StageResult> {
    const errors: string[] = []
    let proposalsCreated = 0

    // Get current graph summary for context
    const graphSummary = await getGraphSummary(context.casoSlug)

    // Query gold/silver nodes + hypotheses for this caso
    const nodesResult = await readQuery(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND (n.tier IN ['silver', 'gold'] OR n:Hypothesis)
       RETURN n LIMIT $limit`,
      { casoSlug: context.casoSlug, limit: neo4j.int(MAX_REPORT_NODES) },
      (record) => record.get('n').properties as Record<string, unknown>,
    )

    const nodes = nodesResult.records
    if (nodes.length === 0) {
      return { proposals_created: 0, records_processed: 0, errors: [] }
    }

    try {
      const provider = await resolveLLMProvider(context.stage.model_config_id)
      const tools = getToolsForStage('report')

      const messages: Message[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Draft a comprehensive investigation report based on the following data.\n\nGraph summary:\n${JSON.stringify(graphSummary, null, 2)}\n\nVerified nodes and hypotheses (${nodes.length} total):\n\n${JSON.stringify(nodes, null, 2)}`,
        },
      ]

      const response = await provider.complete({
        messages,
        tools,
        temperature: 0.5,
      })

      if (response.tool_calls) {
        for (const toolCall of response.tool_calls) {
          try {
            const created = await processToolCall(
              toolCall,
              context.pipelineState.id,
              context.stage.id,
              context.casoSlug,
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
      errors.push(`Report generation: ${message}`)
    }

    return {
      proposals_created: proposalsCreated,
      records_processed: nodes.length,
      errors,
    }
  }
}
