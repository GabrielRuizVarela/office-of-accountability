'use client'

/**
 * Print/PDF export button for investigations.
 *
 * Triggers the browser's native print dialog which allows
 * saving as PDF - zero-dependency, works on all browsers.
 */

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 print:hidden"
      title="Exportar como PDF"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.241l.305 1.984A1.75 1.75 0 0114.084 19H5.916a1.75 1.75 0 01-1.73-2.016L4.492 15H4.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75zm1.5 0v3.379a49.27 49.27 0 017 0V2.75a.25.25 0 00-.25-.25h-6.5a.25.25 0 00-.25.25zM6.609 15a.25.25 0 00-.247.288l.428 2.784a.25.25 0 00.247.178h5.926a.25.25 0 00.247-.178l.428-2.784A.25.25 0 0013.391 15H6.609z"
          clipRule="evenodd"
        />
      </svg>
      Descargar PDF
    </button>
  )
}
