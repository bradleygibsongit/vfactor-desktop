import { create } from "zustand"
import { load, Store } from "@tauri-apps/plugin-store"
import { fetch as tauriFetch } from "@tauri-apps/plugin-http"
import { invoke } from "@tauri-apps/api/core"
import {
  createOpencodeClient,
  type Session,
  type Message,
  type Part,
  type GlobalEvent,
  type EventMessageUpdated,
  type EventMessagePartUpdated,
  type EventSessionCreated,
  type EventSessionUpdated,
  type EventFileWatcherUpdated,
} from "@opencode-ai/sdk/client"

const STORE_FILE = "chat.json"
const OPENCODE_BASE_URL = "http://localhost:4096"

/**
 * Custom fetch wrapper for Tauri that uses tauri-plugin-http
 * 
 * The OpenCode SDK passes a Request object directly to fetch (not separate url + init).
 * We need to extract all properties from the Request object.
 */
const customFetch: typeof globalThis.fetch = async (input, init) => {
  let url: string
  let method: string
  let headers: Record<string, string> | undefined
  let body: string | undefined

  if (input instanceof Request) {
    // SDK passes a Request object - extract properties from it
    url = input.url
    method = input.method
    // Convert Headers to plain object
    const headerObj: Record<string, string> = {}
    input.headers.forEach((value, key) => {
      headerObj[key] = value
    })
    headers = Object.keys(headerObj).length > 0 ? headerObj : undefined
    // Read body if present
    body = input.body ? await input.text() : undefined
  } else {
    // Standard fetch signature with separate url and init
    url = typeof input === "string" ? input : input.toString()
    method = init?.method ?? "GET"
    headers = init?.headers as Record<string, string> | undefined
    body = init?.body as string | undefined
  }

  const response = await tauriFetch(url, {
    method,
    headers,
    body,
  })
  return response
}

/**
 * Start the OpenCode server via Tauri command
 */
async function startOpenCodeServer(): Promise<boolean> {
  try {
    console.log("[chatStore] Starting OpenCode server...")
    const result = await invoke<string>("start_opencode_server")
    console.log("[chatStore] Server start result:", result)
    return true
  } catch (error) {
    console.error("[chatStore] Failed to start OpenCode server:", error)
    return false
  }
}

/**
 * Message with parts for UI rendering
 */
export interface MessageWithParts {
  info: Message
  parts: Part[]
}

/**
 * Per-project chat state
 */
interface ProjectChatState {
  sessions: Session[]
  activeSessionId: string | null
  projectPath?: string
}

/**
 * File change event from OpenCode
 */
export interface FileChangeEvent {
  file: string
  event: "add" | "change" | "unlink"
}

/**
 * File change listener callback
 */
export type FileChangeListener = (event: FileChangeEvent) => void

/**
 * Chat store state
 */
interface ChatState {
  // Per-project chat data
  chatByProject: Record<string, ProjectChatState>
  
  // Current session messages (loaded on demand)
  currentMessages: MessageWithParts[]
  currentSessionId: string | null
  
  // Status
  status: "idle" | "connecting" | "streaming" | "error"
  error: string | null
  isLoading: boolean
  
  // OpenCode client instance
  client: ReturnType<typeof createOpencodeClient> | null
  
  // Event stream abort controller
  eventAbortController: AbortController | null
  
  // File change listeners
  fileChangeListeners: Set<FileChangeListener>

  // Actions
  initialize: () => Promise<void>
  getProjectChat: (projectId: string) => ProjectChatState
  loadSessionsForProject: (projectId: string, projectPath: string) => Promise<void>
  createSession: (projectId: string, projectPath: string) => Promise<Session | null>
  selectSession: (projectId: string, sessionId: string) => Promise<void>
  deleteSession: (projectId: string, sessionId: string) => Promise<void>
  sendMessage: (sessionId: string, text: string) => Promise<void>
  abortSession: (sessionId: string) => Promise<void>
  
  // File change subscription
  onFileChange: (listener: FileChangeListener) => () => void
  
  // Internal
  _persistProjectChat: (projectId: string) => Promise<void>
  _subscribeToEvents: () => Promise<void>
  _unsubscribeFromEvents: () => void
}

let storeInstance: Store | null = null

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE)
  }
  return storeInstance
}

const emptyProjectChat: ProjectChatState = {
  sessions: [],
  activeSessionId: null,
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatByProject: {},
  currentMessages: [],
  currentSessionId: null,
  status: "idle",
  error: null,
  isLoading: true,
  client: null,
  eventAbortController: null,
  fileChangeListeners: new Set<FileChangeListener>(),

  initialize: async () => {
    console.log("[chatStore] Initializing...")
    try {
      // Start the OpenCode server
      const serverStarted = await startOpenCodeServer()
      if (!serverStarted) {
        set({ 
          isLoading: false, 
          error: "Failed to start OpenCode server. Is 'opencode' installed?" 
        })
        return
      }

      // Give the server a moment to fully initialize
      await new Promise(resolve => setTimeout(resolve, 500))

      // Load persisted chat data
      const store = await getStore()
      const persisted = await store.get<Record<string, ProjectChatState>>("chatByProject")
      console.log("[chatStore] Loaded persisted data:", persisted)
      
      // Create OpenCode client with Tauri's fetch
      const client = createOpencodeClient({
        baseUrl: OPENCODE_BASE_URL,
        fetch: customFetch,
      })
      console.log("[chatStore] Created OpenCode client for", OPENCODE_BASE_URL)

      set({
        chatByProject: persisted ?? {},
        client,
        isLoading: false,
      })
      
      await get()._subscribeToEvents()
      console.log("[chatStore] Initialization complete")
    } catch (error) {
      console.error("[chatStore] Failed to initialize:", error)
      set({ isLoading: false, error: String(error) })
    }
  },

  getProjectChat: (projectId: string) => {
    const { chatByProject } = get()
    return chatByProject[projectId] ?? emptyProjectChat
  },

  loadSessionsForProject: async (projectId: string, projectPath: string) => {
    const { client } = get()
    if (!client) {
      console.error("OpenCode client not initialized")
      return
    }

    try {
      set({ status: "connecting" })
      
      // Fetch sessions from OpenCode server for this project directory
      const response = await client.session.list({
        query: { directory: projectPath },
      })

      if (response.data) {
        const allSessions = response.data as Session[]
        
        // Filter sessions to only those belonging to this project directory
        const sessions = allSessions.filter(s => s.directory === projectPath)
        
        // Sort by updated time descending
        sessions.sort((a, b) => b.time.updated - a.time.updated)

        const { chatByProject } = get()
        const projectChat = chatByProject[projectId] ?? emptyProjectChat
        
        // Merge with existing state, preserving activeSessionId if valid
        const activeSessionId = sessions.some(s => s.id === projectChat.activeSessionId)
          ? projectChat.activeSessionId
          : sessions[0]?.id ?? null

        set({
          chatByProject: {
            ...chatByProject,
            [projectId]: {
              sessions,
              activeSessionId,
              projectPath,
            },
          },
          status: "idle",
        })

        // Load messages for active session
        if (activeSessionId) {
          await get().selectSession(projectId, activeSessionId)
        }

        await get()._persistProjectChat(projectId)
        
        // Subscribe to events for this project
        await get()._subscribeToEvents()
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
      set({ status: "error", error: String(error) })
    }
  },

  createSession: async (projectId: string, projectPath: string) => {
    const { client, chatByProject } = get()
    console.log("[chatStore] createSession called", { projectId, projectPath, hasClient: !!client })
    
    if (!client) {
      console.error("[chatStore] OpenCode client not initialized")
      return null
    }

    try {
      set({ status: "connecting" })
      console.log("[chatStore] Calling client.session.create...")

      const response = await client.session.create({
        body: {},
        query: { directory: projectPath },
      })
      console.log("[chatStore] session.create response:", response)
      
      const responseData = response.data as unknown
      let session: Session | null = null
      
      if (Array.isArray(responseData)) {
        const sessions = responseData as Session[]
        if (sessions.length > 0) {
          session = sessions.reduce((newest, current) => {
            const newestTime = newest.time?.created ?? 0
            const currentTime = current.time?.created ?? 0
            return currentTime > newestTime ? current : newest
          })
          console.log("[chatStore] Found newest session from array:", session.id)
        }
      } else if (responseData && typeof responseData === "object") {
        const data = responseData as Record<string, unknown>
        if ("id" in data && typeof data.id === "string") {
          session = data as unknown as Session
          console.log("[chatStore] Got single session:", session.id)
        }
      }
      
      if (!session?.id) {
        console.error("[chatStore] Could not extract session from response:", responseData)
        set({ status: "idle" })
        return null
      }
      
      console.log("[chatStore] Using session:", session.id, session.title)
        
      const projectChat = chatByProject[projectId] ?? emptyProjectChat

      set({
        chatByProject: {
          ...chatByProject,
          [projectId]: {
            sessions: [session, ...projectChat.sessions.filter(s => s.id !== session!.id)],
            activeSessionId: session.id,
            projectPath,
          },
        },
        currentMessages: [],
        currentSessionId: session.id,
        status: "idle",
      })

      await get()._persistProjectChat(projectId)
      return session
    } catch (error) {
      console.error("[chatStore] Failed to create session:", error)
      set({ status: "error", error: String(error) })
      return null
    }
  },

  selectSession: async (projectId: string, sessionId: string) => {
    const { client, chatByProject } = get()
    if (!client) return

    const projectChat = chatByProject[projectId]
    if (!projectChat) return

    // Update active session
    set({
      chatByProject: {
        ...chatByProject,
        [projectId]: {
          ...projectChat,
          activeSessionId: sessionId,
          projectPath: projectChat.projectPath ?? projectChat.sessions.find(s => s.id === sessionId)?.directory,
        },
      },
      currentMessages: [],
      currentSessionId: sessionId,
      status: "connecting",
    })

    try {
      // Load messages for the session
      const session = projectChat.sessions.find(s => s.id === sessionId)
      if (!session) return

      const response = await client.session.messages({
        path: { id: sessionId },
        query: { directory: session.directory ?? projectChat.projectPath },
      })

      if (response.data) {
        const messages = response.data as MessageWithParts[]
        set({
          currentMessages: messages,
          status: "idle",
        })
      }

      await get()._persistProjectChat(projectId)
    } catch (error) {
      console.error("Failed to load messages:", error)
      set({ status: "error", error: String(error) })
    }
  },

  deleteSession: async (projectId: string, sessionId: string) => {
    const { client, chatByProject } = get()
    if (!client) return

    const projectChat = chatByProject[projectId]
    if (!projectChat) return

    try {
      const session = projectChat.sessions.find(s => s.id === sessionId)
      if (!session) return

      await client.session.delete({
        path: { id: sessionId },
        query: { directory: session.directory ?? projectChat.projectPath },
      })

      const updatedSessions = projectChat.sessions.filter(s => s.id !== sessionId)
      const wasActive = projectChat.activeSessionId === sessionId
      const newActiveId = wasActive
        ? updatedSessions[0]?.id ?? null
        : projectChat.activeSessionId
      const currentSessionId = get().currentSessionId
      const nextCurrentSessionId = currentSessionId === sessionId ? newActiveId : currentSessionId

      set({
        chatByProject: {
          ...chatByProject,
          [projectId]: {
            sessions: updatedSessions,
            activeSessionId: newActiveId,
            projectPath: projectChat.projectPath,
          },
        },
        currentMessages: wasActive ? [] : get().currentMessages,
        currentSessionId: nextCurrentSessionId ?? null,
      })

      if (newActiveId && newActiveId !== projectChat.activeSessionId) {
        await get().selectSession(projectId, newActiveId)
      }

      await get()._persistProjectChat(projectId)
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  },

  sendMessage: async (sessionId: string, text: string) => {
    const { client, chatByProject } = get()
    
    if (!client) {
      console.error("[chatStore] No client available")
      return
    }
    if (!text.trim()) {
      console.error("[chatStore] Empty text")
      return
    }

    // Find the session to get its directory
    let sessionDirectory: string | undefined
    for (const projectChat of Object.values(chatByProject)) {
      const session = projectChat.sessions.find(s => s.id === sessionId)
      if (session) {
        sessionDirectory = session.directory
        break
      }
    }

    try {
      set({ status: "streaming" })

      // The prompt call will trigger SSE events that update messages
      await client.session.prompt({
        path: { id: sessionId },
        body: {
          parts: [{ type: "text", text }],
        },
        query: sessionDirectory ? { directory: sessionDirectory } : undefined,
      })
      
      set({ status: "idle" })
    } catch (error) {
      console.error("[chatStore] Failed to send message:", error)
      set({ status: "error", error: String(error) })
    }
  },

  abortSession: async (sessionId: string) => {
    const { client, chatByProject } = get()
    if (!client) return

    let sessionDirectory: string | undefined
    for (const projectChat of Object.values(chatByProject)) {
      const session = projectChat.sessions.find(s => s.id === sessionId)
      if (session) {
        sessionDirectory = session.directory
        break
      }
    }

    try {
      await client.session.abort({
        path: { id: sessionId },
        query: sessionDirectory ? { directory: sessionDirectory } : undefined,
      })
      set({ status: "idle" })
    } catch (error) {
      console.error("Failed to abort session:", error)
    }
  },

  onFileChange: (listener: FileChangeListener) => {
    const { fileChangeListeners } = get()
    fileChangeListeners.add(listener)
    // Return unsubscribe function
    return () => {
      fileChangeListeners.delete(listener)
    }
  },

  _persistProjectChat: async (projectId: string) => {
    const { chatByProject } = get()
    const store = await getStore()
    await store.set("chatByProject", chatByProject)
    await store.save()
  },

  _subscribeToEvents: async () => {
    const { client, eventAbortController } = get()
    if (!client) return
    if (eventAbortController) return

    const controller = new AbortController()
    set({ eventAbortController: controller })

    try {
      const response = await client.global.event({
        signal: controller.signal,
      })

      // Process events
      for await (const event of response.stream as AsyncIterable<GlobalEvent>) {
        if (!event?.payload) continue

        const { payload } = event

        // Handle message updates
        if (payload.type === "message.updated") {
          const { info } = (payload as EventMessageUpdated).properties
          const { currentMessages, currentSessionId } = get()

          if (!currentSessionId || info.sessionID !== currentSessionId) {
            continue
          }
          
          // Check if message already exists
          const existingIndex = currentMessages.findIndex(m => m.info.id === info.id)
          
          if (existingIndex >= 0) {
            // Update existing message
            const updated = [...currentMessages]
            updated[existingIndex] = { ...updated[existingIndex], info }
            set({ currentMessages: updated })
          } else {
            // Add new message
            set({
              currentMessages: [...currentMessages, { info, parts: [] }],
            })
          }
        }

        // Handle message part updates
        if (payload.type === "message.part.updated") {
          const { part } = (payload as EventMessagePartUpdated).properties
          const { currentMessages, currentSessionId } = get()

          if (!currentSessionId || part.sessionID !== currentSessionId) {
            continue
          }
          
          const msgIndex = currentMessages.findIndex(m => m.info.id === part.messageID)
          if (msgIndex >= 0) {
            const updated = [...currentMessages]
            const msg = { ...updated[msgIndex] }
            const partIndex = msg.parts.findIndex(p => p.id === part.id)
            
            if (partIndex >= 0) {
              msg.parts = [...msg.parts]
              msg.parts[partIndex] = part
            } else {
              msg.parts = [...msg.parts, part]
            }
            
            updated[msgIndex] = msg
            set({ currentMessages: updated })
          }
        }

        // Handle session created
        if (payload.type === "session.created") {
          const { info } = (payload as EventSessionCreated).properties
          const { chatByProject } = get()

          for (const [projectId, projectChat] of Object.entries(chatByProject)) {
            if (projectChat.projectPath && info.directory === projectChat.projectPath) {
              if (projectChat.sessions.some(s => s.id === info.id)) {
                break
              }

              const nextSessions = [info, ...projectChat.sessions]
              nextSessions.sort((a, b) => b.time.updated - a.time.updated)

              set({
                chatByProject: {
                  ...chatByProject,
                  [projectId]: {
                    ...projectChat,
                    sessions: nextSessions,
                  },
                },
              })
              break
            }
          }
        }

        // Handle session updated (title changes, etc.)
        if (payload.type === "session.updated") {
          const { info } = (payload as EventSessionUpdated).properties
          const { chatByProject } = get()
          
          // Find which project this session belongs to
          for (const [projectId, projectChat] of Object.entries(chatByProject)) {
            const sessionIndex = projectChat.sessions.findIndex(s => s.id === info.id)
            if (sessionIndex >= 0) {
              const updatedSessions = [...projectChat.sessions]
              updatedSessions[sessionIndex] = info
              
              set({
                chatByProject: {
                  ...chatByProject,
                  [projectId]: {
                    ...projectChat,
                    sessions: updatedSessions,
                  },
                },
              })
              break
            }
          }
        }

        // Handle session deleted
        if (payload.type === "session.deleted") {
          const { info } = payload.properties
          const { chatByProject, currentSessionId } = get()

          for (const [projectId, projectChat] of Object.entries(chatByProject)) {
            const updatedSessions = projectChat.sessions.filter(s => s.id !== info.id)
            if (updatedSessions.length !== projectChat.sessions.length) {
              const isCurrent = currentSessionId === info.id
              set({
                chatByProject: {
                  ...chatByProject,
                  [projectId]: {
                    ...projectChat,
                    sessions: updatedSessions,
                    activeSessionId: projectChat.activeSessionId === info.id ? updatedSessions[0]?.id ?? null : projectChat.activeSessionId,
                  },
                },
                currentMessages: isCurrent ? [] : get().currentMessages,
                currentSessionId: isCurrent ? null : currentSessionId,
              })
              break
            }
          }
        }

        // Handle session status (busy/idle)
        if (payload.type === "session.status") {
          const { status: sessionStatus, sessionID } = payload.properties
          const { currentSessionId } = get()
          if (!currentSessionId || sessionID !== currentSessionId) {
            continue
          }
          if (sessionStatus.type === "busy") {
            set({ status: "streaming" })
          } else if (sessionStatus.type === "idle") {
            set({ status: "idle" })
          }
        }

        // Handle file watcher events (file system changes)
        if (payload.type === "file.watcher.updated") {
          const { file, event: fileEvent } = (payload as EventFileWatcherUpdated).properties
          console.log("[chatStore] File watcher event:", fileEvent, file)
          const { fileChangeListeners } = get()
          // Notify all listeners
          for (const listener of fileChangeListeners) {
            try {
              listener({ file, event: fileEvent })
            } catch (err) {
              console.error("[chatStore] File change listener error:", err)
            }
          }
        }

        // Handle file.edited events (when agent edits files)
        if (payload.type === "file.edited") {
          const { file } = payload.properties as { file: string }
          console.log("[chatStore] File edited event:", file)
          const { fileChangeListeners } = get()
          // Notify all listeners as a "change" event
          for (const listener of fileChangeListeners) {
            try {
              listener({ file, event: "change" })
            } catch (err) {
              console.error("[chatStore] File change listener error:", err)
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Event stream error:", error)
      }
    }
  },

  _unsubscribeFromEvents: () => {
    const { eventAbortController } = get()
    eventAbortController?.abort()
    set({ eventAbortController: null })
  },
}))
