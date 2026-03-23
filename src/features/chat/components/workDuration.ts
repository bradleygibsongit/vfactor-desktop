import { useEffect, useRef, useState } from "react"

export function formatElapsedDuration(durationMs: number): string {
  const safeDurationMs = Math.max(0, durationMs)

  if (safeDurationMs < 1000) {
    return `${(safeDurationMs / 1000).toFixed(2)}s`
  }

  if (safeDurationMs < 60_000) {
    const seconds = safeDurationMs / 1000
    return `${seconds < 10 ? seconds.toFixed(1) : Math.floor(seconds)}s`
  }

  const minutes = Math.floor(safeDurationMs / 60_000)
  const seconds = Math.floor((safeDurationMs % 60_000) / 1000)

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`
}

export function useElapsedDuration(
  startTime: number | null | undefined,
  isActive: boolean,
  endTime?: number
): string | null {
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isActive || startTime == null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentTime(Date.now())
    }, 50)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, startTime])

  if (startTime == null) {
    return null
  }

  const effectiveEndTime = isActive ? currentTime : (endTime ?? currentTime)
  return formatElapsedDuration(effectiveEndTime - startTime)
}
