import { useState } from "react"
import { motion } from "framer-motion"
import { LeftSidebar } from "./LeftSidebar"
import { MainContent } from "./MainContent"
import { RightSidebar } from "./RightSidebar"
import { SidebarProvider } from "./SidebarContext"
import { RightSidebarProvider } from "./RightSidebarContext"
import { CenterToolbar } from "./CenterToolbar"
import type { SettingsSectionId } from "@/features/settings/config"
import { AppUpdateBootstrap } from "@/features/updates/components/AppUpdateBootstrap"
import { UpdateBlockedDialog } from "@/features/updates/components/UpdateBlockedDialog"
import { UpdateReadyToast } from "@/features/updates/components/UpdateReadyToast"
import { HarnessBootstrap } from "@/features/chat/components/HarnessBootstrap"
import {
  MIN_MAIN_CONTENT_WIDTH,
  SIDEBAR_CLOSE_DURATION_S,
  SIDEBAR_OPEN_DURATION_S,
} from "./layoutSizing"
import { useSidebar } from "./useSidebar"

function AppLayoutFrame({
  activeView,
  activeSettingsSection,
  onOpenChat,
  onOpenAutomations,
  onOpenSettings,
  onSelectSettingsSection,
}: {
  activeView: "chat" | "settings" | "automations"
  activeSettingsSection: SettingsSectionId
  onOpenChat: () => void
  onOpenAutomations: () => void
  onOpenSettings: () => void
  onSelectSettingsSection: (section: SettingsSectionId) => void
}) {
  const { isCollapsed, width } = useSidebar()
  const leftSidebarWidth = isCollapsed ? 0 : width
  const mainContentShiftTransition = isCollapsed
    ? { duration: SIDEBAR_CLOSE_DURATION_S, ease: [0.23, 1, 0.32, 1] as const }
    : { duration: SIDEBAR_OPEN_DURATION_S, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div
      className="grid h-screen overflow-hidden bg-background text-foreground"
      style={{ gridTemplateRows: "2.75rem minmax(0, 1fr)" }}
    >
      <div className="min-w-0 overflow-hidden" style={{ gridRow: 1 }}>
        <CenterToolbar activeView={activeView} />
      </div>

      <div className="relative min-h-0 min-w-0 overflow-hidden" style={{ gridRow: 2 }}>
        <motion.div
          initial={false}
          animate={{ width: leftSidebarWidth }}
          transition={mainContentShiftTransition}
          className="absolute inset-y-0 left-0 z-10 min-h-0 min-w-0 overflow-hidden"
        >
          <LeftSidebar
            activeView={activeView}
            activeSettingsSection={activeSettingsSection}
            onOpenChat={onOpenChat}
            onOpenAutomations={onOpenAutomations}
            onOpenSettings={onOpenSettings}
            onSelectSettingsSection={onSelectSettingsSection}
          />
        </motion.div>

        <motion.div
          initial={false}
          animate={{ left: leftSidebarWidth }}
          transition={mainContentShiftTransition}
          className="absolute inset-y-0 right-0 flex min-h-0 min-w-0 overflow-hidden"
        >
          <div className="flex flex-1 flex-col" style={{ minWidth: `${MIN_MAIN_CONTENT_WIDTH}px` }}>
            <MainContent
              activeView={activeView}
              activeSettingsSection={activeSettingsSection}
              onOpenSettings={onOpenSettings}
            />
          </div>
          <RightSidebar activeView={activeView} />
        </motion.div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [activeView, setActiveView] = useState<"chat" | "settings" | "automations">("chat")
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSectionId>("git")

  return (
    <SidebarProvider>
      <RightSidebarProvider>
        <HarnessBootstrap />
        <AppUpdateBootstrap />
        <AppLayoutFrame
          activeView={activeView}
          activeSettingsSection={activeSettingsSection}
          onOpenChat={() => setActiveView("chat")}
          onOpenAutomations={() => setActiveView("automations")}
          onOpenSettings={() => setActiveView("settings")}
          onSelectSettingsSection={setActiveSettingsSection}
        />
        <UpdateReadyToast />
        <UpdateBlockedDialog />
      </RightSidebarProvider>
    </SidebarProvider>
  )
}
