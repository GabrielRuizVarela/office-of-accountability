/**
 * Compliance check handler interface — M11 Phase 3.
 *
 * All check handlers implement this interface. The dispatcher
 * maps CheckConfig.type → handler and invokes it.
 */

import type { CheckConfig, CheckResult, ComplianceRule } from '../types'

/** Context passed to every check handler */
export interface CheckContext {
  /** Investigation slug for scoped queries */
  caso_slug: string
}

/** A check handler evaluates a single rule and returns a CheckResult */
export interface CheckHandler<T extends CheckConfig = CheckConfig> {
  (rule: ComplianceRule, config: T, ctx: CheckContext): Promise<CheckResult>
}
