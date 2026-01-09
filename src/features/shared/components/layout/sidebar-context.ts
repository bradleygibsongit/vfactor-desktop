import { createContext } from "react"

export interface SidebarContextValue {
  isCollapsed: boolean
  toggle: () => void
  expand: () => void
  collapse: () => void
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)
