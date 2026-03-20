/**
 * MiroFish API client.
 *
 * Communicates with the MiroFish swarm intelligence server
 * running on a GPU machine with llama.cpp.
 */

import type { MiroFishSeedData, MiroFishResponse, SimulationMessage } from './types'

const MIROFISH_API_URL = process.env.MIROFISH_API_URL ?? 'http://localhost:5000'
const REQUEST_TIMEOUT_MS = 30_000

/**
 * Initialize a MiroFish simulation with seed data.
 */
export async function initializeSimulation(
  seed: MiroFishSeedData,
): Promise<MiroFishResponse<{ simulation_id: string }>> {
  return apiRequest('/api/simulation/init', {
    method: 'POST',
    body: JSON.stringify(seed),
  })
}

/**
 * Send a query to the MiroFish simulation.
 */
export async function querySimulation(
  simulationId: string,
  prompt: string,
): Promise<MiroFishResponse<{ messages: SimulationMessage[] }>> {
  return apiRequest('/api/simulation/query', {
    method: 'POST',
    body: JSON.stringify({ simulation_id: simulationId, prompt }),
  })
}

/**
 * Get the status of a running simulation.
 */
export async function getSimulationStatus(
  simulationId: string,
): Promise<MiroFishResponse<{ status: string; agent_count: number }>> {
  return apiRequest(`/api/simulation/${simulationId}/status`, {
    method: 'GET',
  })
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<MiroFishResponse<T>> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(`${MIROFISH_API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { success: false, error: `MiroFish API error: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data: data as T }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, error: 'MiroFish request timed out' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'MiroFish connection failed',
    }
  }
}
