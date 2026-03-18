'use client'

/**
 * "Compartir por WhatsApp" share button + generic share fallback.
 *
 * - WhatsApp: opens wa.me with pre-filled text (URL + optional message)
 * - Copy link: fallback for non-WhatsApp use cases
 * - Uses Web Share API when available (mobile native share sheet)
 */

import { useCallback, useState } from 'react'

interface ShareButtonProps {
  /** The full URL to share. If omitted, uses current page URL. */
  readonly url?: string
  /** Pre-filled text before the URL (e.g. "Mirá el perfil de Cristina Fernández"). */
  readonly text?: string
  /** Title for the Web Share API (used in native share sheet). */
  readonly title?: string
}

export function ShareButton({ url, text, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const getShareUrl = useCallback(() => {
    if (url) return url
    if (typeof window !== 'undefined') return window.location.href
    return ''
  }, [url])

  const handleWhatsApp = useCallback(() => {
    const shareUrl = getShareUrl()
    const message = text ? `${text}\n${shareUrl}` : shareUrl
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }, [getShareUrl, text])

  const handleCopyLink = useCallback(async () => {
    const shareUrl = getShareUrl()
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select a temporary input
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [getShareUrl])

  const handleNativeShare = useCallback(async () => {
    const shareUrl = getShareUrl()
    try {
      await navigator.share({
        title: title ?? '',
        text: text ?? '',
        url: shareUrl,
      })
    } catch {
      // User cancelled or API not available — no-op
    }
  }, [getShareUrl, text, title])

  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* WhatsApp button — always visible, primary CTA */}
      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#1ebe57]"
        title="Compartir por WhatsApp"
      >
        <WhatsAppIcon />
        Compartir
      </button>

      {/* Native share (mobile) or copy link (desktop) */}
      {hasNativeShare ? (
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          title="Compartir"
        >
          <ShareIcon />
          Más
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          title="Copiar enlace"
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Icons (inline SVG, no external deps)
// ---------------------------------------------------------------------------

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.474l6.733-3.367A2.52 2.52 0 0113 4.5z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 text-emerald-400"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  )
}
