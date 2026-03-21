'use client'

export interface SnapshotManagerProps {
  casoSlug: string
  pipelineStateId: string | null
}

export function SnapshotManager({ casoSlug, pipelineStateId }: SnapshotManagerProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-sm text-zinc-400">
        Snapshots for <code className="text-zinc-300">{casoSlug}</code>
        {pipelineStateId && (
          <> — state <code className="text-zinc-300">{pipelineStateId}</code></>
        )}
      </p>
    </div>
  )
}
