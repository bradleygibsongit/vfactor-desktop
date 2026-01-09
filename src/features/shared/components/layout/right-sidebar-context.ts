import { createContext } from "react"

export interface RightSidebarContextValue {
  isCollapsed: boolean
  toggle: () => void
  expand: () => void
  collapse: () => void
}

export const RightSidebarContext = createContext<RightSidebarContextValue | null>(null)
