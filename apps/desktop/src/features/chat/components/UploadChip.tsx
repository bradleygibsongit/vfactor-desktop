import type { ReactElement, ReactNode } from "react"
import { File, FileImage, FileText } from "@/components/icons"
import type { RuntimeAttachmentKind } from "../types"
import { TagChip } from "./TagChip"

interface UploadChipProps {
  kind: RuntimeAttachmentKind
  label: string
  onRemove?: () => void
  onClick?: () => void
  title?: string
  leadingVisual?: ReactNode
  surface?: "default" | "user-message"
}

export function UploadChip({
  kind,
  label,
  onRemove,
  onClick,
  title,
  leadingVisual,
  surface = "default",
}: UploadChipProps): ReactElement {
  const Icon = kind === "image" ? FileImage : kind === "pasted_text" ? FileText : File
  const isUserMessageSurface = surface === "user-message"

  return (
    <TagChip
      icon={leadingVisual ?? <Icon className="size-3" />}
      label={label}
      title={title}
      onClick={onClick}
      onRemove={onRemove}
      variant="neutral"
      backgroundClassName={
        isUserMessageSurface
          ? "bg-[color:color-mix(in_oklab,var(--color-message-user-bubble-foreground)_10%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--color-message-user-bubble-foreground)_14%,transparent)]"
          : undefined
      }
      borderClassName={
        isUserMessageSurface
          ? "border-[color:color-mix(in_oklab,var(--color-message-user-bubble-foreground)_16%,transparent)]"
          : undefined
      }
      textClassName={
        isUserMessageSurface ? "text-[color:var(--color-message-user-bubble-foreground)]" : undefined
      }
      iconClassName={
        isUserMessageSurface
          ? "text-[color:color-mix(in_oklab,var(--color-message-user-bubble-foreground)_76%,transparent)]"
          : undefined
      }
    />
  )
}
