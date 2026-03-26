/**
 * Tier-minimum check handler - verifies nodes meet a minimum confidence tier.
 *
 * Tier ordering: gold > silver > bronze.
 * Counts nodes below the specified minimum tier. Passes if count === 0.
 */

import { readQuery } from '../../neo4j/client'
import type { CheckResult, ComplianceRule } from '../types'
import type { TierMinimumCheckConfig } from './config-types'
import type { CheckContext } from './handler'

const TIER_ORDER: Record<string, number> = { gold: 3, silver: 2, bronze: 1 }

/**
 * Return tiers strictly below the minimum.
 * E.g., min_tier = 'silver' → ['bronze'] and nodes with no tier.
 */
function tiersBelow(minTier: string): string[] {
  const minLevel = TIER_ORDER[minTier] ?? 0
  return Object.entries(TIER_ORDER)
    .filter(([, level]) => level < minLevel)
    .map(([name]) => name)
}

export async function tierMinimumCheck(
  rule: ComplianceRule,
  config: TierMinimumCheckConfig,
  ctx: CheckContext,
): Promise<CheckResult> {
  const below = tiersBelow(config.min_tier)

  // Count nodes that are below minimum tier OR have no tier set
  const cypher = config.scope
    ? `MATCH (n:\`${config.label}\`)
       WHERE n.caso_slug = $caso_slug
       AND (n.confidence_tier IS NULL OR n.confidence_tier IN $below_tiers)
       RETURN count(n) AS violations`
    : `MATCH (n:\`${config.label}\`)
       WHERE n.confidence_tier IS NULL OR n.confidence_tier IN $below_tiers
       RETURN count(n) AS violations`

  const result = await readQuery(
    cypher,
    { caso_slug: ctx.caso_slug, below_tiers: below },
    (record) => record.get('violations'),
  )

  const violations = Number(result.records[0] ?? 0)

  return {
    rule_code: rule.code,
    rule_title: rule.title,
    mode: rule.mode,
    severity: rule.severity,
    phase: rule.phase,
    check_type: 'tier_minimum',
    passed: violations === 0,
    violations,
    details: violations === 0
      ? `All ${config.label} nodes meet minimum tier '${config.min_tier}'`
      : `${violations} ${config.label} node(s) below minimum tier '${config.min_tier}'`,
  }
}
