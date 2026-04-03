import type {
  WorkspaceSetupState,
  WorkspaceSetupStep,
  WorkspaceSetupStepId,
} from "./storeTypes"

const WORKSPACE_SETUP_STEP_LABELS: Array<{
  id: WorkspaceSetupStepId
  label: string
}> = [
  { id: "review-request", label: "Review your request" },
  { id: "generate-workspace-name", label: "Generate workspace name" },
  { id: "create-workspace", label: "Create branch and workspace" },
  { id: "prepare-chat-session", label: "Prepare chat session" },
]

export function createWorkspaceSetupState(
  activeStepId: WorkspaceSetupStepId,
  options: {
    status?: WorkspaceSetupState["status"]
    title?: string
    detail?: string | null
    errorMessage?: string | null
  } = {},
): WorkspaceSetupState {
  const activeIndex = WORKSPACE_SETUP_STEP_LABELS.findIndex((step) => step.id === activeStepId)
  const resolvedActiveIndex = activeIndex >= 0 ? activeIndex : 0
  const status = options.status ?? "running"

  const steps: WorkspaceSetupStep[] = WORKSPACE_SETUP_STEP_LABELS.map((step, index) => ({
    id: step.id,
    label: step.label,
    status:
      index < resolvedActiveIndex
        ? "completed"
        : index === resolvedActiveIndex
          ? status === "error"
            ? "error"
            : "active"
          : "pending",
  }))

  return {
    status,
    title: options.title ?? (status === "error" ? "Workspace setup failed" : "Setting up workspace"),
    detail: options.detail ?? null,
    errorMessage: options.errorMessage ?? null,
    activeStepId: WORKSPACE_SETUP_STEP_LABELS[resolvedActiveIndex]?.id ?? "review-request",
    steps,
  }
}
