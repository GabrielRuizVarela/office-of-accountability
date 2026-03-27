'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type Lang = 'en' | 'es'

const STORAGE_KEY = 'oa-lang'
const DEFAULT_LANG: Lang = 'es'

function isValidLang(value: unknown): value is Lang {
  return value === 'en' || value === 'es'
}

interface LanguageContextValue {
  readonly lang: Lang
  readonly setLang: (lang: Lang) => void
  readonly toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  toggle: () => {},
})

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG)

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isValidLang(stored)) {
      setLangState(stored)
    }
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'en' ? 'es' : 'en'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
