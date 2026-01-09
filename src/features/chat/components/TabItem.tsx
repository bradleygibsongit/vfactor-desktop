import { ChatCircle, FileCode, GitDiff } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/features/shared/components/ui/tooltip"
import type { TabType } from "../types"

interface TabItemProps {
  type: TabType
  title: string
  isActive: boolean
  onClick: () => void
}

function TabIcon({ type }: { type: TabType }) {
  switch (type) {
    case "file":
      return <FileCode size={14} />
    case "diff":
      return <GitDiff size={14} />
    case "chat":
    default:
      return <ChatCircle size={14} />
  }
}

export function TabItem({ type, title, isActive, onClick }: TabItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          "flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 -mb-px",
          isActive
            ? "text-foreground border-foreground"
            : "text-muted-foreground border-transparent hover:text-foreground"
        )}
      >
        <TabIcon type={type} />
        <span className="truncate max-w-24">{title}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  )
}
