import { useAppearance } from "@/features/shared/appearance"

export function useTheme() {
  return useAppearance().monacoThemeId
}
