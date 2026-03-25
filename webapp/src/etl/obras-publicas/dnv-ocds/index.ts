/**
 * DNV OCDS ETL — Direccion Nacional de Vialidad road construction procurement.
 *
 * Reuses the OCDS provincial transformer and loader, configured for DNV.
 * 277 releases, 234 contracts, 58 unique suppliers.
 *
 * Key: DNV data covers federal highway construction — the same sector where
 * Cuadernos cartelization was alleged. Finding Cartellone, Rovella Carranza,
 * CPC, Dycasa, Decavial, CN Sapag in this dataset provides independent
 * corroboration of their public works involvement.
 *
 * Run with: npx tsx scripts/run-etl-dnv-ocds.ts
 */

export { fetchDnvOcdsData } from './fetcher'
export type { FetchDnvOcdsResult } from './fetcher'
