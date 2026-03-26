'use client'

import { useState } from 'react'

import type { PipelineState } from '@/lib/engine/types'

// --- Props -------------------------------------------------------------------

export interface GateApprovalProps {
  casoSlug: string
  stageId: string
  pipelineStateId: string
  onAction?: () => void
}

// --- Component ---------------------------------------------------------------

export function GateApproval({ casoSlug, stageId, pipelineStateId, onAction }: GateApprovalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null)
  const [confirmReject, setConfirmReject] = useState(false)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/casos/${casoSlug}/engine/gate/${encodeURIComponent(stageId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pipeline_state_id: pipelineStateId,
            action,
            reviewed_by: 'dashboard-user',
          }),
        },
      )

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        setError(json.error ?? `Gate action failed (${res.status})`)
        return
      }

      const json = (await res.json()) as { success: boolean; data: PipelineState }
      if (json.success) {
        setResult(action === 'approve' ? 'approved' : 'rejected')
        onAction?.()
      } else {
        setError('Unexpected response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setConfirmReject(false)
    }
  }

  // --- Success feedback ------------------------------------------------------

  if (result) {
    const isApproved = result === 'approved'
    return (
      <div
        className={`rounded-lg border px-4 py-3 ${
          isApproved
            ? 'border-green-800/50 bg-green-900/20'
            : 'border-red-800/50 bg-red-900/20'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isApproved ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isApproved ? 'text-green-300' : 'text-red-300'
            }`}
          >
            Gate {isApproved ? 'Approved' : 'Rejected'}
          </span>
        </div>
        <p
          className={`mt-1 text-sm ${
            isApproved ? 'text-green-400/80' : 'text-red-400/80'
          }`}
        >
          Stage{' '}
          <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs font-mono">{stageId}</code>{' '}
          has been {isApproved ? 'approved - pipeline resumed' : 'rejected - pipeline failed'}.
        </p>
      </div>
    )
  }

  // --- Gate approval form ----------------------------------------------------

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
        <h3 className="text-sm font-medium text-zinc-200">Gate Review</h3>
      </div>

      <p className="mb-4 text-sm text-zinc-400">
        Pipeline is paused at stage{' '}
        <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs font-mono text-zinc-300">
          {stageId}
        </code>
        . Approve to resume or reject to fail the pipeline.
      </p>

      {/* Error banner */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-2">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Approve button */}
        <button
          onClick={() => handleAction('approve')}
          disabled={loading}
          className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Processing\u2026' : 'Approve'}
        </button>

        {/* Reject with confirmation */}
        {confirmReject ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Reject will fail the pipeline.</span>
            <button
              onClick={() => handleAction('reject')}
              disabled={loading}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => setConfirmReject(false)}
              disabled={loading}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReject(true)}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject
          </button>
        )}
      </div>
    </div>
  )
}
