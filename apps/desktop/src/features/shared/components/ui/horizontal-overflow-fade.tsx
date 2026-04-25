import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import { cn } from "@/lib/utils"

interface HorizontalOverflowFadeProps {
  children: ReactNode
  className?: string
  viewportClassName?: string
  contentClassName?: string
  viewportRef?: RefObject<HTMLDivElement | null>
  contentRef?: RefObject<HTMLDivElement | null>
}

const SCROLL_EDGE_EPSILON = 2
const END_FADE_WIDTH_PX = 44
const END_FADE_SOLID_WIDTH_PX = 12
const END_FADE_RAMP_DISTANCE_PX = 58

export function HorizontalOverflowFade({
  children,
  className,
  viewportClassName,
  contentClassName,
  viewportRef,
  contentRef,
}: HorizontalOverflowFadeProps) {
  const internalViewportRef = useRef<HTMLDivElement | null>(null)
  const internalContentRef = useRef<HTMLDivElement | null>(null)
  const [startFadeProgress, setStartFadeProgress] = useState(0)
  const [endFadeProgress, setEndFadeProgress] = useState(0)

  const setViewportNode = useCallback((node: HTMLDivElement | null) => {
    internalViewportRef.current = node

    if (viewportRef) {
      viewportRef.current = node
    }
  }, [viewportRef])

  const setContentNode = useCallback((node: HTMLDivElement | null) => {
    internalContentRef.current = node

    if (contentRef) {
      contentRef.current = node
    }
  }, [contentRef])

  const syncFadeState = useCallback(() => {
    const viewport = internalViewportRef.current
    if (!viewport) {
      setStartFadeProgress(0)
      setEndFadeProgress(0)
      return
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth
    const hasOverflow = maxScrollLeft > SCROLL_EDGE_EPSILON
    const isAtStart = viewport.scrollLeft <= SCROLL_EDGE_EPSILON
    const isAtEnd = viewport.scrollLeft >= maxScrollLeft - SCROLL_EDGE_EPSILON
    const hiddenLeftPx = Math.max(0, viewport.scrollLeft)
    const hiddenRightPx = Math.max(0, maxScrollLeft - viewport.scrollLeft)

    if (!hasOverflow) {
      setStartFadeProgress(0)
      setEndFadeProgress(0)
      return
    }

    setStartFadeProgress(
      isAtStart ? 0 : Math.min(1, hiddenLeftPx / END_FADE_RAMP_DISTANCE_PX)
    )
    setEndFadeProgress(
      isAtEnd ? 0 : Math.min(1, hiddenRightPx / END_FADE_RAMP_DISTANCE_PX)
    )
  }, [])

  useEffect(() => {
    const viewport = internalViewportRef.current
    const content = internalContentRef.current

    if (!viewport) {
      return
    }

    syncFadeState()

    const handleScroll = () => {
      syncFadeState()
    }

    viewport.addEventListener("scroll", handleScroll, { passive: true })

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncFadeState)

      return () => {
        viewport.removeEventListener("scroll", handleScroll)
        window.removeEventListener("resize", syncFadeState)
      }
    }

    const observer = new ResizeObserver(() => {
      syncFadeState()
    })
    observer.observe(viewport)

    if (content) {
      observer.observe(content)
    }

    return () => {
      viewport.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [syncFadeState])

  const showStartFade = startFadeProgress > 0.01
  const showEndFade = endFadeProgress > 0.01
  const effectiveStartFadeWidth = END_FADE_WIDTH_PX * startFadeProgress
  const effectiveStartSolidWidth = END_FADE_SOLID_WIDTH_PX * startFadeProgress
  const effectiveFadeWidth = END_FADE_WIDTH_PX * endFadeProgress
  const effectiveSolidWidth = END_FADE_SOLID_WIDTH_PX * endFadeProgress
  const fadeMaskStyle = showStartFade || showEndFade
    ? {
        maskImage: `linear-gradient(90deg, transparent 0, black ${effectiveStartFadeWidth}px, black calc(100% - ${effectiveFadeWidth}px), transparent 100%)`,
        WebkitMaskImage: `linear-gradient(90deg, transparent 0, black ${effectiveStartFadeWidth}px, black calc(100% - ${effectiveFadeWidth}px), transparent 100%)`,
      }
    : undefined

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={setViewportNode}
        style={fadeMaskStyle}
        className={cn("app-scrollbar-hidden min-w-0 overflow-x-auto overflow-y-hidden", viewportClassName)}
      >
        <div ref={setContentNode} className={cn("min-w-max", contentClassName)}>
          {children}
        </div>
      </div>

      {showStartFade ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex"
          style={{
            width: END_FADE_WIDTH_PX,
            opacity: startFadeProgress,
            transition: "opacity 160ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          <div
            className="shrink-0 bg-sidebar"
            style={{
              width: effectiveStartSolidWidth,
              boxShadow: "inset -12px 0 18px color-mix(in oklab, var(--sidebar) 84%, transparent)",
            }}
          />
          <div
            className="min-w-0 flex-1"
            style={{
              background: "linear-gradient(90deg, var(--sidebar) 0%, transparent 100%)",
            }}
          />
        </div>
      ) : null}

      {showEndFade ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex"
          style={{
            width: END_FADE_WIDTH_PX,
            opacity: endFadeProgress,
            transition: "opacity 160ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          <div
            className="min-w-0 flex-1"
            style={{
              background: "linear-gradient(90deg, transparent 0%, var(--sidebar) 100%)",
            }}
          />
          <div
            className="shrink-0 bg-sidebar"
            style={{
              width: effectiveSolidWidth,
              boxShadow: "inset 12px 0 18px color-mix(in oklab, var(--sidebar) 84%, transparent)",
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
