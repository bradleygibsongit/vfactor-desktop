/**
 * AgentActivityTool - Expandable card for a tool call.
 *
 * Shows:
 * - Icon based on tool kind
 * - Tool name and title
 * - Status indicator
 * - Expandable content (output, diff, etc.)
 */

import { useState } from "react";
import {
  FileText,
  Pencil,
  Trash2,
  FolderInput,
  Search,
  Terminal,
  Brain,
  Globe,
  CircleDot,
  CheckCircle2,
  XCircle,
  ChevronUpIcon,
  ChevronDownIcon,
  Loader2,
} from "lucide-react";
import type { ToolCallState, ToolKind, ToolCallContent } from "../../types";
import { cn } from "@/lib/utils";

interface AgentActivityToolProps {
  toolCall: ToolCallState;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Get human-readable tool type name.
 */
function getToolTypeName(kind?: ToolKind): string {
  switch (kind) {
    case "read":
      return "Read";
    case "edit":
      return "Edit";
    case "delete":
      return "Delete";
    case "move":
      return "Move";
    case "search":
      return "Search";
    case "execute":
      return "Shell";
    case "think":
      return "Think";
    case "fetch":
      return "Fetch";
    default:
      return "Tool";
  }
}

/**
 * Render tool call content (output, diff, terminal reference).
 */
function ToolContent({ content }: { content: ToolCallContent[] }) {
  if (content.length === 0) return null;

  return (
    <div className="mt-2 space-y-2 text-xs">
      {content.map((item, index) => {
        if (item.type === "content") {
          const block = item.content;
          if (block.type === "text") {
            return (
              <pre
                key={index}
                className="bg-muted/50 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words"
              >
                {block.text}
              </pre>
            );
          }
          return null;
        }

        if (item.type === "diff") {
          return (
            <div key={index} className="bg-muted/50 rounded p-2 overflow-x-auto">
              <div className="text-muted-foreground mb-1">{item.path}</div>
              <pre className="text-red-400 line-through">{item.oldText || "(empty)"}</pre>
              <pre className="text-green-400">{item.newText || "(empty)"}</pre>
            </div>
          );
        }

        if (item.type === "terminal") {
          return (
            <div key={index} className="text-muted-foreground">
              Terminal: {item.terminalId}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/**
 * Render the tool kind icon based on kind.
 */
function ToolKindIcon({ kind }: { kind?: ToolKind }) {
  const iconClass = "size-4 text-muted-foreground shrink-0";

  switch (kind) {
    case "read":
      return <FileText className={iconClass} />;
    case "edit":
      return <Pencil className={iconClass} />;
    case "delete":
      return <Trash2 className={iconClass} />;
    case "move":
      return <FolderInput className={iconClass} />;
    case "search":
      return <Search className={iconClass} />;
    case "execute":
      return <Terminal className={iconClass} />;
    case "think":
      return <Brain className={iconClass} />;
    case "fetch":
      return <Globe className={iconClass} />;
    default:
      return <CircleDot className={iconClass} />;
  }
}

/**
 * Render the status icon based on tool call status.
 */
function ToolStatusIcon({ status }: { status: ToolCallState["status"] }) {
  const isActive = status === "pending" || status === "in_progress";
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  if (isActive) {
    return <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />;
  }
  if (isFailed) {
    return <XCircle className="size-4 shrink-0 text-destructive" />;
  }
  if (isCompleted) {
    return <CheckCircle2 className="size-4 shrink-0 text-green-500" />;
  }
  return <CircleDot className="size-4 shrink-0" />;
}

export function AgentActivityTool({
  toolCall,
  className,
  children,
}: AgentActivityToolProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeName = getToolTypeName(toolCall.kind);
  const isFailed = toolCall.status === "failed";
  const hasContent = toolCall.content.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        isFailed && "border-destructive/50",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors rounded-lg"
      >
        <ToolKindIcon kind={toolCall.kind} />
        <span className="font-medium text-sm shrink-0">{typeName}</span>
        <span className="text-sm text-muted-foreground truncate flex-1">
          {toolCall.title}
        </span>
        <ToolStatusIcon status={toolCall.status} />
        {hasContent && (
          isExpanded ? (
            <ChevronUpIcon className="size-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDownIcon className="size-4 text-muted-foreground shrink-0" />
          )
        )}
      </button>

      {isExpanded && hasContent && (
        <div className="px-3 pb-3 border-t border-border/50">
          <ToolContent content={toolCall.content} />
        </div>
      )}

      {children && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
