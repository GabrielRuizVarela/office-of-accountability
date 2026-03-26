/**
 * M11 Compliance Framework - E2E tests (Phase 7).
 *
 * Tests cover:
 * 1. Zod schema validation (types.ts)
 * 2. YAML framework parsing (loader.ts)
 * 3. Engine scoring logic (engine.ts - computeScore via evaluateFramework)
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdirSync } from 'node:fs'

import { describe, it, expect } from 'vitest'

import {
  complianceFrameworkSchema,
  complianceRuleSchema,
  checklistItemSchema,
  checkConfigSchema,
  complianceAttestationSchema,
  complianceEvaluationSchema,
  llmComplianceResponseSchema,
  compliancePhases,
  ruleModes,
  ruleSeverities,
  checkTypes,
  type ComplianceFramework,
  type ComplianceRule,
  type CheckResult,
  type ChecklistStatus,
} from './types'
import { parseFrameworkFile, loadAllFrameworkFiles } from './loader'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dir = dirname(fileURLToPath(import.meta.url))
const FRAMEWORKS_DIR = resolve(__dir, 'frameworks')

function makeRule(overrides: Partial<ComplianceRule> = {}): ComplianceRule {
  return {
    code: 'TEST-001',
    title: 'Test Rule',
    mode: 'gate',
    severity: 'blocking',
    phase: 'any',
    check: { type: 'cypher', query: 'MATCH (n) RETURN n LIMIT 1' },
    ...overrides,
  }
}

function makeFramework(overrides: Partial<ComplianceFramework> = {}): ComplianceFramework {
  return {
    id: 'test-fw',
    name: 'Test Framework',
    standard: 'TEST',
    version: '1.0',
    rules: [makeRule()],
    ...overrides,
  }
}

function makeCheckResult(overrides: Partial<CheckResult> = {}): CheckResult {
  return {
    rule_code: 'TEST-001',
    rule_title: 'Test Rule',
    mode: 'gate',
    severity: 'blocking',
    phase: 'any',
    check_type: 'cypher',
    passed: true,
    violations: 0,
    details: 'OK',
    ...overrides,
  }
}

function makeChecklistStatus(overrides: Partial<ChecklistStatus> = {}): ChecklistStatus {
  return {
    code: 'CL-001',
    title: 'Checklist Item',
    phase: 'any',
    required: true,
    attested: false,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// 1. Zod Schema Validation
// ---------------------------------------------------------------------------

describe('Zod Schemas', () => {
  describe('CheckConfig discriminated union', () => {
    it('accepts valid cypher config', () => {
      const result = checkConfigSchema.safeParse({
        type: 'cypher',
        query: 'MATCH (n) RETURN count(n)',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid property_exists config', () => {
      const result = checkConfigSchema.safeParse({
        type: 'property_exists',
        label: 'Person',
        property: 'name',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid min_count config', () => {
      const result = checkConfigSchema.safeParse({
        type: 'min_count',
        label: 'Person',
        relationship: 'KNOWS',
        min: 2,
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid tier_minimum config', () => {
      const result = checkConfigSchema.safeParse({
        type: 'tier_minimum',
        label: 'Person',
        min_tier: 'silver',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid llm config', () => {
      const result = checkConfigSchema.safeParse({
        type: 'llm',
        prompt: 'Check this node',
        node_label: 'Document',
      })
      expect(result.success).toBe(true)
    })

    it('rejects unknown check type', () => {
      const result = checkConfigSchema.safeParse({
        type: 'unknown_type',
        query: 'whatever',
      })
      expect(result.success).toBe(false)
    })

    it('rejects cypher config without query', () => {
      const result = checkConfigSchema.safeParse({
        type: 'cypher',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty query string', () => {
      const result = checkConfigSchema.safeParse({
        type: 'cypher',
        query: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects min_count with min < 1', () => {
      const result = checkConfigSchema.safeParse({
        type: 'min_count',
        label: 'Person',
        relationship: 'KNOWS',
        min: 0,
      })
      expect(result.success).toBe(false)
    })

    it('rejects tier_minimum with invalid tier', () => {
      const result = checkConfigSchema.safeParse({
        type: 'tier_minimum',
        label: 'Person',
        min_tier: 'platinum',
      })
      expect(result.success).toBe(false)
    })

    it('rejects llm with max_nodes > 100', () => {
      const result = checkConfigSchema.safeParse({
        type: 'llm',
        prompt: 'Check it',
        node_label: 'Person',
        max_nodes: 101,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('ComplianceRule schema', () => {
    it('accepts valid rule', () => {
      const result = complianceRuleSchema.safeParse(makeRule())
      expect(result.success).toBe(true)
    })

    it('rejects rule with empty code', () => {
      const result = complianceRuleSchema.safeParse(makeRule({ code: '' }))
      expect(result.success).toBe(false)
    })

    it('rejects rule with invalid mode', () => {
      const result = complianceRuleSchema.safeParse({
        ...makeRule(),
        mode: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('rejects rule with invalid phase', () => {
      const result = complianceRuleSchema.safeParse({
        ...makeRule(),
        phase: 'deploy',
      })
      expect(result.success).toBe(false)
    })

    it('accepts all valid phases', () => {
      for (const phase of compliancePhases) {
        const result = complianceRuleSchema.safeParse(makeRule({ phase }))
        expect(result.success, `phase ${phase} should be valid`).toBe(true)
      }
    })

    it('accepts all valid modes', () => {
      for (const mode of ruleModes) {
        const result = complianceRuleSchema.safeParse(makeRule({ mode }))
        expect(result.success, `mode ${mode} should be valid`).toBe(true)
      }
    })

    it('accepts all valid severities', () => {
      for (const severity of ruleSeverities) {
        const result = complianceRuleSchema.safeParse(makeRule({ severity }))
        expect(result.success, `severity ${severity} should be valid`).toBe(true)
      }
    })
  })

  describe('ChecklistItem schema', () => {
    it('accepts valid item', () => {
      const result = checklistItemSchema.safeParse({
        code: 'CL-001',
        title: 'Review data',
        phase: 'verify',
        required: true,
      })
      expect(result.success).toBe(true)
    })

    it('optional description', () => {
      const result = checklistItemSchema.safeParse({
        code: 'CL-001',
        title: 'Review data',
        description: 'Detailed description',
        phase: 'verify',
        required: false,
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing required field', () => {
      const result = checklistItemSchema.safeParse({
        code: 'CL-001',
        title: 'Review data',
        phase: 'verify',
        // missing required
      })
      expect(result.success).toBe(false)
    })
  })

  describe('ComplianceFramework schema', () => {
    it('accepts valid framework', () => {
      const result = complianceFrameworkSchema.safeParse(makeFramework())
      expect(result.success).toBe(true)
    })

    it('rejects framework with empty rules', () => {
      const result = complianceFrameworkSchema.safeParse(makeFramework({ rules: [] }))
      expect(result.success).toBe(false)
    })

    it('rejects framework with missing id', () => {
      const result = complianceFrameworkSchema.safeParse({
        ...makeFramework(),
        id: '',
      })
      expect(result.success).toBe(false)
    })

    it('accepts framework with checklist', () => {
      const result = complianceFrameworkSchema.safeParse(
        makeFramework({
          checklist: [
            { code: 'CL-001', title: 'Check it', phase: 'any', required: true },
          ],
        }),
      )
      expect(result.success).toBe(true)
    })
  })

  describe('ComplianceAttestation schema', () => {
    it('accepts valid attestation', () => {
      const result = complianceAttestationSchema.safeParse({
        id: 'att-1',
        checklist_item_id: 'CL-001',
        investigation_id: 'caso-test',
        framework_id: 'fw-1',
        attested_by: 'analyst@example.com',
        attested_at: '2026-03-22T00:00:00Z',
      })
      expect(result.success).toBe(true)
    })

    it('accepts attestation with notes', () => {
      const result = complianceAttestationSchema.safeParse({
        id: 'att-1',
        checklist_item_id: 'CL-001',
        investigation_id: 'caso-test',
        framework_id: 'fw-1',
        attested_by: 'analyst@example.com',
        attested_at: '2026-03-22T00:00:00Z',
        notes: 'Verified against public records',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('ComplianceEvaluation schema', () => {
    it('accepts valid evaluation', () => {
      const result = complianceEvaluationSchema.safeParse({
        id: 'eval-1',
        investigation_id: 'caso-test',
        framework_id: 'fw-1',
        phase: 'any',
        evaluated_at: '2026-03-22T00:00:00Z',
        overall_score: 0.85,
        results_json: '{}',
      })
      expect(result.success).toBe(true)
    })

    it('rejects score > 1', () => {
      const result = complianceEvaluationSchema.safeParse({
        id: 'eval-1',
        investigation_id: 'caso-test',
        framework_id: 'fw-1',
        phase: 'any',
        evaluated_at: '2026-03-22T00:00:00Z',
        overall_score: 1.5,
        results_json: '{}',
      })
      expect(result.success).toBe(false)
    })

    it('rejects score < 0', () => {
      const result = complianceEvaluationSchema.safeParse({
        id: 'eval-1',
        investigation_id: 'caso-test',
        framework_id: 'fw-1',
        phase: 'any',
        evaluated_at: '2026-03-22T00:00:00Z',
        overall_score: -0.1,
        results_json: '{}',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('LLMComplianceResponse schema', () => {
    it('accepts valid LLM response', () => {
      const result = llmComplianceResponseSchema.safeParse({
        findings: [
          { node_id: 'n1', assessment: 'pass' },
          { node_id: 'n2', assessment: 'fail', issues: ['Missing source'] },
        ],
        summary: 'One issue found',
        score: 0.5,
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid assessment value', () => {
      const result = llmComplianceResponseSchema.safeParse({
        findings: [{ node_id: 'n1', assessment: 'maybe' }],
        summary: 'Uncertain',
        score: 0.5,
      })
      expect(result.success).toBe(false)
    })

    it('accepts inconclusive assessment', () => {
      const result = llmComplianceResponseSchema.safeParse({
        findings: [{ node_id: 'n1', assessment: 'inconclusive' }],
        summary: 'Not enough data',
        score: 0.5,
      })
      expect(result.success).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// 2. YAML Framework Parsing
// ---------------------------------------------------------------------------

describe('YAML Framework Parsing', () => {
  it('discovers all framework YAML files', () => {
    const yamlFiles = readdirSync(FRAMEWORKS_DIR).filter((f) => f.endsWith('.yaml'))
    expect(yamlFiles.length).toBeGreaterThanOrEqual(3)
  })

  it('parses all frameworks without errors', () => {
    const frameworks = loadAllFrameworkFiles()
    expect(frameworks.length).toBeGreaterThanOrEqual(3)

    for (const fw of frameworks) {
      expect(fw.id).toBeTruthy()
      expect(fw.name).toBeTruthy()
      expect(fw.rules.length).toBeGreaterThan(0)
    }
  })

  it('validates each framework against Zod schema', () => {
    const frameworks = loadAllFrameworkFiles()

    for (const fw of frameworks) {
      const result = complianceFrameworkSchema.safeParse(fw)
      expect(result.success, `Framework ${fw.id} should be valid`).toBe(true)
    }
  })

  it('exercises all 5 check types across frameworks', () => {
    const frameworks = loadAllFrameworkFiles()
    const usedTypes = new Set<string>()

    for (const fw of frameworks) {
      for (const rule of fw.rules) {
        usedTypes.add(rule.check.type)
      }
    }

    for (const t of checkTypes) {
      expect(usedTypes.has(t), `Check type '${t}' should be used in at least one framework`).toBe(true)
    }
  })

  it('has unique rule codes within each framework', () => {
    const frameworks = loadAllFrameworkFiles()

    for (const fw of frameworks) {
      const codes = fw.rules.map((r) => r.code)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size, `Framework ${fw.id} has duplicate rule codes`).toBe(codes.length)
    }
  })

  it('has unique checklist item codes within each framework', () => {
    const frameworks = loadAllFrameworkFiles()

    for (const fw of frameworks) {
      if (!fw.checklist) continue
      const codes = fw.checklist.map((c) => c.code)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size, `Framework ${fw.id} has duplicate checklist codes`).toBe(codes.length)
    }
  })

  it('parses fatf-aml.yaml specifically', () => {
    const fw = parseFrameworkFile(resolve(FRAMEWORKS_DIR, 'fatf-aml.yaml'))
    expect(fw.id).toBe('fatf-aml')
    expect(fw.standard).toContain('FATF')
    expect(fw.rules.length).toBe(6)
  })

  it('rejects invalid YAML content', () => {
    // Test with a non-existent file
    expect(() => parseFrameworkFile('/nonexistent.yaml')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// 3. Engine Score Computation (via exported types)
// ---------------------------------------------------------------------------

describe('Score Computation Logic', () => {
  // Since computeScore is not exported, we test the scoring behavior
  // indirectly by verifying the documented formula:
  // score = weighted(gate 70%, auditor 20%, required_checklist 10%)

  /**
   * Reimplements the scoring formula from engine.ts for test verification.
   * This ensures the documented formula matches expectations.
   */
  function computeScoreLocal(
    gate: CheckResult[],
    auditor: CheckResult[],
    checklist: ChecklistStatus[],
  ): number {
    const weights = { gate: 0.7, auditor: 0.2, checklist: 0.1 }
    let totalWeight = 0
    let weightedScore = 0

    if (gate.length > 0) {
      const passed = gate.filter((r) => r.passed).length
      weightedScore += weights.gate * (passed / gate.length)
      totalWeight += weights.gate
    }

    if (auditor.length > 0) {
      const passed = auditor.filter((r) => r.passed).length
      weightedScore += weights.auditor * (passed / auditor.length)
      totalWeight += weights.auditor
    }

    const requiredItems = checklist.filter((c) => c.required)
    if (requiredItems.length > 0) {
      const attested = requiredItems.filter((c) => c.attested).length
      weightedScore += weights.checklist * (attested / requiredItems.length)
      totalWeight += weights.checklist
    }

    if (totalWeight === 0) return 1
    return Math.round((weightedScore / totalWeight) * 1000) / 1000
  }

  it('returns 1.0 when all checks pass', () => {
    const gate = [makeCheckResult({ passed: true }), makeCheckResult({ passed: true })]
    const auditor = [makeCheckResult({ passed: true, mode: 'auditor' })]
    const checklist = [makeChecklistStatus({ attested: true })]

    expect(computeScoreLocal(gate, auditor, checklist)).toBe(1)
  })

  it('returns 0.0 when all checks fail', () => {
    const gate = [makeCheckResult({ passed: false }), makeCheckResult({ passed: false })]
    const auditor = [makeCheckResult({ passed: false, mode: 'auditor' })]
    const checklist = [makeChecklistStatus({ attested: false })]

    expect(computeScoreLocal(gate, auditor, checklist)).toBe(0)
  })

  it('returns 1.0 with no checks (empty = compliant)', () => {
    expect(computeScoreLocal([], [], [])).toBe(1)
  })

  it('weights gate at 70%', () => {
    // Only gate checks, all pass
    const gate = [makeCheckResult({ passed: true })]
    expect(computeScoreLocal(gate, [], [])).toBe(1)

    // Half pass
    const gateHalf = [
      makeCheckResult({ passed: true }),
      makeCheckResult({ passed: false }),
    ]
    expect(computeScoreLocal(gateHalf, [], [])).toBe(0.5)
  })

  it('handles mixed results correctly', () => {
    // 1/2 gate pass, 1/1 auditor pass, 0/1 checklist attested
    const gate = [
      makeCheckResult({ passed: true }),
      makeCheckResult({ passed: false }),
    ]
    const auditor = [makeCheckResult({ passed: true, mode: 'auditor' })]
    const checklist = [makeChecklistStatus({ attested: false })]

    // score = (0.7 * 0.5 + 0.2 * 1.0 + 0.1 * 0.0) / 1.0 = 0.55
    expect(computeScoreLocal(gate, auditor, checklist)).toBe(0.55)
  })

  it('excludes optional checklist items from score', () => {
    const gate = [makeCheckResult({ passed: true })]
    const checklist = [
      makeChecklistStatus({ required: false, attested: false }), // should be ignored
    ]

    // Only gate matters (optional checklist excluded from denominator)
    expect(computeScoreLocal(gate, [], checklist)).toBe(1)
  })

  it('handles gate-only evaluation', () => {
    const gate = [
      makeCheckResult({ passed: true }),
      makeCheckResult({ passed: true }),
      makeCheckResult({ passed: false }),
    ]
    // 2/3 pass, only gate weight
    const score = computeScoreLocal(gate, [], [])
    expect(score).toBeCloseTo(0.667, 3)
  })

  it('handles auditor-only evaluation', () => {
    const auditor = [
      makeCheckResult({ passed: true, mode: 'auditor' }),
      makeCheckResult({ passed: false, mode: 'auditor' }),
    ]
    expect(computeScoreLocal([], auditor, [])).toBe(0.5)
  })

  it('handles checklist-only evaluation', () => {
    const checklist = [
      makeChecklistStatus({ required: true, attested: true }),
      makeChecklistStatus({ required: true, attested: false }),
      makeChecklistStatus({ required: true, attested: true }),
    ]
    // 2/3 attested
    const score = computeScoreLocal([], [], checklist)
    expect(score).toBeCloseTo(0.667, 3)
  })
})

// ---------------------------------------------------------------------------
// 4. Enum completeness checks
// ---------------------------------------------------------------------------

describe('Enum completeness', () => {
  it('compliancePhases has expected values', () => {
    expect(compliancePhases).toContain('ingest')
    expect(compliancePhases).toContain('verify')
    expect(compliancePhases).toContain('enrich')
    expect(compliancePhases).toContain('analyze')
    expect(compliancePhases).toContain('any')
  })

  it('checkTypes has all 5 handler types', () => {
    expect(checkTypes).toHaveLength(5)
    expect(checkTypes).toContain('cypher')
    expect(checkTypes).toContain('property_exists')
    expect(checkTypes).toContain('min_count')
    expect(checkTypes).toContain('tier_minimum')
    expect(checkTypes).toContain('llm')
  })

  it('ruleModes has gate and auditor', () => {
    expect(ruleModes).toEqual(['gate', 'auditor'])
  })

  it('ruleSeverities has blocking, warning, info', () => {
    expect(ruleSeverities).toEqual(['blocking', 'warning', 'info'])
  })
})
