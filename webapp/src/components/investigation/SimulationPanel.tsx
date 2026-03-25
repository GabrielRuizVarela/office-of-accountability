'use client'

import { useState } from 'react'

import type { PredictionPrompt, SimulationMessage } from '../../lib/mirofish/types'

const PRESET_PROMPTS: readonly PredictionPrompt[] = [
  {
    id: 'financial-network',
    title: 'Financial Network',
    description: 'Map the complete financial network between Epstein and his associates',
    prompt: 'Map the complete financial network between Epstein and his associates. Identify money flows, shell companies, and financial intermediaries.',
  },
  {
    id: 'undisclosed-connections',
    title: 'Hidden Connections',
    description: 'Identify potential undisclosed connections based on proximity patterns',
    prompt: 'Analyze proximity patterns — overlapping locations, dates, and organizational affiliations — to identify potential undisclosed connections between network members.',
  },
  {
    id: 'information-flow',
    title: 'Information Flow',
    description: 'Simulate information flow: who knew what and when',
    prompt: 'Simulate the flow of information through this network. Based on the documented relationships and timeline, model who likely knew about the trafficking activities and when they would have learned.',
  },
  {
    id: 'document-predictions',
    title: 'Document Predictions',
    description: 'Predict which unsealed documents would reveal the most new connections',
    prompt: 'Based on the existing network structure and known gaps, predict which currently sealed or unreleased documents would reveal the most significant new connections if made public.',
  },
]

interface SimulationPanelProps {
  readonly casoSlug: string
}

export function SimulationPanel({ casoSlug }: SimulationPanelProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'running' | 'error'>('idle')
  const [messages, setMessages] = useState<SimulationMessage[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setStatus('connecting')
    setError(null)

    try {
      const res = await fetch(`/api/caso/${casoSlug}/simulation/init`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to initialize simulation')
      setStatus('ready')
      setMessages([{
        role: 'system',
        content: 'Simulation initialized. Select a preset prompt or enter your own query.',
        timestamp: new Date().toISOString(),
      }])
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  const handleQuery = async (prompt: string) => {
    if (status !== 'ready') return
    setStatus('running')

    setMessages((prev) => [...prev, {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    }])

    try {
      const res = await fetch(`/api/caso/${casoSlug}/simulation/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) throw new Error('Query failed')
      const json = await res.json()

      if (json.data?.messages) {
        setMessages((prev) => [...prev, ...json.data.messages])
      }
      setStatus('ready')
    } catch (err) {
      setStatus('ready')
      setMessages((prev) => [...prev, {
        role: 'system',
        content: `Error: ${err instanceof Error ? err.message : 'Query failed'}`,
        timestamp: new Date().toISOString(),
      }])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    handleQuery(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      {status === 'idle' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-bold text-zinc-50">Swarm Intelligence</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Run AI-powered network analysis simulations using the investigation data.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Requires a running llama.cpp instance on a GPU machine.
            </p>
          </div>
          <button
            onClick={handleInitialize}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Initialize Simulation
          </button>
        </div>
      )}

      {status === 'connecting' && (
        <div className="flex flex-1 items-center justify-center text-zinc-500">
          Connecting to LLM server...
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={handleInitialize}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Retry
          </button>
        </div>
      )}

      {(status === 'ready' || status === 'running') && (
        <>
          {/* Preset prompts */}
          {messages.length <= 1 && (
            <div className="border-b border-zinc-800 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Preset Analysis
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRESET_PROMPTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleQuery(preset.prompt)}
                    disabled={status === 'running'}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-colors hover:border-zinc-700 disabled:opacity-50"
                  >
                    <div className="text-sm font-medium text-zinc-200">{preset.title}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    msg.role === 'user'
                      ? 'ml-8 bg-blue-600/20 text-blue-200'
                      : msg.role === 'system'
                        ? 'bg-zinc-800/50 text-zinc-400 italic'
                        : 'mr-8 bg-zinc-800 text-zinc-200'
                  }`}
                >
                  {msg.agent_name && (
                    <div className="mb-1 text-xs font-semibold text-zinc-400">
                      {msg.agent_name}
                    </div>
                  )}
                  {msg.content}
                </div>
              ))}
              {status === 'running' && (
                <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-500 italic">
                  Agents analyzing...
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the simulation..."
                disabled={status === 'running'}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'running' || !input.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
