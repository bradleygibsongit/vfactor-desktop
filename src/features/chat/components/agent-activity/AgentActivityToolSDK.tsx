/**
 * AgentActivityToolSDK - Compact inline tool row for OpenCode SDK tool calls.
 *
 * Shows:
 * - Icon based on tool name
 * - Tool name and title badge
 * - Status indicator (spinner / check / error)
 * - Expandable section with pretty-printed Input and Output
 */

import { useState } from "react"
import {
  FileText,
  PencilSimple,
  Trash,
  FolderOpen,
  MagnifyingGlass,
  Terminal,
  Brain,
  Globe,
  CircleDashed,
  CircleNotch,
  GitDiff,
} from "@phosphor-icons/react"
import type { ToolPart, ToolState } from "@opencode-ai/sdk/client"
import { cn } from "@/lib/utils"

interface AgentActivityToolSDKProps {
  toolPart: ToolPart
  className?: string
}

type ToolKind = "read" | "edit" | "delete" | "move" | "search" | "execute" | "think" | "fetch" | "diff" | "unknown"

/**
 * Infer tool kind from tool name.
 */
function inferToolKind(toolName: string): ToolKind {
  const name = toolName.toLowerCase()

  if (name.includes("read") || name.includes("cat") || name.includes("view")) {
    return "read"
  }
  if (name.includes("edit") || name.includes("write") || name.includes("patch")) {
    return "edit"
  }
  if (name.includes("delete") || name.includes("remove") || name.includes("rm")) {
    return "delete"
  }
  if (name.includes("move") || name.includes("mv") || name.includes("rename")) {
    return "move"
  }
  if (name.includes("search") || name.includes("find") || name.includes("grep") || name.includes("glob")) {
    return "search"
  }
  if (name.includes("bash") || name.includes("shell") || name.includes("exec") || name.includes("terminal")) {
    return "execute"
  }
  if (name.includes("think") || name.includes("reason") || name.includes("plan")) {
    return "think"
  }
  if (name.includes("fetch") || name.includes("web") || name.includes("http") || name.includes("url")) {
    return "fetch"
  }
  if (name.includes("diff")) {
    return "diff"
  }

  return "unknown"
}

/**
 * Get human-readable tool label.
 */
function getToolLabel(kind: ToolKind, state: ToolState): string {
  // Use title from state if available (e.g. "Read 456 lines")
  if ("title" in state && state.title) {
    return state.title
  }

  switch (kind) {
    case "read":
      return "Read"
    case "edit":
      return "Edit"
    case "delete":
      return "Delete"
    case "move":
      return "Move"
    case "search":
      return "Search"
    case "execute":
      return "Shell"
    case "think":
      return "Think"
    case "fetch":
      return "Fetch"
    case "diff":
      return "Workspace Diff"
    default:
      return "Tool"
  }
}

/**
 * Render the tool kind icon.
 */
function ToolKindIcon({ kind, className }: { kind: ToolKind; className?: string }) {
  const iconClass = cn("size-4 shrink-0", className)

  switch (kind) {
    case "read":
      return <FileText className={iconClass} />
    case "edit":
      return <PencilSimple className={iconClass} />
    case "delete":
      return <Trash className={iconClass} />
    case "move":
      return <FolderOpen className={iconClass} />
    case "search":
      return <MagnifyingGlass className={iconClass} />
    case "execute":
      return <Terminal className={iconClass} />
    case "think":
      return <Brain className={iconClass} />
    case "fetch":
      return <Globe className={iconClass} />
    case "diff":
      return <GitDiff className={iconClass} />
    default:
      return <CircleDashed className={iconClass} />
  }
}

/**
 * Extract a short summary chip from input (e.g. file path, URL, command).
 */
function getInputChip(input: Record<string, unknown>): string | null {
  // Common input keys that make good chips
  const chipKeys = ["file_path", "filePath", "path", "url", "command", "pattern", "query"]
  for (const key of chipKeys) {
    const val = input[key]
    if (typeof val === "string" && val.trim()) {
      // Shorten long paths to last 2 segments
      if (key.toLowerCase().includes("path") || key === "file_path") {
        const parts = val.split("/")
        if (parts.length > 2) {
          return parts.slice(-2).join("/")
        }
      }
      return val
    }
  }
  return null
}

/**
 * Pretty-print JSON for display.
 */
function prettyJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

export function AgentActivityToolSDK({
  toolPart,
  className,
}: AgentActivityToolSDKProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const kind = inferToolKind(toolPart.tool)
  const label = getToolLabel(kind, toolPart.state)
  const isActive = toolPart.state.status === "pending" || toolPart.state.status === "running"
  const isFailed = toolPart.state.status === "error"
  const isCompleted = toolPart.state.status === "completed"

  // Input is available on all states
  const input = toolPart.state.input
  const inputChip = getInputChip(input)

  // Output only on completed/error
  const output =
    toolPart.state.status === "completed"
      ? toolPart.state.output
      : toolPart.state.status === "error"
        ? toolPart.state.error
        : null

  const canExpand = isCompleted || isFailed

  return (
    <div className={cn("text-sm", className)}>
      {/* Compact row */}
      <button
        type="button"
        onClick={() => canExpand && setIsExpanded(!isExpanded)}
        disabled={!canExpand}
        className={cn(
          "flex items-center gap-2 text-left w-full",
          canExpand && "cursor-pointer hover:opacity-80",
          !canExpand && "cursor-default"
        )}
      >
        {/* Icon */}
        <ToolKindIcon kind={kind} className="text-muted-foreground" />

        {/* Label */}
        <span className={cn("font-medium", isFailed && "text-destructive")}>
          {label}
        </span>

        {/* Input chip (e.g. file path) */}
        {inputChip && (
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground font-mono truncate max-w-[300px]">
            {inputChip}
          </code>
        )}

        {/* Spinner for active */}
        {isActive && (
          <CircleNotch className="size-3.5 shrink-0 animate-spin text-muted-foreground ml-auto" />
        )}
      </button>

      {/* Expanded section */}
      {isExpanded && canExpand && (
        <div className="mt-2 ml-6 space-y-3 text-xs">
          {/* Input */}
          <div>
            <div className="text-muted-foreground mb-1 font-medium">Input</div>
            <pre className="bg-muted/50 rounded p-2 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-mono">
              {prettyJson(input)}
            </pre>
          </div>

          {/* Output */}
          {output && (
            <div>
              <div className={cn("mb-1 font-medium", isFailed ? "text-destructive" : "text-muted-foreground")}>
                {isFailed ? "Error" : "Output"}
              </div>
              <pre
                className={cn(
                  "bg-muted/50 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono",
                  isFailed && "text-destructive"
                )}
              >
                {output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
