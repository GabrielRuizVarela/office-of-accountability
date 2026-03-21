'use client'

import { useCallback, useEffect, useState } from 'react'

import type { Snapshot } from '@/lib/engine/types'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SnapshotManagerProps {
  casoSlug: string
  pipelineStateId: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function SnapshotManager({ casoSlug, pipelineStateId }: SnapshotManagerProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchSnapshots = useCallback(async () => {
    if (!pipelineStateId) return
    setLoading(true)
    setError(null)
    try {
      const url = `/api/casos/${casoSlug}/engine/snapshots?pipeline_state_id=${encodeURIComponent(pipelineStateId)}`
      const res = await fetch(url)
      if (!res.ok) {
        setError(`Failed to fetch snapshots (${res.status})`)
        return
      }
      const json = (await res.json()) as { success: boolean; data: { snapshots: Snapshot[] } }
      if (json.success) {
        setSnapshots(json.data.snapshots)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [casoSlug, pipelineStateId])

  useEffect(() => {
    fetchSnapshots()
  }, [fetchSnapshots])

  const handleCreate = async () => {
    if (!pipelineStateId) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`/api/casos/${casoSlug}/engine/snapshots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_state_id: pipelineStateId, label: newLabel || 'Untitled snapshot' }),
      })
      if (!res.ok) {
        setError(`Failed to create snapshot (${res.status})`)
        return
      }
      setNewLabel('')
      await fetchSnapshots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/casos/${casoSlug}/engine/snapshots?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        setError(`Failed to delete snapshot (${res.status})`)
        return
      }
      setConfirmDeleteId(null)
      await fetchSnapshots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDeletingId(null)
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
        <p className="text-sm text-zinc-500">Loading snapshots&hellip;</p>
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

      {/* Create snapshot */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Snapshot label (optional)"
          className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          className="rounded bg-purple-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create Snapshot'}
        </button>
      </div>

      {/* Snapshots list */}
      {snapshots.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <p className="text-sm text-zinc-500">No snapshots created yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          {/* Header */}
          <div className="grid grid-cols-[1fr_10rem_4rem_4rem_5rem_6rem_3rem] items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-500">
            <div>Label</div>
            <div>Slug</div>
            <div className="text-right">Nodes</div>
            <div className="text-right">Rels</div>
            <div>Stage</div>
            <div>Created</div>
            <div />
          </div>

          {/* Rows */}
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className="grid grid-cols-[1fr_10rem_4rem_4rem_5rem_6rem_3rem] items-center gap-2 border-b border-zinc-800/50 px-3 py-2.5 text-sm last:border-b-0"
            >
              <div className="truncate text-zinc-100">{snap.label || '(unlabeled)'}</div>
              <div className="truncate font-mono text-xs text-zinc-500">{snap.snapshot_slug}</div>
              <div className="text-right font-mono text-xs text-emerald-400">{snap.node_count}</div>
              <div className="text-right font-mono text-xs text-blue-400">{snap.relationship_count}</div>
              <div className="truncate font-mono text-xs text-zinc-500">{snap.stage_id ?? '—'}</div>
              <div className="text-xs text-zinc-500">{formatRelativeTime(snap.created_at)}</div>
              <div className="flex justify-end">
                {confirmDeleteId === snap.id ? (
                  <button
                    onClick={() => handleDelete(snap.id)}
                    disabled={deletingId === snap.id}
                    className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                  >
                    {deletingId === snap.id ? '…' : '✓'}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(snap.id)}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-red-900/30 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
