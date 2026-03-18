/**
 * TipTap content sanitization for investigation bodies.
 *
 * Strips dangerous HTML nodes (script, style, iframe, etc.),
 * removes event handler attributes, and blocks javascript: URIs.
 * Also validates embedded graph node IDs against Neo4j.
 */

import { getDriver } from '../neo4j/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TipTapNode {
  readonly type?: string
  readonly text?: string
  readonly attrs?: Record<string, unknown>
  readonly marks?: readonly TipTapMark[]
  readonly content?: readonly TipTapNode[]
}

interface TipTapMark {
  readonly type?: string
  readonly attrs?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Dangerous content patterns
// ---------------------------------------------------------------------------

/** Node types that should be stripped entirely */
const DANGEROUS_NODE_TYPES = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'textarea',
  'select',
  'button',
])

/** Attribute keys that are event handlers or dangerous */
const DANGEROUS_ATTR_PATTERN = /^on[a-z]/i

/** URI schemes that are dangerous */
const DANGEROUS_URI_PATTERN = /^\s*(javascript|vbscript|data\s*:text\/html)/i

/** Attributes that can contain URIs */
const URI_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'xlink:href'])

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

function sanitizeAttrs(
  attrs: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!attrs) return undefined

  const cleaned: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(attrs)) {
    // Strip event handlers (onclick, onload, etc.)
    if (DANGEROUS_ATTR_PATTERN.test(key)) continue

    // Strip dangerous URI values
    if (URI_ATTRS.has(key) && typeof value === 'string' && DANGEROUS_URI_PATTERN.test(value)) {
      continue
    }

    cleaned[key] = value
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

function sanitizeMarks(marks: readonly TipTapMark[] | undefined): readonly TipTapMark[] | undefined {
  if (!marks || marks.length === 0) return undefined

  return marks
    .map((mark) => ({
      ...mark,
      attrs: sanitizeAttrs(mark.attrs as Record<string, unknown> | undefined),
    }))
    .filter((mark) => {
      // Strip link marks with dangerous URIs
      if (mark.type === 'link' && mark.attrs) {
        const href = mark.attrs.href
        if (typeof href === 'string' && DANGEROUS_URI_PATTERN.test(href)) {
          return false
        }
      }
      return true
    })
}

function sanitizeNode(node: TipTapNode): TipTapNode | null {
  // Strip dangerous node types
  if (node.type && DANGEROUS_NODE_TYPES.has(node.type.toLowerCase())) {
    return null
  }

  // Strip raw HTML nodes that could contain scripts
  if (node.type === 'hardBreak' || node.type === 'text') {
    return {
      ...node,
      marks: sanitizeMarks(node.marks),
    }
  }

  const sanitizedContent = node.content
    ? node.content
        .map(sanitizeNode)
        .filter((n): n is TipTapNode => n !== null)
    : undefined

  return {
    ...node,
    attrs: sanitizeAttrs(node.attrs as Record<string, unknown> | undefined),
    marks: sanitizeMarks(node.marks),
    content: sanitizedContent && sanitizedContent.length > 0 ? sanitizedContent : undefined,
  }
}

/**
 * Sanitize a TipTap JSON body string.
 *
 * - Strips dangerous node types (script, iframe, etc.)
 * - Removes event handler attributes (onclick, onload, etc.)
 * - Blocks javascript: and data:text/html URIs
 * - Returns the sanitized JSON string
 *
 * Throws if the body is not valid JSON.
 */
export function sanitizeTipTapBody(bodyJson: string): string {
  const parsed = JSON.parse(bodyJson) as TipTapNode
  const sanitized = sanitizeNode(parsed)
  return JSON.stringify(sanitized ?? { type: 'doc', content: [] })
}

// ---------------------------------------------------------------------------
// Embedded node ID extraction + validation
// ---------------------------------------------------------------------------

/**
 * Extract all graph node embed IDs from a TipTap JSON body string.
 */
export function extractEmbeddedNodeIds(bodyJson: string): readonly string[] {
  const ids = new Set<string>()

  function walk(node: TipTapNode) {
    if (node.type === 'graphNodeEmbed') {
      const attrs = node.attrs as Record<string, unknown> | undefined
      if (attrs && typeof attrs.nodeId === 'string' && attrs.nodeId) {
        ids.add(attrs.nodeId)
      }
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child)
      }
    }
  }

  try {
    walk(JSON.parse(bodyJson) as TipTapNode)
  } catch {
    // Invalid JSON — no embeds
  }

  return Array.from(ids)
}

/**
 * Validate that all embedded node IDs exist in Neo4j.
 *
 * Returns an array of IDs that do NOT exist (empty = all valid).
 * Checks by id, slug, or acta_id to match the REFERENCES query pattern.
 */
export async function validateEmbeddedNodeIds(
  nodeIds: readonly string[],
): Promise<readonly string[]> {
  if (nodeIds.length === 0) return []

  const session = getDriver().session()

  try {
    const result = await session.run(
      `UNWIND $nodeIds AS nodeId
       OPTIONAL MATCH (n) WHERE n.id = nodeId OR n.slug = nodeId OR n.acta_id = nodeId
       RETURN nodeId, n IS NOT NULL AS exists`,
      { nodeIds: [...nodeIds] },
      { timeout: 5_000 },
    )

    const missing: string[] = []
    for (const record of result.records) {
      if (!record.get('exists')) {
        missing.push(record.get('nodeId') as string)
      }
    }

    return missing
  } finally {
    await session.close()
  }
}
