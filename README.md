# Nucleus Desktop

Desktop AI agent powered by Claude Agent SDK.

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Claude Code](https://claude.ai/code) installed and authenticated, OR an Anthropic API key

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure authentication (choose one):

   **Option A: Use existing Claude Code credentials (recommended)**

   If you have Claude Code installed and authenticated, the SDK will automatically use those credentials. No additional setup needed.

   **Option B: Use API key**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

## Usage

**Interactive mode** - chat with the agent:
```bash
bun run start
```

**Single prompt mode** - run one query:
```bash
bun run start "What files are in this directory?"
```

**Watch mode** - auto-restart on code changes:
```bash
bun run dev
```

**Type checking**:
```bash
bun run typecheck
```

## Project Structure

```
nucleus-desktop/
├── index.ts           # CLI entry point with Agent SDK
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── CLAUDE.md          # Project instructions for Claude
├── MIGRATION.md       # Detailed migration plan from claude-interface
└── .env.example       # Environment template
```

## Features

- Full autonomy with all Claude Code tools (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch, Task, AskUserQuestion, TodoWrite)
- Graceful cancellation with Ctrl+C
- Streaming message output
- Session management
- Project settings integration (CLAUDE.md)

## Development Phases

See [MIGRATION.md](./MIGRATION.md) for the full plan.

1. **Phase 1 (Current)**: CLI foundation with Claude Agent SDK
2. **Phase 2**: Add Tauri + React for desktop UI
3. **Phase 3**: Migrate UI components from claude-interface project

## Resources

- [Claude Agent SDK Documentation](https://platform.claude.com/docs/en/api/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/api/agent-sdk/typescript)
