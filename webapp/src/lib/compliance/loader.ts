/**
 * Compliance Framework Loader - M11 Phase 2b.
 *
 * Reads YAML framework definitions, validates against Zod schemas,
 * and MERGEs ComplianceFramework / ComplianceRule / ChecklistItem
 * nodes + relationships into Neo4j.
 *
 * Idempotent: safe to re-run (MERGE on unique IDs).
 */

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

import yaml from 'yaml'

import { withWriteTransaction } from '../neo4j/client'

import { complianceFrameworkSchema, type ComplianceFramework } from './types'

// ---------------------------------------------------------------------------
// YAML loading + validation
// ---------------------------------------------------------------------------

/** Directory containing framework YAML definitions */
const __dirname = dirname(fileURLToPath(import.meta.url))
const FRAMEWORKS_DIR = join(__dirname, 'frameworks')

/**
 * Parse and validate a single YAML file against the ComplianceFramework schema.
 * Throws on invalid YAML or schema violations.
 */
export function parseFrameworkFile(filePath: string): ComplianceFramework {
  const raw = readFileSync(filePath, 'utf-8')
  const parsed = yaml.parse(raw)
  return complianceFrameworkSchema.parse(parsed)
}

/**
 * Discover and parse all .yaml files in the frameworks directory.
 * Returns validated ComplianceFramework objects.
 */
export function loadAllFrameworkFiles(): ComplianceFramework[] {
  const files = readdirSync(FRAMEWORKS_DIR)
    .filter((f) => extname(f) === '.yaml')
    .sort()

  return files.map((f) => parseFrameworkFile(join(FRAMEWORKS_DIR, f)))
}

// ---------------------------------------------------------------------------
// Neo4j MERGE
// ---------------------------------------------------------------------------

export interface LoadFrameworkResult {
  readonly frameworkId: string
  readonly rulesCreated: number
  readonly checklistItemsCreated: number
}

/**
 * MERGE a validated ComplianceFramework into Neo4j.
 *
 * Creates/updates:
 * - 1 ComplianceFramework node
 * - N ComplianceRule nodes + HAS_RULE relationships
 * - M ChecklistItem nodes + HAS_CHECKLIST_ITEM relationships
 *
 * Runs in a single write transaction for atomicity.
 */
export async function mergeFramework(fw: ComplianceFramework): Promise<LoadFrameworkResult> {
  return withWriteTransaction(async (tx) => {
    // 1. MERGE the framework node
    await tx.run(
      `MERGE (f:ComplianceFramework {id: $id})
       SET f.name = $name,
           f.standard = $standard,
           f.version = $version,
           f.description = $description,
           f.updated_at = datetime()`,
      {
        id: fw.id,
        name: fw.name,
        standard: fw.standard,
        version: fw.version,
        description: fw.description ?? null,
      },
    )

    // 2. MERGE rules + HAS_RULE relationships
    for (const rule of fw.rules) {
      await tx.run(
        `MATCH (f:ComplianceFramework {id: $frameworkId})
         MERGE (r:ComplianceRule {code: $code, framework_id: $frameworkId})
         SET r.title = $title,
             r.description = $description,
             r.mode = $mode,
             r.severity = $severity,
             r.phase = $phase,
             r.check_type = $checkType,
             r.check_config = $checkConfig,
             r.updated_at = datetime()
         MERGE (f)-[:HAS_RULE]->(r)`,
        {
          frameworkId: fw.id,
          code: rule.code,
          title: rule.title,
          description: rule.description ?? null,
          mode: rule.mode,
          severity: rule.severity,
          phase: rule.phase,
          checkType: rule.check.type,
          checkConfig: JSON.stringify(rule.check),
        },
      )
    }

    // 3. MERGE checklist items + HAS_CHECKLIST_ITEM relationships
    const checklistItems = fw.checklist ?? []
    for (const item of checklistItems) {
      await tx.run(
        `MATCH (f:ComplianceFramework {id: $frameworkId})
         MERGE (ci:ChecklistItem {code: $code, framework_id: $frameworkId})
         SET ci.title = $title,
             ci.description = $description,
             ci.phase = $phase,
             ci.required = $required,
             ci.updated_at = datetime()
         MERGE (f)-[:HAS_CHECKLIST_ITEM]->(ci)`,
        {
          frameworkId: fw.id,
          code: item.code,
          title: item.title,
          description: item.description ?? null,
          phase: item.phase,
          required: item.required,
        },
      )
    }

    return {
      frameworkId: fw.id,
      rulesCreated: fw.rules.length,
      checklistItemsCreated: checklistItems.length,
    }
  })
}

// ---------------------------------------------------------------------------
// Public API - load all frameworks into Neo4j
// ---------------------------------------------------------------------------

export interface LoadAllResult {
  readonly frameworks: readonly LoadFrameworkResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

/**
 * Load all YAML framework definitions into Neo4j.
 * Parses, validates, and MERGEs each framework independently.
 * Continues on error (logs + collects).
 */
export async function loadAllFrameworks(): Promise<LoadAllResult> {
  const start = Date.now()
  const frameworks: LoadFrameworkResult[] = []
  let totalErrors = 0

  const parsed = loadAllFrameworkFiles()

  for (const fw of parsed) {
    try {
      const result = await mergeFramework(fw)
      frameworks.push(result)
    } catch (error) {
      totalErrors += 1
      console.error(`[compliance-loader] Failed to load framework ${fw.id}:`, error)
    }
  }

  return { frameworks, totalErrors, durationMs: Date.now() - start }
}
