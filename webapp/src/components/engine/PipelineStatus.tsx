'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { PipelineState } from '@/lib/engine/types'
import { GateApproval } from '@/components/engine/GateApproval'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PipelineStatusProps {
  casoSlug: string
  pipelineStateId: string | null
  pipelineId: string | null
}

// ─── Poll-stop statuses ───────────────────────────────────────────────────────

const STOP_POLLING_STATUSES = new Set(['completed', 'stopped', 'gate_pending', 'failed', 'paused'])

// ─── Progress JSON shape (best-effort) ────────────────────────────────────────

interface ProgressJson {
  stage?: string
  percent?: number
}

function parseProgress(raw: unknown): ProgressJson | null {
  if (!raw) return null
  try {
    const obj = typeof raw === 'string' ? (JSON.parse(raw) as unknown) : raw
    if (obj && typeof obj === 'object') return obj as ProgressJson
  } catch {
    // ignore parse errors
  }
  return null
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch latest pipeline state (silent = skip setLoading, used by poller)
  const fetchState = useCallback(
    async (silent = false) => {
      if (!pipelineId) return
      if (!silent) setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/casos/${casoSlug}/engine/state?pipeline_id=${encodeURIComponent(pipelineId)}`,
        )
        if (!res.ok) {
          setError(`Failed to fetch state (${res.status})`)
          return
        }
        const json = (await res.json()) as { success: boolean; data: (PipelineState & { progress_json?: unknown })[] }
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
        if (!silent) setLoading(false)
      }
    },
    [casoSlug, pipelineId, pipelineStateId],
  )

  // Initial fetch
  useEffect(() => {
    fetchState()
  }, [fetchState])

  // Polling: start when running, stop when terminal status reached
  useEffect(() => {
    const stopPolling = () => {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    if (state?.status === 'running') {
      if (pollRef.current === null) {
        pollRef.current = setInterval(() => {
          void fetchState(true)
        }, 5000)
      }
    } else if (state?.status && STOP_POLLING_STATUSES.has(state.status)) {
      stopPolling()
    }

    return stopPolling
  }, [state?.status, fetchState])

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
      // Refetch state after run (will trigger polling via status effect)
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
          className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {runLoading && <Spinner />}
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

      {/* Stage progress */}
      {state && (() => {
        const prog = parseProgress((state as PipelineState & { progress_json?: unknown }).progress_json)
        if (!prog) return null
        return (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-zinc-300">Stage Progress</h3>
            {prog.stage && (
              <p className="mb-2 text-sm text-zinc-400">
                Current stage: <span className="font-mono text-zinc-200">{prog.stage}</span>
              </p>
            )}
            {typeof prog.percent === 'number' && (
              <div className="flex items-center gap-3">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, prog.percent))}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-zinc-400">
                  {Math.round(prog.percent)}%
                </span>
              </div>
            )}
          </div>
        )
      })()}

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
