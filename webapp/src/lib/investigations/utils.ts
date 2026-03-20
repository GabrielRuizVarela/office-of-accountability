/**
 * Investigation utility functions.
 */

/**
 * Build a namespaced node ID from a caso slug and a local identifier.
 * Example: casoNodeId('caso-epstein', 'jeffrey-epstein') → 'caso-epstein:jeffrey-epstein'
 */
export function casoNodeId(casoSlug: string, localId: string): string {
  return `${casoSlug}:${localId}`
}
