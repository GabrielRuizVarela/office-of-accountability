import crypto from 'node:crypto'

import { NextRequest } from 'next/server'

import { writeQuery, readQuery } from '@/lib/neo4j/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  try {
    const result = await readQuery(
      `MATCH (a:ComplianceAttestation)
       WHERE a.investigation_id = $casoSlug
       RETURN a ORDER BY a.attested_at DESC`,
      { casoSlug },
      (record) => {
        const node = record.get('a')
        return {
          id: node.properties.id as string,
          checklist_item_id: node.properties.checklist_item_id as string,
          investigation_id: node.properties.investigation_id as string,
          framework_id: node.properties.framework_id as string,
          attested_by: node.properties.attested_by as string,
          attested_at: node.properties.attested_at as string,
          notes: (node.properties.notes as string | null) ?? undefined,
        }
      },
    )

    return Response.json({ success: true, data: result.records })
  } catch (error) {
    console.error('[compliance/attestations GET]', error)
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
      { success: false, error: 'Failed to list attestations' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: {
    framework_id?: string
    checklist_item_id?: string
    attested_by?: string
    notes?: string
  }

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  if (!body.framework_id) {
    return Response.json(
      { success: false, error: 'Missing required field: framework_id' },
      { status: 400 },
    )
  }

  if (!body.checklist_item_id) {
    return Response.json(
      { success: false, error: 'Missing required field: checklist_item_id' },
      { status: 400 },
    )
  }

  if (!body.attested_by) {
    return Response.json(
      { success: false, error: 'Missing required field: attested_by' },
      { status: 400 },
    )
  }

  try {
    // Verify framework exists
    const fwCheck = await readQuery(
      `MATCH (f:ComplianceFramework {id: $frameworkId}) RETURN f.id AS id`,
      { frameworkId: body.framework_id },
      (record) => record.get('id') as string,
    )

    if (fwCheck.records.length === 0) {
      return Response.json(
        { success: false, error: `Framework not found: ${body.framework_id}` },
        { status: 404 },
      )
    }

    // Verify checklist item exists for this framework
    const ciCheck = await readQuery(
      `MATCH (f:ComplianceFramework {id: $frameworkId})-[:HAS_CHECKLIST_ITEM]->(ci:ChecklistItem {code: $code})
       RETURN ci.code AS code`,
      { frameworkId: body.framework_id, code: body.checklist_item_id },
      (record) => record.get('code') as string,
    )

    if (ciCheck.records.length === 0) {
      return Response.json(
        { success: false, error: `Checklist item not found: ${body.checklist_item_id} in framework ${body.framework_id}` },
        { status: 404 },
      )
    }

    const id = crypto.randomUUID()
    const attestedAt = new Date().toISOString()

    await writeQuery(
      `MERGE (a:ComplianceAttestation {
         framework_id: $frameworkId,
         investigation_id: $investigationId,
         checklist_item_id: $checklistItemId
       })
       ON CREATE SET a.id = $id,
                     a.attested_by = $attestedBy,
                     a.attested_at = $attestedAt,
                     a.notes = $notes
       ON MATCH SET  a.attested_by = $attestedBy,
                     a.attested_at = $attestedAt,
                     a.notes = $notes
       RETURN a.id AS id`,
      {
        id,
        frameworkId: body.framework_id,
        investigationId: casoSlug,
        checklistItemId: body.checklist_item_id,
        attestedBy: body.attested_by,
        attestedAt,
        notes: body.notes ?? null,
      },
      (record) => record.get('id') as string,
    )

    return Response.json(
      {
        success: true,
        data: {
          id,
          framework_id: body.framework_id,
          investigation_id: casoSlug,
          checklist_item_id: body.checklist_item_id,
          attested_by: body.attested_by,
          attested_at: attestedAt,
          notes: body.notes,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[compliance/attestations POST]', error)
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
      { success: false, error: 'Failed to create attestation' },
      { status: 500 },
    )
  }
}
