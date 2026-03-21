/**
 * Cross-reference engine — links entities across all ETL data sources
 * using CUIT/DNI/name matching.
 */

export type {
  CrossRefMatch,
  CrossRefResult,
  FlagType,
  InvestigationFlag,
} from './types'

export { matchByCuit, matchByDni, matchByName } from './matchers'
export { runCrossReference } from './engine'
export { loadCrossRefMatches } from './loader'
export type { CrossRefLoadResult, LoadStepResult } from './loader'
