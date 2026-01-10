import type { MessageWithParts } from "../store"
import type { Project } from "@/features/workspace/types"
import type { TextPart, ToolPart, Part } from "@opencode-ai/sdk/client"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "./ai-elements/conversation"
import {
  Message as MessageComponent,
  MessageContent,
  MessageResponse,
} from "./ai-elements/message"
import { Loader } from "./ai-elements/loader"
import { AgentActivitySDK } from "./agent-activity/AgentActivitySDK"
import {
  Folder,
  GitBranch,
  CaretDown,
  PencilSimple,
} from "@phosphor-icons/react"

interface ChatMessagesProps {
  messages: MessageWithParts[]
  status: "idle" | "streaming" | "error"
  selectedProject?: Project | null
}

/**
 * Extract text from SDK message parts.
 */
function getMessageText(parts: Part[]): string {
  return parts
    .filter((p): p is TextPart => p.type === "text")
    .map((p) => p.text)
    .join("")
}

/**
 * Get tool parts from SDK message parts.
 */
function getToolParts(parts: Part[]): ToolPart[] {
  return parts.filter((p): p is ToolPart => p.type === "tool")
}

/**
 * Check if a message has any activity (tool calls, multiple content blocks, etc.)
 */
function hasActivity(parts: Part[]): boolean {
  return parts.some((p) => p.type === "tool")
}

/**
 * A group of messages - either a single user message or consecutive assistant messages.
 */
type MessageGroup =
  | { type: "user"; message: MessageWithParts }
  | { type: "assistant"; messages: MessageWithParts[] }

/**
 * Group consecutive assistant messages together.
 * OpenCode creates separate messages for each "step" (tool call),
 * but we want to render them in a single "Show steps" dropdown.
 */
function groupMessages(messages: MessageWithParts[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  let currentAssistantGroup: MessageWithParts[] = []

  const flushAssistantGroup = () => {
    if (currentAssistantGroup.length > 0) {
      groups.push({ type: "assistant", messages: currentAssistantGroup })
      currentAssistantGroup = []
    }
  }

  for (const message of messages) {
    if (message.info.role === "user") {
      flushAssistantGroup()
      groups.push({ type: "user", message })
    } else {
      currentAssistantGroup.push(message)
    }
  }

  flushAssistantGroup()
  return groups
}

interface ChatEmptyStateProps {
  selectedProject?: Project | null
}

function ChatEmptyState({ selectedProject }: ChatEmptyStateProps) {
  const projectPath = selectedProject?.path ?? ""
  const pathParts = projectPath.split("/")
  const folderName = pathParts.pop() || "No project selected"
  const parentPath = pathParts.length > 0 ? pathParts.join("/") + "/" : ""

  return (
    <div className="size-full p-4 space-y-2.5">
      <h1 className="text-xl font-light text-muted-foreground/60 mb-3">New session</h1>

      {selectedProject ? (
        <>
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <Folder className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{parentPath}</span>
            <span className="font-semibold">{folderName}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitBranch className="size-3.5" />
            <span>Select a branch or start typing to begin</span>
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">
          Select a project from the sidebar to start chatting
        </div>
      )}
    </div>
  )
}

interface AssistantMessageGroupProps {
  messages: MessageWithParts[]
  isStreaming: boolean
}

/**
 * Renders a group of assistant messages with a single AgentActivity dropdown
 * for all tool calls, plus the final response text.
 */
function AssistantMessageGroup({ messages, isStreaming }: AssistantMessageGroupProps) {
  // Combine all parts from all messages in the group
  const allParts = messages.flatMap((m) => m.parts)
  
  // Get text from all messages (usually only the last one has final text)
  const text = getMessageText(allParts)
  const showActivity = hasActivity(allParts) || isStreaming

  // Check if the last message in the group is finished
  const lastMessage = messages[messages.length - 1]
  const assistantInfo = lastMessage.info as { role: "assistant"; finish?: string }
  const showFinalText = !isStreaming && text && (!showActivity || assistantInfo.finish === "end_turn")

  return (
    <MessageComponent from="assistant">
      <MessageContent>
        {showActivity && (
          <AgentActivitySDK
            parts={allParts}
            isStreaming={isStreaming}
            className="mb-3"
          />
        )}

        {showFinalText ? (
          <MessageResponse>{text}</MessageResponse>
        ) : (
          isStreaming && !text && !showActivity && <Loader className="mt-2" />
        )}
      </MessageContent>
    </MessageComponent>
  )
}

export function ChatMessages({ messages, status, selectedProject }: ChatMessagesProps) {
  const hasContent = messages.length > 0
  const groups = groupMessages(messages)

  return (
    <Conversation className="h-full">
      <ConversationContent className="px-10 pb-32">
        {!hasContent ? (
          <ChatEmptyState selectedProject={selectedProject} />
        ) : (
          <>
            {groups.map((group, groupIndex) => {
              const isLastGroup = groupIndex === groups.length - 1

              if (group.type === "user") {
                const text = getMessageText(group.message.parts)
                return (
                  <MessageComponent key={group.message.info.id} from="user">
                    <MessageContent>
                      <span>{text}</span>
                    </MessageContent>
                  </MessageComponent>
                )
              }

              // Assistant message group
              const isStreaming = status === "streaming" && isLastGroup
              const groupKey = group.messages.map((m) => m.info.id).join("-")

              return (
                <AssistantMessageGroup
                  key={groupKey}
                  messages={group.messages}
                  isStreaming={isStreaming}
                />
              )
            })}
          </>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
