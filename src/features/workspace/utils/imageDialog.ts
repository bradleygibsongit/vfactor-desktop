import { open } from "@tauri-apps/plugin-dialog"
import { SUPPORTED_IMAGE_FILE_EXTENSIONS } from "./imageFiles"

/**
 * Opens a native file picker dialog scoped to supported image files.
 * Returns the selected file path, or null if the picker is cancelled.
 */
export async function openImagePicker(): Promise<string | null> {
  try {
    const selected = await open({
      directory: false,
      multiple: false,
      title: "Select Agent Image",
      filters: [
        {
          name: "Images",
          extensions: [...SUPPORTED_IMAGE_FILE_EXTENSIONS],
        },
      ],
    })

    if (typeof selected === "string") {
      return selected
    }

    return null
  } catch (error) {
    console.error("Failed to open image picker:", error)
    return null
  }
}
