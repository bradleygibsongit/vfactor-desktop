import { useEffect, type MutableRefObject } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import type { LexicalEditor } from "lexical"

export function ComposerEditorRefPlugin({
  editorRef,
  isLocked = false,
}: {
  editorRef: MutableRefObject<LexicalEditor | null>
  isLocked?: boolean
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editorRef.current = editor

    return () => {
      if (editorRef.current === editor) {
        editorRef.current = null
      }
    }
  }, [editor, editorRef])

  useEffect(() => {
    editor.setEditable(!isLocked)
  }, [editor, isLocked])

  return null
}
