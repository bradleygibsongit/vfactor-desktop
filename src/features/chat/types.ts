/**
 * Chat feature types.
 * These are local types for the chat feature while Agent SDK is being set up.
 */

export type ChatStatus = "idle" | "streaming" | "error";

export type TabType = "chat" | "file" | "diff";

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  filePath?: string;
}

/** Content block in a message */
export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown };

/** A timestamped content block */
export interface TimestampedContent {
  content: ContentBlock;
  createdAt: number;
}

/** Tool call status */
export type ToolCallStatus = "pending" | "in_progress" | "completed" | "failed";

/** Tool kind for categorization */
export type ToolKind =
  | "read"
  | "edit"
  | "delete"
  | "move"
  | "search"
  | "execute"
  | "think"
  | "fetch"
  | "diff"
  | "unknown";

/** Tool call content items */
export type ToolCallContent =
  | { type: "content"; content: ContentBlock }
  | { type: "diff"; path: string; oldText?: string; newText?: string }
  | { type: "terminal"; terminalId: string };

/** Tool call state */
export interface ToolCallState {
  id: string;
  name: string;
  title: string;
  kind?: ToolKind;
  status: ToolCallStatus;
  content: ToolCallContent[];
  createdAt: number;
}

/** Message in a conversation */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: TimestampedContent[];
  toolCalls: ToolCallState[];
  stopReason?: string;
  createdAt: number;
}

/** Permission option */
export interface PermissionOption {
  id: string;
  label: string;
  description?: string;
}

/** Pending permission request */
export interface PendingPermission {
  requestId: string | number;
  toolCallId: string;
  toolName: string;
  message: string;
  options: PermissionOption[];
  createdAt: number;
}

/** Resolved permission */
export interface ResolvedPermission {
  requestId: string | number;
  toolCallId: string;
  selectedOptionId: string;
  selectedOptionLabel: string;
  createdAt: number;
  resolvedAt: number;
}
