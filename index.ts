/**
 * Nucleus Desktop - OpenCode CLI
 *
 * Usage:
 *   bun run cli "your prompt"
 */

import {
  createOpencode,
  type EventMessagePartUpdated,
  type EventMessageUpdated,
  type GlobalEvent,
  type TextPart,
  type ToolPart,
  type ToolState,
} from "@opencode-ai/sdk"

const HELP_FLAGS = new Set(["--help", "-h"])
const NO_STREAM_FLAG = "--no-stream"
const RAW_ONLY_FLAG = "--raw-only"
const JSON_ONLY_FLAG = "--json-only"
const STREAM_TOOLS_FLAG = "--stream-tools"
const KNOWN_FLAGS = new Set([
  ...HELP_FLAGS,
  NO_STREAM_FLAG,
  RAW_ONLY_FLAG,
  JSON_ONLY_FLAG,
  STREAM_TOOLS_FLAG,
])

function printUsage(): void {
  console.log(
    "Usage: bun run cli \"your prompt\" [--no-stream] [--raw-only] [--json-only] [--stream-tools]"
  )
}

function extractTextFromParts(parts: unknown): string | null {
  if (!Array.isArray(parts)) {
    return null
  }

  const textParts = parts
    .filter((part): part is { type: string; text?: string } =>
      Boolean(part && typeof part === "object" && "type" in part)
    )
    .map((part) => (part.type === "text" ? part.text : null))
    .filter((text): text is string => typeof text === "string")

  return textParts.length ? textParts.join("\n") : null
}

function extractTextFromResponse(response: unknown): string | null {
  if (!response || typeof response !== "object") {
    return null
  }

  if ("parts" in response) {
    const text = extractTextFromParts((response as { parts?: unknown }).parts)
    if (text) {
      return text
    }
  }

  if ("message" in response) {
    const message = (response as { message?: unknown }).message
    if (message && typeof message === "object" && "content" in message) {
      const text = extractTextFromParts((message as { content?: unknown }).content)
      if (text) {
        return text
      }
    }
  }

  if ("content" in response) {
    const text = extractTextFromParts((response as { content?: unknown }).content)
    if (text) {
      return text
    }
  }

  return null
}

function formatToolState(state: ToolState, toolName: string): string {
  if (state.status === "pending") {
    return `[Tool ${toolName}] pending`
  }

  if (state.status === "running") {
    return `[Tool ${toolName}] running${state.title ? `: ${state.title}` : ""}`
  }

  if (state.status === "error") {
    return `[Tool ${toolName}] error: ${state.error}`
  }

  return `[Tool ${toolName}] completed${state.title ? `: ${state.title}` : ""}`
}

type StreamResult = {
  streamedText: boolean
  streamedTools: boolean
}

async function streamAssistantParts(
  stream: AsyncIterable<GlobalEvent>,
  sessionID: string,
  streamTools: boolean
): Promise<StreamResult> {
  const seenParts = new Set<string>()
  const toolStates = new Map<string, string>()
  let streamedText = false
  let streamedTools = false
  let assistantMessageID: string | null = null

  for await (const event of stream) {
    if (!event || typeof event !== "object" || !("payload" in event)) {
      continue
    }

    const payload = (event as GlobalEvent).payload

    if (!payload || typeof payload !== "object") {
      continue
    }

    if (payload.type === "message.updated") {
      const { info } = (payload as EventMessageUpdated).properties

      if (info.sessionID === sessionID && info.role === "assistant") {
        assistantMessageID = info.id
      }

      continue
    }

    if (payload.type !== "message.part.updated" || !assistantMessageID) {
      continue
    }

    const { part, delta } = (payload as EventMessagePartUpdated).properties

    if (part.sessionID !== sessionID || part.messageID !== assistantMessageID) {
      continue
    }

    if (part.type === "text") {
      const textPart = part as TextPart

      if (!streamedText) {
        console.log("\nAssistant Response (streaming):\n")
        streamedText = true
      }

      if (typeof delta === "string") {
        process.stdout.write(delta)
      } else if (!seenParts.has(textPart.id)) {
        process.stdout.write(textPart.text)
      }

      seenParts.add(textPart.id)
      continue
    }

    if (part.type === "tool" && streamTools) {
      const toolPart = part as ToolPart
      const toolState = toolPart.state
      const lastState = toolStates.get(toolPart.callID)

      if (!lastState || lastState !== toolState.status) {
        if (!streamedTools) {
          console.log("\n\nTool Activity:\n")
          streamedTools = true
        }

        console.log(formatToolState(toolState, toolPart.tool))

        if (toolState.status === "completed" && toolState.output) {
          console.log(toolState.output)
        }

        toolStates.set(toolPart.callID, toolState.status)
      }
    }
  }

  return { streamedText, streamedTools }
}

async function run(): Promise<void> {
  const args = process.argv.slice(2)
  const helpRequested = args.some((arg) => HELP_FLAGS.has(arg))
  const jsonOnly = args.includes(JSON_ONLY_FLAG)
  const rawOnly = jsonOnly || args.includes(RAW_ONLY_FLAG)
  const streamEnabled = !rawOnly && !args.includes(NO_STREAM_FLAG)
  const streamTools = streamEnabled && args.includes(STREAM_TOOLS_FLAG)
  const promptArgs = args.filter((arg) => !KNOWN_FLAGS.has(arg))

  if (!promptArgs.length || helpRequested) {
    printUsage()
    process.exit(promptArgs.length ? 0 : 1)
  }

  const prompt = promptArgs.join(" ")
  const opencode = await createOpencode()

  try {
    const sessionResponse = await opencode.client.session.create({
      body: { title: prompt.slice(0, 60) },
    })

    const session = sessionResponse.data

    if (!session?.id) {
      throw new Error("Failed to create session")
    }

    const streamController = new AbortController()
    const streamTask = streamEnabled
      ? opencode.client.global
          .event({ signal: streamController.signal })
          .then((result) => streamAssistantParts(result.stream, session.id, streamTools))
      : Promise.resolve({ streamedText: false, streamedTools: false })

    const result = await opencode.client.session.prompt({
      path: { id: session.id },
      body: { parts: [{ type: "text", text: prompt }] },
    })

    streamController.abort()
    const { streamedText } = await streamTask.catch(() => ({
      streamedText: false,
      streamedTools: false,
    }))

    if (jsonOnly) {
      console.log(JSON.stringify(result.data, null, 2))
      return
    }

    if (streamEnabled && streamedText) {
      console.log("\n")
    }

    console.log(`Session ID: ${session.id}`)

    if (!rawOnly && (!streamEnabled || !streamedText)) {
      const text = extractTextFromResponse(result.data)

      if (text) {
        console.log("\nAssistant Response:\n")
        console.log(text)
      }
    }

    console.log("\nRaw Response:\n")
    console.log(JSON.stringify(result.data, null, 2))
  } finally {
    opencode.server.close()
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
