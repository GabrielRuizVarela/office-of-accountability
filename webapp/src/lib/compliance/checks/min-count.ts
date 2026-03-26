/**
 * Min-count check handler - verifies nodes have minimum relationship count.
 *
 * Counts nodes of the given label with fewer than `min` relationships
 * of the specified type. Passes if count === 0.
 */

import { readQuery } from '../../neo4j/client'
import type { CheckResult, ComplianceRule } from '../types'
import type { MinCountCheckConfig } from './config-types'
import type { CheckContext } from './handler'

export async function minCountCheck(
  rule: ComplianceRule,
  config: MinCountCheckConfig,
  ctx: CheckContext,
): Promise<CheckResult> {
  const cypher = config.scope
    ? `MATCH (n:\`${config.label}\`)
       WHERE n.caso_slug = $caso_slug
       WITH n, COUNT { (n)-[:\`${config.relationship}\`]-() } AS rel_count
       WHERE rel_count < $min
       RETURN count(n) AS violations`
    : `MATCH (n:\`${config.label}\`)
       WITH n, COUNT { (n)-[:\`${config.relationship}\`]-() } AS rel_count
       WHERE rel_count < $min
       RETURN count(n) AS violations`

  const result = await readQuery(
    cypher,
    { caso_slug: ctx.caso_slug, min: config.min },
    (record) => record.get('violations'),
  )

  const violations = Number(result.records[0] ?? 0)

  return {
    rule_code: rule.code,
    rule_title: rule.title,
    mode: rule.mode,
    severity: rule.severity,
    phase: rule.phase,
    check_type: 'min_count',
    passed: violations === 0,
    violations,
    details: violations === 0
      ? `All ${config.label} nodes have >= ${config.min} ${config.relationship} relationships`
      : `${violations} ${config.label} node(s) have < ${config.min} ${config.relationship} relationships`,
  }
}
