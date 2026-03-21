/**
 * BCRA Central de Deudores API client.
 *
 * Free, unauthenticated API for querying debtor status by CUIT.
 * Requires Origin header: https://www.bcra.gob.ar
 *
 * Endpoints:
 *   - Deudas: credit situation, debt amounts, arrears
 *   - ChequesRechazados: bounced checks
 *
 * Rate limiting: ~10 requests before cooldown needed (~30s)
 */

const BASE_URL = 'https://api.bcra.gob.ar/centraldedeudores/v1.0'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  Origin: 'https://www.bcra.gob.ar',
  Referer: 'https://www.bcra.gob.ar/bcrayvos/Situacion_Crediticia.asp',
  Accept: 'application/json',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BcraDeuda {
  entidad: string
  situacion: number // 1=normal, 2=special, 3=problematic, 4=high risk, 5=irrecoverable
  fechaSituacion: string
  monto: number // thousands of ARS
  diasAtrasoPago: number
  refinanciaciones: boolean
  recategorizacionOblig: boolean
  situacionJuridica: boolean
  irpitoRecategorizado: boolean
  procesoJud: boolean
}

export interface BcraDeudaResponse {
  status: number
  results: {
    denominacion: string
    periodos: Array<{
      periodo: string
      entidades: BcraDeuda[]
    }>
  }
}

export interface BcraChequesResponse {
  status: number
  results: {
    denominacion: string
    periodos: Array<{
      periodo: string
      entidades: Array<{
        entidad: string
        nroCheque: number
        fechaRechazo: string
        monto: number
        causal: string
      }>
    }>
  }
}

export interface DebtorReport {
  cuit: string
  denomination: string | null
  period: string | null
  totalDebt: number // thousands of ARS
  worstSituation: number // 1-5
  creditorCount: number
  hasBouncedChecks: boolean
  debts: BcraDeuda[]
  error: string | null
}

// ---------------------------------------------------------------------------
// Normalize CUIT: strip dashes, ensure 11 digits
// ---------------------------------------------------------------------------

function normalizeCuit(cuit: string): string {
  return cuit.replace(/[-\s]/g, '')
}

// ---------------------------------------------------------------------------
// Query debtor status
// ---------------------------------------------------------------------------

export async function queryDeudas(rawCuit: string): Promise<DebtorReport> {
  const cuit = normalizeCuit(rawCuit)
  const url = `${BASE_URL}/Deudas/${cuit}`

  try {
    const res = await fetch(url, { headers: HEADERS })

    if (res.status === 404) {
      return {
        cuit,
        denomination: null,
        period: null,
        totalDebt: 0,
        worstSituation: 0,
        creditorCount: 0,
        hasBouncedChecks: false,
        debts: [],
        error: null, // 404 = no debt on file (clean)
      }
    }

    if (!res.ok) {
      return {
        cuit,
        denomination: null,
        period: null,
        totalDebt: 0,
        worstSituation: 0,
        creditorCount: 0,
        hasBouncedChecks: false,
        debts: [],
        error: `HTTP ${res.status}`,
      }
    }

    const data: BcraDeudaResponse = await res.json()
    const latestPeriod = data.results?.periodos?.[0]

    if (!latestPeriod || !latestPeriod.entidades?.length) {
      return {
        cuit,
        denomination: data.results?.denominacion ?? null,
        period: null,
        totalDebt: 0,
        worstSituation: 0,
        creditorCount: 0,
        hasBouncedChecks: false,
        debts: [],
        error: null,
      }
    }

    const debts = latestPeriod.entidades
    const totalDebt = debts.reduce((sum, d) => sum + d.monto, 0)
    const worstSituation = Math.max(...debts.map((d) => d.situacion))

    return {
      cuit,
      denomination: data.results.denominacion,
      period: latestPeriod.periodo,
      totalDebt,
      worstSituation,
      creditorCount: debts.length,
      hasBouncedChecks: false, // checked separately
      debts,
      error: null,
    }
  } catch (err) {
    return {
      cuit,
      denomination: null,
      period: null,
      totalDebt: 0,
      worstSituation: 0,
      creditorCount: 0,
      hasBouncedChecks: false,
      debts: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

// ---------------------------------------------------------------------------
// Query bounced checks
// ---------------------------------------------------------------------------

export async function queryChequesRechazados(rawCuit: string): Promise<boolean> {
  const cuit = normalizeCuit(rawCuit)
  const url = `${BASE_URL}/ChequesRechazados/${cuit}`

  try {
    const res = await fetch(url, { headers: HEADERS })
    if (res.status === 404) return false
    if (!res.ok) return false

    const data: BcraChequesResponse = await res.json()
    const latest = data.results?.periodos?.[0]
    return (latest?.entidades?.length ?? 0) > 0
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Full report (debts + bounced checks)
// ---------------------------------------------------------------------------

export async function fullDebtorReport(rawCuit: string): Promise<DebtorReport> {
  const report = await queryDeudas(rawCuit)
  if (!report.error) {
    report.hasBouncedChecks = await queryChequesRechazados(rawCuit)
  }
  return report
}

// ---------------------------------------------------------------------------
// Batch query with rate limiting
// ---------------------------------------------------------------------------

export async function batchQuery(
  cuits: string[],
  delayMs = 3000,
): Promise<DebtorReport[]> {
  const results: DebtorReport[] = []
  for (const cuit of cuits) {
    const report = await fullDebtorReport(cuit)
    results.push(report)
    if (cuits.indexOf(cuit) < cuits.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  return results
}

// ---------------------------------------------------------------------------
// Situation labels
// ---------------------------------------------------------------------------

export const SITUATION_LABELS: Record<number, { es: string; en: string }> = {
  0: { es: 'Sin deuda registrada', en: 'No debt on file' },
  1: { es: 'Normal', en: 'Normal (performing)' },
  2: { es: 'Seguimiento especial', en: 'Special follow-up' },
  3: { es: 'Problematica', en: 'Problematic' },
  4: { es: 'Alto riesgo de insolvencia', en: 'High risk of insolvency' },
  5: { es: 'Irrecuperable', en: 'Irrecoverable' },
}
