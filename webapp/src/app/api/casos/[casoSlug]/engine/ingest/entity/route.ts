import { NextRequest } from 'next/server'
import { z } from 'zod/v4'

import { readQuery, writeQuery } from '@/lib/neo4j/client'

const bodySchema = z.object({
  label: z.string().min(1),
  properties: z.record(z.string(), z.unknown()),
  source_url: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  proposed_by: z.string().optional(),
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
    // Dedup check: query for existing node with same name and label in same caso_slug
    const name = (body.properties.name as string | undefined) ?? ''
    if (name) {
      const existingResult = await readQuery<{ id: string }>(
        `MATCH (n:\`${body.label}\` {caso_slug: $casoSlug, name: $name}) RETURN n.id AS id LIMIT 1`,
        { casoSlug, name },
        (r) => ({ id: r.get('id') as string }),
      )

      if (existingResult.records.length > 0) {
        return Response.json(
          {
            success: false,
            error: 'Duplicate entity',
            existing_id: existingResult.records[0].id,
          },
          { status: 409 },
        )
      }
    }

    const nodeId = `${casoSlug}:${body.label.toLowerCase()}-${Date.now()}`
    const proposalId = crypto.randomUUID()
    const payloadJson = JSON.stringify({
      label: body.label,
      id: nodeId,
      properties: {
        ...body.properties,
        caso_slug: casoSlug,
        confidence_tier: 'bronze',
        source_url: body.source_url ?? null,
      },
    })

    await writeQuery(
      `CREATE (p:Proposal {
        id: $proposalId,
        investigation_id: $casoSlug,
        stage: 'ingest',
        type: 'create_node',
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
        reasoning: `Bronze-tier entity ingest: ${body.label}${body.source_url ? ` from ${body.source_url}` : ''}`,
        proposedBy: body.proposed_by ?? 'ingest-api',
      },
      (r) => ({ id: r.get('id') as string }),
    )

    return Response.json({
      success: true,
      data: { proposal_id: proposalId, node_id: nodeId },
    })
  } catch (error) {
    console.error('[engine/ingest/entity]', error)
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
      { success: false, error: 'Failed to create entity proposal' },
      { status: 500 },
    )
  }
}
