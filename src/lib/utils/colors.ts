/**
 * Avatar color utilities for generating consistent colors from names
 */

export const AVATAR_COLORS = [
  "bg-red-400/60",
  "bg-orange-400/60",
  "bg-amber-400/60",
  "bg-yellow-400/60",
  "bg-lime-400/60",
  "bg-green-400/60",
  "bg-emerald-400/60",
  "bg-teal-400/60",
  "bg-cyan-400/60",
  "bg-sky-400/60",
  "bg-blue-400/60",
  "bg-indigo-400/60",
  "bg-violet-400/60",
  "bg-purple-400/60",
  "bg-fuchsia-400/60",
  "bg-pink-400/60",
  "bg-rose-400/60",
] as const

export const TEXT_COLORS = [
  "text-red-400",
  "text-orange-400",
  "text-amber-400",
  "text-yellow-400",
  "text-lime-400",
  "text-green-400",
  "text-emerald-400",
  "text-teal-400",
  "text-cyan-400",
  "text-sky-400",
  "text-blue-400",
  "text-indigo-400",
  "text-violet-400",
  "text-purple-400",
  "text-fuchsia-400",
  "text-pink-400",
  "text-rose-400",
] as const

/**
 * Generate a deterministic hash from a name string
 */
function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

/**
 * Generate a deterministic background color class from a name string
 * Uses a simple hash function to ensure the same name always gets the same color
 */
export function getColorFromName(name: string): string {
  return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]
}

/**
 * Generate a deterministic text color class from a name string
 * Uses a simple hash function to ensure the same name always gets the same color
 */
export function getTextColorFromName(name: string): string {
  return TEXT_COLORS[hashName(name) % TEXT_COLORS.length]
}
