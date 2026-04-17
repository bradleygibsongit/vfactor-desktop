import { cn } from "@/lib/utils"

export type FeedbackTone = "success" | "warning" | "info" | "destructive"

export function feedbackSurfaceClassName(tone: FeedbackTone): string {
  return cn(
    "border",
    `border-[color:var(--color-${tone}-border)]`,
    `bg-[color:var(--color-${tone}-surface)]`,
    `text-[color:var(--color-${tone}-surface-foreground)]`
  )
}

export function feedbackIconClassName(tone: FeedbackTone): string {
  return `text-[color:var(--color-${tone})]`
}

export const vcsTextClassNames = {
  added: "text-[color:var(--color-vcs-added)]",
  modified: "text-[color:var(--color-vcs-modified)]",
  deleted: "text-[color:var(--color-vcs-deleted)]",
  renamed: "text-[color:var(--color-vcs-renamed)]",
  ignored: "text-[color:var(--color-vcs-ignored)]",
  ahead: "text-[color:var(--color-vcs-ahead)]",
  behind: "text-[color:var(--color-vcs-behind)]",
  diverged: "text-[color:var(--color-vcs-diverged)]",
  merged: "text-[color:var(--color-vcs-merged)]",
  prOpen: "text-[color:var(--color-vcs-pr-open)]",
  prClosed: "text-[color:var(--color-vcs-pr-closed)]",
} as const

export const vcsSurfaceClassNames = {
  added: "bg-[color:var(--color-vcs-added-surface)]",
  modified: "bg-[color:var(--color-vcs-modified-surface)]",
  deleted: "bg-[color:var(--color-vcs-deleted-surface)]",
  renamed: "bg-[color:var(--color-vcs-renamed-surface)]",
  ignored: "bg-[color:var(--color-vcs-ignored-surface)]",
} as const
