interface LoadingDotsProps {
  className?: string
  variant?: "loading" | "attention" | "connecting"
}

// Radial ripple: center out, like a heartbeat pulse
//
// 2  1  1  2
// 1  0  0  1
// 1  0  0  1
// 2  1  1  2
//
// Ring 0: inner 4 (5,6,9,10) — fires first
// Ring 1: cross 8 (1,2,4,7,8,11,13,14)
// Ring 2: corners 4 (0,3,12,15) — fires last
const rippleOrder = [2, 1, 1, 2, 1, 0, 0, 1, 1, 0, 0, 1, 2, 1, 1, 2]

// Square ring for attention variant (hollow center):
// ● ● ● ●
// ●     ●
// ●     ●
// ● ● ● ●
const squareDots = [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15]

export function LoadingDots({ className, variant = "loading" }: LoadingDotsProps) {
  const isAttention = variant === "attention"
  const isConnecting = variant === "connecting"

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 2px)",
        gridTemplateRows: "repeat(4, 2px)",
        gap: "2px",
        width: "14px",
        height: "14px",
      }}
    >
      {Array.from({ length: 16 }).map((_, index) => {
        const animationOrder = rippleOrder[index]
        const isVisible = isAttention ? squareDots.includes(index) : true
        return (
          <div
            key={index}
            style={{
              width: "2px",
              height: "2px",
              borderRadius: "50%",
              backgroundColor: isAttention ? "rgb(251 191 36)" : "currentColor",
              opacity: isVisible ? undefined : 0,
              animationName: isVisible
                ? isAttention
                  ? "dot-attention"
                  : isConnecting
                    ? "dot-connect"
                    : "dot-pulse"
                : "none",
              animationDuration: isVisible
                ? isAttention
                  ? "600ms"
                  : isConnecting
                    ? "1600ms"
                    : "700ms"
                : undefined,
              animationTimingFunction: isVisible
                ? isAttention
                  ? "ease-in-out"
                  : isConnecting
                    ? "ease-in-out"
                    : "cubic-bezier(0.36, 0, 0.66, 1)"
                : undefined,
              animationIterationCount: isVisible ? "infinite" : undefined,
              animationDelay: isAttention ? "0ms" : `${animationOrder * (isConnecting ? 90 : 60)}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
