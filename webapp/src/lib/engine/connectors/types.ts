/**
 * Connector types — M10 Source Connectors (Phase 4).
 *
 * Shared Connector interface, ConnectorResult, and per-kind config
 * Zod schemas for runtime validation.
 */

import { z } from 'zod/v4'
import type { ConnectorKind } from '../types'

// ---------------------------------------------------------------------------
// ConnectorResult — what every connector returns
// ---------------------------------------------------------------------------

export interface ConnectorResult {
  records: Record<string, unknown>[]
  metadata: {
    source: string
    fetched_at: string
    record_count: number
  }
}

// ---------------------------------------------------------------------------
// Connector interface — implemented by each kind
// ---------------------------------------------------------------------------

export interface Connector {
  kind: ConnectorKind
  fetch(config: Record<string, unknown>): Promise<ConnectorResult>
}

// ---------------------------------------------------------------------------
// Per-kind config Zod schemas
// ---------------------------------------------------------------------------

export const restApiConfigSchema = z.object({
  base_url: z.string().url(),
  path: z.string().min(1),
  headers: z.record(z.string(), z.string()).optional(),
  pagination: z
    .object({
      type: z.enum(['offset', 'cursor']),
      page_param: z.string().min(1),
      limit_param: z.string().min(1),
      limit: z.number().int().min(1),
    })
    .optional(),
})

export type RestApiConfig = z.infer<typeof restApiConfigSchema>

export const fileUploadConfigSchema = z.object({
  file_path: z.string().min(1),
  format: z.enum(['csv', 'json']),
})

export type FileUploadConfig = z.infer<typeof fileUploadConfigSchema>

export const customScriptConfigSchema = z.object({
  script_path: z.string().min(1),
  args: z.array(z.string()).optional(),
})

export type CustomScriptConfig = z.infer<typeof customScriptConfigSchema>
