import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { Project } from "@/features/workspace/types"
import type { ChildSessionState, MessageWithParts, RuntimePrompt } from "../types"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "./ai-elements/conversation"
import {
  Message as MessageComponent,
  MessageContent,
} from "./ai-elements/message"
import type { ChildSessionData } from "./agent-activity/AgentActivitySubagent"
import { CaretDown, CaretRight, Plus } from "@/components/icons"
import { LoadingDots } from "@/features/shared/components/ui/loading-dots"
import { ProjectSelectorDropdown } from "@/features/workspace/components/ProjectSelectorDropdown"
import { getAgentAvatarUrl } from "@/features/workspace/utils/avatar"
import { useStickToBottomContext } from "use-stick-to-bottom"
import { isRuntimeApprovalPrompt } from "../domain/runtimePrompts"
import { ChatTimelineItem, InlineSubagentActivity, ToolTimelineRow } from "./ChatTimelineItem"
import { formatElapsedDuration, useElapsedDuration } from "./workDuration"
import {
  buildTimelineBlocks,
  getFileChangeEntries,
  getActivityGroupSummary,
  getToolPartFromMessage,
  isActivityGroupActive,
  type TimelineActivityGroupBlock,
} from "./timelineActivity"

interface ChatMessagesProps {
  threadKey: string
  messages: MessageWithParts[]
  status: "idle" | "streaming" | "error"
  activePrompt?: RuntimePrompt | null
  selectedProject?: Project | null
  childSessions?: Map<string, ChildSessionState>
  showInlineIntro?: boolean
}

function StaticConversation({
  children,
  resetKey,
}: {
  children: ReactNode
  resetKey: string
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [resetKey])

  return (
    <div
      ref={scrollRef}
      className="app-scrollbar h-full overflow-y-auto overscroll-none"
    >
      {children}
    </div>
  )
}

interface ChatEmptyStateProps {
  selectedProject?: Project | null
}

function countDiffLines(diff: string | undefined): { added: number; removed: number } {
  if (!diff) {
    return { added: 0, removed: 0 }
  }

  return diff.split("\n").reduce(
    (totals, line) => {
      if (line.startsWith("+++ ") || line.startsWith("--- ")) {
        return totals
      }
      if (line.startsWith("+")) {
        return { ...totals, added: totals.added + 1 }
      }
      if (line.startsWith("-")) {
        return { ...totals, removed: totals.removed + 1 }
      }
      return totals
    },
    { added: 0, removed: 0 }
  )
}

function ChatEmptyState({ selectedProject }: ChatEmptyStateProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex w-full items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-[520px] flex-col items-center text-center">
        {selectedProject ? (
          <img
            src={getAgentAvatarUrl(selectedProject.avatarSeed)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-[28%] border border-border/70 object-cover shadow-sm sm:h-20 sm:w-20"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[28%] border border-border/70 bg-card text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground sm:h-20 sm:w-20">
            Agent
          </div>
        )}

        <h2
          className="mt-5 text-3xl font-medium tracking-[0.08em] text-foreground sm:text-4xl"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          Let&apos;s get to work
        </h2>

        <ProjectSelectorDropdown
          selectedProject={selectedProject}
          open={isOpen}
          onOpenChange={setIsOpen}
          sideOffset={12}
          contentClassName="w-72"
          trigger={
            <div className="mt-4 inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground">
              <span className="max-w-[320px] truncate text-[1.35rem] font-medium leading-none tracking-tight sm:text-[1.6rem]">
                {selectedProject?.name ?? "Select your agent"}
              </span>
              <CaretDown
                size={16}
                className={isOpen ? "shrink-0 rotate-180 transition-transform" : "shrink-0 transition-transform"}
              />
            </div>
          }
        />
      </div>
    </div>
  )
}

export function ChatMessages({
  threadKey,
  messages,
  status,
  activePrompt = null,
  selectedProject: _selectedProject,
  childSessions,
  showInlineIntro = false,
}: ChatMessagesProps) {
  const approvalTimelineMessage = useMemo(() => {
    if (!isRuntimeApprovalPrompt(activePrompt)) {
      return null
    }

    const itemType =
      activePrompt.approval.kind === "fileChange" ? "fileChange" : "commandExecution"
    const messageId = activePrompt.approval.itemId
      ? `approval:${activePrompt.approval.itemId}`
      : `approval:${activePrompt.id}`

    return {
      info: {
        id: messageId,
        sessionId: messageId,
        role: "assistant" as const,
        createdAt: Date.now(),
        turnId: activePrompt.approval.turnId,
        itemType,
      },
      parts: [
        {
          id: `${messageId}:tool`,
          type: "tool" as const,
          messageId,
          sessionId: messageId,
          tool: itemType === "fileChange" ? "fileChange" : "command/exec",
          state: {
            status: "pending" as const,
            title:
              itemType === "fileChange"
                ? "Apply file changes"
                : activePrompt.approval.command ?? "Run command",
            subtitle: activePrompt.approval.cwd,
            input:
              itemType === "fileChange"
                ? {
                    reason: activePrompt.approval.reason,
                  }
                : {
                    command: activePrompt.approval.command,
                    cwd: activePrompt.approval.cwd,
                    commandActions: activePrompt.approval.commandActions,
                  },
            output:
              itemType === "fileChange"
                ? {
                    changes: activePrompt.approval.changes ?? [],
                    outputText: null,
                  }
                : undefined,
          },
        },
      ],
    }
  }, [activePrompt])
  const renderedMessages = useMemo(
    () => (approvalTimelineMessage ? [...messages, approvalTimelineMessage] : messages),
    [approvalTimelineMessage, messages]
  )
  const timelineBlocks = useMemo(
    () => buildTimelineBlocks(renderedMessages),
    [renderedMessages]
  )
  const activityGroups = useMemo(
    () => timelineBlocks.filter((block): block is TimelineActivityGroupBlock => block.type === "activityGroup"),
    [timelineBlocks]
  )
  const [groupOpenByKey, setGroupOpenByKey] = useState<Record<string, boolean>>({})
  const autoCollapsedGroupKeysRef = useRef<Set<string>>(new Set())
  const hasContent = renderedMessages.length > 0
  const lastMessage = renderedMessages[renderedMessages.length - 1]
  const shouldRenderStreamingPlaceholder =
    status === "streaming" && !activePrompt && (!lastMessage || lastMessage.info.role === "user")
  const [activeWorkStartTime, setActiveWorkStartTime] = useState<number | null>(null)
  const [lastCompletedWork, setLastCompletedWork] = useState<{
    messageId: string
    durationMs: number
  } | null>(null)
  const previousStatusRef = useRef(status)
  const lastAssistantTextMessageId = useMemo(
    () =>
      [...renderedMessages]
        .reverse()
        .find(
          (message) =>
            message.info.role === "assistant" &&
            message.parts.some((part) => part.type === "text" && part.text.trim())
        )?.info.id ?? null,
    [renderedMessages]
  )
  const changedFilesSummaryByMessageId = useMemo(() => {
    const summaryByMessageId = new Map<
      string,
      { fileCount: number; label: string; added: number; removed: number }
    >()

    for (const message of renderedMessages) {
      if (message.info.role !== "assistant") {
        continue
      }

      const hasText = message.parts.some((part) => part.type === "text" && part.text.trim())
      if (!hasText || !message.info.turnId) {
        continue
      }

      const changeTotals = new Map<string, { added: number; removed: number }>()

      for (const candidate of renderedMessages) {
        if (candidate.info.turnId !== message.info.turnId || candidate.info.itemType !== "fileChange") {
          continue
        }

        const toolPart = getToolPartFromMessage(candidate)
        const output = toolPart?.state.output
        const source =
          output && typeof output === "object" && "changes" in output
            ? (output as { changes?: unknown[] }).changes
            : undefined
        const fileChanges = getFileChangeEntries(source)

        for (const change of fileChanges) {
          const current = changeTotals.get(change.path) ?? { added: 0, removed: 0 }
          const diffTotals = countDiffLines(change.diff)

          changeTotals.set(change.path, {
            added: current.added + diffTotals.added,
            removed: current.removed + diffTotals.removed,
          })
        }
      }

      if (changeTotals.size === 0) {
        continue
      }

      const entries = Array.from(changeTotals.entries())
      const [firstPath] = entries[0]
      const totalAdded = entries.reduce((sum, [, totals]) => sum + totals.added, 0)
      const totalRemoved = entries.reduce((sum, [, totals]) => sum + totals.removed, 0)

      summaryByMessageId.set(message.info.id, {
        fileCount: entries.length,
        label:
          entries.length === 1
            ? firstPath.split(/[\\/]/).filter(Boolean).at(-1) ?? firstPath
            : `${entries.length} files`,
        added: totalAdded,
        removed: totalRemoved,
      })
    }

    return summaryByMessageId
  }, [renderedMessages])
  const completedWorkDurationByMessageId = useMemo(() => {
    const earliestTimestampByTurnId = new Map<string, number>()
    const durationByMessageId = new Map<string, number>()

    for (const message of renderedMessages) {
      const turnId = message.info.turnId
      if (!turnId) {
        continue
      }

      const existingTimestamp = earliestTimestampByTurnId.get(turnId)
      const nextTimestamp =
        existingTimestamp == null
          ? message.info.createdAt
          : Math.min(existingTimestamp, message.info.createdAt)
      earliestTimestampByTurnId.set(turnId, nextTimestamp)
    }

    for (const message of renderedMessages) {
      if (message.info.role !== "assistant") {
        continue
      }

      const hasText = message.parts.some((part) => part.type === "text" && part.text.trim())
      if (!hasText) {
        continue
      }

      const turnId = message.info.turnId
      if (!turnId) {
        continue
      }

      const startTime = earliestTimestampByTurnId.get(turnId)
      if (startTime == null) {
        continue
      }

      durationByMessageId.set(message.info.id, Math.max(0, message.info.createdAt - startTime))
    }

    return durationByMessageId
  }, [renderedMessages])

  useEffect(() => {
    const activeGroupKeys = activityGroups
      .filter((group) => isActivityGroupActive(group))
      .map((group) => group.key)

    if (activeGroupKeys.length === 0) {
      return
    }

    for (const key of activeGroupKeys) {
      autoCollapsedGroupKeysRef.current.delete(key)
    }

    setGroupOpenByKey((previous) => {
      let nextState = previous

      for (const key of activeGroupKeys) {
        if (previous[key] === true) {
          continue
        }

        if (nextState === previous) {
          nextState = { ...previous }
        }
        nextState[key] = true
      }

      return nextState
    })
  }, [activityGroups])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const timeoutIds = activityGroups.flatMap((group) => {
      if (isActivityGroupActive(group) || autoCollapsedGroupKeysRef.current.has(group.key)) {
        return []
      }

      return [
        window.setTimeout(() => {
          autoCollapsedGroupKeysRef.current.add(group.key)
          setGroupOpenByKey((previous) =>
            previous[group.key] === false ? previous : { ...previous, [group.key]: false }
          )
        }, 300),
      ]
    })

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [activityGroups])

  useEffect(() => {
    const previousStatus = previousStatusRef.current

    if (previousStatus !== "streaming" && status === "streaming") {
      setActiveWorkStartTime(Date.now())
      setLastCompletedWork(null)
    }

    if (previousStatus === "streaming" && status !== "streaming" && activeWorkStartTime != null) {
      const lastAssistantMessage = [...renderedMessages]
        .reverse()
        .find(
          (message) =>
            message.info.role === "assistant" &&
            message.parts.some((part) => part.type === "text" && part.text.trim())
        )

      if (lastAssistantMessage) {
        setLastCompletedWork({
          messageId: lastAssistantMessage.info.id,
          durationMs: Date.now() - activeWorkStartTime,
        })
      }

      setActiveWorkStartTime(null)
    }

    previousStatusRef.current = status
  }, [activeWorkStartTime, renderedMessages, status])

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
  const hasCollabTimelineItem = useMemo(
    () => messages.some((message) => message.info.itemType === "collabAgentToolCall"),
    [messages]
  )
  const orphanChildSessions = useMemo(() => {
    if (!childSessionData || childSessionData.size === 0 || hasCollabTimelineItem) {
      return []
    }

    return Array.from(childSessionData.values())
  }, [childSessionData, hasCollabTimelineItem])
  const [preparedThreadKey, setPreparedThreadKey] = useState(threadKey)
  const isThreadPrepared = preparedThreadKey === threadKey

  if (!hasContent) {
    if (!showInlineIntro) {
      return (
        <StaticConversation resetKey={_selectedProject?.id ?? "empty-chat"}>
          <div className="min-h-full" />
        </StaticConversation>
      )
    }

    return (
      <StaticConversation resetKey={_selectedProject?.id ?? "empty-chat"}>
        <div className="mx-auto flex min-h-full w-full items-center justify-center px-10 py-10">
          <ChatEmptyState key={_selectedProject?.id ?? "empty-chat"} selectedProject={_selectedProject} />
        </div>
      </StaticConversation>
    )
  }

  return (
    <Conversation
      key={threadKey}
      className={isThreadPrepared ? "h-full" : "h-full invisible"}
    >
      <ChatAutoScroll
        threadKey={threadKey}
        messages={messages}
        status={status}
        onThreadPrepared={setPreparedThreadKey}
      />
      <ConversationContent className="mx-auto w-full max-w-[803px] px-10 pb-10">
        <>
          {showInlineIntro ? <ChatEmptyState selectedProject={_selectedProject} /> : null}
          {timelineBlocks.map((block) =>
            block.type === "message" ? (
              <ChatTimelineItem
                key={block.key}
                message={block.message}
                isStreaming={status === "streaming" && block.message.info.id === lastMessage?.info.id}
                showCopyAction={block.message.info.id === lastAssistantTextMessageId}
                changedFilesSummary={changedFilesSummaryByMessageId.get(block.message.info.id)}
                childSessions={childSessionData}
                workStartTime={
                  status === "streaming" && block.message.info.id === lastMessage?.info.id
                    ? activeWorkStartTime ?? undefined
                    : undefined
                }
                completedWorkDurationMs={
                  block.message.info.id === lastCompletedWork?.messageId
                    ? lastCompletedWork.durationMs
                    : completedWorkDurationByMessageId.get(block.message.info.id)
                }
              />
            ) : (
              <TimelineActivityGroup
                key={block.key}
                group={block}
                childSessions={childSessionData}
                isOpen={isActivityGroupActive(block) ? true : groupOpenByKey[block.key] ?? true}
                activeWorkStartTime={activeWorkStartTime ?? undefined}
                onToggle={() =>
                  setGroupOpenByKey((previous) => ({
                    ...previous,
                    [block.key]: !(previous[block.key] ?? true),
                  }))
                }
              />
            )
          )}
          {orphanChildSessions.length > 0 ? (
            <div className="space-y-3">
              {orphanChildSessions.map((childSession) => (
                <InlineSubagentActivity key={childSession.session.id} childSession={childSession} />
              ))}
            </div>
          ) : null}
          {shouldRenderStreamingPlaceholder ? (
            <StreamingAssistantPlaceholder startTime={activeWorkStartTime} />
          ) : null}
        </>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

function ChatAutoScroll({
  threadKey,
  messages,
  status,
  onThreadPrepared,
}: {
  threadKey: string
  messages: MessageWithParts[]
  status: "idle" | "streaming" | "error"
  onThreadPrepared: (threadKey: string) => void
}) {
  const { scrollToBottom, state } = useStickToBottomContext()
  const previousLastMessageIdRef = useRef<string | null>(null)
  const previousStatusRef = useRef<typeof status>(status)

  const lastMessage = messages[messages.length - 1] ?? null
  const lastMessageId = lastMessage?.info.id ?? null

  useLayoutEffect(() => {
    const targetScrollTop = state.calculatedTargetScrollTop
    state.scrollTop = targetScrollTop
    state.lastScrollTop = targetScrollTop
    previousLastMessageIdRef.current = lastMessageId
    previousStatusRef.current = status
    onThreadPrepared(threadKey)
  }, [lastMessageId, onThreadPrepared, state, status, threadKey])

  useEffect(() => {
    const previousLastMessageId = previousLastMessageIdRef.current
    const previousStatus = previousStatusRef.current
    const hasNewMessage = !!lastMessageId && lastMessageId !== previousLastMessageId
    const userJustSentMessage = hasNewMessage && lastMessage?.info.role === "user"
    const agentJustStartedResponding = status === "streaming" && previousStatus !== "streaming"

    if (userJustSentMessage || agentJustStartedResponding) {
      requestAnimationFrame(() => {
        void scrollToBottom("instant")
      })
    }

    previousLastMessageIdRef.current = lastMessageId
    previousStatusRef.current = status
  }, [lastMessage?.info.role, lastMessageId, scrollToBottom, status])

  return null
}

function TimelineActivityGroup({
  group,
  childSessions,
  isOpen,
  activeWorkStartTime,
  onToggle,
}: {
  group: TimelineActivityGroupBlock
  childSessions?: Map<string, ChildSessionData>
  isOpen: boolean
  activeWorkStartTime?: number
  onToggle: () => void
}) {
  const isActive = isActivityGroupActive(group)
  const summary = getActivityGroupSummary(group)
  const activeDuration = useElapsedDuration(activeWorkStartTime, isActive)

  return (
    <MessageComponent from="assistant">
      <MessageContent>
        <div className="w-full text-sm leading-5 text-muted-foreground">
          {isActive ? (
            <div className="inline-flex max-w-full items-center gap-1.5 text-left">
              <span className="min-w-0">{summary}</span>
              {activeDuration ? (
                <span className="shrink-0 text-muted-foreground/80">· {activeDuration}</span>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex max-w-full items-center gap-1.5 text-left"
            >
              <span className="min-w-0">{summary}</span>
              <span className="shrink-0 text-muted-foreground">
                {isOpen ? <CaretDown className="size-4" /> : <CaretRight className="size-4" />}
              </span>
            </button>
          )}
          {isOpen ? (
            <div className="mt-2 space-y-2 border-l border-border/60 pl-4">
              {group.messages.map((message) => {
                const toolPart = getToolPartFromMessage(message)
                if (!toolPart) {
                  return null
                }

                return (
                  <ToolTimelineRow
                    key={message.info.id}
                    message={message}
                    toolPart={toolPart}
                    childSessions={childSessions}
                    withinGroup
                  />
                )
              })}
            </div>
          ) : null}
        </div>
      </MessageContent>
    </MessageComponent>
  )
}

function StreamingAssistantPlaceholder({
  startTime,
}: {
  startTime: number | null
}) {
  const elapsed = useElapsedDuration(startTime, true)

  return (
    <MessageComponent from="assistant">
      <MessageContent>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <LoadingDots />
          <span className="tabular-nums">{elapsed ?? formatElapsedDuration(0)}</span>
        </div>
      </MessageContent>
    </MessageComponent>
  )
}
