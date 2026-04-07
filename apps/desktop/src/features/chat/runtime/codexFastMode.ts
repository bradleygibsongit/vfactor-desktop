const CODEX_FAST_MODE_MODEL_ALLOWLIST = new Set(["gpt-5.4"])

export function codexModelSupportsFastMode(modelId: string | null | undefined): boolean {
  const normalizedModelId = modelId?.trim() ?? ""
  return normalizedModelId.length > 0 && CODEX_FAST_MODE_MODEL_ALLOWLIST.has(normalizedModelId)
}

export function mapCodexFastModeToServiceTier(
  fastMode: boolean | null | undefined
): "fast" | null {
  return fastMode === true ? "fast" : null
}

export { CODEX_FAST_MODE_MODEL_ALLOWLIST }
