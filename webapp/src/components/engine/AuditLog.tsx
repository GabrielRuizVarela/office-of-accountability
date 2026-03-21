'use client'

export interface AuditLogProps {
  casoSlug: string
  pipelineStateId: string | null
}

export function AuditLog({ casoSlug, pipelineStateId }: AuditLogProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-sm text-zinc-400">
        Audit trail for <code className="text-zinc-300">{casoSlug}</code>
        {pipelineStateId && (
          <> — state <code className="text-zinc-300">{pipelineStateId}</code></>
        )}
      </p>
    </div>
  )
}
