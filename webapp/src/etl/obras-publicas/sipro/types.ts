import { z } from 'zod/v4'

// SIPRO CSV row schema
export const SiproRowSchema = z.object({
  cuit___nit: z.string().default(''),
  razon_social: z.string().default(''),
  tipo_de_personeria: z.string().default(''),
  localidad: z.string().default(''),
  provincia: z.string().default(''),
  codigo_postal: z.string().default(''),
  rubros: z.string().default(''),
  fecha_de_pre_inscripcion: z.string().default(''),
})
export type SiproRow = z.infer<typeof SiproRowSchema>

// Neo4j node params
export interface SiproProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface SiproContractorParams extends SiproProvenanceParams {
  readonly contractor_id: string
  readonly caso_slug: 'obras-publicas'
  readonly cuit: string
  readonly name: string
  readonly tipo_personeria: string
  readonly localidad: string
  readonly provincia: string
  readonly codigo_postal: string
  readonly rubros: string
  readonly fecha_inscripcion: string
}
