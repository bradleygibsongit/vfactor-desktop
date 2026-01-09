import type { Message, TimestampedContent } from "../types";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "./ai-elements/conversation";
import {
  Message as MessageComponent,
  MessageContent,
  MessageResponse,
} from "./ai-elements/message";
import { Loader } from "./ai-elements/loader";
import { AgentActivity } from "./agent-activity";
import {
  Folder,
  GitBranch,
  ChevronDown,
  Pencil,
} from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  status: "idle" | "streaming" | "error";
}

/**
 * Extract text from timestamped content blocks.
 */
function getMessageText(content: TimestampedContent[]): string {
  return content
    .map((tc) => tc.content)
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map((block) => block.text)
    .join("");
}

/**
 * Get the "final" text from a message.
 */
function getFinalText(message: Message): string {
  return getMessageText(message.content);
}

/**
 * Check if a message has any activity (tool calls, multiple content blocks, etc.)
 */
function hasActivity(message: Message): boolean {
  return message.toolCalls.length > 0;
}

function ChatEmptyState() {
  const projectPath = "/Users/bradleygibson/Projects/conductor-playground-1";
  const pathParts = projectPath.split("/");
  const folderName = pathParts.pop() || "";
  const parentPath = pathParts.join("/") + "/";
  const currentBranch = "feat/wire-up-chat-to-acp";
  const lastModified = "29 minutes ago";

  return (
    <div className="size-full p-4 space-y-2.5">
      <h1 className="text-xl font-light text-muted-foreground/60 mb-3">New session</h1>

      <div className="flex items-center gap-1.5 text-xs text-foreground">
        <Folder className="size-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">{parentPath}</span>
        <span className="font-semibold">{folderName}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-foreground">
        <GitBranch className="size-3.5 text-muted-foreground" />
        <span>Current branch</span>
        <span className="text-muted-foreground">({currentBranch})</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-foreground">
        <Pencil className="size-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Last modified</span>
        <span className="font-semibold">{lastModified}</span>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  message: Message;
  isStreaming: boolean;
}

/**
 * Renders an assistant message with AgentActivity for tool calls
 * and final response text.
 */
function AssistantMessage({ message, isStreaming }: AssistantMessageProps) {
  const text = getFinalText(message);
  const showActivity = hasActivity(message) || isStreaming;

  const showFinalText = !isStreaming && text && (!showActivity || message.stopReason === "end_turn");

  return (
    <MessageComponent from="assistant">
      <MessageContent>
        {showActivity && (
          <AgentActivity
            message={message}
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
  );
}

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const hasContent = messages.length > 0;

  return (
    <Conversation className="h-full">
      <ConversationContent className="px-10 pb-32">
        {!hasContent ? (
          <ChatEmptyState />
        ) : (
          <>
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const isStreaming =
                status === "streaming" && isLastMessage && message.role === "assistant";

              if (message.role === "assistant") {
                return (
                  <AssistantMessage
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming}
                  />
                );
              }

              const text = getMessageText(message.content);
              return (
                <MessageComponent key={message.id} from="user">
                  <MessageContent>
                    <span>{text}</span>
                  </MessageContent>
                </MessageComponent>
              );
            })}
          </>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
