import { useState } from "react"
import {
  Atom,
  ChatCircle,
  Folder,
  FolderOpen,
  FolderSimple,
  GlobeSimple,
  PlusSquare,
} from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/features/shared/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/features/shared/components/ui/tooltip"
import { QuickStartModal } from "@/features/workspace/components/modals"
import { useWorkspaceState } from "@/features/workspace/hooks/useWorkspaceState"
import { useSidebar } from "./useSidebar"
import { cn } from "@/lib/utils"
import { getTextColorFromName } from "@/lib/utils/colors"

// Mock chats data
const mockChats = [
  { id: "chat-1", title: "Debug auth flow", lastActive: new Date(Date.now() - 5 * 60 * 1000) },
  { id: "chat-2", title: "Refactor sidebar component", lastActive: new Date(Date.now() - 30 * 60 * 1000) },
  { id: "chat-3", title: "Add dark mode support", lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: "chat-4", title: "Fix TypeScript errors", lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000) },
]

export function LeftSidebar() {
  const [quickStartOpen, setQuickStartOpen] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const { isCollapsed } = useSidebar()
  const {
    repositories,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  } = useWorkspaceState()

  // Flatten all workspaces from all repositories
  const allWorkspaces = repositories.flatMap((repo) =>
    repo.workspaces.map((ws) => ({ ...ws, repoName: repo.name }))
  )

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col overflow-hidden",
        isCollapsed ? "w-12" : "w-[300px] max-w-[300px] min-w-48"
      )}
    >
      {/* App branding header */}
      <div className="h-12 bg-sidebar border-b border-sidebar-border flex items-center px-4 shrink-0">
        {!isCollapsed ? (
          <div className="inline-flex items-center gap-2 text-sidebar-foreground">
            <Atom size={20} weight="duotone" className="shrink-0" />
            <span className="text-sm font-semibold leading-5">Nucleas</span>
          </div>
        ) : (
          <Atom size={20} weight="duotone" className="text-sidebar-foreground" />
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Projects/Workspaces section */}
        <div className="p-2">
          {!isCollapsed && (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2.5 py-1.5 font-medium">
              Projects
            </div>
          )}
          <div className="space-y-1">
            {allWorkspaces.map((workspace) => {
              const isSelected = selectedWorkspaceId === workspace.id && !selectedChatId
              const FolderIcon = isSelected ? FolderOpen : Folder
              
              return !isCollapsed ? (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => {
                    setSelectedWorkspaceId(workspace.id)
                    setSelectedChatId(null)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-lg transition-colors",
                    isSelected
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <FolderIcon
                    size={20}
                    weight="duotone"
                    className={cn("shrink-0", getTextColorFromName(workspace.name))}
                  />
                  <span className="text-sm font-medium truncate">{workspace.name}</span>
                </button>
              ) : (
                <Tooltip key={workspace.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWorkspaceId(workspace.id)
                        setSelectedChatId(null)
                      }}
                      className={cn(
                        "w-full flex items-center justify-center p-1.5 rounded-lg transition-colors",
                        isSelected
                          ? "bg-sidebar-accent"
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <FolderIcon
                        size={18}
                        weight="duotone"
                        className={cn("shrink-0", getTextColorFromName(workspace.name))}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{workspace.name}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Chats section - more prominent style */}
        <div className="px-2 pt-3 pb-1">
          {!isCollapsed && (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1.5 font-medium">
              Chats
            </div>
          )}
          <div className="space-y-0.5">
            {mockChats.map((chat) => (
              !isCollapsed ? (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => {
                    setSelectedChatId(chat.id)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-lg transition-colors",
                    selectedChatId === chat.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <ChatCircle size={16} weight="duotone" className="shrink-0 opacity-60" />
                  <span className="text-sm truncate">{chat.title}</span>
                </button>
              ) : (
                <Tooltip key={chat.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      className={cn(
                        "w-full flex items-center justify-center p-1.5 rounded-lg transition-colors",
                        selectedChatId === chat.id
                          ? "bg-sidebar-accent"
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <ChatCircle size={16} weight="duotone" className="opacity-60" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{chat.title}</TooltipContent>
                </Tooltip>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        {isCollapsed ? (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger className="flex items-center justify-center w-full p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors cursor-pointer">
                  <PlusSquare size={18} weight="bold" />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Add workspace</TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="end" className="w-48">
              <DropdownMenuItem>
                <FolderSimple size={16} />
                <span>Open project</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GlobeSimple size={16} />
                <span>Clone from URL</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuickStartOpen(true)}>
                <PlusSquare size={16} />
                <span>Quick start</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors cursor-pointer">
              <PlusSquare size={16} weight="bold" />
              <span>Add workspace</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem>
                <FolderSimple size={16} />
                <span>Open project</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GlobeSimple size={16} />
                <span>Clone from URL</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuickStartOpen(true)}>
                <PlusSquare size={16} />
                <span>Quick start</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <QuickStartModal open={quickStartOpen} onOpenChange={setQuickStartOpen} />
    </aside>
  )
}
