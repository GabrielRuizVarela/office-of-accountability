/**
 * Password hashing using Web Crypto API (SubtleCrypto).
 * Workers-compatible - no Node.js crypto dependency.
 *
 * Uses PBKDF2 with SHA-256, 100k iterations, 32-byte salt.
 */

const ITERATIONS = 100_000
const KEY_LENGTH = 32
const SALT_LENGTH = 32
const ALGORITHM = 'PBKDF2'
const HASH = 'SHA-256'

/**
 * Hash a plaintext password.
 * Returns a string in the format: `salt:hash` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const salt = new ArrayBuffer(saltBytes.byteLength)
  new Uint8Array(salt).set(saltBytes)
  const keyMaterial = await getKeyMaterial(password)

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      iterations: ITERATIONS,
      hash: HASH,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  )

  const saltHex = toHex(saltBytes)
  const hashHex = toHex(new Uint8Array(derivedKey))

  return `${saltHex}:${hashHex}`
}

/**
 * Verify a plaintext password against a stored hash.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const separatorIndex = storedHash.indexOf(':')
  if (separatorIndex === -1) return false

  const saltHex = storedHash.slice(0, separatorIndex)
  const expectedHashHex = storedHash.slice(separatorIndex + 1)

  const saltBytes = fromHex(saltHex)
  if (!saltBytes) return false

  const salt = new ArrayBuffer(saltBytes.byteLength)
  new Uint8Array(salt).set(saltBytes)
  const keyMaterial = await getKeyMaterial(password)

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      iterations: ITERATIONS,
      hash: HASH,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  )

  const actualHashHex = toHex(new Uint8Array(derivedKey))

  return constantTimeEqual(actualHashHex, expectedHashHex)
}

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return crypto.subtle.importKey('raw', encoder.encode(password), ALGORITHM, false, ['deriveBits'])
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null

  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    if (Number.isNaN(byte)) return null
    bytes[i / 2] = byte
  }

  return bytes
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
