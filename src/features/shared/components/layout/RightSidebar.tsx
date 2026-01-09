import { useState } from "react"
import { cn } from "@/lib/utils"
import { FileTreeViewer } from "@/features/version-control/components"
import { TerminalPanel } from "@/features/terminal/components"
import { mockFileTreeData } from "@/features/version-control/mocks"
import { useRightSidebar } from "./useRightSidebar"

export function RightSidebar() {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const { isCollapsed } = useRightSidebar()

  if (isCollapsed) {
    return null
  }

  return (
    <aside className="w-[400px] max-w-[400px] min-w-48 shrink bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="h-12 bg-sidebar border-b border-sidebar-border flex items-center px-4 shrink-0">
        <span className="text-sm text-sidebar-foreground">Files</span>
      </div>

      {/* Content area */}
      <div className={cn("overflow-y-auto px-2 py-2", terminalOpen ? "h-1/2" : "flex-1")}>
        <FileTreeViewer
          data={mockFileTreeData}
          initialExpanded={["src", "components"]}
        />
      </div>

      {/* Terminal panel */}
      <TerminalPanel
        isOpen={terminalOpen}
        onToggle={() => setTerminalOpen(!terminalOpen)}
      />
    </aside>
  )
}
