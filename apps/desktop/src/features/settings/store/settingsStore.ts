import { create } from "zustand"
import { loadDesktopStore, type DesktopStoreHandle } from "@/desktop/client"
import {
  createDefaultGitResolvePrompts,
  normalizeGitResolvePrompts,
  type GitResolvePrompts,
} from "@/features/shared/components/layout/gitResolve"
import type { GitPullRequestResolveReason } from "@/desktop/contracts"

const STORE_FILE = "settings.json"
const GIT_GENERATION_MODEL_KEY = "gitGenerationModel"
const GIT_RESOLVE_PROMPTS_KEY = "gitResolvePrompts"
const WORKSPACE_SETUP_MODEL_KEY = "workspaceSetupModel"
const CODEX_DEFAULT_MODEL_KEY = "codexDefaultModel"
const CODEX_DEFAULT_REASONING_EFFORT_KEY = "codexDefaultReasoningEffort"
const CODEX_DEFAULT_FAST_MODE_KEY = "codexDefaultFastMode"
const PERSIST_DEBOUNCE_MS = 250

interface SettingsState {
  gitGenerationModel: string
  gitResolvePrompts: GitResolvePrompts
  workspaceSetupModel: string
  codexDefaultModel: string
  codexDefaultReasoningEffort: string
  codexDefaultFastMode: boolean
  hasLoaded: boolean
  initialize: () => Promise<void>
  setGitGenerationModel: (model: string) => void
  setGitResolvePrompt: (reason: GitPullRequestResolveReason, prompt: string) => void
  resetGitResolvePrompts: () => void
  resetGitGenerationModel: () => void
  setWorkspaceSetupModel: (model: string) => void
  resetWorkspaceSetupModel: () => void
  setCodexDefaultModel: (model: string) => void
  resetCodexDefaultModel: () => void
  setCodexDefaultReasoningEffort: (effort: string) => void
  resetCodexDefaultReasoningEffort: () => void
  setCodexDefaultFastMode: (enabled: boolean) => void
  resetCodexDefaultFastMode: () => void
}

let storeInstance: DesktopStoreHandle | null = null
let initializePromise: Promise<void> | null = null
let persistTimeoutId: ReturnType<typeof setTimeout> | null = null

async function getStore(): Promise<DesktopStoreHandle> {
  if (!storeInstance) {
    storeInstance = await loadDesktopStore(STORE_FILE)
  }

  return storeInstance
}

function normalizeGitGenerationModel(model: string | null | undefined): string {
  if (!model) {
    return ""
  }

  return model.trim()
}

function normalizeWorkspaceSetupModel(model: string | null | undefined): string {
  if (!model) {
    return ""
  }

  return model.trim()
}

function normalizeCodexDefaultModel(model: string | null | undefined): string {
  if (!model) {
    return ""
  }

  return model.trim()
}

function normalizeCodexDefaultReasoningEffort(
  effort: string | null | undefined
): string {
  if (!effort) {
    return ""
  }

  return effort.trim()
}

function normalizeCodexDefaultFastMode(enabled: boolean | null | undefined): boolean {
  return enabled === true
}

function schedulePersist(settings: {
  gitGenerationModel: string
  gitResolvePrompts: GitResolvePrompts
  workspaceSetupModel: string
  codexDefaultModel: string
  codexDefaultReasoningEffort: string
  codexDefaultFastMode: boolean
}): void {
  if (persistTimeoutId != null) {
    clearTimeout(persistTimeoutId)
  }

  persistTimeoutId = setTimeout(() => {
    persistTimeoutId = null

    void (async () => {
      try {
        const store = await getStore()
        await store.set(GIT_GENERATION_MODEL_KEY, settings.gitGenerationModel)
        await store.set(GIT_RESOLVE_PROMPTS_KEY, settings.gitResolvePrompts)
        await store.set(WORKSPACE_SETUP_MODEL_KEY, settings.workspaceSetupModel)
        if (settings.codexDefaultModel.length > 0) {
          await store.set(CODEX_DEFAULT_MODEL_KEY, settings.codexDefaultModel)
        } else {
          await store.delete(CODEX_DEFAULT_MODEL_KEY)
        }
        if (settings.codexDefaultReasoningEffort.length > 0) {
          await store.set(CODEX_DEFAULT_REASONING_EFFORT_KEY, settings.codexDefaultReasoningEffort)
        } else {
          await store.delete(CODEX_DEFAULT_REASONING_EFFORT_KEY)
        }
        if (settings.codexDefaultFastMode) {
          await store.set(CODEX_DEFAULT_FAST_MODE_KEY, true)
        } else {
          await store.delete(CODEX_DEFAULT_FAST_MODE_KEY)
        }
        await store.save()
      } catch (error) {
        console.error("Failed to persist settings:", error)
      }
    })()
  }, PERSIST_DEBOUNCE_MS)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  gitGenerationModel: "",
  gitResolvePrompts: createDefaultGitResolvePrompts(),
  workspaceSetupModel: "",
  codexDefaultModel: "",
  codexDefaultReasoningEffort: "",
  codexDefaultFastMode: false,
  hasLoaded: false,

  initialize: async () => {
    if (get().hasLoaded) {
      return
    }

    if (initializePromise) {
      return initializePromise
    }

    initializePromise = (async () => {
      try {
        const store = await getStore()
        const savedModel = await store.get<string>(GIT_GENERATION_MODEL_KEY)
        const savedResolvePrompts =
          await store.get<Partial<Record<GitPullRequestResolveReason, string>>>(GIT_RESOLVE_PROMPTS_KEY)
        const savedWorkspaceSetupModel = await store.get<string>(WORKSPACE_SETUP_MODEL_KEY)
        const savedCodexDefaultModel = await store.get<string>(CODEX_DEFAULT_MODEL_KEY)
        const savedCodexDefaultReasoningEffort = await store.get<string>(
          CODEX_DEFAULT_REASONING_EFFORT_KEY
        )
        const savedCodexDefaultFastMode = await store.get<boolean>(CODEX_DEFAULT_FAST_MODE_KEY)

        set({
          gitGenerationModel: normalizeGitGenerationModel(savedModel),
          gitResolvePrompts: normalizeGitResolvePrompts(savedResolvePrompts),
          workspaceSetupModel: normalizeWorkspaceSetupModel(savedWorkspaceSetupModel),
          codexDefaultModel: normalizeCodexDefaultModel(savedCodexDefaultModel),
          codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
            savedCodexDefaultReasoningEffort
          ),
          codexDefaultFastMode: normalizeCodexDefaultFastMode(savedCodexDefaultFastMode),
          hasLoaded: true,
        })
      } catch (error) {
        console.error("Failed to load settings:", error)
        set({
          gitGenerationModel: "",
          gitResolvePrompts: createDefaultGitResolvePrompts(),
          workspaceSetupModel: "",
          codexDefaultModel: "",
          codexDefaultReasoningEffort: "",
          codexDefaultFastMode: false,
          hasLoaded: true,
        })
      }
    })().finally(() => {
      initializePromise = null
    })

    return initializePromise
  },

  setGitGenerationModel: (model) => {
    const normalized = normalizeGitGenerationModel(model)
    set({ gitGenerationModel: normalized })
    schedulePersist({
      gitGenerationModel: normalized,
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  resetGitGenerationModel: () => {
    set({ gitGenerationModel: "" })
    schedulePersist({
      gitGenerationModel: "",
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  setGitResolvePrompt: (reason, prompt) => {
    const nextPrompts = {
      ...get().gitResolvePrompts,
      [reason]: prompt.replace(/\r\n/g, "\n"),
    }
    set({ gitResolvePrompts: nextPrompts })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: nextPrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  resetGitResolvePrompts: () => {
    const nextPrompts = createDefaultGitResolvePrompts()
    set({ gitResolvePrompts: nextPrompts })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: nextPrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  setWorkspaceSetupModel: (model) => {
    const normalized = normalizeWorkspaceSetupModel(model)
    set({ workspaceSetupModel: normalized })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalized,
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  resetWorkspaceSetupModel: () => {
    set({ workspaceSetupModel: "" })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: "",
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  setCodexDefaultModel: (model) => {
    const normalized = normalizeCodexDefaultModel(model)
    set({ codexDefaultModel: normalized })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalized,
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  resetCodexDefaultModel: () => {
    set({ codexDefaultModel: "" })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: "",
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  setCodexDefaultReasoningEffort: (effort) => {
    const normalized = normalizeCodexDefaultReasoningEffort(effort)
    set({ codexDefaultReasoningEffort: normalized })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalized,
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  resetCodexDefaultReasoningEffort: () => {
    set({ codexDefaultReasoningEffort: "" })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: "",
      codexDefaultFastMode: normalizeCodexDefaultFastMode(get().codexDefaultFastMode),
    })
  },

  setCodexDefaultFastMode: (enabled) => {
    const normalized = normalizeCodexDefaultFastMode(enabled)
    set({ codexDefaultFastMode: normalized })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: normalized,
    })
  },

  resetCodexDefaultFastMode: () => {
    set({ codexDefaultFastMode: false })
    schedulePersist({
      gitGenerationModel: normalizeGitGenerationModel(get().gitGenerationModel),
      gitResolvePrompts: get().gitResolvePrompts,
      workspaceSetupModel: normalizeWorkspaceSetupModel(get().workspaceSetupModel),
      codexDefaultModel: normalizeCodexDefaultModel(get().codexDefaultModel),
      codexDefaultReasoningEffort: normalizeCodexDefaultReasoningEffort(
        get().codexDefaultReasoningEffort
      ),
      codexDefaultFastMode: false,
    })
  },
}))

export {
  normalizeCodexDefaultFastMode,
  normalizeCodexDefaultModel,
  normalizeCodexDefaultReasoningEffort,
  normalizeGitGenerationModel,
  normalizeWorkspaceSetupModel,
}
