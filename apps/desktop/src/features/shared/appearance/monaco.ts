import type * as Monaco from "monaco-editor"
import { CONCRETE_THEMES } from "./themeRegistry"

let hasRegisteredMonacoThemes = false

export function registerMonacoThemes(monaco: typeof Monaco): void {
  if (hasRegisteredMonacoThemes) {
    return
  }

  for (const theme of CONCRETE_THEMES) {
    monaco.editor.defineTheme(theme.monaco.id, {
      base: theme.monaco.base,
      inherit: theme.monaco.inherit,
      rules: theme.monaco.rules,
      colors: theme.monaco.colors,
    })
  }

  hasRegisteredMonacoThemes = true
}
