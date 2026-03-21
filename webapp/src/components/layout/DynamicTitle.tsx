'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'

export function DynamicHtmlLang() {
  const { lang } = useLanguage()
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return null
}

export function BilingualDocTitle({
  titles,
}: {
  readonly titles?: Readonly<Record<string, string>>
}) {
  const { lang } = useLanguage()
  useEffect(() => {
    if (titles?.[lang]) {
      document.title = titles[lang]
    }
  }, [lang, titles])
  return null
}
