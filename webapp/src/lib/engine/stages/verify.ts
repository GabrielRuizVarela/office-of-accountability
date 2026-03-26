/**
 * Verify stage runner - M10 Stage Implementations.
 *
 * Queries bronze-tier nodes, uses LLM with tool calls to cross-reference
 * against available sources, and proposes tier promotions to silver.
 */

import neo4j from 'neo4j-driver-lite'

import type { StageKind } from '../types'
import type { Message } from '../llm/types'
import { getToolsForStage } from '../llm/tools'
import { readQuery } from '../../neo4j/client'
import { resolveLLMProvider, processToolCall } from './shared'
import { createEngineLogger } from '../logger'
import type { StageRunner, StageContext, StageResult } from './types'

const BATCH_SIZE = 10
const MAX_BRONZE_NODES = 50

const SYSTEM_PROMPT = `You are a verification agent for an investigation graph. Your task is to cross-reference bronze-tier data against available sources and propose tier promotions to silver when data is corroborated.

Available tools:
- read_graph: Check existing nodes and relationships in the graph
- fetch_url: Verify data against web sources
- propose_node: Update or create verified nodes (set tier to 'silver' for promotions)
- propose_edge: Create verified relationships between nodes

For each node provided, assess whether it can be corroborated. If you can verify the data through cross-referencing with other graph nodes or web sources, propose a node update with tier set to 'silver'. If data conflicts are found, note them in the proposal reasoning.`

export class VerifyStageRunner implements StageRunner {
  kind: StageKind = 'verify'

  async run(context: StageContext): Promise<StageResult> {
    const log = createEngineLogger(context.pipelineState.id, 'verify')
    const errors: string[] = []
    let proposalsCreated = 0
    let recordsProcessed = 0

    log.info('stage.start')

    // Query bronze-tier nodes for this caso
    const bronzeResult = await readQuery(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug AND n.tier = 'bronze'
       RETURN n LIMIT $limit`,
      { casoSlug: context.casoSlug, limit: neo4j.int(MAX_BRONZE_NODES) },
      (record) => record.get('n').properties as Record<string, unknown>,
    )

    const bronzeNodes = bronzeResult.records
    if (bronzeNodes.length === 0) {
      return { proposals_created: 0, records_processed: 0, errors: [] }
    }

    // Process in batches
    const provider = await resolveLLMProvider(context.stage.model_config_id)
    const tools = getToolsForStage('verify')

    for (let i = 0; i < bronzeNodes.length; i += BATCH_SIZE) {
      const batch = bronzeNodes.slice(i, i + BATCH_SIZE)
      recordsProcessed += batch.length

      try {
        const messages: Message[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Verify the following ${batch.length} bronze-tier nodes. Cross-reference them and propose tier promotions where data is corroborated:\n\n${JSON.stringify(batch, null, 2)}`,
          },
        ]

        const response = await provider.complete({
          messages,
          tools,
          temperature: 0.2,
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
        errors.push(`Batch ${i / BATCH_SIZE + 1}: ${message}`)
      }
    }

    log.info('stage.done', { proposals: proposalsCreated, records: recordsProcessed, errors: errors.length })

    return {
      proposals_created: proposalsCreated,
      records_processed: recordsProcessed,
      errors,
    }
  }
}
