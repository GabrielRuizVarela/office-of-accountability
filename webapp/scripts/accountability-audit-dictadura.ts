/**
 * Accountability Audit: caso-dictadura
 *
 * Comprehensive analysis of the prosecution gap in the Argentine
 * dictatorship knowledge graph. Queries every relevant relationship
 * type to measure how much documented evidence has (or has not)
 * reached judicial proceedings.
 *
 * Sections:
 *   1. Prosecution rate by category (represors, SIDE agents)
 *   2. CCD accountability gap (victims in CCDs without judicial links)
 *   3. Unprosecuted represors with evidence
 *   4. Corporate accountability (COLABORO_CON / ENTREGO_A)
 *   5. SIDE intelligence chain (desclasificados)
 *   6. Victim justice rate
 *   7. Write Markdown report
 *
 * Run with: npx tsx scripts/accountability-audit-dictadura.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// Extend query timeout — audit queries scan the full graph
process.env.NEO4J_QUERY_TIMEOUT_MS = '120000'

import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CASO_SLUG = 'caso-dictadura'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

function str(val: unknown): string {
  if (typeof val === 'string') return val
  if (val === null || val === undefined) return ''
  return String(val)
}

function pct(num: number, den: number): string {
  if (den === 0) return '0.0%'
  return (num / den * 100).toFixed(1) + '%'
}

function padRight(s: string, len: number): string {
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length)
}

function padLeft(s: string, len: number): string {
  return s.length >= len ? s : ' '.repeat(len - s.length) + s
}

// ---------------------------------------------------------------------------
// Section 1: Prosecution Rate by Category
// ---------------------------------------------------------------------------

interface ProsecutionStats {
  totalRepresors: number
  condemned: number
  accused: number
  condemnedOrAccused: number
  sideTotal: number
  sideWithJudicial: number
}

async function getProsecutionStats(): Promise<ProsecutionStats> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Total represors
    const totalRes = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug AND p.category = 'represor'
       RETURN count(p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const totalRepresors = toNumber(totalRes.records[0]?.get('total'))

    // Represors with CONDENADO_A or CONDENADO_EN
    const condRes = await session.run(
      `MATCH (p:DictaduraPersona)-[:CONDENADO_A|CONDENADO_EN]->()
       WHERE p.caso_slug = $casoSlug AND p.category = 'represor'
       RETURN count(DISTINCT p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const condemned = toNumber(condRes.records[0]?.get('total'))

    // Represors with ACUSADO_EN
    const accRes = await session.run(
      `MATCH (p:DictaduraPersona)-[:ACUSADO_EN]->()
       WHERE p.caso_slug = $casoSlug AND p.category = 'represor'
       RETURN count(DISTINCT p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const accused = toNumber(accRes.records[0]?.get('total'))

    // Represors with any judicial link (CONDENADO_A | CONDENADO_EN | ACUSADO_EN)
    const anyJudicialRes = await session.run(
      `MATCH (p:DictaduraPersona)-[:CONDENADO_A|CONDENADO_EN|ACUSADO_EN]->()
       WHERE p.caso_slug = $casoSlug AND p.category = 'represor'
       RETURN count(DISTINCT p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const condemnedOrAccused = toNumber(anyJudicialRes.records[0]?.get('total'))

    // SIDE agents total
    const sideRes = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug AND p.source = 'side-desclasificados'
       RETURN count(p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const sideTotal = toNumber(sideRes.records[0]?.get('total'))

    // SIDE agents with any judicial link
    const sideJudRes = await session.run(
      `MATCH (p:DictaduraPersona)-[:CONDENADO_A|CONDENADO_EN|ACUSADO_EN]->()
       WHERE p.caso_slug = $casoSlug AND p.source = 'side-desclasificados'
       RETURN count(DISTINCT p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const sideWithJudicial = toNumber(sideJudRes.records[0]?.get('total'))

    return { totalRepresors, condemned, accused, condemnedOrAccused, sideTotal, sideWithJudicial }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Section 2: CCD Accountability Gap
// ---------------------------------------------------------------------------

interface CCDRow {
  name: string
  victimCount: number
  operator: string
  province: string
  hasCausa: boolean
}

interface CCDGapResult {
  rows: CCDRow[]
  totalVictimsNoCausa: number
}

async function getCCDAccountabilityGap(): Promise<CCDGapResult> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Top 30 CCDs by DETENIDO_EN count, with operator and causa info
    const result = await session.run(
      `MATCH (v:DictaduraPersona)-[:DETENIDO_EN]->(c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
       WITH c, count(DISTINCT v) AS victimCount
       ORDER BY victimCount DESC
       LIMIT 30
       OPTIONAL MATCH (c)<-[:OPERADO_POR]-(unit)
       OPTIONAL MATCH (c)-[:INVESTIGADO_EN|VINCULADO_A]->(causa:DictaduraCausa)
       RETURN c.name AS name,
              victimCount,
              coalesce(collect(DISTINCT unit.name)[0], '') AS operator,
              coalesce(c.province, '') AS province,
              count(DISTINCT causa) > 0 AS hasCausa`,
      { casoSlug: CASO_SLUG },
    )

    const rows: CCDRow[] = result.records.map((r) => ({
      name: str(r.get('name')),
      victimCount: toNumber(r.get('victimCount')),
      operator: str(r.get('operator')),
      province: str(r.get('province')),
      hasCausa: r.get('hasCausa') as boolean,
    }))

    // Total victims in CCDs with no judicial link
    const gapRes = await session.run(
      `MATCH (v:DictaduraPersona)-[:DETENIDO_EN]->(c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
         AND NOT (c)-[:INVESTIGADO_EN|VINCULADO_A]->(:DictaduraCausa)
       RETURN count(DISTINCT v) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const totalVictimsNoCausa = toNumber(gapRes.records[0]?.get('total'))

    return { rows, totalVictimsNoCausa }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Section 3: Unprosecuted Represors with Evidence
// ---------------------------------------------------------------------------

interface UnprosecutedRepresor {
  name: string
  tier: string
  rank: string
  units: string[]
  ccds: string[]
}

async function getUnprosecutedRepresors(): Promise<UnprosecutedRepresor[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.category = 'represor'
         AND p.confidence_tier IN ['gold', 'silver']
         AND NOT (p)-[:CONDENADO_A|CONDENADO_EN|ACUSADO_EN]->()
         AND (
           (p)-[:PERTENECE_A]->() OR
           (p)-[:COMANDO]->() OR
           (p)-[:DETENIDO_EN]->()
         )
       WITH p
       OPTIONAL MATCH (p)-[:PERTENECE_A|COMANDO]->(u)
       OPTIONAL MATCH (p)-[:DETENIDO_EN]->(c:DictaduraCCD)
       RETURN p.name AS name,
              coalesce(p.confidence_tier, '') AS tier,
              coalesce(p.rank, '') AS rank,
              collect(DISTINCT u.name) AS units,
              collect(DISTINCT c.name) AS ccds
       ORDER BY p.name ASC`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      name: str(r.get('name')),
      tier: str(r.get('tier')),
      rank: str(r.get('rank')),
      units: (r.get('units') as unknown[]).map(String).filter(Boolean),
      ccds: (r.get('ccds') as unknown[]).map(String).filter(Boolean),
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Section 4: Corporate Accountability
// ---------------------------------------------------------------------------

interface CorporateRow {
  name: string
  orgType: string
  linkedTo: string[]
  hasAcusadoEn: boolean
}

async function getCorporateAccountability(): Promise<CorporateRow[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (o)-[:COLABORO_CON|ENTREGO_A]->(target)
       WHERE o.caso_slug = $casoSlug
       WITH o, collect(DISTINCT coalesce(target.name, target.title, '')) AS linkedTo
       OPTIONAL MATCH (o)-[:ACUSADO_EN]->()
       WITH o, linkedTo, count(*) > 0 AS hasAcusadoEn
       RETURN o.name AS name,
              coalesce(o.org_type, labels(o)[0], '') AS orgType,
              linkedTo,
              hasAcusadoEn
       ORDER BY o.name ASC`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      name: str(r.get('name')),
      orgType: str(r.get('orgType')),
      linkedTo: (r.get('linkedTo') as unknown[]).map(String).filter(Boolean),
      hasAcusadoEn: r.get('hasAcusadoEn') as boolean,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Section 5: SIDE Intelligence Chain
// ---------------------------------------------------------------------------

interface SIDEAgent {
  name: string
  rank: string
  belongsTo: string[]
  reportsTo: string[]
}

async function getSIDEChain(): Promise<SIDEAgent[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.source = 'side-desclasificados'
         AND p.rank IS NOT NULL
         AND NOT p.name CONTAINS 'ilegible'
         AND NOT p.name CONTAINS 'NOMBRE'
         AND NOT p.name STARTS WITH 'Señor'
         AND NOT p.name STARTS WITH 'Persona'
       OPTIONAL MATCH (p)-[:PERTENECE_A]->(u)
       OPTIONAL MATCH (p)-[:REPORTA_A]->(sup)
       RETURN p.name AS name,
              p.rank AS rank,
              collect(DISTINCT u.name) AS belongsTo,
              collect(DISTINCT sup.name) AS reportsTo
       ORDER BY p.rank ASC, p.name ASC`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      name: str(r.get('name')),
      rank: str(r.get('rank')),
      belongsTo: (r.get('belongsTo') as unknown[]).map(String).filter(Boolean),
      reportsTo: (r.get('reportsTo') as unknown[]).map(String).filter(Boolean),
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Section 6: Victim Justice Rate
// ---------------------------------------------------------------------------

interface VictimJusticeStats {
  totalVictims: number
  victimsInCausa: number
  victimsInCCD: number
  victimsInCCDAndCausa: number
}

async function getVictimJusticeRate(): Promise<VictimJusticeStats> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Total victims
    const totalRes = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug AND p.category = 'victima'
       RETURN count(p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const totalVictims = toNumber(totalRes.records[0]?.get('total'))

    // Victims with VICTIMA_EN_CAUSA
    const causaRes = await session.run(
      `MATCH (p:DictaduraPersona)-[:VICTIMA_EN_CAUSA]->()
       WHERE p.caso_slug = $casoSlug AND p.category = 'victima'
       RETURN count(DISTINCT p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const victimsInCausa = toNumber(causaRes.records[0]?.get('total'))

    // Victims with DETENIDO_EN a CCD
    const ccdRes = await session.run(
      `MATCH (p:DictaduraPersona)-[:DETENIDO_EN]->(:DictaduraCCD)
       WHERE p.caso_slug = $casoSlug AND p.category = 'victima'
       RETURN count(DISTINCT p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const victimsInCCD = toNumber(ccdRes.records[0]?.get('total'))

    // Victims in a CCD that is also linked to a Causa
    const bothRes = await session.run(
      `MATCH (p:DictaduraPersona)-[:DETENIDO_EN]->(c:DictaduraCCD)
       WHERE p.caso_slug = $casoSlug AND p.category = 'victima'
         AND (
           (p)-[:VICTIMA_EN_CAUSA]->() OR
           (c)-[:INVESTIGADO_EN|VINCULADO_A]->(:DictaduraCausa)
         )
       RETURN count(DISTINCT p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const victimsInCCDAndCausa = toNumber(bothRes.records[0]?.get('total'))

    return { totalVictims, victimsInCausa, victimsInCCD, victimsInCCDAndCausa }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Section 7: Generate Markdown Report
// ---------------------------------------------------------------------------

function generateReport(
  prosecution: ProsecutionStats,
  ccdGap: CCDGapResult,
  unprosecuted: UnprosecutedRepresor[],
  corporate: CorporateRow[],
  sideChain: SIDEAgent[],
  victimJustice: VictimJusticeStats,
): string {
  const now = new Date().toISOString().slice(0, 10)
  const lines: string[] = []

  lines.push(`# Accountability Audit: caso-dictadura`)
  lines.push(``)
  lines.push(`**Generated:** ${now}`)
  lines.push(`**Source:** Office of Accountability — caso-dictadura knowledge graph`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  // ── Section 1: Prosecution Rate ──
  lines.push(`## 1. Prosecution Rate by Category`)
  lines.push(``)
  lines.push(`| Metric | Count | Rate |`)
  lines.push(`|--------|------:|-----:|`)
  lines.push(`| Total represors in graph | ${prosecution.totalRepresors} | — |`)
  lines.push(`| Represors with CONDENADO (convicted) | ${prosecution.condemned} | ${pct(prosecution.condemned, prosecution.totalRepresors)} |`)
  lines.push(`| Represors with ACUSADO_EN (charged) | ${prosecution.accused} | ${pct(prosecution.accused, prosecution.totalRepresors)} |`)
  lines.push(`| Represors with any judicial link | ${prosecution.condemnedOrAccused} | ${pct(prosecution.condemnedOrAccused, prosecution.totalRepresors)} |`)
  lines.push(`| SIDE agents (source=side-desclasificados) | ${prosecution.sideTotal} | — |`)
  lines.push(`| SIDE agents with judicial link | ${prosecution.sideWithJudicial} | ${pct(prosecution.sideWithJudicial, prosecution.sideTotal)} |`)
  lines.push(``)
  if (prosecution.totalRepresors > 0 && prosecution.condemnedOrAccused === 0) {
    lines.push(`> **Finding:** No represors in the graph have documented judicial links. This may indicate that CONDENADO/ACUSADO relationships have not yet been ingested, or that the prosecution gap is total within this dataset.`)
    lines.push(``)
  } else if (prosecution.totalRepresors > 0) {
    const unprosecutedCount = prosecution.totalRepresors - prosecution.condemnedOrAccused
    lines.push(`> **Finding:** ${unprosecutedCount} of ${prosecution.totalRepresors} represors (${pct(unprosecutedCount, prosecution.totalRepresors)}) have no documented judicial link in the graph.`)
    lines.push(``)
  }

  // ── Section 2: CCD Accountability Gap ──
  lines.push(`## 2. CCD Accountability Gap — Top 30 CCDs by Victim Count`)
  lines.push(``)
  if (ccdGap.rows.length > 0) {
    lines.push(`| # | CCD | Victims | Operator | Province | Linked to Causa |`)
    lines.push(`|--:|-----|--------:|----------|----------|:---------------:|`)
    ccdGap.rows.forEach((row, i) => {
      lines.push(`| ${i + 1} | ${row.name} | ${row.victimCount} | ${row.operator || '—'} | ${row.province || '—'} | ${row.hasCausa ? 'Yes' : '**NO**'} |`)
    })
    lines.push(``)
    lines.push(`**Total victims in CCDs with no judicial link:** ${ccdGap.totalVictimsNoCausa}`)
    lines.push(``)
    const ccdsNoCausa = ccdGap.rows.filter((r) => !r.hasCausa).length
    lines.push(`> **Finding:** ${ccdsNoCausa} of the top 30 CCDs have no link to any Causa (judicial proceeding) in the graph.`)
  } else {
    lines.push(`*No CCD → victim (DETENIDO_EN) relationships found in the graph.*`)
  }
  lines.push(``)

  // ── Section 3: Unprosecuted Represors with Evidence ──
  lines.push(`## 3. Unprosecuted Represors with Documented Evidence`)
  lines.push(``)
  lines.push(`Gold/silver represors who have PERTENECE_A, COMANDO, or DETENIDO_EN relationships but NO CONDENADO/ACUSADO links.`)
  lines.push(``)
  if (unprosecuted.length > 0) {
    lines.push(`| # | Name | Tier | Rank | Unit(s) | CCD(s) |`)
    lines.push(`|--:|------|------|------|---------|--------|`)
    unprosecuted.forEach((r, i) => {
      const units = r.units.length > 0 ? r.units.join('; ') : '—'
      const ccds = r.ccds.length > 0 ? r.ccds.join('; ') : '—'
      lines.push(`| ${i + 1} | ${r.name} | ${r.tier} | ${r.rank || '—'} | ${units} | ${ccds} |`)
    })
    lines.push(``)
    lines.push(`> **Finding:** ${unprosecuted.length} gold/silver represors have documented institutional connections but no judicial link in the graph.`)
  } else {
    lines.push(`*No gold/silver represors with evidence but without judicial links found.*`)
  }
  lines.push(``)

  // ── Section 4: Corporate Accountability ──
  lines.push(`## 4. Corporate Accountability`)
  lines.push(``)
  lines.push(`Organizations with COLABORO_CON or ENTREGO_A relationships.`)
  lines.push(``)
  if (corporate.length > 0) {
    lines.push(`| # | Organization | Type | Linked To | Charged (ACUSADO_EN) |`)
    lines.push(`|--:|-------------|------|-----------|:--------------------:|`)
    corporate.forEach((r, i) => {
      const linked = r.linkedTo.length > 0 ? r.linkedTo.slice(0, 3).join('; ') + (r.linkedTo.length > 3 ? ` (+${r.linkedTo.length - 3} more)` : '') : '—'
      lines.push(`| ${i + 1} | ${r.name} | ${r.orgType || '—'} | ${linked} | ${r.hasAcusadoEn ? 'Yes' : '**NO**'} |`)
    })
    lines.push(``)
    const uncharged = corporate.filter((r) => !r.hasAcusadoEn).length
    lines.push(`> **Finding:** ${uncharged} of ${corporate.length} organizations with documented collaboration have no ACUSADO_EN relationship.`)
  } else {
    lines.push(`*No COLABORO_CON or ENTREGO_A relationships found in the graph.*`)
  }
  lines.push(``)

  // ── Section 5: SIDE Intelligence Chain ──
  lines.push(`## 5. SIDE Intelligence Chain`)
  lines.push(``)
  lines.push(`DictaduraPersona nodes from source=side-desclasificados with rank IS NOT NULL (OCR noise filtered).`)
  lines.push(``)
  if (sideChain.length > 0) {
    lines.push(`| # | Name | Rank | Belongs To (PERTENECE_A) | Reports To (REPORTA_A) |`)
    lines.push(`|--:|------|------|--------------------------|------------------------|`)
    sideChain.forEach((r, i) => {
      const belongs = r.belongsTo.length > 0 ? r.belongsTo.join('; ') : '—'
      const reports = r.reportsTo.length > 0 ? r.reportsTo.join('; ') : '—'
      lines.push(`| ${i + 1} | ${r.name} | ${r.rank} | ${belongs} | ${reports} |`)
    })
    lines.push(``)
    const withReports = sideChain.filter((r) => r.reportsTo.length > 0).length
    lines.push(`> **Finding:** ${sideChain.length} ranked SIDE agents identified. ${withReports} have documented REPORTA_A (reporting chain) relationships.`)
  } else {
    lines.push(`*No ranked SIDE agents found (source=side-desclasificados with rank).*`)
  }
  lines.push(``)

  // ── Section 6: Victim Justice Rate ──
  lines.push(`## 6. Victim Justice Rate`)
  lines.push(``)
  lines.push(`| Metric | Count | Rate |`)
  lines.push(`|--------|------:|-----:|`)
  lines.push(`| Total victims in graph | ${victimJustice.totalVictims} | — |`)
  lines.push(`| Victims with VICTIMA_EN_CAUSA | ${victimJustice.victimsInCausa} | ${pct(victimJustice.victimsInCausa, victimJustice.totalVictims)} |`)
  lines.push(`| Victims detained in a CCD (DETENIDO_EN) | ${victimJustice.victimsInCCD} | ${pct(victimJustice.victimsInCCD, victimJustice.totalVictims)} |`)
  lines.push(`| Victims in CCD with any judicial link | ${victimJustice.victimsInCCDAndCausa} | ${pct(victimJustice.victimsInCCDAndCausa, victimJustice.totalVictims)} |`)
  lines.push(``)

  if (victimJustice.totalVictims > 0) {
    const justiceRate = victimJustice.victimsInCausa > 0
      ? pct(victimJustice.victimsInCausa, victimJustice.totalVictims)
      : pct(victimJustice.victimsInCCDAndCausa, victimJustice.totalVictims)
    const noJustice = victimJustice.totalVictims - Math.max(victimJustice.victimsInCausa, victimJustice.victimsInCCDAndCausa)
    lines.push(`> **Finding:** Estimated justice rate: ${justiceRate} of documented victims have their case in any judicial proceeding. ${noJustice} victims remain without any documented judicial coverage.`)
  }
  lines.push(``)

  // ── Summary ──
  lines.push(`---`)
  lines.push(``)
  lines.push(`## Summary`)
  lines.push(``)
  lines.push(`This audit measures the gap between **documented evidence** in the caso-dictadura knowledge graph and **documented judicial action**. Key takeaways:`)
  lines.push(``)
  lines.push(`- **Represor prosecution rate:** ${pct(prosecution.condemnedOrAccused, prosecution.totalRepresors)} of ${prosecution.totalRepresors} represors have any judicial link`)
  lines.push(`- **CCD accountability gap:** ${ccdGap.totalVictimsNoCausa} victims were detained in CCDs with no link to any judicial proceeding`)
  lines.push(`- **Unprosecuted with evidence:** ${unprosecuted.length} gold/silver represors have documented unit/CCD connections but no judicial link`)

  if (corporate.length > 0) {
    const uncharged = corporate.filter((r) => !r.hasAcusadoEn).length
    lines.push(`- **Corporate impunity:** ${uncharged} of ${corporate.length} organizations with documented collaboration face no charges`)
  }

  lines.push(`- **SIDE agents:** ${prosecution.sideWithJudicial} of ${prosecution.sideTotal} have any judicial link`)

  if (victimJustice.totalVictims > 0) {
    const covered = Math.max(victimJustice.victimsInCausa, victimJustice.victimsInCCDAndCausa)
    lines.push(`- **Victim justice rate:** ${pct(covered, victimJustice.totalVictims)} of ${victimJustice.totalVictims} documented victims have any judicial coverage`)
  }

  lines.push(``)
  lines.push(`> This report reflects the current state of the knowledge graph, not the totality of Argentine judicial proceedings. Gaps may indicate missing ingestion rather than missing justice.`)
  lines.push(``)

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j. Is the database running?')
    process.exit(1)
  }
  console.log('Connected to Neo4j. Running accountability audit...\n')

  // ── Section 1 ──
  console.log('1/6  Prosecution rate by category...')
  const prosecution = await getProsecutionStats()
  console.log(`     Total represors: ${prosecution.totalRepresors}`)
  console.log(`     Convicted: ${prosecution.condemned}  Accused: ${prosecution.accused}  Any judicial: ${prosecution.condemnedOrAccused}`)
  console.log(`     SIDE agents: ${prosecution.sideTotal}  SIDE with judicial: ${prosecution.sideWithJudicial}`)

  // ── Section 2 ──
  console.log('\n2/6  CCD accountability gap...')
  const ccdGap = await getCCDAccountabilityGap()
  console.log(`     Top 30 CCDs retrieved (${ccdGap.rows.length} rows)`)
  console.log(`     Victims in CCDs with no causa: ${ccdGap.totalVictimsNoCausa}`)

  // ── Section 3 ──
  console.log('\n3/6  Unprosecuted represors with evidence...')
  const unprosecuted = await getUnprosecutedRepresors()
  console.log(`     Found ${unprosecuted.length} unprosecuted represors (gold/silver with evidence)`)

  // ── Section 4 ──
  console.log('\n4/6  Corporate accountability...')
  const corporate = await getCorporateAccountability()
  console.log(`     Found ${corporate.length} organizations with COLABORO_CON/ENTREGO_A links`)

  // ── Section 5 ──
  console.log('\n5/6  SIDE intelligence chain...')
  const sideChain = await getSIDEChain()
  console.log(`     Found ${sideChain.length} ranked SIDE agents (OCR noise filtered)`)

  // ── Section 6 ──
  console.log('\n6/6  Victim justice rate...')
  const victimJustice = await getVictimJusticeRate()
  console.log(`     Total victims: ${victimJustice.totalVictims}`)
  console.log(`     In causa: ${victimJustice.victimsInCausa}  In CCD: ${victimJustice.victimsInCCD}  In CCD+causa: ${victimJustice.victimsInCCDAndCausa}`)

  // ── Generate Report ──
  console.log('\nGenerating Markdown report...')
  const report = generateReport(prosecution, ccdGap, unprosecuted, corporate, sideChain, victimJustice)

  const outDir = path.resolve(__dirname, '..', 'docs', 'investigations')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const outPath = path.join(outDir, 'ACCOUNTABILITY-AUDIT-DICTADURA.md')
  fs.writeFileSync(outPath, report, 'utf-8')
  console.log(`\nReport written to: ${outPath}`)
  console.log(`Report size: ${(report.length / 1024).toFixed(1)} KB`)

  await closeDriver()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  closeDriver().finally(() => process.exit(1))
})
