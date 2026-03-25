/**
 * Wave 24: Final Consolidation
 *
 * Last cleanup and quality pass:
 *   1. Remove orphan nodes (0 relationships, bronze tier)
 *   2. Final dedup sweep (merge near-duplicate personas)
 *   3. Promote remaining verified bronze → silver
 *   4. Final graph state report
 *   5. Generate quality score (% gold, % silver, avg relationships per node)
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-24.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 24

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------------
// Phase 1: Remove orphan nodes (0 relationships, bronze tier)
// ---------------------------------------------------------------------------

async function removeOrphanNodes(): Promise<{ removed: number; preserved: number }> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // First, count orphans by tier
    const countResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND NOT (n)-[]-()
       RETURN coalesce(n.confidence_tier, 'unset') AS tier,
              count(n) AS count
       ORDER BY tier`,
      { casoSlug: CASO_SLUG },
    )

    let preserved = 0
    for (const r of countResult.records) {
      const tier = r.get('tier') as string
      const count = toNumber(r.get('count'))
      if (tier !== 'bronze' && tier !== 'unset') {
        preserved += count
        console.log(`  Preserving ${count} orphan ${tier} nodes`)
      }
    }

    // Only remove bronze/unset orphans
    const removeResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND NOT (n)-[]-()
         AND (n.confidence_tier = 'bronze' OR n.confidence_tier IS NULL)
       DETACH DELETE n
       RETURN count(n) AS removed`,
      { casoSlug: CASO_SLUG },
    )

    // Neo4j returns the count differently after DELETE; use summary instead
    const summary = removeResult.summary.counters.updates()
    const removed = summary.nodesDeleted || 0

    return { removed, preserved }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Final dedup sweep
// ---------------------------------------------------------------------------

interface DupCandidate {
  id1: string
  id2: string
  name1: string
  name2: string
  slug: string
}

async function findDuplicates(): Promise<DupCandidate[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Find personas with same slug (likely duplicates)
    const result = await session.run(
      `MATCH (a:DictaduraPersona), (b:DictaduraPersona)
       WHERE a.caso_slug = $casoSlug
         AND b.caso_slug = $casoSlug
         AND a.slug = b.slug
         AND elementId(a) < elementId(b)
       RETURN elementId(a) AS id1, elementId(b) AS id2,
              a.name AS name1, b.name AS name2, a.slug AS slug
       ORDER BY a.slug
       LIMIT 200`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      id1: r.get('id1') as string,
      id2: r.get('id2') as string,
      name1: r.get('name1') as string,
      name2: r.get('name2') as string,
      slug: r.get('slug') as string,
    }))
  } finally {
    await session.close()
  }
}

async function mergeDuplicates(dups: DupCandidate[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let merged = 0

  try {
    for (const dup of dups) {
      // Keep the node with higher tier or more relationships
      const comparison = await session.run(
        `MATCH (a) WHERE elementId(a) = $id1
         MATCH (b) WHERE elementId(b) = $id2
         OPTIONAL MATCH (a)-[ra]-()
         OPTIONAL MATCH (b)-[rb]-()
         WITH a, b, count(ra) AS degA, count(rb) AS degB,
              coalesce(a.confidence_tier, 'bronze') AS tierA,
              coalesce(b.confidence_tier, 'bronze') AS tierB
         RETURN degA, degB, tierA, tierB`,
        { id1: dup.id1, id2: dup.id2 },
      )

      if (comparison.records.length === 0) continue

      const rec = comparison.records[0]
      const degA = toNumber(rec.get('degA'))
      const degB = toNumber(rec.get('degB'))
      const tierA = rec.get('tierA') as string
      const tierB = rec.get('tierB') as string

      const tierRank: Record<string, number> = { gold: 3, silver: 2, bronze: 1 }
      const rankA = tierRank[tierA] || 0
      const rankB = tierRank[tierB] || 0

      // Keep the one with higher tier, or more relationships
      const keepId = rankA > rankB || (rankA === rankB && degA >= degB) ? dup.id1 : dup.id2
      const removeId = keepId === dup.id1 ? dup.id2 : dup.id1

      // Transfer relationships from removed node to kept node
      await session.run(
        `MATCH (keep) WHERE elementId(keep) = $keepId
         MATCH (remove) WHERE elementId(remove) = $removeId
         OPTIONAL MATCH (remove)-[r]->(target)
         WHERE NOT target = keep
         WITH keep, remove, r, target, type(r) AS relType
         CALL {
           WITH keep, target, relType, r
           WITH keep, target, relType, r
           WHERE r IS NOT NULL
           CALL (keep, target, relType) {
             WITH keep, target, relType
             MERGE (keep)-[nr:RELATED_TO]->(target)
             SET nr.original_type = relType,
                 nr.migrated_from_dedup = true,
                 nr.ingestion_wave = $wave,
                 nr.caso_slug = $casoSlug
           }
         }
         WITH remove
         DETACH DELETE remove`,
        { keepId, removeId, wave: WAVE, casoSlug: CASO_SLUG },
      )

      merged++
    }

    return merged
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Promote remaining verified bronze → silver
// ---------------------------------------------------------------------------

async function promoteVerifiedBronze(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Promote bronze nodes that have:
    // - At least 2 relationships
    // - A non-empty source field
    // - OR qwen_verified = true
    const result = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.confidence_tier = 'bronze'
       OPTIONAL MATCH (n)-[r]-()
       WITH n, count(r) AS relCount
       WHERE (relCount >= 2 AND n.source IS NOT NULL AND n.source <> '')
          OR n.qwen_verified = true
       SET n.confidence_tier = 'silver',
           n.promoted_at = datetime(),
           n.promoted_reason = 'final-consolidation: ' + toString(relCount) + ' rels',
           n.enriched_wave = $wave,
           n.updated_at = datetime()
       RETURN count(n) AS promoted`,
      { casoSlug: CASO_SLUG, wave: WAVE },
    )

    return toNumber(result.records[0]?.get('promoted'))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Final graph state report
// ---------------------------------------------------------------------------

async function generateFinalReport(): Promise<void> {
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

    // Nodes by label
    const labelResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN labels(n)[0] AS label, count(n) AS count ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    // Nodes by tier
    const tierResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN coalesce(n.confidence_tier, 'unset') AS tier, count(n) AS count ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    // Average degree
    const degreeResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       OPTIONAL MATCH (n)-[r]-()
       WITH n, count(r) AS degree
       RETURN avg(degree) AS avgDeg, max(degree) AS maxDeg, min(degree) AS minDeg`,
      { casoSlug: CASO_SLUG },
    )

    const avgDeg = degreeResult.records[0]?.get('avgDeg')
    const maxDeg = toNumber(degreeResult.records[0]?.get('maxDeg'))

    // Isolated nodes remaining
    const isolatedResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND NOT (n)-[]-()
       RETURN count(n) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const isolated = toNumber(isolatedResult.records[0]?.get('total'))

    // Edge types
    const edgeTypes = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug OR b.caso_slug = $casoSlug OR r.caso_slug = $casoSlug
       RETURN type(r) AS type, count(r) AS count ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    // Most connected
    const topNodes = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       MATCH (n)-[r]-()
       WITH n, count(r) AS degree, labels(n)[0] AS label
       ORDER BY degree DESC LIMIT 15
       RETURN coalesce(n.name, n.title, n.slug) AS name, label, degree,
              coalesce(n.confidence_tier, 'bronze') AS tier`,
      { casoSlug: CASO_SLUG },
    )

    // =====================
    // REPORT
    // =====================

    console.log('\n' + '='.repeat(60))
    console.log('  FINAL GRAPH STATE REPORT — caso-dictadura')
    console.log('  Wave 24: Final Consolidation')
    console.log('  ' + new Date().toISOString())
    console.log('='.repeat(60))

    console.log(`\n  Total nodes:         ${totalNodes.toLocaleString()}`)
    console.log(`  Total edges:         ${totalEdges.toLocaleString()}`)
    console.log(`  Isolated nodes:      ${isolated}`)
    console.log(`  Avg degree:          ${typeof avgDeg === 'number' ? avgDeg.toFixed(2) : 'N/A'}`)
    console.log(`  Max degree:          ${maxDeg}`)

    console.log('\n  Nodes by type:')
    for (const r of labelResult.records) {
      const label = r.get('label') as string
      const count = toNumber(r.get('count'))
      const pct = ((count / totalNodes) * 100).toFixed(1)
      console.log(`    ${label.padEnd(30)} ${count.toLocaleString().padStart(6)} (${pct}%)`)
    }

    console.log('\n  Nodes by tier:')
    let goldCount = 0, silverCount = 0, bronzeCount = 0
    for (const r of tierResult.records) {
      const tier = r.get('tier') as string
      const count = toNumber(r.get('count'))
      const pct = ((count / totalNodes) * 100).toFixed(1)
      console.log(`    ${tier.padEnd(10)} ${count.toLocaleString().padStart(6)} (${pct}%)`)
      if (tier === 'gold') goldCount = count
      if (tier === 'silver') silverCount = count
      if (tier === 'bronze') bronzeCount = count
    }

    console.log('\n  Edge types:')
    for (const r of edgeTypes.records) {
      const type = r.get('type') as string
      const count = toNumber(r.get('count'))
      console.log(`    ${type.padEnd(35)} ${count.toLocaleString().padStart(6)}`)
    }

    console.log('\n  Top 15 most connected nodes:')
    for (const r of topNodes.records) {
      const name = r.get('name') as string
      const label = r.get('label') as string
      const degree = toNumber(r.get('degree'))
      const tier = r.get('tier') as string
      console.log(`    ${name.padEnd(40)} [${label}] degree=${degree} ${tier}`)
    }

    // Phase 5: Quality score
    console.log('\n' + '-'.repeat(60))
    console.log('  QUALITY SCORE')
    console.log('-'.repeat(60))

    const goldPct = totalNodes > 0 ? ((goldCount / totalNodes) * 100) : 0
    const silverPct = totalNodes > 0 ? ((silverCount / totalNodes) * 100) : 0
    const bronzePct = totalNodes > 0 ? ((bronzeCount / totalNodes) * 100) : 0
    const verifiedPct = totalNodes > 0 ? (((goldCount + silverCount) / totalNodes) * 100) : 0

    // Weighted quality: gold=3, silver=2, bronze=1
    const qualityScore = totalNodes > 0
      ? (((goldCount * 3 + silverCount * 2 + bronzeCount * 1) / (totalNodes * 3)) * 100)
      : 0

    const avgRelsPerNode = typeof avgDeg === 'number' ? avgDeg : 0
    const connectivityScore = Math.min(100, (avgRelsPerNode / 5) * 100)

    // Combined score: 60% quality, 40% connectivity
    const overallScore = qualityScore * 0.6 + connectivityScore * 0.4

    console.log(`\n  Gold:                ${goldCount} (${goldPct.toFixed(1)}%)`)
    console.log(`  Silver:              ${silverCount} (${silverPct.toFixed(1)}%)`)
    console.log(`  Bronze:              ${bronzeCount} (${bronzePct.toFixed(1)}%)`)
    console.log(`  Verified (G+S):      ${goldCount + silverCount} (${verifiedPct.toFixed(1)}%)`)
    console.log(`  Avg rels/node:       ${avgRelsPerNode.toFixed(2)}`)
    console.log(`  Isolated:            ${isolated}`)
    console.log()
    console.log(`  Quality score:       ${qualityScore.toFixed(1)}% (tier weighting)`)
    console.log(`  Connectivity score:  ${connectivityScore.toFixed(1)}% (avg degree / 5)`)
    console.log(`  Overall score:       ${overallScore.toFixed(1)}% (60% quality + 40% connectivity)`)
    console.log()

    if (overallScore >= 70) {
      console.log('  Assessment: GOOD — Graph is well-structured with high verification rate')
    } else if (overallScore >= 50) {
      console.log('  Assessment: FAIR — Graph has reasonable structure, more verification needed')
    } else {
      console.log('  Assessment: NEEDS WORK — Many nodes unverified or poorly connected')
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  process.env.NEO4J_QUERY_TIMEOUT_MS = '180000'

  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j')
    process.exit(1)
  }
  console.log('Connected to Neo4j\n')
  console.log('=== Wave 24: Final Consolidation ===\n')

  // Phase 1: Remove orphan nodes
  console.log('--- Phase 1: Removing Orphan Nodes ---')
  const { removed, preserved } = await removeOrphanNodes()
  console.log(`  Removed ${removed} orphan bronze/unset nodes`)
  console.log(`  Preserved ${preserved} orphan gold/silver nodes`)

  // Phase 2: Dedup sweep
  console.log('\n--- Phase 2: Dedup Sweep ---')
  const dups = await findDuplicates()
  console.log(`  Found ${dups.length} potential duplicate pairs`)
  if (dups.length > 0) {
    console.log('  Sample duplicates:')
    for (const dup of dups.slice(0, 10)) {
      console.log(`    "${dup.name1}" ≈ "${dup.name2}" (slug: ${dup.slug})`)
    }
    const merged = await mergeDuplicates(dups)
    console.log(`  Merged ${merged} duplicate pairs`)
  }

  // Phase 3: Promote verified bronze
  console.log('\n--- Phase 3: Promoting Verified Bronze Nodes ---')
  const promoted = await promoteVerifiedBronze()
  console.log(`  Promoted ${promoted} bronze nodes to silver`)

  // Phase 4 & 5: Final report with quality score
  console.log('\n--- Phase 4 & 5: Final Report & Quality Score ---')
  await generateFinalReport()

  // Summary
  console.log('\n=== Wave 24 Summary ===')
  console.log(`  Orphans removed:     ${removed}`)
  console.log(`  Duplicates merged:   ${dups.length > 0 ? 'yes' : 'none found'}`)
  console.log(`  Nodes promoted:      ${promoted}`)
  console.log('  Final report:        generated')
  console.log('  Quality score:       generated')

  await closeDriver()
  console.log('\nWave 24 complete!')
  console.log('\n=== Enrichment pipeline (Waves 15-24) finished ===')
}

main().catch((err) => {
  console.error('Wave 24 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
