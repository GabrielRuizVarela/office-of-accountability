'use client'

/**
 * Caso Libra money flow page - wallet graph with transaction edges.
 * Wallet nodes sized by volume, edge width by amount.
 */

import { useCallback, useEffect, useState } from 'react'

import { useLanguage, type Lang } from '@/lib/language-context'
import type { GraphData } from '@/lib/neo4j/types'
import { ForceGraph } from '@/components/graph/ForceGraph'

const t = {
  loading: { es: 'Cargando flujo de dinero...', en: 'Loading money flow...' },
  loadError: { es: 'Error cargando flujo de dinero', en: 'Error loading money flow' },
  unknownError: { es: 'Error desconocido', en: 'Unknown error' },
  title: { es: 'Flujo de Dinero', en: 'Money Flow' },
  subtitle: {
    es: 'Movimiento de fondos entre billeteras en la blockchain de Solana.',
    en: 'Fund movement between wallets on the Solana blockchain.',
  },
  totalTracked: { es: 'Flujo total rastreado', en: 'Total tracked flow' },
  wallets: { es: 'Billeteras', en: 'Wallets' },
  transactions: { es: 'Transacciones', en: 'Transactions' },
  close: { es: 'Cerrar', en: 'Close' },
  wallet: { es: 'Billetera', en: 'Wallet' },
  owner: { es: 'Propietario', en: 'Owner' },
  txLabel: { es: 'Transacciones:', en: 'Transactions:' },
} satisfies Record<string, Record<Lang, string>>

export default function DineroPage() {
  const { lang } = useLanguage()
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/caso-libra/wallets')
        if (!res.ok) throw new Error(t.loadError[lang])
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : t.unknownError[lang])
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId))
  }, [])

  const selectedNode = selectedNodeId ? data.nodes.find((n) => n.id === selectedNodeId) : null

  // Calculate total flow for stats bar
  const totalFlow = data.links.reduce(
    (sum, link) => sum + ((link.properties.amount_usd as number) ?? 0),
    0,
  )

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-zinc-500">
        {t.loading[lang]}
      </div>
    )
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center text-red-400">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">{t.title[lang]}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {t.subtitle[lang]}
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">${totalFlow.toLocaleString('en-US')}</p>
          <p className="text-xs text-zinc-500">{t.totalTracked[lang]}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <p className="text-lg font-bold text-zinc-100">{data.nodes.length}</p>
          <p className="text-xs text-zinc-500">{t.wallets[lang]}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <p className="text-lg font-bold text-zinc-100">{data.links.length}</p>
          <p className="text-xs text-zinc-500">{t.transactions[lang]}</p>
        </div>
      </div>

      <div className="relative h-[55vh] overflow-hidden rounded-lg border border-zinc-800">
        <ForceGraph data={data} onNodeClick={handleNodeClick} selectedNodeId={selectedNodeId} />

        {/* Wallet detail panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto border-l border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="mb-3 text-xs text-zinc-500 hover:text-zinc-300"
            >
              {t.close[lang]}
            </button>
            <WalletDetail node={selectedNode} links={data.links} lang={lang} />
          </div>
        )}
      </div>
    </div>
  )
}

function WalletDetail({
  node,
  links,
  lang,
}: {
  readonly node: { readonly id: string; readonly properties: Readonly<Record<string, unknown>> }
  readonly links: readonly {
    readonly source: string
    readonly target: string
    readonly properties: Readonly<Record<string, unknown>>
  }[]
  readonly lang: Lang
}) {
  const walletLabel =
    typeof node.properties.label === 'string' ? node.properties.label : t.wallet[lang]
  const ownerId = typeof node.properties.owner_id === 'string' ? node.properties.owner_id : null
  const relatedLinks = links.filter((l) => {
    const src = typeof l.source === 'string' ? l.source : (l.source as { id?: string })?.id
    const tgt = typeof l.target === 'string' ? l.target : (l.target as { id?: string })?.id
    return src === node.id || tgt === node.id
  })

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-emerald-400">{walletLabel}</h3>
      <p className="break-all font-mono text-[10px] text-zinc-500">{node.id}</p>
      {ownerId && <p className="text-xs text-zinc-400">{t.owner[lang]}: {ownerId}</p>}
      <div className="mt-3 space-y-1">
        <p className="text-[10px] font-medium text-zinc-400">{t.txLabel[lang]}</p>
        {relatedLinks.map((l, i) => {
          const amount = typeof l.properties.amount_usd === 'number' ? l.properties.amount_usd : 0
          const timestamp = typeof l.properties.timestamp === 'string' ? l.properties.timestamp : ''
          return (
            <div key={i} className="rounded bg-zinc-900 p-2 text-[10px]">
              <p className="text-emerald-400">${amount.toLocaleString('en-US')} USD</p>
              <p className="text-zinc-500">{timestamp}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
