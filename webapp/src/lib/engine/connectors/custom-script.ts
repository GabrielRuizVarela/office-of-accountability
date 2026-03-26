/**
 * Custom script connector - M10 Source Connectors (Phase 4).
 *
 * Runs a server-side Node script via execFile (no shell) and
 * parses its stdout as JSONL (one JSON object per line).
 */

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { ConnectorKind } from '../types'
import type { Connector, ConnectorResult } from './types'
import { customScriptConfigSchema } from './types'

const execFileAsync = promisify(execFile)

export class CustomScriptConnector implements Connector {
  kind: ConnectorKind = 'custom_script'

  async fetch(config: Record<string, unknown>): Promise<ConnectorResult> {
    const parsed = customScriptConfigSchema.parse(config)
    const { stdout } = await execFileAsync(parsed.script_path, parsed.args ?? [])

    const lines = stdout.split('\n').filter((line) => line.trim() !== '')
    const records: Record<string, unknown>[] = []

    for (let i = 0; i < lines.length; i++) {
      try {
        records.push(JSON.parse(lines[i]) as Record<string, unknown>)
      } catch (err) {
        throw new Error(
          `Failed to parse JSONL at line ${i + 1}: ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }

    return {
      records,
      metadata: {
        source: parsed.script_path,
        fetched_at: new Date().toISOString(),
        record_count: records.length,
      },
    }
  }
}
