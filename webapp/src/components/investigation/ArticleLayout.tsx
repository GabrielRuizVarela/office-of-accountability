import type { ReactNode } from 'react'

/**
 * Shared article wrapper for case narrative / resumen pages.
 *
 * Standardizes layout across all investigations:
 *   - max-w-3xl centered container
 *   - consistent vertical and horizontal padding
 *   - NO text-justify (intentional — long-form prose reads better ragged-right)
 *
 * The accent color is exposed as a CSS custom property `--article-accent`
 * so child components can reference it without prop-drilling:
 *
 *   <h2 className="border-l-4 border-[var(--article-accent)]">…</h2>
 *
 * Usage:
 *   <ArticleLayout accentColor="#ef4444">
 *     <header>…</header>
 *     <section>…</section>
 *   </ArticleLayout>
 */

interface ArticleLayoutProps {
  readonly children: ReactNode
  /**
   * Any valid CSS color value.
   * Exposed to children via `--article-accent` CSS custom property.
   */
  readonly accentColor: string
  /** Additional Tailwind classes merged onto the <article> element. */
  readonly className?: string
}

export function ArticleLayout({
  children,
  accentColor,
  className,
}: ArticleLayoutProps) {
  return (
    <article
      className={`mx-auto max-w-3xl px-4 py-12${className ? ` ${className}` : ''}`}
      style={
        {
          '--article-accent': accentColor,
        } as React.CSSProperties
      }
    >
      {children}
    </article>
  )
}
