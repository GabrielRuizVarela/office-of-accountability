/**
 * Seed top contractors - discovers the top 50 government contractors by
 * total contract value and creates SAME_ENTITY links to matching Company nodes.
 *
 * Run with: npx tsx scripts/seed-top-contractors.ts
 * Idempotent - safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import neo4j from 'neo4j-driver-lite'
import { readQuery, executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TopContractor {
  readonly contractor_id: string
  readonly cuit: string
  readonly name: string
  readonly total_monto: number
  readonly contract_count: number
}

interface CompanyCuitMatch {
  readonly company_cuit: string
  readonly company_name: string
  readonly igj_id: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeCuit(cuit: string): string {
  return cuit.replace(/-/g, '').trim()
}

function formatArs(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return `$${amount.toFixed(0)}`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // ── 1. Query top 50 contractors by total contract value ────────────
  console.log('=== Querying Top 50 Contractors by Total Contract Value ===\n')

  const topContractors = await readQuery(
    `MATCH (ct:Contractor)<-[r:AWARDED_TO]-(pc:PublicContract)
     WITH ct, sum(r.monto) AS total, count(pc) AS contracts
     ORDER BY total DESC
     LIMIT $limit
     RETURN ct.contractor_id AS contractor_id,
            ct.cuit AS cuit,
            ct.name AS name,
            total AS total_monto,
            contracts AS contract_count`,
    { limit: neo4j.int(50) },
    (r) => ({
      contractor_id: r.get('contractor_id') as string,
      cuit: r.get('cuit') as string,
      name: r.get('name') as string,
      total_monto: typeof r.get('total_monto') === 'object'
        ? (r.get('total_monto') as { toNumber(): number }).toNumber()
        : (r.get('total_monto') as number),
      contract_count: typeof r.get('contract_count') === 'object'
        ? (r.get('contract_count') as { toNumber(): number }).toNumber()
        : (r.get('contract_count') as number),
    }),
  )

  if (topContractors.records.length === 0) {
    console.log('  No contractors found. Run ETL pipelines first:')
    console.log('    pnpm run etl:boletin')
    console.log('    pnpm run etl:comprar')
    await closeDriver()
    return
  }

  console.log(`  Found ${topContractors.records.length} contractors:\n`)

  for (let i = 0; i < topContractors.records.length; i++) {
    const c = topContractors.records[i]
    console.log(
      `  ${String(i + 1).padStart(2)}. ${c.name.substring(0, 50).padEnd(50)} ` +
      `CUIT: ${c.cuit || 'N/A'.padEnd(13)} ` +
      `${formatArs(c.total_monto).padStart(10)} ` +
      `(${c.contract_count} contracts)`,
    )
  }

  // ── 2. Cross-reference with IGJ Company nodes ─────────────────────
  console.log('\n=== Cross-Referencing with IGJ Company Registry ===\n')

  const contractorsWithCuit = topContractors.records.filter((c) => c.cuit && c.cuit.trim() !== '')
  console.log(`  Contractors with CUIT: ${contractorsWithCuit.length}/${topContractors.records.length}`)

  let matchCount = 0
  let createdCount = 0
  const now = new Date().toISOString()

  for (const contractor of contractorsWithCuit) {
    const normalizedCuit = normalizeCuit(contractor.cuit)

    // Check if a Company node exists with matching CUIT
    const matches = await readQuery(
      `MATCH (c:Company {cuit: $cuit})
       RETURN c.cuit AS company_cuit, c.name AS company_name, c.igj_id AS igj_id`,
      { cuit: normalizedCuit },
      (r) => ({
        company_cuit: r.get('company_cuit') as string,
        company_name: r.get('company_name') as string,
        igj_id: r.get('igj_id') as string,
      }),
    )

    if (matches.records.length > 0) {
      matchCount++
      const match = matches.records[0]

      // Create SAME_ENTITY relationship
      await executeWrite(
        `MATCH (ct:Contractor {contractor_id: $contractor_id})
         MATCH (co:Company {cuit: $cuit})
         MERGE (ct)-[r:SAME_ENTITY]->(co)
         SET r.match_type = 'cuit',
             r.confidence = 1.0,
             r.evidence = $evidence,
             r.created_at = coalesce(r.created_at, $now)`,
        {
          contractor_id: contractor.contractor_id,
          cuit: normalizedCuit,
          evidence: `CUIT match: ${contractor.cuit} - Contractor "${contractor.name}" ↔ Company "${match.company_name}"`,
          now,
        },
      )
      createdCount++

      console.log(
        `  ✓ MATCH: "${contractor.name}" ↔ "${match.company_name}" (CUIT: ${contractor.cuit})`,
      )
    }
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log('\n=== Summary ===')
  console.log(`  Top contractors queried: ${topContractors.records.length}`)
  console.log(`  With CUIT: ${contractorsWithCuit.length}`)
  console.log(`  Matched to IGJ Company: ${matchCount}`)
  console.log(`  SAME_ENTITY rels created: ${createdCount}`)
  console.log(`  Unmatched (no IGJ record): ${contractorsWithCuit.length - matchCount}`)
  console.log('\nRun "pnpm run cross-ref" for full cross-referencing with DNI/name matching.')

  await closeDriver()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
