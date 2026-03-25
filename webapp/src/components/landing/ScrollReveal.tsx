'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  readonly children: ReactNode
  readonly className?: string
  /** Delay in ms before the reveal animation starts */
  readonly delay?: number
  /** Animation variant */
  readonly variant?: 'fade-up' | 'fade' | 'draw-down'
}

export function ScrollReveal({ children, className = '', delay = 0, variant = 'fade-up' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('sr-visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add('sr-visible'), delay)
          } else {
            el.classList.add('sr-visible')
          }
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`sr-hidden sr-${variant} ${className}`}>
      {children}
    </div>
  )
}
