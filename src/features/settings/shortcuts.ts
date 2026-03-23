export type ShortcutModifier = "meta" | "ctrl" | "alt" | "shift"

export interface ShortcutBinding {
  key: string
  code?: string
  modifiers: ShortcutModifier[]
}

export type ShortcutId = "toggle-plan-mode"

export interface ShortcutDefinition {
  id: ShortcutId
  title: string
  description: string
  category: "composer"
  defaultBinding: ShortcutBinding
}

export type ShortcutPreferences = Partial<Record<ShortcutId, ShortcutBinding>>

const SHORTCUT_MODIFIER_ORDER: ShortcutModifier[] = ["meta", "ctrl", "alt", "shift"]

const SHORTCUT_MODIFIER_LABELS: Record<ShortcutModifier, string> = {
  meta: "Cmd",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
}

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  {
    id: "toggle-plan-mode",
    title: "Toggle plan mode",
    description: "Switch the chat composer between default and plan mode.",
    category: "composer",
    defaultBinding: {
      key: "P",
      code: "KeyP",
      modifiers: ["meta", "shift"],
    },
  },
]

export function getShortcutDefinition(id: ShortcutId): ShortcutDefinition {
  const definition = SHORTCUT_DEFINITIONS.find((candidate) => candidate.id === id)

  if (!definition) {
    throw new Error(`Unknown shortcut definition: ${id}`)
  }

  return definition
}

export function getShortcutBinding(
  id: ShortcutId,
  preferences?: ShortcutPreferences,
): ShortcutBinding {
  return preferences?.[id] ?? getShortcutDefinition(id).defaultBinding
}

export function formatShortcutBinding(binding: ShortcutBinding): string {
  const modifierLabels = SHORTCUT_MODIFIER_ORDER
    .filter((modifier) => binding.modifiers.includes(modifier))
    .map((modifier) => SHORTCUT_MODIFIER_LABELS[modifier])

  return [...modifierLabels, binding.key.toUpperCase()].join(" ")
}

export function matchesShortcutBinding(
  event: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">,
  binding: ShortcutBinding,
): boolean {
  const modifierSet = new Set(binding.modifiers)
  const normalizedKey = event.key.length === 1 ? event.key.toUpperCase() : event.key

  if (binding.code && event.code !== binding.code) {
    return false
  }

  if (normalizedKey !== binding.key.toUpperCase()) {
    return false
  }

  return (
    event.metaKey === modifierSet.has("meta") &&
    event.ctrlKey === modifierSet.has("ctrl") &&
    event.altKey === modifierSet.has("alt") &&
    event.shiftKey === modifierSet.has("shift")
  )
}
