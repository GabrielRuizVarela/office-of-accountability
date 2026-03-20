import es from '../../messages/es.json'
import en from '../../messages/en.json'

const messages = { es, en } as const
type Locale = keyof typeof messages

const defaultLocale: Locale = 'es'

type Messages = typeof es

function resolve(obj: unknown, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return current
}

export function createTranslator(namespace: string, locale: Locale = defaultLocale) {
  const allMessages = messages[locale] as Record<string, unknown>
  const section = namespace ? resolve(allMessages, namespace) : allMessages

  return function t(key: string): string {
    if (section && typeof section === 'object') {
      const value = resolve(section, key)
      if (typeof value === 'string') return value
    }
    return `${namespace}.${key}`
  }
}

export type { Messages, Locale }
