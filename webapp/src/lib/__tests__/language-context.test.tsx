import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../language-context'

function LangDisplay() {
  const { lang, setLang } = useLanguage()
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('en')}>set-en</button>
      <button onClick={() => setLang('es')}>set-es</button>
    </>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('LanguageProvider', () => {
  it('defaults to "es" when no stored preference', () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    expect(screen.getByTestId('lang').textContent).toBe('es')
  })

  it('hydrates from localStorage after mount', async () => {
    localStorage.setItem('oa-lang', 'en')
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    await vi.waitFor(() => {
      expect(screen.getByTestId('lang').textContent).toBe('en')
    })
  })

  it('persists language change to localStorage', () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    act(() => {
      screen.getByText('set-en').click()
    })
    expect(localStorage.getItem('oa-lang')).toBe('en')
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('ignores invalid localStorage values', async () => {
    localStorage.setItem('oa-lang', 'fr')
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    await vi.waitFor(() => {
      expect(screen.getByTestId('lang').textContent).toBe('es')
    })
  })
})
