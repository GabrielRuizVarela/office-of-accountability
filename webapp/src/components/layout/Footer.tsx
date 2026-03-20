import Link from 'next/link'
import { createTranslator } from '@/i18n/messages'

export function Footer() {
  const t = createTranslator('footer')

  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-xs text-zinc-500 sm:flex-row sm:justify-between">
          <p>{t('tagline')}</p>
          <nav className="flex gap-4">
            <Link href="/explorar" className="transition-colors hover:text-zinc-300">
              {t('explore')}
            </Link>
            <Link href="/investigaciones" className="transition-colors hover:text-zinc-300">
              {t('investigations')}
            </Link>
          </nav>
        </div>
        <p className="text-center text-xs text-zinc-600">
          {t('contact')}{' '}
          <a
            href="mailto:gabrielruizvarela@gmail.com"
            className="text-zinc-400 transition-colors hover:text-zinc-200"
          >
            gabrielruizvarela@gmail.com
          </a>
        </p>
      </div>
    </footer>
  )
}
