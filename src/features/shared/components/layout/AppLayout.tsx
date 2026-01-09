import { TitleBar } from "./TitleBar"
import { LeftSidebar } from "./LeftSidebar"
import { MainContent } from "./MainContent"
import { RightSidebar } from "./RightSidebar"
import { SidebarProvider } from "./SidebarContext"
import { RightSidebarProvider } from "./RightSidebarContext"

export function AppLayout() {
  return (
    <SidebarProvider>
      <RightSidebarProvider>
        <div className="flex flex-col h-screen bg-background">
          <TitleBar />
          <div className="flex flex-1 overflow-hidden">
            <LeftSidebar />
            <MainContent />
            <RightSidebar />
          </div>
        </div>
      </RightSidebarProvider>
    </SidebarProvider>
  )
}
