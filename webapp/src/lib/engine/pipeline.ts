/**
 * Pipeline runner — M10.
 *
 * PipelineState CRUD + orchestrator functions for state transitions.
 * No stage execution logic — only manages: start → [advance/gate/resume] → complete/fail.
 */

import crypto from 'node:crypto'
import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery } from '../neo4j/client'
import {
  pipelineStateSchema,
  type PipelineState,
  type PipelineStatus,
} from './types'
import { getPipelineConfigById, getPipelineStageById, getGateById } from './config'
import { incrementCounter } from './metrics'
import { appendEntry } from './audit'
import { captureSnapshot } from './snapshots'
import { runComplianceGate } from '../compliance/pipeline'
import type { CompliancePhase } from '../compliance/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nodeProps(record: Neo4jRecord): Record<string, unknown> {
  const node = record.get('n')
  const raw = node.properties as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : v
  }
  return out
}

function nowISO(): string {
  return new Date().toISOString()
}

function parsePipelineState(raw: unknown): PipelineState {
  return pipelineStateSchema.parse(raw)
}

// ---------------------------------------------------------------------------
// createPipelineState
// ---------------------------------------------------------------------------

export async function createPipelineState(input: {
  pipeline_id: string
  caso_slug: string
}): Promise<PipelineState> {
  const now = nowISO()
  const props = {
    id: crypto.randomUUID(),
    pipeline_id: input.pipeline_id,
    caso_slug: input.caso_slug,
    status: 'idle' as const,
    created_at: now,
    updated_at: now,
  }

  const result = await writeQuery<PipelineState>(
    `CREATE (n:PipelineState $props) RETURN n`,
    { props },
    (r) => parsePipelineState(nodeProps(r)),
  )
  return result.records[0]
}

// ---------------------------------------------------------------------------
// getPipelineState
// ---------------------------------------------------------------------------

export async function getPipelineState(id: string): Promise<PipelineState | null> {
  const result = await readQuery<PipelineState>(
    `MATCH (n:PipelineState {id: $id}) RETURN n`,
    { id },
    (r) => parsePipelineState(nodeProps(r)),
  )
  return result.records[0] ?? null
}

// ---------------------------------------------------------------------------
// updatePipelineState
// ---------------------------------------------------------------------------

export async function updatePipelineState(
  id: string,
  fields: Partial<Pick<PipelineState, 'status' | 'current_stage_id' | 'started_at' | 'completed_at' | 'error'>>,
): Promise<PipelineState | null> {
  const clean: Record<string, unknown> = { updated_at: nowISO() }
  for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
    if (v !== undefined) clean[k] = v
  }

  const result = await writeQuery<PipelineState>(
    `MATCH (n:PipelineState {id: $id}) SET n += $fields RETURN n`,
    { id, fields: clean },
    (r) => parsePipelineState(nodeProps(r)),
  )
  return result.records[0] ?? null
}

// ---------------------------------------------------------------------------
// listByPipeline
// ---------------------------------------------------------------------------

export async function listByPipeline(
  pipelineId: string,
  limit = 50,
): Promise<PipelineState[]> {
  const result = await readQuery<PipelineState>(
    `MATCH (n:PipelineState {pipeline_id: $pipelineId})
     RETURN n ORDER BY n.created_at DESC LIMIT $limit`,
    { pipelineId, limit: neo4j.int(limit) },
    (r) => parsePipelineState(nodeProps(r)),
  )
  return result.records as unknown as PipelineState[]
}

// ---------------------------------------------------------------------------
// listByCasoSlug
// ---------------------------------------------------------------------------

export async function listByCasoSlug(
  casoSlug: string,
  limit = 50,
): Promise<PipelineState[]> {
  const result = await readQuery<PipelineState>(
    `MATCH (n:PipelineState {caso_slug: $casoSlug})
     RETURN n ORDER BY n.created_at DESC LIMIT $limit`,
    { casoSlug, limit: neo4j.int(limit) },
    (r) => parsePipelineState(nodeProps(r)),
  )
  return result.records as unknown as PipelineState[]
}

// ---------------------------------------------------------------------------
// startPipeline
// ---------------------------------------------------------------------------

export async function startPipeline(pipelineStateId: string): Promise<PipelineState> {
  const state = await getPipelineState(pipelineStateId)
  if (!state) throw new Error(`PipelineState not found: ${pipelineStateId}`)
  if (state.status !== 'idle') {
    throw new Error(`Cannot start pipeline in status '${state.status}' (expected 'idle')`)
  }

  const config = await getPipelineConfigById(state.pipeline_id)
  if (!config) throw new Error(`PipelineConfig not found: ${state.pipeline_id}`)
  if (config.stage_ids.length === 0) {
    throw new Error(`PipelineConfig ${config.id} has no stages`)
  }

  const firstStageId = config.stage_ids[0]
  const now = nowISO()

  const updated = await updatePipelineState(pipelineStateId, {
    status: 'running',
    current_stage_id: firstStageId,
    started_at: now,
  })

  incrementCounter('pipeline_runs_total')

  await appendEntry({
    pipeline_state_id: pipelineStateId,
    stage_id: firstStageId,
    action: 'pipeline.started',
    detail: `Pipeline '${config.name}' started`,
  })

  return updated!
}

// ---------------------------------------------------------------------------
// advanceStage
// ---------------------------------------------------------------------------

export async function advanceStage(pipelineStateId: string): Promise<PipelineState> {
  const state = await getPipelineState(pipelineStateId)
  if (!state) throw new Error(`PipelineState not found: ${pipelineStateId}`)
  if (state.status !== 'running') {
    throw new Error(`Cannot advance pipeline in status '${state.status}' (expected 'running')`)
  }

  const config = await getPipelineConfigById(state.pipeline_id)
  if (!config) throw new Error(`PipelineConfig not found: ${state.pipeline_id}`)

  const currentIndex = config.stage_ids.indexOf(state.current_stage_id!)
  if (currentIndex === -1) {
    throw new Error(`Current stage '${state.current_stage_id}' not found in pipeline stage_ids`)
  }

  // Check for gate on current stage
  const currentStage = await getPipelineStageById(state.current_stage_id!)
  if (currentStage?.gate_id) {
    const gate = await getGateById(currentStage.gate_id)
    if (gate?.required) {
      // Capture snapshot before pausing at gate
      await captureSnapshot(
        pipelineStateId,
        currentStage.id,
        `Gate: ${currentStage.kind}`,
        state.caso_slug,
      )

      const updated = await updatePipelineState(pipelineStateId, {
        status: 'paused',
      })

      await appendEntry({
        pipeline_state_id: pipelineStateId,
        stage_id: currentStage.id,
        action: 'gate.reached',
        detail: `Gate reached at stage '${currentStage.kind}'`,
      })

      return updated!
    }
  }

  // Compliance gate — evaluate framework rules for the current stage phase
  const stagePhase = (currentStage?.kind ?? 'any') as CompliancePhase
  const complianceResult = await runComplianceGate(state.caso_slug, stagePhase)

  if (!complianceResult.passed) {
    // Compliance gate blocked — pause pipeline
    await captureSnapshot(
      pipelineStateId,
      currentStage?.id ?? state.current_stage_id!,
      `Compliance gate: ${stagePhase}`,
      state.caso_slug,
    )

    const updated = await updatePipelineState(pipelineStateId, {
      status: 'paused',
    })

    await appendEntry({
      pipeline_state_id: pipelineStateId,
      stage_id: currentStage?.id ?? state.current_stage_id,
      action: 'compliance.gate_blocked',
      detail: complianceResult.summary,
    })

    return updated!
  }

  // Log compliance pass if evaluations were run
  if (complianceResult.reports.length > 0) {
    await appendEntry({
      pipeline_state_id: pipelineStateId,
      stage_id: currentStage?.id ?? state.current_stage_id,
      action: 'compliance.gate_passed',
      detail: complianceResult.summary,
    })
  }

  // No gate or gate not required — advance to next stage or complete
  const nextIndex = currentIndex + 1
  if (nextIndex >= config.stage_ids.length) {
    // No more stages — complete
    const updated = await updatePipelineState(pipelineStateId, {
      status: 'completed',
      completed_at: nowISO(),
    })

    incrementCounter('pipeline_runs_completed')

    await appendEntry({
      pipeline_state_id: pipelineStateId,
      action: 'pipeline.completed',
      detail: 'Pipeline completed all stages',
    })

    return updated!
  }

  incrementCounter('stages_executed_total')

  // Advance to next stage
  const nextStageId = config.stage_ids[nextIndex]
  const nextStage = await getPipelineStageById(nextStageId)

  const updated = await updatePipelineState(pipelineStateId, {
    current_stage_id: nextStageId,
  })

  await appendEntry({
    pipeline_state_id: pipelineStateId,
    stage_id: nextStageId,
    action: 'stage.advanced',
    detail: `Advanced from '${currentStage?.kind ?? state.current_stage_id}' to '${nextStage?.kind ?? nextStageId}'`,
  })

  return updated!
}

// ---------------------------------------------------------------------------
// resumeAfterGate
// ---------------------------------------------------------------------------

export async function resumeAfterGate(pipelineStateId: string): Promise<PipelineState> {
  const state = await getPipelineState(pipelineStateId)
  if (!state) throw new Error(`PipelineState not found: ${pipelineStateId}`)
  if (state.status !== 'paused') {
    throw new Error(`Cannot resume pipeline in status '${state.status}' (expected 'paused')`)
  }

  const config = await getPipelineConfigById(state.pipeline_id)
  if (!config) throw new Error(`PipelineConfig not found: ${state.pipeline_id}`)

  const currentIndex = config.stage_ids.indexOf(state.current_stage_id!)
  if (currentIndex === -1) {
    throw new Error(`Current stage '${state.current_stage_id}' not found in pipeline stage_ids`)
  }

  const currentStage = await getPipelineStageById(state.current_stage_id!)

  const nextIndex = currentIndex + 1
  if (nextIndex >= config.stage_ids.length) {
    // No more stages — complete
    const updated = await updatePipelineState(pipelineStateId, {
      status: 'completed',
      completed_at: nowISO(),
    })

    incrementCounter('pipeline_runs_completed')

    await appendEntry({
      pipeline_state_id: pipelineStateId,
      action: 'pipeline.completed',
      detail: 'Pipeline completed all stages',
    })

    return updated!
  }

  incrementCounter('stages_executed_total')

  // Advance to next stage
  const nextStageId = config.stage_ids[nextIndex]
  const nextStage = await getPipelineStageById(nextStageId)

  const updated = await updatePipelineState(pipelineStateId, {
    status: 'running',
    current_stage_id: nextStageId,
  })

  await appendEntry({
    pipeline_state_id: pipelineStateId,
    stage_id: nextStageId,
    action: 'gate.approved',
    detail: `Gate approved, advanced from '${currentStage?.kind ?? state.current_stage_id}' to '${nextStage?.kind ?? nextStageId}'`,
  })

  return updated!
}

// ---------------------------------------------------------------------------
// failPipeline
// ---------------------------------------------------------------------------

export async function failPipeline(
  pipelineStateId: string,
  error: string,
): Promise<PipelineState> {
  const state = await getPipelineState(pipelineStateId)
  if (!state) throw new Error(`PipelineState not found: ${pipelineStateId}`)
  if (state.status !== 'running' && state.status !== 'paused') {
    throw new Error(`Cannot fail pipeline in status '${state.status}' (expected 'running' or 'paused')`)
  }

  const updated = await updatePipelineState(pipelineStateId, {
    status: 'failed',
    error,
    completed_at: nowISO(),
  })

  incrementCounter('pipeline_runs_failed')

  await appendEntry({
    pipeline_state_id: pipelineStateId,
    stage_id: state.current_stage_id,
    action: 'pipeline.failed',
    detail: error,
  })

  return updated!
}
