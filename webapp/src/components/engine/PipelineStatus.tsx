'use client'

export interface PipelineStatusProps {
  casoSlug: string
  pipelineStateId: string | null
}

export function PipelineStatus({ casoSlug, pipelineStateId }: PipelineStatusProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-sm text-zinc-400">
        Pipeline status for <code className="text-zinc-300">{casoSlug}</code>
        {pipelineStateId && (
          <> — state <code className="text-zinc-300">{pipelineStateId}</code></>
        )}
      </p>
    </div>
  )
}
