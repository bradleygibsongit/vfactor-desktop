import { useState } from "react"
import { ChatContainer, TabBar } from "@/features/chat/components"
import { FileViewer, DiffViewer } from "@/features/editor/components"
import { getDiffData } from "@/features/editor/mocks/mock-diffs"
import { initialTabs } from "@/features/editor/mocks/mock-tabs"
import type { Tab } from "@/features/chat/types"

interface DiffTabContentProps {
  tab: Tab
}

function DiffTabContent({ tab }: DiffTabContentProps) {
  const diffData = getDiffData(tab.filePath ?? tab.title)

  if (!diffData) {
    return <div className="p-4 text-muted-foreground">Diff not found</div>
  }

  return (
    <DiffViewer
      filename={tab.title}
      original={diffData.original}
      modified={diffData.modified}
    />
  )
}

interface TabContentProps {
  tab: Tab | undefined
}

function TabContent({ tab }: TabContentProps) {
  if (!tab || tab.type === "chat") {
    return <ChatContainer />
  }

  if (tab.type === "file") {
    return <FileViewer filename={tab.title} />
  }

  return <DiffTabContent tab={tab} />
}

export function MainContent() {
  const [tabs] = useState<Tab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState("1")

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  return (
    <main className="flex-1 min-w-80 bg-main-content text-main-content-foreground overflow-hidden flex flex-col">
      <TabBar tabs={tabs} activeTabId={activeTabId} onTabChange={setActiveTabId} />
      <div className="flex-1 overflow-hidden">
        <TabContent tab={activeTab} />
      </div>
    </main>
  )
}
