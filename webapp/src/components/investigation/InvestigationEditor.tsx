'use client'

import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback, useState } from 'react'

import { GraphNodeEmbedExtension, GraphNodePicker } from './GraphNodeEmbed'
import { SubGraphEmbedExtension } from './SubGraphEmbed'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvestigationEditorProps {
  /** Initial TipTap JSON content (stringified) */
  readonly initialContent?: string
  /** Called on every content change with stringified JSON + referenced node IDs */
  readonly onChange?: (content: string, referencedNodeIds: readonly string[]) => void
  /** Whether the editor is read-only */
  readonly editable?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractNodeRefs(json: Record<string, unknown>): readonly string[] {
  const ids = new Set<string>()

  function walk(node: Record<string, unknown>) {
    if (node.type === 'graphNodeEmbed' || node.type === 'subGraphEmbed') {
      const attrs = node.attrs as Record<string, unknown> | undefined
      if (attrs && typeof attrs.nodeId === 'string' && attrs.nodeId) {
        ids.add(attrs.nodeId)
      }
    }
    const content = node.content as Array<Record<string, unknown>> | undefined
    if (Array.isArray(content)) {
      content.forEach(walk)
    }
  }

  walk(json)
  return Array.from(ids)
}

// ---------------------------------------------------------------------------
// Toolbar Button
// ---------------------------------------------------------------------------

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  readonly onClick: () => void
  readonly isActive?: boolean
  readonly disabled?: boolean
  readonly title: string
  readonly children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded px-2 py-1 text-sm transition-colors ${
        isActive
          ? 'bg-zinc-700 text-zinc-100'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-zinc-700" />
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function EditorToolbar({
  editor,
  onInsertEmbed,
  onInsertSubGraph,
}: {
  readonly editor: ReturnType<typeof useEditor>
  readonly onInsertEmbed: () => void
  readonly onInsertSubGraph: () => void
}) {
  const addLink = useCallback(() => {
    if (!editor) return
    const attrs = editor.getAttributes('link')
    const previousUrl = typeof attrs.href === 'string' ? attrs.href : ''
    const url = window.prompt('URL del enlace:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL de la imagen:')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-700 bg-zinc-900/50 px-2 py-1.5">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Negrita (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Cursiva (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Tachado"
      >
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Código"
      >
        {'</>'}
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Título 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Título 3"
      >
        H3
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Lista con viñetas"
      >
        • Lista
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Lista numerada"
      >
        1. Lista
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Cita"
      >
        &ldquo; Cita
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Bloque de código"
      >
        {'{ }'}
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Línea horizontal"
      >
        ―
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link + Image */}
      <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Enlace">
        🔗
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Imagen">
        🖼
      </ToolbarButton>

      <ToolbarDivider />

      {/* Graph Node Embed */}
      <ToolbarButton onClick={onInsertEmbed} title="Insertar referencia a nodo del grafo">
        📊 Nodo
      </ToolbarButton>
      <ToolbarButton onClick={onInsertSubGraph} title="Insertar sub-grafo interactivo">
        🕸 Grafo
      </ToolbarButton>

      <ToolbarDivider />

      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Deshacer (Ctrl+Z)"
      >
        ↩
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Rehacer (Ctrl+Shift+Z)"
      >
        ↪
      </ToolbarButton>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Editor Component
// ---------------------------------------------------------------------------

export function InvestigationEditor({
  initialContent,
  onChange,
  editable = true,
}: InvestigationEditorProps) {
  const [showNodePicker, setShowNodePicker] = useState(false)
  const [pickerMode, setPickerMode] = useState<'inline' | 'subgraph'>('inline')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-400 underline hover:text-blue-300' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg' },
      }),
      GraphNodeEmbedExtension,
      SubGraphEmbedExtension,
    ],
    content: initialContent ? JSON.parse(initialContent) : undefined,
    editable,
    onUpdate: ({ editor: ed }) => {
      if (!onChange) return
      const json = ed.getJSON()
      const content = JSON.stringify(json)
      const nodeIds = extractNodeRefs(json as Record<string, unknown>)
      onChange(content, nodeIds)
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-zinc max-w-none px-4 py-3 min-h-[300px] outline-none focus:outline-none',
      },
    },
  })

  const handleInsertEmbed = useCallback(() => {
    setPickerMode('inline')
    setShowNodePicker(true)
  }, [])

  const handleInsertSubGraph = useCallback(() => {
    setPickerMode('subgraph')
    setShowNodePicker(true)
  }, [])

  const handleNodeSelect = useCallback(
    (node: { id: string; label: string; name: string }) => {
      if (!editor) return

      if (pickerMode === 'subgraph') {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'subGraphEmbed',
            attrs: {
              nodeId: node.id,
              label: node.label,
              name: node.name,
            },
          })
          .run()
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'graphNodeEmbed',
            attrs: {
              nodeId: node.id,
              label: node.label,
              name: node.name,
            },
          })
          .run()
      }
      setShowNodePicker(false)
    },
    [editor, pickerMode],
  )

  const handlePickerClose = useCallback(() => {
    setShowNodePicker(false)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
      {editable && <EditorToolbar editor={editor} onInsertEmbed={handleInsertEmbed} onInsertSubGraph={handleInsertSubGraph} />}

      <EditorContent editor={editor} />

      {showNodePicker && (
        <div className="absolute left-2 top-12">
          <GraphNodePicker onSelect={handleNodeSelect} onClose={handlePickerClose} />
        </div>
      )}
    </div>
  )
}
