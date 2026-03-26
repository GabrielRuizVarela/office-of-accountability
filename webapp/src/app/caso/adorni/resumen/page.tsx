'use client'

/**
 * Caso Adorni — Narrative summary page.
 *
 * A bilingual investigative journalism piece covering the Adorni
 * spokesperson investigation across 13 waves. Chapters will be
 * populated as the investigation progresses.
 */

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Citation {
  readonly id: number
  readonly text: string
  readonly url?: string
}

interface Chapter {
  readonly id: string
  readonly title: Record<Lang, string>
  readonly paragraphs: Record<Lang, readonly string[]>
  readonly pullQuote?: Record<Lang, string>
  readonly citations?: readonly Citation[]
}

// ---------------------------------------------------------------------------
// Header content
// ---------------------------------------------------------------------------

const TITLE: Record<Lang, string> = {
  es: 'Caso Adorni: El Vocero',
  en: 'The Adorni Case: The Spokesperson',
}

const SUBTITLE: Record<Lang, string> = {
  es: 'Investigacion de trece olas sobre el vocero presidencial, la pauta oficial, las declaraciones verificadas, los contratos mediaticos, y las conexiones entre comunicacion gubernamental y poder economico.',
  en: 'Thirteen-wave investigation into the presidential spokesperson, official advertising spend, verified statements, media contracts, and the connections between government communication and economic power.',
}

const READING_TIME: Record<Lang, string> = {
  es: '~TBD min de lectura',
  en: '~TBD min read',
}

const LAST_UPDATED: Record<Lang, string> = {
  es: 'Actualizado: marzo 2026',
  en: 'Last updated: March 2026',
}

// ---------------------------------------------------------------------------
// Chapters — will be populated by Wave 13
// ---------------------------------------------------------------------------

const chapters: readonly Chapter[] = []

// ---------------------------------------------------------------------------
// Citation rendering helper
// ---------------------------------------------------------------------------

/** Parse [N] markers in text and render them as superscript citation links */
function renderWithCitations(text: string, citations?: readonly Citation[]) {
  if (!citations || citations.length === 0) return text

  const citationMap = new Map(citations.map((c) => [c.id, c]))
  const parts = text.split(/(\[\d+\])/)

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (!match) return part

    const id = parseInt(match[1], 10)
    const citation = citationMap.get(id)
    if (!citation) return part

    if (citation.url) {
      return (
        <a
          key={i}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          title={citation.text}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400 no-underline hover:bg-blue-500/30 hover:text-blue-300"
        >
          {id}
        </a>
      )
    }

    return (
      <span
        key={i}
        title={citation.text}
        className="ml-0.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-zinc-700/50 text-[10px] font-bold text-zinc-400"
      >
        {id}
      </span>
    )
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResumenPage() {
  const { lang } = useLanguage()

  return (
    <article className="mx-auto max-w-prose pb-20">
      {/* Header */}
      <header className="py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {TITLE[lang]}
        </h1>
        <p className="mt-4 text-lg text-zinc-400">{SUBTITLE[lang]}</p>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-zinc-500">
          <span>{READING_TIME[lang]}</span>
          <span className="text-zinc-700">|</span>
          <span>{LAST_UPDATED[lang]}</span>
        </div>
      </header>

      <hr className="border-zinc-800" />

      {/* Chapters — placeholder until Wave 13 populates them */}
      {chapters.length === 0 ? (
        <section className="py-16 text-center">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
            <p className="text-sm text-zinc-400">
              {lang === 'es'
                ? 'Los capitulos se publicaran a medida que avance la investigacion.'
                : 'Chapters will be populated as the investigation progresses.'}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              {lang === 'es'
                ? '13 olas de investigacion planificadas'
                : '13 investigation waves planned'}
            </p>
          </div>
        </section>
      ) : (
        chapters.map((chapter) => (
          <section key={chapter.id} id={chapter.id} className="py-12">
            <h2 className="border-l-4 border-blue-500 pl-4 text-xl font-bold text-zinc-50">
              {chapter.title[lang]}
            </h2>

            <div className="mt-6 space-y-4">
              {chapter.paragraphs[lang].map((p, i) => (
                <p key={i} className="text-base leading-relaxed text-zinc-300">
                  {renderWithCitations(p, chapter.citations)}
                </p>
              ))}
            </div>

            {chapter.pullQuote && (
              <blockquote className="my-6 border-l-2 border-blue-400 pl-4 text-lg italic text-zinc-200">
                {chapter.pullQuote[lang]}
              </blockquote>
            )}

            {/* Chapter citations footnotes */}
            {chapter.citations && chapter.citations.length > 0 && (
              <div className="mt-4 rounded border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
                <ul className="space-y-1">
                  {chapter.citations.map((c) => (
                    <li key={c.id} className="text-xs text-zinc-500">
                      <span className="mr-1.5 font-bold text-zinc-400">[{c.id}]</span>
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400/70 underline decoration-blue-400/20 hover:text-blue-300"
                        >
                          {c.text}
                        </a>
                      ) : (
                        c.text
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <hr className="mt-12 border-zinc-800/60" />
          </section>
        ))
      )}

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Esta investigacion se basa en fuentes publicas verificadas. La inclusion no implica culpabilidad. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente.'
            : 'This investigation is based on verified public sources. Inclusion does not imply guilt. Where "alleged" is indicated, the connection has not been independently verified.'}
        </p>
      </section>

      {/* Closing */}
      <div className="mt-8 text-center">
        <p className="text-sm italic text-zinc-500">
          {lang === 'es'
            ? 'La investigacion continua. Las preguntas permanecen.'
            : 'The investigation continues. The questions remain.'}
        </p>
      </div>
    </article>
  )
}
