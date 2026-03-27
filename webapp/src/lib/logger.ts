/**
 * Structured JSON logger with correlation ID support.
 *
 * Production: outputs one JSON object per line to stdout/stderr.
 * Development: outputs human-readable colored lines.
 *
 * PII fields (email, password, token, secret, authorization) are
 * automatically redacted from the `data` payload.
 */

const PII_KEYS = new Set([
  'email',
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'secret',
  'authorization',
  'cookie',
  'sessionToken',
  'accessToken',
  'refreshToken',
])

const isProduction = process.env.NODE_ENV === 'production'

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  readonly timestamp: string
  readonly level: LogLevel
  readonly message: string
  readonly correlationId: string
  readonly data?: Record<string, unknown>
}

interface Logger {
  readonly info: (message: string, data?: Record<string, unknown>) => void
  readonly warn: (message: string, data?: Record<string, unknown>) => void
  readonly error: (message: string, data?: Record<string, unknown>) => void
}

/** Deep-redact PII keys from a data object (returns a new object). */
function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (PII_KEYS.has(key)) {
        return [key, '[REDACTED]']
      }
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        return [key, sanitize(value as Record<string, unknown>)]
      }
      return [key, value]
    }),
  )
}

function formatDev(entry: LogEntry): string {
  const levelColors: Record<LogLevel, string> = {
    info: '\x1b[36m',   // cyan
    warn: '\x1b[33m',   // yellow
    error: '\x1b[31m',  // red
  }
  const reset = '\x1b[0m'
  const color = levelColors[entry.level]
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : ''
  return `${color}[${entry.level.toUpperCase()}]${reset} [${entry.correlationId.slice(0, 8)}] ${entry.message}${dataStr}`
}

function emit(entry: LogEntry): void {
  if (isProduction) {
    const line = JSON.stringify(entry)
    if (entry.level === 'error') {
      process.stderr.write(line + '\n')
    } else {
      process.stdout.write(line + '\n')
    }
    return
  }

  const line = formatDev(entry)
  if (entry.level === 'error') {
    console.error(line)
  } else if (entry.level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

/**
 * Create a logger scoped to a correlation ID.
 *
 * ```ts
 * const log = createLogger(correlationId)
 * log.info('Request received', { path: '/api/auth/signup' })
 * ```
 */
export function createLogger(correlationId: string): Logger {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId,
      ...(data ? { data: sanitize(data) } : {}),
    }
    emit(entry)
  }

  return {
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
  }
}
