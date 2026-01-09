import Editor from "@monaco-editor/react"
import { getLanguageFromFilename } from "../utils/language"
import { getFileContent } from "../mocks/mock-files"
import { useTheme } from "@/features/shared/hooks"

interface FileViewerProps {
  filename: string
}

export function FileViewer({ filename }: FileViewerProps) {
  const content = getFileContent(filename) ?? `// File not found: ${filename}`
  const language = getLanguageFromFilename(filename)
  const theme = useTheme()

  return (
    <Editor
      height="100%"
      language={language}
      value={content}
      theme={theme}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        padding: { top: 16 },
      }}
    />
  )
}
