/**
 * Tool registration index.
 *
 * Import this file to register all tool handlers with the registry.
 * Each tool handler file registers its tools as a side effect on import.
 *
 * Tool handlers are added incrementally per M13 phase:
 * - Phase 2: investigation.*, graph.*
 * - Phase 3: pipeline.*, orchestrator.*
 * - Phase 4: compliance.*, audit.*, snapshot.*
 */

// Phase 2 (M13 Phase 2):
import './investigation'
import './graph'

// Phase 3 (M13 Phase 3):
// import './pipeline'
// import './orchestrator'

// Phase 4 (M13 Phase 4):
// import './compliance'
// import './audit'
