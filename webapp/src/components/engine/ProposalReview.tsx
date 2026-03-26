'use client'

import { useCallback, useEffect, useState } from 'react'

import type { Proposal, ProposalStatus } from '@/lib/engine/types'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProposalReviewProps {
  casoSlug: string
  pipelineStateId: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const STATUS_BADGE: Record<ProposalStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-yellow-900/40 text-yellow-300' },
  approved: { label: 'Approved', cls: 'bg-green-900/40 text-green-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-900/40 text-red-300' },
}

function confidenceColor(c: number): string {
  if (c >= 0.7) return 'text-green-400'
  if (c >= 0.4) return 'text-yellow-400'
  return 'text-red-400'
}

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProposalReview({ casoSlug, pipelineStateId }: ProposalReviewProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch proposals
  const fetchProposals = useCallback(async () => {
    if (!pipelineStateId) return
    setLoading(true)
    setError(null)
    try {
      const url = `/api/casos/${casoSlug}/engine/proposals?pipeline_state_id=${encodeURIComponent(pipelineStateId)}`
      const res = await fetch(url)
      if (!res.ok) {
        setError(`Failed to fetch proposals (${res.status})`)
        return
      }
      const json = (await res.json()) as { success: boolean; data: Proposal[] }
      if (json.success) {
        setProposals(json.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [casoSlug, pipelineStateId])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  // Clear selection when filter changes
  useEffect(() => {
    setSelected(new Set())
  }, [filter])

  // Filtered proposals
  const filtered = filter === 'all' ? proposals : proposals.filter((p) => p.status === filter)

  // Selection helpers
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((p) => p.id)))
    }
  }

  // Batch action
  async function handleBatchAction(action: 'approved' | 'rejected') {
    if (selected.size === 0) return
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/casos/${casoSlug}/engine/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selected),
          action,
          reviewed_by: 'dashboard-user',
        }),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        setError(json.error ?? `Action failed (${res.status})`)
        return
      }
      setSelected(new Set())
      await fetchProposals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setActionLoading(false)
    }
  }

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
        <p className="text-sm text-zinc-500">Loading proposals&hellip;</p>
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

      {/* Filter tabs + batch actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all'
                ? ` (${proposals.length})`
                : ` (${proposals.filter((p) => p.status === f).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBatchAction('approved')}
            disabled={selected.size === 0 || actionLoading}
            className="rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve ({selected.size})
          </button>
          <button
            onClick={() => handleBatchAction('rejected')}
            disabled={selected.size === 0 || actionLoading}
            className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject ({selected.size})
          </button>
        </div>
      </div>

      {/* Proposals list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <p className="text-sm text-zinc-500">
            {proposals.length === 0
              ? 'No proposals generated yet.'
              : 'No proposals match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          {/* Header row */}
          <div className="grid grid-cols-[2rem_1fr_5rem_4.5rem_1fr_6rem] items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-500">
            <div>
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="accent-purple-500"
              />
            </div>
            <div>Type</div>
            <div>Confidence</div>
            <div>Status</div>
            <div>Reasoning</div>
            <div>Created</div>
          </div>

          {/* Rows */}
          {filtered.map((p) => {
            const expanded = expandedId === p.id
            const badge = STATUS_BADGE[p.status]
            return (
              <div key={p.id} className="border-b border-zinc-800/50 last:border-b-0">
                <div
                  className="grid cursor-pointer grid-cols-[2rem_1fr_5rem_4.5rem_1fr_6rem] items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-800/40"
                  onClick={() => setExpandedId(expanded ? null : p.id)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="accent-purple-500"
                    />
                  </div>
                  <div className="font-mono text-xs text-zinc-300">{p.type}</div>
                  <div className={`font-mono text-xs ${confidenceColor(p.confidence)}`}>
                    {(p.confidence * 100).toFixed(0)}%
                  </div>
                  <div>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="truncate text-xs text-zinc-400">{truncate(p.reasoning, 80)}</div>
                  <div className="text-xs text-zinc-500">{formatTimestamp(p.created_at).split(',')[0]}</div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
                    <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                      <dt className="text-zinc-500">ID</dt>
                      <dd className="font-mono text-xs text-zinc-300">{p.id}</dd>

                      <dt className="text-zinc-500">Stage</dt>
                      <dd className="font-mono text-xs text-zinc-300">{p.stage_id}</dd>

                      <dt className="text-zinc-500">Type</dt>
                      <dd className="font-mono text-xs text-zinc-300">{p.type}</dd>

                      <dt className="text-zinc-500">Confidence</dt>
                      <dd className={`font-mono text-xs ${confidenceColor(p.confidence)}`}>
                        {(p.confidence * 100).toFixed(1)}%
                      </dd>

                      <dt className="text-zinc-500">Status</dt>
                      <dd>
                        <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </dd>

                      {p.reviewed_by && (
                        <>
                          <dt className="text-zinc-500">Reviewed by</dt>
                          <dd className="text-xs text-zinc-300">{p.reviewed_by}</dd>
                        </>
                      )}

                      {p.reviewed_at && (
                        <>
                          <dt className="text-zinc-500">Reviewed at</dt>
                          <dd className="text-xs text-zinc-300">{formatTimestamp(p.reviewed_at)}</dd>
                        </>
                      )}

                      <dt className="text-zinc-500">Created</dt>
                      <dd className="text-xs text-zinc-300">{formatTimestamp(p.created_at)}</dd>

                      <dt className="self-start text-zinc-500">Reasoning</dt>
                      <dd className="whitespace-pre-wrap text-xs text-zinc-300">{p.reasoning}</dd>

                      <dt className="self-start text-zinc-500">Payload</dt>
                      <dd>
                        <pre className="overflow-x-auto rounded bg-zinc-900 p-2 text-xs text-zinc-400">
                          {JSON.stringify(p.payload, null, 2)}
                        </pre>
                      </dd>
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
