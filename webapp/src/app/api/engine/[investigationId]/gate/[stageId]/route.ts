import { NextRequest } from 'next/server'

import {
  getPipelineState,
  listByPipeline,
  resumeAfterGate,
  failPipeline,
} from '@/lib/engine/pipeline'
import { appendEntry } from '@/lib/engine/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string; stageId: string }> },
) {
  const { investigationId, stageId } = await params

  try {
    const states = await listByPipeline(investigationId)
    const gatePending = states.find(
      (s) => s.current_stage_id === stageId && s.status === 'paused',
    )

    if (!gatePending) {
      return Response.json(
        { success: true, data: { gate_pending: false, pipeline_state: null } },
      )
    }

    return Response.json({
      success: true,
      data: { gate_pending: true, pipeline_state: gatePending },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to get gate status' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string; stageId: string }> },
) {
  const { stageId } = await params

  let body: { pipeline_state_id?: string; action?: string; reviewed_by?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  if (!body.pipeline_state_id) {
    return Response.json(
      { success: false, error: 'Missing required field: pipeline_state_id' },
      { status: 400 },
    )
  }

  if (body.action !== 'approve' && body.action !== 'reject') {
    return Response.json(
      { success: false, error: 'Missing required field: action (approve | reject)' },
      { status: 400 },
    )
  }

  if (!body.reviewed_by) {
    return Response.json(
      { success: false, error: 'Missing required field: reviewed_by' },
      { status: 400 },
    )
  }

  try {
    const state = await getPipelineState(body.pipeline_state_id)
    if (!state) {
      return Response.json(
        { success: false, error: `PipelineState not found: ${body.pipeline_state_id}` },
        { status: 404 },
      )
    }

    if (state.status !== 'paused') {
      return Response.json(
        { success: false, error: `Pipeline is not at a gate (status: ${state.status})` },
        { status: 409 },
      )
    }

    if (state.current_stage_id !== stageId) {
      return Response.json(
        { success: false, error: `Pipeline is not at stage '${stageId}' (current: ${state.current_stage_id})` },
        { status: 409 },
      )
    }

    if (body.action === 'approve') {
      const updated = await resumeAfterGate(body.pipeline_state_id)

      await appendEntry({
        pipeline_state_id: body.pipeline_state_id,
        stage_id: stageId,
        action: 'gate.review.approved',
        detail: `Gate approved by ${body.reviewed_by}`,
      })

      return Response.json({ success: true, data: updated })
    } else {
      const updated = await failPipeline(
        body.pipeline_state_id,
        `Gate rejected by ${body.reviewed_by}`,
      )

      await appendEntry({
        pipeline_state_id: body.pipeline_state_id,
        stage_id: stageId,
        action: 'gate.review.rejected',
        detail: `Gate rejected by ${body.reviewed_by}`,
      })

      return Response.json({ success: true, data: updated })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to process gate action' },
      { status: 500 },
    )
  }
}
