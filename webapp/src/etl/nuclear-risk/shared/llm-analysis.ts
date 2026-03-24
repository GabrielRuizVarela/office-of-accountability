/**
 * LLM-powered nuclear signal analysis: classification, pattern detection, briefing.
 *
 * Uses Qwen 3.5 via llama.cpp for all 3 tasks.
 * Each task produces structured JSON output parsed from the LLM response.
 */

import { chatCompletion, parseJsonResponse } from './llm-client'
import { getDriver } from '../../../lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'
import { createHash } from 'node:crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignalForClassification {
  id: string
  title_en: string
  summary_en: string
  source_module: string
  tier: string
}

export interface ClassificationResult {
  id: string
  severity: number
  escalation_level: string
  signal_type: string
  theater: string
  actors: string[]
  weapon_systems: string[]
  treaties: string[]
}

export interface TheaterPattern {
  theater: string
  convergence_flags: string[]
  anomaly_flags: string[]
  trend: string
  score_override: number | null
  override_reasoning: string | null
}

export interface BriefingResult {
  overall_score: number
  summary_en: string
  summary_es: string
  theaters: { theater: string; score: number; trend: string; summary_en: string; summary_es: string }[]
  top_signals: string[]
}

// ---------------------------------------------------------------------------
// Validation & Factchecking — verify LLM output against known values
// ---------------------------------------------------------------------------

const VALID_ESCALATION_LEVELS = new Set(['routine', 'notable', 'elevated', 'serious', 'critical'])
const VALID_SIGNAL_TYPES = new Set([
  'nuclear_test', 'missile_launch', 'force_posture_change', 'treaty_action',
  'official_statement', 'inspection_event', 'proliferation_activity', 'facility_event',
  'military_exercise', 'diplomatic_action', 'osint_observation', 'policy_analysis',
])
const VALID_THEATERS = new Set([
  'US-Russia', 'Indo-Pacific', 'Korean Peninsula', 'Middle East', 'Europe', 'South Asia', 'Global',
])
const KNOWN_ACTOR_IDS = new Set([
  'us', 'russia', 'china', 'uk', 'france', 'india', 'pakistan', 'israel',
  'north-korea', 'iran', 'saudi-arabia', 'south-korea', 'japan', 'turkey',
])

/** Map common LLM output names to our actor IDs */
const ACTOR_NAME_MAP: Record<string, string> = {
  'united states': 'us', 'usa': 'us', 'us': 'us', 'america': 'us',
  'russia': 'russia', 'russian federation': 'russia', 'moscow': 'russia',
  'china': 'china', 'prc': 'china', 'beijing': 'china', 'people\'s republic of china': 'china',
  'united kingdom': 'uk', 'uk': 'uk', 'britain': 'uk', 'great britain': 'uk',
  'france': 'france', 'paris': 'france',
  'india': 'india', 'new delhi': 'india',
  'pakistan': 'pakistan', 'islamabad': 'pakistan',
  'israel': 'israel', 'tel aviv': 'israel',
  'north korea': 'north-korea', 'dprk': 'north-korea', 'pyongyang': 'north-korea',
  'iran': 'iran', 'tehran': 'iran', 'islamic republic of iran': 'iran',
  'saudi arabia': 'saudi-arabia', 'riyadh': 'saudi-arabia', 'ksa': 'saudi-arabia',
  'south korea': 'south-korea', 'rok': 'south-korea', 'seoul': 'south-korea',
  'japan': 'japan', 'tokyo': 'japan',
  'turkey': 'turkey', 'turkiye': 'turkey', 'ankara': 'turkey',
}

/** Resolve an actor reference (slug or name) to a known actor ID */
function resolveActorId(ref: string): string | null {
  const lower = ref.toLowerCase().trim()
  if (KNOWN_ACTOR_IDS.has(lower)) return lower
  return ACTOR_NAME_MAP[lower] ?? null
}

/**
 * Validate and sanitize a single classification result from the LLM.
 * Clamps values to valid ranges, rejects unknown enum values, and
 * filters entity references to known IDs.
 */
function validateClassification(
  c: ClassificationResult,
  batch: { id: string }[],
): ClassificationResult {
  // Ensure the ID matches a signal in the batch
  const validId = batch.some(s => s.id === c.id) ? c.id : batch[0]?.id ?? c.id

  // Clamp severity to 0-100
  const severity = typeof c.severity === 'number'
    ? Math.round(Math.min(100, Math.max(0, c.severity)))
    : 30

  // Validate escalation level
  const escalation_level = VALID_ESCALATION_LEVELS.has(c.escalation_level)
    ? c.escalation_level
    : mapSeverityToLevel(severity)

  // Validate signal type
  const signal_type = VALID_SIGNAL_TYPES.has(c.signal_type)
    ? c.signal_type
    : 'policy_analysis'

  // Validate theater
  const theater = VALID_THEATERS.has(c.theater)
    ? c.theater
    : 'Global'

  // Cross-check: escalation level should be consistent with severity
  const expectedLevel = mapSeverityToLevel(severity)
  if (escalation_level !== expectedLevel) {
    console.log(`    Factcheck: ${validId} severity=${severity} but level=${escalation_level} (expected ${expectedLevel}) — using LLM's level`)
  }

  // Resolve actors: map LLM names to known IDs, filter unknowns
  const rawActors = Array.isArray(c.actors) ? c.actors : []
  const resolvedActors: string[] = []
  const rejectedActors: string[] = []
  for (const a of rawActors) {
    const resolved = resolveActorId(a)
    if (resolved) resolvedActors.push(resolved)
    else rejectedActors.push(a)
  }
  const actors = [...new Set(resolvedActors)] // deduplicate

  if (rejectedActors.length > 0) {
    console.log(`    Factcheck: ${validId} rejected unknown actors: ${rejectedActors.join(', ')}`)
  }

  // Weapon systems and treaties are validated later when creating relationships
  // (MATCH will simply not find non-existent nodes)
  return {
    id: validId,
    severity,
    escalation_level,
    signal_type,
    theater,
    actors,
    weapon_systems: Array.isArray(c.weapon_systems) ? c.weapon_systems : [],
    treaties: Array.isArray(c.treaties) ? c.treaties : [],
  }
}

function mapSeverityToLevel(severity: number): string {
  if (severity >= 81) return 'critical'
  if (severity >= 61) return 'serious'
  if (severity >= 41) return 'elevated'
  if (severity >= 21) return 'notable'
  return 'routine'
}

// ---------------------------------------------------------------------------
// Task 1: Signal Classification
// ---------------------------------------------------------------------------

/**
 * Classify unscored signals via LLM. Batches up to 10 per prompt.
 */
export async function classifySignals(signals: SignalForClassification[]): Promise<ClassificationResult[]> {
  if (signals.length === 0) return []

  const results: ClassificationResult[] = []

  // Classify one signal at a time — more reliable JSON output from Qwen
  for (let i = 0; i < signals.length; i++) {
    const s = signals[i]
    console.log(`    Classifying signal ${i + 1}/${signals.length}: ${s.title_en.slice(0, 60)}...`)

    // Truncate inputs to fit ctx_size=8192 (prompt ~150 tok + reasoning ~2K + output ~200)
    const title = s.title_en.slice(0, 200)
    const summary = s.summary_en.slice(0, 300)

    let response
    try {
      response = await chatCompletion([
        {
          role: 'system',
          content: 'Classify this nuclear signal. Pick the MOST SPECIFIC theater. Return JSON: {"severity":0to100,"escalation_level":"routine/notable/elevated/serious/critical","signal_type":"nuclear_test/missile_launch/force_posture_change/treaty_action/official_statement/inspection_event/proliferation_activity/facility_event/military_exercise/diplomatic_action/osint_observation/policy_analysis","theater":"US-Russia/Indo-Pacific/Korean Peninsula/Middle East/Europe/South Asia/Global","actors":["us","russia","china","uk","france","india","pakistan","israel","north-korea","iran","saudi-arabia","south-korea","japan","turkey"],"weapon_systems":[],"treaties":[]}',
        },
        {
          role: 'user',
          content: `${title}. ${summary}`,
        },
      ], { maxTokens: 512, temperature: 0.1, enableThinking: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`      LLM error: ${msg.slice(0, 100)} — using defaults`)
      results.push({
        id: s.id, severity: 30, escalation_level: 'routine',
        signal_type: 'policy_analysis', theater: 'Global',
        actors: [], weapon_systems: [], treaties: [],
      })
      continue
    }
    const batch = [s]

    try {
      const raw = parseJsonResponse<ClassificationResult | ClassificationResult[]>(response.content)
      // Handle both single object and array responses
      const parsed = Array.isArray(raw) ? raw : [raw]
      const validated = parsed.map(c => validateClassification(c, batch))
      results.push(...validated)
      console.log(`      → severity=${validated[0]?.severity}, level=${validated[0]?.escalation_level}, theater=${validated[0]?.theater}`)
    } catch (err) {
      console.warn(`      Warning: failed to parse: ${err}`)
      results.push({
        id: s.id,
        severity: 30,
        escalation_level: 'routine',
        signal_type: 'policy_analysis',
        theater: 'Global',
        actors: [],
        weapon_systems: [],
        treaties: [],
      })
    }
  }

  return results
}

/**
 * Write classification results back to Neo4j and create entity links.
 */
export async function applyClassifications(classifications: ClassificationResult[]): Promise<number> {
  if (classifications.length === 0) return 0

  const driver = getDriver()
  const session = driver.session()
  let updated = 0

  try {
    // Update signal properties
    const result = await session.executeWrite((tx) =>
      tx.run(
        `UNWIND $items AS item
         MATCH (s:NuclearSignal {id: item.id})
         SET s.severity = item.severity,
             s.escalation_level = item.escalation_level,
             s.signal_type = item.signal_type,
             s.theater = item.theater
         RETURN count(s) AS count`,
        { items: classifications },
      ),
    )
    updated = result.records[0]?.get('count')?.toNumber?.() ?? 0

    // Create INVOLVES relationships to actors
    const actorRels = classifications.flatMap(c =>
      c.actors.map(a => ({ signal_id: c.id, actor_id: a })),
    )
    if (actorRels.length > 0) {
      await session.executeWrite((tx) =>
        tx.run(
          `UNWIND $rels AS r
           MATCH (s:NuclearSignal {id: r.signal_id})
           MATCH (a:NuclearActor {id: r.actor_id})
           MERGE (s)-[:INVOLVES]->(a)`,
          { rels: actorRels },
        ),
      )
    }

    // Create REFERENCES_SYSTEM relationships
    const weaponRels = classifications.flatMap(c =>
      c.weapon_systems.map(w => ({ signal_id: c.id, weapon_id: w })),
    )
    if (weaponRels.length > 0) {
      await session.executeWrite((tx) =>
        tx.run(
          `UNWIND $rels AS r
           MATCH (s:NuclearSignal {id: r.signal_id})
           MATCH (w:WeaponSystem {id: r.weapon_id})
           MERGE (s)-[:REFERENCES_SYSTEM]->(w)`,
          { rels: weaponRels },
        ),
      )
    }

    // Create REFERENCES_TREATY relationships
    const treatyRels = classifications.flatMap(c =>
      c.treaties.map(t => ({ signal_id: c.id, treaty_id: t })),
    )
    if (treatyRels.length > 0) {
      await session.executeWrite((tx) =>
        tx.run(
          `UNWIND $rels AS r
           MATCH (s:NuclearSignal {id: r.signal_id})
           MATCH (t:Treaty {id: r.treaty_id})
           MERGE (s)-[:REFERENCES_TREATY]->(t)`,
          { rels: treatyRels },
        ),
      )
    }
  } finally {
    await session.close()
  }

  return updated
}

// ---------------------------------------------------------------------------
// Task 2: Pattern Detection
// ---------------------------------------------------------------------------

/**
 * Detect escalation patterns per theater over the last 30 days.
 */
export async function detectPatterns(): Promise<TheaterPattern[]> {
  const driver = getDriver()
  const session = driver.session({ defaultAccessMode: 'READ' })

  try {
    // Get signals grouped by theater from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const result = await session.run(
      `MATCH (s:NuclearSignal)
       WHERE s.theater IS NOT NULL AND s.date >= $since
       RETURN s.theater AS theater,
              collect({
                id: s.id,
                date: s.date,
                title: s.title_en,
                severity: s.severity,
                escalation_level: s.escalation_level,
                signal_type: s.signal_type
              }) AS signals
       ORDER BY theater`,
      { since: thirtyDaysAgo },
    )

    const patterns: TheaterPattern[] = []

    for (const record of result.records) {
      const theater = record.get('theater') as string
      const signals = record.get('signals') as Record<string, unknown>[]

      if (!signals || signals.length === 0) continue

      // Compute 7-day rolling average
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const recentSignals = signals.filter((s: any) => s.date >= sevenDaysAgo)
      const avgSeverity = recentSignals.length > 0
        ? Math.round(recentSignals.reduce((sum: number, s: any) => sum + (s.severity ?? 0), 0) / recentSignals.length)
        : 0

      console.log(`    Analyzing ${theater}: ${signals.length} signals (7d avg severity: ${avgSeverity})...`)

      // Truncate signal data to fit context window
      const signalSummaries = signals.slice(0, 15).map((s: any) => ({
        date: s.date, title: (s.title ?? '').slice(0, 80), severity: s.severity, type: s.signal_type,
      }))

      let response
      try {
        response = await chatCompletion([
          {
            role: 'system',
            content: 'Analyze nuclear signals for patterns. Return JSON: {"convergence_flags":[],"anomaly_flags":[],"trend":"rising/stable/declining","score_override":null,"override_reasoning":null}',
          },
          {
            role: 'user',
            content: `Theater: ${theater}. Avg severity: ${avgSeverity}. Signals: ${JSON.stringify(signalSummaries)}`,
          },
        ], { maxTokens: 512, temperature: 0.1, enableThinking: false })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn(`      LLM error: ${msg.slice(0, 100)}`)
        patterns.push({ theater, convergence_flags: [], anomaly_flags: [], trend: 'stable', score_override: null, override_reasoning: null })
        continue
      }

      try {
        const parsed = parseJsonResponse<Omit<TheaterPattern, 'theater'>>(response.content)
        patterns.push({ theater, ...parsed })
      } catch {
        patterns.push({
          theater,
          convergence_flags: [],
          anomaly_flags: [],
          trend: 'stable',
          score_override: null,
          override_reasoning: null,
        })
      }
    }

    return patterns
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Task 3: Briefing Generation
// ---------------------------------------------------------------------------

/**
 * Generate a daily risk briefing from theater patterns and top signals.
 */
export async function generateBriefing(
  patterns: TheaterPattern[],
  classifications: ClassificationResult[],
): Promise<BriefingResult> {
  // Sort by severity descending, take top 10
  const topSignals = [...classifications]
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 10)

  const today = new Date().toISOString().split('T')[0]

  let response
  try {
    response = await chatCompletion([
      {
        role: 'system',
        content: 'Write nuclear risk briefing. Return JSON: {"overall_score":N,"summary_en":"...","summary_es":"...","theaters":[{"theater":"...","score":N,"trend":"rising/stable/declining","summary_en":"...","summary_es":"..."}],"top_signals":["id1"]}',
      },
      {
      role: 'user',
      content: `Date: ${today}. Patterns: ${JSON.stringify(patterns.map(p => ({ theater: p.theater, trend: p.trend })))}. Top signals: ${JSON.stringify(topSignals.slice(0, 5).map(s => ({ id: s.id, severity: s.severity, theater: s.theater })))}`,
    },
  ], { maxTokens: 512, temperature: 0.1, enableThinking: false })

    return parseJsonResponse<BriefingResult>(response.content)
  } catch {
    // Fallback briefing when LLM fails or returns unparseable JSON
    const maxScore = patterns.length > 0
      ? Math.max(...patterns.map(p => p.score_override ?? 30))
      : Math.round(classifications.reduce((s, c) => s + c.severity, 0) / Math.max(1, classifications.length))

    return {
      overall_score: maxScore,
      summary_en: `Daily briefing for ${today}. ${classifications.length} signals processed across ${patterns.length} theaters.`,
      summary_es: `Informe diario para ${today}. ${classifications.length} senales procesadas en ${patterns.length} teatros.`,
      theaters: patterns.map(p => ({
        theater: p.theater,
        score: p.score_override ?? 30,
        trend: p.trend,
        summary_en: p.convergence_flags.join('; ') || 'No significant patterns detected.',
        summary_es: 'Sin patrones significativos detectados.',
      })),
      top_signals: topSignals.map(s => s.id),
    }
  }
}

/**
 * Save briefing to Neo4j as a RiskBriefing node + SYNTHESIZES relationships.
 */
export async function saveBriefing(briefing: BriefingResult): Promise<string> {
  const driver = getDriver()
  const session = driver.session()
  const today = new Date().toISOString().split('T')[0]
  const briefingId = `briefing-${today}-${createHash('sha256').update(today + briefing.overall_score).digest('hex').slice(0, 8)}`

  try {
    await session.executeWrite((tx) =>
      tx.run(
        `MERGE (b:RiskBriefing {id: $id})
         SET b.date = $date,
             b.period = 'daily',
             b.overall_score = $overall_score,
             b.summary_en = $summary_en,
             b.summary_es = $summary_es,
             b.theaters_summary = $theaters_summary,
             b.tier = 'gold',
             b.confidence_score = 0.8,
             b.submitted_by = 'llm:qwen-3.5',
             b.created_at = datetime(),
             b.updated_at = datetime()
         RETURN b`,
        {
          id: briefingId,
          date: today,
          overall_score: briefing.overall_score,
          summary_en: briefing.summary_en,
          summary_es: briefing.summary_es,
          theaters_summary: JSON.stringify(briefing.theaters),
        },
      ),
    )

    // Link briefing to top signals
    if (briefing.top_signals.length > 0) {
      await session.executeWrite((tx) =>
        tx.run(
          `UNWIND $signals AS sid
           MATCH (b:RiskBriefing {id: $briefingId})
           MATCH (s:NuclearSignal {id: sid})
           MERGE (b)-[:SYNTHESIZES]->(s)`,
          { briefingId, signals: briefing.top_signals },
        ),
      )
    }

    return briefingId
  } finally {
    await session.close()
  }
}
