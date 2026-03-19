'use client'

/**
 * Caso Libra simulation page — MiroFish scenario simulation interface.
 */

import { useState, useCallback, useRef } from 'react'

import { ScenarioInput } from '@/components/investigation/ScenarioInput'
import { SimulationResults } from '@/components/investigation/SimulationResults'
import { AgentChat } from '@/components/investigation/AgentChat'

interface SimulationResult {
  sessionId: string
  status: 'running' | 'completed' | 'error'
  progress?: number
  report?: string
  decisions?: readonly {
    agent_name: string
    round: number
    action: string
    reasoning: string
  }[]
  error?: string
}

export default function SimularPage() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const pollStatus = useCallback(
    (sessionId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/caso-libra/simulate/${sessionId}`)
          if (!response.ok) return

          const data = await response.json()
          setResult({
            sessionId,
            status: data.status || 'running',
            progress: data.progress,
            report: data.report,
            decisions: data.decisions,
            error: data.error,
          })

          if (data.status === 'completed' || data.status === 'error') {
            stopPolling()
            setIsLoading(false)
          }
        } catch {
          // Retry on next interval
        }
      }, 3000)
    },
    [stopPolling],
  )

  async function handleSubmit(scenario: string, rounds: number) {
    setIsLoading(true)
    setShowChat(false)
    setResult(null)
    stopPolling()

    try {
      const response = await fetch('/api/caso-libra/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, rounds }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setResult({
          sessionId: '',
          status: 'error',
          error: data.error || `Error ${response.status}`,
        })
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const sessionId = data.sessionId || data.session_id || ''

      setResult({
        sessionId,
        status: 'running',
        progress: 0,
      })

      if (sessionId) {
        pollStatus(sessionId)
      }
    } catch {
      setResult({
        sessionId: '',
        status: 'error',
        error: 'No se pudo conectar con el motor de simulacion.',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Simulacion de escenarios</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Motor de inteligencia de enjambre para explorar escenarios hipoteticos del caso
          $LIBRA. Los agentes autonomos simulan como podrian desarrollarse eventos alternativos.
        </p>
      </div>

      {/* Scenario input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <ScenarioInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Results */}
      {result && !showChat && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <SimulationResults result={result} onChat={() => setShowChat(true)} />
        </div>
      )}

      {/* Chat */}
      {showChat && result?.sessionId && (
        <AgentChat sessionId={result.sessionId} onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}
