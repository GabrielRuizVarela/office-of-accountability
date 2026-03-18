import Link from 'next/link'

interface ActorCardProps {
  readonly name: string
  readonly slug: string
  readonly role: string
  readonly nationality: string
  readonly casoSlug: string
}

export function ActorCard({ name, slug, role, nationality, casoSlug }: ActorCardProps) {
  return (
    <Link
      href={`/caso/${casoSlug}/actor/${slug}`}
      className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
    >
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400">
        {name}
      </h3>
      <p className="mt-0.5 text-xs text-zinc-500">{role}</p>
      <p className="mt-0.5 text-xs text-zinc-600">{nationality}</p>
    </Link>
  )
}
