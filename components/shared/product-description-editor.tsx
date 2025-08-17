"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { Toggle } from "@/components/ui/toggle"
import { Bold, Italic, List, ListOrdered, Quote, Minus, Link as LinkIcon } from "lucide-react"
import { useEffect } from "react"

interface ProductDescriptionEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

export function ProductDescriptionEditor({ value, onChange }: ProductDescriptionEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: "text-primary underline" }
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[150px] w-full rounded-md border p-3 focus:outline-none prose prose-sm max-w-none"
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const setLink = () => {
    const url = prompt("Enter the URL")
    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }

  if (!editor) return null

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border rounded-md p-1 bg-muted/50">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
