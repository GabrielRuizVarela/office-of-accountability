/**
 * Engine observability counters — in-memory counters for pipeline runs,
 * LLM calls, and proposals created. Exposed via /engine/metrics endpoint.
 */

// ---------------------------------------------------------------------------
// Counter storage
// ---------------------------------------------------------------------------

const counters: Record<string, number> = {
  pipeline_runs_total: 0,
  pipeline_runs_completed: 0,
  pipeline_runs_failed: 0,
  llm_calls_total: 0,
  proposals_total: 0,
  stages_executed_total: 0,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function incrementCounter(
  name: keyof typeof counters,
  amount = 1,
): void {
  counters[name] = (counters[name] ?? 0) + amount
}

export function getCounters(): Readonly<Record<string, number>> {
  return { ...counters }
}

export function resetCounters(): void {
  for (const key of Object.keys(counters)) {
    counters[key] = 0
  }
}
