'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Lang = 'en' | 'es'

/** Detect language from browser's navigator.language, defaulting to 'es'. */
function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'es'
  const locale = navigator.language.toLowerCase()
  if (locale.startsWith('en')) return 'en'
  return 'es'
}

interface LanguageContextValue {
  readonly lang: Lang
  readonly setLang: (lang: Lang) => void
  readonly toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  toggle: () => {},
})

export function LanguageProvider({
  children,
  defaultLang,
}: {
  readonly children: ReactNode
  readonly defaultLang?: Lang
}) {
  const [lang, setLang] = useState<Lang>(() => defaultLang ?? detectBrowserLang())
  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'es' : 'en')), [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
