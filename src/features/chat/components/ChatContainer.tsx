import { useChat } from "../hooks/useChat";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export function ChatContainer() {
  const { messages, status, input, setInput, handleSubmit } = useChat();

  return (
    <div className="relative h-full flex justify-center">
      <div className="relative w-full max-w-[803px]">
        <ChatMessages messages={messages} status={status} />
        <div className="absolute inset-x-0 bottom-0">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
