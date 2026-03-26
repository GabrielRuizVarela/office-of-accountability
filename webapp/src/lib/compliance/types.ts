/**
 * Compliance Framework Engine types - M11.
 *
 * 5 node types: ComplianceFramework, ComplianceRule, ChecklistItem,
 * ComplianceAttestation, ComplianceEvaluation.
 *
 * Zod schemas validate both YAML framework definitions (loader input)
 * and Neo4j node records (query output). Inferred TS types used everywhere.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

/** Rule modes: gate (blocking check between stages) or auditor (warning-level, parallel) */
export const ruleModes = ['gate', 'auditor'] as const
export type RuleMode = (typeof ruleModes)[number]

/** Rule severity determines how violations are surfaced */
export const ruleSeverities = ['blocking', 'warning', 'info'] as const
export type RuleSeverity = (typeof ruleSeverities)[number]

/** Pipeline phases where rules can be evaluated */
export const compliancePhases = [
  'ingest',
  'verify',
  'enrich',
  'analyze',
  'iterate',
  'report',
  'any',
] as const
export type CompliancePhase = (typeof compliancePhases)[number]

/** Check types - each has its own handler */
export const checkTypes = ['cypher', 'property_exists', 'min_count', 'tier_minimum', 'llm'] as const
export type CheckType = (typeof checkTypes)[number]

// ---------------------------------------------------------------------------
// Check config schemas - per check_type
// ---------------------------------------------------------------------------

export const cypherCheckConfigSchema = z.object({
  type: z.literal('cypher'),
  query: z.string().min(1),
})

export const propertyExistsCheckConfigSchema = z.object({
  type: z.literal('property_exists'),
  label: z.string().min(1),
  property: z.string().min(1),
  scope: z.literal('caso_slug').optional(),
})

export const minCountCheckConfigSchema = z.object({
  type: z.literal('min_count'),
  label: z.string().min(1),
  relationship: z.string().min(1),
  min: z.number().int().min(1),
  scope: z.literal('caso_slug').optional(),
})

export const tierMinimumCheckConfigSchema = z.object({
  type: z.literal('tier_minimum'),
  label: z.string().min(1),
  min_tier: z.enum(['gold', 'silver', 'bronze']),
  scope: z.literal('caso_slug').optional(),
})

export const llmCheckConfigSchema = z.object({
  type: z.literal('llm'),
  prompt: z.string().min(1),
  node_label: z.string().min(1),
  scope: z.literal('caso_slug').optional(),
  max_nodes: z.number().int().min(1).max(100).optional(),
})

/** Discriminated union of all check configs */
export const checkConfigSchema = z.discriminatedUnion('type', [
  cypherCheckConfigSchema,
  propertyExistsCheckConfigSchema,
  minCountCheckConfigSchema,
  tierMinimumCheckConfigSchema,
  llmCheckConfigSchema,
])

export type CheckConfig = z.infer<typeof checkConfigSchema>

// ---------------------------------------------------------------------------
// 1. ComplianceRule - single rule within a framework (YAML input)
// ---------------------------------------------------------------------------

export const complianceRuleSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  mode: z.enum(ruleModes),
  severity: z.enum(ruleSeverities),
  phase: z.enum(compliancePhases),
  check: checkConfigSchema,
})

export type ComplianceRule = z.infer<typeof complianceRuleSchema>

// ---------------------------------------------------------------------------
// 2. ChecklistItem - manual attestation requirement (YAML input)
// ---------------------------------------------------------------------------

export const checklistItemSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  phase: z.enum(compliancePhases),
  required: z.boolean(),
})

export type ChecklistItem = z.infer<typeof checklistItemSchema>

// ---------------------------------------------------------------------------
// 3. ComplianceFramework - top-level framework definition (YAML input)
// ---------------------------------------------------------------------------

export const complianceFrameworkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  standard: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  rules: z.array(complianceRuleSchema).min(1),
  checklist: z.array(checklistItemSchema).optional(),
})

export type ComplianceFramework = z.infer<typeof complianceFrameworkSchema>

// ---------------------------------------------------------------------------
// 4. ComplianceAttestation - Neo4j node for manual checklist attestation
// ---------------------------------------------------------------------------

export const complianceAttestationSchema = z.object({
  id: z.string().min(1),
  checklist_item_id: z.string().min(1),
  investigation_id: z.string().min(1),
  framework_id: z.string().min(1),
  attested_by: z.string().min(1),
  attested_at: z.string(),
  notes: z.string().optional(),
})

export type ComplianceAttestation = z.infer<typeof complianceAttestationSchema>

// ---------------------------------------------------------------------------
// 5. ComplianceEvaluation - Neo4j node for evaluation results
// ---------------------------------------------------------------------------

export const complianceEvaluationSchema = z.object({
  id: z.string().min(1),
  investigation_id: z.string().min(1),
  framework_id: z.string().min(1),
  phase: z.enum(compliancePhases),
  evaluated_at: z.string(),
  overall_score: z.number().min(0).max(1),
  results_json: z.string(),
})

export type ComplianceEvaluation = z.infer<typeof complianceEvaluationSchema>

// ---------------------------------------------------------------------------
// Runtime types - check results and reports (not persisted as nodes)
// ---------------------------------------------------------------------------

/** Result of evaluating a single compliance rule */
export interface CheckResult {
  rule_code: string
  rule_title: string
  mode: RuleMode
  severity: RuleSeverity
  phase: CompliancePhase
  check_type: CheckType
  passed: boolean
  violations: number
  details: string
  /** LLM reasoning, if check_type === 'llm' */
  reasoning?: string
}

/** Status of a single checklist item */
export interface ChecklistStatus {
  code: string
  title: string
  phase: CompliancePhase
  required: boolean
  attested: boolean
  attested_by?: string
  attested_at?: string
  notes?: string
}

/** Full compliance report for an investigation under a framework */
export interface ComplianceReport {
  framework_id: string
  framework_name: string
  investigation_id: string
  phase: CompliancePhase
  evaluated_at: string
  overall_score: number
  gate_results: CheckResult[]
  auditor_results: CheckResult[]
  checklist: ChecklistStatus[]
  gate_passed: boolean
  total_violations: number
}

/** LLM compliance check response - expected JSON from the LLM */
export const llmComplianceResponseSchema = z.object({
  findings: z.array(
    z.object({
      node_id: z.string(),
      assessment: z.enum(['pass', 'fail', 'inconclusive']),
      issues: z.array(z.string()).optional(),
    }),
  ),
  summary: z.string(),
  score: z.number().min(0).max(1),
})

export type LLMComplianceResponse = z.infer<typeof llmComplianceResponseSchema>
