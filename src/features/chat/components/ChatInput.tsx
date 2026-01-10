import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "./ai-elements/prompt-input";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (text: string) => void;
  status: "idle" | "streaming" | "error";
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  status,
}: ChatInputProps) {
  const isDisabled = status === "streaming";

  return (
    <div className="bg-main-content px-8 pb-4">
      <PromptInput
        onSubmit={({ text }) => onSubmit(text)}
      >
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isDisabled}
        />
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit
            status={status === "streaming" ? "streaming" : undefined}
            disabled={isDisabled || !input.trim()}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
