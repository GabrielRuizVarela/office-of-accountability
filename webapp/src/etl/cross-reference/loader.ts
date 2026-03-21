/**
 * Cross-reference loader — writes SAME_ENTITY relationships to Neo4j.
 *
 * Uses per-label-pair MERGE queries (Neo4j Community doesn't support
 * parameterized labels). Follows the batch MERGE pattern from boletin-oficial.
 */

import { executeWrite } from '../../lib/neo4j/client'
import type { CrossRefMatch } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REL_BATCH_SIZE = 500

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chunk<T>(items: readonly T[], size: number): readonly T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export interface LoadStepResult {
  readonly label: string
  readonly totalItems: number
  readonly batchesRun: number
  readonly errors: readonly string[]
}

// ---------------------------------------------------------------------------
// Label-pair ID property mapping
// ---------------------------------------------------------------------------

interface LabelPairConfig {
  sourceLabel: string
  targetLabel: string
  sourceIdProp: string
  targetIdProp: string
  cypher: string
}

/**
 * Build the MERGE Cypher query for a specific label pair.
 * Each pair needs its own query since Neo4j Community doesn't support
 * parameterized labels.
 */
function buildLabelPairConfigs(): LabelPairConfig[] {
  return [
    {
      sourceLabel: 'Contractor',
      targetLabel: 'Company',
      sourceIdProp: 'contractor_id',
      targetIdProp: 'igj_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Contractor {contractor_id: r.source_id})
        MATCH (b:Company {igj_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'GovernmentAppointment',
      targetLabel: 'CompanyOfficer',
      sourceIdProp: 'appointment_id',
      targetIdProp: 'officer_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:GovernmentAppointment {appointment_id: r.source_id})
        MATCH (b:CompanyOfficer {officer_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Contractor',
      targetLabel: 'CompanyOfficer',
      sourceIdProp: 'contractor_id',
      targetIdProp: 'officer_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Contractor {contractor_id: r.source_id})
        MATCH (b:CompanyOfficer {officer_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Company',
      targetLabel: 'Contractor',
      sourceIdProp: 'igj_id',
      targetIdProp: 'contractor_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Company {igj_id: r.source_id})
        MATCH (b:Contractor {contractor_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'CompanyOfficer',
      targetLabel: 'GovernmentAppointment',
      sourceIdProp: 'officer_id',
      targetIdProp: 'appointment_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:CompanyOfficer {officer_id: r.source_id})
        MATCH (b:GovernmentAppointment {appointment_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    // AssetDeclaration pairs
    {
      sourceLabel: 'Contractor',
      targetLabel: 'AssetDeclaration',
      sourceIdProp: 'contractor_id',
      targetIdProp: 'ddjj_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Contractor {contractor_id: r.source_id})
        MATCH (b:AssetDeclaration {ddjj_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Donor',
      targetLabel: 'AssetDeclaration',
      sourceIdProp: 'donor_id',
      targetIdProp: 'ddjj_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Donor {donor_id: r.source_id})
        MATCH (b:AssetDeclaration {ddjj_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'AssetDeclaration',
      targetLabel: 'CompanyOfficer',
      sourceIdProp: 'ddjj_id',
      targetIdProp: 'officer_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:AssetDeclaration {ddjj_id: r.source_id})
        MATCH (b:CompanyOfficer {officer_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'AssetDeclaration',
      targetLabel: 'GovernmentAppointment',
      sourceIdProp: 'ddjj_id',
      targetIdProp: 'appointment_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:AssetDeclaration {ddjj_id: r.source_id})
        MATCH (b:GovernmentAppointment {appointment_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    // Additional cross-label pairs from CUIT→DNI matching
    {
      sourceLabel: 'Contractor',
      targetLabel: 'GovernmentAppointment',
      sourceIdProp: 'contractor_id',
      targetIdProp: 'appointment_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Contractor {contractor_id: r.source_id})
        MATCH (b:GovernmentAppointment {appointment_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Company',
      targetLabel: 'CompanyOfficer',
      sourceIdProp: 'igj_id',
      targetIdProp: 'officer_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Company {igj_id: r.source_id})
        MATCH (b:CompanyOfficer {officer_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Company',
      targetLabel: 'GovernmentAppointment',
      sourceIdProp: 'igj_id',
      targetIdProp: 'appointment_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Company {igj_id: r.source_id})
        MATCH (b:GovernmentAppointment {appointment_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    // CUIT cross-label pairs
    {
      sourceLabel: 'Contractor',
      targetLabel: 'Donor',
      sourceIdProp: 'contractor_id',
      targetIdProp: 'donor_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Contractor {contractor_id: r.source_id})
        MATCH (b:Donor {donor_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Company',
      targetLabel: 'Donor',
      sourceIdProp: 'igj_id',
      targetIdProp: 'donor_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Company {igj_id: r.source_id})
        MATCH (b:Donor {donor_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Donor',
      targetLabel: 'CompanyOfficer',
      sourceIdProp: 'donor_id',
      targetIdProp: 'officer_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Donor {donor_id: r.source_id})
        MATCH (b:CompanyOfficer {officer_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
    {
      sourceLabel: 'Donor',
      targetLabel: 'GovernmentAppointment',
      sourceIdProp: 'donor_id',
      targetIdProp: 'appointment_id',
      cypher: `
        UNWIND $batch AS r
        MATCH (a:Donor {donor_id: r.source_id})
        MATCH (b:GovernmentAppointment {appointment_id: r.target_id})
        MERGE (a)-[rel:SAME_ENTITY]->(b)
        SET rel.match_type = r.match_type,
            rel.match_key = r.match_key,
            rel.confidence = r.confidence,
            rel.evidence = r.evidence,
            rel.created_at = datetime()
      `,
    },
  ]
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CrossRefLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalLoaded: number
  readonly totalErrors: number
  readonly durationMs: number
}

/**
 * Load SAME_ENTITY relationships into Neo4j.
 * Groups matches by label pair and runs batched MERGE for each.
 */
export async function loadCrossRefMatches(
  matches: readonly CrossRefMatch[],
): Promise<CrossRefLoadResult> {
  const start = Date.now()
  const configs = buildLabelPairConfigs()
  const steps: LoadStepResult[] = []
  let totalLoaded = 0

  // Group matches by (source_label, target_label)
  const grouped = new Map<string, CrossRefMatch[]>()
  for (const m of matches) {
    const key = `${m.source_label}::${m.target_label}`
    const existing = grouped.get(key) || []
    existing.push(m)
    grouped.set(key, existing)
  }

  for (const [pairKey, pairMatches] of grouped) {
    const [sourceLabel, targetLabel] = pairKey.split('::')
    const config = configs.find(
      (c) => c.sourceLabel === sourceLabel && c.targetLabel === targetLabel,
    )

    if (!config) {
      steps.push({
        label: `SAME_ENTITY (${pairKey})`,
        totalItems: pairMatches.length,
        batchesRun: 0,
        errors: [`No MERGE query configured for label pair: ${pairKey}`],
      })
      continue
    }

    const batches = chunk(pairMatches, REL_BATCH_SIZE)
    const errors: string[] = []
    let batchesRun = 0

    for (const batch of batches) {
      try {
        await executeWrite(config.cypher, { batch })
        batchesRun += 1
        totalLoaded += batch.length
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(`${pairKey} batch ${batchesRun + 1}: ${message}`)
      }
    }

    steps.push({
      label: `SAME_ENTITY (${pairKey})`,
      totalItems: pairMatches.length,
      batchesRun,
      errors,
    })
  }

  return {
    steps,
    totalLoaded,
    totalErrors: steps.reduce((sum, s) => sum + s.errors.length, 0),
    durationMs: Date.now() - start,
  }
}
