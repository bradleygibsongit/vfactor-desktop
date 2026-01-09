/**
 * Nucleus Desktop - CLI Entry Point
 *
 * A desktop AI agent powered by Claude Agent SDK.
 * This CLI validates the SDK integration before adding UI.
 *
 * Usage:
 *   bun run start                    # Interactive mode
 *   bun run start "your prompt"      # Single prompt mode
 */

import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

// All available tools for full autonomy
const ALL_TOOLS = [
  // File operations
  "Read",
  "Write",
  "Edit",
  "Glob",
  "Grep",
  // Shell execution
  "Bash",
  // Web capabilities
  "WebSearch",
  "WebFetch",
  // Agent features
  "Task", // Subagents
  "AskUserQuestion",
  "TodoWrite",
];

// Global abort controller for graceful shutdown
let abortController = new AbortController();

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\nInterrupting...");
  abortController.abort();
  // Reset for next query
  abortController = new AbortController();
});

/**
 * Process and display SDK messages.
 * This function demonstrates handling all message types.
 */
function handleMessage(message: SDKMessage): void {
  switch (message.type) {
    case "system":
      if (message.subtype === "init") {
        console.log("\n--- Session Initialized ---");
        console.log(`Session ID: ${message.session_id}`);
        console.log(`Model: ${message.model}`);
        console.log(`Tools: ${message.tools.join(", ")}`);
        console.log(`Permission Mode: ${message.permissionMode}`);
        console.log("----------------------------\n");
      }
      break;

    case "assistant":
      // Process assistant message content
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`\n[Tool: ${block.name}]`);
        }
      }
      break;

    case "user":
      // User messages (including tool results) - usually not displayed
      break;

    case "result":
      console.log("\n--- Query Complete ---");
      if (message.subtype === "success") {
        console.log(`Result: ${message.result}`);
        console.log(`Turns: ${message.num_turns}`);
        console.log(`Cost: $${message.total_cost_usd.toFixed(4)}`);
        console.log(`Duration: ${message.duration_ms}ms`);
      } else {
        console.error(`Error: ${message.subtype}`);
        if ("errors" in message) {
          console.error(message.errors.join("\n"));
        }
      }
      console.log("----------------------\n");
      break;

    case "stream_event":
      // Partial messages (only with includePartialMessages: true)
      break;
  }
}

/**
 * Run a single query with the agent.
 */
async function runQuery(prompt: string): Promise<void> {
  console.log(`\nPrompt: ${prompt}\n`);

  // Reset abort controller for this query
  abortController = new AbortController();

  try {
    for await (const message of query({
      prompt,
      options: {
        // Use Claude Code's optimized system prompt
        systemPrompt: {
          type: "preset",
          preset: "claude_code",
        },
        // Load project settings (CLAUDE.md, .claude/settings.json)
        settingSources: ["project"],
        // All tools for full autonomy
        allowedTools: ALL_TOOLS,
        // Require approval for sensitive operations
        permissionMode: "default",
        // Enable graceful cancellation
        abortController,
        // For development, you can use "acceptEdits" or "bypassPermissions"
        // permissionMode: "bypassPermissions",
        // allowDangerouslySkipPermissions: true,
      },
    })) {
      handleMessage(message);
    }
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.log("Query cancelled.");
        return;
      }
      console.error(`Query failed: ${error.message}`);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
    } else {
      console.error("Query failed:", error);
    }
    process.exit(1);
  }
}

/**
 * Interactive CLI mode - read prompts from stdin.
 */
async function interactiveMode(): Promise<void> {
  console.log("Nucleus Desktop - Interactive Mode");
  console.log("Type your prompts, press Enter to submit.");
  console.log('Type "exit" or Ctrl+C to quit.\n');

  const reader = Bun.stdin.stream().getReader();
  const decoder = new TextDecoder();

  process.stdout.write("> ");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete lines
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      const prompt = line.trim();

      if (!prompt) {
        process.stdout.write("> ");
        continue;
      }

      if (prompt.toLowerCase() === "exit") {
        console.log("Goodbye!");
        process.exit(0);
      }

      await runQuery(prompt);
      process.stdout.write("> ");
    }
  }
}

// Validate environment
function checkEnvironment(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "Warning: ANTHROPIC_API_KEY not set. The SDK will attempt to use Claude Code credentials.\n"
    );
  }
}

// Main entry point
checkEnvironment();

const args = process.argv.slice(2);

if (args.length > 0) {
  // Single prompt mode
  const prompt = args.join(" ");
  await runQuery(prompt);
} else {
  // Interactive mode
  await interactiveMode();
}
