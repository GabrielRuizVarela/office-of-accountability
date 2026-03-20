# Graph Interactivity & Usefulness Improvements

**Date:** 2026-03-19
**Status:** Design approved
**Scope:** Incremental upgrade to existing react-force-graph-2d graph explorer

## Problem

The current graph explorer (`/explorar`, `/caso/[slug]/grafo`) has usability issues that limit its value as an investigation tool:

1. **Click resets the graph** — clicking a node replaces the entire graph with that node's neighborhood, losing all context built up during exploration.
2. **No path finding** — no way to answer "how is X connected to Y?"
3. **Too much text** — labels are all-or-nothing at zoom > 1.5x, cluttering the view at scale.
4. **No persistence** — exploration state is lost on every navigation action; no way to build up and save an investigation.

## Prerequisites

Before implementing features, these existing issues must be resolved:

1. **Extract shared constants.** `LABEL_COLORS` is duplicated across ForceGraph.tsx, NodeDetailPanel.tsx, SearchBar.tsx, and the grafo page's `LABEL_COLORS_MAP`. Extract into `webapp/src/lib/graph/constants.ts`.
2. **Fix `mergeGraphData()` link deduplication.** The current implementation deduplicates nodes but not links — repeated expansions accumulate duplicate edges. Add link dedup by source+target+type composite key.
3. **Remove auto-zoomToFit on data change.** ForceGraph.tsx calls `zoomToFit` whenever node count changes. With expand-in-place, every expansion would reset the user's viewport. Only auto-fit on initial load or "Clear Graph."
4. **Scope to `/explorar` page only.** The `/caso/[slug]/grafo` page has a divergent architecture (inline detail panel, different click model, separate color map). Unifying it is out of scope — these features target `/explorar` only. The grafo page can be migrated in a follow-up.

## Design

### 1. Expand-in-Place

**Current:** Node click in `/explorar/page.tsx` calls `loadNode()` which calls `/api/graph/node/[id]` and replaces entire graph state.

**New:** Single click selects (shows detail panel). Expand via right-click → "Expand" or toolbar button on detail panel.

- **No double-click.** `react-force-graph-2d` has no `onNodeDoubleClick` prop. A synthetic timer adds 300ms delay to all clicks, which feels sluggish. Instead, expand is triggered via context menu or detail panel button.
- Expansion calls the existing `/api/graph/expand/[id]` endpoint (depth 1, limit 50).
- New nodes are merged via `mergeGraphData()` (after link dedup fix). Existing nodes preserve positions by copying `x`, `y`, `vx`, `vy` from the ForceGraph ref's internal state before setting new data.
- New nodes get initial `x`/`y` set to the expanded node's position. Force simulation alpha is reheated gently (0.3) so existing pinned/positioned nodes stay mostly stable while new nodes settle.
- **Collapse:** Right-click → "Collapse" removes exclusive neighbors. Algorithm: BFS reachability check — a neighbor is "exclusive" if removing the collapsed node makes it unreachable from any other node in the graph. Pinned nodes are protected from collapse (never removed).
- **Undo stack:** Last 10 expand/collapse actions, stored as diffs (added/removed node IDs + their data) not full graph snapshots. Ctrl+Z to undo. A small "↩ Undo" chip appears after actions, fades after 5s. Pin/unpin and path highlights are not undoable.
- **Clear graph:** Toolbar button resets to empty graph, resets zoom to default, restores default label density. Clears undo stack.

**Files affected:**
- `webapp/src/components/graph/ForceGraph.tsx` — remove replace-on-click, add merge logic, undo stack, position preservation
- `webapp/src/app/explorar/page.tsx` — change `handleNodeClick` from `loadNode` (replace) to select-only, add expand callback
- `webapp/src/lib/graph/transform.ts` — position-preserving merge variant, link deduplication
- `webapp/src/hooks/useGraphKeyboardNav.ts` — change Enter key from replace to expand-in-place

### 2. Smart Label Density

**Current:** Labels appear for all nodes when zoom > 1.5x. Bronze nodes at 50% opacity.

**New:** Labels appear based on node importance (degree centrality within the current graph) and zoom level.

| Zoom Level | Label Behavior |
|-----------|---------------|
| < 1x | No labels. Nodes are colored dots. High-degree nodes (5+ connections) get larger radius. |
| 1x – 2x | Labels on "important" nodes only — top 20% by connection count in current graph. |
| 2x+ | All labels visible. Selected/pinned nodes get bold text. |
| Hover (any zoom) | Always shows label + type badge as tooltip near cursor. |

- Node radius scales with degree — hubs are visually larger without needing text.
- **Hysteresis:** Labels appear at the threshold but disappear 0.2x below it (e.g., important labels appear at 1.0x, disappear at 0.8x) to prevent flicker during zoom.
- **Degree threshold is memoized** — computed once on graph data change via `useMemo`, not inside the per-node `paintNode` callback. Passed to the paint function via closure.
- A reset button restores default label behavior (part of "Clear Graph").

**Files affected:**
- `webapp/src/components/graph/ForceGraph.tsx` — custom `nodeCanvasObject` painting logic, memoized degree calculation

### 3. Path Finding

**New feature:** Find how two entities are connected.

- **UI:** "Find Path" toolbar button opens a slim bar below the toolbar with two search fields (reusing existing `SearchBar` typeahead) and a "Go" button. Escape dismisses.
- **API:** New `GET /api/graph/path?source={id}&target={id}&maxHops=6` endpoint.
  - Uses Cypher `shortestPath()` with max depth 6.
  - Returns `GraphData` (nodes and links along the path).
  - Optional `all=true` parameter uses `allShortestPaths()`, returns up to 5 paths. Response includes a `paths` array of node ID sequences alongside the flat `GraphData`, so the client can highlight individual paths.
- **Rendering:** Path nodes/edges get a bright accent color. Non-path elements dim to ~20% opacity.
- **Client-side shortcut:** If both nodes are already in the current graph, highlight the path client-side (BFS) without an API call.
- Path nodes are automatically added to the current graph if not already present.
- Clicking outside the highlighted path dismisses the highlight and restores normal opacity.

**Files affected:**
- New: `webapp/src/app/api/graph/path/route.ts` — shortest path API endpoint
- New: `webapp/src/components/graph/PathFinder.tsx` — path input UI component
- `webapp/src/components/graph/ForceGraph.tsx` — path highlight rendering state
- `webapp/src/lib/graph/algorithms.ts` — new file, client-side BFS for in-graph paths

### 4. Node Pinning

- **Pin a node:** Right-click → "Pin" or click pin icon in the detail panel.
- Pinned nodes display a small pin indicator above the node.
- Pinned nodes are locked in position (`fx`/`fy` in force simulation). Drag to reposition manually.
- **Unpin:** Right-click → "Unpin" or toggle in detail panel.
- **Unpin All:** Toolbar button.

**Files affected:**
- `webapp/src/components/graph/ForceGraph.tsx` — pin state management, `fx`/`fy` assignment, pin indicator rendering
- `webapp/src/components/graph/NodeDetailPanel.tsx` — add pin toggle button

### 5. Investigation Persistence

**Phase 1 — Session state (React state):**
All exploration state (expanded nodes, pins, positions, paths) lives in component state. Lost on tab close.

**Phase 2 — localStorage:**
- **Save:** "Save Investigation" toolbar button → name prompt → saves to localStorage.
- **Stored data:** Compact JSON containing node IDs, pin positions (x/y), zoom/pan state, active path highlights. Not full node properties.
- **Load:** "Load Investigation" dropdown lists saved investigations. Loading fetches fresh node data from API using saved IDs, then restores positions.
- **Delete:** Each saved investigation has a delete option.

**Phase 3 (future) — Database-backed sharing:** Out of scope for this design. Will require a new `Investigation` entity in Neo4j and API endpoints for CRUD.

**Files affected:**
- New: `webapp/src/lib/graph/investigation.ts` — serialization/deserialization, localStorage helpers
- New: `webapp/src/components/graph/InvestigationToolbar.tsx` — Save/Load/Clear buttons
- `webapp/src/components/graph/ForceGraph.tsx` — expose state for serialization

### 6. UI Layout & Controls

**Toolbar:** New row below the search bar with icon buttons + tooltips:
`[Find Path]` `[Clear Graph]` `[Save]` `[Load ▾]` `[Unpin All]`

**Right-click context menu on nodes:**
- Pin / Unpin
- Expand
- Collapse
- Find Path From Here (pre-fills source in PathFinder bar)
- Find Path To Here (pre-fills target in PathFinder bar)

Implementation: Intercept native `contextmenu` event on the canvas element via ref, convert screen coords to graph coords with `screen2GraphCoords`, hit-test against nodes by distance. No `onNodeRightClick` exists in react-force-graph-2d.

**Long-press on mobile:** 500ms long-press triggers the same context menu. No other mobile-specific changes in this iteration.

**Detail panel:** Existing layout unchanged. Adds a pin toggle button and an "Expand" button to the panel header.

**Files affected:**
- New: `webapp/src/components/graph/GraphToolbar.tsx` — toolbar component
- New: `webapp/src/components/graph/NodeContextMenu.tsx` — right-click menu (positioned absolutely near click point)
- `webapp/src/components/graph/NodeDetailPanel.tsx` — add pin toggle + expand button
- `webapp/src/app/explorar/page.tsx` — integrate toolbar, wire up context menu and expand callbacks

## Non-Goals

- Cytoscape.js migration — not needed for these features
- Database-backed investigation sharing (Phase 3, future)
- Advanced graph algorithms (clustering, betweenness centrality) — future enhancement
- Changes to data ingestion or Neo4j schema

## Technical Notes

- All Neo4j queries must use parameterized Cypher (per CLAUDE.md)
- LIMIT clauses must use `neo4j.int(n)` (per CLAUDE.md)
- Path queries should have a 5s timeout (shorter than 15s general timeout) — waiting 15s for a failed path is poor UX. Show "no path found within 6 hops" on timeout.
- `shortestPath()` max depth of 6 prevents expensive traversals
- Client-side BFS only runs on the in-memory graph (not full database)
- localStorage has ~5MB limit per origin. Save investigations store only node IDs + coordinates (compact). Show a warning if approaching 4MB.
