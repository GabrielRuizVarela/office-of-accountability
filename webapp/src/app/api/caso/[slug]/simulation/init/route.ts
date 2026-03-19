/**
 * POST /api/caso/[slug]/simulation/init
 *
 * Initialize a MiroFish-style simulation by exporting the investigation
 * graph into agent definitions and sending them to the LLM.
 */

import { NextRequest } from 'next/server'

import { CASO_EPSTEIN_SLUG } from '../../../../../../lib/caso-epstein/types'
import { getInvestigationGraph } from '../../../../../../lib/caso-epstein/queries'
import { graphToMiroFishSeed } from '../../../../../../lib/mirofish/export'

/** In-memory simulation state (single-instance; production would use Redis) */
const simulations = new Map<string, { seed: ReturnType<typeof graphToMiroFishSeed>; messages: Array<{ role: string; content: string }> }>()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Currently only the Epstein case is supported — accept any slug
  try {
    const graphData = await getInvestigationGraph(CASO_EPSTEIN_SLUG)
    const seed = graphToMiroFishSeed(graphData, 'Epstein network analysis')

    const simulationId = `sim-${Date.now()}`
    simulations.set(simulationId, {
      seed,
      messages: [{
        role: 'system',
        content: buildSystemPrompt(seed),
      }],
    })

    // Store globally so the query route can access it
    ;(globalThis as Record<string, unknown>).__epstein_simulations = simulations

    return Response.json({
      success: true,
      data: {
        simulation_id: simulationId,
        agent_count: seed.agents.length,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('connect') || message.includes('ECONNREFUSED')) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    return Response.json({ success: false, error: 'Failed to initialize simulation' }, { status: 500 })
  }
}

function buildSystemPrompt(seed: ReturnType<typeof graphToMiroFishSeed>): string {
  // Keep prompt compact to fit in 4096 context window
  const topAgents = seed.agents.slice(0, 6)
  const agentNames = topAgents.map((a) => `${a.name} (${a.role})`).join(', ')

  return `You analyze the Jeffrey Epstein network as a swarm of ${seed.agents.length} agents: ${agentNames}, and others.
Simulate 2-3 agents responding from their perspectives. Prefix each with the agent name.
Base analysis on public court records, flight logs, and verified reporting. Distinguish facts from inferences. Be concise.`
}
