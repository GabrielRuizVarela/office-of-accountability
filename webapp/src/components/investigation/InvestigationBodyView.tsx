'use client'

/**
 * Read-only renderer for TipTap investigation content.
 *
 * Renders the TipTap JSON body with graph node embeds displayed as
 * clickable pills that link to the graph explorer.
 */

import { mergeAttributes, Node } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react'

// ---------------------------------------------------------------------------
// Label colors (matches ForceGraph / SearchBar / GraphNodeEmbed)
// ---------------------------------------------------------------------------

const LABEL_COLORS: Readonly<Record<string, string>> = {
  Politician: '#3b82f6',
  Party: '#8b5cf6',
  Province: '#10b981',
  LegislativeVote: '#f59e0b',
  Legislation: '#ef4444',
  Investigation: '#ec4899',
}

// ---------------------------------------------------------------------------
// Read-only Node View (clickable link, no delete button)
// ---------------------------------------------------------------------------

function GraphNodeEmbedReadView(props: {
  readonly node: {
    attrs: { readonly nodeId: string; readonly label: string; readonly name: string }
  }
}) {
  const { nodeId, label, name } = props.node.attrs
  const color = LABEL_COLORS[label] ?? '#94a3b8'

  return (
    <NodeViewWrapper as="span" className="inline">
      <a
        href={`/explorar?node=${encodeURIComponent(nodeId)}`}
        className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/50 px-1.5 py-0.5 text-sm no-underline transition-colors hover:border-zinc-600 hover:bg-zinc-800"
        data-node-id={nodeId}
        title={`Ver ${label}: ${name} en el explorador`}
      >
        <span
          className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-zinc-200">{name}</span>
      </a>
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------
// Read-only TipTap extension for graph node embeds
// ---------------------------------------------------------------------------

const GraphNodeEmbedReadExtension = Node.create({
  name: 'graphNodeEmbed',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      nodeId: { default: '' },
      label: { default: '' },
      name: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-graph-node-embed]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-graph-node-embed': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GraphNodeEmbedReadView as React.ComponentType<unknown>)
  },
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface InvestigationBodyViewProps {
  /** Stringified TipTap JSON content */
  readonly content: string
}

export function InvestigationBodyView({ content }: InvestigationBodyViewProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: 'text-blue-400 underline hover:text-blue-300' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg' },
      }),
      GraphNodeEmbedReadExtension,
    ],
    content: content ? JSON.parse(content) : undefined,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-zinc max-w-none px-0 py-0 outline-none focus:outline-none',
      },
    },
  })

  if (!editor) {
    return <div className="py-4 text-sm text-zinc-500">Cargando contenido...</div>
  }

  return <EditorContent editor={editor} />
}
