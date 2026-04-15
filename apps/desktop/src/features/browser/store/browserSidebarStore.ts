import { create } from "zustand"

export const DEFAULT_BROWSER_URL = "https://duckduckgo.com/"

interface BrowserSidebarEntry {
  url: string
}

interface BrowserSidebarState {
  entriesByWorktreeId: Record<string, BrowserSidebarEntry>
  setUrl: (worktreeId: string, url: string) => void
}

export const useBrowserSidebarStore = create<BrowserSidebarState>((set) => ({
  entriesByWorktreeId: {},
  setUrl: (worktreeId, url) =>
    set((state) => ({
      entriesByWorktreeId: {
        ...state.entriesByWorktreeId,
        [worktreeId]: { url },
      },
    })),
}))

export function getBrowserUrlForWorktree(
  entriesByWorktreeId: Record<string, BrowserSidebarEntry>,
  worktreeId: string | null
) {
  if (!worktreeId) {
    return DEFAULT_BROWSER_URL
  }

  return entriesByWorktreeId[worktreeId]?.url ?? DEFAULT_BROWSER_URL
}
