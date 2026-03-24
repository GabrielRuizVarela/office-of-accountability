/**
 * Obras-publicas-specific cross-reference flag detectors.
 *
 * Extends the existing cross-reference engine with flags specific to
 * public works contract investigation.
 *
 * METHODOLOGY NOTES (from deep-dive verification cycle):
 * - SOE board overlaps are structural, not revolving doors (Correo Oficial finding)
 * - Professional sindica/sindico on 500+ companies are noise (Duhau finding)
 * - Nominal ARS comparisons are meaningless without inflation adjustment
 *   (10,800% cumulative 2016-2024) — Trajtenberg finding
 * - Shell company heuristic has 80-90% false positive rate (Wave 23)
 * - Cuadernos evidence is compromised (1,500+ alterations) — require independent
 *   corroboration before treating as confirmed
 */

import { readQuery } from '../../lib/neo4j/client'
import type { InvestigationFlag, FlagType } from './types'

// Argentine CPI multiplier relative to 2015 base (approximate)
// Source: INDEC + Trading Economics
const ARS_INFLATION_MULTIPLIER: Record<string, number> = {
  '2015': 1,
  '2016': 1.4,
  '2017': 1.75,
  '2018': 2.59,
  '2019': 3.97,
  '2020': 5.42,
  '2021': 8.16,
  '2022': 15.97,
  '2023': 50.1,
  '2024': 108.3,
  '2025': 150,  // estimated
  '2026': 170,  // estimated
}

/**
 * Deflate a nominal ARS amount to 2015 constant pesos.
 * Returns null if year is unknown.
 */
function deflateToConstant2015(nominalArs: number, year: string): number | null {
  const multiplier = ARS_INFLATION_MULTIPLIER[year]
  if (!multiplier) return null
  return nominalArs / multiplier
}

// ---------------------------------------------------------------------------
// Flag: debarred_active — debarred entity still winning contracts
// ---------------------------------------------------------------------------

export async function detectDebarredActiveFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (de:DebarredEntity)-[:DEBARRED_SAME_AS]-(c:Contractor)-[:AWARDED_TO|CONTRACTED_FOR]-()
     RETURN DISTINCT c.contractor_id AS entity_id, c.name AS entity_name,
            de.name AS debarred_name, de.debarred_by AS debarred_by`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      debarred_name: r.get('debarred_name') as string,
      debarred_by: r.get('debarred_by') as string,
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'debarred_active' as FlagType,
    evidence: `Contractor "${r.entity_name}" is debarred by ${r.debarred_by} as "${r.debarred_name}" but still receives contracts`,
    confidence: 0.95,
  }))
}

// ---------------------------------------------------------------------------
// Flag: budget_overrun — execution > 150% of budget
// ---------------------------------------------------------------------------

export async function detectBudgetOverrunFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (pw:PublicWork)
     WHERE pw.caso_slug = 'obras-publicas'
       AND pw.avance_financiero > 150
     RETURN pw.work_id AS entity_id, pw.name AS entity_name,
            pw.avance_financiero AS pct, pw.monto_total AS monto`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      pct: r.get('pct') as number,
      monto: r.get('monto') as number,
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'budget_overrun' as FlagType,
    evidence: `Public work "${r.entity_name}" has financial execution at ${r.pct}% of budget (ARS ${r.monto})`,
    confidence: 0.8,
  }))
}

// ---------------------------------------------------------------------------
// Flag: budget_underrun — execution < 30% but marked completed
// ---------------------------------------------------------------------------

export async function detectBudgetUnderrunFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (pw:PublicWork)
     WHERE pw.caso_slug = 'obras-publicas'
       AND pw.status = 'completed'
       AND pw.avance_financiero < 30
       AND pw.avance_financiero > 0
     RETURN pw.work_id AS entity_id, pw.name AS entity_name,
            pw.avance_financiero AS pct`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      pct: r.get('pct') as number,
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'budget_underrun' as FlagType,
    evidence: `Public work "${r.entity_name}" is marked "completed" but financial execution is only ${r.pct}%`,
    confidence: 0.75,
  }))
}

// ---------------------------------------------------------------------------
// Flag: odebrecht_linked — entity connected to Odebrecht bribery case
// ---------------------------------------------------------------------------

export async function detectOdebrechtLinkedFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (bc:BriberyCase)-[:CASE_INVOLVES]->(c:Contractor)
     WHERE bc.name = 'odebrecht_argentina'
     OPTIONAL MATCH (c)-[:CONTRACTED_FOR]->(pw:PublicWork)
     RETURN DISTINCT c.contractor_id AS entity_id, c.name AS entity_name,
            count(pw) AS work_count`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      work_count: typeof r.get('work_count') === 'object'
        ? (r.get('work_count') as { toNumber(): number }).toNumber()
        : (r.get('work_count') as number),
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'odebrecht_linked' as FlagType,
    evidence: `Contractor "${r.entity_name}" appears in Odebrecht Argentina bribery case and has ${r.work_count} public work contracts`,
    confidence: 0.9,
  }))
}

// ---------------------------------------------------------------------------
// Flag: cuadernos_linked — entity connected to Cuadernos case
// ---------------------------------------------------------------------------

export async function detectCuadernosLinkedFlags(): Promise<InvestigationFlag[]> {
  // FIX: Cuadernos evidence is compromised (1,500+ alterations, Bacigalupo falsified
  // names, chain of custody broken). Confidence downgraded. Only flag entities that
  // have INDEPENDENT corroboration (verification_status != 'cuadernos_dependent').
  const result = await readQuery(
    `MATCH (bc:BriberyCase)-[:CASE_INVOLVES]->(c:Contractor)
     WHERE bc.name = 'cuadernos_de_las_coimas'
     OPTIONAL MATCH (c)-[:CONTRACTED_FOR]->(pw:PublicWork)
     RETURN DISTINCT c.contractor_id AS entity_id, c.name AS entity_name,
            c.verification_status AS verification_status,
            count(pw) AS work_count`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      verification_status: r.get('verification_status') as string | null,
      work_count: typeof r.get('work_count') === 'object'
        ? (r.get('work_count') as { toNumber(): number }).toNumber()
        : (r.get('work_count') as number),
    }),
  )

  return result.records.map((r) => {
    const isIndependent = r.verification_status === 'independently_verified'
    const isPartial = r.verification_status === 'partially_corroborated'
    const confidence = isIndependent ? 0.85 : isPartial ? 0.6 : 0.35
    const caveat = isIndependent
      ? '(independently verified via DOJ/AFIP)'
      : isPartial
        ? '(partially corroborated — contract records only)'
        : '(WARNING: Cuadernos-dependent — notebooks have 1,500+ alterations, names falsified by Bacigalupo. Requires independent corroboration.)'

    return {
      entity_id: r.entity_id,
      entity_name: r.entity_name,
      flag_type: 'cuadernos_linked' as FlagType,
      evidence: `Contractor "${r.entity_name}" appears in Cuadernos case ${caveat} — ${r.work_count} public work contracts`,
      confidence,
    }
  })
}

// ---------------------------------------------------------------------------
// Flag: cross_investigation — entity in both obras-publicas AND finanzas-politicas
// ---------------------------------------------------------------------------

export async function detectCrossInvestigationFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (c:Contractor)-[:SAME_ENTITY]-(other)
     WHERE c.caso_slug = 'obras-publicas' AND other.caso_slug IS NULL
     RETURN DISTINCT c.contractor_id AS entity_id, c.name AS entity_name,
            labels(other)[0] AS other_label, other.name AS other_name`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      other_label: r.get('other_label') as string,
      other_name: r.get('other_name') as string,
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'cross_investigation' as FlagType,
    evidence: `Contractor "${r.entity_name}" appears in obras-publicas AND is linked to ${r.other_label} "${r.other_name}" in finanzas-politicas graph`,
    confidence: 0.85,
  }))
}

// ---------------------------------------------------------------------------
// Flag: geographic_concentration — single contractor dominates one province
// ---------------------------------------------------------------------------

export async function detectGeographicConcentrationFlags(): Promise<InvestigationFlag[]> {
  const result = await readQuery(
    `MATCH (c:Contractor)-[:CONTRACTED_FOR]->(pw:PublicWork)-[:LOCATED_IN_PROVINCE]->(prov)
     WHERE c.caso_slug = 'obras-publicas'
     WITH c, prov.name AS province, count(pw) AS works
     WHERE works >= 10
     RETURN c.contractor_id AS entity_id, c.name AS entity_name,
            province, works`,
    {},
    (r) => ({
      entity_id: r.get('entity_id') as string,
      entity_name: r.get('entity_name') as string,
      province: r.get('province') as string,
      works: typeof r.get('works') === 'object'
        ? (r.get('works') as { toNumber(): number }).toNumber()
        : (r.get('works') as number),
    }),
  )

  return result.records.map((r) => ({
    entity_id: r.entity_id,
    entity_name: r.entity_name,
    flag_type: 'geographic_concentration' as FlagType,
    evidence: `Contractor "${r.entity_name}" has ${r.works} public works concentrated in ${r.province}`,
    confidence: 0.7,
  }))
}

// ---------------------------------------------------------------------------
// Run all obras-publicas flag detectors
// ---------------------------------------------------------------------------

export async function detectObrasFlags(): Promise<InvestigationFlag[]> {
  const results = await Promise.all([
    detectDebarredActiveFlags(),
    detectBudgetOverrunFlags(),
    detectBudgetUnderrunFlags(),
    detectOdebrechtLinkedFlags(),
    detectCuadernosLinkedFlags(),
    detectCrossInvestigationFlags(),
    detectGeographicConcentrationFlags(),
  ])
  return results.flat()
}
