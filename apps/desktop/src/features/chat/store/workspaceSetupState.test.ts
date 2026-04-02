import { describe, expect, test } from "bun:test"
import { createWorkspaceSetupState } from "./workspaceSetupState"

describe("createWorkspaceSetupState", () => {
  test("marks earlier steps completed and the current step active while running", () => {
    const state = createWorkspaceSetupState("create-workspace", {
      detail: "Fix first turn setup",
    })

    expect(state.status).toBe("running")
    expect(state.detail).toBe("Fix first turn setup")
    expect(state.steps.map((step) => step.status)).toEqual([
      "completed",
      "completed",
      "active",
      "pending",
    ])
  })

  test("marks the active step as error when setup fails", () => {
    const state = createWorkspaceSetupState("generate-workspace-name", {
      status: "error",
      errorMessage: "The model did not return valid naming.",
    })

    expect(state.status).toBe("error")
    expect(state.errorMessage).toBe("The model did not return valid naming.")
    expect(state.steps.map((step) => step.status)).toEqual([
      "completed",
      "error",
      "pending",
      "pending",
    ])
  })
})
