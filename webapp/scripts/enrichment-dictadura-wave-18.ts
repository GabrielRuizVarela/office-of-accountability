/**
 * Wave 18: Represor Career Mapping
 *
 * Enriches gold-tier represor nodes with career data:
 *   1. Query all represor nodes (gold/silver tier)
 *   2. For each represor, use known historical data to enrich:
 *      - Current status (alive/dead/imprisoned/free)
 *      - All ranks held during career
 *      - Post-dictatorship life (convicted, pardoned, died, escaped)
 *   3. Update represor nodes with enrichment properties
 *   4. Generate career timeline report
 *
 * Uses known public-record data from trial verdicts and CELS reports.
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-18.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 18

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Known represor career data (from public court records, CELS, Nunca Más)
// ---------------------------------------------------------------------------

interface RepresorCareer {
  namePatterns: string[] // lowercase patterns to match
  status: 'dead' | 'imprisoned' | 'free' | 'house_arrest' | 'fugitive' | 'unknown'
  status_detail: string
  ranks: string[]
  branch: string
  post_dictatorship: string
  conviction_year?: number
  death_year?: number
  sentence?: string
}

const KNOWN_CAREERS: RepresorCareer[] = [
  {
    namePatterns: ['videla', 'jorge rafael videla'],
    status: 'dead',
    status_detail: 'Murió en prisión, Marcos Paz, 17/05/2013',
    ranks: ['Teniente General', 'Comandante en Jefe del Ejército', 'Presidente de facto'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Condenado 1985 (Causa 13/84), indultado 1990, recondenado 2010 cadena perpetua. Murió en prisión.',
    conviction_year: 1985,
    death_year: 2013,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['massera', 'emilio eduardo massera', 'emilio massera'],
    status: 'dead',
    status_detail: 'Fallecido, 08/11/2010, Buenos Aires',
    ranks: ['Almirante', 'Comandante de la Armada', 'Miembro Junta Militar I'],
    branch: 'ARMADA',
    post_dictatorship: 'Condenado 1985 cadena perpetua, indultado 1990, condenado robo de bebés 1998. Declarado incapaz 2002.',
    conviction_year: 1985,
    death_year: 2010,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['astiz', 'alfredo astiz'],
    status: 'imprisoned',
    status_detail: 'Condenado a cadena perpetua, detenido',
    ranks: ['Teniente de Fragata', 'Capitán de Corbeta', 'Capitán de Fragata'],
    branch: 'ARMADA',
    post_dictatorship: 'Condenado 2011 megacausa ESMA, cadena perpetua. Conocido como "Ángel de la Muerte". Infiltró Madres de Plaza de Mayo.',
    conviction_year: 2011,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['acosta', 'jorge acosta', 'jorge eduardo acosta', 'tigre acosta'],
    status: 'imprisoned',
    status_detail: 'Condenado a cadena perpetua, detenido',
    ranks: ['Capitán de Corbeta', 'Capitán de Fragata', 'Jefe GT 3.3.2 ESMA'],
    branch: 'ARMADA',
    post_dictatorship: 'Condenado 2011 megacausa ESMA, cadena perpetua. Jefe del Grupo de Tareas 3.3.2 en ESMA.',
    conviction_year: 2011,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['agosti', 'orlando agosti', 'orlando ramon agosti'],
    status: 'dead',
    status_detail: 'Fallecido, 14/10/1997',
    ranks: ['Brigadier General', 'Comandante de la Fuerza Aérea', 'Miembro Junta Militar I'],
    branch: 'FUERZA_AÉREA',
    post_dictatorship: 'Condenado 1985 a 4 años y 6 meses. Indultado 1990. Murió en libertad.',
    conviction_year: 1985,
    death_year: 1997,
    sentence: '4 años y 6 meses',
  },
  {
    namePatterns: ['viola', 'roberto viola', 'roberto eduardo viola'],
    status: 'dead',
    status_detail: 'Fallecido, 30/09/1994',
    ranks: ['Teniente General', 'Presidente de facto'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Condenado 1985 a 17 años, indultado 1990. Murió en libertad.',
    conviction_year: 1985,
    death_year: 1994,
    sentence: '17 años',
  },
  {
    namePatterns: ['galtieri', 'leopoldo galtieri', 'leopoldo fortunato galtieri'],
    status: 'dead',
    status_detail: 'Fallecido, 12/01/2003',
    ranks: ['Teniente General', 'Presidente de facto', 'Comandante en Jefe del Ejército'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Absuelto 1985 Causa 13. Condenado 1986 por Malvinas. Indultado 1990. Recondenado 2002 Plan Cóndor (murió durante proceso).',
    conviction_year: 1986,
    death_year: 2003,
    sentence: 'Absuelto / luego condenado',
  },
  {
    namePatterns: ['menendez', 'luciano benjamin menendez', 'luciano menendez'],
    status: 'dead',
    status_detail: 'Fallecido en prisión, 24/02/2018',
    ranks: ['General de División', 'Comandante III Cuerpo de Ejército'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Múltiples condenas a cadena perpetua (2008, 2010, 2012, 2016). Responsable de La Perla. Murió en prisión.',
    conviction_year: 2008,
    death_year: 2018,
    sentence: 'Cadena perpetua (múltiples)',
  },
  {
    namePatterns: ['camps', 'ramon camps', 'ramón camps'],
    status: 'dead',
    status_detail: 'Fallecido, 22/11/1994',
    ranks: ['General', 'Jefe Policía Provincia de Buenos Aires'],
    branch: 'PFA',
    post_dictatorship: 'Condenado 1986 a 25 años, indultado 1989. Murió en libertad.',
    conviction_year: 1986,
    death_year: 1994,
    sentence: '25 años',
  },
  {
    namePatterns: ['etchecolatz', 'miguel etchecolatz', 'miguel osvaldo etchecolatz'],
    status: 'dead',
    status_detail: 'Fallecido en prisión, 02/07/2022',
    ranks: ['Comisario General', 'Director de Investigaciones Policía Prov. BA'],
    branch: 'PFA',
    post_dictatorship: 'Condenado 2006 cadena perpetua (primer juicio post-reapertura). Caso Jorge Julio López (testigo desaparecido 2006). Murió en prisión.',
    conviction_year: 2006,
    death_year: 2022,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['bignone', 'reynaldo bignone', 'reynaldo benito bignone'],
    status: 'dead',
    status_detail: 'Fallecido, 07/03/2018',
    ranks: ['Teniente General', 'Presidente de facto'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Condenado 2010 robo de bebés, 2016 Plan Cóndor. Cadena perpetua. Murió en prisión.',
    conviction_year: 2010,
    death_year: 2018,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['suarez mason', 'carlos suarez mason', 'carlos guillermo suarez mason'],
    status: 'dead',
    status_detail: 'Fallecido en prisión, 21/06/2005',
    ranks: ['General de División', 'Comandante I Cuerpo de Ejército'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Prófugo en EE.UU. 1984-1988. Extraditado. Múltiples condenas. Murió en prisión.',
    conviction_year: 1988,
    death_year: 2005,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['bussi', 'antonio bussi', 'antonio domingo bussi'],
    status: 'dead',
    status_detail: 'Fallecido, 24/11/2011',
    ranks: ['General de Brigada', 'Gobernador de facto de Tucumán', 'Gobernador electo'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Electo gobernador de Tucumán 1995. Condenado 2008 secuestro y desaparición. Inhabilitado políticamente. Murió durante proceso.',
    conviction_year: 2008,
    death_year: 2011,
    sentence: 'Cadena perpetua',
  },
  {
    namePatterns: ['saint jean', 'ibérico saint jean', 'iberico saint jean'],
    status: 'dead',
    status_detail: 'Fallecido, 01/09/2012',
    ranks: ['General de Brigada', 'Gobernador de facto Prov. Buenos Aires'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Procesado por delitos de lesa humanidad. Murió antes de sentencia.',
    death_year: 2012,
    sentence: 'Procesado',
  },
  {
    namePatterns: ['harguindeguy', 'albano harguindeguy'],
    status: 'dead',
    status_detail: 'Fallecido, 28/07/2012',
    ranks: ['General de División', 'Ministro del Interior de facto'],
    branch: 'EJÉRCITO',
    post_dictatorship: 'Condenado 2010 cadena perpetua por privación ilegítima de la libertad. Murió en prisión domiciliaria.',
    conviction_year: 2010,
    death_year: 2012,
    sentence: 'Cadena perpetua',
  },
]

// ---------------------------------------------------------------------------
// Phase 1: Query represors from graph
// ---------------------------------------------------------------------------

interface RepresorNode {
  elementId: string
  name: string
  slug: string
  tier: string
  rank: string | null
  category: string
}

async function queryRepresors(): Promise<RepresorNode[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.category = 'represor' OR p.category = 'imputado')
       RETURN elementId(p) AS eid, p.name AS name, p.slug AS slug,
              coalesce(p.confidence_tier, 'bronze') AS tier,
              p.rank AS rank, p.category AS category
       ORDER BY p.confidence_tier, p.name`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      elementId: r.get('eid') as string,
      name: r.get('name') as string,
      slug: r.get('slug') as string,
      tier: r.get('tier') as string,
      rank: r.get('rank') as string | null,
      category: r.get('category') as string,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Match and enrich
// ---------------------------------------------------------------------------

function findCareerMatch(name: string): RepresorCareer | null {
  const nameLower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  for (const career of KNOWN_CAREERS) {
    for (const pattern of career.namePatterns) {
      const patternNorm = pattern.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (nameLower.includes(patternNorm) || patternNorm.includes(nameLower)) {
        return career
      }
    }
  }
  return null
}

async function enrichRepresor(
  represor: RepresorNode,
  career: RepresorCareer,
): Promise<boolean> {
  const driver = getDriver()
  const session = driver.session()

  try {
    await session.run(
      `MATCH (p) WHERE elementId(p) = $eid
       SET p.current_status = $status,
           p.status_detail = $statusDetail,
           p.career_ranks = $ranks,
           p.military_branch = $branch,
           p.post_dictatorship = $postDictatorship,
           p.conviction_year = $convictionYear,
           p.death_year = $deathYear,
           p.sentence = $sentence,
           p.enriched_wave = $wave,
           p.updated_at = datetime()`,
      {
        eid: represor.elementId,
        status: career.status,
        statusDetail: career.status_detail,
        ranks: career.ranks,
        branch: career.branch,
        postDictatorship: career.post_dictatorship,
        convictionYear: career.conviction_year || null,
        deathYear: career.death_year || null,
        sentence: career.sentence || null,
        wave: WAVE,
      },
    )
    return true
  } catch (err) {
    console.error(`  ERROR enriching ${represor.name}:`, err)
    return false
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Generate status summary
// ---------------------------------------------------------------------------

async function generateStatusReport(): Promise<void> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.category = 'represor' OR p.category = 'imputado')
         AND p.current_status IS NOT NULL
       RETURN p.current_status AS status, count(p) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    console.log('\n  Status breakdown (enriched represors):')
    for (const r of result.records) {
      console.log(`    ${(r.get('status') as string).padEnd(20)} ${toNumber(r.get('count'))}`)
    }

    // Conviction years
    const convictions = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.category = 'represor' OR p.category = 'imputado')
         AND p.conviction_year IS NOT NULL
       RETURN p.conviction_year AS year, count(p) AS count
       ORDER BY year`,
      { casoSlug: CASO_SLUG },
    )

    if (convictions.records.length > 0) {
      console.log('\n  Convictions by year:')
      for (const r of convictions.records) {
        console.log(`    ${toNumber(r.get('year'))}  ${toNumber(r.get('count'))} represors convicted`)
      }
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
  console.log('=== Wave 18: Represor Career Mapping ===\n')

  // Phase 1: Query represors
  console.log('--- Phase 1: Querying Represors ---')
  const represors = await queryRepresors()
  console.log(`  Found ${represors.length} represor/imputado nodes`)
  console.log(`  Gold: ${represors.filter((r) => r.tier === 'gold').length}`)
  console.log(`  Silver: ${represors.filter((r) => r.tier === 'silver').length}`)
  console.log(`  Bronze: ${represors.filter((r) => r.tier === 'bronze').length}`)

  // Phase 2: Match and enrich
  console.log('\n--- Phase 2: Career Enrichment ---')
  let enriched = 0
  let unmatched = 0
  const unmatchedNames: string[] = []

  for (const represor of represors) {
    const career = findCareerMatch(represor.name)
    if (career) {
      const success = await enrichRepresor(represor, career)
      if (success) {
        enriched++
        console.log(`  [MATCHED] ${represor.name} → ${career.status} (${career.sentence || 'no sentence'})`)
      }
    } else {
      unmatched++
      unmatchedNames.push(represor.name)
    }
  }

  console.log(`\n  Enriched: ${enriched}`)
  console.log(`  Unmatched: ${unmatched}`)

  if (unmatchedNames.length > 0) {
    console.log('\n  Unmatched represors (need manual research):')
    for (const name of unmatchedNames.slice(0, 30)) {
      console.log(`    - ${name}`)
    }
    if (unmatchedNames.length > 30) {
      console.log(`    ... and ${unmatchedNames.length - 30} more`)
    }
  }

  // Phase 3: Status report
  console.log('\n--- Phase 3: Status Report ---')
  await generateStatusReport()

  // Summary
  console.log('\n=== Wave 18 Summary ===')
  console.log(`  Total represors/imputados:  ${represors.length}`)
  console.log(`  Career data matched:        ${enriched}`)
  console.log(`  Unmatched:                  ${unmatched}`)
  console.log(`  Known career records:       ${KNOWN_CAREERS.length}`)

  await closeDriver()
  console.log('\nWave 18 complete!')
}

main().catch((err) => {
  console.error('Wave 18 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
