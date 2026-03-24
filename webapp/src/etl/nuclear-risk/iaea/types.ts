/**
 * Types for IAEA RSS ETL module.
 * Source: IAEA News Centre RSS feed.
 */
import { z } from 'zod/v4'

export const iaeaRawItemSchema = z.object({
  title: z.string().default(''),
  link: z.string().default(''),
  description: z.string().default(''),
  pubDate: z.string().default(''),
  guid: z.string().default(''),
})
export type IaeaRawItem = z.infer<typeof iaeaRawItemSchema>

export interface IaeaSignalParams {
  readonly id: string
  readonly date: string
  readonly title_en: string
  readonly title_es: string
  readonly summary_en: string
  readonly summary_es: string
  readonly source_url: string
  readonly source_module: string
  readonly tier: 'gold'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly submitted_by: string
  readonly created_at: string
  readonly updated_at: string
}
