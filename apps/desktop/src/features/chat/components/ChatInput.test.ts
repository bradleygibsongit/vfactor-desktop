import { describe, expect, test } from "bun:test"
import { getChatInputPlaceholder } from "./chatInputConfig"

describe("getChatInputPlaceholder", () => {
  test("uses the intro placeholder for the first-prompt empty state", () => {
    expect(getChatInputPlaceholder("intro")).toBe("Describe the feature, fix, or idea...")
  })

  test("keeps the existing docked placeholder for the standard composer", () => {
    expect(getChatInputPlaceholder("docked")).toBe("Ask anything")
  })
})
