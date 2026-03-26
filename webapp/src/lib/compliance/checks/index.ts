/**
 * Compliance check dispatcher - M11 Phase 3.
 *
 * Maps CheckConfig.type → handler function and dispatches evaluation.
 * All 5 check types: cypher, property_exists, min_count, tier_minimum, llm.
 */

import type { CheckConfig, CheckResult, ComplianceRule } from '../types'
import type { CheckContext } from './handler'
import { cypherCheck } from './cypher'
import { propertyExistsCheck } from './property-exists'
import { minCountCheck } from './min-count'
import { tierMinimumCheck } from './tier-minimum'
import { llmCheck } from './llm'

export type { CheckContext } from './handler'

/**
 * Evaluate a single compliance rule by dispatching to the appropriate handler.
 * Throws if the check type is unrecognized (should not happen with Zod validation).
 */
export async function evaluateRule(
  rule: ComplianceRule,
  ctx: CheckContext,
): Promise<CheckResult> {
  const config = rule.check

  switch (config.type) {
    case 'cypher':
      return cypherCheck(rule, config, ctx)
    case 'property_exists':
      return propertyExistsCheck(rule, config, ctx)
    case 'min_count':
      return minCountCheck(rule, config, ctx)
    case 'tier_minimum':
      return tierMinimumCheck(rule, config, ctx)
    case 'llm':
      return llmCheck(rule, config, ctx)
    default: {
      const _exhaustive: never = config
      throw new Error(`Unknown check type: ${(_exhaustive as CheckConfig).type}`)
    }
  }
}
