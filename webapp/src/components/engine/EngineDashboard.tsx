'use client'

import { useEffect, useState } from 'react'

import { AuditLog } from './AuditLog'
import { DataImport } from './DataImport'
import { OrchestratorPanel } from './OrchestratorPanel'
import { PipelineStatus } from './PipelineStatus'
import { ProposalReview } from './ProposalReview'
import { SnapshotManager } from './SnapshotManager'

import type { PipelineState } from '@/lib/engine/types'

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'audit', label: 'Audit' },
  { id: 'snapshots', label: 'Snapshots' },
  { id: 'orchestrator', label: 'Orchestrator' },
  { id: 'data', label: 'Data' },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── Component ───────────────────────────────────────────────────────────────

interface EngineDashboardProps {
  casoSlug: string
}

export function EngineDashboard({ casoSlug }: EngineDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('pipeline')
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null)
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch pipeline configs on mount to discover available pipelines
  useEffect(() => {
    let cancelled = false

    async function fetchConfigs() {
      try {
        const res = await fetch(`/api/casos/${casoSlug}/engine/state`)
        if (!res.ok) {
          setError(`Failed to fetch engine state (${res.status})`)
          setLoading(false)
          return
        }
        const json = await res.json() as { success: boolean; data: PipelineState[] }
        if (!cancelled && json.success && json.data.length > 0) {
          // Use the first pipeline state available
          const first = json.data[0]
          setPipelineState(first)
          setActivePipelineId(first.pipeline_id)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchConfigs()
    return () => { cancelled = true }
  }, [casoSlug])

  const pipelineStateId = pipelineState?.id ?? null

  return (
    <div className="flex flex-1 flex-col gap-0">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-zinc-50">
          Motor de Investigaci&oacute;n
        </h1>
        {activePipelineId && (
          <p className="mt-0.5 text-xs text-zinc-500">
            Pipeline: <code className="text-zinc-400">{activePipelineId}</code>
            {pipelineState && (
              <> &middot; Status: <span className={statusColor(pipelineState.status)}>{pipelineState.status}</span></>
            )}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <p className="text-sm text-zinc-500">Loading engine state&hellip;</p>
        )}
        {error && (
          <p className="text-sm text-red-400">Error: {error}</p>
        )}
        {!loading && !error && (
          <>
            {activeTab === 'pipeline' && (
              <PipelineStatus casoSlug={casoSlug} pipelineStateId={pipelineStateId} pipelineId={activePipelineId} />
            )}
            {activeTab === 'proposals' && (
              <ProposalReview casoSlug={casoSlug} pipelineStateId={pipelineStateId} />
            )}
            {activeTab === 'audit' && (
              <AuditLog casoSlug={casoSlug} pipelineStateId={pipelineStateId} />
            )}
            {activeTab === 'snapshots' && (
              <SnapshotManager casoSlug={casoSlug} pipelineStateId={pipelineStateId} />
            )}
            {activeTab === 'orchestrator' && (
              <OrchestratorPanel casoSlug={casoSlug} pipelineId={activePipelineId} />
            )}
            {activeTab === 'data' && (
              <DataImport casoSlug={casoSlug} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'text-green-400'
    case 'paused':
      return 'text-yellow-400'
    case 'failed':
      return 'text-red-400'
    case 'completed':
      return 'text-blue-400'
    default:
      return 'text-zinc-400'
  }
}
