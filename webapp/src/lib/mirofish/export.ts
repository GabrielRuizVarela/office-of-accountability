/**
 * Knowledge graph → MiroFish seed data conversion.
 *
 * Exports the Epstein investigation graph into the format
 * expected by MiroFish for initializing agent simulations.
 */

import type { GraphData } from '../neo4j/types'
import type { MiroFishSeedData, MiroFishAgent } from './types'

/**
 * Convert the investigation GraphData into MiroFish seed format.
 *
 * Each Person node becomes a MiroFish agent. Their connections
 * (to other people, organizations, locations) form the agent's
 * background and connection list.
 */
export function graphToMiroFishSeed(data: GraphData, scenario: string): MiroFishSeedData {
  const personNodes = data.nodes.filter((n) => n.labels.includes('Person'))

  const agents: MiroFishAgent[] = personNodes.map((person) => {
    // Find all connections for this person
    const connectedNodeIds = new Set<string>()
    for (const link of data.links) {
      if (link.source === person.id) connectedNodeIds.add(link.target)
      if (link.target === person.id) connectedNodeIds.add(link.source)
    }

    // Get connected person names
    const connections = data.nodes
      .filter((n) => connectedNodeIds.has(n.id) && n.labels.includes('Person'))
      .map((n) => String(n.properties.name ?? n.id))

    // Build background from properties and connections
    const orgs = data.nodes
      .filter((n) => connectedNodeIds.has(n.id) && n.labels.includes('Organization'))
      .map((n) => String(n.properties.name ?? n.id))

    const locations = data.nodes
      .filter((n) => connectedNodeIds.has(n.id) && n.labels.includes('Location'))
      .map((n) => String(n.properties.name ?? n.id))

    const parts: string[] = []
    if (person.properties.description) parts.push(String(person.properties.description))
    if (orgs.length > 0) parts.push(`Organizations: ${orgs.join(', ')}`)
    if (locations.length > 0) parts.push(`Locations: ${locations.join(', ')}`)

    return {
      name: String(person.properties.name ?? person.id),
      role: String(person.properties.role ?? ''),
      background: parts.join('. '),
      connections,
    }
  })

  const context = [
    'Jeffrey Epstein investigation network.',
    `${personNodes.length} persons, ${data.nodes.length} total entities.`,
    'Based on public court records, flight logs, and verified reporting.',
  ].join(' ')

  return { agents, context, scenario }
}
