'use client'

/**
 * Display simulation results from MiroFish — prediction report + agent decisions.
 */

interface AgentDecision {
  readonly agent_name: string
  readonly round: number
  readonly action: string
  readonly reasoning: string
}

interface SimulationResult {
  readonly sessionId: string
  readonly status: 'running' | 'completed' | 'error'
  readonly progress?: number
  readonly report?: string
  readonly decisions?: readonly AgentDecision[]
  readonly error?: string
}

interface SimulationResultsProps {
  readonly result: SimulationResult
  readonly onChat: () => void
}

export function SimulationResults({ result, onChat }: SimulationResultsProps) {
  if (result.status === 'error') {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
        <h3 className="text-sm font-medium text-red-400">Error en la simulacion</h3>
        <p className="mt-2 text-sm text-red-300/70">{result.error || 'Error desconocido.'}</p>
      </div>
    )
  }

  if (result.status === 'running') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative h-5 w-5">
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/30" />
            <div className="absolute inset-1 rounded-full bg-purple-500" />
          </div>
          <p className="text-sm text-zinc-300">Simulacion en progreso...</p>
        </div>
        {typeof result.progress === 'number' && (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                style={{ width: `${Math.min(result.progress, 100)}%` }}
              />
            </div>
            <p className="text-right text-xs text-zinc-500">{result.progress}%</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs text-amber-400/80">
          Los resultados de simulacion son generados por IA y no constituyen evidencia ni
          predicciones factuales. Son escenarios hipoteticos para analisis exploratorio.
        </p>
      </div>

      {/* Report */}
      {result.report && (
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Informe de prediccion
          </h3>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="prose prose-sm prose-invert max-w-none">
              {result.report.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h2 key={i} className="mt-4 text-base font-bold text-zinc-100 first:mt-0">{line.slice(2)}</h2>
                }
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="mt-3 text-sm font-semibold text-zinc-200">{line.slice(3)}</h3>
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-4 text-zinc-300">{line.slice(2)}</li>
                }
                if (line.trim() === '') return <br key={i} />
                return <p key={i} className="text-zinc-300">{line}</p>
              })}
            </div>
          </div>
        </div>
      )}

      {/* Agent decisions timeline */}
      {result.decisions && result.decisions.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Decisiones de agentes
          </h3>
          <div className="space-y-2">
            {result.decisions.map((decision, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-purple-400">
                    {decision.agent_name}
                  </span>
                  <span className="text-xs text-zinc-600">Ronda {decision.round}</span>
                </div>
                <p className="mt-1.5 text-sm text-zinc-200">{decision.action}</p>
                {decision.reasoning && (
                  <p className="mt-1 text-xs text-zinc-500">{decision.reasoning}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat CTA */}
      <button
        onClick={onChat}
        className="w-full rounded-lg border border-purple-500/30 bg-purple-500/10 py-3 text-sm font-medium text-purple-300 transition-all hover:border-purple-500/50 hover:bg-purple-500/20"
      >
        Conversar con agentes simulados
      </button>
    </div>
  )
}
