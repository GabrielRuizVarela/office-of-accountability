/**
 * Transforms SIPRO supplier rows into Neo4j Contractor node parameters.
 *
 * Pure functions -- no side effects, no mutations.
 */

import { createHash } from 'node:crypto'

import type { SiproRow, SiproProvenanceParams, SiproContractorParams } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_URL =
  'https://datos.gob.ar/dataset/modernizacion-sistema-informacion-proveedores-sipro'
const SUBMITTED_BY = 'etl:sipro'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): SiproProvenanceParams {
  const now = new Date().toISOString()
  return {
    source_url: SOURCE_URL,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

// ---------------------------------------------------------------------------
// Row transformer
// ---------------------------------------------------------------------------

function transformSupplier(row: SiproRow): SiproContractorParams {
  const rawCuit = (row.cuit___nit ?? '').trim()
  const cuit = rawCuit.replace(/-/g, '')
  const name = (row.razon_social ?? '').trim()
  const contractorId = cuit || computeHash(`contractor:${name}`)

  return {
    ...buildProvenance(`sipro:${contractorId}`),
    contractor_id: contractorId,
    caso_slug: 'obras-publicas',
    cuit,
    name,
    tipo_personeria: (row.tipo_de_personeria ?? '').trim(),
    localidad: (row.localidad ?? '').trim(),
    provincia: (row.provincia ?? '').trim(),
    codigo_postal: (row.codigo_postal ?? '').trim(),
    rubros: (row.rubros ?? '').trim(),
    fecha_inscripcion: (row.fecha_de_pre_inscripcion ?? '').trim(),
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SiproTransformResult {
  readonly contractors: readonly SiproContractorParams[]
}

export function transformSiproAll(rows: readonly SiproRow[]): SiproTransformResult {
  const contractorMap = new Map<string, SiproContractorParams>()

  for (const row of rows) {
    const contractor = transformSupplier(row)

    // Deduplicate by contractor_id
    if (!contractorMap.has(contractor.contractor_id)) {
      contractorMap.set(contractor.contractor_id, contractor)
    }
  }

  return { contractors: [...contractorMap.values()] }
}
