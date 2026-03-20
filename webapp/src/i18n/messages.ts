import es from '../../messages/es.json'
import en from '../../messages/en.json'

const messages = { es, en } as const
type Locale = keyof typeof messages

const defaultLocale: Locale = 'es'

type Messages = typeof es

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}

export function createTranslator(namespace: string, locale: Locale = defaultLocale) {
  const allMessages = messages[locale] as Record<string, unknown>
  const section = namespace
    ? (getNestedValue(allMessages, namespace) as Record<string, unknown>)
    : allMessages

  return function t(key: string): string {
    if (typeof section === 'object' && section !== null) {
      return getNestedValue(section as Record<string, unknown>, key)
    }
    return `${namespace}.${key}`
  }
}

export type { Messages, Locale }
