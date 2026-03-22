/**
 * Cypher check handler — runs an arbitrary Cypher query against Neo4j.
 *
 * The query MUST return a single `violations` integer column.
 * Passes if violations === 0.
 */

import { readQuery } from '../../neo4j/client'
import type { CheckResult, ComplianceRule } from '../types'
import type { CypherCheckConfig } from './config-types'
import type { CheckContext } from './handler'

export async function cypherCheck(
  rule: ComplianceRule,
  config: CypherCheckConfig,
  ctx: CheckContext,
): Promise<CheckResult> {
  const result = await readQuery(
    config.query,
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
    check_type: 'cypher',
    passed: violations === 0,
    violations,
    details: violations === 0
      ? 'Cypher check passed — no violations'
      : `Cypher check found ${violations} violation(s)`,
  }
}
