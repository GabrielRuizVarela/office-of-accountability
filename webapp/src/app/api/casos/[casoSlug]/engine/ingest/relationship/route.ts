import { NextRequest } from 'next/server'
import { z } from 'zod/v4'

import { readQuery, writeQuery } from '@/lib/neo4j/client'

const bodySchema = z.object({
  from_id: z.string().min(1),
  to_id: z.string().min(1),
  type: z.string().min(1),
  properties: z.record(z.string(), z.unknown()).optional(),
  proposed_by: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    const raw = await request.json()
    body = bodySchema.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json(
      { success: false, error: `Invalid request body: ${message}` },
      { status: 400 },
    )
  }

  try {
    // Validate from node exists with matching caso_slug
    const fromResult = await readQuery<{ id: string }>(
      `MATCH (n {id: $id, caso_slug: $casoSlug}) RETURN n.id AS id LIMIT 1`,
      { id: body.from_id, casoSlug },
      (r) => ({ id: r.get('id') as string }),
    )

    if (fromResult.records.length === 0) {
      return Response.json(
        { success: false, error: `Source node not found: ${body.from_id}` },
        { status: 404 },
      )
    }

    // Validate to node exists with matching caso_slug
    const toResult = await readQuery<{ id: string }>(
      `MATCH (n {id: $id, caso_slug: $casoSlug}) RETURN n.id AS id LIMIT 1`,
      { id: body.to_id, casoSlug },
      (r) => ({ id: r.get('id') as string }),
    )

    if (toResult.records.length === 0) {
      return Response.json(
        { success: false, error: `Target node not found: ${body.to_id}` },
        { status: 404 },
      )
    }

    const proposalId = crypto.randomUUID()
    const payloadJson = JSON.stringify({
      from_id: body.from_id,
      to_id: body.to_id,
      type: body.type,
      properties: body.properties ?? {},
    })

    await writeQuery(
      `CREATE (p:Proposal {
        id: $proposalId,
        investigation_id: $casoSlug,
        stage: 'ingest',
        type: 'create_relationship',
        payload_json: $payloadJson,
        confidence: $confidence,
        reasoning: $reasoning,
        proposed_by: $proposedBy,
        status: 'pending',
        created_at: datetime()
      }) RETURN p.id AS id`,
      {
        proposalId,
        casoSlug,
        payloadJson,
        confidence: body.confidence,
        reasoning: `Bronze-tier relationship ingest: ${body.from_id} -[${body.type}]-> ${body.to_id}`,
        proposedBy: body.proposed_by ?? 'ingest-api',
      },
      (r) => ({ id: r.get('id') as string }),
    )

    return Response.json({
      success: true,
      data: { proposal_id: proposalId },
    })
  } catch (error) {
    console.error('[engine/ingest/relationship]', error)
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
      { success: false, error: 'Failed to create relationship proposal' },
      { status: 500 },
    )
  }
}
