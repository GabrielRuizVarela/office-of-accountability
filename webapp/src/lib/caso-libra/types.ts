/**
 * Caso Libra investigation — Zod schemas and TypeScript interfaces.
 *
 * Covers all node types and relationships for the Milei $LIBRA
 * memecoin investigation knowledge graph.
 */

import { z } from 'zod/v4'
import type { EventType } from '@/lib/investigations/types'

// ---------------------------------------------------------------------------
// Node schemas
// ---------------------------------------------------------------------------

export const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  role: z.string().optional(),
  description: z.string().optional(),
  photo_url: z.string().url().optional(),
  nationality: z.string().optional(),
})

export type Person = z.infer<typeof personSchema>

export const walletAddressSchema = z.object({
  address: z.string().min(1),
  label: z.string().optional(),
  owner_id: z.string().optional(),
  chain: z.literal('solana'),
})

export type WalletAddress = z.infer<typeof walletAddressSchema>

export const cryptoTransactionSchema = z.object({
  hash: z.string().min(1),
  from_address: z.string().min(1),
  to_address: z.string().min(1),
  amount_usd: z.number().nonnegative(),
  amount_sol: z.number().nonnegative().optional(),
  timestamp: z.string(),
})

export type CryptoTransaction = z.infer<typeof cryptoTransactionSchema>

export const eventTypeSchema = z.enum(['political', 'financial', 'legal', 'media'])

// Re-exported from investigations/types.ts (canonical location)
export type { EventType } from '@/lib/investigations/types'

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  source_url: z.string().url().optional(),
  event_type: eventTypeSchema,
})

export type CasoLibraEvent = z.infer<typeof eventSchema>

export const documentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  doc_type: z.string(),
  source_url: z.string().url().optional(),
  summary: z.string().optional(),
  date_published: z.string().optional(),
})

export type CasoLibraDocument = z.infer<typeof documentSchema>

export const organizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  org_type: z.string().optional(),
  description: z.string().optional(),
  country: z.string().optional(),
})

export type Organization = z.infer<typeof organizationSchema>

export const tokenSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(1),
  name: z.string().min(1),
  contract_address: z.string().min(1),
  chain: z.literal('solana'),
  launch_date: z.string(),
  peak_market_cap: z.number().optional(),
})

export type Token = z.infer<typeof tokenSchema>

// ---------------------------------------------------------------------------
// Relationship types
// ---------------------------------------------------------------------------

export type RelationshipType =
  | 'CONTROLS'
  | 'SENT'
  | 'COMMUNICATED_WITH'
  | 'MET_WITH'
  | 'PARTICIPATED_IN'
  | 'DOCUMENTED_BY'
  | 'MENTIONS'
  | 'PROMOTED'
  | 'CREATED_BY'
  | 'AFFILIATED_WITH'

// ---------------------------------------------------------------------------
// Event type display config (re-exported from investigations/types.ts)
// ---------------------------------------------------------------------------

export { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/investigations/types'

// ---------------------------------------------------------------------------
// Timeline item (flattened for display)
// ---------------------------------------------------------------------------

export interface TimelineItem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly date: string
  readonly event_type: EventType
  readonly source_url: string | null
  readonly actors: readonly { readonly id: string; readonly name: string }[]
}

// ---------------------------------------------------------------------------
// Investigation stats
// ---------------------------------------------------------------------------

export interface CasoLibraStats {
  readonly totalLossUsd: string
  readonly affectedWallets: string
  readonly priceDrop: string
  readonly actorCount: number
  readonly eventCount: number
  readonly documentCount: number
}
