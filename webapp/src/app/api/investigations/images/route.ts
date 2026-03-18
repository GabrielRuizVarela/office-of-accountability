/**
 * /api/investigations/images
 *
 * POST — Upload an image for use in investigation documents (auth required)
 *
 * Accepts multipart/form-data with a single "file" field.
 *
 * Validation:
 *   - MIME type must be image/jpeg, image/png, image/gif, or image/webp
 *   - Maximum file size: 5MB
 *   - Magic byte verification (prevents MIME spoofing)
 *   - Script scanning (prevents polyglot attacks)
 *
 * Storage: writes to public/uploads/investigations/ for local dev.
 * In production this should be swapped for R2/S3/CDN.
 *
 * Responses:
 *   201: { success: true, data: { url, filename, size, mime } }
 *   400: invalid file / validation failure
 *   401: not authenticated
 *   413: file too large (early check before full read)
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { getSession } from '@/lib/auth/session'
import {
  validateImage,
  generateImageFilename,
  MAX_IMAGE_SIZE,
  ALLOWED_MIME_TYPES,
} from '@/lib/investigation/image-validation'

/** Directory where uploaded images are stored (relative to project root) */
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'investigations')

/** Public URL prefix for uploaded images */
const PUBLIC_URL_PREFIX = '/uploads/investigations'

export async function POST(request: Request): Promise<Response> {
  // Auth check
  const session = await getSession()
  if (!session) {
    return Response.json(
      { success: false, error: 'Authentication required' },
      { status: 401 },
    )
  }

  // Early content-length check (before reading the full body)
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE + 1024) {
    return Response.json(
      { success: false, error: `Request too large. Maximum image size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
      { status: 413 },
    )
  }

  // Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json(
      { success: false, error: 'Invalid form data. Expected multipart/form-data with a "file" field' },
      { status: 400 },
    )
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return Response.json(
      { success: false, error: 'Missing "file" field in form data' },
      { status: 400 },
    )
  }

  // Quick MIME check before reading full buffer
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return Response.json(
      {
        success: false,
        error: `Unsupported file type: ${file.type}. Allowed: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`,
      },
      { status: 400 },
    )
  }

  // Read file into buffer for validation
  const buffer = await file.arrayBuffer()

  // Full validation: size, MIME, magic bytes, script scanning
  const validation = validateImage(buffer, file.type)
  if (!validation.valid) {
    return Response.json(
      { success: false, error: validation.error },
      { status: 400 },
    )
  }

  // Generate unique filename and write to disk
  const filename = generateImageFilename(validation.extension ?? '.bin')

  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(join(UPLOAD_DIR, filename), new Uint8Array(buffer))
  } catch (error) {
    console.error('Failed to write uploaded image:', error)
    return Response.json(
      { success: false, error: 'Failed to store image' },
      { status: 500 },
    )
  }

  const url = `${PUBLIC_URL_PREFIX}/${filename}`

  return Response.json(
    {
      success: true,
      data: {
        url,
        filename,
        size: buffer.byteLength,
        mime: validation.detectedMime,
      },
    },
    { status: 201 },
  )
}
