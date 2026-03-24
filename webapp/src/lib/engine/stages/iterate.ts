/**
 * Iterate stage runner — autonomous research iteration loop.
 *
 * First real stage with logic (existing stages are stubs or simple connectors).
 * Loops LLM calls with gap detection until convergence or max iterations.
 * Uses ResearchProgram for directives, ResearchMetrics for convergence,
 * GapDetector for structural focus.
 */

import type { StageKind } from '../types'
import type { StageRunner, StageContext, StageResult, TokenUsage } from './types'
import { ResearchProgram } from '../research-program'
import {
  evaluateIteration,
  shouldContinue,
} from '../research-metrics'
import { detectGaps } from '../gap-detector'
import { getToolsForStage } from '../llm/tools'
import type { Message } from '../llm/types'
import { resolveLLMProvider, processToolCall, getGraphSummary } from './shared'
import { incrementCounter } from '../metrics'
import { createEngineLogger } from '../logger'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_ITERATIONS = 5
const DEFAULT_TOKEN_BUDGET = 100_000
const STAGE_KIND: StageKind = 'iterate'

// ---------------------------------------------------------------------------
// IterateStageRunner
// ---------------------------------------------------------------------------

export class IterateStageRunner implements StageRunner {
  kind: StageKind = STAGE_KIND

  async run(context: StageContext): Promise<StageResult> {
    const { casoSlug, stage, pipelineState } = context
    const log = createEngineLogger(pipelineState.id, 'iterate')
    const maxIterations =
      (stage.config?.max_iterations as number | undefined) ?? DEFAULT_MAX_ITERATIONS
    const tokenBudget =
      (stage.config?.token_budget as number | undefined) ?? DEFAULT_TOKEN_BUDGET
    const errors: string[] = []
    let totalProposals = 0
    let totalRecords = 0
    const tokensUsed: TokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

    log.info('stage.start', { max_iterations: maxIterations, token_budget: tokenBudget })

    // Fresh research program per run — directives seeded from gap detection
    const program = new ResearchProgram()

    // Resolve LLM provider
    const llm = await resolveLLMProvider(stage.model_config_id)
    const tools = getToolsForStage(STAGE_KIND)

    // Main iteration loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Check token budget before starting a new iteration
      if (tokensUsed.total_tokens >= tokenBudget) {
        log.warn('token_budget.exhausted', { used: tokensUsed.total_tokens, budget: tokenBudget, iteration })
        errors.push(
          `Token budget exhausted (${tokensUsed.total_tokens}/${tokenBudget}) — stopping at iteration ${iteration}`,
        )
        break
      }

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
        incrementCounter('llm_calls_total')

        // Accumulate token usage
        if (response.usage) {
          tokensUsed.prompt_tokens += response.usage.prompt_tokens
          tokensUsed.completion_tokens += response.usage.completion_tokens
          tokensUsed.total_tokens +=
            response.usage.prompt_tokens + response.usage.completion_tokens
        }

        // Process tool calls into proposals
        if (response.tool_calls) {
          for (const toolCall of response.tool_calls) {
            const created = await processToolCall(
              toolCall,
              pipelineState.id,
              stage.id,
              casoSlug,
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

    log.info('stage.done', { proposals: totalProposals, records: totalRecords, tokens: tokensUsed.total_tokens, errors: errors.length })

    return {
      proposals_created: totalProposals,
      records_processed: totalRecords,
      tokens_used: tokensUsed.total_tokens > 0 ? tokensUsed : undefined,
      errors,
    }
  }
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
