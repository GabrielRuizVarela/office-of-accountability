/**
 * Caso Finanzas Politicas - barrel exports.
 */

// Types and schemas
export {
  CASO_FINPOL_SLUG,
  finPolPersonSchema,
  finPolEventSchema,
  finPolDocumentSchema,
  finPolOrganizationSchema,
  finPolMoneyFlowSchema,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
} from './types'

export type {
  FinPolPerson,
  FinPolEvent,
  FinPolDocument,
  FinPolOrganization,
  FinPolMoneyFlow,
  RelationshipType,
  EventType,
  TimelineItem,
  FinPolStats,
} from './types'

// Query functions
export {
  getInvestigationGraph,
  getTimeline,
  getPersonBySlug,
  getActors,
  getDocuments,
  getMoneyFlows,
  getStats,
} from './queries'

// Transform functions
export {
  toPerson,
  toEvent,
  toDocument,
  toOrganization,
  toMoneyFlow,
} from './transform'
