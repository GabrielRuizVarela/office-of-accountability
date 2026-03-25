'use client'

import { ScrollReveal } from './ScrollReveal'

interface TransitionProps {
  readonly text: string
}

export function Transition({ text }: TransitionProps) {
  return (
    <ScrollReveal variant="fade" delay={100}>
      <div className="mx-auto max-w-sm px-4 py-8 text-center text-sm leading-relaxed text-zinc-500 italic">
        {text}
      </div>
    </ScrollReveal>
  )
}
