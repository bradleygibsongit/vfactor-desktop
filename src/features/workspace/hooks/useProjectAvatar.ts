import { useEffect, useState } from "react"
import { readFile } from "@tauri-apps/plugin-fs"
import {
  getImageMimeType,
  isDirectImageUrl,
  isSupportedImageFilePath,
} from "../utils/imageFiles"

type ProjectAvatarInput = {
  avatarSeed: string
  avatarImageUrl?: string
}

export type ProjectAvatarStatus = "default" | "loading" | "custom" | "broken" | "unsupported"

interface ProjectAvatarState {
  src: string | null
  status: ProjectAvatarStatus
}

export function useProjectAvatar(project: ProjectAvatarInput | null): ProjectAvatarState {
  const [state, setState] = useState<ProjectAvatarState>({
    src: null,
    status: "default",
  })

  useEffect(() => {
    const avatarImageUrl = project?.avatarImageUrl?.trim()

    if (!project || !avatarImageUrl) {
      setState({ src: null, status: "default" })
      return
    }

    if (isDirectImageUrl(avatarImageUrl)) {
      setState({ src: avatarImageUrl, status: "custom" })
      return
    }

    if (!isSupportedImageFilePath(avatarImageUrl)) {
      setState({ src: null, status: "unsupported" })
      return
    }

    const mimeType = getImageMimeType(avatarImageUrl)
    let objectUrl: string | null = null
    let isCancelled = false

    setState({ src: null, status: "loading" })

    void readFile(avatarImageUrl)
      .then((bytes) => {
        if (isCancelled || !mimeType) {
          return
        }

        objectUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
        setState({ src: objectUrl, status: "custom" })
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ src: null, status: "broken" })
        }
      })

    return () => {
      isCancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [project])

  return state
}
