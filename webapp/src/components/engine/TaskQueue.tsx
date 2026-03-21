'use client'

import { useCallback, useEffect, useState } from 'react'

import type { OrchestratorTask, OrchestratorTaskStatus } from '@/lib/engine/types'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskQueueProps {
  casoSlug: string
  pipelineId: string | null
  onTaskUpdate?: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ id: OrchestratorTaskStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'running', label: 'Running' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
]

const STATUS_COLORS: Record<OrchestratorTaskStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  assigned: 'bg-cyan-500/20 text-cyan-400',
  running: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400',    // 1-3
  medium: 'text-yellow-400', // 4-6
  low: 'text-zinc-400',     // 7-10
}

function priorityColor(p: number): string {
  if (p <= 3) return PRIORITY_COLORS.high
  if (p <= 6) return PRIORITY_COLORS.medium
  return PRIORITY_COLORS.low
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

export function TaskQueue({ casoSlug, pipelineId, onTaskUpdate }: TaskQueueProps) {
  const [tasks, setTasks] = useState<OrchestratorTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrchestratorTaskStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!pipelineId) return
    setLoading(true)
    setError(null)
    try {
      let url = `/api/casos/${casoSlug}/engine/orchestrator/tasks?pipeline_id=${encodeURIComponent(pipelineId)}`
      if (statusFilter !== 'all') {
        url += `&status=${encodeURIComponent(statusFilter)}`
      }
      const res = await fetch(url)
      if (!res.ok) {
        setError(`Failed to fetch tasks (${res.status})`)
        return
      }
      const json = (await res.json()) as { success: boolean; data: { tasks: OrchestratorTask[] } }
      if (json.success) {
        setTasks(json.data.tasks)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [casoSlug, pipelineId, statusFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleUpdatePriority = async (taskId: string, newPriority: number) => {
    setUpdatingId(taskId)
    setError(null)
    try {
      const res = await fetch(`/api/casos/${casoSlug}/engine/orchestrator/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, priority: newPriority }),
      })
      if (!res.ok) {
        setError(`Failed to update priority (${res.status})`)
        return
      }
      await fetchTasks()
      onTaskUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: OrchestratorTaskStatus) => {
    setUpdatingId(taskId)
    setError(null)
    try {
      const res = await fetch(`/api/casos/${casoSlug}/engine/orchestrator/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, status: newStatus }),
      })
      if (!res.ok) {
        setError(`Failed to update status (${res.status})`)
        return
      }
      await fetchTasks()
      onTaskUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setUpdatingId(null)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!pipelineId) return null

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      {/* Header + filter tabs */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-100">Task Queue</h3>
          <span className="text-xs text-zinc-500">{tasks.length} tasks</span>
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.id}
              onClick={() => setStatusFilter(sf.id)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === sf.id
                  ? 'bg-purple-600/30 text-purple-300'
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-b border-red-800/50 bg-red-900/20 px-4 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-zinc-500">Loading tasks&hellip;</p>
        </div>
      )}

      {/* Empty */}
      {!loading && tasks.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-zinc-500">
            {statusFilter === 'all' ? 'No tasks in queue.' : `No ${statusFilter} tasks.`}
          </p>
        </div>
      )}

      {/* Task list */}
      {!loading && tasks.length > 0 && (
        <div>
          {tasks.map((task) => {
            const isExpanded = expandedId === task.id
            const isUpdating = updatingId === task.id

            return (
              <div key={task.id} className="border-b border-zinc-800/50 last:border-b-0">
                {/* Row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : task.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-zinc-800/30"
                >
                  {/* Priority */}
                  <span className={`w-6 text-center font-mono text-xs font-bold ${priorityColor(task.priority)}`}>
                    P{task.priority}
                  </span>

                  {/* Status badge */}
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                    {task.status}
                  </span>

                  {/* Type */}
                  <span className="text-xs font-medium text-zinc-300">{task.type}</span>

                  {/* Target (truncated) */}
                  <span className="flex-1 truncate text-xs text-zinc-500">{task.target}</span>

                  {/* Time */}
                  <span className="text-xs text-zinc-600">{formatRelativeTime(task.created_at)}</span>

                  {/* Expand indicator */}
                  <span className="text-xs text-zinc-600">{isExpanded ? '▾' : '▸'}</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-zinc-800/30 bg-zinc-800/20 px-4 py-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-zinc-500">ID: </span>
                        <span className="font-mono text-zinc-400">{task.id}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Type: </span>
                        <span className="text-zinc-300">{task.type}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-500">Target: </span>
                        <span className="text-zinc-300">{task.target}</span>
                      </div>
                      {task.assigned_to && (
                        <div>
                          <span className="text-zinc-500">Assigned to: </span>
                          <span className="text-zinc-300">{task.assigned_to}</span>
                        </div>
                      )}
                      {task.dependencies.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-zinc-500">Dependencies: </span>
                          <span className="font-mono text-zinc-400">{task.dependencies.join(', ')}</span>
                        </div>
                      )}
                      {task.result_summary && (
                        <div className="col-span-2">
                          <span className="text-zinc-500">Result: </span>
                          <span className="text-zinc-300">{task.result_summary}</span>
                        </div>
                      )}
                      {task.completed_at && (
                        <div>
                          <span className="text-zinc-500">Completed: </span>
                          <span className="text-zinc-400">{formatRelativeTime(task.completed_at)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-zinc-500">Created: </span>
                        <span className="text-zinc-400">{formatRelativeTime(task.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {/* Priority controls */}
                      <span className="text-xs text-zinc-500">Priority:</span>
                      <div className="flex gap-1">
                        {[1, 3, 5, 7, 10].map((p) => (
                          <button
                            key={p}
                            onClick={() => handleUpdatePriority(task.id, p)}
                            disabled={isUpdating || task.priority === p}
                            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                              task.priority === p
                                ? 'bg-zinc-700 text-zinc-200'
                                : 'text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300'
                            } disabled:opacity-50`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <div className="mx-2 h-4 w-px bg-zinc-700" />

                      {/* Status transitions */}
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'running')}
                          disabled={isUpdating}
                          className="rounded bg-blue-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                        >
                          {isUpdating ? '…' : 'Start'}
                        </button>
                      )}
                      {task.status === 'running' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                            disabled={isUpdating}
                            className="rounded bg-green-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-green-500 disabled:opacity-50"
                          >
                            {isUpdating ? '…' : 'Complete'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'failed')}
                            disabled={isUpdating}
                            className="rounded bg-red-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                          >
                            {isUpdating ? '…' : 'Fail'}
                          </button>
                        </>
                      )}
                      {(task.status === 'failed' || task.status === 'completed') && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'pending')}
                          disabled={isUpdating}
                          className="rounded bg-yellow-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-yellow-500 disabled:opacity-50"
                        >
                          {isUpdating ? '…' : 'Requeue'}
                        </button>
                      )}
                    </div>
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
