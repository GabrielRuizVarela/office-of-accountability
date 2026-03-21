/**
 * Knowledge graph → MiroFish seed data conversion.
 *
 * Exports an investigation graph into the format expected by
 * MiroFish for initializing agent simulations.
 */

import type { GraphData } from '../neo4j/types'
import type { MiroFishSeedData, MiroFishAgent } from './types'

/** Config for which graph labels map to MiroFish agents and context. */
export interface MiroFishExportConfig {
  /** Label used to select agent nodes (default: 'Person'). */
  agent_source?: string
  /** Labels used for context/background nodes (default: ['Organization', 'Location']). */
  context_from?: string[]
}

const DEFAULT_AGENT_SOURCE = 'Person'
const DEFAULT_CONTEXT_FROM = ['Organization', 'Location']

/**
 * Convert the investigation GraphData into MiroFish seed format.
 *
 * Agent nodes (matching `agent_source` label) become MiroFish agents.
 * Their connections to other agent nodes and context nodes
 * (matching `context_from` labels) form background and connection lists.
 */
export function graphToMiroFishSeed(
  data: GraphData,
  scenario: string,
  investigationName?: string,
  config?: MiroFishExportConfig,
): MiroFishSeedData {
  const agentLabel = config?.agent_source ?? DEFAULT_AGENT_SOURCE
  const contextLabels = config?.context_from ?? DEFAULT_CONTEXT_FROM

  const agentNodes = data.nodes.filter((n) => n.labels.includes(agentLabel))

  const agents: MiroFishAgent[] = agentNodes.map((agent) => {
    // Find all connections for this agent
    const connectedNodeIds = new Set<string>()
    for (const link of data.links) {
      if (link.source === agent.id) connectedNodeIds.add(link.target)
      if (link.target === agent.id) connectedNodeIds.add(link.source)
    }

    // Get connected agent-type node names
    const connections = data.nodes
      .filter((n) => connectedNodeIds.has(n.id) && n.labels.includes(agentLabel))
      .map((n) => String(n.properties.name ?? n.id))

    // Build background from properties and context connections
    const parts: string[] = []
    if (agent.properties.description) parts.push(String(agent.properties.description))

    for (const ctxLabel of contextLabels) {
      const ctxNodes = data.nodes
        .filter((n) => connectedNodeIds.has(n.id) && n.labels.includes(ctxLabel))
        .map((n) => String(n.properties.name ?? n.id))
      if (ctxNodes.length > 0) parts.push(`${ctxLabel}: ${ctxNodes.join(', ')}`)
    }

    return {
      name: String(agent.properties.name ?? agent.id),
      role: String(agent.properties.role ?? ''),
      background: parts.join('. '),
      connections,
    }
  })

  const context = [
    `${investigationName ?? 'Investigation'} network.`,
    `${agentNodes.length} ${agentLabel.toLowerCase()} nodes, ${data.nodes.length} total entities.`,
    'Based on verified sources and public records.',
  ].join(' ')

  return { agents, context, scenario }
}
