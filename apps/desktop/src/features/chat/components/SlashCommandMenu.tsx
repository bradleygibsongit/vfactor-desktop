import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { BookOpen, CheckCircle, Circle, InformationCircle, PencilSimple, Terminal } from "@/components/icons"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/features/shared/components/ui/tooltip"
import { ProjectActionIcon } from "@/features/workspace/components/ProjectActionIcon"
import type { NormalizedCommand } from "../hooks/useCommands"
import type { ThemeId } from "@/features/shared/appearance"

interface SlashCommandMenuBaseProps {
  onClose: () => void
  selectedIndex: number
  className?: string
}

interface SlashCommandListMenuProps extends SlashCommandMenuBaseProps {
  page: "commands"
  commands: NormalizedCommand[]
  query: string
  isLoading: boolean
  onSelect: (command: NormalizedCommand) => void
}

interface SlashThemeMenuProps extends SlashCommandMenuBaseProps {
  page: "themes"
  themes: Array<{ id: ThemeId; label: string }>
  activeThemeId: ThemeId
  onSelectTheme: (themeId: ThemeId, index: number) => void
}

export type SlashCommandMenuProps = SlashCommandListMenuProps | SlashThemeMenuProps

function SlashMenuShell({
  children,
  className,
  containerRef,
}: {
  children: ReactNode
  className?: string
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border/70 bg-popover text-popover-foreground shadow-[0_16px_38px_color-mix(in_oklab,black_10%,transparent)]",
        className
      )}
    >
      {children}
    </div>
  )
}

const slashMenuHeadingClassName =
  "px-2 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-[0.13em] text-muted-foreground/62"

const slashMenuSelectedItemClassName =
  "bg-accent/72 text-accent-foreground"

const slashMenuIdleItemClassName =
  "text-foreground/86 hover:bg-accent/44 hover:text-accent-foreground"

const slashMenuItemClassName =
  "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors"

export function SlashCommandMenu(props: SlashCommandMenuProps) {
  const { onClose, selectedIndex, className } = props
  const isThemePage = props.page === "themes"
  const commands = props.page === "commands" ? props.commands : []
  const isLoading = props.page === "commands" ? props.isLoading : false
  const onSelect = props.page === "commands" ? props.onSelect : null
  const themes = props.page === "themes" ? props.themes : []
  const activeThemeId = props.page === "themes" ? props.activeThemeId : null
  const onSelectTheme = props.page === "themes" ? props.onSelectTheme : null
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)
  const sections = [
    {
      key: "actions",
      label: "System",
      commands: commands.filter((command) => command.section === "actions"),
    },
    {
      key: "custom-actions",
      label: "Custom Actions",
      commands: commands.filter((command) => command.section === "custom-actions"),
    },
    {
      key: "commands",
      label: "Commands",
      commands: commands.filter((command) => command.section === "commands"),
    },
    {
      key: "skills",
      label: "Skills",
      commands: commands.filter((command) => command.section === "skills"),
    },
  ].filter((section) => section.commands.length > 0)

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex === 0) {
      scrollContainerRef.current?.scrollTo({ top: 0 })
      return
    }

    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  if (!isThemePage && isLoading && commands.length === 0) {
    return (
      <SlashMenuShell containerRef={containerRef} className={className}>
        <div className="px-3 py-2.5 text-center text-xs text-muted-foreground">
          Loading commands...
        </div>
      </SlashMenuShell>
    )
  }

  if (!isThemePage && commands.length === 0) {
    return (
      <SlashMenuShell containerRef={containerRef} className={className}>
        <div className="px-3 py-2.5 text-center text-xs text-muted-foreground">
          No commands found
        </div>
      </SlashMenuShell>
    )
  }

  if (isThemePage) {
    return (
      <SlashMenuShell containerRef={containerRef} className={className}>
        <div ref={scrollContainerRef} className="app-scrollbar max-h-64 overflow-y-auto p-1.5">
          <div className={slashMenuHeadingClassName}>
            Themes
          </div>
          <div className="space-y-0.5">
            {themes.map((theme, index) => {
              const isSelected = selectedIndex === index
              const isActive = activeThemeId === theme.id

              return (
                <div
                  key={theme.id}
                  ref={isSelected ? selectedRef : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelectTheme?.(theme.id, index)}
                  className={cn(
                    slashMenuItemClassName,
                    isSelected ? slashMenuSelectedItemClassName : slashMenuIdleItemClassName
                  )}
                >
                  <span className={cn(
                    "flex size-4 shrink-0 items-center justify-center",
                    isSelected ? "text-accent-foreground" : "text-muted-foreground/78"
                  )}>
                    {isActive ? <CheckCircle size={14} /> : <Circle size={14} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{theme.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </SlashMenuShell>
    )
  }

  return (
    <SlashMenuShell containerRef={containerRef} className={className}>
      <div ref={scrollContainerRef} className="app-scrollbar max-h-64 overflow-y-auto p-1.5">
        {sections.map((section, sectionIndex) => {
          let runningIndex = 0
          for (let i = 0; i < sectionIndex; i += 1) {
            runningIndex += sections[i]?.commands.length ?? 0
          }

          return (
            <div key={section.key} className={cn(sectionIndex > 0 && "mt-2")}>
              <div className={slashMenuHeadingClassName}>
                {section.label}
              </div>

              <div className="space-y-0.5">
                {section.commands.map((cmd, index) => {
                  const flatIndex = runningIndex + index
                  const isSelected = selectedIndex === flatIndex
                  const Icon =
                    cmd.icon === "new-chat"
                      ? PencilSimple
                      : cmd.icon === "new-terminal"
                        ? Terminal
                        : cmd.icon === "theme"
                          ? Circle
                        : cmd.icon === "command"
                          ? Terminal
                        : BookOpen
                  return (
                    <div
                      key={cmd.id}
                      ref={isSelected ? selectedRef : undefined}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSelect?.(cmd)}
                      className={cn(
                        slashMenuItemClassName,
                        isSelected ? slashMenuSelectedItemClassName : slashMenuIdleItemClassName
                      )}
                    >
                      {cmd.projectAction ? (
                        <ProjectActionIcon
                          action={cmd.projectAction}
                          size={14}
                          className={cn(
                            "shrink-0",
                            isSelected ? "text-accent-foreground" : "text-muted-foreground/78"
                          )}
                        />
                      ) : (
                        <Icon
                          size={14}
                          className={cn(
                            "shrink-0",
                            isSelected ? "text-accent-foreground" : "text-muted-foreground/78"
                          )}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-medium">
                            {cmd.name}
                          </span>
                          {cmd.inputHint ? (
                            <span className={cn(
                              "truncate text-xs",
                              isSelected ? "text-accent-foreground/78" : "text-muted-foreground/70"
                            )}>
                              {cmd.inputHint}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {cmd.description ? (
                        <InfoTooltip description={cmd.description} isSelected={isSelected} />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </SlashMenuShell>
  )
}

function InfoTooltip({ description, isSelected }: { description: string; isSelected?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "ml-auto shrink-0 rounded-md p-0.5 transition-colors",
            isSelected
              ? "text-accent-foreground/70 hover:bg-[color:color-mix(in_oklab,var(--accent-foreground)_12%,transparent)] hover:text-accent-foreground"
              : "text-muted-foreground/60 hover:bg-accent/55 hover:text-accent-foreground"
          )}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((prev) => !prev)
          }}
          tabIndex={-1}
        >
          <InformationCircle size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        className="max-w-64 text-xs"
      >
        {description}
      </TooltipContent>
    </Tooltip>
  )
}
