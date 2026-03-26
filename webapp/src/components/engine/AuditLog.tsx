'use client'

import { useCallback, useEffect, useState } from 'react'

import type { AuditEntry } from '@/lib/engine/types'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AuditLogProps {
  casoSlug: string
  pipelineStateId: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GENESIS_HASH = '0'.repeat(64)

const ACTION_BADGE: Record<string, { label: string; cls: string }> = {
  'pipeline.start': { label: 'Start', cls: 'bg-blue-900/40 text-blue-300' },
  'pipeline.complete': { label: 'Complete', cls: 'bg-green-900/40 text-green-300' },
  'pipeline.fail': { label: 'Fail', cls: 'bg-red-900/40 text-red-300' },
  'proposal.approve': { label: 'Approve', cls: 'bg-green-900/40 text-green-300' },
  'proposal.reject': { label: 'Reject', cls: 'bg-red-900/40 text-red-300' },
  'gate.approve': { label: 'Gate OK', cls: 'bg-emerald-900/40 text-emerald-300' },
  'gate.reject': { label: 'Gate Deny', cls: 'bg-orange-900/40 text-orange-300' },
  'snapshot.create': { label: 'Snapshot', cls: 'bg-purple-900/40 text-purple-300' },
}

function getActionBadge(action: string): { label: string; cls: string } {
  if (ACTION_BADGE[action]) return ACTION_BADGE[action]
  // Fallback: derive label from action string
  const label = action.split('.').pop() ?? action
  return { label: label.charAt(0).toUpperCase() + label.slice(1), cls: 'bg-zinc-700/40 text-zinc-300' }
}

function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch {
    return iso
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

/** Validate hash chain linkage (not recomputing hashes, just checking prev_hash references). */
function validateChain(entries: AuditEntry[]): { valid: boolean; brokenAt: number | null } {
  if (entries.length === 0) return { valid: true, brokenAt: null }

  // entries should be in chronological order (oldest first)
  if (entries[0].prev_hash !== GENESIS_HASH) {
    return { valid: false, brokenAt: 0 }
  }

  for (let i = 1; i < entries.length; i++) {
    if (entries[i].prev_hash !== entries[i - 1].hash) {
      return { valid: false, brokenAt: i }
    }
  }

  return { valid: true, brokenAt: null }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AuditLog({ casoSlug, pipelineStateId }: AuditLogProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!pipelineStateId) return
    setLoading(true)
    setError(null)
    try {
      const url = `/api/casos/${casoSlug}/engine/audit?pipeline_state_id=${encodeURIComponent(pipelineStateId)}&limit=50`
      const res = await fetch(url)
      if (!res.ok) {
        setError(`Failed to fetch audit log (${res.status})`)
        return
      }
      const json = (await res.json()) as { success: boolean; data: { entries: AuditEntry[] } }
      if (json.success) {
        setEntries(json.data.entries)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [casoSlug, pipelineStateId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Validate chain in chronological order (API returns oldest first)
  const chainResult = validateChain(entries)

  // Display entries newest first
  const displayEntries = [...entries].reverse()
  // Map from original chronological index → entry id for broken highlight
  const brokenEntryId = chainResult.brokenAt !== null ? entries[chainResult.brokenAt]?.id : null

  // ─── Empty / Loading states ─────────────────────────────────────────────────

  if (!pipelineStateId) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">No pipeline state available. Run the pipeline first.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">Loading audit log&hellip;</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Hash chain validation banner */}
      {entries.length > 0 && (
        <div
          className={`rounded-lg border px-4 py-3 ${
            chainResult.valid
              ? 'border-green-800/50 bg-green-900/20'
              : 'border-red-800/50 bg-red-900/20'
          }`}
        >
          <p className={`text-sm font-medium ${chainResult.valid ? 'text-green-400' : 'text-red-400'}`}>
            {chainResult.valid
              ? `Chain Valid - ${entries.length} entries verified`
              : `Chain Broken - break detected at entry ${(chainResult.brokenAt ?? 0) + 1}`}
          </p>
        </div>
      )}

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <p className="text-sm text-zinc-500">No audit entries recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          {/* Header */}
          <div className="grid grid-cols-[5rem_1fr_5rem_6rem] items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-500">
            <div>Action</div>
            <div>Detail</div>
            <div>Hash</div>
            <div>Time</div>
          </div>

          {/* Rows (newest first) */}
          {displayEntries.map((entry) => {
            const expanded = expandedId === entry.id
            const badge = getActionBadge(entry.action)
            const isBroken = entry.id === brokenEntryId

            return (
              <div
                key={entry.id}
                className={`border-b border-zinc-800/50 last:border-b-0 ${
                  isBroken ? 'ring-1 ring-inset ring-red-500/50' : ''
                }`}
              >
                <div
                  className="grid cursor-pointer grid-cols-[5rem_1fr_5rem_6rem] items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-800/40"
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                >
                  <div>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="truncate text-xs text-zinc-400">{truncate(entry.detail, 80)}</div>
                  <div className="font-mono text-xs text-zinc-600">{entry.hash.slice(0, 8)}</div>
                  <div className="text-xs text-zinc-500">{formatRelativeTime(entry.created_at)}</div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
                    <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-sm">
                      <dt className="text-zinc-500">ID</dt>
                      <dd className="font-mono text-xs text-zinc-300">{entry.id}</dd>

                      <dt className="text-zinc-500">Action</dt>
                      <dd className="font-mono text-xs text-zinc-300">{entry.action}</dd>

                      {entry.stage_id && (
                        <>
                          <dt className="text-zinc-500">Stage</dt>
                          <dd className="font-mono text-xs text-zinc-300">{entry.stage_id}</dd>
                        </>
                      )}

                      <dt className="text-zinc-500">Hash</dt>
                      <dd className="break-all font-mono text-xs text-zinc-300">{entry.hash}</dd>

                      <dt className="text-zinc-500">Prev Hash</dt>
                      <dd className="break-all font-mono text-xs text-zinc-300">
                        {entry.prev_hash === GENESIS_HASH ? (
                          <span className="text-zinc-500">(genesis)</span>
                        ) : (
                          entry.prev_hash
                        )}
                      </dd>

                      {isBroken && (
                        <>
                          <dt className="text-red-400">Chain Break</dt>
                          <dd className="text-xs text-red-400">
                            prev_hash does not match previous entry&apos;s hash
                          </dd>
                        </>
                      )}

                      <dt className="text-zinc-500">Created</dt>
                      <dd className="text-xs text-zinc-300">
                        {new Date(entry.created_at).toLocaleString()}
                      </dd>

                      <dt className="self-start text-zinc-500">Detail</dt>
                      <dd className="whitespace-pre-wrap text-xs text-zinc-300">{entry.detail}</dd>
                    </dl>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
