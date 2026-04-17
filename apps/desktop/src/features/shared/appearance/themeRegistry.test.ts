import { describe, expect, test } from "bun:test"
import {
  CONCRETE_THEMES,
  DEFAULT_TEXT_SIZE_PX,
  DEFAULT_THEME_ID,
  MAX_TEXT_SIZE_PX,
  MIN_TEXT_SIZE_PX,
  clampTextSizePx,
  resolveThemeIdForAppearance,
} from "./themeRegistry"
import { THEME_TOKEN_NAMES } from "./types"

describe("themeRegistry", () => {
  test("every shipped theme provides the full token contract", () => {
    for (const theme of CONCRETE_THEMES) {
      for (const tokenName of THEME_TOKEN_NAMES) {
        expect(theme.tokens[tokenName], `${theme.id} is missing ${tokenName}`).toBeTruthy()
      }
    }
  })

  test("system defaults map to the nucleus light and dark pair", () => {
    expect(DEFAULT_THEME_ID).toBe("system")
    expect(resolveThemeIdForAppearance("light")).toBe("nucleus-light")
    expect(resolveThemeIdForAppearance("dark")).toBe("nucleus-dark")
  })

  test("text size is clamped to the supported interface range", () => {
    expect(DEFAULT_TEXT_SIZE_PX).toBe(13)
    expect(clampTextSizePx(MIN_TEXT_SIZE_PX - 10)).toBe(MIN_TEXT_SIZE_PX)
    expect(clampTextSizePx(MAX_TEXT_SIZE_PX + 10)).toBe(MAX_TEXT_SIZE_PX)
  })
})
