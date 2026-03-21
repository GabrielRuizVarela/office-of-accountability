/**
 * File upload connector — M10 Source Connectors (Phase 4).
 *
 * Reads records from local CSV or JSON files.
 */

import { readFile } from 'fs/promises'
import type { ConnectorKind } from '../types'
import type { Connector, ConnectorResult } from './types'
import { fileUploadConfigSchema } from './types'

/**
 * Parses a single CSV line, handling quoted fields.
 * Quoted fields may contain commas and escaped quotes (`""` → `"`).
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let i = 0

  while (i < line.length) {
    if (line[i] === '"') {
      // Quoted field
      i++ // skip opening quote
      let value = ''
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            // Escaped quote
            value += '"'
            i += 2
          } else {
            // Closing quote
            i++ // skip closing quote
            break
          }
        } else {
          value += line[i]
          i++
        }
      }
      fields.push(value)
      // Skip comma after closing quote
      if (i < line.length && line[i] === ',') i++
    } else {
      // Unquoted field
      const commaIdx = line.indexOf(',', i)
      if (commaIdx === -1) {
        fields.push(line.slice(i))
        break
      } else {
        fields.push(line.slice(i, commaIdx))
        i = commaIdx + 1
      }
    }
  }

  return fields
}

export class FileUploadConnector implements Connector {
  kind: ConnectorKind = 'file_upload'

  async fetch(config: Record<string, unknown>): Promise<ConnectorResult> {
    const parsed = fileUploadConfigSchema.parse(config)
    const content = await readFile(parsed.file_path, 'utf-8')

    let records: Record<string, unknown>[]

    if (parsed.format === 'json') {
      const data: unknown = JSON.parse(content)
      if (!Array.isArray(data)) throw new Error('JSON file must contain a top-level array')
      records = data as Record<string, unknown>[]
    } else {
      records = this.parseCSV(content)
    }

    return {
      records,
      metadata: {
        source: parsed.file_path,
        fetched_at: new Date().toISOString(),
        record_count: records.length,
      },
    }
  }

  private parseCSV(content: string): Record<string, string>[] {
    const lines = content.split('\n').filter((line) => line.trim() !== '')
    if (lines.length === 0) return []

    const headers = parseCSVLine(lines[0])
    const records: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const record: Record<string, string> = {}
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = values[j] ?? ''
      }
      records.push(record)
    }

    return records
  }
}
