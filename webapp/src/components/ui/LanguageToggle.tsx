'use client'

import { useLanguage } from '@/lib/language-context'

interface LanguageToggleProps {
  readonly size?: 'default' | 'sm'
}

export function LanguageToggle({ size = 'default' }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage()

  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 p-0.5">
      <button
        onClick={() => setLang('en')}
        className={`rounded-md font-medium transition-colors ${padding} ${
          lang === 'en' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('es')}
        className={`rounded-md font-medium transition-colors ${padding} ${
          lang === 'es' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        ES
      </button>
    </div>
  )
}
