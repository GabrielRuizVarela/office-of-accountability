import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ConflictRecord, WaveReport } from './types'

const CONFLICTS_DIR = join(process.cwd(), '_ingestion_data')

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

export function saveConflicts(wave: number, conflicts: ConflictRecord[]): string {
  ensureDir(CONFLICTS_DIR)
  const path = join(CONFLICTS_DIR, `wave-${wave}-conflicts.json`)
  writeFileSync(path, JSON.stringify(conflicts, null, 2))
  return path
}

export function loadConflicts(wave: number): ConflictRecord[] {
  const path = join(CONFLICTS_DIR, `wave-${wave}-conflicts.json`)
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export function saveResumeState(wave: number, state: Record<string, unknown>): void {
  ensureDir(CONFLICTS_DIR)
  const path = join(CONFLICTS_DIR, `wave-${wave}-resume.json`)
  writeFileSync(path, JSON.stringify(state, null, 2))
}

export function loadResumeState(wave: number): Record<string, unknown> | null {
  const path = join(CONFLICTS_DIR, `wave-${wave}-resume.json`)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export function printReport(report: WaveReport): void {
  console.log('\n' + '═'.repeat(60))
  console.log(`  Wave ${report.wave} Ingestion Report (${report.source})`)
  console.log('═'.repeat(60))
  console.log(`  Nodes created:  ${report.nodesCreated}`)
  console.log(`  Nodes skipped:  ${report.nodesSkipped} (duplicates)`)
  console.log(`  Edges created:  ${report.edgesCreated}`)
  console.log(`  Edges skipped:  ${report.edgesSkipped}`)
  console.log(`  Conflicts:      ${report.conflicts.length} (fuzzy matches, logged for review)`)
  console.log(`  Duration:       ${(report.durationMs / 1000).toFixed(1)}s`)
  console.log('═'.repeat(60))

  if (report.conflicts.length > 0) {
    console.log('\n  Fuzzy match conflicts (review needed):')
    for (const c of report.conflicts.slice(0, 10)) {
      console.log(`    "${c.incomingName}" ≈ "${c.existingName}" (distance: ${c.distance})`)
    }
    if (report.conflicts.length > 10) {
      console.log(`    ... and ${report.conflicts.length - 10} more`)
    }
  }
}
