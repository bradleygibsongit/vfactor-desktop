export function getChatInputPlaceholder(placement: "docked" | "intro" = "docked"): string {
  return placement === "intro" ? "Describe the feature, fix, or idea..." : "Ask anything"
}
