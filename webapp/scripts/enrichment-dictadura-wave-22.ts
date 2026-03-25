/**
 * Wave 22: Graph Statistics Update
 *
 * Final statistics and data file updates:
 *   1. Query final graph state: nodes by type/tier, edges by type
 *   2. Update investigation-data.ts IMPACT_STATS with current numbers
 *   3. Update CasoLandingContent.tsx DICTADURA_STATS with current numbers
 *   4. Generate final statistics report
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-22.ts
 */

import neo4j from 'neo4j-driver-lite'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 22

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Phase 1: Query comprehensive graph state
// ---------------------------------------------------------------------------

interface GraphState {
  totalNodes: number
  totalEdges: number
  nodesByLabel: Array<{ label: string; count: number }>
  nodesByTier: Array<{ tier: string; count: number }>
  edgesByType: Array<{ type: string; count: number }>
  personaCount: number
  ccdCount: number
  eventoCount: number
  causaCount: number
  sentenciaCount: number
  documentoCount: number
  tribunalCount: number
  lugarCount: number
  avgDegree: number
  maxDegree: number
  isolatedNodes: number
}

async function queryGraphState(): Promise<GraphState> {
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
    const nodesByLabel = labelResult.records.map((r) => ({
      label: r.get('label') as string,
      count: toNumber(r.get('count')),
    }))

    // Nodes by tier
    const tierResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN coalesce(n.confidence_tier, 'unset') AS tier, count(n) AS count ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )
    const nodesByTier = tierResult.records.map((r) => ({
      tier: r.get('tier') as string,
      count: toNumber(r.get('count')),
    }))

    // Edges by type
    const edgeTypeResult = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug OR b.caso_slug = $casoSlug OR r.caso_slug = $casoSlug
       RETURN type(r) AS type, count(r) AS count ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )
    const edgesByType = edgeTypeResult.records.map((r) => ({
      type: r.get('type') as string,
      count: toNumber(r.get('count')),
    }))

    // Individual label counts
    const getCount = (label: string) =>
      nodesByLabel.find((n) => n.label === label)?.count || 0

    // Average and max degree
    const degreeResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       OPTIONAL MATCH (n)-[r]-()
       WITH n, count(r) AS degree
       RETURN avg(degree) AS avgDeg, max(degree) AS maxDeg`,
      { casoSlug: CASO_SLUG },
    )
    const avgDeg = degreeResult.records[0]?.get('avgDeg')
    const avgDegree = typeof avgDeg === 'number' ? avgDeg : 0

    // Isolated nodes
    const isolatedResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND NOT (n)-[]-()
       RETURN count(n) AS total`,
      { casoSlug: CASO_SLUG },
    )

    return {
      totalNodes,
      totalEdges,
      nodesByLabel,
      nodesByTier,
      edgesByType,
      personaCount: getCount('DictaduraPersona'),
      ccdCount: getCount('DictaduraCCD'),
      eventoCount: getCount('DictaduraEvento'),
      causaCount: getCount('DictaduraCausa'),
      sentenciaCount: getCount('DictaduraSentencia'),
      documentoCount: getCount('DictaduraDocumento'),
      tribunalCount: getCount('DictaduraTribunal'),
      lugarCount: getCount('DictaduraLugar'),
      avgDegree,
      maxDegree: toNumber(degreeResult.records[0]?.get('maxDeg')),
      isolatedNodes: toNumber(isolatedResult.records[0]?.get('total')),
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Update investigation-data.ts
// ---------------------------------------------------------------------------

function updateInvestigationData(state: GraphState): boolean {
  const filePath = path.resolve(
    __dirname,
    '../src/lib/caso-dictadura/investigation-data.ts',
  )

  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Check if graph stats already exist (from wave 17)
    if (content.includes('OA caso-dictadura graph')) {
      console.log('  Investigation data already has graph stats (from previous waves)')
      console.log('  Skipping to avoid duplicates')
      return false
    }

    // Add graph statistics as new IMPACT_STATS entries
    const newStats = `
  {
    value: '${state.totalNodes.toLocaleString()}',
    label_en: 'Total nodes in investigation graph',
    label_es: 'Total de nodos en el grafo de investigacion',
    source: 'OA caso-dictadura graph — Wave 22 statistics',
  },
  {
    value: '${state.totalEdges.toLocaleString()}',
    label_en: 'Total relationships mapped in graph',
    label_es: 'Total de relaciones mapeadas en el grafo',
    source: 'OA caso-dictadura graph — Wave 22 statistics',
  },
  {
    value: '${state.personaCount.toLocaleString()}',
    label_en: 'Individual persons documented in graph',
    label_es: 'Personas individuales documentadas en el grafo',
    source: 'OA caso-dictadura graph — Wave 22 statistics',
  },
  {
    value: '${state.ccdCount}',
    label_en: 'Clandestine detention centers mapped',
    label_es: 'Centros clandestinos de detencion mapeados',
    source: 'OA caso-dictadura graph — Wave 22 statistics',
  },`

    const marker = ']\n\n// ---------------------------------------------------------------------------\n// JUDICIAL_RESPONSES'
    if (content.includes(marker)) {
      const updated = content.replace(
        marker,
        `${newStats}\n]\n\n// ---------------------------------------------------------------------------\n// JUDICIAL_RESPONSES`,
      )
      fs.writeFileSync(filePath, updated, 'utf-8')
      console.log('  Updated investigation-data.ts with graph statistics')
      return true
    } else {
      console.log('  WARNING: Could not find insertion point in investigation-data.ts')
      return false
    }
  } catch (err) {
    console.error('  ERROR updating investigation-data.ts:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Update CasoLandingContent.tsx
// ---------------------------------------------------------------------------

function updateLandingContent(state: GraphState): boolean {
  const filePath = path.resolve(
    __dirname,
    '../src/app/caso/[slug]/CasoLandingContent.tsx',
  )

  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Find and replace DICTADURA_STATS
    const statsRegex = /const DICTADURA_STATS = \[[\s\S]*?\] as const/
    const match = content.match(statsRegex)

    if (!match) {
      console.log('  WARNING: Could not find DICTADURA_STATS in CasoLandingContent.tsx')
      return false
    }

    const relsCount = state.totalEdges
    const newStats = `const DICTADURA_STATS = [
  { value: ${state.personaCount}, label: 'Personas', color: '#facc15' },
  { value: ${state.ccdCount}, label: 'Centros clandestinos', color: '#facc15' },
  { value: ${state.eventoCount}, label: 'Eventos clave', color: '#facc15' },
  { value: ${state.causaCount}, label: 'Causas judiciales', color: '#facc15' },
  { value: ${relsCount}, label: 'Relaciones mapeadas' },
] as const`

    const updated = content.replace(statsRegex, newStats)
    fs.writeFileSync(filePath, updated, 'utf-8')
    console.log('  Updated CasoLandingContent.tsx DICTADURA_STATS')
    console.log(`    Personas: ${state.personaCount}`)
    console.log(`    CCDs: ${state.ccdCount}`)
    console.log(`    Eventos: ${state.eventoCount}`)
    console.log(`    Causas: ${state.causaCount}`)
    console.log(`    Relaciones: ${relsCount}`)
    return true
  } catch (err) {
    console.error('  ERROR updating CasoLandingContent.tsx:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Generate report
// ---------------------------------------------------------------------------

function generateReport(state: GraphState): void {
  console.log('\n========================================')
  console.log('  GRAPH STATISTICS REPORT')
  console.log('  caso-dictadura')
  console.log('  Generated: ' + new Date().toISOString())
  console.log('========================================\n')

  console.log(`  Total nodes:         ${state.totalNodes.toLocaleString()}`)
  console.log(`  Total edges:         ${state.totalEdges.toLocaleString()}`)
  console.log(`  Isolated nodes:      ${state.isolatedNodes}`)
  console.log(`  Avg degree:          ${state.avgDegree.toFixed(2)}`)
  console.log(`  Max degree:          ${state.maxDegree}`)

  const density = state.totalNodes > 1
    ? ((2 * state.totalEdges) / (state.totalNodes * (state.totalNodes - 1)) * 100)
    : 0
  console.log(`  Graph density:       ${density.toFixed(4)}%`)

  console.log('\n  Nodes by type:')
  for (const { label, count } of state.nodesByLabel) {
    const pct = ((count / state.totalNodes) * 100).toFixed(1)
    console.log(`    ${label.padEnd(30)} ${count.toLocaleString().padStart(6)} (${pct}%)`)
  }

  console.log('\n  Nodes by confidence tier:')
  for (const { tier, count } of state.nodesByTier) {
    const pct = ((count / state.totalNodes) * 100).toFixed(1)
    console.log(`    ${tier.padEnd(10)} ${count.toLocaleString().padStart(6)} (${pct}%)`)
  }

  console.log('\n  Edges by type:')
  for (const { type, count } of state.edgesByType) {
    const pct = ((count / state.totalEdges) * 100).toFixed(1)
    console.log(`    ${type.padEnd(35)} ${count.toLocaleString().padStart(6)} (${pct}%)`)
  }

  // Quality score
  const goldCount = state.nodesByTier.find((t) => t.tier === 'gold')?.count || 0
  const silverCount = state.nodesByTier.find((t) => t.tier === 'silver')?.count || 0
  const qualityScore = state.totalNodes > 0
    ? (((goldCount * 3 + silverCount * 2) / (state.totalNodes * 3)) * 100)
    : 0

  console.log('\n  Quality Metrics:')
  console.log(`    Gold nodes:        ${goldCount} (${state.totalNodes > 0 ? ((goldCount / state.totalNodes) * 100).toFixed(1) : 0}%)`)
  console.log(`    Silver nodes:      ${silverCount} (${state.totalNodes > 0 ? ((silverCount / state.totalNodes) * 100).toFixed(1) : 0}%)`)
  console.log(`    Quality score:     ${qualityScore.toFixed(1)}%`)
  console.log(`    Avg rels/node:     ${state.avgDegree.toFixed(2)}`)
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
  console.log('=== Wave 22: Graph Statistics Update ===\n')

  // Phase 1: Query graph state
  console.log('--- Phase 1: Querying Graph State ---')
  const state = await queryGraphState()
  console.log(`  Total nodes: ${state.totalNodes.toLocaleString()}`)
  console.log(`  Total edges: ${state.totalEdges.toLocaleString()}`)

  // Phase 2: Update investigation-data.ts
  console.log('\n--- Phase 2: Updating Investigation Data ---')
  updateInvestigationData(state)

  // Phase 3: Update CasoLandingContent.tsx
  console.log('\n--- Phase 3: Updating Landing Page Stats ---')
  updateLandingContent(state)

  // Phase 4: Generate report
  console.log('\n--- Phase 4: Final Statistics Report ---')
  generateReport(state)

  // Summary
  console.log('\n=== Wave 22 Summary ===')
  console.log(`  Nodes: ${state.totalNodes.toLocaleString()}`)
  console.log(`  Edges: ${state.totalEdges.toLocaleString()}`)
  console.log(`  Node types: ${state.nodesByLabel.length}`)
  console.log(`  Edge types: ${state.edgesByType.length}`)

  await closeDriver()
  console.log('\nWave 22 complete!')
}

main().catch((err) => {
  console.error('Wave 22 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
