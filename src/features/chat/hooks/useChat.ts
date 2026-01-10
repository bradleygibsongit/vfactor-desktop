import { useState, useCallback, useEffect } from "react"
import { useProjectStore } from "@/features/workspace/store"
import { useChatStore, type MessageWithParts } from "../store"
import type { ChatStatus } from "../types"
import type { Session } from "@opencode-ai/sdk/client"

/**
 * Chat hook connected to OpenCode SDK via chatStore.
 * Automatically syncs with the selected project.
 */
export function useChat() {
  const [input, setInput] = useState("")

  // Project state
  const { projects, selectedProjectId } = useProjectStore()
  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  // Chat store state
  const {
    currentMessages,
    status,
    error,
    isLoading,
    client,
    initialize,
    getProjectChat,
    loadSessionsForProject,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    abortSession,
  } = useChatStore()

  // Get current project's chat state
  const projectChat = selectedProjectId ? getProjectChat(selectedProjectId) : null
  const activeSessionId = projectChat?.activeSessionId ?? null
  const sessions = projectChat?.sessions ?? []

  // Initialize chat store on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Load sessions when project changes
  useEffect(() => {
    if (selectedProjectId && selectedProject?.path && client) {
      loadSessionsForProject(selectedProjectId, selectedProject.path)
    }
  }, [selectedProjectId, selectedProject?.path, client, loadSessionsForProject])

  // Handle message submission
  const handleSubmit = useCallback(
    async (text: string, sessionIdOverride?: string) => {
      const targetSessionId = sessionIdOverride ?? activeSessionId
      
      if (!text.trim() || status === "streaming" || !targetSessionId) {
        return
      }

      setInput("")
      await sendMessage(targetSessionId, text)
    },
    [status, activeSessionId, sendMessage]
  )

  // Handle creating a new session
  const handleCreateSession = useCallback(async () => {
    if (!selectedProjectId || !selectedProject?.path) return null
    return createSession(selectedProjectId, selectedProject.path)
  }, [selectedProjectId, selectedProject?.path, createSession])

  // Handle selecting a session
  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      if (!selectedProjectId) return
      await selectSession(selectedProjectId, sessionId)
    },
    [selectedProjectId, selectSession]
  )

  // Handle deleting a session
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (!selectedProjectId) return
      await deleteSession(selectedProjectId, sessionId)
    },
    [selectedProjectId, deleteSession]
  )

  // Handle abort
  const handleAbort = useCallback(async () => {
    if (!activeSessionId) return
    await abortSession(activeSessionId)
  }, [activeSessionId, abortSession])

  // Convert SDK messages to UI format
  const uiStatus: ChatStatus = status === "connecting" ? "idle" : status

  return {
    // Message state
    messages: currentMessages,
    status: uiStatus,
    input,
    setInput,
    handleSubmit,

    // Session state
    sessions,
    activeSessionId,
    activeSession: sessions.find((s) => s.id === activeSessionId) ?? null,

    // Session actions
    createSession: handleCreateSession,
    selectSession: handleSelectSession,
    deleteSession: handleDeleteSession,
    abort: handleAbort,

    // Project context
    selectedProject,

    // Connection state
    isConnected: !!client,
    isConnecting: status === "connecting",
    isLoading,
    error,
  }
}

export type { MessageWithParts, Session }
