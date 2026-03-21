'use client'

export interface ProposalReviewProps {
  casoSlug: string
  pipelineStateId: string | null
}

export function ProposalReview({ casoSlug, pipelineStateId }: ProposalReviewProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-sm text-zinc-400">
        Proposals for <code className="text-zinc-300">{casoSlug}</code>
        {pipelineStateId && (
          <> — state <code className="text-zinc-300">{pipelineStateId}</code></>
        )}
      </p>
    </div>
  )
}
