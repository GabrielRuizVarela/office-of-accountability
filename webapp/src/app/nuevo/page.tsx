/**
 * /nuevo — Investigation creation wizard.
 *
 * Server component wrapper. All wizard logic lives in the client component below.
 * Steps:
 *   1. Name & Describe
 *   2. Seed Entity (optional)
 *   3. Scope (1-hop neighbors, only if seed selected)
 *   4. Creating… (loading + POST /api/casos/create)
 */

import { NuevoWizard } from './NuevoWizard'

export const metadata = {
  title: 'New Investigation — Office of Accountability',
}

export default function NuevoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-8">
          <a
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← Office of Accountability
          </a>
        </div>
        <NuevoWizard />
      </div>
    </div>
  )
}
