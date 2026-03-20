import { useCallback, useEffect, useRef, useState } from 'react'

import type { GraphNode } from '../../lib/neo4j/types'

export interface GraphKeyboardNavOptions {
  readonly nodes: readonly GraphNode[]
  readonly visibleLabels: ReadonlySet<string>
  readonly selectedNodeId: string | null
  readonly onExpand: (nodeId: string) => void
  readonly onDeselect: () => void
  readonly onCenterOnNode: (nodeId: string) => void
  readonly onUndo?: () => void
}

export interface GraphKeyboardNavResult {
  readonly focusedNodeId: string | null
  readonly handleKeyDown: (event: KeyboardEvent) => void
}

export function useGraphKeyboardNav({
  nodes,
  visibleLabels,
  selectedNodeId,
  onExpand,
  onDeselect,
  onCenterOnNode,
  onUndo,
}: GraphKeyboardNavOptions): GraphKeyboardNavResult {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const focusedIndexRef = useRef(focusedIndex)
  focusedIndexRef.current = focusedIndex
  const visibleNodesRef = useRef<readonly GraphNode[]>([])

  // Compute visible nodes (filtered by label)
  const visibleNodes = nodes.filter((node) =>
    node.labels.some((label) => visibleLabels.has(label)),
  )
  visibleNodesRef.current = visibleNodes

  // Reset focus when data or filters change
  useEffect(() => {
    setFocusedIndex(-1)
  }, [nodes.length, visibleLabels])

  const focusedNodeId =
    focusedIndex >= 0 && focusedIndex < visibleNodes.length
      ? visibleNodes[focusedIndex].id
      : null

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't intercept when typing in an input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl+Z / Cmd+Z — undo
      if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        onUndo?.()
        return
      }

      const currentVisible = visibleNodesRef.current
      if (currentVisible.length === 0) return

      switch (event.key) {
        case 'Tab': {
          event.preventDefault()
          setFocusedIndex((prev) => {
            const next = event.shiftKey
              ? prev <= 0
                ? currentVisible.length - 1
                : prev - 1
              : prev >= currentVisible.length - 1
                ? 0
                : prev + 1
            const node = currentVisible[next]
            if (node) {
              onCenterOnNode(node.id)
            }
            return next
          })
          break
        }
        case 'Enter': {
          event.preventDefault()
          const idx = focusedIndexRef.current
          const node = idx >= 0 && idx < currentVisible.length ? currentVisible[idx] : null
          if (node) onExpand(node.id)
          break
        }
        case 'Escape': {
          event.preventDefault()
          setFocusedIndex(-1)
          onDeselect()
          break
        }
      }
    },
    [onExpand, onDeselect, onCenterOnNode, onUndo],
  )

  // Attach global keydown listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { focusedNodeId, handleKeyDown }
}
