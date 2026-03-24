/**
 * Wave 19: Sentencia Cross-Reference
 *
 * Ensures complete judicial graph structure:
 *   1. Link all seed represors to their actual sentencias where not yet linked
 *   2. Create CONDENADO_A relationships based on known trial outcomes
 *   3. Ensure every Causa has JUZGADO_POR to its Tribunal
 *   4. Verify every sentencia has SENTENCIA_DE to its Causa
 *   5. Add year_sentenced and sentence_years properties
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-19.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 19

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Known trial-represor mappings (public court records)
// ---------------------------------------------------------------------------

interface TrialMapping {
  represorPattern: string
  causaPattern: string
  sentenciaPattern: string
  tribunalPattern: string
  yearSentenced: number
  sentenceYears: number | null // null = perpetua
  outcome: string
}

const TRIAL_MAPPINGS: TrialMapping[] = [
  {
    represorPattern: 'videla',
    causaPattern: 'causa 13',
    sentenciaPattern: 'juicio a las juntas',
    tribunalPattern: 'camara federal',
    yearSentenced: 1985,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'massera',
    causaPattern: 'causa 13',
    sentenciaPattern: 'juicio a las juntas',
    tribunalPattern: 'camara federal',
    yearSentenced: 1985,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'agosti',
    causaPattern: 'causa 13',
    sentenciaPattern: 'juicio a las juntas',
    tribunalPattern: 'camara federal',
    yearSentenced: 1985,
    sentenceYears: 4,
    outcome: '4 años y 6 meses',
  },
  {
    represorPattern: 'astiz',
    causaPattern: 'esma',
    sentenciaPattern: 'megacausa esma',
    tribunalPattern: 'tof 5',
    yearSentenced: 2011,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'acosta',
    causaPattern: 'esma',
    sentenciaPattern: 'megacausa esma',
    tribunalPattern: 'tof 5',
    yearSentenced: 2011,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'menendez',
    causaPattern: 'la perla',
    sentenciaPattern: 'la perla',
    tribunalPattern: 'tof 1 cordoba',
    yearSentenced: 2008,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'camps',
    causaPattern: 'camps',
    sentenciaPattern: 'causa camps',
    tribunalPattern: 'camara federal la plata',
    yearSentenced: 1986,
    sentenceYears: 25,
    outcome: '25 años',
  },
  {
    represorPattern: 'etchecolatz',
    causaPattern: 'camps',
    sentenciaPattern: 'causa camps',
    tribunalPattern: 'tof 1 la plata',
    yearSentenced: 2006,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'bignone',
    causaPattern: 'plan condor',
    sentenciaPattern: 'plan condor',
    tribunalPattern: 'tof 1',
    yearSentenced: 2016,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'suarez mason',
    causaPattern: 'automotores orletti',
    sentenciaPattern: 'orletti',
    tribunalPattern: 'tof 1',
    yearSentenced: 2011,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
  {
    represorPattern: 'bussi',
    causaPattern: 'arsenal miguel de azcuenaga',
    sentenciaPattern: 'tucuman',
    tribunalPattern: 'tof tucuman',
    yearSentenced: 2008,
    sentenceYears: null,
    outcome: 'Cadena perpetua',
  },
]

// ---------------------------------------------------------------------------
// Phase 1: Link represors to sentencias
// ---------------------------------------------------------------------------

async function linkRepresorsToSentencias(): Promise<{ linked: number; notFound: string[] }> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0
  const notFound: string[] = []

  try {
    for (const mapping of TRIAL_MAPPINGS) {
      // Find the represor
      const represorResult = await session.run(
        `MATCH (p:DictaduraPersona)
         WHERE p.caso_slug = $casoSlug
           AND toLower(p.name) CONTAINS $pattern
           AND (p.category = 'represor' OR p.category = 'imputado')
         RETURN elementId(p) AS eid, p.name AS name
         LIMIT 1`,
        { casoSlug: CASO_SLUG, pattern: mapping.represorPattern },
      )

      if (represorResult.records.length === 0) {
        notFound.push(`Represor: ${mapping.represorPattern}`)
        continue
      }

      const represorEid = represorResult.records[0].get('eid') as string
      const represorName = represorResult.records[0].get('name') as string

      // Find the sentencia
      const sentenciaResult = await session.run(
        `MATCH (s:DictaduraSentencia)
         WHERE s.caso_slug = $casoSlug
           AND toLower(s.name) CONTAINS $pattern
         RETURN elementId(s) AS eid, s.name AS name
         LIMIT 1`,
        { casoSlug: CASO_SLUG, pattern: mapping.sentenciaPattern },
      )

      if (sentenciaResult.records.length === 0) {
        notFound.push(`Sentencia: ${mapping.sentenciaPattern}`)
        continue
      }

      const sentenciaEid = sentenciaResult.records[0].get('eid') as string

      // Create CONDENADO_EN relationship
      await session.run(
        `MATCH (p) WHERE elementId(p) = $pid
         MATCH (s) WHERE elementId(s) = $sid
         MERGE (p)-[r:CONDENADO_EN]->(s)
         ON CREATE SET
           r.outcome = $outcome,
           r.year_sentenced = $yearSentenced,
           r.sentence_years = $sentenceYears,
           r.source = 'sentencia-cross-reference',
           r.ingestion_wave = $wave,
           r.caso_slug = $casoSlug,
           r.created_at = datetime()
         RETURN r`,
        {
          pid: represorEid,
          sid: sentenciaEid,
          outcome: mapping.outcome,
          yearSentenced: mapping.yearSentenced,
          sentenceYears: mapping.sentenceYears,
          wave: WAVE,
          casoSlug: CASO_SLUG,
        },
      )
      linked++
      console.log(`  [LINKED] ${represorName} → ${mapping.sentenciaPattern} (${mapping.outcome})`)
    }

    return { linked, notFound }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Create CONDENADO_A relationships
// ---------------------------------------------------------------------------

async function createCondenadoARelationships(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // For represors with conviction data but no CONDENADO_A to a Causa
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.category = 'represor' OR p.category = 'imputado')
         AND p.conviction_year IS NOT NULL
       OPTIONAL MATCH (p)-[existing:CONDENADO_A]->(:DictaduraCausa)
       WITH p WHERE existing IS NULL
       MATCH (p)-[:CONDENADO_EN]->(s:DictaduraSentencia)-[:SENTENCIA_DE]->(c:DictaduraCausa)
       MERGE (p)-[r:CONDENADO_A]->(c)
       ON CREATE SET
         r.source = 'sentencia-cross-reference',
         r.ingestion_wave = $wave,
         r.caso_slug = $casoSlug,
         r.created_at = datetime()
       RETURN count(r) AS created`,
      { wave: WAVE, casoSlug: CASO_SLUG },
    )

    return toNumber(result.records[0]?.get('created'))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Ensure Causa → Tribunal links
// ---------------------------------------------------------------------------

async function ensureCausaTribunalLinks(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0

  try {
    // Find causas without JUZGADO_POR
    const causas = await session.run(
      `MATCH (c:DictaduraCausa)
       WHERE c.caso_slug = $casoSlug
       OPTIONAL MATCH (c)-[existing:JUZGADO_POR]->(:DictaduraTribunal)
       WITH c WHERE existing IS NULL
       RETURN elementId(c) AS eid, c.name AS name, c.tribunal AS tribunal
       ORDER BY c.name`,
      { casoSlug: CASO_SLUG },
    )

    for (const rec of causas.records) {
      const causaEid = rec.get('eid') as string
      const tribunalName = rec.get('tribunal') as string | null

      if (!tribunalName) continue

      // Try to find matching tribunal
      const tribunal = await session.run(
        `MATCH (t:DictaduraTribunal)
         WHERE t.caso_slug = $casoSlug
           AND (toLower(t.name) CONTAINS toLower($pattern)
                OR toLower($pattern) CONTAINS toLower(t.name))
         RETURN elementId(t) AS eid
         LIMIT 1`,
        { casoSlug: CASO_SLUG, pattern: tribunalName },
      )

      if (tribunal.records.length > 0) {
        const tribunalEid = tribunal.records[0].get('eid') as string
        await session.run(
          `MATCH (c) WHERE elementId(c) = $cid
           MATCH (t) WHERE elementId(t) = $tid
           MERGE (c)-[r:JUZGADO_POR]->(t)
           ON CREATE SET
             r.source = 'sentencia-cross-reference',
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          { cid: causaEid, tid: tribunalEid, wave: WAVE, casoSlug: CASO_SLUG },
        )
        linked++
      }
    }

    return linked
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Ensure Sentencia → Causa links
// ---------------------------------------------------------------------------

async function ensureSentenciaCausaLinks(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0

  try {
    // Find sentencias without SENTENCIA_DE
    const sentencias = await session.run(
      `MATCH (s:DictaduraSentencia)
       WHERE s.caso_slug = $casoSlug
       OPTIONAL MATCH (s)-[existing:SENTENCIA_DE]->(:DictaduraCausa)
       WITH s WHERE existing IS NULL
       RETURN elementId(s) AS eid, s.name AS name, s.slug AS slug
       ORDER BY s.name`,
      { casoSlug: CASO_SLUG },
    )

    for (const rec of sentencias.records) {
      const sentenciaEid = rec.get('eid') as string
      const sentenciaName = (rec.get('name') as string).toLowerCase()

      // Try fuzzy match against causa names
      const causa = await session.run(
        `MATCH (c:DictaduraCausa)
         WHERE c.caso_slug = $casoSlug
         WITH c, toLower(c.name) AS cname
         WHERE cname CONTAINS $pattern OR $sentenciaName CONTAINS cname
         RETURN elementId(c) AS eid
         LIMIT 1`,
        {
          casoSlug: CASO_SLUG,
          pattern: sentenciaName.split(' ').slice(0, 3).join(' '),
          sentenciaName,
        },
      )

      if (causa.records.length > 0) {
        const causaEid = causa.records[0].get('eid') as string
        await session.run(
          `MATCH (s) WHERE elementId(s) = $sid
           MATCH (c) WHERE elementId(c) = $cid
           MERGE (s)-[r:SENTENCIA_DE]->(c)
           ON CREATE SET
             r.source = 'sentencia-cross-reference',
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          { sid: sentenciaEid, cid: causaEid, wave: WAVE, casoSlug: CASO_SLUG },
        )
        linked++
      }
    }

    return linked
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 5: Add year_sentenced and sentence_years properties
// ---------------------------------------------------------------------------

async function addSentencingProperties(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Update sentencia nodes with year from date
    const result = await session.run(
      `MATCH (s:DictaduraSentencia)
       WHERE s.caso_slug = $casoSlug
         AND s.date IS NOT NULL
         AND s.year_sentenced IS NULL
       WITH s,
            CASE
              WHEN s.date =~ '\\\\d{4}-.*' THEN toInteger(substring(s.date, 0, 4))
              WHEN s.date =~ '.*/(\\\\d{4})$' THEN toInteger(substring(s.date, size(s.date)-4))
              ELSE null
            END AS year
       WHERE year IS NOT NULL
       SET s.year_sentenced = year,
           s.updated_at = datetime()
       RETURN count(s) AS updated`,
      { casoSlug: CASO_SLUG },
    )

    return toNumber(result.records[0]?.get('updated'))
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
  console.log('=== Wave 19: Sentencia Cross-Reference ===\n')

  // Phase 1: Link represors to sentencias
  console.log('--- Phase 1: Linking Represors to Sentencias ---')
  const { linked: represorLinks, notFound } = await linkRepresorsToSentencias()
  console.log(`  Created ${represorLinks} CONDENADO_EN relationships`)
  if (notFound.length > 0) {
    console.log(`  Not found (${notFound.length}):`)
    for (const nf of notFound) {
      console.log(`    - ${nf}`)
    }
  }

  // Phase 2: Create CONDENADO_A relationships
  console.log('\n--- Phase 2: Creating CONDENADO_A Relationships ---')
  const condenadoA = await createCondenadoARelationships()
  console.log(`  Created ${condenadoA} CONDENADO_A relationships`)

  // Phase 3: Causa → Tribunal links
  console.log('\n--- Phase 3: Ensuring Causa → Tribunal Links ---')
  const causaTribunal = await ensureCausaTribunalLinks()
  console.log(`  Created ${causaTribunal} JUZGADO_POR relationships`)

  // Phase 4: Sentencia → Causa links
  console.log('\n--- Phase 4: Ensuring Sentencia → Causa Links ---')
  const sentenciaCausa = await ensureSentenciaCausaLinks()
  console.log(`  Created ${sentenciaCausa} SENTENCIA_DE relationships`)

  // Phase 5: Add sentencing properties
  console.log('\n--- Phase 5: Adding Sentencing Properties ---')
  const propsAdded = await addSentencingProperties()
  console.log(`  Updated ${propsAdded} sentencia nodes with year_sentenced`)

  // Final judicial graph stats
  const driver = getDriver()
  const session = driver.session()
  try {
    const stats = await session.run(
      `MATCH (c:DictaduraCausa) WHERE c.caso_slug = $casoSlug
       OPTIONAL MATCH (c)-[:JUZGADO_POR]->(t:DictaduraTribunal)
       OPTIONAL MATCH (s:DictaduraSentencia)-[:SENTENCIA_DE]->(c)
       RETURN c.name AS causa,
              t.name AS tribunal,
              count(s) AS sentencias`,
      { casoSlug: CASO_SLUG },
    )

    console.log('\n  Judicial Graph State:')
    for (const r of stats.records) {
      const causa = r.get('causa') as string
      const tribunal = r.get('tribunal') as string | null
      const sentencias = toNumber(r.get('sentencias'))
      console.log(`    ${causa.padEnd(35)} Tribunal: ${(tribunal || 'MISSING').padEnd(25)} Sentencias: ${sentencias}`)
    }
  } finally {
    await session.close()
  }

  // Summary
  console.log('\n=== Wave 19 Summary ===')
  console.log(`  CONDENADO_EN created:    ${represorLinks}`)
  console.log(`  CONDENADO_A created:     ${condenadoA}`)
  console.log(`  JUZGADO_POR created:     ${causaTribunal}`)
  console.log(`  SENTENCIA_DE created:    ${sentenciaCausa}`)
  console.log(`  Sentencing props added:  ${propsAdded}`)

  await closeDriver()
  console.log('\nWave 19 complete!')
}

main().catch((err) => {
  console.error('Wave 19 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
