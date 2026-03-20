import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:justify-between">
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
    </footer>
  )
}
