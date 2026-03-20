/**
 * Export Caso Libra data from Neo4j into a MiroFish-compatible seed format.
 *
 * Run with: npx tsx scripts/export-caso-libra-seed.ts [--output <file>]
 *
 * Queries all Caso Libra nodes and relationships from Neo4j, then
 * generates a narrative document that MiroFish can ingest as seed data
 * for its multi-agent simulation engine.
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { type Record as Neo4jRecord, type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver, closeDriver } from '../src/lib/neo4j/client'

const QUERY_TIMEOUT_MS = 30_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Agent personality profiles (Phase D)
// ---------------------------------------------------------------------------

const AGENT_PERSONALITIES: Record<string, string> = {
  'javier-milei':
    'Lider politico populista, simpatizante cripto, habil en medios, defensivo bajo presion. Presidente con 19M de seguidores en X.',
  'karina-milei':
    'Operadora politica, leal a la familia, controla acceso al presidente. Secretaria General de la Presidencia.',
  'hayden-davis':
    'Emprendedor cripto, motivado por ganancias, movilidad internacional. CEO de Kelsier Ventures, organizador tecnico del lanzamiento.',
  'santiago-caputo':
    'Asesor estrategico, experto en comunicaciones, consciente del riesgo. Asesor presidencial con vinculos telefonicos al esquema.',
  'julian-peh':
    'Intermediario tecnologico, networker, puente entre el mundo cripto y el gobierno. Presente en reuniones previas al lanzamiento.',
  'mauricio-novelli': 'Operador financiero vinculado a la operatoria del lanzamiento de $LIBRA.',
  'monica-terrones-godoy':
    'Familiar de funcionario vinculada a billeteras que recibieron fondos del lanzamiento.',
  'sergio-morales': 'Operador cripto vinculado a operaciones de consolidacion de fondos post-lanzamiento.',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}

function formatUsd(amount: number): string {
  return `$${(amount / 1_000_000).toFixed(0)}M`
}

// ---------------------------------------------------------------------------
// Neo4j queries
// ---------------------------------------------------------------------------

interface PersonData {
  id: string
  name: string
  slug: string
  role: string
  description: string
  nationality: string
}

interface EventData {
  id: string
  title: string
  description: string
  date: string
  event_type: string
}

interface DocumentData {
  id: string
  title: string
  doc_type: string
  summary: string
  date_published: string
}

interface OrganizationData {
  id: string
  name: string
  org_type: string
  description: string
  country: string
}

interface RelData {
  sourceId: string
  sourceName: string
  targetId: string
  targetName: string
  type: string
  properties: Record<string, unknown>
}

interface TransactionData {
  from_label: string
  to_label: string
  amount_usd: number
  timestamp: string
}

async function fetchPersons(session: ReturnType<ReturnType<typeof getDriver>['session']>): Promise<PersonData[]> {
  const result = await session.run(
    'MATCH (p:CasoLibraPerson) RETURN p ORDER BY p.name ASC',
    {},
    TX_CONFIG,
  )
  return result.records.map((r: Neo4jRecord) => {
    const props = (r.get('p') as Node).properties
    return {
      id: asString(props.id),
      name: asString(props.name),
      slug: asString(props.slug),
      role: asString(props.role),
      description: asString(props.description),
      nationality: asString(props.nationality),
    }
  })
}

async function fetchOrganizations(session: ReturnType<ReturnType<typeof getDriver>['session']>): Promise<OrganizationData[]> {
  const result = await session.run(
    'MATCH (o:CasoLibraOrganization) RETURN o ORDER BY o.name ASC',
    {},
    TX_CONFIG,
  )
  return result.records.map((r: Neo4jRecord) => {
    const props = (r.get('o') as Node).properties
    return {
      id: asString(props.id),
      name: asString(props.name),
      org_type: asString(props.org_type),
      description: asString(props.description),
      country: asString(props.country),
    }
  })
}

async function fetchEvents(session: ReturnType<ReturnType<typeof getDriver>['session']>): Promise<EventData[]> {
  const result = await session.run(
    'MATCH (e:CasoLibraEvent) RETURN e ORDER BY e.date ASC',
    {},
    TX_CONFIG,
  )
  return result.records.map((r: Neo4jRecord) => {
    const props = (r.get('e') as Node).properties
    return {
      id: asString(props.id),
      title: asString(props.title),
      description: asString(props.description),
      date: asString(props.date),
      event_type: asString(props.event_type),
    }
  })
}

async function fetchDocuments(session: ReturnType<ReturnType<typeof getDriver>['session']>): Promise<DocumentData[]> {
  const result = await session.run(
    'MATCH (d:CasoLibraDocument) RETURN d ORDER BY d.date_published ASC',
    {},
    TX_CONFIG,
  )
  return result.records.map((r: Neo4jRecord) => {
    const props = (r.get('d') as Node).properties
    return {
      id: asString(props.id),
      title: asString(props.title),
      doc_type: asString(props.doc_type),
      summary: asString(props.summary),
      date_published: asString(props.date_published),
    }
  })
}

async function fetchRelationships(session: ReturnType<ReturnType<typeof getDriver>['session']>): Promise<RelData[]> {
  const result = await session.run(
    `MATCH (a)-[r]->(b)
     WHERE (a:CasoLibraPerson OR a:CasoLibraOrganization OR a:CasoLibraEvent OR a:CasoLibraDocument OR a:CasoLibraToken)
       AND (b:CasoLibraPerson OR b:CasoLibraOrganization OR b:CasoLibraEvent OR b:CasoLibraDocument OR b:CasoLibraToken)
       AND NOT type(r) = 'SENT'
     RETURN a.id AS sourceId, COALESCE(a.name, a.title, a.symbol) AS sourceName,
            b.id AS targetId, COALESCE(b.name, b.title, b.symbol) AS targetName,
            type(r) AS relType, properties(r) AS relProps`,
    {},
    TX_CONFIG,
  )
  return result.records.map((r: Neo4jRecord) => ({
    sourceId: asString(r.get('sourceId')),
    sourceName: asString(r.get('sourceName')),
    targetId: asString(r.get('targetId')),
    targetName: asString(r.get('targetName')),
    type: asString(r.get('relType')),
    properties: (r.get('relProps') as Record<string, unknown>) || {},
  }))
}

async function fetchTransactions(session: ReturnType<ReturnType<typeof getDriver>['session']>): Promise<TransactionData[]> {
  const result = await session.run(
    `MATCH (w1:CasoLibraWallet)-[r:SENT]->(w2:CasoLibraWallet)
     RETURN w1.label AS from_label, w2.label AS to_label,
            r.amount_usd AS amount_usd, r.timestamp AS timestamp
     ORDER BY r.timestamp ASC`,
    {},
    TX_CONFIG,
  )
  return result.records.map((r: Neo4jRecord) => ({
    from_label: asString(r.get('from_label')),
    to_label: asString(r.get('to_label')),
    amount_usd: asNumber(r.get('amount_usd')),
    timestamp: asString(r.get('timestamp')),
  }))
}

// ---------------------------------------------------------------------------
// Seed document generation
// ---------------------------------------------------------------------------

function generateSeedDocument(
  persons: PersonData[],
  organizations: OrganizationData[],
  events: EventData[],
  documents: DocumentData[],
  relationships: RelData[],
  transactions: TransactionData[],
): string {
  const lines: string[] = []

  lines.push('# Caso Libra — Seed Data for Simulation')
  lines.push('')
  lines.push('## Context')
  lines.push('')
  lines.push(
    'The $LIBRA token was a Solana-based memecoin promoted by Argentine President Javier Milei ' +
    'on February 14, 2025. The token reached a $4B market cap before crashing 94%, causing ' +
    'approximately $251M in losses to ~114,000 wallets. Investigations revealed connections ' +
    'between the presidential inner circle and the token organizers (Kelsier Ventures).',
  )
  lines.push('')

  // Actors
  lines.push('## Actors')
  lines.push('')
  for (const person of persons) {
    const personality = AGENT_PERSONALITIES[person.slug] || ''
    lines.push(`### ${person.name}`)
    lines.push(`- **Role**: ${person.role || 'N/A'}`)
    lines.push(`- **Nationality**: ${person.nationality || 'N/A'}`)
    lines.push(`- **Description**: ${person.description || 'N/A'}`)
    if (personality) {
      lines.push(`- **Agent Personality**: ${personality}`)
    }
    lines.push('')
  }

  // Organizations
  lines.push('## Organizations')
  lines.push('')
  for (const org of organizations) {
    lines.push(`- **${org.name}** (${org.org_type || 'N/A'}, ${org.country || 'N/A'}): ${org.description || 'N/A'}`)
  }
  lines.push('')

  // Timeline
  lines.push('## Timeline of Events')
  lines.push('')
  for (const event of events) {
    const dateStr = event.date ? event.date.slice(0, 10) : 'unknown'
    lines.push(`- **${dateStr}** [${event.event_type}]: ${event.title}`)
    if (event.description) {
      lines.push(`  ${event.description}`)
    }
  }
  lines.push('')

  // Relationships
  lines.push('## Key Relationships')
  lines.push('')
  for (const rel of relationships) {
    let extra = ''
    if (rel.properties.date) extra += ` on ${asString(rel.properties.date)}`
    if (rel.properties.medium) extra += ` via ${asString(rel.properties.medium)}`
    if (rel.properties.location) extra += ` at ${asString(rel.properties.location)}`
    lines.push(`- ${rel.sourceName} **${rel.type}** ${rel.targetName}${extra}`)
  }
  lines.push('')

  // Financial flows
  lines.push('## Financial Flows')
  lines.push('')
  lines.push('Key on-chain transactions traced by TRM Labs:')
  lines.push('')
  for (const tx of transactions) {
    const dateStr = tx.timestamp ? tx.timestamp.slice(0, 10) : 'unknown'
    lines.push(`- ${formatUsd(tx.amount_usd)} from "${tx.from_label}" to "${tx.to_label}" (${dateStr})`)
  }
  lines.push('')
  lines.push('Total extracted from liquidity pool by team wallets: ~$58M')
  lines.push('Total losses by retail investors: ~$251M')
  lines.push('Affected wallets: ~114,000')
  lines.push('')

  // Evidence
  lines.push('## Evidence / Source Documents')
  lines.push('')
  for (const doc of documents) {
    lines.push(`### ${doc.title}`)
    lines.push(`- **Type**: ${doc.doc_type || 'N/A'}`)
    lines.push(`- **Date**: ${doc.date_published || 'N/A'}`)
    if (doc.summary) {
      lines.push(`- **Summary**: ${doc.summary}`)
    }
    lines.push('')
  }

  // Agent configuration
  lines.push('## Agent Personality Configuration')
  lines.push('')
  lines.push('The following agent personalities should be used for simulation:')
  lines.push('')
  lines.push('| Actor | Personality Profile |')
  lines.push('|-------|-------------------|')
  for (const person of persons) {
    const personality = AGENT_PERSONALITIES[person.slug] || person.description || 'N/A'
    lines.push(`| ${person.name} | ${personality} |`)
  }
  lines.push('')
  lines.push('Additional institutional agents:')
  lines.push('- **Congressional investigators**: Institutional actors, political motivations vary by party')
  lines.push('- **Judiciary**: Procedural, evidence-driven, slow-moving')
  lines.push('- **Media (Infobae, FT, Reuters)**: Information-seeking, impact-maximizing, source-protecting')
  lines.push('')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// JSON seed format (structured alternative)
// ---------------------------------------------------------------------------

function generateJsonSeed(
  persons: PersonData[],
  organizations: OrganizationData[],
  events: EventData[],
  documents: DocumentData[],
  relationships: RelData[],
  transactions: TransactionData[],
): object {
  return {
    case_name: 'Caso Libra',
    case_description:
      '$LIBRA token scandal involving Argentine President Milei, Kelsier Ventures, and ~$251M in retail losses.',
    agents: persons.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      nationality: p.nationality,
      description: p.description,
      personality: AGENT_PERSONALITIES[p.slug] || null,
    })),
    institutional_agents: [
      {
        id: 'institutional-congress',
        name: 'Congressional Investigators',
        personality: 'Institutional actors, political motivations vary by party',
      },
      {
        id: 'institutional-judiciary',
        name: 'Judiciary',
        personality: 'Procedural, evidence-driven, slow-moving',
      },
      {
        id: 'institutional-media',
        name: 'Media (Infobae, FT, Reuters)',
        personality: 'Information-seeking, impact-maximizing, source-protecting',
      },
    ],
    organizations,
    timeline: events.map((e) => ({
      date: e.date,
      title: e.title,
      description: e.description,
      type: e.event_type,
    })),
    relationships: relationships.map((r) => ({
      source: r.sourceName,
      target: r.targetName,
      type: r.type,
      ...r.properties,
    })),
    financial_flows: {
      transactions: transactions.map((t) => ({
        from: t.from_label,
        to: t.to_label,
        amount_usd: t.amount_usd,
        timestamp: t.timestamp,
      })),
      total_extracted: 58_000_000,
      total_retail_losses: 251_000_000,
      affected_wallets: 114_000,
    },
    evidence: documents.map((d) => ({
      title: d.title,
      type: d.doc_type,
      date: d.date_published,
      summary: d.summary,
    })),
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const outputArg = process.argv.indexOf('--output')
  const outputDir = outputArg !== -1 && process.argv[outputArg + 1]
    ? resolve(process.argv[outputArg + 1])
    : resolve(__dirname, '..')

  console.log('Exporting Caso Libra data for MiroFish simulation...\n')

  const session = getDriver().session()

  try {
    // Run sequentially — Neo4j sessions don't support concurrent queries
    const persons = await fetchPersons(session)
    const organizations = await fetchOrganizations(session)
    const events = await fetchEvents(session)
    const documents = await fetchDocuments(session)
    const relationships = await fetchRelationships(session)
    const transactions = await fetchTransactions(session)

    console.log(`  Persons: ${persons.length}`)
    console.log(`  Organizations: ${organizations.length}`)
    console.log(`  Events: ${events.length}`)
    console.log(`  Documents: ${documents.length}`)
    console.log(`  Relationships: ${relationships.length}`)
    console.log(`  Transactions: ${transactions.length}`)

    // Generate narrative seed document
    const narrative = generateSeedDocument(persons, organizations, events, documents, relationships, transactions)
    const narrativePath = resolve(outputDir, 'caso-libra-seed.md')
    writeFileSync(narrativePath, narrative, 'utf-8')
    console.log(`\nNarrative seed written to: ${narrativePath}`)

    // Generate structured JSON seed
    const json = generateJsonSeed(persons, organizations, events, documents, relationships, transactions)
    const jsonPath = resolve(outputDir, 'caso-libra-seed.json')
    writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf-8')
    console.log(`JSON seed written to: ${jsonPath}`)
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nExport complete.')
}

main().catch((error) => {
  console.error('Export failed:', error)
  process.exit(1)
})
