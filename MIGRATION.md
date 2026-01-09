# Nucleus Desktop - Migration Plan

This document details the migration from `claude-interface` (custom ACP implementation) to `nucleus-desktop` (Claude Agent SDK).

## Background

The `claude-interface` project had a custom ACP (Agent Client Protocol) implementation:
- **Rust backend** (~6,500 lines): Managed stdio JSON-RPC communication with OpenCode agent
- **TypeScript frontend** (~7,500 lines): React hooks, Zustand store, permission handling

This was overly complex. The Claude Agent SDK provides all this functionality out of the box.

## What We're Keeping

**Significant time was invested in the UI components** in `claude-interface`. These will be migrated:

### Chat Components (`src/features/chat/`)
- `ChatMessages.tsx` - Message list with user/assistant rendering
- `ChatInput.tsx` - Prompt input with submit handling
- `ChatContainer.tsx` - Main chat layout

### Agent Activity Components (`src/features/chat/components/agent-activity/`)
- `AgentActivity.tsx` - Collapsible activity panel showing agent's work
- `AgentActivityHeader.tsx` - Header with working indicator and timing
- `AgentActivityTool.tsx` - Individual tool call cards with expand/collapse
- `AgentActivityText.tsx` - Thinking/reasoning text blocks

### AI Elements (`src/features/chat/components/ai-elements/`)
- `message.tsx` - Message bubble components
- `conversation.tsx` - Scrollable conversation container
- `loader.tsx` - Streaming indicator
- `prompt-input.tsx` - Input field components

### Shared UI (`src/features/shared/components/ui/`)
- Button, Input, Dialog, Card, etc. (shadcn/ui based)

### Layout Components (`src/features/shared/components/layout/`)
- AppLayout, AppHeader, Sidebars, TitleBar

## Migration Phases

### Phase 1: CLI Foundation (Current)
**Status: In Progress**

- [x] Initialize project with bun
- [x] Install Claude Agent SDK
- [x] Create basic CLI with `query()` function
- [x] Handle all SDK message types
- [x] Full autonomy tools configured
- [ ] Test with real prompts
- [ ] Verify session management works

**Goal**: Prove the Agent SDK works correctly before adding UI complexity.

### Phase 2: Add Tauri + React
**Status: Not Started**

1. Initialize Tauri in the project
   ```bash
   bun add -d @tauri-apps/cli
   bunx tauri init
   ```

2. Set up React with Bun's bundler (no Vite)
   ```bash
   bun add react react-dom
   bun add -d @types/react @types/react-dom
   ```

3. Create basic app structure:
   ```
   src/
   ├── main.tsx           # React entry point
   ├── App.tsx            # Root component
   └── agent/
       └── client.ts      # Agent SDK wrapper
   ```

4. Configure Tauri for overlay titlebar (like claude-interface)

### Phase 3: Agent SDK Integration Layer
**Status: Not Started**

Create React-friendly wrappers around the Agent SDK:

```typescript
// src/agent/client.ts
import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export async function* runAgent(prompt: string) {
  for await (const message of query({
    prompt,
    options: {
      allowedTools: ALL_TOOLS,
      permissionMode: "default",
    },
  })) {
    yield message;
  }
}
```

```typescript
// src/agent/hooks/useAgent.ts
export function useAgent() {
  const [messages, setMessages] = useState<SDKMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const sendPrompt = useCallback(async (prompt: string) => {
    setIsRunning(true);
    for await (const msg of runAgent(prompt)) {
      setMessages(prev => [...prev, msg]);
    }
    setIsRunning(false);
  }, []);

  return { messages, isRunning, sendPrompt };
}
```

### Phase 4: Migrate UI Components
**Status: Not Started**

1. Copy shared UI components from claude-interface
2. Copy chat components
3. Adapt types to match SDK message format
4. Wire up to Agent SDK hooks

**Type Mapping** (claude-interface → Agent SDK):
| Old Type | SDK Type |
|----------|----------|
| `Message` | `SDKAssistantMessage \| SDKUserMessage` |
| `ToolCallState` | Extract from `SDKAssistantMessage.message.content` |
| `PendingPermission` | Use `canUseTool` callback |
| `ResolvedPermission` | Track in local state |

### Phase 5: Permission UI
**Status: Not Started**

The Agent SDK's `canUseTool` callback enables custom permission UI:

```typescript
const result = query({
  prompt,
  options: {
    canUseTool: async (toolName, input, { signal, suggestions }) => {
      // Show UI, wait for user decision
      const decision = await showPermissionDialog(toolName, input);

      if (decision.approved) {
        return { behavior: "allow", updatedInput: input };
      } else {
        return { behavior: "deny", message: decision.reason };
      }
    },
  },
});
```

Migrate the existing `PermissionCard` component to work with this callback.

### Phase 6: Polish & Cleanup
**Status: Not Started**

- Remove `claude-interface` project (or archive it)
- Final testing of all features
- Performance optimization
- Error handling improvements

## Key Differences: ACP vs Agent SDK

| Feature | Old ACP | Agent SDK |
|---------|---------|-----------|
| Communication | Rust → stdio → OpenCode | Direct SDK call |
| Tool Execution | Manual via Rust | Handled by SDK |
| Permissions | Custom Tauri events | `canUseTool` callback |
| Sessions | Manual state management | Built-in session support |
| Streaming | Manual message parsing | `for await` on generator |
| Subagents | Not supported | Built-in `Task` tool |

## Files to Delete from claude-interface

After migration is complete:
- `src-tauri/src/acp/` - Entire Rust ACP module (already deleted)
- `src/features/acp/` - TypeScript ACP implementation (already deleted)

## Testing Checklist

Before considering migration complete:

- [ ] Can send prompts and receive responses
- [ ] Tool calls display correctly in AgentActivity
- [ ] Permission prompts appear and work
- [ ] Sessions persist across app restarts
- [ ] Streaming updates show in real-time
- [ ] Subagent (Task) tool works
- [ ] Web search/fetch tools work
- [ ] File read/write/edit tools work
- [ ] Error states handled gracefully
- [ ] App performance is acceptable

## Resources

- [Claude Agent SDK Docs](https://platform.claude.com/docs/en/api/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/api/agent-sdk/typescript)
- [SDK GitHub](https://github.com/anthropics/claude-agent-sdk-typescript)
