import { NextRequest } from 'next/server'

import {
  listByPipelineState,
  listByStage,
  captureSnapshot,
  deleteSnapshot,
} from '@/lib/engine/snapshots'
import { getPipelineState } from '@/lib/engine/pipeline'

function dbError(message: string): boolean {
  return (
    message.includes('connect') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ServiceUnavailable')
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  await params

  const searchParams = request.nextUrl.searchParams
  const pipelineStateId = searchParams.get('pipeline_state_id')
  const stageId = searchParams.get('stage_id')

  if (!pipelineStateId && !stageId) {
    return Response.json(
      { success: false, error: 'Missing required query param: pipeline_state_id or stage_id' },
      { status: 400 },
    )
  }

  try {
    const snapshots = pipelineStateId
      ? await listByPipelineState(pipelineStateId)
      : await listByStage(stageId!)

    return Response.json({ success: true, data: { snapshots } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (dbError(message)) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to list snapshots' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  await params

  let body: { pipeline_state_id?: string; label?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { pipeline_state_id, label } = body

  if (!pipeline_state_id) {
    return Response.json(
      { success: false, error: 'Missing required field: pipeline_state_id' },
      { status: 400 },
    )
  }

  try {
    const state = await getPipelineState(pipeline_state_id)

    if (!state) {
      return Response.json(
        { success: false, error: 'Pipeline state not found' },
        { status: 404 },
      )
    }

    const snapshot = await captureSnapshot(
      pipeline_state_id,
      state.current_stage_id,
      label || 'manual',
      state.caso_slug,
    )

    return Response.json(
      { success: true, data: { snapshot } },
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (dbError(message)) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to create snapshot' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  await params

  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return Response.json(
      { success: false, error: 'Missing required query param: id' },
      { status: 400 },
    )
  }

  try {
    await deleteSnapshot(id)

    return Response.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (dbError(message)) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to delete snapshot' },
      { status: 500 },
    )
  }
}
