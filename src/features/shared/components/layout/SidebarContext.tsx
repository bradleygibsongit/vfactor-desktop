import { useState, useCallback, type ReactNode } from "react"
import { SidebarContext } from "./sidebar-context"

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), [])
  const expand = useCallback(() => setIsCollapsed(false), [])
  const collapse = useCallback(() => setIsCollapsed(true), [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, expand, collapse }}>
      {children}
    </SidebarContext.Provider>
  )
}
