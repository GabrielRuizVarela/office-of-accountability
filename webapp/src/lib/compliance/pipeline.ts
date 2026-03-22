/**
 * Compliance Pipeline Integration — M11 Phase 5.
 *
 * Hooks the compliance engine into the investigation pipeline:
 * - runComplianceGate() — evaluates all frameworks' gate rules for a stage phase,
 *   persists ComplianceEvaluation nodes, and returns a pass/fail verdict.
 * - persistEvaluation() — saves a ComplianceReport as a ComplianceEvaluation node in Neo4j.
 * - loadFrameworksFromNeo4j() — reads persisted ComplianceFramework definitions from Neo4j
 *   (YAML files are loaded at seed time; at runtime we reconstruct from graph nodes).
 */

import crypto from 'node:crypto'

import { readQuery, writeQuery } from '../neo4j/client'

import type {
  ComplianceFramework,
  CompliancePhase,
  ComplianceReport,
  ComplianceRule,
  CheckConfig,
  ChecklistItem,
} from './types'
import { evaluateFramework } from './engine'

// ---------------------------------------------------------------------------
// Load frameworks from Neo4j (runtime — no YAML/fs dependency)
// ---------------------------------------------------------------------------

/**
 * Reconstruct a ComplianceFramework from Neo4j nodes.
 * Reads ComplianceFramework + linked ComplianceRule + ChecklistItem nodes.
 */
export async function loadFrameworksFromNeo4j(): Promise<ComplianceFramework[]> {
  // 1. Load all framework nodes
  const fwResult = await readQuery(
    `MATCH (f:ComplianceFramework)
     RETURN f.id AS id, f.name AS name, f.standard AS standard,
            f.version AS version, f.description AS description`,
    {},
    (record) => ({
      id: record.get('id') as string,
      name: record.get('name') as string,
      standard: record.get('standard') as string,
      version: record.get('version') as string,
      description: (record.get('description') as string | null) ?? undefined,
    }),
  )

  const frameworks: ComplianceFramework[] = []

  for (const fw of fwResult.records) {
    // 2. Load rules for this framework
    const rulesResult = await readQuery(
      `MATCH (f:ComplianceFramework {id: $fwId})-[:HAS_RULE]->(r:ComplianceRule)
       RETURN r.code AS code, r.title AS title, r.description AS description,
              r.mode AS mode, r.severity AS severity, r.phase AS phase,
              r.check_config AS check_config`,
      { fwId: fw.id },
      (record) => {
        const checkConfig = JSON.parse(record.get('check_config') as string) as CheckConfig
        return {
          code: record.get('code') as string,
          title: record.get('title') as string,
          description: (record.get('description') as string | null) ?? undefined,
          mode: record.get('mode') as ComplianceRule['mode'],
          severity: record.get('severity') as ComplianceRule['severity'],
          phase: record.get('phase') as ComplianceRule['phase'],
          check: checkConfig,
        } satisfies ComplianceRule
      },
    )

    // 3. Load checklist items for this framework
    const checklistResult = await readQuery(
      `MATCH (f:ComplianceFramework {id: $fwId})-[:HAS_CHECKLIST_ITEM]->(ci:ChecklistItem)
       RETURN ci.code AS code, ci.title AS title, ci.description AS description,
              ci.phase AS phase, ci.required AS required`,
      { fwId: fw.id },
      (record) => ({
        code: record.get('code') as string,
        title: record.get('title') as string,
        description: (record.get('description') as string | null) ?? undefined,
        phase: record.get('phase') as ChecklistItem['phase'],
        required: record.get('required') as boolean,
      }),
    )

    frameworks.push({
      id: fw.id,
      name: fw.name,
      standard: fw.standard,
      version: fw.version,
      description: fw.description,
      rules: rulesResult.records as unknown as ComplianceRule[],
      checklist: checklistResult.records as unknown as ChecklistItem[],
    })
  }

  return frameworks
}

// ---------------------------------------------------------------------------
// Persist ComplianceEvaluation node
// ---------------------------------------------------------------------------

/**
 * Save a ComplianceReport as a ComplianceEvaluation node in Neo4j.
 * Links it to the investigation via investigation_id.
 * The full report is serialised to results_json for later retrieval.
 */
export async function persistEvaluation(report: ComplianceReport): Promise<string> {
  const id = crypto.randomUUID()

  await writeQuery(
    `CREATE (e:ComplianceEvaluation {
       id: $id,
       investigation_id: $investigationId,
       framework_id: $frameworkId,
       phase: $phase,
       evaluated_at: $evaluatedAt,
       overall_score: $overallScore,
       gate_passed: $gatePassed,
       total_violations: $totalViolations,
       results_json: $resultsJson
     })
     RETURN e.id AS id`,
    {
      id,
      investigationId: report.investigation_id,
      frameworkId: report.framework_id,
      phase: report.phase,
      evaluatedAt: report.evaluated_at,
      overallScore: report.overall_score,
      gatePassed: report.gate_passed,
      totalViolations: report.total_violations,
      resultsJson: JSON.stringify(report),
    },
    (record) => record.get('id') as string,
  )

  return id
}

// ---------------------------------------------------------------------------
// Compliance gate check for pipeline stage transitions
// ---------------------------------------------------------------------------

export interface ComplianceGateResult {
  /** Whether all gate checks passed across all frameworks */
  passed: boolean
  /** Per-framework evaluation reports */
  reports: ComplianceReport[]
  /** Per-framework ComplianceEvaluation node IDs */
  evaluationIds: string[]
  /** Summary of failures for audit log / error messages */
  summary: string
}

/**
 * Run compliance gate checks for a stage transition.
 *
 * 1. Loads all ComplianceFramework definitions from Neo4j
 * 2. Evaluates each framework for the given phase + investigation
 * 3. Persists a ComplianceEvaluation node per framework
 * 4. Returns pass/fail verdict — all frameworks must pass gate checks
 *
 * If no frameworks are loaded (compliance not seeded), gate passes by default.
 */
export async function runComplianceGate(
  investigationId: string,
  phase: CompliancePhase,
): Promise<ComplianceGateResult> {
  const frameworks = await loadFrameworksFromNeo4j()

  // No frameworks → pass (compliance not configured)
  if (frameworks.length === 0) {
    return {
      passed: true,
      reports: [],
      evaluationIds: [],
      summary: 'No compliance frameworks configured',
    }
  }

  const reports: ComplianceReport[] = []
  const evaluationIds: string[] = []
  const failures: string[] = []

  for (const fw of frameworks) {
    try {
      const report = await evaluateFramework({
        framework: fw,
        investigationId,
        phase,
      })

      reports.push(report)

      // Persist evaluation regardless of outcome
      const evalId = await persistEvaluation(report)
      evaluationIds.push(evalId)

      if (!report.gate_passed) {
        const failedGates = report.gate_results
          .filter((r) => !r.passed)
          .map((r) => `${r.rule_code}: ${r.rule_title} (${r.violations} violations)`)
        failures.push(`[${fw.name}] ${failedGates.join('; ')}`)
      }
    } catch (error) {
      // Framework evaluation failed entirely — treat as gate failure
      const msg = error instanceof Error ? error.message : String(error)
      failures.push(`[${fw.name}] evaluation error: ${msg}`)
    }
  }

  const passed = failures.length === 0
  const summary = passed
    ? `All ${frameworks.length} framework(s) passed gate checks`
    : `Gate blocked: ${failures.join(' | ')}`

  return { passed, reports, evaluationIds, summary }
}
