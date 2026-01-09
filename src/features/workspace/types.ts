export interface Workspace {
  id: string
  branchName: string
  name: string
  lastActive: Date
  diffCount?: number
  isLoading?: boolean
  needsAttention?: boolean
}

export interface Repository {
  id: string
  name: string
  path: string
  collapsed: boolean
  workspaces: Workspace[]
}
