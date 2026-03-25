/**
 * Wave 14: Quality Audit
 *
 * Final consolidation pass over existing caso-dictadura graph data:
 *   1. Find orphan nodes (no relationships) → report
 *   2. Validate tier consistency (no gold without verified source)
 *   3. Count nodes by wave, tier, label → final stats report
 *   4. Promote well-connected bronze nodes (3+ relationships, 2+ sources) → silver
 *   5. Final graph state report with totals
 *
 * No new external data. Works on existing graph structure.
 *
 * Run with: npx tsx scripts/consolidate-dictadura-wave-14.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 14

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Phase 1: Find orphan nodes
// ---------------------------------------------------------------------------

interface OrphanNode {
  id: string
  label: string
  name: string
  wave: number
  tier: string
}

async function findOrphanNodes(): Promise<OrphanNode[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
       AND NOT (n)-[]-()
       RETURN elementId(n) AS id,
              labels(n)[0] AS label,
              coalesce(n.name, n.title, n.slug, 'unnamed') AS name,
              n.ingestion_wave AS wave,
              coalesce(n.confidence_tier, 'unset') AS tier
       ORDER BY label, name`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      id: r.get('id') as string,
      label: r.get('label') as string,
      name: r.get('name') as string,
      wave: toNumber(r.get('wave')),
      tier: r.get('tier') as string,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Validate tier consistency
// ---------------------------------------------------------------------------

interface TierViolation {
  id: string
  name: string
  label: string
  tier: string
  issue: string
}

async function validateTierConsistency(): Promise<TierViolation[]> {
  const driver = getDriver()
  const session = driver.session()
  const violations: TierViolation[] = []

  try {
    // Rule 1: Gold nodes must have a verified source
    const goldWithoutSource = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.confidence_tier = 'gold'
         AND (n.source IS NULL OR n.source = '')
       RETURN elementId(n) AS id,
              coalesce(n.name, n.title, n.slug) AS name,
              labels(n)[0] AS label`,
      { casoSlug: CASO_SLUG },
    )

    for (const r of goldWithoutSource.records) {
      violations.push({
        id: r.get('id') as string,
        name: r.get('name') as string,
        label: r.get('label') as string,
        tier: 'gold',
        issue: 'Gold tier without verified source',
      })
    }

    // Rule 2: Gold nodes should have provenance
    const goldWithoutProvenance = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.confidence_tier = 'gold'
         AND (n.provenance IS NULL OR n.provenance = '')
         AND (n.source IS NOT NULL AND n.source <> '')
       RETURN elementId(n) AS id,
              coalesce(n.name, n.title, n.slug) AS name,
              labels(n)[0] AS label`,
      { casoSlug: CASO_SLUG },
    )

    for (const r of goldWithoutProvenance.records) {
      violations.push({
        id: r.get('id') as string,
        name: r.get('name') as string,
        label: r.get('label') as string,
        tier: 'gold',
        issue: 'Gold tier without provenance (has source)',
      })
    }

    // Rule 3: Silver nodes should have at least one source
    const silverWithoutSource = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.confidence_tier = 'silver'
         AND (n.source IS NULL OR n.source = '')
       RETURN elementId(n) AS id,
              coalesce(n.name, n.title, n.slug) AS name,
              labels(n)[0] AS label`,
      { casoSlug: CASO_SLUG },
    )

    for (const r of silverWithoutSource.records) {
      violations.push({
        id: r.get('id') as string,
        name: r.get('name') as string,
        label: r.get('label') as string,
        tier: 'silver',
        issue: 'Silver tier without source',
      })
    }

    // Rule 4: Nodes without any tier assignment
    const noTier = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND (n.confidence_tier IS NULL OR n.confidence_tier = '')
       RETURN elementId(n) AS id,
              coalesce(n.name, n.title, n.slug) AS name,
              labels(n)[0] AS label`,
      { casoSlug: CASO_SLUG },
    )

    for (const r of noTier.records) {
      violations.push({
        id: r.get('id') as string,
        name: r.get('name') as string,
        label: r.get('label') as string,
        tier: 'unset',
        issue: 'No confidence tier assigned',
      })
    }

    // Demote invalid gold nodes to silver
    if (goldWithoutSource.records.length > 0) {
      await session.run(
        `MATCH (n)
         WHERE n.caso_slug = $casoSlug
           AND n.confidence_tier = 'gold'
           AND (n.source IS NULL OR n.source = '')
         SET n.confidence_tier = 'silver',
             n.demoted_reason = 'gold-without-verified-source',
             n.demoted_at = datetime()`,
        { casoSlug: CASO_SLUG },
      )
      console.log(`  Demoted ${goldWithoutSource.records.length} gold nodes without source to silver`)
    }

    // Assign bronze to nodes without any tier
    if (noTier.records.length > 0) {
      await session.run(
        `MATCH (n)
         WHERE n.caso_slug = $casoSlug
           AND (n.confidence_tier IS NULL OR n.confidence_tier = '')
         SET n.confidence_tier = 'bronze',
             n.tier_assigned_reason = 'quality-audit-default',
             n.updated_at = datetime()`,
        { casoSlug: CASO_SLUG },
      )
      console.log(`  Assigned bronze tier to ${noTier.records.length} untiered nodes`)
    }

    return violations
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Count nodes by wave, tier, label
// ---------------------------------------------------------------------------

interface NodeCount {
  label: string
  wave: number
  tier: string
  count: number
}

async function countNodesByDimension(): Promise<{
  byLabel: Array<{ label: string; count: number }>
  byWave: Array<{ wave: number; count: number }>
  byTier: Array<{ tier: string; count: number }>
  crossTab: NodeCount[]
}> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // By label
    const labelResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN labels(n)[0] AS label, count(n) AS count ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )
    const byLabel = labelResult.records.map((r) => ({
      label: r.get('label') as string,
      count: toNumber(r.get('count')),
    }))

    // By wave
    const waveResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN coalesce(n.ingestion_wave, 0) AS wave, count(n) AS count ORDER BY wave`,
      { casoSlug: CASO_SLUG },
    )
    const byWave = waveResult.records.map((r) => ({
      wave: toNumber(r.get('wave')),
      count: toNumber(r.get('count')),
    }))

    // By tier
    const tierResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN coalesce(n.confidence_tier, 'unset') AS tier, count(n) AS count ORDER BY tier`,
      { casoSlug: CASO_SLUG },
    )
    const byTier = tierResult.records.map((r) => ({
      tier: r.get('tier') as string,
      count: toNumber(r.get('count')),
    }))

    // Cross-tab: label x wave x tier
    const crossResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN labels(n)[0] AS label,
              coalesce(n.ingestion_wave, 0) AS wave,
              coalesce(n.confidence_tier, 'unset') AS tier,
              count(n) AS count
       ORDER BY label, wave, tier`,
      { casoSlug: CASO_SLUG },
    )
    const crossTab = crossResult.records.map((r) => ({
      label: r.get('label') as string,
      wave: toNumber(r.get('wave')),
      tier: r.get('tier') as string,
      count: toNumber(r.get('count')),
    }))

    return { byLabel, byWave, byTier, crossTab }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Promote well-connected bronze nodes to silver
// ---------------------------------------------------------------------------

async function promoteWellConnectedNodes(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Find bronze nodes with 3+ relationships and 2+ distinct sources
    const result = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.confidence_tier = 'bronze'
       MATCH (n)-[r]-()
       WITH n, count(r) AS relCount, collect(DISTINCT coalesce(r.source, 'unknown')) AS sources
       WHERE relCount >= 3 AND size(sources) >= 2
       SET n.confidence_tier = 'silver',
           n.promoted_at = datetime(),
           n.promoted_reason = 'quality-audit: ' + toString(relCount) + ' rels, ' + toString(size(sources)) + ' sources',
           n.updated_at = datetime()
       RETURN count(n) AS promoted`,
      { casoSlug: CASO_SLUG },
    )

    return toNumber(result.records[0]?.get('promoted'))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 5: Final graph state report
// ---------------------------------------------------------------------------

async function finalGraphReport(): Promise<void> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Total nodes
    const nodesResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug RETURN count(n) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const totalNodes = toNumber(nodesResult.records[0]?.get('total'))

    // Total edges
    const edgesResult = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug OR b.caso_slug = $casoSlug OR r.caso_slug = $casoSlug
       RETURN count(r) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const totalEdges = toNumber(edgesResult.records[0]?.get('total'))

    // Relationship types
    const relTypes = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug OR b.caso_slug = $casoSlug OR r.caso_slug = $casoSlug
       RETURN type(r) AS type, count(r) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    // Average degree
    const avgDegree = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       OPTIONAL MATCH (n)-[r]-()
       WITH n, count(r) AS degree
       RETURN avg(degree) AS avgDeg, max(degree) AS maxDeg, min(degree) AS minDeg`,
      { casoSlug: CASO_SLUG },
    )
    const avgDeg = avgDegree.records[0]?.get('avgDeg')
    const maxDeg = toNumber(avgDegree.records[0]?.get('maxDeg'))

    // Most connected nodes
    const mostConnected = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       MATCH (n)-[r]-()
       WITH n, count(r) AS degree, labels(n)[0] AS label
       ORDER BY degree DESC
       LIMIT 10
       RETURN coalesce(n.name, n.title, n.slug) AS name, label, degree`,
      { casoSlug: CASO_SLUG },
    )

    // Connected components estimate
    const components = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND NOT (n)-[]-()
       RETURN count(n) AS isolatedNodes`,
      { casoSlug: CASO_SLUG },
    )
    const isolated = toNumber(components.records[0]?.get('isolatedNodes'))

    console.log('\n========================================')
    console.log('  FINAL GRAPH STATE REPORT')
    console.log('  caso-dictadura')
    console.log('========================================\n')

    console.log(`  Total nodes:         ${totalNodes.toLocaleString()}`)
    console.log(`  Total edges:         ${totalEdges.toLocaleString()}`)
    console.log(`  Isolated nodes:      ${isolated}`)
    console.log(`  Avg degree:          ${typeof avgDeg === 'number' ? avgDeg.toFixed(2) : 'N/A'}`)
    console.log(`  Max degree:          ${maxDeg}`)
    console.log(`  Graph density:       ${totalNodes > 0 ? ((2 * totalEdges) / (totalNodes * (totalNodes - 1)) * 100).toFixed(4) : '0'}%`)

    console.log('\n  Relationship types:')
    for (const r of relTypes.records) {
      const type = r.get('type') as string
      const count = toNumber(r.get('count'))
      console.log(`    ${type.padEnd(35)} ${count.toLocaleString().padStart(6)}`)
    }

    console.log('\n  Most connected nodes:')
    for (const r of mostConnected.records) {
      const name = r.get('name') as string
      const label = r.get('label') as string
      const degree = toNumber(r.get('degree'))
      console.log(`    ${name.padEnd(40)} [${label}] degree=${degree}`)
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  process.env.NEO4J_QUERY_TIMEOUT_MS = '120000'

  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j')
    process.exit(1)
  }
  console.log('Connected to Neo4j\n')
  console.log('=== Wave 14: Quality Audit ===\n')

  // Phase 1: Find orphan nodes
  console.log('--- Phase 1: Orphan Node Detection ---')
  const orphans = await findOrphanNodes()
  console.log(`  Found ${orphans.length} orphan nodes (no relationships)`)
  if (orphans.length > 0) {
    // Group by label
    const byLabel = new Map<string, OrphanNode[]>()
    for (const o of orphans) {
      const list = byLabel.get(o.label) || []
      list.push(o)
      byLabel.set(o.label, list)
    }
    for (const [label, nodes] of byLabel) {
      console.log(`    ${label}: ${nodes.length} orphans`)
      for (const n of nodes.slice(0, 5)) {
        console.log(`      - ${n.name} (wave ${n.wave}, ${n.tier})`)
      }
      if (nodes.length > 5) {
        console.log(`      ... and ${nodes.length - 5} more`)
      }
    }
  }
  console.log()

  // Phase 2: Validate tier consistency
  console.log('--- Phase 2: Tier Consistency Validation ---')
  const violations = await validateTierConsistency()
  console.log(`  Found ${violations.length} tier violations`)
  if (violations.length > 0) {
    const byIssue = new Map<string, number>()
    for (const v of violations) {
      byIssue.set(v.issue, (byIssue.get(v.issue) || 0) + 1)
    }
    for (const [issue, count] of byIssue) {
      console.log(`    ${issue}: ${count}`)
    }
  }
  console.log()

  // Phase 3: Node counts by dimension
  console.log('--- Phase 3: Node Distribution ---')
  const { byLabel, byWave, byTier, crossTab } = await countNodesByDimension()

  console.log('\n  By label:')
  let totalNodes = 0
  for (const { label, count } of byLabel) {
    totalNodes += count
    console.log(`    ${label.padEnd(30)} ${count.toLocaleString().padStart(6)}`)
  }
  console.log(`    ${'TOTAL'.padEnd(30)} ${totalNodes.toLocaleString().padStart(6)}`)

  console.log('\n  By wave:')
  for (const { wave, count } of byWave) {
    const bar = '#'.repeat(Math.ceil(count / Math.max(1, Math.ceil(byWave.reduce((m, w) => Math.max(m, w.count), 0) / 40))))
    console.log(`    Wave ${String(wave).padEnd(3)} ${count.toLocaleString().padStart(6)}  ${bar}`)
  }

  console.log('\n  By tier:')
  for (const { tier, count } of byTier) {
    const pct = totalNodes > 0 ? ((count / totalNodes) * 100).toFixed(1) : '0'
    console.log(`    ${tier.padEnd(10)} ${count.toLocaleString().padStart(6)} (${pct}%)`)
  }
  console.log()

  // Phase 4: Promote well-connected bronze nodes
  console.log('--- Phase 4: Bronze Node Promotion ---')
  const promoted = await promoteWellConnectedNodes()
  console.log(`  Promoted ${promoted} well-connected bronze nodes to silver`)
  console.log(`  (criteria: 3+ relationships, 2+ distinct sources)\n`)

  // Phase 5: Final graph state report
  console.log('--- Phase 5: Final Graph State ---')
  await finalGraphReport()

  // Summary
  console.log('\n=== Wave 14 Summary ===')
  console.log(`  Orphan nodes found:       ${orphans.length}`)
  console.log(`  Tier violations found:    ${violations.length}`)
  console.log(`  Nodes promoted to silver: ${promoted}`)
  console.log(`  Total nodes:              ${totalNodes}`)

  await closeDriver()
  console.log('\nWave 14 complete!')
  console.log('Phase B consolidation finished.')
}

main().catch((err) => {
  console.error('Wave 14 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
