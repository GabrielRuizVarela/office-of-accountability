/**
 * Parallel agent dispatch — bridges OrchestratorTasks to StageRunners.
 *
 * Groups tasks by stage kind, creates scoped StageContexts, and runs all
 * via Promise.allSettled for concurrent non-fail-fast execution.
 */

import type {
  OrchestratorTask,
  PipelineState,
  PipelineStage,
  StageKind,
} from './types'
import { stageKinds } from './types'
import { createStageRunner } from './stages'
import type { StageResult } from './stages'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentHandle {
  id: string
  task_id: string
  stage_kind: StageKind
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
}

export interface AgentResult {
  task_id: string
  status: 'completed' | 'failed'
  stage_result?: StageResult
  error?: string
}

export type AgentProgressCallback = (handle: AgentHandle) => void

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map OrchestratorTask.type to a StageKind. Defaults to 'enrich'. */
function resolveStageKind(taskType: string): StageKind {
  const normalized = taskType.toLowerCase()
  if ((stageKinds as readonly string[]).includes(normalized)) {
    return normalized as StageKind
  }
  // Research-oriented task types default to enrich
  return 'enrich'
}

/** Build a minimal PipelineStage for a task so we can construct a StageContext. */
function buildStageForTask(task: OrchestratorTask, kind: StageKind): PipelineStage {
  const now = new Date().toISOString()
  return {
    id: `agent-stage-${task.id}`,
    pipeline_id: `agent-pipeline-${task.investigation_id}`,
    kind,
    order: 0,
    config: { task_type: task.type, target: task.target },
    created_at: now,
    updated_at: now,
  }
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

/**
 * Run OrchestratorTasks in parallel via StageRunners.
 *
 * Each task is mapped to a StageKind, gets a scoped StageContext, and is
 * executed concurrently. Results are collected via Promise.allSettled so a
 * single failure does not abort sibling tasks.
 */
export async function dispatchAgents(
  tasks: OrchestratorTask[],
  pipelineState: PipelineState,
  onProgress?: AgentProgressCallback,
): Promise<AgentResult[]> {
  if (tasks.length === 0) return []

  const handles: AgentHandle[] = tasks.map((task) => ({
    id: `agent-${task.id}`,
    task_id: task.id,
    stage_kind: resolveStageKind(task.type),
    status: 'pending' as const,
    progress: 0,
  }))

  const promises = tasks.map(async (task, i) => {
    const handle = handles[i]
    const kind = handle.stage_kind
    const runner = createStageRunner(kind)

    const stage = buildStageForTask(task, kind)
    const context = {
      pipelineState,
      stage,
      casoSlug: pipelineState.caso_slug,
    }

    handle.status = 'running'
    onProgress?.(handle)

    try {
      const result = await runner.run(context)
      handle.status = 'completed'
      handle.progress = 100
      onProgress?.(handle)
      return { task_id: task.id, status: 'completed' as const, stage_result: result }
    } catch (err) {
      handle.status = 'failed'
      onProgress?.(handle)
      return {
        task_id: task.id,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  })

  const settled = await Promise.allSettled(promises)

  return settled.map((s) => {
    if (s.status === 'fulfilled') return s.value
    // Should not happen since we catch inside, but be safe
    return {
      task_id: 'unknown',
      status: 'failed' as const,
      error: s.reason instanceof Error ? s.reason.message : String(s.reason),
    }
  })
}
