import { useState } from "react"
import { Command } from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/features/shared/components/ui/dialog"
import { Button } from "@/features/shared/components/ui/button"
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"
import { DEFAULT_REPOS_PATH } from "../../constants"

interface QuickStartModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickStartModal({ open, onOpenChange }: QuickStartModalProps) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState(DEFAULT_REPOS_PATH)

  const handleCreate = () => {
    // TODO: Implement create functionality
    console.log({ name, location })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick start</DialogTitle>
          <DialogDescription>
            Conductor will create a new folder and Github repo for you.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="my-awesome-project"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Location field */}
          <div className="space-y-2">
            <Label htmlFor="project-location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="project-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Browse...</Button>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleCreate}>
            Create
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-primary-foreground/70">
              <Command size={12} />
              <span></span>
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
