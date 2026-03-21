'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type Lang = 'en' | 'es'

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
  defaultLang = 'en',
}: {
  readonly children: ReactNode
  readonly defaultLang?: Lang
}) {
  const [lang, setLang] = useState<Lang>(defaultLang)

  useEffect(() => {
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : null
    if (browserLang === 'en' || browserLang === 'es') {
      setLang(browserLang)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
