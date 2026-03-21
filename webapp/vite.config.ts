import { existsSync, readdirSync, statSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import vinext from 'vinext'
import { defineConfig } from 'vite'

/**
 * TipTap v3 ships as source-only (no dist/ directory).
 * Build resolve aliases so Vite can compile them from src/.
 *
 * @tiptap/pm subpackages re-export prosemirror-* packages
 * and also need aliasing since their exports reference missing dist/.
 */
function tiptapAliases(): Array<{ find: RegExp; replacement: string }> {
  const tiptapDir = resolve(__dirname, 'node_modules/@tiptap')
  const aliases: Array<{ find: RegExp; replacement: string }> = []

  for (const pkg of readdirSync(tiptapDir)) {
    const pkgDir = resolve(tiptapDir, pkg)
    if (!statSync(pkgDir).isDirectory()) continue

    // Handle @tiptap/pm — subpackages that re-export prosemirror-*
    if (pkg === 'pm') {
      for (const sub of readdirSync(pkgDir)) {
        const subDir = resolve(pkgDir, sub)
        const subIndex = resolve(subDir, 'index.ts')
        if (existsSync(subIndex) && statSync(subDir).isDirectory()) {
          aliases.push({
            find: new RegExp(`^@tiptap/pm/${sub}$`),
            replacement: subIndex,
          })
        }
      }
      continue
    }

    // Alias jsx-runtime and jsx-dev-runtime subpaths to src/
    const jsxRuntimeSrc = resolve(pkgDir, 'src/jsx-runtime.ts')
    if (existsSync(jsxRuntimeSrc)) {
      aliases.push({
        find: new RegExp(`^@tiptap/${pkg}/jsx-runtime$`),
        replacement: jsxRuntimeSrc,
      })
      aliases.push({
        find: new RegExp(`^@tiptap/${pkg}/jsx-dev-runtime$`),
        replacement: jsxRuntimeSrc,
      })
    }

    // Alias main entry to src/index.ts
    const srcEntry = resolve(pkgDir, 'src/index.ts')
    if (existsSync(srcEntry)) {
      aliases.push({
        find: new RegExp(`^@tiptap/${pkg}$`),
        replacement: srcEntry,
      })
    }
  }

  return aliases
}

export default defineConfig({
  plugins: [vinext()],
  server: {
    allowedHosts: ['demoooa.lutie.app'],
  },
  resolve: {
    alias: tiptapAliases(),
  },
})
