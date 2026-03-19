'use client'

/**
 * Scenario input form for MiroFish simulation.
 * Allows users to describe a "what if" scenario and configure simulation parameters.
 */

import { useState } from 'react'

interface ScenarioInputProps {
  readonly onSubmit: (scenario: string, rounds: number) => void
  readonly isLoading: boolean
}

const EXAMPLE_SCENARIOS = [
  {
    label: 'Cooperacion de Davis',
    text: 'Que pasa si Hayden Davis coopera con la justicia argentina y entrega toda la documentacion de Kelsier Ventures?',
  },
  {
    label: 'Llamadas de Caputo',
    text: 'Que pasaria si se publican los registros completos de llamadas de Santiago Caputo con todos los involucrados?',
  },
  {
    label: 'Juicio politico',
    text: 'Como reaccionaria el mercado cripto argentino y la opinion publica si Milei enfrenta juicio politico por el caso $LIBRA?',
  },
  {
    label: 'Nuevas billeteras',
    text: 'Que pasa si aparecen mas billeteras vinculadas a funcionarios del gobierno con fondos provenientes del token $LIBRA?',
  },
]

export function ScenarioInput({ onSubmit, isLoading }: ScenarioInputProps) {
  const [scenario, setScenario] = useState('')
  const [rounds, setRounds] = useState(40)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (scenario.trim() && !isLoading) {
      onSubmit(scenario.trim(), rounds)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Scenario text */}
      <div>
        <label htmlFor="scenario" className="mb-2 block text-sm font-medium text-zinc-300">
          Escenario hipotetico
        </label>
        <textarea
          id="scenario"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="Describi un escenario alternativo... Ej: &quot;Que pasaria si...&quot;"
          rows={4}
          maxLength={2000}
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
        />
        <p className="mt-1 text-right text-xs text-zinc-600">{scenario.length}/2000</p>
      </div>

      {/* Example scenarios */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Escenarios sugeridos
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SCENARIOS.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => setScenario(example.text)}
              disabled={isLoading}
              className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300 disabled:opacity-50"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Config */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label htmlFor="rounds" className="mb-2 block text-sm font-medium text-zinc-300">
            Rondas de simulacion
          </label>
          <div className="flex items-center gap-3">
            <input
              id="rounds"
              type="range"
              min={5}
              max={100}
              step={5}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              disabled={isLoading}
              className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 accent-purple-500 disabled:opacity-50"
            />
            <span className="w-10 text-right text-sm tabular-nums text-zinc-300">{rounds}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={!scenario.trim() || isLoading}
          className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Simulando...
            </span>
          ) : (
            'Iniciar simulacion'
          )}
        </button>
      </div>
    </form>
  )
}
