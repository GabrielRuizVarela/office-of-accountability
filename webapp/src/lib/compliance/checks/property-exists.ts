/**
 * Property-exists check handler - verifies all nodes of a label have a property.
 *
 * Counts nodes where the property IS NULL. Passes if count === 0.
 */

import { readQuery } from '../../neo4j/client'
import type { CheckResult, ComplianceRule } from '../types'
import type { PropertyExistsCheckConfig } from './config-types'
import type { CheckContext } from './handler'

export async function propertyExistsCheck(
  rule: ComplianceRule,
  config: PropertyExistsCheckConfig,
  ctx: CheckContext,
): Promise<CheckResult> {
  // Build a safe Cypher query - label and property come from validated YAML, not user input
  const cypher = config.scope
    ? `MATCH (n:\`${config.label}\`) WHERE n.caso_slug = $caso_slug AND n.\`${config.property}\` IS NULL RETURN count(n) AS violations`
    : `MATCH (n:\`${config.label}\`) WHERE n.\`${config.property}\` IS NULL RETURN count(n) AS violations`

  const result = await readQuery(
    cypher,
    { caso_slug: ctx.caso_slug },
    (record) => record.get('violations'),
  )

  const violations = Number(result.records[0] ?? 0)

  return {
    rule_code: rule.code,
    rule_title: rule.title,
    mode: rule.mode,
    severity: rule.severity,
    phase: rule.phase,
    check_type: 'property_exists',
    passed: violations === 0,
    violations,
    details: violations === 0
      ? `All ${config.label} nodes have property '${config.property}'`
      : `${violations} ${config.label} node(s) missing property '${config.property}'`,
  }
}
