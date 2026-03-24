/**
 * Types for CABA BAC_OCDS ETL pipeline — Obras Publicas investigation, Wave 4.
 *
 * Data source:
 * - Buenos Aires Compras (BAC) — OCDS standard releases
 *   https://data.buenosaires.gob.ar  (dataset: buenos-aires-compras)
 *   https://github.com/datosgcba/BAC_OCDS
 *
 * OCID prefix: ocds-bulbcf
 * Coverage: Jan–Jun 2022 (historical, no longer updated)
 * 23,298 releases — tender, award, contract stages
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// OCDS value object
// ---------------------------------------------------------------------------

export const OcdsValueSchema = z.object({
  amount: z.number().default(0),
  currency: z.string().default('ARS'),
})
export type OcdsValue = z.infer<typeof OcdsValueSchema>

// ---------------------------------------------------------------------------
// OCDS identifier object
// ---------------------------------------------------------------------------

export const OcdsIdentifierSchema = z.object({
  scheme: z.string().default(''),
  id: z.string().default(''),
  legalName: z.string().default(''),
})
export type OcdsIdentifier = z.infer<typeof OcdsIdentifierSchema>

// ---------------------------------------------------------------------------
// OCDS period object
// ---------------------------------------------------------------------------

export const OcdsPeriodSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  durationInDays: z.number().optional(),
})
export type OcdsPeriod = z.infer<typeof OcdsPeriodSchema>

// ---------------------------------------------------------------------------
// OCDS party
// ---------------------------------------------------------------------------

export const OcdsPartySchema = z.object({
  name: z.string().default(''),
  id: z.string().default(''),
  identifier: OcdsIdentifierSchema.optional(),
  roles: z.array(z.string()).default([]),
  address: z.record(z.string(), z.unknown()).optional(),
  contactPoint: z.record(z.string(), z.unknown()).optional(),
})
export type OcdsParty = z.infer<typeof OcdsPartySchema>

// ---------------------------------------------------------------------------
// OCDS tender
// ---------------------------------------------------------------------------

export const OcdsTenderSchema = z.object({
  id: z.string().default(''),
  title: z.string().default(''),
  description: z.string().default(''),
  status: z.string().default(''),
  procuringEntity: z.record(z.string(), z.unknown()).optional(),
  value: OcdsValueSchema.optional(),
  procurementMethod: z.string().default(''),
  procurementMethodDetails: z.string().default(''),
  mainProcurementCategory: z.string().default(''),
  additionalProcurementCategories: z.array(z.string()).default([]),
  tenderPeriod: OcdsPeriodSchema.optional(),
  enquiryPeriod: OcdsPeriodSchema.optional(),
  items: z.array(z.record(z.string(), z.unknown())).default([]),
  documents: z.array(z.record(z.string(), z.unknown())).default([]),
  techniques: z.record(z.string(), z.unknown()).optional(),
  competitive: z.boolean().optional(),
  numberOfTenderers: z.number().optional().nullable(),
})
export type OcdsTender = z.infer<typeof OcdsTenderSchema>

// ---------------------------------------------------------------------------
// OCDS supplier (in award)
// ---------------------------------------------------------------------------

export const OcdsSupplierRefSchema = z.object({
  name: z.string().default(''),
  id: z.string().default(''),
  identifier: OcdsIdentifierSchema.optional(),
})
export type OcdsSupplierRef = z.infer<typeof OcdsSupplierRefSchema>

// ---------------------------------------------------------------------------
// OCDS award
// ---------------------------------------------------------------------------

export const OcdsAwardSchema = z.object({
  id: z.string().default(''),
  status: z.string().default(''),
  date: z.string().optional(),
  value: OcdsValueSchema.optional(),
  suppliers: z.array(OcdsSupplierRefSchema).default([]),
  items: z.array(z.record(z.string(), z.unknown())).default([]),
  documents: z.array(z.record(z.string(), z.unknown())).default([]),
})
export type OcdsAward = z.infer<typeof OcdsAwardSchema>

// ---------------------------------------------------------------------------
// OCDS contract signatory
// ---------------------------------------------------------------------------

export const OcdsSignatorySchema = z.object({
  name: z.string().default(''),
  id: z.string().default(''),
})
export type OcdsSignatory = z.infer<typeof OcdsSignatorySchema>

// ---------------------------------------------------------------------------
// OCDS contract
// ---------------------------------------------------------------------------

export const OcdsContractSchema = z.object({
  id: z.string().default(''),
  awardID: z.string().optional(),
  status: z.string().default(''),
  value: OcdsValueSchema.optional(),
  period: OcdsPeriodSchema.optional(),
  dateSigned: z.string().optional(),
  items: z.array(z.record(z.string(), z.unknown())).default([]),
  documents: z.array(z.record(z.string(), z.unknown())).default([]),
  signatories: z.array(OcdsSignatorySchema).default([]),
})
export type OcdsContract = z.infer<typeof OcdsContractSchema>

// ---------------------------------------------------------------------------
// OCDS release (top-level)
// ---------------------------------------------------------------------------

export const OcdsReleaseSchema = z.object({
  ocid: z.string().default(''),
  id: z.string().default(''),
  date: z.string().default(''),
  initiationType: z.string().default('tender'),
  tag: z.array(z.string()).default([]),
  language: z.string().default('es'),
  tender: OcdsTenderSchema.optional(),
  awards: z.array(OcdsAwardSchema).default([]),
  contracts: z.array(OcdsContractSchema).default([]),
  parties: z.array(OcdsPartySchema).default([]),
})
export type OcdsRelease = z.infer<typeof OcdsReleaseSchema>

// ---------------------------------------------------------------------------
// OCDS release package (the top-level JSON file)
// ---------------------------------------------------------------------------

export const OcdsReleasePackageSchema = z.object({
  uri: z.string().default(''),
  publishedDate: z.string().default(''),
  publisher: z.record(z.string(), z.unknown()).optional(),
  license: z.string().default(''),
  publicationPolicy: z.string().default(''),
  version: z.string().default('1.1'),
  extensions: z.array(z.string()).default([]),
  releases: z.array(OcdsReleaseSchema),
})
export type OcdsReleasePackage = z.infer<typeof OcdsReleasePackageSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types (reuse from contratar where compatible)
// ---------------------------------------------------------------------------

export type {
  ObrasProvenanceParams,
  ObrasProcedureParams,
  ObrasBidParams,
  ObrasContractorParams,
  ObrasPublicContractParams,
  ProcedureForRelParams,
  BidOnRelParams,
  BidderRelParams,
  ObrasAwardedToRelParams,
} from '../contratar/types'
