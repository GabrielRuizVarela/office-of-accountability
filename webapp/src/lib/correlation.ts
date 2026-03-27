/**
 * Request correlation ID utilities.
 *
 * Reads the `X-Request-ID` header when present (e.g. from a load balancer
 * or API gateway), otherwise generates a fresh UUID v4.
 *
 * `withCorrelation` is a thin wrapper that provides a scoped logger and
 * appends the correlation ID to the outgoing response.
 */

import { createLogger } from '@/lib/logger'

/**
 * Resolve a correlation ID from the incoming request.
 * Prefers the `X-Request-ID` header; falls back to `crypto.randomUUID()`.
 */
export function getCorrelationId(request: Request): string {
  const existing = request.headers.get('X-Request-ID')
  if (existing && existing.length > 0 && existing.length <= 128) {
    return existing
  }
  return crypto.randomUUID()
}

/**
 * Wrap a route handler with automatic correlation ID extraction and
 * response header injection.
 *
 * ```ts
 * export const GET = (req: Request) =>
 *   withCorrelation(req, async (log) => {
 *     log.info('Handling request')
 *     return Response.json({ ok: true })
 *   })
 * ```
 */
export async function withCorrelation(
  request: Request,
  fn: (logger: ReturnType<typeof createLogger>, correlationId: string) => Promise<Response>,
): Promise<Response> {
  const correlationId = getCorrelationId(request)
  const logger = createLogger(correlationId)

  const response = await fn(logger, correlationId)

  // Clone headers to avoid mutating the original response
  const headers = new Headers(response.headers)
  headers.set('X-Request-ID', correlationId)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
