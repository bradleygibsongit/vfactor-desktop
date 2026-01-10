# Nucleus Desktop

Desktop AI agent app with Tauri + React.

## Prerequisites

- [Bun](https://bun.sh) v1.0+

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```


## Usage

**Web UI (Vite)**:
```bash
bun run dev
```

**Desktop app (Tauri)**:
```bash
bun run tauri:dev
```

**CLI (OpenCode SDK, streaming by default)**:
```bash
bun run cli "What files are in this repo?"
# Stream tool calls
bun run cli "What files are in this repo?" --stream-tools
# Disable streaming
bun run cli "What files are in this repo?" --no-stream
# Only show raw response
bun run cli "What files are in this repo?" --raw-only
# Only show raw JSON
bun run cli "What files are in this repo?" --json-only
```

**Type checking**:
```bash
bun run typecheck
```

## Project Structure

```
nucleus-desktop/
├── src/               # React UI
├── src-tauri/         # Tauri backend
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite config
└── MIGRATION.md       # Migration plan from claude-interface
```

## Features

- Desktop UI shell with React + Tauri
- Shared layout system (sidebars, title bar, main content)
- Theming based on system preference

## Development Phases

See [MIGRATION.md](./MIGRATION.md) for the full plan.

1. **Phase 1 (Current)**: UI shell with Tauri + React
2. **Phase 2**: Agent runtime integration
3. **Phase 3**: Migrate UI components from claude-interface project

## Resources

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
