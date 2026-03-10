import { useState } from "react"
import type { MessageWithParts, ChildSessionState } from "../store"
import type { Project } from "@/features/workspace/types"
import type { RuntimeMessagePart, RuntimeTextPart, RuntimeToolPart } from "../types"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "./ai-elements/conversation"
import {
  Message as MessageComponent,
  MessageContent,
  MessageResponse,
  MessageUserContent,
} from "./ai-elements/message"
import { Loader } from "./ai-elements/loader"
import { AgentActivitySDK } from "./agent-activity/AgentActivitySDK"
import type { ChildSessionData } from "./agent-activity/AgentActivitySubagent"
import { Brain, CaretDown, Folder, Plus } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/shared/components/ui/dropdown-menu"
import { useProjectStore } from "@/features/workspace/store"
import { openFolderPicker } from "@/features/workspace/utils/folderDialog"

interface ChatMessagesProps {
  messages: MessageWithParts[]
  status: "idle" | "streaming" | "error"
  selectedProject?: Project | null
  childSessions?: Map<string, ChildSessionState>
}

/**
 * Extract text from message parts.
 */
function getMessageText(parts: RuntimeMessagePart[]): string {
  return parts
    .filter((p): p is RuntimeTextPart => p.type === "text")
    .map((p) => p.text)
    .join("")
}

/**
 * Get tool parts from message parts.
 */
function getToolParts(parts: RuntimeMessagePart[]): RuntimeToolPart[] {
  return parts.filter((p): p is RuntimeToolPart => p.type === "tool")
}

/**
 * Check if a message has any activity (tool calls, multiple content blocks, etc.)
 */
function hasActivity(parts: RuntimeMessagePart[]): boolean {
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
 * Some harnesses create separate messages for each "step" (tool call),
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
  const [isOpen, setIsOpen] = useState(false)
  const { projects, selectProject, addProject } = useProjectStore()

  const handleSelectProject = async (projectId: string) => {
    await selectProject(projectId)
    setIsOpen(false)
  }

  const handleAddProject = async () => {
    const folderPath = await openFolderPicker()
    if (!folderPath) {
      return
    }

    await addProject(folderPath)
    setIsOpen(false)
  }

  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      <Brain className="size-14 text-foreground/90" />
      <h1
        className="text-3xl leading-none tracking-[0.02em] text-foreground sm:text-4xl"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        Let&apos;s get to work
      </h1>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="inline-flex cursor-pointer items-center justify-center gap-1.5 align-middle text-2xl font-semibold leading-none text-foreground outline-none transition-opacity hover:opacity-80 sm:text-[2rem]">
          <span className="block leading-none">{selectedProject?.name ?? "Select your project"}</span>
          <CaretDown
            size={18}
            className={isOpen ? "mt-px shrink-0 rotate-180 self-center transition-transform" : "mt-px shrink-0 self-center transition-transform"}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={10}
          className="w-66 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-lg backdrop-blur-sm"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-2 text-sm font-medium text-muted-foreground">
              Select your project
            </DropdownMenuLabel>
            {projects.length > 0 ? (
              projects.map((project) => {
                const isSelected = project.id === selectedProject?.id

                return (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => void handleSelectProject(project.id)}
                    className="min-h-9 rounded-xl px-2 py-2 text-sm font-medium text-foreground"
                  >
                    <Folder size={14} className="text-muted-foreground" />
                    <span className="truncate">{project.name}</span>
                    {isSelected ? <span className="ml-auto text-sm text-foreground">✓</span> : null}
                  </DropdownMenuItem>
                )
              })
            ) : (
              <div className="px-2 py-2 text-sm text-muted-foreground">No projects yet</div>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            onClick={() => void handleAddProject()}
            className="min-h-9 rounded-xl px-2 py-2 text-sm font-medium text-foreground"
          >
            <Plus size={14} className="text-muted-foreground" />
            <span>Add new project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ChatMessages({ messages, status, selectedProject: _selectedProject, childSessions }: ChatMessagesProps) {
  const hasContent = messages.length > 0
  const groups = groupMessages(messages)

  // Convert ChildSessionState to ChildSessionData for the component
  const childSessionData: Map<string, ChildSessionData> | undefined = childSessions 
    ? new Map(
        Array.from(childSessions.entries()).map(([id, state]) => [
          id,
          {
            session: state.session,
            toolParts: state.toolParts,
            isActive: state.isActive,
          },
        ])
      )
    : undefined

  return (
    <Conversation className="h-full">
      <ConversationContent className="px-10 pb-4">
        {!hasContent ? (
          <ChatEmptyState selectedProject={_selectedProject} />
        ) : (
          <>
            {groups.map((group, groupIndex) => {
              const isLastGroup = groupIndex === groups.length - 1

              if (group.type === "user") {
                const text = getMessageText(group.message.parts)
                // Don't render empty user messages
                if (!text.trim()) {
                  return null
                }
                return (
                  <MessageComponent key={group.message.info.id} from="user">
                    <MessageContent>
                      <MessageUserContent>{text}</MessageUserContent>
                    </MessageContent>
                  </MessageComponent>
                )
              }

              // Assistant message group - only pass child sessions to the last group
              const isStreaming = status === "streaming" && isLastGroup
              const groupKey = group.messages.map((m) => m.info.id).join("-")

              return (
                <AssistantMessageGroup
                  key={groupKey}
                  messages={group.messages}
                  isStreaming={isStreaming}
                  childSessions={isLastGroup ? childSessionData : undefined}
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
interface AssistantMessageGroupProps {
  messages: MessageWithParts[]
  isStreaming: boolean
  childSessions?: Map<string, ChildSessionData>
}

/**
 * Renders a group of assistant messages with a single AgentActivity dropdown
 * for all tool calls, plus the final response text.
 */
function AssistantMessageGroup({ messages, isStreaming, childSessions }: AssistantMessageGroupProps) {
  // Combine all parts from all messages in the group
  const allParts = messages.flatMap((m) => m.parts)
  
  // Get text from all messages (usually only the last one has final text)
  const text = getMessageText(allParts)
  const hasChildSessions = childSessions && childSessions.size > 0
  const showActivity = hasActivity(allParts) || isStreaming || hasChildSessions

  // Check if the last message in the group is finished
  const lastMessage = messages[messages.length - 1]
  const assistantInfo = lastMessage.info
  const showFinalText = !isStreaming && text && (!showActivity || assistantInfo.finishReason === "end_turn")

  return (
    <MessageComponent from="assistant">
      <MessageContent>
        {showActivity && (
          <AgentActivitySDK
            parts={allParts}
            isStreaming={isStreaming}
            childSessions={childSessions}
            className="mb-6"
          />
        )}

        {showFinalText ? (
          <MessageResponse isStreaming={isStreaming} className="leading-relaxed [&>p]:mb-4">{text}</MessageResponse>
        ) : (
          isStreaming && !text && !showActivity && <Loader className="mt-2" />
        )}
      </MessageContent>
    </MessageComponent>
  )
}
