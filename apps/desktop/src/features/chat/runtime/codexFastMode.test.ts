import { describe, expect, test } from "bun:test"
import {
  CODEX_FAST_MODE_MODEL_ALLOWLIST,
  codexModelSupportsFastMode,
  mapCodexFastModeToServiceTier,
} from "./codexFastMode"

describe("codexFastMode", () => {
  test("keeps the current fast-mode allowlist centralized", () => {
    expect(Array.from(CODEX_FAST_MODE_MODEL_ALLOWLIST)).toEqual(["gpt-5.4"])
    expect(codexModelSupportsFastMode("gpt-5.4")).toBe(true)
    expect(codexModelSupportsFastMode("gpt-5.4-mini")).toBe(false)
  })

  test("maps enabled fast mode to the fast service tier", () => {
    expect(mapCodexFastModeToServiceTier(true)).toBe("fast")
    expect(mapCodexFastModeToServiceTier(false)).toBeNull()
  })
})
