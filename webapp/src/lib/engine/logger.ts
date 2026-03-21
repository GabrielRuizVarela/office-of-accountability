/**
 * Structured engine logger for pipeline operations (M10).
 */

import type { StageKind } from './types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  investigation_id: string
  stage?: StageKind
  action: string
  duration_ms?: number
  metadata?: Record<string, unknown>
}

export interface EngineLogger {
  debug(action: string, metadata?: Record<string, unknown>): void
  info(action: string, metadata?: Record<string, unknown>): void
  warn(action: string, metadata?: Record<string, unknown>): void
  error(action: string, metadata?: Record<string, unknown>): void
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createEngineLogger(
  investigation_id: string,
  stage?: StageKind,
): EngineLogger {
  function emit(
    level: LogEntry['level'],
    action: string,
    metadata?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      investigation_id,
      ...(stage !== undefined && { stage }),
      action,
      ...(metadata !== undefined && { metadata }),
    }

    switch (level) {
      case 'debug':
      case 'info':
        console.log(JSON.stringify(entry))
        break
      case 'warn':
        console.warn(JSON.stringify(entry))
        break
      case 'error':
        console.error(JSON.stringify(entry))
        break
    }
  }

  return {
    debug: (action, metadata) => emit('debug', action, metadata),
    info: (action, metadata) => emit('info', action, metadata),
    warn: (action, metadata) => emit('warn', action, metadata),
    error: (action, metadata) => emit('error', action, metadata),
  }
}

// ---------------------------------------------------------------------------
// Timing helper
// ---------------------------------------------------------------------------

export async function withTiming<T>(
  logger: EngineLogger,
  action: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now()
  logger.info(`${action}.start`)
  try {
    const result = await fn()
    const duration_ms = Math.round(performance.now() - start)
    logger.info(`${action}.done`, { duration_ms })
    return result
  } catch (err) {
    const duration_ms = Math.round(performance.now() - start)
    logger.error(`${action}.failed`, {
      duration_ms,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}
