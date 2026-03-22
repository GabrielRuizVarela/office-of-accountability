/**
 * Compliance Engine — M11 Phase 4.
 *
 * Orchestrates rule evaluation for a framework against an investigation.
 * Produces a ComplianceReport with:
 * - Gate results (blocking checks)
 * - Auditor results (warning-level checks)
 * - Checklist attestation statuses (resolved from Neo4j)
 * - Overall score + gate_passed flag
 */

import { readQuery } from '../neo4j/client'

import type {
  CheckResult,
  ChecklistStatus,
  ComplianceFramework,
  CompliancePhase,
  ComplianceReport,
  ComplianceRule,
  ChecklistItem,
} from './types'
import { evaluateRule, type CheckContext } from './checks'

// ---------------------------------------------------------------------------
// Rule evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate all rules in a framework, optionally filtering by phase.
 * Returns results split into gate and auditor arrays.
 */
async function evaluateAllRules(
  rules: ComplianceRule[],
  ctx: CheckContext,
  phase: CompliancePhase,
): Promise<{ gate: CheckResult[]; auditor: CheckResult[] }> {
  const applicable = phase === 'any'
    ? rules
    : rules.filter((r) => r.phase === phase || r.phase === 'any')

  const gate: CheckResult[] = []
  const auditor: CheckResult[] = []

  for (const rule of applicable) {
    try {
      const result = await evaluateRule(rule, ctx)
      if (rule.mode === 'gate') {
        gate.push(result)
      } else {
        auditor.push(result)
      }
    } catch (error) {
      // Fail open: record the error as a failed check result
      const errorResult: CheckResult = {
        rule_code: rule.code,
        rule_title: rule.title,
        mode: rule.mode,
        severity: rule.severity,
        phase: rule.phase,
        check_type: rule.check.type,
        passed: false,
        violations: -1,
        details: `Check handler error: ${error instanceof Error ? error.message : String(error)}`,
      }

      if (rule.mode === 'gate') {
        gate.push(errorResult)
      } else {
        auditor.push(errorResult)
      }
    }
  }

  return { gate, auditor }
}

// ---------------------------------------------------------------------------
// Checklist attestation resolution
// ---------------------------------------------------------------------------

/**
 * Resolve checklist attestation status for each item in a framework.
 * Queries Neo4j for ComplianceAttestation nodes linked to the investigation.
 */
async function resolveChecklistStatus(
  checklist: ChecklistItem[],
  frameworkId: string,
  investigationId: string,
): Promise<ChecklistStatus[]> {
  if (checklist.length === 0) return []

  // Fetch all attestations for this framework + investigation in one query
  const attestations = await readQuery(
    `MATCH (a:ComplianceAttestation)
     WHERE a.framework_id = $frameworkId
       AND a.investigation_id = $investigationId
     RETURN a.checklist_item_id AS code,
            a.attested_by AS attested_by,
            a.attested_at AS attested_at,
            a.notes AS notes`,
    { frameworkId, investigationId },
    (record) => ({
      code: record.get('code') as string,
      attested_by: record.get('attested_by') as string,
      attested_at: record.get('attested_at') as string,
      notes: record.get('notes') as string | null,
    }),
  )

  // Index attestations by checklist item code
  const attestationMap = new Map(
    attestations.records.map((a) => [a.code, a]),
  )

  return checklist.map((item) => {
    const att = attestationMap.get(item.code)
    return {
      code: item.code,
      title: item.title,
      phase: item.phase,
      required: item.required,
      attested: att !== undefined,
      attested_by: att?.attested_by,
      attested_at: att?.attested_at,
      notes: att?.notes ?? undefined,
    }
  })
}

// ---------------------------------------------------------------------------
// Score calculation
// ---------------------------------------------------------------------------

/**
 * Compute overall compliance score (0–1).
 *
 * Score = weighted average:
 * - Gate checks: 70% weight (must-pass)
 * - Auditor checks: 20% weight (advisory)
 * - Required checklist items: 10% weight (manual attestations)
 *
 * Empty categories are excluded from the denominator.
 */
function computeScore(
  gateResults: CheckResult[],
  auditorResults: CheckResult[],
  checklistStatuses: ChecklistStatus[],
): number {
  const weights = { gate: 0.7, auditor: 0.2, checklist: 0.1 }
  let totalWeight = 0
  let weightedScore = 0

  if (gateResults.length > 0) {
    const passed = gateResults.filter((r) => r.passed).length
    weightedScore += weights.gate * (passed / gateResults.length)
    totalWeight += weights.gate
  }

  if (auditorResults.length > 0) {
    const passed = auditorResults.filter((r) => r.passed).length
    weightedScore += weights.auditor * (passed / auditorResults.length)
    totalWeight += weights.auditor
  }

  const requiredItems = checklistStatuses.filter((c) => c.required)
  if (requiredItems.length > 0) {
    const attested = requiredItems.filter((c) => c.attested).length
    weightedScore += weights.checklist * (attested / requiredItems.length)
    totalWeight += weights.checklist
  }

  if (totalWeight === 0) return 1 // No checks → fully compliant

  return Math.round((weightedScore / totalWeight) * 1000) / 1000
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface EvaluateOptions {
  /** Framework definition (parsed from YAML or loaded from Neo4j) */
  framework: ComplianceFramework
  /** Investigation ID (caso_slug) to evaluate */
  investigationId: string
  /** Phase to evaluate — 'any' evaluates all rules */
  phase?: CompliancePhase
}

/**
 * Run a full compliance evaluation for a framework against an investigation.
 *
 * 1. Evaluates all applicable rules (gate + auditor)
 * 2. Resolves checklist attestation statuses from Neo4j
 * 3. Computes overall score
 * 4. Returns a ComplianceReport
 */
export async function evaluateFramework(opts: EvaluateOptions): Promise<ComplianceReport> {
  const { framework, investigationId, phase = 'any' } = opts
  const ctx: CheckContext = { caso_slug: investigationId }

  // 1. Run all rule checks
  const { gate, auditor } = await evaluateAllRules(framework.rules, ctx, phase)

  // 2. Resolve checklist attestations
  const checklist = await resolveChecklistStatus(
    framework.checklist ?? [],
    framework.id,
    investigationId,
  )

  // 3. Compute score
  const overallScore = computeScore(gate, auditor, checklist)

  // 4. Gate pass/fail — all gate checks must pass
  const gatePassed = gate.every((r) => r.passed)

  // 5. Total violations across all results
  const totalViolations = [...gate, ...auditor]
    .reduce((sum, r) => sum + Math.max(0, r.violations), 0)

  return {
    framework_id: framework.id,
    framework_name: framework.name,
    investigation_id: investigationId,
    phase,
    evaluated_at: new Date().toISOString(),
    overall_score: overallScore,
    gate_results: gate,
    auditor_results: auditor,
    checklist,
    gate_passed: gatePassed,
    total_violations: totalViolations,
  }
}
