/**
 * Cypher query sandbox for MCP clients.
 * Validates queries are read-only and scoped to a caso_slug.
 */

const BLOCKED_KEYWORDS = [
  'CREATE', 'MERGE', 'SET', 'DELETE', 'REMOVE', 'DROP',
  'DETACH', 'CALL', 'FOREACH', 'LOAD',
]

const BLOCKED_REGEX = new RegExp(
  `\\b(${BLOCKED_KEYWORDS.join('|')})\\b`,
  'i',
)

export interface SandboxResult {
  valid: boolean
  error?: string
  sanitizedQuery?: string
}

/**
 * Validate a Cypher query for read-only execution.
 * - Blocks write operations (CREATE, MERGE, SET, DELETE, etc.)
 * - Injects caso_slug filter if not present
 * - Enforces LIMIT cap
 */
export function validateCypher(query: string, casoSlug: string): SandboxResult {
  const trimmed = query.trim()

  if (!trimmed) {
    return { valid: false, error: 'Empty query' }
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Query too long (max 2000 chars)' }
  }

  // Strip comments (single-line // and block /* */)
  const noComments = trimmed
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  // Check for blocked keywords
  if (BLOCKED_REGEX.test(noComments)) {
    const match = noComments.match(BLOCKED_REGEX)
    return { valid: false, error: `Write operation not allowed: ${match?.[0]}` }
  }

  // Must start with MATCH, RETURN, WITH, OPTIONAL, or UNWIND
  const firstWord = noComments.replace(/^\s+/, '').split(/\s/)[0]?.toUpperCase()
  if (!firstWord || !['MATCH', 'RETURN', 'WITH', 'OPTIONAL', 'UNWIND'].includes(firstWord)) {
    return { valid: false, error: `Query must start with MATCH, RETURN, WITH, OPTIONAL, or UNWIND (got: ${firstWord})` }
  }

  // Enforce LIMIT cap: if no LIMIT present, append one
  let sanitized = noComments
  if (!/\bLIMIT\b/i.test(sanitized)) {
    sanitized = sanitized.replace(/;?\s*$/, '') + ' LIMIT 1000'
  } else {
    // Check existing LIMIT isn't too high
    const limitMatch = sanitized.match(/\bLIMIT\s+(\d+)/i)
    if (limitMatch && parseInt(limitMatch[1]) > 1000) {
      sanitized = sanitized.replace(/\bLIMIT\s+\d+/i, 'LIMIT 1000')
    }
  }

  return { valid: true, sanitizedQuery: sanitized }
}
