/**
 * Wave 17: Victim Demographics
 *
 * Comprehensive demographic analysis of caso-dictadura victims:
 *   1. Age distribution analysis
 *   2. Pregnancy analysis — count pregnant detainees
 *   3. Nationality distribution
 *   4. Birth province distribution
 *   5. Summary statistics → update investigation-data.ts with new ImpactStats
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-17.ts
 */

import neo4j from 'neo4j-driver-lite'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 17

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Phase 1: Age distribution
// ---------------------------------------------------------------------------

interface AgeData {
  name: string
  age: number
}

async function analyzeAgeDistribution(): Promise<{
  data: AgeData[]
  histogram: Map<string, number>
  median: number
  mean: number
  min: number
  max: number
  under18: number
  under25: number
  over60: number
}> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.age_at_event IS NOT NULL
       RETURN p.name AS name, p.age_at_event AS age`,
      { casoSlug: CASO_SLUG },
    )

    const data: AgeData[] = []
    for (const r of result.records) {
      const ageStr = r.get('age') as string
      const age = parseInt(ageStr)
      if (!isNaN(age) && age > 0 && age < 120) {
        data.push({ name: r.get('name') as string, age })
      }
    }

    data.sort((a, b) => a.age - b.age)

    const ages = data.map((d) => d.age)
    const mean = ages.length > 0 ? ages.reduce((s, a) => s + a, 0) / ages.length : 0
    const median = ages.length > 0 ? ages[Math.floor(ages.length / 2)] : 0

    // Build histogram by 5-year brackets
    const histogram = new Map<string, number>()
    for (const age of ages) {
      const bracket = `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4}`
      histogram.set(bracket, (histogram.get(bracket) || 0) + 1)
    }

    return {
      data,
      histogram,
      median,
      mean,
      min: ages.length > 0 ? ages[0] : 0,
      max: ages.length > 0 ? ages[ages.length - 1] : 0,
      under18: ages.filter((a) => a < 18).length,
      under25: ages.filter((a) => a < 25).length,
      over60: ages.filter((a) => a > 60).length,
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Pregnancy analysis
// ---------------------------------------------------------------------------

interface PregnancyData {
  name: string
  pregnancy: string
  detentionLocation: string | null
}

async function analyzePregnancy(): Promise<PregnancyData[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.pregnancy IS NOT NULL
         AND p.pregnancy <> ''
         AND toLower(p.pregnancy) <> 'no'
         AND toLower(p.pregnancy) <> 'n/a'
         AND toLower(p.pregnancy) <> 'sin dato'
       RETURN p.name AS name, p.pregnancy AS pregnancy,
              coalesce(p.detention_location, p.lugar_detencion, '') AS location`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      name: r.get('name') as string,
      pregnancy: r.get('pregnancy') as string,
      detentionLocation: r.get('location') as string || null,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Nationality distribution
// ---------------------------------------------------------------------------

async function analyzeNationality(): Promise<Map<string, number>> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.nationality IS NOT NULL
         AND p.nationality <> ''
       RETURN p.nationality AS nationality, count(p) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    const dist = new Map<string, number>()
    for (const r of result.records) {
      dist.set(r.get('nationality') as string, toNumber(r.get('count')))
    }
    return dist
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Birth province distribution
// ---------------------------------------------------------------------------

async function analyzeBirthProvince(): Promise<Map<string, number>> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.birth_province IS NOT NULL
         AND p.birth_province <> ''
       RETURN p.birth_province AS province, count(p) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    const dist = new Map<string, number>()
    for (const r of result.records) {
      dist.set(r.get('province') as string, toNumber(r.get('count')))
    }
    return dist
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 5: Category breakdown
// ---------------------------------------------------------------------------

async function analyzeCategories(): Promise<Map<string, number>> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
       RETURN coalesce(p.category, 'unknown') AS category, count(p) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    const dist = new Map<string, number>()
    for (const r of result.records) {
      dist.set(r.get('category') as string, toNumber(r.get('count')))
    }
    return dist
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 6: Update investigation-data.ts with new ImpactStats
// ---------------------------------------------------------------------------

function updateInvestigationData(stats: {
  totalPersonas: number
  ageMedian: number
  pregnantCount: number
  foreignCount: number
  under18Count: number
}): void {
  const filePath = path.resolve(
    __dirname,
    '../src/lib/caso-dictadura/investigation-data.ts',
  )

  const content = fs.readFileSync(filePath, 'utf-8')

  // Find the IMPACT_STATS array and append new entries
  const newStats = `
  {
    value: '${stats.totalPersonas.toLocaleString()}',
    label_en: 'Persons in graph (documented victims, represors, witnesses)',
    label_es: 'Personas en el grafo (victimas documentadas, represores, testigos)',
    source: 'OA caso-dictadura graph — Wave 17 demographics analysis',
  },
  {
    value: '${stats.ageMedian}',
    label_en: 'Median age at time of disappearance',
    label_es: 'Edad mediana al momento de la desaparicion',
    source: 'OA caso-dictadura graph — Wave 17 demographics analysis',
  },
  {
    value: '${stats.pregnantCount}',
    label_en: 'Pregnant women detained/disappeared (documented)',
    label_es: 'Mujeres embarazadas detenidas/desaparecidas (documentadas)',
    source: 'OA caso-dictadura graph — Wave 17 demographics analysis',
  },
  {
    value: '${stats.under18Count}',
    label_en: 'Minors (under 18) detained/disappeared',
    label_es: 'Menores de 18 anos detenidos/desaparecidos',
    source: 'OA caso-dictadura graph — Wave 17 demographics analysis',
  },`

  // Insert before the closing bracket of IMPACT_STATS
  const marker = ']\n\n// ---------------------------------------------------------------------------\n// JUDICIAL_RESPONSES'
  if (content.includes(marker)) {
    const updated = content.replace(
      marker,
      `${newStats}\n]\n\n// ---------------------------------------------------------------------------\n// JUDICIAL_RESPONSES`,
    )
    fs.writeFileSync(filePath, updated, 'utf-8')
    console.log('  Updated investigation-data.ts with new ImpactStats entries')
  } else {
    console.log('  WARNING: Could not find IMPACT_STATS insertion point in investigation-data.ts')
    console.log('  New stats to add manually:')
    console.log(newStats)
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
  console.log('=== Wave 17: Victim Demographics ===\n')

  // Total personas
  const driver = getDriver()
  const session = driver.session()
  let totalPersonas = 0
  try {
    const countResult = await session.run(
      `MATCH (p:DictaduraPersona) WHERE p.caso_slug = $casoSlug RETURN count(p) AS total`,
      { casoSlug: CASO_SLUG },
    )
    totalPersonas = toNumber(countResult.records[0]?.get('total'))
    console.log(`Total DictaduraPersona nodes: ${totalPersonas}\n`)
  } finally {
    await session.close()
  }

  // Phase 1: Age distribution
  console.log('--- Phase 1: Age Distribution ---')
  const age = await analyzeAgeDistribution()
  console.log(`  Victims with age data:  ${age.data.length}`)
  console.log(`  Mean age:               ${age.mean.toFixed(1)}`)
  console.log(`  Median age:             ${age.median}`)
  console.log(`  Min age:                ${age.min}`)
  console.log(`  Max age:                ${age.max}`)
  console.log(`  Under 18:               ${age.under18}`)
  console.log(`  Under 25:               ${age.under25}`)
  console.log(`  Over 60:                ${age.over60}`)

  console.log('\n  Age histogram (5-year brackets):')
  const sortedBrackets = [...age.histogram.entries()].sort(([a], [b]) => {
    const numA = parseInt(a.split('-')[0])
    const numB = parseInt(b.split('-')[0])
    return numA - numB
  })
  const maxBracketCount = Math.max(...sortedBrackets.map(([, c]) => c))
  for (const [bracket, count] of sortedBrackets) {
    const bar = '#'.repeat(Math.ceil((count / maxBracketCount) * 40))
    console.log(`    ${bracket.padEnd(8)} ${String(count).padStart(5)}  ${bar}`)
  }

  // Phase 2: Pregnancy
  console.log('\n--- Phase 2: Pregnancy Analysis ---')
  const pregnant = await analyzePregnancy()
  console.log(`  Pregnant detainees found: ${pregnant.length}`)
  if (pregnant.length > 0) {
    console.log('  Details:')
    for (const p of pregnant.slice(0, 20)) {
      const loc = p.detentionLocation ? ` — ${p.detentionLocation}` : ''
      console.log(`    ${p.name.padEnd(40)} ${p.pregnancy}${loc}`)
    }
    if (pregnant.length > 20) {
      console.log(`    ... and ${pregnant.length - 20} more`)
    }
  }

  // Phase 3: Nationality
  console.log('\n--- Phase 3: Nationality Distribution ---')
  const nationalities = await analyzeNationality()
  const totalWithNat = [...nationalities.values()].reduce((s, c) => s + c, 0)
  console.log(`  Victims with nationality data: ${totalWithNat}`)
  let foreignCount = 0
  for (const [nat, count] of nationalities) {
    const pct = ((count / totalWithNat) * 100).toFixed(1)
    console.log(`    ${nat.padEnd(25)} ${String(count).padStart(5)} (${pct}%)`)
    const natLower = nat.toLowerCase()
    if (natLower !== 'argentina' && natLower !== 'argentino' && natLower !== 'argentino/a') {
      foreignCount += count
    }
  }
  console.log(`  Foreign nationals:             ${foreignCount}`)

  // Phase 4: Birth province
  console.log('\n--- Phase 4: Birth Province Distribution ---')
  const provinces = await analyzeBirthProvince()
  const totalWithProv = [...provinces.values()].reduce((s, c) => s + c, 0)
  console.log(`  Victims with birth province data: ${totalWithProv}`)
  for (const [prov, count] of provinces) {
    const pct = ((count / totalWithProv) * 100).toFixed(1)
    console.log(`    ${prov.padEnd(25)} ${String(count).padStart(5)} (${pct}%)`)
  }

  // Phase 5: Category breakdown
  console.log('\n--- Phase 5: Category Breakdown ---')
  const categories = await analyzeCategories()
  for (const [cat, count] of categories) {
    const pct = ((count / totalPersonas) * 100).toFixed(1)
    console.log(`    ${cat.padEnd(20)} ${String(count).padStart(6)} (${pct}%)`)
  }

  // Phase 6: Update investigation-data.ts
  console.log('\n--- Phase 6: Updating Investigation Data ---')
  updateInvestigationData({
    totalPersonas,
    ageMedian: age.median,
    pregnantCount: pregnant.length,
    foreignCount,
    under18Count: age.under18,
  })

  // Summary
  console.log('\n=== Wave 17 Summary ===')
  console.log(`  Total personas:           ${totalPersonas}`)
  console.log(`  With age data:            ${age.data.length}`)
  console.log(`  Median age:               ${age.median}`)
  console.log(`  Pregnant detainees:       ${pregnant.length}`)
  console.log(`  Foreign nationals:        ${foreignCount}`)
  console.log(`  With birth province:      ${totalWithProv}`)
  console.log(`  Categories found:         ${categories.size}`)

  await closeDriver()
  console.log('\nWave 17 complete!')
}

main().catch((err) => {
  console.error('Wave 17 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
