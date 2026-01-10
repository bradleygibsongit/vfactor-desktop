import { useChat } from "../hooks/useChat"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"

export function ChatContainer() {
  const {
    messages,
    status,
    input,
    setInput,
    handleSubmit,
    selectedProject,
    activeSessionId,
    createSession,
  } = useChat()

  // Handle submit - create session if needed
  const handleSubmitWithSession = async (text: string) => {
    let sessionId = activeSessionId
    
    if (!sessionId) {
      // Create a new session first
      const session = await createSession()
      if (!session) {
        console.error("[ChatContainer] Failed to create session")
        return
      }
      sessionId = session.id
    }
    
    // Pass the session ID directly to avoid stale closure issue
    await handleSubmit(text, sessionId)
  }

  return (
    <div className="relative h-full flex justify-center">
      <div className="relative w-full max-w-[803px]">
        <ChatMessages
          messages={messages}
          status={status}
          selectedProject={selectedProject}
        />
        <div className="absolute inset-x-0 bottom-0">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmitWithSession}
            status={status}
          />
        </div>
      </div>
    </div>
  )
}
