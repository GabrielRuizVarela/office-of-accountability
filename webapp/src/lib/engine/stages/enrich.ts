/**
 * Enrich stage runner — M10 Stage Implementations.
 *
 * Fetches document URLs associated with nodes, uses LLM with tool calls
 * for entity extraction, and proposes new nodes/edges.
 */

import neo4j from 'neo4j-driver-lite'

import type { StageKind } from '../types'
import type { Message } from '../llm/types'
import { getToolsForStage } from '../llm/tools'
import { readQuery } from '../../neo4j/client'
import { resolveLLMProvider, processToolCall } from './shared'
import { createEngineLogger } from '../logger'
import type { StageRunner, StageContext, StageResult } from './types'

const BATCH_SIZE = 5
const MAX_UNENRICHED_NODES = 30

const SYSTEM_PROMPT = `You are an enrichment agent for an investigation graph. Your task is to fetch source documents, extract entities (persons, organizations, locations, dates, events), and propose new nodes and relationships.

Available tools:
- read_graph: Check existing nodes and relationships in the graph
- fetch_url: Retrieve content from source URLs for analysis
- extract_entities: Identify entities from fetched text
- propose_node: Add newly extracted nodes to the graph
- propose_edge: Create relationships between extracted entities and existing nodes

For each node provided, fetch its source_url, extract relevant entities, check for duplicates in the graph, and propose new nodes and edges for any new information found.`

export class EnrichStageRunner implements StageRunner {
  kind: StageKind = 'enrich'

  async run(context: StageContext): Promise<StageResult> {
    const log = createEngineLogger(context.pipelineState.id, 'enrich')
    const errors: string[] = []
    let proposalsCreated = 0
    let recordsProcessed = 0

    log.info('stage.start')

    // Query nodes with source_url that haven't been enriched yet
    const unenrichedResult = await readQuery(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.source_url IS NOT NULL
         AND n.enriched IS NULL
       RETURN n LIMIT $limit`,
      { casoSlug: context.casoSlug, limit: neo4j.int(MAX_UNENRICHED_NODES) },
      (record) => record.get('n').properties as Record<string, unknown>,
    )

    const unenrichedNodes = unenrichedResult.records
    if (unenrichedNodes.length === 0) {
      return { proposals_created: 0, records_processed: 0, errors: [] }
    }

    // Process in batches
    const provider = await resolveLLMProvider(context.stage.model_config_id)
    const tools = getToolsForStage('enrich')

    for (let i = 0; i < unenrichedNodes.length; i += BATCH_SIZE) {
      const batch = unenrichedNodes.slice(i, i + BATCH_SIZE)
      recordsProcessed += batch.length

      try {
        const messages: Message[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Enrich the following ${batch.length} nodes by fetching their source URLs and extracting entities. Check for existing nodes before proposing duplicates:\n\n${JSON.stringify(batch, null, 2)}`,
          },
        ]

        const response = await provider.complete({
          messages,
          tools,
          temperature: 0.3,
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
