/**
 * Caso Dictadura transform utilities.
 *
 * Converts Neo4j query result records into typed dictadura domain objects.
 */

import type { Node } from 'neo4j-driver-lite'

import type {
  DictaduraPersona,
  DictaduraCCD,
  DictaduraUnidadMilitar,
  DictaduraLugar,
  DictaduraEvento,
  DictaduraCausa,
  DictaduraSentencia,
  DictaduraTribunal,
  DictaduraDocumento,
  DictaduraAgencia,
  DictaduraOrganizacion,
  DictaduraOperacion,
  DictaduraActa,
  DictaduraArchivo,
} from './types'

/** Safely extract a string property from a Neo4j node */
function str(props: Record<string, unknown>, key: string, fallback = ''): string {
  const v = props[key]
  return typeof v === 'string' ? v : fallback
}

/** Safely extract a nullable string property */
function strOrNull(props: Record<string, unknown>, key: string): string | null {
  const v = props[key]
  return typeof v === 'string' ? v : null
}

/** Safely extract a string array property */
function strArray(props: Record<string, unknown>, key: string): string[] {
  const v = props[key]
  return Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') : []
}

/** Safely extract a nullable number property */
function numOrNull(props: Record<string, unknown>, key: string): number | null {
  const v = props[key]
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 'low' in v) return (v as { low: number }).low
  return null
}

/** Safely extract a boolean property */
function bool(props: Record<string, unknown>, key: string): boolean {
  return props[key] === true
}

export function toPersona(node: Node): DictaduraPersona {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    category: str(p, 'category') as DictaduraPersona['category'],
    description: strOrNull(p, 'description') ?? undefined,
    ruvte_id: strOrNull(p, 'ruvte_id') ?? undefined,
    dni: strOrNull(p, 'dni') ?? undefined,
    birth_year: strOrNull(p, 'birth_year') ?? undefined,
    birth_province: strOrNull(p, 'birth_province') ?? undefined,
    nationality: strOrNull(p, 'nationality') ?? undefined,
    age_at_event: strOrNull(p, 'age_at_event') ?? undefined,
    pregnancy: strOrNull(p, 'pregnancy') ?? undefined,
    detention_date: strOrNull(p, 'detention_date') ?? undefined,
    detention_location: strOrNull(p, 'detention_location') ?? undefined,
    death_date: strOrNull(p, 'death_date') ?? undefined,
    rank: strOrNull(p, 'rank') ?? undefined,
    unit: strOrNull(p, 'unit') ?? undefined,
    employer: strOrNull(p, 'employer') ?? undefined,
  }
}

export function toCCD(node: Node): DictaduraCCD {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    aliases: strArray(p, 'aliases').length > 0 ? strArray(p, 'aliases') : undefined,
    address: strOrNull(p, 'address') ?? undefined,
    lat: numOrNull(p, 'lat') ?? undefined,
    lon: numOrNull(p, 'lon') ?? undefined,
    province: strOrNull(p, 'province') ?? undefined,
    municipality: strOrNull(p, 'municipality') ?? undefined,
    military_branch: strOrNull(p, 'military_branch') ?? undefined,
    operating_period: strOrNull(p, 'operating_period') ?? undefined,
    is_memory_space: bool(p, 'is_memory_space') || undefined,
    description: strOrNull(p, 'description') ?? undefined,
  }
}

export function toUnidadMilitar(node: Node): DictaduraUnidadMilitar {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    branch: strOrNull(p, 'branch') as DictaduraUnidadMilitar['branch'],
    zone: strOrNull(p, 'zone') ?? undefined,
    description: strOrNull(p, 'description') ?? undefined,
  }
}

export function toLugar(node: Node): DictaduraLugar {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    province: strOrNull(p, 'province') ?? undefined,
    country: strOrNull(p, 'country') ?? undefined,
    lat: numOrNull(p, 'lat') ?? undefined,
    lon: numOrNull(p, 'lon') ?? undefined,
  }
}

export function toEvento(node: Node): DictaduraEvento {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    slug: str(p, 'slug'),
    date: str(p, 'date'),
    event_type: str(p, 'event_type') as DictaduraEvento['event_type'],
    description: str(p, 'description'),
  }
}

export function toCausa(node: Node): DictaduraCausa {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    case_number: strOrNull(p, 'case_number') ?? undefined,
    status: str(p, 'status') as DictaduraCausa['status'],
    tribunal: strOrNull(p, 'tribunal') ?? undefined,
    description: strOrNull(p, 'description') ?? undefined,
  }
}

export function toSentencia(node: Node): DictaduraSentencia {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    date: str(p, 'date'),
    outcome: strOrNull(p, 'outcome') ?? undefined,
    years: numOrNull(p, 'years') ?? undefined,
  }
}

export function toTribunal(node: Node): DictaduraTribunal {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    jurisdiction: strOrNull(p, 'jurisdiction') ?? undefined,
  }
}

export function toDocumento(node: Node): DictaduraDocumento {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    slug: str(p, 'slug'),
    doc_type: str(p, 'doc_type') as DictaduraDocumento['doc_type'],
    source_url: strOrNull(p, 'source_url') ?? undefined,
    summary: strOrNull(p, 'summary') ?? undefined,
    date: strOrNull(p, 'date') ?? undefined,
  }
}

export function toAgencia(node: Node): DictaduraAgencia {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    country: strOrNull(p, 'country') ?? undefined,
    description: strOrNull(p, 'description') ?? undefined,
  }
}

export function toOrganizacion(node: Node): DictaduraOrganizacion {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    org_type: str(p, 'org_type') as DictaduraOrganizacion['org_type'],
    description: strOrNull(p, 'description') ?? undefined,
  }
}

export function toOperacion(node: Node): DictaduraOperacion {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    description: strOrNull(p, 'description') ?? undefined,
    start_date: strOrNull(p, 'start_date') ?? undefined,
    end_date: strOrNull(p, 'end_date') ?? undefined,
  }
}

export function toActa(node: Node): DictaduraActa {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    date: str(p, 'date'),
    acta_number: strOrNull(p, 'acta_number') ?? undefined,
    summary: strOrNull(p, 'summary') ?? undefined,
  }
}

export function toArchivo(node: Node): DictaduraArchivo {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    institution: strOrNull(p, 'institution') ?? undefined,
    description: strOrNull(p, 'description') ?? undefined,
  }
}
