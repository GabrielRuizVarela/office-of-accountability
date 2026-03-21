'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'

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
  const [lang, setLangState] = useState<Lang>(defaultLang)
  const userToggled = useRef(false)

  const setLang = useCallback((l: Lang) => {
    userToggled.current = true
    setLangState(l)
  }, [])

  const toggle = useCallback(() => {
    userToggled.current = true
    setLangState((l) => (l === 'en' ? 'es' : 'en'))
  }, [])

  useEffect(() => {
    if (userToggled.current) return
    if (typeof window === 'undefined') return
    const browserLang = navigator.language
    if (browserLang.startsWith('es')) setLangState('es')
    else if (browserLang.startsWith('en')) setLangState('en')
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
