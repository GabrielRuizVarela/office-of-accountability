'use client'

import { useCallback, useEffect, useState } from 'react'

import type { OrchestratorState, OrchestratorTask } from '@/lib/engine/types'

import { TaskQueue } from './TaskQueue'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OrchestratorPanelProps {
  casoSlug: string
  pipelineId: string | null
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskSummary {
  total: number
  pending: number
  running: number
  completed: number
  failed: number
}

interface OrchestratorData {
  state: OrchestratorState | null
  task_summary: TaskSummary
  tasks: OrchestratorTask[]
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

export function OrchestratorPanel({ casoSlug, pipelineId }: OrchestratorPanelProps) {
  const [data, setData] = useState<OrchestratorData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Focus editing
  const [editingFocus, setEditingFocus] = useState(false)
  const [focusInput, setFocusInput] = useState('')
  const [savingFocus, setSavingFocus] = useState(false)

  const fetchState = useCallback(async () => {
    if (!pipelineId) return
    setLoading(true)
    setError(null)
    try {
      const url = `/api/casos/${casoSlug}/engine/orchestrator?pipeline_id=${encodeURIComponent(pipelineId)}`
      const res = await fetch(url)
      if (!res.ok) {
        setError(`Failed to fetch orchestrator state (${res.status})`)
        return
      }
      const json = (await res.json()) as { success: boolean; data: OrchestratorData }
      if (json.success) {
        setData(json.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [casoSlug, pipelineId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  const handleSaveFocus = async () => {
    if (!pipelineId || !focusInput.trim()) return
    setSavingFocus(true)
    setError(null)
    try {
      const res = await fetch(`/api/casos/${casoSlug}/engine/orchestrator/focus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_id: pipelineId, focus: focusInput.trim() }),
      })
      if (!res.ok) {
        setError(`Failed to update focus (${res.status})`)
        return
      }
      setEditingFocus(false)
      await fetchState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSavingFocus(false)
    }
  }

  // ─── Empty / Loading states ─────────────────────────────────────────────────

  if (!pipelineId) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">No pipeline selected. Run the pipeline first.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">Loading orchestrator state&hellip;</p>
      </div>
    )
  }

  const state = data?.state ?? null
  const summary = data?.task_summary ?? { total: 0, pending: 0, running: 0, completed: 0, failed: 0 }

  return (
    <div className="flex flex-col gap-4">
      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* State overview */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-100">Orchestrator State</h3>

        {!state ? (
          <p className="text-sm text-zinc-500">No orchestrator state initialized for this pipeline.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Active Tasks" value={state.active_tasks} color="text-yellow-400" />
              <StatCard label="Completed" value={state.completed_tasks} color="text-green-400" />
              <StatCard label="Agents" value={state.agent_count} color="text-blue-400" />
              <StatCard
                label="Last Synthesis"
                value={state.last_synthesis_at ? formatRelativeTime(state.last_synthesis_at) : '—'}
                color="text-zinc-400"
              />
            </div>

            {/* Current focus */}
            <div className="rounded border border-zinc-700/50 bg-zinc-800/50 px-3 py-2.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Research Focus</span>
                {!editingFocus && (
                  <button
                    onClick={() => {
                      setFocusInput(state.current_focus ?? '')
                      setEditingFocus(true)
                    }}
                    className="text-xs text-purple-400 transition-colors hover:text-purple-300"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingFocus ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={focusInput}
                    onChange={(e) => setFocusInput(e.target.value)}
                    placeholder="e.g. Financial connections between X and Y"
                    className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveFocus()
                      if (e.key === 'Escape') setEditingFocus(false)
                    }}
                  />
                  <button
                    onClick={handleSaveFocus}
                    disabled={savingFocus || !focusInput.trim()}
                    className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
                  >
                    {savingFocus ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingFocus(false)}
                    className="rounded px-2 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-sm text-zinc-200">
                  {state.current_focus || <span className="text-zinc-500">No focus set</span>}
                </p>
              )}
            </div>

            {/* Updated timestamp */}
            <p className="text-xs text-zinc-600">
              Updated {formatRelativeTime(state.updated_at)}
            </p>
          </div>
        )}
      </div>

      {/* Task summary bar */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-100">Task Summary</h3>
          <span className="text-xs text-zinc-500">{summary.total} total</span>
        </div>

        {summary.total === 0 ? (
          <p className="text-sm text-zinc-500">No orchestrator tasks yet.</p>
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-zinc-800">
              {summary.completed > 0 && (
                <div
                  className="bg-green-500"
                  style={{ width: `${(summary.completed / summary.total) * 100}%` }}
                />
              )}
              {summary.running > 0 && (
                <div
                  className="bg-blue-500"
                  style={{ width: `${(summary.running / summary.total) * 100}%` }}
                />
              )}
              {summary.pending > 0 && (
                <div
                  className="bg-yellow-500"
                  style={{ width: `${(summary.pending / summary.total) * 100}%` }}
                />
              )}
              {summary.failed > 0 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${(summary.failed / summary.total) * 100}%` }}
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {summary.completed > 0 && (
                <span className="text-green-400">{summary.completed} completed</span>
              )}
              {summary.running > 0 && (
                <span className="text-blue-400">{summary.running} running</span>
              )}
              {summary.pending > 0 && (
                <span className="text-yellow-400">{summary.pending} pending</span>
              )}
              {summary.failed > 0 && (
                <span className="text-red-400">{summary.failed} failed</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Task queue */}
      <TaskQueue casoSlug={casoSlug} pipelineId={pipelineId} onTaskUpdate={fetchState} />
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="rounded border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  )
}
