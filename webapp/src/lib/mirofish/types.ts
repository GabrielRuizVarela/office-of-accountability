/**
 * MiroFish integration types.
 *
 * Types for communicating with the MiroFish swarm intelligence API.
 */

/** Agent definition for MiroFish simulation */
export interface MiroFishAgent {
  readonly name: string
  readonly role: string
  readonly background: string
  readonly connections: readonly string[]
}

/** Seed data format for initializing a MiroFish simulation */
export interface MiroFishSeedData {
  readonly agents: readonly MiroFishAgent[]
  readonly context: string
  readonly scenario: string
}

/** MiroFish simulation status */
export type SimulationStatus = 'idle' | 'running' | 'completed' | 'error'

/** Message in a MiroFish simulation chat */
export interface SimulationMessage {
  readonly role: 'user' | 'agent' | 'system'
  readonly agent_name?: string
  readonly content: string
  readonly timestamp: string
}

/** Pre-configured prediction prompt */
export interface PredictionPrompt {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly prompt: string
}

/** MiroFish API response envelope */
export interface MiroFishResponse<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
}
