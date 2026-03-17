/**
 * TipTap v3.20.3 ships TypeScript source but no compiled dist/.
 * These ambient module declarations provide the types we need.
 * See: https://github.com/ueberdosis/tiptap/issues/6082
 */

declare module '@tiptap/core' {
  export interface MarkConfig {
    name: string
    [key: string]: unknown
  }

  export interface NodeConfig {
    name: string
    group?: string
    inline?: boolean
    atom?: boolean
    content?: string
    [key: string]: unknown
  }

  export interface ExtensionConfig {
    name: string
    [key: string]: unknown
  }

  export class Extension<Options = unknown, Storage = unknown> {
    static create<O = unknown, S = unknown>(config: Record<string, unknown>): Extension<O, S>
    configure(options?: Partial<Options>): Extension<Options, Storage>
  }

  export class Node<Options = unknown, Storage = unknown> {
    static create<O = unknown, S = unknown>(config: Record<string, unknown>): Node<O, S>
    configure(options?: Partial<Options>): Node<Options, Storage>
  }

  export class Mark<Options = unknown, Storage = unknown> {
    static create<O = unknown, S = unknown>(config: Record<string, unknown>): Mark<O, S>
    configure(options?: Partial<Options>): Mark<Options, Storage>
  }

  export function mergeAttributes(
    ...attributes: Array<Record<string, unknown>>
  ): Record<string, unknown>

  export interface Editor {
    getJSON(): Record<string, unknown>
    getHTML(): string
    getText(): string
    isActive(name: string, attrs?: Record<string, unknown>): boolean
    getAttributes(name: string): Record<string, unknown>
    can(): {
      undo(): boolean
      redo(): boolean
      [key: string]: (...args: unknown[]) => boolean
    }
    chain(): ChainedCommands
    isDestroyed: boolean
    isEmpty: boolean
    destroy(): void
  }

  export interface ChainedCommands {
    focus(): ChainedCommands
    toggleBold(): ChainedCommands
    toggleItalic(): ChainedCommands
    toggleStrike(): ChainedCommands
    toggleCode(): ChainedCommands
    toggleHeading(attrs: { level: number }): ChainedCommands
    toggleBulletList(): ChainedCommands
    toggleOrderedList(): ChainedCommands
    toggleBlockquote(): ChainedCommands
    toggleCodeBlock(): ChainedCommands
    setHorizontalRule(): ChainedCommands
    setLink(attrs: { href: string }): ChainedCommands
    unsetLink(): ChainedCommands
    extendMarkRange(name: string): ChainedCommands
    setImage(attrs: { src: string; alt?: string; title?: string }): ChainedCommands
    insertContent(content: Record<string, unknown> | string): ChainedCommands
    undo(): ChainedCommands
    redo(): ChainedCommands
    run(): void
  }
}

declare module '@tiptap/react' {
  import type { Editor, Extension, Node, Mark } from '@tiptap/core'
  import type { ComponentType } from 'react'

  export interface UseEditorOptions {
    extensions?: Array<Extension | Node | Mark>
    content?: Record<string, unknown> | string
    editable?: boolean
    onUpdate?: (props: { editor: Editor }) => void
    editorProps?: Record<string, unknown>
    [key: string]: unknown
  }

  export function useEditor(options: UseEditorOptions): Editor | null

  export function EditorContent(props: {
    editor: Editor | null
    [key: string]: unknown
  }): JSX.Element

  export interface NodeViewRendererProps {
    node: { attrs: Record<string, unknown> }
    deleteNode: () => void
    selected: boolean
    [key: string]: unknown
  }

  export interface NodeViewWrapperProps {
    as?: string
    className?: string
    children?: React.ReactNode
    [key: string]: unknown
  }

  export function NodeViewWrapper(props: NodeViewWrapperProps): JSX.Element

  export function ReactNodeViewRenderer(component: ComponentType<unknown>): () => unknown
}

declare module '@tiptap/starter-kit' {
  import type { Extension } from '@tiptap/core'

  interface StarterKitOptions {
    [key: string]: unknown
  }

  const StarterKit: Extension<StarterKitOptions>
  export default StarterKit
}

declare module '@tiptap/extension-link' {
  import type { Mark } from '@tiptap/core'

  interface LinkOptions {
    openOnClick?: boolean
    HTMLAttributes?: Record<string, unknown>
    [key: string]: unknown
  }

  const Link: Mark<LinkOptions>
  export default Link
}

declare module '@tiptap/extension-image' {
  import type { Node } from '@tiptap/core'

  interface ImageOptions {
    HTMLAttributes?: Record<string, unknown>
    inline?: boolean
    allowBase64?: boolean
    [key: string]: unknown
  }

  const Image: Node<ImageOptions>
  export default Image
}

declare module '@tiptap/pm/state' {
  export interface Plugin {
    [key: string]: unknown
  }
}

declare module '@tiptap/pm/model' {
  export interface Schema {
    [key: string]: unknown
  }
  export interface Node {
    [key: string]: unknown
  }
}
