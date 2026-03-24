/**
 * Wave 13: Narrative Generation
 *
 * Consolidation pass over existing caso-dictadura graph data:
 *   1. Query comprehensive graph stats
 *   2. Use the local Qwen LLM at http://localhost:8080/v1/chat/completions
 *   3. Send graph summary data to Qwen, ask for 7 chapter outlines in Spanish
 *   4. Write the narrative to docs/investigations/NARRATIVE-DICTADURA.md
 *
 * IMPORTANT: Qwen 3.5 uses mandatory thinking mode — check reasoning_content, not just content
 * Model: Qwen3.5-9B-Q5_K_M.gguf, temperature 0.3, max_tokens 4096
 *
 * Run with: npx tsx scripts/consolidate-dictadura-wave-13.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CASO_SLUG = 'caso-dictadura'
const WAVE = 13

const MIROFISH_URL = process.env.MIROFISH_API_URL || 'http://localhost:8080'
const QWEN_MODEL = 'Qwen3.5-9B-Q5_K_M.gguf'

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Phase 1: Comprehensive graph statistics
// ---------------------------------------------------------------------------

interface GraphStats {
  totalNodes: number
  totalEdges: number
  nodesByLabel: Array<{ label: string; count: number }>
  edgesByType: Array<{ type: string; count: number }>
  victimCount: number
  represorCount: number
  ccdCount: number
  causaCount: number
  unitCount: number
  orgCount: number
  docCount: number
  tierDistribution: Array<{ tier: string; count: number }>
  waveDistribution: Array<{ wave: number; count: number }>
  topCCDs: Array<{ name: string; victimCount: number }>
  topRepresors: Array<{ name: string; connectionCount: number }>
  nationalityBreakdown: Array<{ nationality: string; count: number }>
  yearRange: { min: number; max: number }
  provinceDistribution: Array<{ province: string; count: number }>
}

async function queryGraphStats(): Promise<GraphStats> {
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

    // Specific counts
    const counts = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN
         sum(CASE WHEN n:DictaduraPersona AND n.role IN ['victima', 'detenido-desaparecido', 'asesinado'] THEN 1 ELSE 0 END) AS victims,
         sum(CASE WHEN n:DictaduraPersona AND n.role IN ['represor', 'militar', 'policia', 'inteligencia'] THEN 1 ELSE 0 END) AS represors,
         sum(CASE WHEN n:DictaduraCCD THEN 1 ELSE 0 END) AS ccds,
         sum(CASE WHEN n:DictaduraCausa THEN 1 ELSE 0 END) AS causas,
         sum(CASE WHEN n:DictaduraUnidadMilitar THEN 1 ELSE 0 END) AS units,
         sum(CASE WHEN n:DictaduraOrganizacion THEN 1 ELSE 0 END) AS orgs,
         sum(CASE WHEN n:DictaduraDocumento THEN 1 ELSE 0 END) AS docs`,
      { casoSlug: CASO_SLUG },
    )
    const c = counts.records[0]

    // Tier distribution
    const tierResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.confidence_tier IS NOT NULL
       RETURN n.confidence_tier AS tier, count(n) AS count ORDER BY tier`,
      { casoSlug: CASO_SLUG },
    )
    const tierDistribution = tierResult.records.map((r) => ({
      tier: r.get('tier') as string,
      count: toNumber(r.get('count')),
    }))

    // Wave distribution
    const waveResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.ingestion_wave IS NOT NULL
       RETURN n.ingestion_wave AS wave, count(n) AS count ORDER BY wave`,
      { casoSlug: CASO_SLUG },
    )
    const waveDistribution = waveResult.records.map((r) => ({
      wave: toNumber(r.get('wave')),
      count: toNumber(r.get('count')),
    }))

    // Top CCDs by victim count
    const ccdResult = await session.run(
      `MATCH (c:DictaduraCCD)<-[:DETENIDO_EN]-(p:DictaduraPersona)
       WHERE c.caso_slug = $casoSlug
       RETURN c.name AS name, count(p) AS victimCount
       ORDER BY victimCount DESC LIMIT 10`,
      { casoSlug: CASO_SLUG },
    )
    const topCCDs = ccdResult.records.map((r) => ({
      name: r.get('name') as string,
      victimCount: toNumber(r.get('victimCount')),
    }))

    // Top represors by connections
    const represorResult = await session.run(
      `MATCH (p:DictaduraPersona)-[r]-(other)
       WHERE p.caso_slug = $casoSlug
         AND p.role IN ['represor', 'militar', 'policia', 'inteligencia']
       RETURN p.name AS name, count(r) AS connectionCount
       ORDER BY connectionCount DESC LIMIT 10`,
      { casoSlug: CASO_SLUG },
    )
    const topRepresors = represorResult.records.map((r) => ({
      name: r.get('name') as string,
      connectionCount: toNumber(r.get('connectionCount')),
    }))

    // Nationality breakdown
    const natResult = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.nationality IS NOT NULL OR p.nacionalidad IS NOT NULL)
       RETURN coalesce(p.nationality, p.nacionalidad) AS nationality, count(p) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )
    const nationalityBreakdown = natResult.records.map((r) => ({
      nationality: r.get('nationality') as string,
      count: toNumber(r.get('count')),
    }))

    // Province distribution (from location data)
    const provResult = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.province IS NOT NULL OR p.provincia IS NOT NULL)
       RETURN coalesce(p.province, p.provincia) AS province, count(p) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )
    const provinceDistribution = provResult.records.map((r) => ({
      province: r.get('province') as string,
      count: toNumber(r.get('count')),
    }))

    return {
      totalNodes,
      totalEdges,
      nodesByLabel,
      edgesByType,
      victimCount: toNumber(c?.get('victims')),
      represorCount: toNumber(c?.get('represors')),
      ccdCount: toNumber(c?.get('ccds')),
      causaCount: toNumber(c?.get('causas')),
      unitCount: toNumber(c?.get('units')),
      orgCount: toNumber(c?.get('orgs')),
      docCount: toNumber(c?.get('docs')),
      tierDistribution,
      waveDistribution,
      topCCDs,
      topRepresors,
      nationalityBreakdown,
      yearRange: { min: 1974, max: 1983 },
      provinceDistribution,
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Generate narrative via Qwen LLM
// ---------------------------------------------------------------------------

function buildGraphSummaryPrompt(stats: GraphStats): string {
  let summary = `Estadísticas del grafo de conocimiento sobre la dictadura cívico-militar argentina (1976-1983):\n\n`

  summary += `Total de nodos: ${stats.totalNodes}\n`
  summary += `Total de aristas: ${stats.totalEdges}\n\n`

  summary += `Nodos por tipo:\n`
  for (const { label, count } of stats.nodesByLabel) {
    summary += `  - ${label}: ${count}\n`
  }

  summary += `\nVíctimas: ${stats.victimCount}\n`
  summary += `Represores: ${stats.represorCount}\n`
  summary += `Centros Clandestinos de Detención (CCD): ${stats.ccdCount}\n`
  summary += `Causas judiciales: ${stats.causaCount}\n`
  summary += `Unidades militares: ${stats.unitCount}\n`
  summary += `Organizaciones: ${stats.orgCount}\n`
  summary += `Documentos: ${stats.docCount}\n`

  summary += `\nDistribución por tier de confianza:\n`
  for (const { tier, count } of stats.tierDistribution) {
    summary += `  - ${tier}: ${count}\n`
  }

  if (stats.topCCDs.length > 0) {
    summary += `\nPrincipales CCD por cantidad de víctimas vinculadas:\n`
    for (const { name, victimCount } of stats.topCCDs) {
      summary += `  - ${name}: ${victimCount} víctimas\n`
    }
  }

  if (stats.topRepresors.length > 0) {
    summary += `\nRepresores con más conexiones en el grafo:\n`
    for (const { name, connectionCount } of stats.topRepresors) {
      summary += `  - ${name}: ${connectionCount} conexiones\n`
    }
  }

  if (stats.nationalityBreakdown.length > 0) {
    summary += `\nVíctimas por nacionalidad:\n`
    for (const { nationality, count } of stats.nationalityBreakdown) {
      summary += `  - ${nationality}: ${count}\n`
    }
  }

  summary += `\nTipos de relaciones:\n`
  for (const { type, count } of stats.edgesByType) {
    summary += `  - ${type}: ${count}\n`
  }

  return summary
}

interface QwenResponse {
  choices: Array<{
    message: {
      content: string | null
      reasoning_content?: string | null
    }
  }>
}

async function generateNarrative(stats: GraphStats): Promise<string> {
  const graphSummary = buildGraphSummaryPrompt(stats)

  const systemPrompt = `Sos un investigador de derechos humanos especializado en la dictadura cívico-militar argentina (1976-1983). Tu tarea es generar esquemas detallados para capítulos de una investigación basada en un grafo de conocimiento. Escribí en español formal pero accesible. Usá datos concretos del grafo cuando estén disponibles.`

  const userPrompt = `A partir de los siguientes datos de un grafo de conocimiento sobre la dictadura cívico-militar argentina, generá esquemas detallados para 7 capítulos de investigación.

${graphSummary}

Los 7 capítulos deben ser:

1. **El Aparato** — La estructura militar represiva: cadena de mando, fuerzas armadas, unidades, zonas represivas
2. **Las Víctimas** — Demografía de las víctimas: cantidad, distribución geográfica, temporal, perfiles
3. **La Justicia** — Los juicios de lesa humanidad: causas, sentencias, condenados, absueltos
4. **Lo Internacional** — Plan Cóndor: cooperación represiva transnacional, agencias de inteligencia, víctimas extranjeras
5. **La Complicidad Civil** — Complicidad empresarial: Ford, Mercedes-Benz, Acindar, Ledesma, relaciones empresa-militar
6. **Identidad Genética** — Los nietos restituidos: Abuelas de Plaza de Mayo, banco genético, identidades recuperadas
7. **Memoria y Verdad** — Los archivos: documentos, sentencias, actas de junta, archivos de defensa, preservación

Para cada capítulo incluí:
- Título y subtítulo
- 5-7 secciones con sus temas principales
- Datos clave del grafo que sustentan cada sección
- Preguntas de investigación abiertas
- Fuentes primarias relevantes

Formato: Markdown con encabezados jerárquicos.`

  console.log('  Sending request to Qwen LLM...')
  console.log(`  URL: ${MIROFISH_URL}/v1/chat/completions`)
  console.log(`  Model: ${QWEN_MODEL}`)

  const response = await fetch(`${MIROFISH_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: QWEN_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Qwen API error ${response.status}: ${errorText}`)
  }

  const data = (await response.json()) as QwenResponse
  const choice = data.choices?.[0]

  if (!choice) {
    throw new Error('No response choices from Qwen')
  }

  // IMPORTANT: Qwen 3.5 uses mandatory thinking mode
  // The actual content is in `content`, but reasoning is in `reasoning_content`
  const reasoning = choice.message.reasoning_content
  const content = choice.message.content

  if (reasoning) {
    console.log(`  Qwen reasoning length: ${reasoning.length} chars`)
  }

  if (!content || content.trim().length === 0) {
    throw new Error('Qwen returned empty content. Check if reasoning_content has the response instead.')
  }

  console.log(`  Qwen response length: ${content.length} chars`)

  return content
}

// ---------------------------------------------------------------------------
// Phase 3: Write narrative document
// ---------------------------------------------------------------------------

function buildNarrativeDocument(stats: GraphStats, llmNarrative: string): string {
  const now = new Date().toISOString().split('T')[0]

  let doc = `# Caso Dictadura — Narrativa de Investigación\n\n`
  doc += `> Generado automáticamente el ${now} a partir del grafo de conocimiento.\n`
  doc += `> Fuente: ${stats.totalNodes} nodos, ${stats.totalEdges} aristas en caso-dictadura.\n\n`
  doc += `---\n\n`

  // Stats overview
  doc += `## Resumen del Grafo\n\n`
  doc += `| Métrica | Valor |\n`
  doc += `|---------|-------|\n`
  doc += `| Nodos totales | ${stats.totalNodes.toLocaleString()} |\n`
  doc += `| Aristas totales | ${stats.totalEdges.toLocaleString()} |\n`
  doc += `| Víctimas | ${stats.victimCount.toLocaleString()} |\n`
  doc += `| Represores | ${stats.represorCount.toLocaleString()} |\n`
  doc += `| CCDs | ${stats.ccdCount.toLocaleString()} |\n`
  doc += `| Causas judiciales | ${stats.causaCount.toLocaleString()} |\n`
  doc += `| Unidades militares | ${stats.unitCount.toLocaleString()} |\n`
  doc += `| Organizaciones | ${stats.orgCount.toLocaleString()} |\n`
  doc += `| Documentos | ${stats.docCount.toLocaleString()} |\n\n`

  // Tier distribution
  doc += `### Distribución por Tier de Confianza\n\n`
  for (const { tier, count } of stats.tierDistribution) {
    doc += `- **${tier}**: ${count.toLocaleString()} nodos\n`
  }
  doc += `\n`

  // Wave distribution
  doc += `### Distribución por Ola de Ingestión\n\n`
  for (const { wave, count } of stats.waveDistribution) {
    doc += `- Wave ${wave}: ${count.toLocaleString()} nodos\n`
  }
  doc += `\n`

  doc += `---\n\n`

  // LLM-generated narrative
  doc += llmNarrative
  doc += `\n`

  return doc
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
  console.log('=== Wave 13: Narrative Generation ===\n')

  // Phase 1: Query comprehensive stats
  console.log('--- Phase 1: Querying Graph Statistics ---')
  const stats = await queryGraphStats()
  console.log(`  Total nodes: ${stats.totalNodes}`)
  console.log(`  Total edges: ${stats.totalEdges}`)
  console.log(`  Victims: ${stats.victimCount}`)
  console.log(`  Represors: ${stats.represorCount}`)
  console.log(`  CCDs: ${stats.ccdCount}`)
  console.log(`  Labels: ${stats.nodesByLabel.map((l) => `${l.label}(${l.count})`).join(', ')}`)
  console.log()

  // Phase 2: Generate narrative via Qwen
  console.log('--- Phase 2: Generating Narrative via Qwen LLM ---')
  let llmNarrative: string
  try {
    llmNarrative = await generateNarrative(stats)
    console.log('  Narrative generated successfully\n')
  } catch (err) {
    console.error(`  LLM generation failed: ${(err as Error).message}`)
    console.log('  Falling back to stats-only document\n')
    llmNarrative = `## Capítulos (pendiente de generación con LLM)\n\nLa generación automática de narrativa no pudo completarse. Los datos del grafo están disponibles arriba para análisis manual.\n\n### Capítulos planificados:\n\n1. El Aparato — Estructura militar represiva\n2. Las Víctimas — Demografía\n3. La Justicia — Juicios de lesa humanidad\n4. Lo Internacional — Plan Cóndor\n5. La Complicidad Civil — Empresas\n6. Identidad Genética — Nietos restituidos\n7. Memoria y Verdad — Archivos\n`
  }

  // Phase 3: Write narrative document
  console.log('--- Phase 3: Writing Narrative Document ---')
  const document = buildNarrativeDocument(stats, llmNarrative)

  const outputDir = resolve(__dirname, '..', 'docs', 'investigations')
  mkdirSync(outputDir, { recursive: true })
  const outputPath = resolve(outputDir, 'NARRATIVE-DICTADURA.md')
  writeFileSync(outputPath, document, 'utf-8')
  console.log(`  Written to: ${outputPath}`)
  console.log(`  Document size: ${document.length} chars`)

  // Final summary
  console.log('\n=== Wave 13 Summary ===')
  console.log(`  Graph stats collected:  ${stats.nodesByLabel.length} labels, ${stats.edgesByType.length} edge types`)
  console.log(`  Narrative generated:    ${llmNarrative.length} chars`)
  console.log(`  Document written:       ${outputPath}`)

  await closeDriver()
  console.log('\nWave 13 complete!')
}

main().catch((err) => {
  console.error('Wave 13 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
