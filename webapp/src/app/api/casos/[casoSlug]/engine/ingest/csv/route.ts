import { NextRequest } from 'next/server'
import { z } from 'zod/v4'

import { readQuery, writeQuery } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

const MAX_CSV_BYTES = 500 * 1024 // 500KB
const MAX_ROWS = 500

const bodySchema = z.object({
  csv_content: z.string().max(MAX_CSV_BYTES),
  column_mapping: z.record(z.string(), z.string()),
  label: z.string().min(1),
  proposed_by: z.string().optional(),
  id_column: z.string().optional(),
})

/**
 * Parse a CSV row handling quoted fields (strips surrounding quotes).
 */
function parseCSVRow(row: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

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
    // Parse CSV
    const lines = body.csv_content.split('\n').filter((l) => l.trim().length > 0)
    if (lines.length < 2) {
      return Response.json(
        { success: false, error: 'CSV must have at least a header row and one data row' },
        { status: 400 },
      )
    }

    const headers = parseCSVRow(lines[0])

    // Validate column_mapping references valid CSV columns
    const headerSet = new Set(headers)
    for (const csvCol of Object.keys(body.column_mapping)) {
      if (!headerSet.has(csvCol)) {
        return Response.json(
          { success: false, error: `column_mapping references unknown CSV column: "${csvCol}"` },
          { status: 400 },
        )
      }
    }

    const dataRows = lines.slice(1, MAX_ROWS + 1)
    const totalRows = dataRows.length

    // Build existing name set for dedup
    const existingNames = new Set<string>()
    const existingResult = await readQuery<{ name: string }>(
      `MATCH (n:\`${body.label}\` {caso_slug: $casoSlug}) WHERE n.name IS NOT NULL RETURN n.name AS name LIMIT $limit`,
      { casoSlug, limit: neo4j.int(10_000) },
      (r) => ({ name: r.get('name') as string }),
    )
    for (const rec of existingResult.records) {
      existingNames.add(rec.name)
    }

    let proposalCount = 0
    let skippedDuplicates = 0
    const conflicts: Array<{ row: number; name: string; reason: string }> = []

    for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
      const rawRow = dataRows[rowIdx]
      const fields = parseCSVRow(rawRow)

      // Map CSV columns to neo4j properties
      const properties: Record<string, unknown> = {
        caso_slug: casoSlug,
        confidence_tier: 'bronze',
      }

      for (const [csvCol, neo4jProp] of Object.entries(body.column_mapping)) {
        const colIdx = headers.indexOf(csvCol)
        if (colIdx >= 0 && colIdx < fields.length) {
          properties[neo4jProp] = fields[colIdx]
        }
      }

      // Determine name for dedup
      const name = (properties.name as string | undefined) ?? ''

      if (name && existingNames.has(name)) {
        skippedDuplicates++
        continue
      }

      // Determine node id
      const idColIdx = body.id_column ? headers.indexOf(body.id_column) : -1
      const customId =
        idColIdx >= 0 && idColIdx < fields.length ? fields[idColIdx] : undefined
      const nodeId = customId
        ? `${casoSlug}:${customId}`
        : `${casoSlug}:${body.label.toLowerCase()}-${Date.now()}-${rowIdx}`

      const proposalId = crypto.randomUUID()
      const payloadJson = JSON.stringify({
        label: body.label,
        id: nodeId,
        properties,
      })

      try {
        await writeQuery(
          `CREATE (p:Proposal {
            id: $proposalId,
            investigation_id: $casoSlug,
            stage: 'ingest',
            type: 'create_node',
            payload_json: $payloadJson,
            confidence: 0.5,
            reasoning: $reasoning,
            proposed_by: $proposedBy,
            status: 'pending',
            created_at: datetime()
          }) RETURN p.id AS id`,
          {
            proposalId,
            casoSlug,
            payloadJson,
            reasoning: `Bronze-tier CSV ingest: ${body.label} row ${rowIdx + 1}`,
            proposedBy: body.proposed_by ?? 'csv-ingest-api',
          },
          (r) => ({ id: r.get('id') as string }),
        )
        proposalCount++
        if (name) existingNames.add(name)
      } catch (rowError) {
        const rowMsg = rowError instanceof Error ? rowError.message : String(rowError)
        conflicts.push({ row: rowIdx + 1, name, reason: rowMsg })
      }
    }

    return Response.json({
      success: true,
      data: {
        proposal_count: proposalCount,
        skipped_duplicates: skippedDuplicates,
        conflicts,
        total_rows: totalRows,
      },
    })
  } catch (error) {
    console.error('[engine/ingest/csv]', error)
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
      { success: false, error: 'Failed to process CSV import' },
      { status: 500 },
    )
  }
}
