/**
 * Seed Grupo Clarín entities into Neo4j as Company + CompanyOfficer nodes.
 *
 * Seeds the major Clarín Group holding companies and their key officers/shareholders
 * as gold-tier nodes. After seeding, the cross-reference engine will automatically
 * discover their connections to government contracts via CUIT matching.
 *
 * Run with: npx tsx scripts/seed-clarin-group.ts
 * Idempotent - safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Seed data - Grupo Clarín corporate structure
// ---------------------------------------------------------------------------

interface SeedCompany {
  readonly cuit: string
  readonly name: string
  readonly company_type: string
  readonly sector: string
  readonly status: string
}

interface SeedOfficer {
  readonly name: string
  readonly role: string
  readonly role_code: string // A=Authority, S=Socio
  readonly ownership_pct?: number
}

interface SeedRelationship {
  readonly officer_name: string
  readonly company_cuit: string
  readonly role: string
}

const COMPANIES: readonly SeedCompany[] = [
  {
    cuit: '30707001735',
    name: 'GRUPO CLARIN S.A.',
    company_type: 'S.A.',
    sector: 'media_holding',
    status: 'active',
  },
  {
    cuit: '30578612782',
    name: 'ARTE RADIOTELEVISIVO ARGENTINO S.A. (ARTEAR)',
    company_type: 'S.A.',
    sector: 'television',
    status: 'active',
  },
  {
    cuit: '30500aborr279',
    name: 'PAPEL PRENSA S.A.I.C.F. Y DE M.',
    company_type: 'S.A.I.C.F.',
    sector: 'newsprint',
    status: 'active',
  },
  {
    cuit: '30546741298',
    name: 'CABLEVISION S.A.',
    company_type: 'S.A.',
    sector: 'cable_tv',
    status: 'active',
  },
  {
    cuit: '33709649839',
    name: 'AGEA S.A. (CLARIN DIARIO)',
    company_type: 'S.A.',
    sector: 'print_media',
    status: 'active',
  },
]

const OFFICERS: readonly SeedOfficer[] = [
  {
    name: 'MAGNETTO HECTOR HORACIO',
    role: 'Presidente',
    role_code: 'A',
    ownership_pct: 29.8,
  },
  {
    name: 'NOBLE HERRERA MARCELA',
    role: 'Accionista',
    role_code: 'S',
    ownership_pct: 24.85,
  },
  {
    name: 'NOBLE HERRERA FELIPE',
    role: 'Accionista',
    role_code: 'S',
    ownership_pct: 24.85,
  },
  {
    name: 'ARANDA JOSE ANTONIO',
    role: 'Vicepresidente 1°',
    role_code: 'A',
    ownership_pct: 10.3,
  },
  {
    name: 'PAGLIARO LUCIO RAFAEL',
    role: 'Vicepresidente 2°',
    role_code: 'A',
    ownership_pct: 10.2,
  },
]

// All officers are connected to the main holding company
const RELATIONSHIPS: readonly SeedRelationship[] = OFFICERS.map((o) => ({
  officer_name: o.name,
  company_cuit: '30707001735', // Grupo Clarín S.A.
  role: o.role,
}))

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

const PROVENANCE = {
  source_url: 'https://www.boletinoficial.gob.ar/',
  submitted_by: 'seed:clarin-group',
  tier: 'gold' as const,
  confidence_score: 1.0,
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main(): Promise<void> {
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  const now = new Date().toISOString()

  // ── 1. Seed Company nodes ──────────────────────────────────────────
  console.log('=== Seeding Clarín Group Companies ===')
  for (const co of COMPANIES) {
    const normalizedCuit = co.cuit.replace(/-/g, '')
    try {
      await executeWrite(
        `MERGE (c:Company {cuit: $cuit})
         SET c.name = $name,
             c.company_type = $company_type,
             c.sector = $sector,
             c.status = $status,
             c.igj_id = $igj_id,
             c.source_url = $source_url,
             c.submitted_by = $submitted_by,
             c.tier = $tier,
             c.confidence_score = $confidence_score,
             c.created_at = coalesce(c.created_at, $now),
             c.updated_at = $now`,
        {
          cuit: normalizedCuit,
          name: co.name,
          company_type: co.company_type,
          sector: co.sector,
          status: co.status,
          igj_id: `seed-clarin-${slugify(co.name)}`,
          source_url: PROVENANCE.source_url,
          submitted_by: PROVENANCE.submitted_by,
          tier: PROVENANCE.tier,
          confidence_score: PROVENANCE.confidence_score,
          now,
        },
      )
      console.log(`  ✓ ${co.name} (CUIT: ${co.cuit})`)
    } catch (error) {
      console.error(`  ✗ ${co.name}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── 2. Seed CompanyOfficer nodes ───────────────────────────────────
  console.log('\n=== Seeding Key Officers/Shareholders ===')
  for (const officer of OFFICERS) {
    const officerId = `seed-clarin-${slugify(officer.name)}`
    try {
      await executeWrite(
        `MERGE (o:CompanyOfficer {officer_id: $officer_id})
         SET o.name = $name,
             o.role = $role,
             o.role_code = $role_code,
             o.ownership_pct = $ownership_pct,
             o.source_url = $source_url,
             o.submitted_by = $submitted_by,
             o.tier = $tier,
             o.confidence_score = $confidence_score,
             o.created_at = coalesce(o.created_at, $now),
             o.updated_at = $now`,
        {
          officer_id: officerId,
          name: officer.name,
          role: officer.role,
          role_code: officer.role_code,
          ownership_pct: officer.ownership_pct ?? 0,
          source_url: PROVENANCE.source_url,
          submitted_by: PROVENANCE.submitted_by,
          tier: PROVENANCE.tier,
          confidence_score: PROVENANCE.confidence_score,
          now,
        },
      )
      console.log(`  ✓ ${officer.name} (${officer.role}, ${officer.ownership_pct ?? 0}%)`)
    } catch (error) {
      console.error(`  ✗ ${officer.name}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── 3. Create OFFICER_OF_COMPANY relationships ─────────────────────
  console.log('\n=== Creating Officer ↔ Company Relationships ===')
  for (const rel of RELATIONSHIPS) {
    const officerId = `seed-clarin-${slugify(rel.officer_name)}`
    const normalizedCuit = rel.company_cuit.replace(/-/g, '')
    try {
      await executeWrite(
        `MATCH (o:CompanyOfficer {officer_id: $officer_id})
         MATCH (c:Company {cuit: $cuit})
         MERGE (o)-[r:OFFICER_OF_COMPANY]->(c)
         SET r.role = $role,
             r.source = $source,
             r.created_at = coalesce(r.created_at, $now)`,
        {
          officer_id: officerId,
          cuit: normalizedCuit,
          role: rel.role,
          source: PROVENANCE.submitted_by,
          now,
        },
      )
      console.log(`  ✓ ${rel.officer_name} → ${rel.company_cuit} (${rel.role})`)
    } catch (error) {
      console.error(`  ✗ ${rel.officer_name} → ${rel.company_cuit}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── 4. Also create Contractor nodes for known CUITs ────────────────
  // This allows the cross-reference engine to link them to PublicContract data
  console.log('\n=== Creating Contractor Mirror Nodes (for cross-reference) ===')
  for (const co of COMPANIES) {
    const normalizedCuit = co.cuit.replace(/-/g, '')
    const contractorId = normalizedCuit // Use CUIT as contractor_id for consistency
    try {
      await executeWrite(
        `MERGE (ct:Contractor {contractor_id: $contractor_id})
         SET ct.cuit = $cuit,
             ct.name = $name,
             ct.source_url = $source_url,
             ct.submitted_by = $submitted_by,
             ct.tier = $tier,
             ct.confidence_score = $confidence_score,
             ct.created_at = coalesce(ct.created_at, $now),
             ct.updated_at = $now`,
        {
          contractor_id: contractorId,
          cuit: normalizedCuit,
          name: co.name,
          source_url: PROVENANCE.source_url,
          submitted_by: PROVENANCE.submitted_by,
          tier: PROVENANCE.tier,
          confidence_score: PROVENANCE.confidence_score,
          now,
        },
      )
      console.log(`  ✓ Contractor: ${co.name}`)
    } catch (error) {
      console.error(`  ✗ Contractor ${co.name}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log('\n=== Seed Complete ===')
  console.log(`  Companies: ${COMPANIES.length}`)
  console.log(`  Officers: ${OFFICERS.length}`)
  console.log(`  Relationships: ${RELATIONSHIPS.length}`)
  console.log(`  Contractor mirrors: ${COMPANIES.length}`)
  console.log('\nRun "pnpm run cross-ref" to discover contract connections.')

  await closeDriver()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
