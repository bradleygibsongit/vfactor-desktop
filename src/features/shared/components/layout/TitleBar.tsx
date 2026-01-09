import { Sidebar } from "@phosphor-icons/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useSidebar } from "./useSidebar"
import { useRightSidebar } from "./useRightSidebar"

export function TitleBar() {
  const { toggle: toggleLeft } = useSidebar()
  const { toggle: toggleRight } = useRightSidebar()

  const handleMouseDown = async (_e: React.MouseEvent) => {
    await getCurrentWindow().startDragging()
  }

  const handleDoubleClick = async (_e: React.MouseEvent) => {
    await getCurrentWindow().toggleMaximize()
  }

  return (
    <header
      data-tauri-drag-region
      className="h-8 flex items-center justify-end shrink-0 select-none bg-sidebar border-b border-sidebar-border"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Right - Sidebar toggle buttons */}
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={toggleLeft}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Toggle left sidebar"
        >
          <Sidebar size={14} />
        </button>
        <button
          type="button"
          onClick={toggleRight}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Toggle right sidebar"
        >
          <Sidebar size={14} className="scale-x-[-1]" />
        </button>
      </div>
    </header>
  )
}
