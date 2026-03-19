'use client'

import { useCallback, useEffect, useRef } from 'react'

export interface ContextMenuAction {
  readonly label: string
  readonly icon: React.ReactNode
  readonly onClick: () => void
  readonly disabled?: boolean
}

export interface NodeContextMenuProps {
  readonly x: number
  readonly y: number
  readonly actions: readonly ContextMenuAction[]
  readonly onClose: () => void
}

export function NodeContextMenu({ x, y, actions, onClose }: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Clamp position to viewport bounds
  const clampedPos = useCallback(() => {
    const el = menuRef.current
    if (!el) return { left: x, top: y }
    const rect = el.getBoundingClientRect()
    const left = Math.min(x, window.innerWidth - rect.width - 8)
    const top = Math.min(y, window.innerHeight - rect.height - 8)
    return { left: Math.max(8, left), top: Math.max(8, top) }
  }, [x, y])

  // Adjust position after first render
  useEffect(() => {
    const el = menuRef.current
    if (!el) return
    const pos = clampedPos()
    el.style.left = `${pos.left}px`
    el.style.top = `${pos.top}px`
  }, [clampedPos])

  useEffect(() => {
    const handler = () => onClose()
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler) }
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div ref={menuRef} className="fixed z-50 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
      style={{ left: x, top: y }}>
      {actions.map((action) => (
        <button key={action.label}
          onClick={() => { action.onClick(); onClose() }}
          disabled={action.disabled}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40 disabled:pointer-events-none">
          <span className="h-4 w-4 flex-shrink-0">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  )
}
