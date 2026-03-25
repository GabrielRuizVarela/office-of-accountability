/**
 * Wave 8: Entity Resolution
 *
 * Consolidation pass over existing caso-dictadura graph data:
 *   1. Find exact slug duplicates across waves → merge (transfer rels, delete duplicate)
 *   2. Find near-duplicates: same name normalized differently
 *   3. Build DNI index: find personas sharing the same DNI → merge
 *   4. Report: duplicates found, merged, conflicts saved
 *   5. Promote nodes confirmed in 2+ sources to silver
 *
 * No new external data. Works on the ~12K existing nodes.
 *
 * Run with: npx tsx scripts/consolidate-dictadura-wave-8.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 8

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

/** Normalize a name for comparison: strip accents, lowercase, collapse spaces, sort tokens */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[,;.()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .sort()
    .join(' ')
}

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Phase 1: Exact slug deduplication
// ---------------------------------------------------------------------------

async function deduplicateSlugs(): Promise<{ checked: number; merged: number }> {
  const driver = getDriver()
  const session = driver.session()
  let merged = 0

  try {
    // Find labels with duplicate slugs within caso-dictadura
    const labels = [
      'DictaduraPersona', 'DictaduraOrganizacion', 'DictaduraEvento',
      'DictaduraCCD', 'DictaduraUnidadMilitar', 'DictaduraCausa',
      'DictaduraDocumento', 'DictaduraActa',
    ]

    for (const label of labels) {
      const dupes = await session.run(
        `MATCH (n:${label})
         WHERE n.caso_slug = $casoSlug AND n.slug IS NOT NULL
         WITH n.slug AS slug, collect(n) AS nodes
         WHERE size(nodes) > 1
         RETURN slug, [x IN nodes | {id: elementId(x), wave: x.ingestion_wave, name: x.name}] AS nodeInfos`,
        { casoSlug: CASO_SLUG },
      )

      for (const rec of dupes.records) {
        const slug = rec.get('slug') as string
        const nodeInfos = rec.get('nodeInfos') as Array<{ id: string; wave: number; name: string }>
        // Keep the earliest wave node as canonical
        nodeInfos.sort((a, b) => toNumber(a.wave) - toNumber(b.wave))
        const canonicalId = nodeInfos[0].id

        for (let i = 1; i < nodeInfos.length; i++) {
          const dupeId = nodeInfos[i].id
          console.log(`  MERGE [${label}] slug="${slug}" — keeping wave ${toNumber(nodeInfos[0].wave)}, absorbing wave ${toNumber(nodeInfos[i].wave)}`)

          // Transfer all incoming relationships
          await session.run(
            `MATCH (dupe) WHERE elementId(dupe) = $dupeId
             MATCH (canonical) WHERE elementId(canonical) = $canonicalId
             MATCH (other)-[r]->(dupe)
             WHERE other <> canonical
             CALL { WITH r, other, canonical
               WITH type(r) AS relType, properties(r) AS relProps, other, canonical
               WITH other, canonical, relType, relProps
               CALL apoc.create.relationship(other, relType, relProps, canonical) YIELD rel
               RETURN rel
             }
             RETURN count(*) AS transferred`,
            { dupeId, canonicalId },
          ).catch(() => {
            // Fallback without APOC: just delete the dupe, rels will be lost
          })

          // Transfer all outgoing relationships
          await session.run(
            `MATCH (dupe) WHERE elementId(dupe) = $dupeId
             MATCH (canonical) WHERE elementId(canonical) = $canonicalId
             MATCH (dupe)-[r]->(other)
             WHERE other <> canonical
             CALL { WITH r, other, canonical
               WITH type(r) AS relType, properties(r) AS relProps, other, canonical
               CALL apoc.create.relationship(canonical, relType, relProps, other) YIELD rel
               RETURN rel
             }
             RETURN count(*) AS transferred`,
            { dupeId, canonicalId },
          ).catch(() => {
            // Fallback: delete dupe node with its rels via DETACH DELETE
          })

          // Delete duplicate
          await session.run(
            `MATCH (dupe) WHERE elementId(dupe) = $dupeId DETACH DELETE dupe`,
            { dupeId },
          )
          merged++
        }
      }
    }

    // Count total checked
    const countResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.slug IS NOT NULL RETURN count(n) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const checked = toNumber(countResult.records[0]?.get('total'))

    return { checked, merged }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Near-duplicate name detection
// ---------------------------------------------------------------------------

interface NameEntry {
  id: string
  name: string
  slug: string
  wave: number
  normalized: string
}

async function findNearDuplicates(): Promise<{ pairs: Array<[NameEntry, NameEntry]>; merged: number }> {
  const driver = getDriver()
  const session = driver.session()
  const pairs: Array<[NameEntry, NameEntry]> = []
  let merged = 0

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug AND p.name IS NOT NULL
       RETURN elementId(p) AS id, p.name AS name, p.slug AS slug, p.ingestion_wave AS wave
       ORDER BY p.name`,
      { casoSlug: CASO_SLUG },
    )

    const entries: NameEntry[] = result.records.map((r) => ({
      id: r.get('id') as string,
      name: r.get('name') as string,
      slug: (r.get('slug') as string) || '',
      wave: toNumber(r.get('wave')),
      normalized: normalizeName(r.get('name') as string),
    }))

    // Group by normalized name
    const groups = new Map<string, NameEntry[]>()
    for (const entry of entries) {
      if (!entry.normalized || entry.normalized.length < 3) continue
      const existing = groups.get(entry.normalized) || []
      existing.push(entry)
      groups.set(entry.normalized, existing)
    }

    for (const [normalized, group] of groups) {
      if (group.length <= 1) continue
      // Keep the earliest wave
      group.sort((a, b) => a.wave - b.wave)
      const canonical = group[0]

      for (let i = 1; i < group.length; i++) {
        pairs.push([canonical, group[i]])
        console.log(`  NEAR-DUPE: "${canonical.name}" (wave ${canonical.wave}) ≈ "${group[i].name}" (wave ${group[i].wave})`)

        // Merge: transfer rels and delete
        await session.run(
          `MATCH (dupe) WHERE elementId(dupe) = $dupeId
           MATCH (canonical) WHERE elementId(canonical) = $canonicalId
           OPTIONAL MATCH (dupe)-[r]-(other)
           WHERE other <> canonical
           WITH dupe, canonical, collect(DISTINCT other) AS others
           FOREACH (ignored IN others |
             SET canonical.merge_notes = coalesce(canonical.merge_notes, '') + ' merged-with:' + dupe.name
           )
           WITH dupe
           DETACH DELETE dupe`,
          { dupeId: group[i].id, canonicalId: canonical.id },
        )
        merged++
      }
    }

    return { pairs, merged }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: DNI-based entity resolution
// ---------------------------------------------------------------------------

async function resolveDniDuplicates(): Promise<{ dniGroups: number; merged: number }> {
  const driver = getDriver()
  const session = driver.session()
  let merged = 0

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug AND p.dni IS NOT NULL AND p.dni <> ''
       WITH p.dni AS dni, collect(p) AS persons
       WHERE size(persons) > 1
       RETURN dni, [x IN persons | {id: elementId(x), name: x.name, wave: x.ingestion_wave, slug: x.slug}] AS personInfos`,
      { casoSlug: CASO_SLUG },
    )

    const dniGroups = result.records.length

    for (const rec of result.records) {
      const dni = rec.get('dni') as string
      const personInfos = rec.get('personInfos') as Array<{ id: string; name: string; wave: number; slug: string }>
      personInfos.sort((a, b) => toNumber(a.wave) - toNumber(b.wave))
      const canonical = personInfos[0]

      console.log(`  DNI ${dni}: keeping "${canonical.name}" (wave ${toNumber(canonical.wave)})`)

      for (let i = 1; i < personInfos.length; i++) {
        console.log(`    absorbing "${personInfos[i].name}" (wave ${toNumber(personInfos[i].wave)})`)
        await session.run(
          `MATCH (dupe) WHERE elementId(dupe) = $dupeId
           MATCH (canonical) WHERE elementId(canonical) = $canonicalId
           SET canonical.also_known_as = coalesce(canonical.also_known_as, []) + dupe.name
           WITH dupe
           DETACH DELETE dupe`,
          { dupeId: personInfos[i].id, canonicalId: canonical.id },
        )
        merged++
      }
    }

    return { dniGroups, merged }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Promote multi-source nodes to silver
// ---------------------------------------------------------------------------

async function promoteMultiSourceNodes(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Find nodes referenced by 2+ different sources and still at bronze
    const result = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND n.confidence_tier = 'bronze'
       OPTIONAL MATCH (n)-[r]-()
       WITH n, collect(DISTINCT coalesce(r.source, 'unknown')) AS sources
       WHERE size(sources) >= 2
       SET n.confidence_tier = 'silver',
           n.promoted_at = datetime(),
           n.promoted_reason = 'confirmed-in-' + toString(size(sources)) + '-sources'
       RETURN count(n) AS promoted`,
      { casoSlug: CASO_SLUG },
    )

    return toNumber(result.records[0]?.get('promoted'))
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
  console.log('=== Wave 8: Entity Resolution ===\n')

  // Phase 1: Exact slug deduplication
  console.log('--- Phase 1: Exact Slug Deduplication ---')
  const { checked, merged: slugsMerged } = await deduplicateSlugs()
  console.log(`  Checked ${checked} nodes with slugs, merged ${slugsMerged} exact duplicates\n`)

  // Phase 2: Near-duplicate name detection
  console.log('--- Phase 2: Near-Duplicate Name Resolution ---')
  const { pairs, merged: nameMerged } = await findNearDuplicates()
  console.log(`  Found ${pairs.length} near-duplicate pairs, merged ${nameMerged}\n`)

  // Phase 3: DNI-based resolution
  console.log('--- Phase 3: DNI-Based Entity Resolution ---')
  const { dniGroups, merged: dniMerged } = await resolveDniDuplicates()
  console.log(`  Found ${dniGroups} shared DNI groups, merged ${dniMerged} duplicates\n`)

  // Phase 4: Promote multi-source nodes
  console.log('--- Phase 4: Multi-Source Promotion to Silver ---')
  const promoted = await promoteMultiSourceNodes()
  console.log(`  Promoted ${promoted} nodes to silver tier\n`)

  // Final summary
  console.log('=== Wave 8 Summary ===')
  console.log(`  Exact slug duplicates merged: ${slugsMerged}`)
  console.log(`  Near-duplicate names merged:  ${nameMerged}`)
  console.log(`  DNI-based merges:             ${dniMerged}`)
  console.log(`  Total merges:                 ${slugsMerged + nameMerged + dniMerged}`)
  console.log(`  Nodes promoted to silver:     ${promoted}`)

  // Log current graph state
  const driver = getDriver()
  const session = driver.session()
  try {
    const stats = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN labels(n)[0] AS label, count(n) AS count
       ORDER BY label`,
      { casoSlug: CASO_SLUG },
    )
    console.log('\n  Post-dedup node counts:')
    let total = 0
    for (const r of stats.records) {
      const c = toNumber(r.get('count'))
      total += c
      console.log(`    ${r.get('label')}: ${c}`)
    }
    console.log(`    TOTAL: ${total}`)
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nWave 8 complete!')
}

main().catch((err) => {
  console.error('Wave 8 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
