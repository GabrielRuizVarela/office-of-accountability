/**
 * Nuclear risk escalation scoring model.
 *
 * Computes per-signal severity (0-100), maps to escalation ladder,
 * and aggregates into theater + overall risk scores with time decay.
 */

import type { EscalationLevel, Theater, TrendDirection } from './types'

// ---------------------------------------------------------------------------
// Per-signal severity factors and weights
// ---------------------------------------------------------------------------

/** Weights for severity calculation factors (must sum to 1.0) */
const WEIGHTS = {
  sourceTier: 0.2,
  eventType: 0.3,
  actorStatus: 0.15,
  novelty: 0.15,
  corroboration: 0.2,
} as const

/** Base severity by signal type (event_type factor) */
const SIGNAL_TYPE_SEVERITY: Record<string, number> = {
  nuclear_test: 95,
  missile_launch: 75,
  force_posture_change: 65,
  treaty_action: 55,
  official_statement: 35,
  inspection_event: 50,
  proliferation_activity: 70,
  facility_event: 45,
  military_exercise: 25,
  diplomatic_action: 30,
  osint_observation: 40,
  policy_analysis: 20,
}

/** Base score by source tier */
const TIER_SCORES: Record<string, number> = {
  gold: 90,
  silver: 60,
  bronze: 30,
}

/** Base score by actor nuclear status */
const ACTOR_STATUS_SCORES: Record<string, number> = {
  armed: 80,
  threshold: 50,
  'non-nuclear': 20,
}

// ---------------------------------------------------------------------------
// Severity computation
// ---------------------------------------------------------------------------

export interface SeverityInput {
  readonly signalType: string
  readonly sourceTier: 'gold' | 'silver' | 'bronze'
  readonly actorNuclearStatus: string
  readonly isNovel: boolean
  readonly sourceCount: number
}

/**
 * Compute a severity score (0-100) for a single signal.
 */
export function computeSeverity(input: SeverityInput): number {
  const eventScore = SIGNAL_TYPE_SEVERITY[input.signalType] ?? 30
  const tierScore = TIER_SCORES[input.sourceTier] ?? 30
  const actorScore = ACTOR_STATUS_SCORES[input.actorNuclearStatus] ?? 30
  const noveltyScore = input.isNovel ? 90 : 30
  const corroborationScore = Math.min(input.sourceCount * 30, 100)

  const raw =
    WEIGHTS.eventType * eventScore +
    WEIGHTS.sourceTier * tierScore +
    WEIGHTS.actorStatus * actorScore +
    WEIGHTS.novelty * noveltyScore +
    WEIGHTS.corroboration * corroborationScore

  return Math.round(Math.min(100, Math.max(0, raw)))
}

// ---------------------------------------------------------------------------
// Escalation ladder mapping
// ---------------------------------------------------------------------------

/**
 * Map a severity score to an escalation level.
 */
export function mapToEscalationLevel(severity: number): EscalationLevel {
  if (severity >= 81) return 'critical'
  if (severity >= 61) return 'serious'
  if (severity >= 41) return 'elevated'
  if (severity >= 21) return 'notable'
  return 'routine'
}

// ---------------------------------------------------------------------------
// Theater aggregation with time decay
// ---------------------------------------------------------------------------

interface DatedSignal {
  readonly date: string
  readonly severity: number
}

/**
 * Compute a theater risk score from recent signals with time decay.
 *
 * Decay: today = 100%, 7 days ago = 30%.
 * Linear interpolation between.
 */
export function computeTheaterScore(signals: DatedSignal[], asOfDate: Date = new Date()): number {
  if (signals.length === 0) return 0

  const DECAY_DAYS = 7
  const MIN_WEIGHT = 0.3

  let weightedSum = 0
  let totalWeight = 0

  for (const signal of signals) {
    const signalDate = new Date(signal.date)
    const daysAgo = (asOfDate.getTime() - signalDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysAgo < 0 || daysAgo > DECAY_DAYS) continue

    const decay = 1 - ((1 - MIN_WEIGHT) * daysAgo) / DECAY_DAYS
    const weight = Math.max(MIN_WEIGHT, decay)

    weightedSum += signal.severity * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return 0
  return Math.round(weightedSum / totalWeight)
}

// ---------------------------------------------------------------------------
// Overall risk score
// ---------------------------------------------------------------------------

interface TheaterScore {
  readonly theater: Theater
  readonly score: number
  readonly trend: TrendDirection
}

/**
 * Compute overall risk: highest theater score (weakest-link model).
 * Also returns average across all theaters for trend tracking.
 */
export function computeOverallRisk(theaterScores: TheaterScore[]): {
  overall: number
  average: number
  highestTheater: Theater | null
} {
  if (theaterScores.length === 0) {
    return { overall: 0, average: 0, highestTheater: null }
  }

  let highest = theaterScores[0]
  let sum = 0

  for (const ts of theaterScores) {
    sum += ts.score
    if (ts.score > highest.score) highest = ts
  }

  return {
    overall: highest.score,
    average: Math.round(sum / theaterScores.length),
    highestTheater: highest.theater,
  }
}
