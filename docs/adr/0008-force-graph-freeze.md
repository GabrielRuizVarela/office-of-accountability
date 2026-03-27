# ADR-0008: Freeze Graph Nodes After Layout Converges

**Status:** Accepted
**Date:** 2026-03-19
**Context:** The react-force-graph-2d visualization runs a continuous d3-force simulation. On large graphs (1000+ nodes), the constant animation causes high CPU usage and makes the graph hard to read.

## Decision

After the force-directed layout converges (simulation alpha drops below threshold), freeze all nodes by setting `fx`/`fy` (fixed position) to their current `x`/`y` coordinates. Disable further simulation.

## Rationale

- **Performance:** Frozen nodes stop triggering d3-force tick calculations (~60fps of wasted work).
- **Readability:** Users can study the graph without nodes drifting.
- **Interaction:** Users can still drag individual nodes (which updates `fx`/`fy`), zoom, and pan.

## Consequences

- New nodes added after freeze require re-running layout (or manual placement).
- The "convergence" threshold must be tuned per graph density.
- No continuous animation effects (pulsing, flowing edges) are possible after freeze.
