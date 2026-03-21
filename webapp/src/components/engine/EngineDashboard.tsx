'use client'

interface EngineDashboardProps {
  casoSlug: string
}

export function EngineDashboard({ casoSlug }: EngineDashboardProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-100">
        Motor de Investigación
      </h1>
      <p className="text-sm text-zinc-400">
        Dashboard for <code className="text-zinc-300">{casoSlug}</code> — tabs coming soon.
      </p>
    </div>
  )
}
