/**
 * Caso Libra Investigation — Input Schemas
 *
 * Zod schemas for validating investigation data submissions.
 * Used by both the API routes and CLI import scripts.
 * Designed for use by humans (web forms, JSON files) and
 * MCP agents (programmatic API calls).
 *
 * ## How to submit new investigation data
 *
 * POST /api/caso-libra/investigation
 *
 * Body: { type: string, data: object }
 *
 * Types:
 *   - "factcheck"  → Add/update a factchecked claim
 *   - "event"      → Add a timeline event
 *   - "actor"      → Add a person/organization to the investigation
 *   - "money_flow" → Add a financial flow
 *   - "evidence"   → Add a source document
 *   - "stat"       → Add/update an impact statistic
 *   - "government_response" → Add a government coverup action
 *
 * Example:
 * ```json
 * {
 *   "type": "factcheck",
 *   "data": {
 *     "claim_es": "Milei publico el token en X",
 *     "claim_en": "Milei posted the token on X",
 *     "status": "confirmed",
 *     "source": "Multiple sources",
 *     "source_url": "https://example.com/source"
 *   }
 * }
 * ```
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const factcheckStatusSchema = z.enum([
  'confirmed',
  'alleged',
  'denied',
  'under_investigation',
])

export const investigationCategorySchema = z.enum([
  'political',
  'financial',
  'legal',
  'media',
  'coverup',
])

export const verificationStatusSchema = z.enum([
  'verified',
  'partially_verified',
  'unverified',
])

// ---------------------------------------------------------------------------
// Entity schemas
// ---------------------------------------------------------------------------

export const factcheckInputSchema = z.object({
  id: z.string().min(1).optional(), // auto-generated if omitted
  claim_es: z.string().min(10, 'Spanish claim must be at least 10 characters'),
  claim_en: z.string().min(10, 'English claim must be at least 10 characters'),
  status: factcheckStatusSchema,
  source: z.string().min(1, 'Source name is required'),
  source_url: z.string().url('Must be a valid URL'),
  detail_es: z.string().optional(),
  detail_en: z.string().optional(),
})

export const eventInputSchema = z.object({
  id: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  title_es: z.string().min(5, 'Spanish title must be at least 5 characters'),
  title_en: z.string().min(5, 'English title must be at least 5 characters'),
  description_es: z.string().min(10),
  description_en: z.string().min(10),
  category: investigationCategorySchema,
  sources: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .min(1, 'At least one source is required'),
  is_new: z.boolean().optional(),
})

export const actorInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2, 'Actor name must be at least 2 characters'),
  role_es: z.string().min(3),
  role_en: z.string().min(3),
  description_es: z.string().min(10),
  description_en: z.string().min(10),
  nationality: z.string().min(2),
  is_new: z.boolean().optional(),
  status_es: z.string().optional(),
  status_en: z.string().optional(),
})

export const moneyFlowInputSchema = z.object({
  id: z.string().min(1).optional(),
  from_label: z.string().min(1, 'Source label is required'),
  to_label: z.string().min(1, 'Destination label is required'),
  amount_usd: z.number().positive('Amount must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  source: z.string().min(1, 'Source is required'),
})

export const evidenceInputSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  type_es: z.string().min(3),
  type_en: z.string().min(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  summary_es: z.string().min(10),
  summary_en: z.string().min(10),
  source_url: z.string().url('Must be a valid URL'),
  verification_status: verificationStatusSchema,
})

export const statInputSchema = z.object({
  id: z.string().min(1).optional(),
  value: z.string().min(1, 'Value is required (e.g. "$251M")'),
  label_es: z.string().min(3),
  label_en: z.string().min(3),
  source: z.string().min(1),
})

export const governmentResponseInputSchema = z.object({
  id: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  action_es: z.string().min(10),
  action_en: z.string().min(10),
  effect_es: z.string().min(10),
  effect_en: z.string().min(10),
  source: z.string().min(1),
  source_url: z.string().url('Must be a valid URL'),
})

// ---------------------------------------------------------------------------
// Unified submission schema
// ---------------------------------------------------------------------------

export const investigationSubmissionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('factcheck'), data: factcheckInputSchema }),
  z.object({ type: z.literal('event'), data: eventInputSchema }),
  z.object({ type: z.literal('actor'), data: actorInputSchema }),
  z.object({ type: z.literal('money_flow'), data: moneyFlowInputSchema }),
  z.object({ type: z.literal('evidence'), data: evidenceInputSchema }),
  z.object({ type: z.literal('stat'), data: statInputSchema }),
  z.object({ type: z.literal('government_response'), data: governmentResponseInputSchema }),
])

export type InvestigationSubmission = z.infer<typeof investigationSubmissionSchema>

// ---------------------------------------------------------------------------
// Bulk import schema
// ---------------------------------------------------------------------------

export const bulkImportSchema = z.object({
  items: z.array(investigationSubmissionSchema).min(1, 'At least one item is required').max(100, 'Maximum 100 items per request'),
})

export type BulkImport = z.infer<typeof bulkImportSchema>

// ---------------------------------------------------------------------------
// Type exports for consumers
// ---------------------------------------------------------------------------

export type FactcheckInput = z.infer<typeof factcheckInputSchema>
export type EventInput = z.infer<typeof eventInputSchema>
export type ActorInput = z.infer<typeof actorInputSchema>
export type MoneyFlowInput = z.infer<typeof moneyFlowInputSchema>
export type EvidenceInput = z.infer<typeof evidenceInputSchema>
export type StatInput = z.infer<typeof statInputSchema>
export type GovernmentResponseInput = z.infer<typeof governmentResponseInputSchema>
