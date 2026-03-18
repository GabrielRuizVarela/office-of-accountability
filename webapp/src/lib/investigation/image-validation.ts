/**
 * Image upload validation: MIME type checking, size limits, and script scanning.
 *
 * Validates uploaded images before storage to prevent:
 * - Non-image file uploads (MIME spoofing)
 * - Oversized uploads (DoS via storage abuse)
 * - Embedded scripts in image files (polyglot attacks)
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum image size: 5MB */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/** Allowed MIME types for image uploads */
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

/** File extensions matching the allowed MIME types */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
}

// ---------------------------------------------------------------------------
// Magic bytes for file type verification
// ---------------------------------------------------------------------------

/** Magic byte signatures for validating actual file content vs claimed MIME */
const MAGIC_BYTES: ReadonlyArray<{
  readonly mime: string
  readonly bytes: readonly number[]
  readonly offset: number
}> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 },
  // WebP: starts with RIFF....WEBP
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
]

// ---------------------------------------------------------------------------
// Script scanning patterns (polyglot detection)
// ---------------------------------------------------------------------------

/**
 * Patterns that indicate embedded scripts in image data.
 * These catch polyglot files that are valid images but also contain
 * executable content (e.g., SVG with script, HTML in EXIF, etc.)
 */
const SCRIPT_PATTERNS = [
  /<script[\s>]/i,
  /javascript\s*:/i,
  /on(?:error|load|click|mouseover)\s*=/i,
  /<\/?\s*(?:html|body|head|iframe|object|embed|form|link|meta)\b/i,
  /eval\s*\(/i,
  /document\s*\.\s*(?:write|cookie|location)/i,
  /window\s*\.\s*(?:location|open)/i,
  /<!\s*DOCTYPE/i,
  /<%|<\?(?:php)?/i, // Server-side code injection
]

// ---------------------------------------------------------------------------
// Validation result type
// ---------------------------------------------------------------------------

export interface ImageValidationResult {
  readonly valid: boolean
  readonly error?: string
  /** Detected MIME type from magic bytes */
  readonly detectedMime?: string
  /** Recommended file extension */
  readonly extension?: string
}

// ---------------------------------------------------------------------------
// Validation functions
// ---------------------------------------------------------------------------

/**
 * Detect the actual MIME type of a file by reading its magic bytes.
 * Returns null if no known image signature matches.
 */
function detectMimeFromBytes(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer)

  for (const sig of MAGIC_BYTES) {
    if (bytes.length < sig.offset + sig.bytes.length) continue

    let matches = true
    for (let i = 0; i < sig.bytes.length; i++) {
      if (bytes[sig.offset + i] !== sig.bytes[i]) {
        matches = false
        break
      }
    }

    if (matches) {
      // Extra check for WebP: bytes 8-11 must be "WEBP"
      if (sig.mime === 'image/webp') {
        if (
          bytes.length >= 12 &&
          bytes[8] === 0x57 && // W
          bytes[9] === 0x45 && // E
          bytes[10] === 0x42 && // B
          bytes[11] === 0x50 // P
        ) {
          return sig.mime
        }
        continue
      }
      return sig.mime
    }
  }

  return null
}

/**
 * Scan image bytes for embedded script patterns.
 *
 * Converts a portion of the file to text and searches for
 * patterns that indicate polyglot attacks (HTML/JS hidden in image data).
 */
function scanForEmbeddedScripts(buffer: ArrayBuffer): string | null {
  // Scan the first 8KB and last 8KB where scripts are typically injected
  const bytes = new Uint8Array(buffer)
  const scanSize = Math.min(8192, bytes.length)

  const regions = [
    bytes.slice(0, scanSize),
    ...(bytes.length > scanSize ? [bytes.slice(-scanSize)] : []),
  ]

  for (const region of regions) {
    // Convert to string for pattern matching (Latin-1 preserves all byte values)
    const text = Array.from(region, (b) => String.fromCharCode(b)).join('')

    for (const pattern of SCRIPT_PATTERNS) {
      if (pattern.test(text)) {
        return `Embedded script detected: matches pattern ${pattern.source}`
      }
    }
  }

  return null
}

/**
 * Validate an uploaded image file.
 *
 * Checks:
 * 1. File size within MAX_IMAGE_SIZE (5MB)
 * 2. Claimed MIME type is in ALLOWED_MIME_TYPES
 * 3. Magic bytes match the claimed MIME type (prevents MIME spoofing)
 * 4. No embedded scripts detected (polyglot attack prevention)
 */
export function validateImage(
  buffer: ArrayBuffer,
  claimedMime: string,
): ImageValidationResult {
  // 1. Size check
  if (buffer.byteLength > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  if (buffer.byteLength === 0) {
    return { valid: false, error: 'File is empty' }
  }

  // 2. MIME type allow list
  if (!ALLOWED_MIME_TYPES.has(claimedMime)) {
    return {
      valid: false,
      error: `Unsupported file type: ${claimedMime}. Allowed: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`,
    }
  }

  // 3. Magic byte verification
  const detectedMime = detectMimeFromBytes(buffer)
  if (!detectedMime) {
    return {
      valid: false,
      error: 'File does not appear to be a valid image (magic bytes do not match any supported format)',
    }
  }

  if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
    return {
      valid: false,
      error: `Detected file type ${detectedMime} is not allowed`,
    }
  }

  // 4. Script scanning
  const scriptFound = scanForEmbeddedScripts(buffer)
  if (scriptFound) {
    return { valid: false, error: scriptFound }
  }

  const extension = MIME_TO_EXT[detectedMime] ?? '.bin'

  return {
    valid: true,
    detectedMime,
    extension,
  }
}

/**
 * Generate a unique filename for an uploaded image.
 * Format: {timestamp}-{random}.{ext}
 */
export function generateImageFilename(extension: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `${timestamp}-${random}${extension}`
}
