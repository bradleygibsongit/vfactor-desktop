const AGENT_AVATAR_BACKGROUND_COLORS = [
  "#334155",
  "#1d4ed8",
  "#0369a1",
  "#0f766e",
  "#047857",
  "#3f3f46",
  "#854d0e",
  "#b45309",
  "#9a3412",
  "#be123c",
  "#1f2937",
  "#155e75",
]

export function createAgentAvatarSeed(): string {
  return crypto.randomUUID()
}

export function getAvatarColorForSeed(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return AGENT_AVATAR_BACKGROUND_COLORS[
    Math.abs(hash) % AGENT_AVATAR_BACKGROUND_COLORS.length
  ]
}
