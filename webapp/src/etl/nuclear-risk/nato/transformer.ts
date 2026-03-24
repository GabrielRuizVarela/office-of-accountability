/**
 * Transform NATO RSS items into NuclearSignal parameters for Neo4j.
 */
import { createHash } from 'node:crypto'
import type { RssItem } from '../shared/rss-parser'
import type { NatoSignalParams } from './types'

function generateHash(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export interface TransformNatoResult {
  readonly signals: NatoSignalParams[]
  readonly stats: {
    readonly transformed: number
    readonly skipped: number
  }
}

export function transformNatoItems(items: readonly RssItem[]): TransformNatoResult {
  const signals: NatoSignalParams[] = []
  let skipped = 0
  const now = new Date().toISOString()

  for (const item of items) {
    if (!item.title || !item.link) {
      skipped++
      continue
    }

    const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : now.split('T')[0]
    const id = `nato-${slugify(item.title)}-${generateHash(item.guid || item.link)}`

    signals.push({
      id,
      date,
      title_en: item.title,
      title_es: '', // to be filled by LLM in Phase 3
      summary_en: item.description || item.title,
      summary_es: '',
      source_url: item.link,
      source_module: 'nato',
      tier: 'gold',
      confidence_score: 0.9,
      ingestion_hash: generateHash(`${item.guid}${item.pubDate}`),
      submitted_by: 'etl:nato',
      created_at: now,
      updated_at: now,
    })
  }

  return {
    signals,
    stats: { transformed: signals.length, skipped },
  }
}
