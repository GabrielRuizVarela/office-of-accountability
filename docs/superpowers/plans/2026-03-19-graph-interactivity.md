# Graph Interactivity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the graph explorer from a reset-on-click viewer into an interactive investigation tool with expand-in-place, path finding, smart labels, node pinning, and saveable investigations.

**Architecture:** Incremental upgrade of existing react-force-graph-2d components. New shared constants module, new graph algorithms module, new UI components (toolbar, context menu, path finder). All changes scoped to `/explorar` page only.

**Tech Stack:** React 19, react-force-graph-2d, Next.js 16 API routes, Neo4j Cypher (parameterized), TailwindCSS 4, TypeScript, Zod 4

**Spec:** `docs/superpowers/specs/2026-03-19-graph-interactivity-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `webapp/src/lib/graph/constants.ts` | Shared LABEL_COLORS, LABEL_DISPLAY, DEFAULT_NODE_COLOR, getNodeColor, getNodeLabel, getLabelColor, getLabelDisplayName |
| `webapp/src/lib/graph/algorithms.ts` | Client-side BFS shortest path, exclusive-neighbor detection for collapse |
| `webapp/src/lib/graph/investigation.ts` | Investigation state serialization/deserialization, localStorage CRUD |
| `webapp/src/components/graph/GraphToolbar.tsx` | Toolbar row with icon buttons: Find Path, Clear, Save, Load, Unpin All |
| `webapp/src/components/graph/NodeContextMenu.tsx` | Right-click/long-press context menu positioned at click point |
| `webapp/src/components/graph/PathFinder.tsx` | Path input bar with two search fields + Go button |
| `webapp/src/app/api/graph/path/route.ts` | Shortest path API endpoint using Neo4j shortestPath() |

### Modified files
| File | Changes |
|------|---------|
| `webapp/src/lib/graph/transform.ts` | Fix link deduplication in `mergeGraphData()` |
| `webapp/src/lib/graph/index.ts` | Re-export new modules |
| `webapp/src/components/graph/ForceGraph.tsx` | Import shared constants, add smart label density, pin indicators, path highlights, context menu events, remove auto-zoomToFit |
| `webapp/src/components/graph/NodeDetailPanel.tsx` | Import shared constants, add pin toggle + expand button |
| `webapp/src/components/graph/SearchBar.tsx` | Import shared constants instead of local copy |
| `webapp/src/components/graph/TypeFilter.tsx` | Import shared constants instead of local copy |
| `webapp/src/components/graph/useGraphKeyboardNav.ts` | Add Ctrl+Z undo handler |
| `webapp/src/app/explorar/page.tsx` | Wire up all new features: expand-in-place, undo, toolbar, context menu, path finding, pinning, investigation save/load |

---

### Task 1: Extract Shared Constants

**Files:**
- Create: `webapp/src/lib/graph/constants.ts`
- Modify: `webapp/src/components/graph/ForceGraph.tsx:12-47`
- Modify: `webapp/src/components/graph/NodeDetailPanel.tsx:40-92`
- Modify: `webapp/src/components/graph/SearchBar.tsx:30-48`
- Modify: `webapp/src/components/graph/TypeFilter.tsx:19-50`
- Modify: `webapp/src/lib/graph/index.ts`

- [ ] **Step 1: Create `webapp/src/lib/graph/constants.ts`**

```typescript
/** Shared graph display constants — single source of truth for colors, labels, and display names. */

export const LABEL_COLORS: Readonly<Record<string, string>> = {
  Politician: '#3b82f6',
  Party: '#8b5cf6',
  Province: '#10b981',
  LegislativeVote: '#f59e0b',
  Legislation: '#ef4444',
  Investigation: '#ec4899',
  User: '#6b7280',
  Person: '#3b82f6',
  Flight: '#f97316',
  Location: '#10b981',
  Document: '#ef4444',
  Event: '#f59e0b',
  Organization: '#8b5cf6',
  LegalCase: '#ec4899',
}

export const DEFAULT_NODE_COLOR = '#94a3b8'

export const LABEL_DISPLAY: Readonly<Record<string, string>> = {
  Politician: 'Politico',
  Party: 'Partido',
  Province: 'Provincia',
  LegislativeVote: 'Votacion',
  Legislation: 'Legislacion',
  Investigation: 'Investigacion',
  User: 'Usuario',
  Person: 'Persona',
  Flight: 'Vuelo',
  Location: 'Ubicacion',
  Document: 'Documento',
  Event: 'Evento',
  Organization: 'Organizacion',
  LegalCase: 'Caso Legal',
}

export const LINK_COLORS: Readonly<Record<string, string>> = {
  CAST_VOTE: '#475569',
  MEMBER_OF: '#7c3aed',
  REPRESENTS: '#059669',
  REFERENCES: '#dc2626',
  ASSOCIATED_WITH: '#6366f1',
  FLEW_WITH: '#f97316',
  VISITED: '#10b981',
  OWNED: '#a855f7',
  EMPLOYED_BY: '#8b5cf6',
  AFFILIATED_WITH: '#8b5cf6',
  MENTIONED_IN: '#ef4444',
  PARTICIPATED_IN: '#f59e0b',
  FILED_IN: '#ec4899',
  DOCUMENTED_BY: '#ec4899',
  FINANCED: '#22c55e',
}

export const DEFAULT_LINK_COLOR = '#334155'

import type { GraphNode } from '../neo4j/types'

export function getNodeColor(node: GraphNode): string {
  const label = node.labels[0]
  return label ? (LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR) : DEFAULT_NODE_COLOR
}

export function getNodeLabel(node: GraphNode): string {
  const props = node.properties
  if (typeof props.name === 'string') return props.name
  if (typeof props.title === 'string') return props.title
  if (typeof props.full_name === 'string') return props.full_name
  return node.id
}

export function getLabelColor(label: string): string {
  return LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR
}

export function getLabelDisplayName(label: string): string {
  return LABEL_DISPLAY[label] ?? label
}

export function getLinkColor(type: string): string {
  return LINK_COLORS[type] ?? DEFAULT_LINK_COLOR
}
```

- [ ] **Step 2: Update ForceGraph.tsx to import from shared constants**

Remove lines 12-47 (the `LABEL_COLORS`, `DEFAULT_NODE_COLOR`, `getNodeColor`, `getNodeLabel` declarations). Add import:

```typescript
import { getNodeColor, getNodeLabel, getLinkColor } from '../../lib/graph/constants'
```

Replace the `linkColor` callback body to use `getLinkColor(link.type)` instead of the switch statement.

- [ ] **Step 3: Update NodeDetailPanel.tsx to import from shared constants**

Remove lines 40-92 (local `LABEL_COLORS`, `LABEL_DISPLAY`, `getNodeDisplayName`, `getLabelColor`, `getLabelDisplayName`). Add import:

```typescript
import { getNodeLabel, getLabelColor, getLabelDisplayName } from '../../lib/graph/constants'
```

Replace `getNodeDisplayName` calls with `getNodeLabel`. Replace local `getLabelColor`/`getLabelDisplayName` with imports.

- [ ] **Step 4: Update SearchBar.tsx to import from shared constants**

Remove lines 30-48 (local `LABEL_COLORS`, `getNodeDisplayName`). Add import:

```typescript
import { LABEL_COLORS, getNodeLabel } from '../../lib/graph/constants'
```

Replace `getNodeDisplayName` with `getNodeLabel` in `toSearchResult`.

- [ ] **Step 5: Update TypeFilter.tsx to import from shared constants**

Remove lines 19-50 (local `LABEL_COLORS`, `LABEL_DISPLAY`, `DEFAULT_COLOR`, `getLabelColor`, `getLabelDisplayName`). Add import:

```typescript
import { getLabelColor, getLabelDisplayName } from '../../lib/graph/constants'
```

- [ ] **Step 6: Update `webapp/src/lib/graph/index.ts`**

Add re-export:

```typescript
export {
  LABEL_COLORS,
  DEFAULT_NODE_COLOR,
  LABEL_DISPLAY,
  LINK_COLORS,
  DEFAULT_LINK_COLOR,
  getNodeColor,
  getNodeLabel,
  getLabelColor,
  getLabelDisplayName,
  getLinkColor,
} from './constants'
```

- [ ] **Step 7: Verify the dev server compiles**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Check for TypeScript errors. The graph page should render identically to before.

- [ ] **Step 8: Commit**

```bash
git add webapp/src/lib/graph/constants.ts webapp/src/lib/graph/index.ts \
  webapp/src/components/graph/ForceGraph.tsx \
  webapp/src/components/graph/NodeDetailPanel.tsx \
  webapp/src/components/graph/SearchBar.tsx \
  webapp/src/components/graph/TypeFilter.tsx
git commit -m "refactor: extract shared graph constants into constants.ts"
```

---

### Task 2: Fix Link Deduplication in mergeGraphData

**Files:**
- Modify: `webapp/src/lib/graph/transform.ts:201-216`

- [ ] **Step 1: Fix `mergeGraphData` to deduplicate links**

Replace the `mergeGraphData` function at line 201:

```typescript
export function mergeGraphData(...graphs: readonly GraphData[]): GraphData {
  const nodeMap = new Map<string, GraphNode>()
  const linkMap = new Map<string, GraphLink>()

  for (const graph of graphs) {
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node)
    }
    for (const link of graph.links) {
      const key = `${link.source}:${link.target}:${link.type}`
      linkMap.set(key, link)
    }
  }

  return {
    nodes: [...nodeMap.values()],
    links: [...linkMap.values()],
  }
}
```

- [ ] **Step 2: Verify dev server compiles**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

- [ ] **Step 3: Commit**

```bash
git add webapp/src/lib/graph/transform.ts
git commit -m "fix: deduplicate links in mergeGraphData"
```

---

### Task 3: Remove Auto-zoomToFit on Data Change

**Files:**
- Modify: `webapp/src/components/graph/ForceGraph.tsx:200-206`

- [ ] **Step 1: Remove the auto-zoomToFit useEffect**

Delete lines 200-206 in ForceGraph.tsx:

```typescript
// DELETE THIS:
useEffect(() => {
  const fg = graphRef.current
  if (fg && data.nodes.length > 0) {
    setTimeout(() => fg.zoomToFit(400, 40), 300)
  }
}, [data.nodes.length])
```

The `zoomToFit` imperative handle method still exists for explicit calls from the page.

- [ ] **Step 2: Verify dev server compiles**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

- [ ] **Step 3: Commit**

```bash
git add webapp/src/components/graph/ForceGraph.tsx
git commit -m "fix: remove auto-zoomToFit on data change to support expand-in-place"
```

---

### Task 4: Expand-in-Place + Undo Stack

**Files:**
- Modify: `webapp/src/app/explorar/page.tsx`
- Modify: `webapp/src/components/graph/useGraphKeyboardNav.ts`

This is the core behavioral change — clicking a node selects it, expanding merges neighbors into the graph.

- [ ] **Step 1: Add expand-in-place logic to explorar page**

Rewrite `webapp/src/app/explorar/page.tsx`. Key changes:

1. Change `handleNodeClick` to just `setSelectedNodeId(nodeId)` (select only, no load).
2. Add new `expandNode` callback that:
   - Saves current graph state to undo stack before expanding
   - Calls `/api/graph/expand/${nodeId}?depth=1&limit=50`
   - Gets current node positions from `graphRef.current` kapsule `graphData()` method
   - Merges result via `mergeGraphData(currentGraphData, expandedData)`
   - Sets new node positions: existing nodes keep `x/y/vx/vy` from internal state, new nodes get `x/y` from the expanded node's position
   - Sets `graphData` to merged result
3. Add `undoStack` state: `useState<GraphData[]>([])` (max 10 entries).
4. Add `undo` callback: pops last state from stack, sets it as current graphData.
5. Add `clearGraph` callback: resets graphData to EMPTY_GRAPH, clears undo stack, calls `graphRef.current?.zoomToFit()`.
6. Change `handleSearchSelect` to call `expandNode` (so searching a node adds it to the graph instead of replacing).
7. Change `handleNavigate` in detail panel to call `expandNode`.

```typescript
// Undo stack (max 10)
const [undoStack, setUndoStack] = useState<GraphData[]>([])

// Ref to current graphData to avoid stale closure in expandNode/collapseNode
const graphDataRef = useRef(graphData)
graphDataRef.current = graphData

// Expand a node's neighborhood (merge, don't replace)
const expandNode = useCallback(async (nodeId: string) => {
  setIsLoading(true)
  try {
    const params = new URLSearchParams({ depth: '1', limit: '50' })
    const response = await fetch(
      `/api/graph/expand/${encodeURIComponent(nodeId)}?${params.toString()}`,
    )
    if (!response.ok) return

    const json = await response.json()
    if (!json.success || !json.data) return

    const newData = json.data as GraphData

    // Save current state to undo stack before merging
    // Use graphDataRef to avoid stale closure
    setUndoStack((prev) => [...prev.slice(-9), graphDataRef.current])

    // Get current positions from internal force graph state
    const fg = graphRef.current as unknown as { graphData(): { nodes: Array<{ id: string; x?: number; y?: number; vx?: number; vy?: number }> } } | undefined
    const internalNodes = fg?.graphData().nodes ?? []
    const positionMap = new Map<string, { x: number; y: number; vx: number; vy: number }>()
    for (const n of internalNodes) {
      if (typeof n.x === 'number' && typeof n.y === 'number') {
        positionMap.set(n.id as string, { x: n.x, y: n.y, vx: n.vx ?? 0, vy: n.vy ?? 0 })
      }
    }

    // Find expanded node position for new nodes
    const expandedPos = positionMap.get(nodeId) ?? { x: 0, y: 0 }

    const merged = mergeGraphData(graphData, newData)

    // Annotate nodes with positions
    const positionedNodes = merged.nodes.map((node) => {
      const existing = positionMap.get(node.id)
      if (existing) {
        return { ...node, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy }
      }
      // New nodes start at the expanded node's position
      return { ...node, x: expandedPos.x + (Math.random() - 0.5) * 20, y: expandedPos.y + (Math.random() - 0.5) * 20 }
    })

    setGraphData({ nodes: positionedNodes, links: merged.links } as GraphData)
    setSelectedNodeId(nodeId)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
  } finally {
    setIsLoading(false)
  }
}, [graphData])

// Undo last expansion
const undo = useCallback(() => {
  setUndoStack((prev) => {
    if (prev.length === 0) return prev
    const last = prev[prev.length - 1]
    setGraphData(last)
    return prev.slice(0, -1)
  })
}, [])

// Clear graph and reset
const clearGraph = useCallback(() => {
  setGraphData(EMPTY_GRAPH)
  setSelectedNodeId(null)
  setUndoStack([])
  setTimeout(() => graphRef.current?.zoomToFit(), 100)
}, [])

// Node click = select only
const handleNodeClick = useCallback((nodeId: string) => {
  setSelectedNodeId(nodeId)
}, [])

// Search result = expand into graph
const handleSearchSelect = useCallback((nodeId: string) => {
  expandNode(nodeId)
}, [expandNode])

// Detail panel navigate = expand
const handleNavigate = useCallback((nodeId: string) => {
  expandNode(nodeId)
}, [expandNode])
```

- [ ] **Step 2: Update `useGraphKeyboardNav.ts` for Ctrl+Z undo and expand-in-place**

Add `onUndo` to `GraphKeyboardNavOptions`:

```typescript
export interface GraphKeyboardNavOptions {
  readonly nodes: readonly GraphNode[]
  readonly visibleLabels: ReadonlySet<string>
  readonly selectedNodeId: string | null
  readonly onExpand: (nodeId: string) => void
  readonly onDeselect: () => void
  readonly onCenterOnNode: (nodeId: string) => void
  readonly onUndo?: () => void
}
```

Add Ctrl+Z handler in the switch statement (before the existing cases):

```typescript
// At the top of handleKeyDown, before the switch:
if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
  event.preventDefault()
  onUndo?.()
  return
}
```

- [ ] **Step 3: Wire onUndo in explorar page**

In the `useGraphKeyboardNav` call, add `onUndo: undo`:

```typescript
const { focusedNodeId } = useGraphKeyboardNav({
  nodes: graphData.nodes,
  visibleLabels,
  selectedNodeId,
  onExpand: expandNode,
  onDeselect: handleClosePanel,
  onCenterOnNode: handleCenterOnNode,
  onUndo: undo,
})
```

- [ ] **Step 4: Verify dev server compiles and test manually**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Open `/explorar`, search for a node. Click it — should select (not replace). Use keyboard Enter or (once context menu exists in Task 7) right-click to expand. Ctrl+Z should undo.

- [ ] **Step 5: Commit**

```bash
git add webapp/src/app/explorar/page.tsx webapp/src/components/graph/useGraphKeyboardNav.ts
git commit -m "feat: expand-in-place with undo stack (Ctrl+Z)"
```

---

### Task 5: Smart Label Density

**Files:**
- Modify: `webapp/src/components/graph/ForceGraph.tsx`

- [ ] **Step 1: Add degree computation and smart label rendering**

In ForceGraph.tsx, add a memoized degree threshold computation after `const fgData = toFGData(data)`:

```typescript
// Compute degree map and importance threshold for smart label density
const { degreeMap, importanceThreshold } = useMemo(() => {
  const dm = new Map<string, number>()
  for (const node of data.nodes) {
    dm.set(node.id, 0)
  }
  for (const link of data.links) {
    dm.set(link.source, (dm.get(link.source) ?? 0) + 1)
    dm.set(link.target, (dm.get(link.target) ?? 0) + 1)
  }
  const degrees = [...dm.values()].sort((a, b) => b - a)
  const topIndex = Math.max(1, Math.floor(degrees.length * 0.2))
  const threshold = degrees[topIndex - 1] ?? 1
  return { degreeMap: dm, importanceThreshold: threshold }
}, [data.nodes, data.links])
```

Add `useMemo` to the import from React.

Add a hysteresis ref for label state (tracks whether labels are currently showing to prevent flicker at zoom boundaries):

```typescript
// Hysteresis for label visibility — tracks current state to prevent flicker
const labelStateRef = useRef({ showAll: false, showImportant: false })

// Update label state based on zoom (called in onZoom or via a zoom tracking effect)
// Uses different thresholds for showing vs hiding to create hysteresis
const updateLabelState = useCallback((zoom: number) => {
  const state = labelStateRef.current
  // Show all: enters at 2.0, exits at 1.8
  state.showAll = state.showAll ? zoom > 1.8 : zoom > 2.0
  // Show important: enters at 1.0, exits at 0.8
  state.showImportant = state.showImportant ? zoom > 0.8 : zoom > 1.0
}, [])
```

Pass `onZoom={updateLabelState}` to ForceGraph2D's `onZoom` prop (which fires with the current zoom level on each zoom change).

- [ ] **Step 2: Update paintNode to use smart density**

Replace the label section in `paintNode` (around line 272):

```typescript
// Node radius scales with degree
const degree = degreeMap.get(fgNode.id) ?? 0
const baseRadius = Math.min(4 + degree * 0.5, 12)
const radius = isSelected ? baseRadius + 2 : baseRadius
```

Replace the label rendering block:

```typescript
// Smart label density
// Hysteresis is handled via a ref outside paintNode (see labelStateRef below)
const isImportant = degree >= importanceThreshold
const isPinned = pinnedNodeIds?.has(fgNode.id) ?? false

const shouldShow =
  isSelected || isFocused || isPinned ||
  labelStateRef.current.showAll ||
  (isImportant && labelStateRef.current.showImportant)

if (shouldShow) {
  const fontSize = Math.max(12 / globalScale, 2)
  const fontWeight = (isSelected || isPinned) ? 'bold' : 'normal'
  ctx.font = `${fontWeight} ${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#e2e8f0'
  ctx.fillText(fgNode._label, x, y + radius + 2)
}
```

Update the `paintNode` dependency array to include `degreeMap` and `importanceThreshold`.

- [ ] **Step 3: Update paintPointerArea to use degree-based radius**

```typescript
const paintPointerArea = useCallback(
  (node: NodeObject<FGNode>, color: string, ctx: CanvasRenderingContext2D) => {
    const x = node.x ?? 0
    const y = node.y ?? 0
    const fgNode = node as FGNode
    const degree = degreeMap.get(fgNode.id) ?? 0
    const baseRadius = Math.min(4 + degree * 0.5, 12)
    const radius = (selectedNodeId === fgNode.id ? baseRadius + 4 : baseRadius + 2)

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
  },
  [selectedNodeId, degreeMap],
)
```

- [ ] **Step 4: Add hover tooltip**

Add a `nodeLabel` callback prop to ForceGraph2D that shows name + type on hover:

```typescript
const nodeTooltip = useCallback((node: NodeObject<FGNode>) => {
  const fgNode = node as FGNode
  const label = fgNode.labels[0] ?? ''
  return `${fgNode._label} (${getLabelDisplayName(label)})`
}, [])
```

Add to the ForceGraph2D JSX: `nodeLabel={nodeTooltip as (node: object) => string}`

- [ ] **Step 5: Verify dev server compiles and test**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Load a graph with many nodes. At zoom < 1x, only dots should show. At 1-2x, only high-degree nodes get labels. At 2x+, all labels. Hover should always show tooltip.

- [ ] **Step 6: Commit**

```bash
git add webapp/src/components/graph/ForceGraph.tsx
git commit -m "feat: smart label density based on degree centrality and zoom"
```

---

### Task 6: Node Pinning

**Files:**
- Modify: `webapp/src/components/graph/ForceGraph.tsx`
- Modify: `webapp/src/components/graph/NodeDetailPanel.tsx`
- Modify: `webapp/src/app/explorar/page.tsx`

- [ ] **Step 1: Add pin state and props to ForceGraph**

Add new props to `ForceGraphProps`:

```typescript
export interface ForceGraphProps {
  readonly data: GraphData
  readonly onNodeClick?: (nodeId: string) => void
  readonly selectedNodeId?: string | null
  readonly focusedNodeId?: string | null
  readonly visibleLabels?: ReadonlySet<string> | null
  readonly pinnedNodeIds?: ReadonlySet<string>
  readonly pathHighlight?: { nodeIds: ReadonlySet<string>; linkKeys: ReadonlySet<string> } | null
  readonly width?: number
  readonly height?: number
}
```

Destructure `pinnedNodeIds` and `pathHighlight` in the component.

- [ ] **Step 2: Add pin indicator rendering in paintNode**

After the selection highlight ring, add pin indicator:

```typescript
// Pin indicator
const isPinned = pinnedNodeIds?.has(fgNode.id) ?? false
if (isPinned) {
  ctx.beginPath()
  ctx.arc(x, y - radius - 3, 2, 0, 2 * Math.PI)
  ctx.fillStyle = '#facc15' // yellow-400
  ctx.fill()
}
```

- [ ] **Step 3: Add pin/unpin logic to ForceGraph via imperative handle**

Add to the `useImperativeHandle`:

```typescript
pinNode(nodeId: string) {
  const fg = graphRef.current
  if (!fg) return
  const internalData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
  const node = internalData.nodes.find((n) => n.id === nodeId)
  if (node) {
    node.fx = node.x
    node.fy = node.y
  }
},
unpinNode(nodeId: string) {
  const fg = graphRef.current
  if (!fg) return
  const internalData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
  const node = internalData.nodes.find((n) => n.id === nodeId)
  if (node) {
    node.fx = undefined
    node.fy = undefined
  }
},
unpinAll() {
  const fg = graphRef.current
  if (!fg) return
  const internalData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
  for (const node of internalData.nodes) {
    node.fx = undefined
    node.fy = undefined
  }
},
```

Update `ForceGraphHandle` type to include these methods.

- [ ] **Step 4: Add pin state and toggle to explorar page**

```typescript
const [pinnedNodeIds, setPinnedNodeIds] = useState<Set<string>>(new Set())

const togglePin = useCallback((nodeId: string) => {
  setPinnedNodeIds((prev) => {
    const next = new Set(prev)
    if (next.has(nodeId)) {
      next.delete(nodeId)
      graphRef.current?.unpinNode(nodeId)
    } else {
      next.add(nodeId)
      graphRef.current?.pinNode(nodeId)
    }
    return next
  })
}, [])

const unpinAll = useCallback(() => {
  setPinnedNodeIds(new Set())
  graphRef.current?.unpinAll()
}, [])
```

Pass `pinnedNodeIds={pinnedNodeIds}` to `<ForceGraph>`.

- [ ] **Step 5: Add pin toggle to NodeDetailPanel**

Add `onTogglePin` and `isPinned` props:

```typescript
export interface NodeDetailPanelProps {
  readonly nodeId: string | null
  readonly onClose: () => void
  readonly onNavigate: (nodeId: string) => void
  readonly onExpand?: (nodeId: string) => void
  readonly onTogglePin?: (nodeId: string) => void
  readonly isPinned?: boolean
}
```

In the header section, add pin toggle and expand buttons next to the close button:

```typescript
{nodeId && onTogglePin && (
  <button
    onClick={() => onTogglePin(nodeId)}
    className={`flex-shrink-0 rounded p-1 transition-colors hover:bg-zinc-800 ${
      isPinned ? 'text-yellow-400' : 'text-zinc-400 hover:text-zinc-200'
    }`}
    aria-label={isPinned ? 'Desfijar nodo' : 'Fijar nodo'}
    title={isPinned ? 'Desfijar' : 'Fijar'}
  >
    <svg className="h-4 w-4" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12V4h1a1 1 0 100-2H7a1 1 0 000 2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z" />
    </svg>
  </button>
)}
{nodeId && onExpand && (
  <button
    onClick={() => onExpand(nodeId)}
    className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
    aria-label="Expandir vecindario"
    title="Expandir"
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  </button>
)}
```

- [ ] **Step 6: Wire pin props in explorar page**

```typescript
<NodeDetailPanel
  nodeId={selectedNodeId}
  onClose={handleClosePanel}
  onNavigate={handleNavigate}
  onExpand={expandNode}
  onTogglePin={togglePin}
  isPinned={selectedNodeId ? pinnedNodeIds.has(selectedNodeId) : false}
/>
```

- [ ] **Step 7: Verify and commit**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Test: select a node, click pin in detail panel, verify yellow dot appears, node stays fixed.

```bash
git add webapp/src/components/graph/ForceGraph.tsx \
  webapp/src/components/graph/NodeDetailPanel.tsx \
  webapp/src/app/explorar/page.tsx
git commit -m "feat: node pinning with detail panel toggle"
```

---

### Task 7: Right-Click Context Menu

**Files:**
- Create: `webapp/src/components/graph/NodeContextMenu.tsx`
- Modify: `webapp/src/components/graph/ForceGraph.tsx`
- Modify: `webapp/src/app/explorar/page.tsx`

- [ ] **Step 1: Create NodeContextMenu component**

```typescript
'use client'

import { useEffect } from 'react'

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
  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      onClose()
    }
    // Delay to avoid closing immediately on the same click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed z-50 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
      style={{ left: x, top: y }}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => {
            action.onClick()
            onClose()
          }}
          disabled={action.disabled}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="h-4 w-4 flex-shrink-0">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add onNodeRightClick prop and canvas event to ForceGraph**

Add new prop to `ForceGraphProps`:

```typescript
readonly onNodeRightClick?: (nodeId: string, screenX: number, screenY: number) => void
```

Add a canvas contextmenu listener in a useEffect:

```typescript
useEffect(() => {
  if (!onNodeRightClick) return
  const container = containerRef.current
  if (!container) return

  const canvas = container.querySelector('canvas')
  if (!canvas) return

  let longPressTimer: ReturnType<typeof setTimeout> | null = null

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    const fg = graphRef.current
    if (!fg) return

    const rect = canvas.getBoundingClientRect()
    const graphCoords = (fg as unknown as { screen2GraphCoords(x: number, y: number): { x: number; y: number } }).screen2GraphCoords(e.clientX - rect.left, e.clientY - rect.top)
    const internalData = (fg as unknown as { graphData(): { nodes: Array<{ id: string; x?: number; y?: number }> } }).graphData()

    // Hit test: find closest node within 10px graph-space
    let closest: { id: string; dist: number } | null = null
    for (const node of internalData.nodes) {
      if (typeof node.x !== 'number' || typeof node.y !== 'number') continue
      const dx = graphCoords.x - node.x
      const dy = graphCoords.y - node.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 15 && (!closest || dist < closest.dist)) {
        closest = { id: node.id as string, dist }
      }
    }

    if (closest) {
      onNodeRightClick(closest.id, e.clientX, e.clientY)
    }
  }

  // Long-press for mobile (500ms)
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    longPressTimer = setTimeout(() => {
      handleContextMenu(new MouseEvent('contextmenu', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      }))
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  canvas.addEventListener('contextmenu', handleContextMenu)
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
  canvas.addEventListener('touchend', handleTouchEnd)
  canvas.addEventListener('touchmove', handleTouchEnd)

  return () => {
    canvas.removeEventListener('contextmenu', handleContextMenu)
    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchend', handleTouchEnd)
    canvas.removeEventListener('touchmove', handleTouchEnd)
    if (longPressTimer) clearTimeout(longPressTimer)
  }
}, [onNodeRightClick])
```

- [ ] **Step 3: Wire context menu in explorar page**

Add context menu state:

```typescript
const [contextMenu, setContextMenu] = useState<{
  nodeId: string
  x: number
  y: number
} | null>(null)

const handleNodeRightClick = useCallback((nodeId: string, x: number, y: number) => {
  setContextMenu({ nodeId, x, y })
  setSelectedNodeId(nodeId)
}, [])

const closeContextMenu = useCallback(() => {
  setContextMenu(null)
}, [])
```

Add to ForceGraph: `onNodeRightClick={handleNodeRightClick}`

Add context menu JSX inside the graph area:

```typescript
{contextMenu && (
  <NodeContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    onClose={closeContextMenu}
    actions={[
      {
        label: pinnedNodeIds.has(contextMenu.nodeId) ? 'Desfijar' : 'Fijar',
        icon: /* pin SVG */,
        onClick: () => togglePin(contextMenu.nodeId),
      },
      {
        label: 'Expandir',
        icon: /* expand SVG */,
        onClick: () => expandNode(contextMenu.nodeId),
      },
      {
        label: 'Colapsar',
        icon: /* collapse SVG */,
        onClick: () => collapseNode(contextMenu.nodeId),
      },
      // Path actions — these reference setPathSource/setPathTarget from Task 9.
      // For now, stub them as no-ops. Task 9 will wire them up.
      {
        label: 'Ruta desde aqui',
        icon: /* path SVG */,
        onClick: () => { /* wired in Task 9 */ },
        disabled: true,
      },
      {
        label: 'Ruta hasta aqui',
        icon: /* path SVG */,
        onClick: () => { /* wired in Task 9 */ },
        disabled: true,
      },
    ]}
  />
)}
```

- [ ] **Step 4: Add collapse logic**

Add the `collapseNode` function. This removes exclusive neighbors:

```typescript
const collapseNode = useCallback((nodeId: string) => {
  // Save to undo stack
  setUndoStack((prev) => [...prev.slice(-9), graphData])

  // Find exclusive neighbors
  const nodeLinks = graphData.links.filter(
    (l) => l.source === nodeId || l.target === nodeId,
  )
  const neighborIds = new Set(
    nodeLinks.map((l) => (l.source === nodeId ? l.target : l.source)),
  )

  // A neighbor is exclusive if its only connections are to the collapsed node
  const exclusiveIds = new Set<string>()
  for (const nId of neighborIds) {
    if (pinnedNodeIds.has(nId)) continue // Don't collapse pinned nodes
    const otherLinks = graphData.links.filter(
      (l) =>
        (l.source === nId || l.target === nId) &&
        l.source !== nodeId &&
        l.target !== nodeId,
    )
    if (otherLinks.length === 0) {
      exclusiveIds.add(nId)
    }
  }

  if (exclusiveIds.size === 0) return

  const newNodes = graphData.nodes.filter((n) => !exclusiveIds.has(n.id))
  const newLinks = graphData.links.filter(
    (l) => !exclusiveIds.has(l.source) && !exclusiveIds.has(l.target),
  )

  setGraphData({ nodes: newNodes, links: newLinks })
}, [graphData, pinnedNodeIds])
```

- [ ] **Step 5: Verify and commit**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Test: right-click a node, verify context menu appears. Test Pin, Expand, Collapse actions.

```bash
git add webapp/src/components/graph/NodeContextMenu.tsx \
  webapp/src/components/graph/ForceGraph.tsx \
  webapp/src/app/explorar/page.tsx
git commit -m "feat: right-click context menu with pin, expand, collapse"
```

---

### Task 8: Path Finding — API Endpoint

**Files:**
- Create: `webapp/src/app/api/graph/path/route.ts`

- [ ] **Step 1: Create the shortest path API endpoint**

```typescript
/**
 * GET /api/graph/path?source={id}&target={id}&maxHops=6&all=false
 *
 * Finds shortest path(s) between two nodes using Neo4j shortestPath().
 *
 * Responses:
 *   - 200: { success: true, data: GraphData, paths: string[][] }
 *   - 400: invalid parameters
 *   - 404: no path found
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'
import neo4j from 'neo4j-driver-lite'

import { getDriver } from '@/lib/neo4j'
import { nodeIdSchema } from '@/lib/graph/validation'
import { transformNode, transformRelationship } from '@/lib/graph/transform'
import type { GraphData, GraphNode, GraphLink } from '@/lib/neo4j/types'

const maxHopsSchema = z.coerce.number().int().min(1).max(6).default(6)

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)

  const sourceParam = url.searchParams.get('source')
  const targetParam = url.searchParams.get('target')
  const allParam = url.searchParams.get('all') === 'true'

  if (!sourceParam || !targetParam) {
    return Response.json(
      { success: false, error: 'Both source and target parameters are required' },
      { status: 400 },
    )
  }

  const sourceResult = nodeIdSchema.safeParse(sourceParam)
  const targetResult = nodeIdSchema.safeParse(targetParam)
  if (!sourceResult.success || !targetResult.success) {
    return Response.json({ success: false, error: 'Invalid node ID format' }, { status: 400 })
  }

  const maxHopsResult = maxHopsSchema.safeParse(url.searchParams.get('maxHops') ?? undefined)
  if (!maxHopsResult.success) {
    return Response.json(
      { success: false, error: 'Invalid maxHops parameter (must be integer 1-6)' },
      { status: 400 },
    )
  }

  const driver = getDriver()
  const session = driver.session({ database: 'neo4j', defaultAccessMode: neo4j.session.READ })

  try {
    const sourceId = sourceResult.data
    const targetId = targetResult.data
    const maxHops = maxHopsResult.data

    // Use APOC-free shortestPath with property-based ID matching
    const cypher = allParam
      ? `
        MATCH (source), (target)
        WHERE (source.id = $sourceId OR source.slug = $sourceId OR source.acta_id = $sourceId)
          AND (target.id = $targetId OR target.slug = $targetId OR target.acta_id = $targetId)
        MATCH path = allShortestPaths((source)-[*..${maxHops}]-(target))
        WITH path LIMIT $pathLimit
        RETURN path
        `
      : `
        MATCH (source), (target)
        WHERE (source.id = $sourceId OR source.slug = $sourceId OR source.acta_id = $sourceId)
          AND (target.id = $targetId OR target.slug = $targetId OR target.acta_id = $targetId)
        MATCH path = shortestPath((source)-[*..${maxHops}]-(target))
        RETURN path
        `

    const result = await session.run(cypher, { sourceId, targetId, pathLimit: neo4j.int(5) }, { timeout: neo4j.int(5000) })

    if (result.records.length === 0) {
      return Response.json(
        { success: false, error: 'No path found within the specified number of hops' },
        { status: 404 },
      )
    }

    // Extract nodes and relationships from paths
    const nodeMap = new Map<string, GraphNode>()
    const linkMap = new Map<string, GraphLink>()
    const paths: string[][] = []

    for (const record of result.records) {
      const path = record.get('path')
      const pathNodeIds: string[] = []

      // Build elementId -> appId lookup for this path
      const elementIdToAppId = new Map<string, string>()

      for (const segment of path.segments) {
        const startNode = transformNode(segment.start)
        const endNode = transformNode(segment.end)

        nodeMap.set(startNode.id, startNode)
        nodeMap.set(endNode.id, endNode)
        elementIdToAppId.set(segment.start.elementId, startNode.id)
        elementIdToAppId.set(segment.end.elementId, endNode.id)

        const rel = segment.relationship
        const relSourceId = elementIdToAppId.get(rel.startNodeElementId) ?? startNode.id
        const relTargetId = elementIdToAppId.get(rel.endNodeElementId) ?? endNode.id
        const link = transformRelationship(rel, relSourceId, relTargetId)
        const linkKey = `${link.source}:${link.target}:${link.type}`
        linkMap.set(linkKey, link)
      }

      // Build ordered path node IDs
      for (const node of path.nodes) {
        const gn = transformNode(node)
        pathNodeIds.push(gn.id)
      }
      paths.push(pathNodeIds)
    }

    const data: GraphData = {
      nodes: [...nodeMap.values()],
      links: [...linkMap.values()],
    }

    return Response.json({
      success: true,
      data,
      paths,
      meta: {
        nodeCount: data.nodes.length,
        linkCount: data.links.length,
        pathCount: paths.length,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message
      if (msg.includes('timed out') || msg.includes('terminated') || msg.includes('TransactionTimedOut')) {
        return Response.json(
          { success: false, error: 'Path query timed out — try fewer hops' },
          { status: 504 },
        )
      }
      if (msg.includes('connect') || msg.includes('ECONNREFUSED') || msg.includes('ServiceUnavailable')) {
        return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
      }
    }
    throw error
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 2: Verify the endpoint compiles**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Test with curl (requires Neo4j running): `curl "http://localhost:3000/api/graph/path?source=<id>&target=<id>"`

- [ ] **Step 3: Commit**

```bash
git add webapp/src/app/api/graph/path/route.ts
git commit -m "feat: add shortest path API endpoint"
```

---

### Task 9: Path Finding — Client-Side BFS + UI

**Files:**
- Create: `webapp/src/lib/graph/algorithms.ts`
- Create: `webapp/src/components/graph/PathFinder.tsx`
- Modify: `webapp/src/components/graph/ForceGraph.tsx`
- Modify: `webapp/src/app/explorar/page.tsx`
- Modify: `webapp/src/lib/graph/index.ts`

- [ ] **Step 1: Create client-side BFS algorithm**

Create `webapp/src/lib/graph/algorithms.ts`:

```typescript
import type { GraphData } from '../neo4j/types'

/**
 * BFS shortest path on in-memory graph.
 * Returns ordered array of node IDs, or null if no path exists.
 */
export function bfsShortestPath(
  graph: GraphData,
  sourceId: string,
  targetId: string,
): string[] | null {
  if (sourceId === targetId) return [sourceId]

  // Build adjacency list
  const adj = new Map<string, string[]>()
  for (const node of graph.nodes) {
    adj.set(node.id, [])
  }
  for (const link of graph.links) {
    adj.get(link.source)?.push(link.target)
    adj.get(link.target)?.push(link.source)
  }

  // BFS
  const visited = new Set<string>([sourceId])
  const parent = new Map<string, string>()
  const queue: string[] = [sourceId]

  while (queue.length > 0) {
    const current = queue.shift()!
    const neighbors = adj.get(current) ?? []

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue
      visited.add(neighbor)
      parent.set(neighbor, current)

      if (neighbor === targetId) {
        // Reconstruct path
        const path: string[] = [targetId]
        let node = targetId
        while (parent.has(node)) {
          node = parent.get(node)!
          path.unshift(node)
        }
        return path
      }

      queue.push(neighbor)
    }
  }

  return null
}

/**
 * Given a path (ordered node IDs), compute the set of link keys
 * (source:target:type) that belong to the path.
 */
export function pathLinkKeys(
  graph: GraphData,
  pathNodeIds: string[],
): Set<string> {
  const keys = new Set<string>()
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const a = pathNodeIds[i]
    const b = pathNodeIds[i + 1]
    // Find the link between a and b (either direction)
    for (const link of graph.links) {
      if (
        (link.source === a && link.target === b) ||
        (link.source === b && link.target === a)
      ) {
        keys.add(`${link.source}:${link.target}:${link.type}`)
        break
      }
    }
  }
  return keys
}
```

- [ ] **Step 2: Add re-export in index.ts**

```typescript
export { bfsShortestPath, pathLinkKeys } from './algorithms'
```

- [ ] **Step 3: Create PathFinder component**

Create `webapp/src/components/graph/PathFinder.tsx` — a slim bar with two search inputs:

```typescript
'use client'

import { useCallback, useState } from 'react'

export interface PathFinderProps {
  readonly onFindPath: (sourceId: string, targetId: string) => void
  readonly onClose: () => void
  readonly initialSourceId?: string | null
  readonly initialTargetId?: string | null
}

export function PathFinder({ onFindPath, onClose, initialSourceId, initialTargetId }: PathFinderProps) {
  // Uses two mini search inputs with the same API as SearchBar but inline
  const [sourceId, setSourceId] = useState(initialSourceId ?? '')
  const [targetId, setTargetId] = useState(initialTargetId ?? '')
  const [sourceLabel, setSourceLabel] = useState('')
  const [targetLabel, setTargetLabel] = useState('')
  const [sourceResults, setSourceResults] = useState<Array<{ id: string; name: string }>>([])
  const [targetResults, setTargetResults] = useState<Array<{ id: string; name: string }>>([])
  const [activeField, setActiveField] = useState<'source' | 'target' | null>(null)

  const searchNodes = useCallback(async (query: string): Promise<Array<{ id: string; name: string }>> => {
    if (query.length < 2) return []
    const params = new URLSearchParams({ q: query, limit: '5' })
    const res = await fetch(`/api/graph/search?${params.toString()}`)
    if (!res.ok) return []
    const json = await res.json()
    if (!json.success || !json.data?.nodes) return []
    return json.data.nodes.map((n: { id: string; properties: { name?: string; title?: string; full_name?: string } }) => ({
      id: n.id,
      name: n.properties.name ?? n.properties.title ?? n.properties.full_name ?? n.id,
    }))
  }, [])

  const handleSourceChange = useCallback(async (value: string) => {
    setSourceLabel(value)
    setSourceId('')
    const results = await searchNodes(value)
    setSourceResults(results)
    setActiveField('source')
  }, [searchNodes])

  const handleTargetChange = useCallback(async (value: string) => {
    setTargetLabel(value)
    setTargetId('')
    const results = await searchNodes(value)
    setTargetResults(results)
    setActiveField('target')
  }, [searchNodes])

  const handleSubmit = useCallback(() => {
    if (sourceId && targetId) {
      onFindPath(sourceId, targetId)
    }
  }, [sourceId, targetId, onFindPath])

  return (
    <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/90 px-4 py-2 backdrop-blur-sm">
      <span className="text-xs font-medium text-zinc-500">Ruta:</span>

      {/* Source input */}
      <div className="relative flex-1">
        <input
          type="text"
          value={sourceLabel}
          onChange={(e) => handleSourceChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
          placeholder="Desde..."
          className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
          autoFocus
        />
        {activeField === 'source' && sourceResults.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded border border-zinc-700 bg-zinc-900 py-1 shadow-lg">
            {sourceResults.map((r) => (
              <li
                key={r.id}
                className="cursor-pointer px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
                onClick={() => {
                  setSourceId(r.id)
                  setSourceLabel(r.name)
                  setSourceResults([])
                  setActiveField(null)
                }}
              >
                {r.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <span className="text-zinc-600">&rarr;</span>

      {/* Target input */}
      <div className="relative flex-1">
        <input
          type="text"
          value={targetLabel}
          onChange={(e) => handleTargetChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Hasta..."
          className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
        />
        {activeField === 'target' && targetResults.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded border border-zinc-700 bg-zinc-900 py-1 shadow-lg">
            {targetResults.map((r) => (
              <li
                key={r.id}
                className="cursor-pointer px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
                onClick={() => {
                  setTargetId(r.id)
                  setTargetLabel(r.name)
                  setTargetResults([])
                  setActiveField(null)
                }}
              >
                {r.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!sourceId || !targetId}
        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none"
      >
        Buscar
      </button>

      <button
        onClick={onClose}
        className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="Cerrar buscador de rutas"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Add path highlight rendering to ForceGraph**

In the `paintNode` callback, add dimming for path highlight mode. After `ctx.globalAlpha = isBronze ? 0.5 : 1.0`:

```typescript
// Path highlight dimming
if (pathHighlight && !pathHighlight.nodeIds.has(fgNode.id) && !isSelected) {
  ctx.globalAlpha = 0.15
}
```

In the `linkColor` callback, add dimming:

```typescript
const linkColorCb = useCallback((link: FGLink) => {
  const baseColor = getLinkColor(link.type)
  if (pathHighlight) {
    const key = `${typeof link.source === 'string' ? link.source : (link.source as { id: string }).id}:${typeof link.target === 'string' ? link.target : (link.target as { id: string }).id}:${link.type}`
    if (!pathHighlight.linkKeys.has(key)) {
      return '#1a1a2e' // very dim
    }
    return '#60a5fa' // bright blue for path
  }
  return baseColor
}, [pathHighlight])
```

- [ ] **Step 5: Wire path finding in explorar page**

Add state and handlers:

```typescript
const [showPathFinder, setShowPathFinder] = useState(false)
const [pathHighlight, setPathHighlight] = useState<{
  nodeIds: Set<string>
  linkKeys: Set<string>
} | null>(null)
const [pathSourceId, setPathSourceId] = useState<string | null>(null)
const [pathTargetId, setPathTargetId] = useState<string | null>(null)

const findPath = useCallback(async (sourceId: string, targetId: string) => {
  // Try client-side BFS first
  const clientPath = bfsShortestPath(graphData, sourceId, targetId)
  if (clientPath) {
    const nodeIds = new Set(clientPath)
    const linkKeys = pathLinkKeys(graphData, clientPath)
    setPathHighlight({ nodeIds, linkKeys })
    return
  }

  // Fall back to API
  setIsLoading(true)
  try {
    const params = new URLSearchParams({ source: sourceId, target: targetId })
    const res = await fetch(`/api/graph/path?${params.toString()}`)
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      // Could show error toast here
      return
    }
    const json = await res.json()
    if (!json.success) return

    // Merge path nodes into current graph
    const merged = mergeGraphData(graphData, json.data)
    setGraphData(merged)

    // Highlight first path
    if (json.paths?.[0]) {
      const nodeIds = new Set(json.paths[0] as string[])
      const linkKeys = pathLinkKeys(merged, json.paths[0] as string[])
      setPathHighlight({ nodeIds, linkKeys })
    }
  } finally {
    setIsLoading(false)
  }
}, [graphData])

// Clear path highlight on click outside
const handleBackgroundClick = useCallback(() => {
  if (pathHighlight) {
    setPathHighlight(null)
  }
}, [pathHighlight])

// Context menu path shortcuts
const setPathSource = useCallback((nodeId: string) => {
  setPathSourceId(nodeId)
  setShowPathFinder(true)
}, [])

const setPathTarget = useCallback((nodeId: string) => {
  setPathTargetId(nodeId)
  setShowPathFinder(true)
}, [])
```

Pass `pathHighlight` to ForceGraph. Add `<PathFinder>` in the JSX below the toolbar (when `showPathFinder` is true).

- [ ] **Step 6: Verify and commit**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Test: Open path finder, search two nodes, click "Buscar". Path should highlight. Click background to dismiss.

```bash
git add webapp/src/lib/graph/algorithms.ts webapp/src/lib/graph/index.ts \
  webapp/src/components/graph/PathFinder.tsx \
  webapp/src/components/graph/ForceGraph.tsx \
  webapp/src/app/explorar/page.tsx \
  webapp/src/app/api/graph/path/route.ts
git commit -m "feat: path finding with client-side BFS and Neo4j fallback"
```

---

### Task 10: Graph Toolbar

**Files:**
- Create: `webapp/src/components/graph/GraphToolbar.tsx`
- Modify: `webapp/src/app/explorar/page.tsx`

- [ ] **Step 1: Create GraphToolbar component**

```typescript
'use client'

export interface GraphToolbarProps {
  readonly onFindPath: () => void
  readonly onClearGraph: () => void
  readonly onSave: () => void
  readonly onLoad: () => void
  readonly onUnpinAll: () => void
  readonly onUndo: () => void
  readonly canUndo: boolean
  readonly hasData: boolean
}

export function GraphToolbar({
  onFindPath,
  onClearGraph,
  onSave,
  onLoad,
  onUnpinAll,
  onUndo,
  canUndo,
  hasData,
}: GraphToolbarProps) {
  if (!hasData) return null

  return (
    <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-950/90 px-4 py-1.5 backdrop-blur-sm">
      <ToolbarButton
        onClick={onFindPath}
        title="Buscar ruta (entre dos nodos)"
        icon={/* route/path icon SVG */}
      />
      <ToolbarButton
        onClick={onClearGraph}
        title="Limpiar grafo"
        icon={/* trash icon SVG */}
      />
      <div className="mx-1 h-4 w-px bg-zinc-800" />
      <ToolbarButton
        onClick={onSave}
        title="Guardar investigacion"
        icon={/* save icon SVG */}
      />
      <ToolbarButton
        onClick={onLoad}
        title="Cargar investigacion"
        icon={/* folder icon SVG */}
      />
      <div className="mx-1 h-4 w-px bg-zinc-800" />
      <ToolbarButton
        onClick={onUnpinAll}
        title="Desfijar todos"
        icon={/* unpin icon SVG */}
      />
      {canUndo && (
        <ToolbarButton
          onClick={onUndo}
          title="Deshacer (Ctrl+Z)"
          icon={/* undo icon SVG */}
        />
      )}
    </div>
  )
}

function ToolbarButton({
  onClick,
  title,
  icon,
}: {
  onClick: () => void
  title: string
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      aria-label={title}
    >
      {icon}
    </button>
  )
}
```

(Each icon will be a small inline SVG — use Heroicons outline style, 16x16.)

- [ ] **Step 2: Integrate toolbar in explorar page**

Add `<GraphToolbar>` between the header and the graph area in the JSX. Wire all callbacks.

- [ ] **Step 3: Verify and commit**

```bash
git add webapp/src/components/graph/GraphToolbar.tsx webapp/src/app/explorar/page.tsx
git commit -m "feat: add graph investigation toolbar"
```

---

### Task 11: Investigation Save/Load (localStorage)

**Files:**
- Create: `webapp/src/lib/graph/investigation.ts`
- Modify: `webapp/src/app/explorar/page.tsx`
- Modify: `webapp/src/lib/graph/index.ts`

- [ ] **Step 1: Create investigation persistence module**

```typescript
const STORAGE_KEY = 'orc-investigations'
const MAX_STORAGE_BYTES = 4 * 1024 * 1024 // 4MB warning threshold

export interface SavedInvestigation {
  readonly name: string
  readonly savedAt: string // ISO date
  readonly nodeIds: readonly string[]
  readonly pinnedPositions: ReadonlyArray<{ id: string; x: number; y: number }>
  readonly zoom?: number
  readonly centerX?: number
  readonly centerY?: number
}

export function listInvestigations(): SavedInvestigation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedInvestigation[]
  } catch {
    return []
  }
}

export function saveInvestigation(investigation: SavedInvestigation): { ok: boolean; warning?: string } {
  const existing = listInvestigations()
  // Replace if same name exists
  const filtered = existing.filter((i) => i.name !== investigation.name)
  filtered.push(investigation)

  const json = JSON.stringify(filtered)
  if (json.length > MAX_STORAGE_BYTES) {
    return { ok: false, warning: 'Almacenamiento casi lleno. Elimina investigaciones antiguas.' }
  }

  try {
    localStorage.setItem(STORAGE_KEY, json)
    return { ok: true }
  } catch {
    return { ok: false, warning: 'No se pudo guardar — almacenamiento lleno.' }
  }
}

export function deleteInvestigation(name: string): void {
  const existing = listInvestigations()
  const filtered = existing.filter((i) => i.name !== name)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
```

- [ ] **Step 2: Add re-export**

```typescript
export { listInvestigations, saveInvestigation, deleteInvestigation } from './investigation'
export type { SavedInvestigation } from './investigation'
```

- [ ] **Step 3: Wire save/load in explorar page**

Add save handler that:
1. Prompts for a name (window.prompt is fine for now)
2. Collects node IDs, pinned positions from graphRef internal state
3. Calls `saveInvestigation()`

Add load handler that:
1. Shows list from `listInvestigations()`
2. On selection, fetches node data from API for each saved node ID (batched)
3. Restores positions for pinned nodes

- [ ] **Step 4: Verify and commit**

```bash
git add webapp/src/lib/graph/investigation.ts webapp/src/lib/graph/index.ts \
  webapp/src/app/explorar/page.tsx
git commit -m "feat: save/load investigations to localStorage"
```

---

### Task 12: Final Integration & Polish

**Files:**
- Modify: `webapp/src/app/explorar/page.tsx`

- [ ] **Step 1: Update keyboard nav hint text**

Update the bottom-left hint to include new shortcuts:

```typescript
<span className="text-zinc-400">Tab</span> navegar
{' · '}
<span className="text-zinc-400">Enter</span> expandir
{' · '}
<span className="text-zinc-400">Ctrl+Z</span> deshacer
{' · '}
<span className="text-zinc-400">Esc</span> cerrar
```

- [ ] **Step 2: Initial zoomToFit on first data load**

Add a ref to track if this is the first load:

```typescript
const isFirstLoad = useRef(true)

// In expandNode, after setGraphData:
if (isFirstLoad.current) {
  isFirstLoad.current = false
  setTimeout(() => graphRef.current?.zoomToFit(), 300)
}
```

- [ ] **Step 3: Verify full flow end-to-end**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run dev`

Test checklist:
1. Search for a node — adds to graph (not replaces)
2. Click a node — selects, shows detail panel (does not replace graph)
3. Right-click → Expand — merges neighbors into graph
4. Right-click → Collapse — removes exclusive neighbors
5. Right-click → Pin — yellow dot, node stays fixed
6. Ctrl+Z — undoes last expand/collapse
7. Toolbar: Find Path — opens path finder bar
8. Path finder: search two nodes, find path, highlights appear
9. Click background — clears path highlight
10. Toolbar: Save — prompts name, saves to localStorage
11. Toolbar: Load — lists saved, restores graph
12. Toolbar: Clear — resets everything
13. Smart labels: zoom out = no labels, zoom in = labels by importance
14. Hover: tooltip with name + type at any zoom
15. Keyboard: Tab cycles nodes, Enter expands, Esc clears

- [ ] **Step 4: Commit**

```bash
git add webapp/src/app/explorar/page.tsx
git commit -m "feat: final integration polish for graph interactivity"
```
