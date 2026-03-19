'use client'

/**
 * Post-simulation chat interface — talk to simulated agents or the ReportAgent.
 */

import { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  readonly role: 'user' | 'agent'
  readonly content: string
  readonly agentName?: string
  readonly timestamp: string
}

interface AgentChatProps {
  readonly sessionId: string
  readonly onClose: () => void
}

export function AgentChat({ sessionId, onClose }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const message = input.trim()
    if (!message || isLoading) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/caso-libra/simulate/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data = await response.json()
      const agentMsg: ChatMessage = {
        role: 'agent',
        content: data.response || data.message || 'Sin respuesta.',
        agentName: data.agent_name || 'Agente',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, agentMsg])
    } catch {
      const errorMsg: ChatMessage = {
        role: 'agent',
        content: 'Error al comunicarse con el agente. Intenta de nuevo.',
        agentName: 'Sistema',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[500px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Chat con agentes simulados</h3>
          <p className="text-xs text-zinc-500">Sesion {sessionId.slice(0, 8)}...</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          aria-label="Cerrar chat"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-zinc-600">
              Hace una pregunta a los agentes simulados.
              <br />
              <span className="text-xs">
                Ej: &quot;Milei, como justificas tu publicacion del token?&quot;
              </span>
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-purple-600/20 text-zinc-200'
                  : 'border border-zinc-800 bg-zinc-800/50 text-zinc-300'
              }`}
            >
              {msg.role === 'agent' && msg.agentName && (
                <p className="mb-1 text-xs font-medium text-purple-400">{msg.agentName}</p>
              )}
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-zinc-800 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta a un agente simulado..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 transition-colors focus:border-purple-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
