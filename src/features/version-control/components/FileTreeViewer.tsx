import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core"
import { useTree } from "@headless-tree/react"
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react"
import { Tree, TreeItem, TreeItemLabel } from "@/features/shared/components/ui/tree"
import type { FileTreeItem } from "../types"

interface FileTreeViewerProps {
  data: Record<string, FileTreeItem>
  rootId?: string
  initialExpanded?: string[]
  indent?: number
  className?: string
}

export function FileTreeViewer({
  data,
  rootId = "root",
  initialExpanded = [],
  indent = 20,
  className,
}: FileTreeViewerProps) {
  const tree = useTree<FileTreeItem>({
    initialState: {
      expandedItems: initialExpanded,
    },
    indent,
    rootItemId: rootId,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => data[itemId],
      getChildren: (itemId) => data[itemId]?.children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  })

  return (
    <Tree indent={indent} tree={tree} className={className}>
      {tree.getItems().map((item) => (
        <TreeItem key={item.getId()} item={item}>
          <TreeItemLabel className="before:bg-sidebar relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10">
            <span className="flex items-center gap-2">
              {item.isFolder() ? (
                item.isExpanded() ? (
                  <FolderOpenIcon className="text-muted-foreground pointer-events-none size-4" />
                ) : (
                  <FolderIcon className="text-muted-foreground pointer-events-none size-4" />
                )
              ) : (
                <FileIcon className="text-muted-foreground pointer-events-none size-4" />
              )}
              {item.getItemName()}
            </span>
          </TreeItemLabel>
        </TreeItem>
      ))}
    </Tree>
  )
}
