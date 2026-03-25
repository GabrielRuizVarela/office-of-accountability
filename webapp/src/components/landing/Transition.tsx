interface TransitionProps {
  readonly text: string
}

export function Transition({ text }: TransitionProps) {
  return (
    <div className="mx-auto max-w-sm px-4 py-8 text-center text-sm leading-relaxed text-zinc-500 italic">
      {text}
    </div>
  )
}
