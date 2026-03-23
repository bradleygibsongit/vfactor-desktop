import { useEffect, useState } from "react"
import { Image as ImageIcon, PencilSimple } from "@/components/icons"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/components/ui/dialog"
import { Button } from "@/features/shared/components/ui/button"
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"
import { useProjectAvatar } from "@/features/workspace/hooks/useProjectAvatar"
import type { Project } from "@/features/workspace/types"
import { useProjectStore } from "@/features/workspace/store"
import { openImagePicker } from "@/features/workspace/utils/imageDialog"
import {
  isSupportedImageFilePath,
  SUPPORTED_IMAGE_FILE_EXTENSIONS,
} from "@/features/workspace/utils/imageFiles"

interface ProjectSettingsModalProps {
  open: boolean
  project: Project | null
  onOpenChange: (open: boolean) => void
}

export function ProjectSettingsModal({
  open,
  project,
  onOpenChange,
}: ProjectSettingsModalProps) {
  const { updateProject } = useProjectStore()
  const [name, setName] = useState("")
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [isPickingImage, setIsPickingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !project) {
      return
    }

    setName(project.name)
    setSelectedImageUrl(project.avatarImageUrl?.trim() || undefined)
    setImageError(null)
  }, [open, project])

  const isValid = name.trim().length > 0
  const avatar = useProjectAvatar(
    project
      ? {
          avatarSeed: project.avatarSeed,
          avatarImageUrl: selectedImageUrl,
        }
      : null
  )
  const supportedTypesLabel = SUPPORTED_IMAGE_FILE_EXTENSIONS.map((extension) =>
    extension.toUpperCase()
  ).join(", ")

  const handlePickImage = async () => {
    setIsPickingImage(true)

    try {
      const imagePath = await openImagePicker()
      if (!imagePath) {
        return
      }

      if (!isSupportedImageFilePath(imagePath)) {
        setImageError(`Unsupported image type. Please choose ${supportedTypesLabel}.`)
        return
      }

      setImageError(null)
      setSelectedImageUrl(imagePath)
    } finally {
      setIsPickingImage(false)
    }
  }

  const handleSave = async () => {
    if (!project || !isValid) {
      return
    }

    setIsSaving(true)

    try {
      await updateProject(project.id, {
        name,
        avatarImageUrl: selectedImageUrl,
      })
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agent settings</DialogTitle>
          <DialogDescription>
            Update the name and image for {project?.name ?? "this agent"}.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => void handlePickImage()}
              disabled={isPickingImage}
              className="group relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-border/70 bg-muted/20 transition-colors hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:cursor-wait"
              aria-label="Choose project image"
            >
              {avatar.src && (avatar.status === "custom" || avatar.status === "loading") ? (
                <img
                  src={avatar.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : selectedImageUrl ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
                  <ImageIcon size={22} className="text-muted-foreground" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {avatar.status === "unsupported" ? "Unsupported format" : "Image unavailable"}
                  </span>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PencilSimple size={22} className="text-muted-foreground transition-colors group-hover:text-foreground/72" />
                </div>
              )}
            </button>

            <div className="min-w-0 flex-1 space-y-3 pt-1">
              <div className="space-y-2">
                <Label htmlFor="agent-name" className="sr-only">
                  Project name
                </Label>
                <Input
                  id="agent-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Project name"
                  autoFocus
                  className="h-auto border-0 bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="break-all text-sm text-muted-foreground">
                {project?.path ?? "No folder selected"}
              </div>

              <div className="text-xs text-muted-foreground">
                Click the image to choose a {supportedTypesLabel} file.
              </div>

              {imageError ? (
                <div className="text-xs text-destructive">{imageError}</div>
              ) : null}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={!isValid || isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
