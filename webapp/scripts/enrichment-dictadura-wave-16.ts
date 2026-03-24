/**
 * Wave 16: Temporal Analysis
 *
 * Deep temporal analysis of the caso-dictadura graph:
 *   1. Parse all detention_date fields to extract year/month
 *   2. Create DictaduraEvento nodes for months with 50+ disappearances
 *   3. Generate temporal peaks report
 *   4. Link high-concentration events to geographic locations
 *   5. Identify "waves of repression" patterns
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-16.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 16
const PEAK_THRESHOLD = 50

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Date parsing
// ---------------------------------------------------------------------------

interface ParsedDate {
  year: number
  month: number
  key: string // "YYYY-MM"
}

function parseDate(dateStr: string): ParsedDate | null {
  if (!dateStr || dateStr.trim() === '') return null

  // YYYY-MM-DD
  const iso = dateStr.match(/^(\d{4})-(\d{1,2})/)
  if (iso) {
    const year = parseInt(iso[1])
    const month = parseInt(iso[2])
    if (year >= 1974 && year <= 1983 && month >= 1 && month <= 12) {
      return { year, month, key: `${year}-${String(month).padStart(2, '0')}` }
    }
  }

  // DD/MM/YYYY
  const slash = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slash) {
    const year = parseInt(slash[3])
    const month = parseInt(slash[2])
    if (year >= 1974 && year <= 1983 && month >= 1 && month <= 12) {
      return { year, month, key: `${year}-${String(month).padStart(2, '0')}` }
    }
  }

  // DD-MM-YYYY
  const dash = dateStr.match(/(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (dash) {
    const year = parseInt(dash[3])
    const month = parseInt(dash[2])
    if (year >= 1974 && year <= 1983 && month >= 1 && month <= 12) {
      return { year, month, key: `${year}-${String(month).padStart(2, '0')}` }
    }
  }

  // Just year
  const yearOnly = dateStr.match(/\b(197[4-9]|198[0-3])\b/)
  if (yearOnly) {
    const year = parseInt(yearOnly[1])
    return { year, month: 0, key: `${year}-00` }
  }

  return null
}

const MONTH_NAMES_ES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// ---------------------------------------------------------------------------
// Province extraction (reused from wave 10)
// ---------------------------------------------------------------------------

function extractProvince(location: string): string {
  const lower = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  const aliases: Record<string, string> = {
    'buenos aires': 'Buenos Aires',
    'capital federal': 'Capital Federal',
    'caba': 'Capital Federal',
    'cordoba': 'Córdoba',
    'santa fe': 'Santa Fe',
    'tucuman': 'Tucumán',
    'mendoza': 'Mendoza',
    'salta': 'Salta',
    'jujuy': 'Jujuy',
    'chaco': 'Chaco',
    'misiones': 'Misiones',
    'entre rios': 'Entre Ríos',
  }

  for (const [alias, province] of Object.entries(aliases)) {
    if (lower.includes(alias)) return province
  }

  const cities: Record<string, string> = {
    'rosario': 'Santa Fe',
    'la plata': 'Buenos Aires',
    'mar del plata': 'Buenos Aires',
    'esma': 'Capital Federal',
    'campo de mayo': 'Buenos Aires',
    'la perla': 'Córdoba',
    'el vesubio': 'Buenos Aires',
    'el olimpo': 'Capital Federal',
  }

  for (const [city, province] of Object.entries(cities)) {
    if (lower.includes(city)) return province
  }

  return 'Desconocida'
}

// ---------------------------------------------------------------------------
// Phase 1: Query all detention dates and aggregate
// ---------------------------------------------------------------------------

interface VictimTemporal {
  name: string
  date: string
  parsed: ParsedDate | null
  location: string | null
  province: string
}

async function queryVictimsWithDates(): Promise<VictimTemporal[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.detention_date IS NOT NULL OR p.fecha_detencion IS NOT NULL
              OR p.fecha_secuestro IS NOT NULL OR p.date IS NOT NULL)
       RETURN p.name AS name,
              coalesce(p.detention_date, p.fecha_detencion, p.fecha_secuestro, p.date) AS date,
              coalesce(p.detention_location, p.lugar_detencion, p.lugar_secuestro, p.location) AS location`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => {
      const dateStr = r.get('date') as string
      const location = r.get('location') as string | null
      return {
        name: r.get('name') as string,
        date: dateStr,
        parsed: parseDate(dateStr),
        location,
        province: location ? extractProvince(location) : 'Desconocida',
      }
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Create DictaduraEvento nodes for peak months
// ---------------------------------------------------------------------------

interface MonthlyPeak {
  key: string
  year: number
  month: number
  count: number
  provinces: Map<string, number>
}

async function createPeakEvents(peaks: MonthlyPeak[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    for (const peak of peaks) {
      const monthName = peak.month > 0 ? MONTH_NAMES_ES[peak.month] : 'Año'
      const title = `Ola de represión — ${monthName} ${peak.year} (${peak.count} desapariciones)`
      const slug = `ola-represion-${peak.key}`

      const topProvinces = [...peak.provinces.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([p, c]) => `${p}: ${c}`)
        .join(', ')

      const description = `En ${monthName.toLowerCase()} de ${peak.year} se registraron ${peak.count} desapariciones forzadas. Principales focos: ${topProvinces}.`

      const dateStr = peak.month > 0
        ? `${peak.year}-${String(peak.month).padStart(2, '0')}-01`
        : `${peak.year}-01-01`

      const result = await session.run(
        `MERGE (e:DictaduraEvento { slug: $slug, caso_slug: $casoSlug })
         ON CREATE SET
           e.id = randomUUID(),
           e.title = $title,
           e.date = $date,
           e.event_type = 'operativo',
           e.description = $description,
           e.disappearance_count = $count,
           e.confidence_tier = 'silver',
           e.source = 'temporal-analysis',
           e.ingestion_wave = $wave,
           e.caso_slug = $casoSlug,
           e.created_at = datetime()
         ON MATCH SET
           e.disappearance_count = $count,
           e.description = $description,
           e.updated_at = datetime()
         RETURN e`,
        {
          slug,
          title,
          date: dateStr,
          description,
          count: peak.count,
          wave: WAVE,
          casoSlug: CASO_SLUG,
        },
      )
      if (result.records.length > 0) created++
    }
    return created
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Link events to geographic locations
// ---------------------------------------------------------------------------

async function linkEventsToLocations(peaks: MonthlyPeak[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0

  try {
    for (const peak of peaks) {
      const slug = `ola-represion-${peak.key}`

      // Link to DictaduraLugar nodes matching top provinces
      const topProvinces = [...peak.provinces.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p]) => p)
        .filter((p) => p !== 'Desconocida')

      for (const province of topProvinces) {
        const result = await session.run(
          `MATCH (e:DictaduraEvento { slug: $slug, caso_slug: $casoSlug })
           MATCH (l:DictaduraLugar)
           WHERE l.caso_slug = $casoSlug
             AND (l.province = $province OR l.name = $province)
           MERGE (e)-[r:OCURRIO_EN]->(l)
           ON CREATE SET
             r.source = 'temporal-analysis',
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.disappearances_in_area = $count,
             r.created_at = datetime()
           RETURN r`,
          {
            slug,
            province,
            count: peak.provinces.get(province) || 0,
            wave: WAVE,
            casoSlug: CASO_SLUG,
          },
        )
        linked += result.records.length
      }
    }
    return linked
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Identify waves of repression patterns
// ---------------------------------------------------------------------------

interface RepressionWave {
  startKey: string
  endKey: string
  months: number
  totalDisappearances: number
  peakMonth: string
  peakCount: number
}

function identifyRepressionWaves(
  monthly: Map<string, number>,
  threshold: number,
): RepressionWave[] {
  const sorted = [...monthly.entries()]
    .filter(([key]) => !key.endsWith('-00'))
    .sort(([a], [b]) => a.localeCompare(b))

  const waves: RepressionWave[] = []
  let current: { start: string; months: string[]; counts: number[] } | null = null

  for (const [key, count] of sorted) {
    if (count >= threshold) {
      if (!current) {
        current = { start: key, months: [key], counts: [count] }
      } else {
        current.months.push(key)
        current.counts.push(count)
      }
    } else {
      if (current && current.months.length >= 2) {
        const total = current.counts.reduce((s, c) => s + c, 0)
        const peakIdx = current.counts.indexOf(Math.max(...current.counts))
        waves.push({
          startKey: current.start,
          endKey: current.months[current.months.length - 1],
          months: current.months.length,
          totalDisappearances: total,
          peakMonth: current.months[peakIdx],
          peakCount: current.counts[peakIdx],
        })
      }
      current = null
    }
  }

  // Close final wave
  if (current && current.months.length >= 2) {
    const total = current.counts.reduce((s, c) => s + c, 0)
    const peakIdx = current.counts.indexOf(Math.max(...current.counts))
    waves.push({
      startKey: current.start,
      endKey: current.months[current.months.length - 1],
      months: current.months.length,
      totalDisappearances: total,
      peakMonth: current.months[peakIdx],
      peakCount: current.counts[peakIdx],
    })
  }

  return waves
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  process.env.NEO4J_QUERY_TIMEOUT_MS = '180000'

  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j')
    process.exit(1)
  }
  console.log('Connected to Neo4j\n')
  console.log('=== Wave 16: Temporal Analysis ===\n')

  // Phase 1: Query and aggregate
  console.log('--- Phase 1: Parsing Detention Dates ---')
  const victims = await queryVictimsWithDates()
  const parsed = victims.filter((v) => v.parsed !== null)
  const unparsed = victims.filter((v) => v.parsed === null)
  console.log(`  Total victims with date field:  ${victims.length}`)
  console.log(`  Successfully parsed:            ${parsed.length}`)
  console.log(`  Failed to parse:                ${unparsed.length}`)

  // Aggregate by year-month
  const monthly = new Map<string, number>()
  const monthlyProvinces = new Map<string, Map<string, number>>()
  const yearly = new Map<number, number>()

  for (const v of parsed) {
    const p = v.parsed!
    monthly.set(p.key, (monthly.get(p.key) || 0) + 1)
    yearly.set(p.year, (yearly.get(p.year) || 0) + 1)

    if (!monthlyProvinces.has(p.key)) {
      monthlyProvinces.set(p.key, new Map())
    }
    const provMap = monthlyProvinces.get(p.key)!
    provMap.set(v.province, (provMap.get(v.province) || 0) + 1)
  }

  // Report yearly distribution
  console.log('\n--- Yearly Distribution ---')
  const sortedYears = [...yearly.entries()].sort(([a], [b]) => a - b)
  const maxYearCount = Math.max(...sortedYears.map(([, c]) => c))
  for (const [year, count] of sortedYears) {
    const bar = '#'.repeat(Math.ceil((count / maxYearCount) * 50))
    console.log(`  ${year}  ${String(count).padStart(5)}  ${bar}`)
  }

  // Report monthly distribution (top 20)
  console.log('\n--- Monthly Distribution (Top 20) ---')
  const sortedMonthly = [...monthly.entries()]
    .filter(([key]) => !key.endsWith('-00'))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)

  for (const [key, count] of sortedMonthly) {
    const [year, month] = key.split('-')
    const monthName = MONTH_NAMES_ES[parseInt(month)] || '?'
    const bar = '#'.repeat(Math.ceil((count / sortedMonthly[0][1]) * 40))
    console.log(`  ${monthName.padEnd(12)} ${year}  ${String(count).padStart(5)}  ${bar}`)
  }

  // Phase 2: Create peak events
  console.log(`\n--- Phase 2: Creating Peak Events (threshold >= ${PEAK_THRESHOLD}) ---`)
  const peaks: MonthlyPeak[] = [...monthly.entries()]
    .filter(([key, count]) => count >= PEAK_THRESHOLD && !key.endsWith('-00'))
    .map(([key, count]) => {
      const [yearStr, monthStr] = key.split('-')
      return {
        key,
        year: parseInt(yearStr),
        month: parseInt(monthStr),
        count,
        provinces: monthlyProvinces.get(key) || new Map(),
      }
    })
    .sort((a, b) => b.count - a.count)

  console.log(`  Found ${peaks.length} months with ${PEAK_THRESHOLD}+ disappearances`)
  const eventsCreated = await createPeakEvents(peaks)
  console.log(`  Created/updated ${eventsCreated} DictaduraEvento nodes`)

  // Phase 3: Link to locations
  console.log('\n--- Phase 3: Linking Events to Locations ---')
  const locationsLinked = await linkEventsToLocations(peaks)
  console.log(`  Created ${locationsLinked} OCURRIO_EN relationships`)

  // Phase 4: Repression wave patterns
  console.log('\n--- Phase 4: Repression Wave Patterns ---')
  // Use a lower threshold for wave detection
  const waveThreshold = Math.max(20, Math.floor(PEAK_THRESHOLD / 2))
  const repressionWaves = identifyRepressionWaves(monthly, waveThreshold)

  if (repressionWaves.length > 0) {
    console.log(`  Detected ${repressionWaves.length} sustained repression waves:`)
    for (const wave of repressionWaves) {
      console.log(`    ${wave.startKey} to ${wave.endKey} (${wave.months} months)`)
      console.log(`      Total disappearances: ${wave.totalDisappearances}`)
      console.log(`      Peak: ${wave.peakMonth} (${wave.peakCount})`)
    }
  } else {
    console.log('  No sustained multi-month waves detected at current threshold')
  }

  // Phase 5: Temporal peaks report
  console.log('\n--- Phase 5: Temporal Peaks Geographic Breakdown ---')
  for (const peak of peaks.slice(0, 10)) {
    const monthName = MONTH_NAMES_ES[peak.month]
    console.log(`\n  ${monthName} ${peak.year}: ${peak.count} disappearances`)
    const topProv = [...peak.provinces.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    for (const [prov, count] of topProv) {
      const pct = ((count / peak.count) * 100).toFixed(1)
      console.log(`    ${prov.padEnd(25)} ${String(count).padStart(4)} (${pct}%)`)
    }
  }

  // Summary
  console.log('\n=== Wave 16 Summary ===')
  console.log(`  Dates parsed:              ${parsed.length} / ${victims.length}`)
  console.log(`  Peak month events created: ${eventsCreated}`)
  console.log(`  Location links created:    ${locationsLinked}`)
  console.log(`  Repression waves found:    ${repressionWaves.length}`)
  console.log(`  Year range:                ${sortedYears[0]?.[0] || '?'}-${sortedYears[sortedYears.length - 1]?.[0] || '?'}`)

  await closeDriver()
  console.log('\nWave 16 complete!')
}

main().catch((err) => {
  console.error('Wave 16 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
