# Nucleus Desktop

Desktop AI agent powered by Claude Agent SDK.

## Project Overview

This project is being built in phases:

1. **Phase 1 (Current)**: CLI foundation with Claude Agent SDK
2. **Phase 2**: Add Tauri + React for desktop UI
3. **Phase 3**: Migrate UI components from claude-interface project

## Commands

```bash
bun run start              # Run CLI (interactive mode)
bun run start "prompt"     # Run single prompt
bun run dev                # Run with watch mode
bun run typecheck          # TypeScript type checking
```

## Architecture

### Current (Phase 1 - CLI)
```
nucleus-desktop/
├── index.ts               # CLI entry point with Agent SDK
├── package.json
├── tsconfig.json
└── MIGRATION.md           # Detailed migration plan
```

### Target (Phase 2+)
```
nucleus-desktop/
├── src/
│   ├── main.ts            # Tauri main process
│   ├── agent/             # Agent SDK integration
│   │   ├── client.ts      # Core query wrapper
│   │   ├── hooks/         # React hooks (useAgent, useMessages, etc.)
│   │   ├── store/         # Zustand store for agent state
│   │   └── types.ts       # SDK type re-exports and extensions
│   └── features/          # UI features (migrated from claude-interface)
│       ├── chat/          # Chat UI components
│       └── shared/        # Shared UI components
├── src-tauri/             # Tauri Rust backend (minimal)
└── ...
```

## Key Dependencies

- `@anthropic-ai/claude-agent-sdk` - Claude Agent SDK (v0.2.2)
- `bun` - JavaScript runtime and package manager

## UI Migration Notes

The UI from `claude-interface` project will be migrated here. Key components to bring over:

- `ChatMessages.tsx` - Message rendering with AgentActivity
- `AgentActivity.tsx` - Collapsible activity panel
- `AgentActivityTool.tsx` - Tool call cards
- `ai-elements/` - Message, Conversation, Loader components
- `shared/components/ui/` - Button, Input, Dialog, etc.

These components have already been decoupled from the old ACP implementation and use local types compatible with the Agent SDK message format.

## Development Guidelines

- Use Bun instead of Node.js
- Use ESM modules (`type: "module"`)
- TypeScript strict mode enabled
- No Vite - use Bun's built-in bundler when adding frontend
