import { useState, useCallback, useEffect, type ReactNode } from "react"
import { RightSidebarContext, type RightSidebarTab } from "./right-sidebar-context"
import { useCurrentProjectWorktree } from "@/features/shared/hooks"
import { useSidebar } from "./useSidebar"
import { MIN_MAIN_CONTENT_WIDTH } from "./layoutSizing"

const RIGHT_SIDEBAR_STORAGE_KEY = "nucleus:right-sidebar-width"
const RIGHT_SIDEBAR_COLLAPSED_STORAGE_KEY = "nucleus:right-sidebar-collapsed"
const RIGHT_SIDEBAR_ACTIVE_TAB_STORAGE_KEY = "nucleus:right-sidebar-active-tab"
const DEFAULT_RIGHT_SIDEBAR_WIDTH = 400
const MIN_RIGHT_SIDEBAR_WIDTH = 300
const BROWSER_RIGHT_SIDEBAR_MIN_WIDTH = 420
const BROWSER_RIGHT_SIDEBAR_TARGET_WIDTH = 520
const DEFAULT_RIGHT_SIDEBAR_TAB: RightSidebarTab = "files"

function getMinRightSidebarWidth(activeTab: RightSidebarTab) {
  return activeTab === "browser" ? BROWSER_RIGHT_SIDEBAR_MIN_WIDTH : MIN_RIGHT_SIDEBAR_WIDTH
}

function getMaxRightSidebarWidth(
  viewportWidth: number,
  leftSidebarWidth: number,
  activeTab: RightSidebarTab
) {
  return Math.max(getMinRightSidebarWidth(activeTab), viewportWidth - leftSidebarWidth - MIN_MAIN_CONTENT_WIDTH)
}

function clampRightSidebarWidth(width: number, maxWidth: number, activeTab: RightSidebarTab) {
  return Math.min(maxWidth, Math.max(getMinRightSidebarWidth(activeTab), width))
}

export function RightSidebarProvider({ children }: { children: ReactNode }) {
  const { activeWorktreePath } = useCurrentProjectWorktree()
  const { isCollapsed: isLeftSidebarCollapsed, width: leftSidebarWidth } = useSidebar()
  const isAvailable = Boolean(activeWorktreePath)
  const effectiveLeftSidebarWidth = isLeftSidebarCollapsed ? 0 : leftSidebarWidth
  const [activeTab, setActiveTabState] = useState<RightSidebarTab>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_RIGHT_SIDEBAR_TAB
    }

    const storedTab = window.localStorage.getItem(RIGHT_SIDEBAR_ACTIVE_TAB_STORAGE_KEY)
    return storedTab === "files" || storedTab === "changes" || storedTab === "checks" || storedTab === "browser"
      ? storedTab
      : DEFAULT_RIGHT_SIDEBAR_TAB
  })
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    if (typeof window === "undefined") {
      return true
    }

    const storedCollapsed = window.localStorage.getItem(RIGHT_SIDEBAR_COLLAPSED_STORAGE_KEY)
    return storedCollapsed === null ? true : storedCollapsed === "true"
  })
  const [width, setWidthState] = useState(() => {
    if (typeof window === "undefined") {
      return activeTab === "browser" ? BROWSER_RIGHT_SIDEBAR_TARGET_WIDTH : DEFAULT_RIGHT_SIDEBAR_WIDTH
    }

    const storedWidth = window.localStorage.getItem(RIGHT_SIDEBAR_STORAGE_KEY)
    const parsedWidth = storedWidth ? Number(storedWidth) : NaN
    const maxWidth = getMaxRightSidebarWidth(window.innerWidth, effectiveLeftSidebarWidth, activeTab)

    return Number.isFinite(parsedWidth)
      ? clampRightSidebarWidth(parsedWidth, maxWidth, activeTab)
      : clampRightSidebarWidth(
          activeTab === "browser" ? BROWSER_RIGHT_SIDEBAR_TARGET_WIDTH : DEFAULT_RIGHT_SIDEBAR_WIDTH,
          maxWidth,
          activeTab
        )
  })

  useEffect(() => {
    if (!isAvailable) {
      setIsCollapsedState(true)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(RIGHT_SIDEBAR_COLLAPSED_STORAGE_KEY, "true")
      }
    }
  }, [isAvailable])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const syncWidthToViewport = () => {
      const maxWidth = getMaxRightSidebarWidth(window.innerWidth, effectiveLeftSidebarWidth, activeTab)
      const clampedWidth = clampRightSidebarWidth(width, maxWidth, activeTab)

      if (clampedWidth === width) {
        return
      }

      setWidthState(clampedWidth)
      window.localStorage.setItem(RIGHT_SIDEBAR_STORAGE_KEY, String(clampedWidth))
    }

    syncWidthToViewport()
    window.addEventListener("resize", syncWidthToViewport)

    return () => {
      window.removeEventListener("resize", syncWidthToViewport)
    }
  }, [activeTab, effectiveLeftSidebarWidth, width])

  const setIsCollapsed = useCallback((nextCollapsed: boolean) => {
    const resolvedCollapsed = isAvailable ? nextCollapsed : true
    setIsCollapsedState(resolvedCollapsed)

    if (typeof window !== "undefined") {
      window.localStorage.setItem(RIGHT_SIDEBAR_COLLAPSED_STORAGE_KEY, String(resolvedCollapsed))
    }
  }, [isAvailable])
  const toggle = useCallback(() => {
    if (!isAvailable) {
      return
    }

    setIsCollapsedState((prev) => {
      const nextCollapsed = !prev

      if (typeof window !== "undefined") {
        window.localStorage.setItem(RIGHT_SIDEBAR_COLLAPSED_STORAGE_KEY, String(nextCollapsed))
      }

      return nextCollapsed
    })
  }, [isAvailable])
  const expand = useCallback(() => setIsCollapsed(false), [setIsCollapsed])
  const collapse = useCallback(() => setIsCollapsed(true), [setIsCollapsed])
  const setWidth = useCallback((nextWidth: number) => {
    const maxWidth =
      typeof window === "undefined"
        ? Number.POSITIVE_INFINITY
        : getMaxRightSidebarWidth(window.innerWidth, effectiveLeftSidebarWidth, activeTab)
    const clampedWidth = clampRightSidebarWidth(nextWidth, maxWidth, activeTab)
    setWidthState(clampedWidth)

    if (typeof window !== "undefined") {
      window.localStorage.setItem(RIGHT_SIDEBAR_STORAGE_KEY, String(clampedWidth))
    }
  }, [activeTab, effectiveLeftSidebarWidth])
  const setActiveTab = useCallback((nextTab: RightSidebarTab) => {
    console.debug("[RightSidebarContext] setActiveTab", { nextTab })
    setActiveTabState(nextTab)

    if (typeof window !== "undefined") {
      window.localStorage.setItem(RIGHT_SIDEBAR_ACTIVE_TAB_STORAGE_KEY, nextTab)

      if (nextTab === "browser") {
        const maxWidth = getMaxRightSidebarWidth(window.innerWidth, effectiveLeftSidebarWidth, nextTab)
        const preferredWidth = clampRightSidebarWidth(
          Math.max(width, BROWSER_RIGHT_SIDEBAR_TARGET_WIDTH),
          maxWidth,
          nextTab
        )

        if (preferredWidth !== width) {
          setWidthState(preferredWidth)
          window.localStorage.setItem(RIGHT_SIDEBAR_STORAGE_KEY, String(preferredWidth))
        }
      }
    }
  }, [effectiveLeftSidebarWidth, width])

  return (
    <RightSidebarContext.Provider
      value={{
        isAvailable,
        isCollapsed,
        width,
        activeTab,
        toggle,
        expand,
        collapse,
        setWidth,
        setActiveTab,
      }}
    >
      {children}
    </RightSidebarContext.Provider>
  )
}
