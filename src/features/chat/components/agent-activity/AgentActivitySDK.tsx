/**
 * AgentActivitySDK - Agent activity component for OpenCode SDK messages.
 *
 * Renders all intermediate activity (text, tool calls) inline.
 */

import type { Part, TextPart, ToolPart } from "@opencode-ai/sdk/client"
import { cn } from "@/lib/utils"

import { AgentActivityToolSDK } from "./AgentActivityToolSDK"
import { AgentActivityText } from "./AgentActivityText"

interface AgentActivitySDKProps {
  /** Message parts from SDK */
  parts: Part[]
  /** Whether the message is still streaming */
  isStreaming: boolean
  className?: string
}

export function AgentActivitySDK({
  parts,
  isStreaming,
  className,
}: AgentActivitySDKProps) {
  // Build rendered items - interleave text and tools by their order in parts
  const renderedItems: React.ReactNode[] = []
  let currentTextGroup: string[] = []

  const flushTextGroup = () => {
    if (currentTextGroup.length > 0) {
      const text = currentTextGroup.join("")
      if (text.trim()) {
        renderedItems.push(
          <AgentActivityText
            key={`text-${renderedItems.length}`}
            text={text}
            className="my-2"
          />
        )
      }
      currentTextGroup = []
    }
  }

  for (const part of parts) {
    if (part.type === "text") {
      currentTextGroup.push((part as TextPart).text)
    } else if (part.type === "tool") {
      flushTextGroup()
      renderedItems.push(
        <AgentActivityToolSDK
          key={`tool-${part.id}`}
          toolPart={part as ToolPart}
          className="my-2"
        />
      )
    }
  }
  flushTextGroup()

  if (renderedItems.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-1", className)}>
      {renderedItems}
    </div>
  )
}
