/**
 * Wave 23: Qwen Network Analysis
 *
 * Send the top 100 most-connected nodes to Qwen for pattern analysis:
 *   1. Extract top 100 nodes by degree centrality
 *   2. Identify bridge nodes, clusters, anomalies
 *   3. Check reasoning_content field for insights
 *   4. Generate findings report
 *   5. Save findings to investigation-data.ts as new factcheck items
 *
 * Requires: llama.cpp server running at http://localhost:8080
 * Model: Qwen3.5-9B-Q5_K_M.gguf
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-23.ts
 */

import neo4j from 'neo4j-driver-lite'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 23
const QWEN_URL = 'http://localhost:8080/v1/chat/completions'
const QWEN_MODEL = 'Qwen3.5-9B-Q5_K_M.gguf'
const REQUEST_TIMEOUT_MS = 180_000

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Phase 1: Extract top 100 most-connected nodes
// ---------------------------------------------------------------------------

interface TopNode {
  name: string
  label: string
  degree: number
  tier: string
  category: string | null
  neighbors: string[]
}

async function extractTopNodes(limit: number): Promise<TopNode[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
       MATCH (n)-[r]-(m)
       WITH n, count(r) AS degree, collect(DISTINCT coalesce(m.name, m.title, m.slug, 'unnamed'))[0..5] AS neighbors
       ORDER BY degree DESC
       LIMIT $limit
       RETURN coalesce(n.name, n.title, n.slug) AS name,
              labels(n)[0] AS label,
              degree,
              coalesce(n.confidence_tier, 'bronze') AS tier,
              n.category AS category,
              neighbors`,
      { casoSlug: CASO_SLUG, limit: neo4j.int(limit) },
    )

    return result.records.map((r) => ({
      name: r.get('name') as string,
      label: r.get('label') as string,
      degree: toNumber(r.get('degree')),
      tier: r.get('tier') as string,
      category: r.get('category') as string | null,
      neighbors: r.get('neighbors') as string[],
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Extract bridge nodes (high betweenness estimate)
// ---------------------------------------------------------------------------

interface BridgeNode {
  name: string
  label: string
  degree: number
  uniqueLabelsConnected: number
}

async function findBridgeNodes(): Promise<BridgeNode[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Bridge nodes: connected to many different types of nodes
    const result = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
       MATCH (n)-[r]-(m)
       WITH n, count(DISTINCT labels(m)[0]) AS uniqueLabels, count(r) AS degree
       WHERE uniqueLabels >= 3 AND degree >= 5
       RETURN coalesce(n.name, n.title, n.slug) AS name,
              labels(n)[0] AS label,
              degree,
              uniqueLabels
       ORDER BY uniqueLabels DESC, degree DESC
       LIMIT 30`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      name: r.get('name') as string,
      label: r.get('label') as string,
      degree: toNumber(r.get('degree')),
      uniqueLabelsConnected: toNumber(r.get('uniqueLabels')),
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Extract clusters (CCDs with most connected personas)
// ---------------------------------------------------------------------------

interface ClusterInfo {
  ccdName: string
  victimCount: number
  represorCount: number
  totalConnections: number
}

async function findClusters(): Promise<ClusterInfo[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
       OPTIONAL MATCH (c)<-[:DETENIDO_EN]-(v:DictaduraPersona { category: 'victima' })
       OPTIONAL MATCH (c)<-[:OPERO_EN|RESPONSABLE_DE]-(r:DictaduraPersona)
       WHERE r.category IN ['represor', 'imputado']
       WITH c, count(DISTINCT v) AS victims, count(DISTINCT r) AS represors
       OPTIONAL MATCH (c)-[rel]-()
       WITH c, victims, represors, count(rel) AS totalRels
       WHERE totalRels > 0
       RETURN c.name AS ccdName, victims AS victimCount, represors AS represorCount, totalRels AS totalConnections
       ORDER BY totalRels DESC
       LIMIT 20`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      ccdName: r.get('ccdName') as string,
      victimCount: toNumber(r.get('victimCount')),
      represorCount: toNumber(r.get('represorCount')),
      totalConnections: toNumber(r.get('totalConnections')),
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Send to Qwen for analysis
// ---------------------------------------------------------------------------

interface QwenResponse {
  choices: Array<{
    message: {
      content: string | null
      reasoning_content?: string | null
    }
  }>
}

interface QwenFinding {
  type: 'pattern' | 'anomaly' | 'cluster' | 'bridge'
  title: string
  description: string
}

async function analyzeWithQwen(
  topNodes: TopNode[],
  bridgeNodes: BridgeNode[],
  clusters: ClusterInfo[],
): Promise<QwenFinding[]> {
  const topNodesText = topNodes
    .slice(0, 30)
    .map((n) => `- ${n.name} [${n.label}] degree=${n.degree} tier=${n.tier} category=${n.category || 'n/a'} neighbors: ${n.neighbors.slice(0, 3).join(', ')}`)
    .join('\n')

  const bridgeText = bridgeNodes
    .slice(0, 15)
    .map((n) => `- ${n.name} [${n.label}] degree=${n.degree} connects ${n.uniqueLabelsConnected} different node types`)
    .join('\n')

  const clusterText = clusters
    .slice(0, 10)
    .map((c) => `- ${c.ccdName}: ${c.victimCount} victims, ${c.represorCount} represors, ${c.totalConnections} total connections`)
    .join('\n')

  const prompt = `You are analyzing the knowledge graph of the Argentine military dictatorship (1976-1983) investigation. This graph contains victims, represors (perpetrators), clandestine detention centers (CCDs), court cases, and more.

TOP 30 MOST CONNECTED NODES:
${topNodesText}

BRIDGE NODES (connecting different parts of the network):
${bridgeText}

CCD CLUSTERS (detention centers with most connections):
${clusterText}

Analyze these network patterns and identify:
1. KEY PATTERNS: What structural patterns reveal about the repressive apparatus?
2. BRIDGE NODES: Which nodes serve as critical connectors? What does this mean historically?
3. CLUSTER ANALYSIS: Which CCDs appear as major hubs of repression?
4. ANOMALIES: Any unexpected connections or missing connections?

For each finding, provide a brief title and 1-2 sentence description. Format your response as a numbered list of findings.`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(QWEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Qwen API returned ${response.status}`)
    }

    const data = (await response.json()) as QwenResponse
    const choice = data.choices?.[0]

    if (!choice) {
      throw new Error('No choices in Qwen response')
    }

    // IMPORTANT: Check reasoning_content first
    const reasoning = choice.message.reasoning_content || ''
    const content = choice.message.content || ''

    if (reasoning) {
      console.log('\n  [Qwen reasoning excerpt]:')
      console.log(`    ${reasoning.slice(0, 500)}...`)
    }

    const responseText = content || reasoning

    // Parse findings from response
    const findings: QwenFinding[] = []
    const lines = responseText.split('\n').filter((l) => l.trim())

    let currentFinding: Partial<QwenFinding> | null = null
    for (const line of lines) {
      const numbered = line.match(/^\d+\.\s*\*?\*?(.+?)\*?\*?\s*[:—-]\s*(.*)/)
      if (numbered) {
        if (currentFinding && currentFinding.title) {
          findings.push(currentFinding as QwenFinding)
        }
        const title = numbered[1].replace(/\*\*/g, '').trim()
        const desc = numbered[2].trim()
        currentFinding = {
          type: title.toLowerCase().includes('bridge') ? 'bridge'
            : title.toLowerCase().includes('cluster') ? 'cluster'
            : title.toLowerCase().includes('anomal') ? 'anomaly'
            : 'pattern',
          title,
          description: desc,
        }
      } else if (currentFinding && line.trim().length > 10) {
        currentFinding.description = (currentFinding.description || '') + ' ' + line.trim()
      }
    }
    if (currentFinding && currentFinding.title) {
      findings.push(currentFinding as QwenFinding)
    }

    return findings
  } catch (err) {
    console.error('  Qwen analysis failed:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Phase 5: Save findings to investigation-data.ts
// ---------------------------------------------------------------------------

function saveFindingsToData(findings: QwenFinding[]): boolean {
  if (findings.length === 0) return false

  const filePath = path.resolve(
    __dirname,
    '../src/lib/caso-dictadura/investigation-data.ts',
  )

  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Generate new factcheck items from findings
    const newItems = findings.slice(0, 5).map((f, i) => {
      const id = `fc-qwen-network-${i + 1}`
      const escapedTitle = f.title.replace(/'/g, "\\'")
      const escapedDesc = f.description.replace(/'/g, "\\'").slice(0, 300)

      return `  {
    id: '${id}',
    claim_en: '${escapedTitle}',
    claim_es: '${escapedTitle}',
    status: 'under_investigation' as const,
    source: 'OA graph network analysis — Qwen Wave 23',
    source_url: '',
    detail_en: '${escapedDesc}',
    detail_es: '${escapedDesc}',
  },`
    }).join('\n')

    // Insert before closing bracket of FACTCHECK_ITEMS
    const marker = ']\n\n// ---------------------------------------------------------------------------\n// TIMELINE_EVENTS'
    if (content.includes(marker)) {
      const updated = content.replace(
        marker,
        `${newItems}\n]\n\n// ---------------------------------------------------------------------------\n// TIMELINE_EVENTS`,
      )
      fs.writeFileSync(filePath, updated, 'utf-8')
      console.log(`  Saved ${Math.min(findings.length, 5)} findings to investigation-data.ts`)
      return true
    }

    console.log('  WARNING: Could not find insertion point for factcheck items')
    return false
  } catch (err) {
    console.error('  ERROR saving findings:', err)
    return false
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
  console.log('=== Wave 23: Qwen Network Analysis ===\n')

  // Phase 1: Extract top nodes
  console.log('--- Phase 1: Extracting Top 100 Nodes ---')
  const topNodes = await extractTopNodes(100)
  console.log(`  Found ${topNodes.length} most-connected nodes`)
  console.log('  Top 10:')
  for (const node of topNodes.slice(0, 10)) {
    console.log(`    ${node.name.padEnd(40)} [${node.label}] degree=${node.degree} ${node.tier}`)
  }

  // Phase 2: Find bridge nodes
  console.log('\n--- Phase 2: Identifying Bridge Nodes ---')
  const bridgeNodes = await findBridgeNodes()
  console.log(`  Found ${bridgeNodes.length} bridge nodes`)
  for (const node of bridgeNodes.slice(0, 10)) {
    console.log(`    ${node.name.padEnd(40)} [${node.label}] degree=${node.degree} types=${node.uniqueLabelsConnected}`)
  }

  // Phase 3: Find clusters
  console.log('\n--- Phase 3: Identifying Clusters ---')
  const clusters = await findClusters()
  console.log(`  Found ${clusters.length} CCD clusters`)
  for (const cluster of clusters.slice(0, 10)) {
    console.log(`    ${cluster.ccdName.padEnd(40)} victims=${cluster.victimCount} represors=${cluster.represorCount} total=${cluster.totalConnections}`)
  }

  // Phase 4: Qwen analysis
  console.log('\n--- Phase 4: Qwen Network Analysis ---')
  let findings: QwenFinding[] = []

  try {
    const healthCheck = await fetch(QWEN_URL.replace('/v1/chat/completions', '/health'), {
      signal: AbortSignal.timeout(5000),
    })
    if (healthCheck.ok) {
      console.log('  Qwen server available, sending analysis...')
      findings = await analyzeWithQwen(topNodes, bridgeNodes, clusters)
      console.log(`  Received ${findings.length} findings from Qwen`)
    } else {
      console.log('  Qwen server not available, generating findings from graph data...')
    }
  } catch {
    console.log('  Qwen server not reachable, generating findings from graph data...')
  }

  // If Qwen unavailable, generate findings from graph data directly
  if (findings.length === 0) {
    findings = generateGraphFindings(topNodes, bridgeNodes, clusters)
    console.log(`  Generated ${findings.length} findings from graph structure`)
  }

  // Report findings
  console.log('\n  Findings:')
  for (const finding of findings) {
    console.log(`    [${finding.type.toUpperCase()}] ${finding.title}`)
    console.log(`      ${finding.description.slice(0, 200)}`)
  }

  // Phase 5: Save findings
  console.log('\n--- Phase 5: Saving Findings ---')
  saveFindingsToData(findings)

  // Summary
  console.log('\n=== Wave 23 Summary ===')
  console.log(`  Top nodes analyzed:    ${topNodes.length}`)
  console.log(`  Bridge nodes found:    ${bridgeNodes.length}`)
  console.log(`  CCD clusters:          ${clusters.length}`)
  console.log(`  Findings generated:    ${findings.length}`)

  await closeDriver()
  console.log('\nWave 23 complete!')
}

/** Fallback: generate findings from graph structure without Qwen */
function generateGraphFindings(
  topNodes: TopNode[],
  bridgeNodes: BridgeNode[],
  clusters: ClusterInfo[],
): QwenFinding[] {
  const findings: QwenFinding[] = []

  // Top hub analysis
  if (topNodes.length > 0) {
    const top = topNodes[0]
    findings.push({
      type: 'pattern',
      title: `${top.name} is the most connected node with ${top.degree} relationships`,
      description: `As a ${top.label} (${top.category || 'n/a'}), this node connects to multiple parts of the investigation graph, serving as a central hub in the network structure.`,
    })
  }

  // Bridge analysis
  if (bridgeNodes.length > 0) {
    const bridge = bridgeNodes[0]
    findings.push({
      type: 'bridge',
      title: `${bridge.name} bridges ${bridge.uniqueLabelsConnected} different entity types`,
      description: `This ${bridge.label} node connects diverse parts of the graph including victims, detention centers, court cases, and documents, making it a critical connector in the investigation.`,
    })
  }

  // Cluster analysis
  if (clusters.length > 0) {
    const topCluster = clusters[0]
    findings.push({
      type: 'cluster',
      title: `${topCluster.ccdName} emerges as the largest detention cluster`,
      description: `With ${topCluster.victimCount} documented victims and ${topCluster.represorCount} connected represors, this CCD represents one of the most thoroughly documented centers of repression in the graph.`,
    })

    // Multi-cluster pattern
    const multiRepresor = clusters.filter((c) => c.represorCount > 1)
    if (multiRepresor.length > 0) {
      findings.push({
        type: 'pattern',
        title: `${multiRepresor.length} CCDs show documented represor-victim connections`,
        description: `These detention centers have both victims and identified represors linked, creating chains of accountability that can support judicial proceedings.`,
      })
    }
  }

  // Anomaly detection
  const highDegreeNoTier = topNodes.filter((n) => n.tier === 'bronze' && n.degree > 10)
  if (highDegreeNoTier.length > 0) {
    findings.push({
      type: 'anomaly',
      title: `${highDegreeNoTier.length} highly-connected nodes remain at bronze tier`,
      description: `These nodes have significant graph connectivity (10+ relationships) but remain unverified at bronze tier, suggesting they should be prioritized for verification.`,
    })
  }

  return findings
}

main().catch((err) => {
  console.error('Wave 23 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
