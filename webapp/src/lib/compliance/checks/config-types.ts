/**
 * Narrow config types extracted from the CheckConfig discriminated union.
 * Used by individual handlers to get the correct config shape.
 */

import type { CheckConfig } from '../types'

export type CypherCheckConfig = Extract<CheckConfig, { type: 'cypher' }>
export type PropertyExistsCheckConfig = Extract<CheckConfig, { type: 'property_exists' }>
export type MinCountCheckConfig = Extract<CheckConfig, { type: 'min_count' }>
export type TierMinimumCheckConfig = Extract<CheckConfig, { type: 'tier_minimum' }>
export type LlmCheckConfig = Extract<CheckConfig, { type: 'llm' }>
