/**
 * Actor card for the landing page grid.
 */

import Link from 'next/link'

interface ActorCardProps {
  readonly slug: string
  readonly investigationSlug: string
  readonly name: string
  readonly role?: string
  readonly nationality?: string
}

export function ActorCard({ slug, investigationSlug, name, role, nationality }: ActorCardProps) {
  return (
    <Link
      href={`/caso/${investigationSlug}/actor/${slug}`}
      className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100 group-hover:text-purple-400">
            {name}
          </p>
          {role && <p className="truncate text-xs text-zinc-500">{role}</p>}
        </div>
      </div>
      {nationality && (
        <span className="mt-2 inline-block self-start rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
          {nationality}
        </span>
      )}
    </Link>
  )
}
