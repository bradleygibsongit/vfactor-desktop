import { open } from "@tauri-apps/plugin-dialog"

/**
 * Opens a native folder picker dialog
 * @returns The selected folder path, or null if cancelled
 */
export async function openFolderPicker(): Promise<string | null> {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Project Folder",
    })

    // `open` returns string | string[] | null for directory selection
    if (typeof selected === "string") {
      return selected
    }

    return null
  } catch (error) {
    console.error("Failed to open folder picker:", error)
    return null
  }
}
