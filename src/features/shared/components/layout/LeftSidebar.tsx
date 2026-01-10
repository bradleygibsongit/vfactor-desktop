import { useState, useEffect, useRef } from "react"
import {
  Atom,
  Briefcase,
  FolderSimple,
  PlusSquare,
  X,
  CaretRight,
  CaretDown,
  Chat,
  Plus,
} from "@phosphor-icons/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/shared/components/ui/alert-dialog"
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
import { useProjectStore } from "@/features/workspace/store"
import { openFolderPicker } from "@/features/workspace/utils/folderDialog"
import { useChatStore } from "@/features/chat/store"
import { useSidebar } from "./useSidebar"
import { cn } from "@/lib/utils"
import { getTextColorFromName } from "@/lib/utils/colors"
import type { Session } from "@opencode-ai/sdk/client"

export function LeftSidebar() {
  const [quickStartOpen, setQuickStartOpen] = useState(false)
  const [projectToRemove, setProjectToRemove] = useState<{ id: string; name: string } | null>(null)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const restoredSessionsRef = useRef<Set<string>>(new Set())
  const { isCollapsed } = useSidebar()
  const {
    projects,
    selectedProjectId,
    isLoading,
    loadProjects,
    addProject,
    removeProject,
    selectProject,
  } = useProjectStore()

  const {
    chatByProject,
    getProjectChat,
    createSession,
    selectSession,
    initialize: initializeChat,
    client,
    loadSessionsForProject,
  } = useChatStore()

  // Load projects on mount
  useEffect(() => {
    loadProjects()
    initializeChat()
  }, [loadProjects, initializeChat])

  // Auto-expand selected project
  useEffect(() => {
    if (selectedProjectId) {
      setExpandedProjects((prev) => new Set([...prev, selectedProjectId]))
    }
  }, [selectedProjectId])

  // Load sessions when a project is expanded and client is ready
  useEffect(() => {
    if (!client) return
    
    for (const projectId of expandedProjects) {
      const project = projects.find((p) => p.id === projectId)
      const projectChat = getProjectChat(projectId)
      
      if (project?.path) {
        if (projectChat.sessions.length === 0) {
          // Fetch sessions from server if not already loaded
          loadSessionsForProject(projectId, project.path)
        } else if (
          projectChat.activeSessionId && 
          projectId === selectedProjectId &&
          !restoredSessionsRef.current.has(projectId)
        ) {
          // Sessions already loaded from persistence, restore the active session's messages
          restoredSessionsRef.current.add(projectId)
          selectSession(projectId, projectChat.activeSessionId)
        }
      }
    }
  }, [expandedProjects, projects, client, getProjectChat, loadSessionsForProject, selectSession, selectedProjectId])

  const handleOpenProject = async () => {
    const folderPath = await openFolderPicker()
    if (folderPath) {
      await addProject(folderPath)
    }
  }

  const handleRemoveClick = (e: React.MouseEvent, project: { id: string; name: string }) => {
    e.stopPropagation()
    setProjectToRemove(project)
  }

  const handleConfirmRemove = async () => {
    if (projectToRemove) {
      await removeProject(projectToRemove.id)
      setProjectToRemove(null)
    }
  }

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const handleCreateSession = async (e: React.MouseEvent, projectId: string, projectPath: string) => {
    e.stopPropagation()
    console.log("Creating session for project:", projectId, "path:", projectPath, "client:", !!client)
    const session = await createSession(projectId, projectPath)
    console.log("Session created:", session)
  }

  const handleSelectSession = async (projectId: string, sessionId: string) => {
    // First select the project
    selectProject(projectId)
    // Then select the session
    await selectSession(projectId, sessionId)
  }

  const formatSessionTitle = (session: Session | null | undefined): string => {
    if (!session) return "New Session"
    if (session.title) return session.title
    // Fallback to formatted date
    if (session.time?.created) {
      const date = new Date(session.time.created)
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    return `Session ${session.id?.slice(0, 8) ?? "new"}`
  }

  if (isLoading) {
    return (
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col",
          isCollapsed ? "w-12" : "w-[300px] max-w-[300px] min-w-48"
        )}
      >
        {/* Header */}
        <div className="h-12 bg-sidebar border-b border-sidebar-border flex items-center px-4 shrink-0">
          <Atom size={20} weight="duotone" className="text-sidebar-foreground" />
          {!isCollapsed && (
            <span className="ml-2 text-sm font-semibold">Nucleus</span>
          )}
        </div>
        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </aside>
    )
  }

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
            <span className="text-sm font-semibold leading-5">Nucleus</span>
          </div>
        ) : (
          <Atom size={20} weight="duotone" className="text-sidebar-foreground" />
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Projects section */}
        <div className="p-2">
          {!isCollapsed && (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2.5 py-1.5 font-medium">
              Projects
            </div>
          )}

          {projects.length === 0 ? (
            !isCollapsed && (
              <div className="px-2.5 py-4 text-sm text-muted-foreground text-center">
                No projects yet.
                <br />
                <button
                  type="button"
                  onClick={handleOpenProject}
                  className="text-primary hover:underline mt-1"
                >
                  Add a project
                </button>
              </div>
            )
          ) : (
            <div className="space-y-0.5">
              {projects.map((project) => {
                const isSelected = selectedProjectId === project.id
                const isExpanded = expandedProjects.has(project.id)
                const projectChat = getProjectChat(project.id)
                const sessions = projectChat.sessions
                const activeSessionId = projectChat.activeSessionId

                return !isCollapsed ? (
                  <div key={project.id}>
                    {/* Project row */}
                    <div
                      className={cn(
                        "group w-full flex items-center gap-1 px-1.5 py-1.5 rounded-lg transition-colors",
                        isSelected
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      {/* Expand/collapse button */}
                      <button
                        type="button"
                        onClick={() => toggleProjectExpanded(project.id)}
                        className="p-0.5 rounded hover:bg-sidebar-accent/50"
                      >
                        {isExpanded ? (
                          <CaretDown size={14} className="text-muted-foreground" />
                        ) : (
                          <CaretRight size={14} className="text-muted-foreground" />
                        )}
                      </button>

                      {/* Project name */}
                      <button
                        type="button"
                        onClick={() => selectProject(project.id)}
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                      >
                        <Briefcase
                          size={18}
                          weight={isSelected ? "duotone" : "regular"}
                          className={cn("shrink-0", getTextColorFromName(project.name))}
                        />
                        <span className="text-sm font-medium truncate">
                          {project.name}
                        </span>
                      </button>

                      {/* New session button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => handleCreateSession(e, project.id, project.path)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-sidebar-accent transition-opacity"
                            aria-label="New session"
                          >
                            <Plus size={14} className="text-muted-foreground hover:text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">New session</TooltipContent>
                      </Tooltip>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveClick(e, project)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-opacity"
                        aria-label={`Remove ${project.name}`}
                      >
                        <X
                          size={14}
                          className="text-muted-foreground hover:text-destructive"
                        />
                      </button>
                    </div>

                    {/* Sessions list (collapsible) */}
                    {isExpanded && (
                      <div className="ml-4 mt-0.5 space-y-0.5">
                        {sessions.length === 0 ? (
                          <div className="px-2 py-2 text-xs text-muted-foreground">
                            No sessions yet
                          </div>
                        ) : (
                          sessions
                            .filter((session): session is Session => session != null && typeof session.id === "string")
                            .map((session) => {
                              const isActiveSession = activeSessionId === session.id && isSelected
                              return (
                                <button
                                  key={session.id}
                                  type="button"
                                  onClick={() => handleSelectSession(project.id, session.id)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                                    isActiveSession
                                      ? "bg-sidebar-accent/70 text-sidebar-foreground"
                                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                                  )}
                                >
                                  <Chat size={14} className="shrink-0 text-muted-foreground" />
                                  <span className="text-xs truncate flex-1">
                                    {formatSessionTitle(session)}
                                  </span>
                                </button>
                              )
                            })
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Tooltip key={project.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => selectProject(project.id)}
                        className={cn(
                          "w-full flex items-center justify-center p-1.5 rounded-lg transition-colors",
                          isSelected
                            ? "bg-sidebar-accent"
                            : "hover:bg-sidebar-accent/50"
                        )}
                      >
                        <Briefcase
                          size={18}
                          weight={isSelected ? "duotone" : "regular"}
                          className={cn("shrink-0", getTextColorFromName(project.name))}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{project.name}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Add project dropdown */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        {isCollapsed ? (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger className="flex items-center justify-center w-full p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors cursor-pointer">
                  <PlusSquare size={18} weight="bold" />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Add project</TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="end" className="w-48">
              <DropdownMenuItem onClick={handleOpenProject}>
                <FolderSimple size={16} />
                <span>Open project</span>
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
              <span>Add project</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem onClick={handleOpenProject}>
                <FolderSimple size={16} />
                <span>Open project</span>
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

      <AlertDialog open={!!projectToRemove} onOpenChange={(open) => !open && setProjectToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will only remove <strong>{projectToRemove?.name}</strong> from Nucleus.
              The folder and its contents will not be deleted from your computer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}
