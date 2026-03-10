import { Plus, Sidebar } from "@/components/icons"
import { useSidebar } from "./useSidebar"
import { useRightSidebar } from "./useRightSidebar"
import { Button } from "@/features/shared/components/ui/button"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/features/workspace/store"
import { useChatStore } from "@/features/chat/store"

interface TitleBarProps {
  activeView?: "chat" | "settings"
  onOpenChat?: () => void
}

export function TitleBar({ activeView = "chat", onOpenChat }: TitleBarProps) {
  const { isCollapsed, toggle: toggleLeft } = useSidebar()
  const { toggle: toggleRight } = useRightSidebar()
  const { projects, selectedProjectId, selectProject } = useProjectStore()
  const { openDraftSession } = useChatStore()
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null

  const handleCreateThread = async () => {
    if (!selectedProject) {
      return
    }

    onOpenChat?.()
    await selectProject(selectedProject.id)
    await openDraftSession(selectedProject.id, selectedProject.path)
  }

  return (
    <header
      className={cn(
        "relative flex h-11 shrink-0 items-center gap-3 border-b border-sidebar-border/70 bg-[var(--sidebar-glass)] px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--sidebar-glass-strong)]",
        activeView === "chat" && "text-sidebar-foreground",
      )}
    >
      <div className="w-20 shrink-0" aria-hidden="true" />

      <div className="hidden shrink-0 items-center gap-1 md:flex">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleLeft}
          className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          aria-label="Toggle left sidebar"
        >
          <Sidebar size={14} />
        </Button>
        {isCollapsed && activeView === "chat" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => void handleCreateThread()}
            disabled={!selectedProject}
            className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            aria-label="New thread"
          >
            <Plus size={14} />
          </Button>
        ) : null}
      </div>

      <div data-tauri-drag-region className="min-w-0 flex-1 self-stretch" />

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          onClick={toggleLeft}
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:hidden"
          aria-label="Toggle left sidebar"
        >
          <Sidebar size={14} />
        </Button>
        {isCollapsed && activeView === "chat" ? (
          <Button
            type="button"
            onClick={() => void handleCreateThread()}
            variant="ghost"
            size="icon-sm"
            disabled={!selectedProject}
            className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:hidden"
            aria-label="New thread"
          >
            <Plus size={14} />
          </Button>
        ) : null}
        {activeView === "chat" ? (
          <Button
            type="button"
            onClick={toggleRight}
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Toggle right sidebar"
          >
            <Sidebar size={14} className="scale-x-[-1]" />
          </Button>
        ) : null}
      </div>
    </header>
  )
}
