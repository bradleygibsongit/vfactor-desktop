import { useState, useCallback } from "react";
import type { ChatStatus, Message } from "../types";

/**
 * Stub chat hook - Agent SDK integration pending.
 * Currently returns mock data for UI development.
 */
export function useChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() || status === "streaming") {
        return;
      }

      setInput("");

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: [
          {
            content: { type: "text", text },
            createdAt: Date.now(),
          },
        ],
        toolCalls: [],
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // TODO: Wire up to Agent SDK
      // For now, just show a placeholder response
      setStatus("streaming");

      setTimeout(() => {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: [
            {
              content: {
                type: "text",
                text: "Agent SDK integration pending. This is a placeholder response.",
              },
              createdAt: Date.now(),
            },
          ],
          toolCalls: [],
          stopReason: "end_turn",
          createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStatus("idle");
      }, 500);
    },
    [status]
  );

  return {
    messages,
    status,
    input,
    setInput,
    handleSubmit,
    // Stub values for compatibility
    isConnected: false,
    isConnecting: false,
    activeSessionId: null,
    error: null,
  };
}

export type { Message };
