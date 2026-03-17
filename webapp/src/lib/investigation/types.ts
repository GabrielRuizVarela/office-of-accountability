import { z } from 'zod/v4'

/** Investigation lifecycle status */
export type InvestigationStatus = 'draft' | 'published' | 'archived'

/** Investigation as stored in Neo4j */
export interface Investigation {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly summary: string
  readonly body: string // TipTap JSON stringified
  readonly status: InvestigationStatus
  readonly tags: readonly string[]
  readonly author_id: string
  readonly referenced_node_ids: readonly string[]
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'bronze'
  readonly confidence_score: number
  readonly created_at: string
  readonly updated_at: string
  readonly published_at: string | null
}

/** Investigation with author info for display */
export interface InvestigationWithAuthor {
  readonly investigation: Investigation
  readonly author: {
    readonly id: string
    readonly name: string | null
    readonly image: string | null
  }
}

/** Investigation list item (lighter than full investigation) */
export interface InvestigationListItem {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly summary: string
  readonly status: InvestigationStatus
  readonly tags: readonly string[]
  readonly author_id: string
  readonly author_name: string | null
  readonly author_image: string | null
  readonly created_at: string
  readonly updated_at: string
  readonly published_at: string | null
}

/** Zod schema for creating an investigation */
export const createInvestigationSchema = z.object({
  title: z.string().min(1).max(500),
  summary: z.string().max(2000).optional().default(''),
  body: z.string().max(500_000), // TipTap JSON, 500KB max
  tags: z.array(z.string().min(1).max(100)).max(20).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  referenced_node_ids: z.array(z.string().min(1).max(500)).max(200).optional().default([]),
})

export type CreateInvestigationInput = z.infer<typeof createInvestigationSchema>

/** Zod schema for updating an investigation */
export const updateInvestigationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  summary: z.string().max(2000).optional(),
  body: z.string().max(500_000).optional(),
  tags: z.array(z.string().min(1).max(100)).max(20).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  referenced_node_ids: z.array(z.string().min(1).max(500)).max(200).optional(),
})

export type UpdateInvestigationInput = z.infer<typeof updateInvestigationSchema>

/** Zod schema for listing investigations (query params) */
export const listInvestigationsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  tag: z.string().min(1).max(100).optional(),
})

export type ListInvestigationsInput = z.infer<typeof listInvestigationsSchema>
