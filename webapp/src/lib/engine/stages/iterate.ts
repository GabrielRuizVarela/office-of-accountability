/**
 * Iterate stage runner — autonomous research iteration loop.
 *
 * First real stage with logic (existing stages are stubs or simple connectors).
 * Loops LLM calls with gap detection until convergence or max iterations.
 * Uses ResearchProgram for directives, ResearchMetrics for convergence,
 * GapDetector for structural focus.
 */

import type { StageKind } from '../types'
import type { StageRunner, StageContext, StageResult } from './types'
import { ResearchProgram } from '../research-program'
import {
  evaluateIteration,
  shouldContinue,
  type GraphSummary,
} from '../research-metrics'
import { detectGaps } from '../gap-detector'
import { createProvider } from '../llm/factory'
import { getToolsForStage } from '../llm/tools'
import type { LLMProvider, Message, ToolCall } from '../llm/types'
import { readQuery } from '../../neo4j/client'
import { getModelConfigById } from '../config'
import { createProposal } from '../proposals'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_ITERATIONS = 5
const STAGE_KIND: StageKind = 'analyze'

// ---------------------------------------------------------------------------
// IterateStageRunner
// ---------------------------------------------------------------------------

export class IterateStageRunner implements StageRunner {
  kind: StageKind = STAGE_KIND

  async run(context: StageContext): Promise<StageResult> {
    const { casoSlug, stage, pipelineState } = context
    const maxIterations =
      (stage.config?.max_iterations as number | undefined) ?? DEFAULT_MAX_ITERATIONS
    const errors: string[] = []
    let totalProposals = 0
    let totalRecords = 0

    // Fresh research program per run — directives seeded from gap detection
    const program = new ResearchProgram()

    // Resolve LLM provider
    const llm = await resolveLLMProvider(stage.model_config_id)
    const tools = getToolsForStage(STAGE_KIND)

    // Main iteration loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const before = await getGraphSummary(casoSlug)
      const gapReport = await detectGaps(casoSlug)

      // Seed directives from gap suggestions on first iteration if program is empty
      if (iteration === 0 && program.getAll().length === 0) {
        for (const question of gapReport.suggested_questions) {
          const d = program.addDirective(question)
          program.activate(d.id)
        }
      }

      // Build LLM prompt
      const messages = buildMessages(casoSlug, program, gapReport, iteration)

      let proposalsThisIteration = 0
      try {
        const response = await llm.complete({
          messages,
          tools,
          temperature: 0.3,
          max_tokens: 4096,
        })

        // Process tool calls into proposals
        if (response.tool_calls) {
          for (const toolCall of response.tool_calls) {
            const created = await processToolCall(
              toolCall,
              pipelineState.id,
              stage.id,
            )
            if (created) proposalsThisIteration++
          }
        }

        totalRecords++
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push(`Iteration ${iteration}: ${message}`)
      }

      totalProposals += proposalsThisIteration

      // Evaluate convergence
      const after = await getGraphSummary(casoSlug)
      const metrics = evaluateIteration(before, after, proposalsThisIteration)

      if (!shouldContinue(metrics, iteration + 1, maxIterations)) {
        break
      }
    }

    return {
      proposals_created: totalProposals,
      records_processed: totalRecords,
      errors,
    }
  }
}

// ---------------------------------------------------------------------------
// LLM provider resolution
// ---------------------------------------------------------------------------

async function resolveLLMProvider(
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

async function getGraphSummary(casoSlug: string): Promise<GraphSummary> {
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
// LLM prompt construction
// ---------------------------------------------------------------------------

function buildMessages(
  casoSlug: string,
  program: ResearchProgram,
  gapReport: Awaited<ReturnType<typeof detectGaps>>,
  iteration: number,
): Message[] {
  const activeDirectives = program.getActive()
  const directivesSummary =
    activeDirectives.length > 0
      ? activeDirectives
          .map((d) => `- [${d.id}] (priority ${d.priority}) ${d.question}`)
          .join('\n')
      : 'No active directives.'

  const gapsSummary = gapReport.suggested_questions.join('\n- ')

  return [
    {
      role: 'system',
      content: `You are an autonomous investigative research agent analyzing the "${casoSlug}" case.
Your task is to identify gaps in the investigation graph and propose new nodes, edges, or hypotheses.
Use the provided tools to query the graph, propose additions, and analyze patterns.
Focus on high-confidence, well-sourced findings. Do not speculate without evidence.`,
    },
    {
      role: 'user',
      content: `Iteration ${iteration + 1}. Analyze the investigation graph and propose improvements.

## Active Research Directives
${directivesSummary}

## Detected Gaps
- ${gapsSummary}

## Isolated Nodes: ${gapReport.isolated_nodes.length}
## Low Confidence Nodes: ${gapReport.low_confidence_clusters.length}
## Missing Relationships: ${gapReport.missing_relationships.length}

Use the available tools to investigate these gaps and propose graph mutations.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// Tool call → Proposal processing
// ---------------------------------------------------------------------------

async function processToolCall(
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

    default:
      // Non-proposal tools (read_graph, run_algorithm, compare_timelines) don't create proposals
      return false
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}
