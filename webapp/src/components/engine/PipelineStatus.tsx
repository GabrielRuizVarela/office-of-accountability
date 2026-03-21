'use client'

import { useCallback, useEffect, useState } from 'react'

import type { PipelineState } from '@/lib/engine/types'
import { GateApproval } from '@/components/engine/GateApproval'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PipelineStatusProps {
  casoSlug: string
  pipelineStateId: string | null
  pipelineId: string | null
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  idle: { label: 'Idle', color: 'text-zinc-400', dot: 'bg-zinc-400' },
  running: { label: 'Running', color: 'text-green-400', dot: 'bg-green-400' },
  paused: { label: 'Paused — Gate Pending', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  completed: { label: 'Completed', color: 'text-blue-400', dot: 'bg-blue-400' },
  failed: { label: 'Failed', color: 'text-red-400', dot: 'bg-red-400' },
}

function statusInfo(status: string) {
  return STATUS_LABELS[status] ?? { label: status, color: 'text-zinc-400', dot: 'bg-zinc-400' }
}

function canRun(status: string | undefined): boolean {
  return status === 'idle' || status === 'completed' || status === 'failed'
}

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PipelineStatus({ casoSlug, pipelineStateId, pipelineId }: PipelineStatusProps) {
  const [state, setState] = useState<PipelineState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runLoading, setRunLoading] = useState(false)

  // Fetch latest pipeline state
  const fetchState = useCallback(async () => {
    if (!pipelineId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/casos/${casoSlug}/engine/state?pipeline_id=${encodeURIComponent(pipelineId)}`,
      )
      if (!res.ok) {
        setError(`Failed to fetch state (${res.status})`)
        return
      }
      const json = (await res.json()) as { success: boolean; data: PipelineState[] }
      if (json.success && json.data.length > 0) {
        // Use the most recent state (first — ordered DESC by created_at)
        const match = pipelineStateId
          ? json.data.find((s) => s.id === pipelineStateId) ?? json.data[0]
          : json.data[0]
        setState(match)
      } else {
        setState(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [casoSlug, pipelineId, pipelineStateId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  // Run pipeline
  async function handleRun() {
    if (!pipelineId) return
    setRunLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/casos/${casoSlug}/engine/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_id: pipelineId }),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        setError(json.error ?? `Run failed (${res.status})`)
        return
      }
      // Refetch state after run
      await fetchState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setRunLoading(false)
    }
  }

  // ─── Empty state ──────────────────────────────────────────────────────────

  if (!pipelineId) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">No pipeline configured for this investigation.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">Loading pipeline state&hellip;</p>
      </div>
    )
  }

  const info = statusInfo(state?.status ?? 'idle')

  return (
    <div className="flex flex-col gap-4">
      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Status + Run control */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${info.dot}`} />
          <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
        </div>

        <button
          onClick={handleRun}
          disabled={!canRun(state?.status) || runLoading}
          className="rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {runLoading ? 'Starting\u2026' : 'Run Pipeline'}
        </button>
      </div>

      {/* Pipeline details */}
      {state && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-300">Pipeline Details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt className="text-zinc-500">Pipeline ID</dt>
            <dd className="font-mono text-xs text-zinc-300">{state.pipeline_id}</dd>

            <dt className="text-zinc-500">State ID</dt>
            <dd className="font-mono text-xs text-zinc-300">{state.id}</dd>

            {state.current_stage_id && (
              <>
                <dt className="text-zinc-500">Current Stage</dt>
                <dd className="font-mono text-xs text-zinc-300">{state.current_stage_id}</dd>
              </>
            )}

            <dt className="text-zinc-500">Started</dt>
            <dd className="text-zinc-300">{formatTimestamp(state.started_at)}</dd>

            {state.completed_at && (
              <>
                <dt className="text-zinc-500">Completed</dt>
                <dd className="text-zinc-300">{formatTimestamp(state.completed_at)}</dd>
              </>
            )}

            <dt className="text-zinc-500">Created</dt>
            <dd className="text-zinc-300">{formatTimestamp(state.created_at)}</dd>
          </dl>
        </div>
      )}

      {/* Gate approval */}
      {state?.status === 'paused' && state.current_stage_id && (
        <GateApproval
          casoSlug={casoSlug}
          stageId={state.current_stage_id}
          pipelineStateId={state.id}
          onAction={fetchState}
        />
      )}

      {/* Error detail */}
      {state?.status === 'failed' && state.error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3">
          <h3 className="text-sm font-medium text-red-400">Pipeline Error</h3>
          <p className="mt-1 text-sm text-red-300/80">{state.error}</p>
        </div>
      )}

      {/* No state yet */}
      {!state && !loading && !error && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <p className="text-sm text-zinc-500">
            No pipeline runs yet. Click &ldquo;Run Pipeline&rdquo; to start.
          </p>
        </div>
      )}
    </div>
  )
}
