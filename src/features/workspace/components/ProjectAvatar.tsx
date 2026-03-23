import type { Project } from "@/features/workspace/types"
import { useProjectAvatar } from "@/features/workspace/hooks/useProjectAvatar"
import { getAvatarColorForSeed } from "@/features/workspace/utils/avatar"
import { cn } from "@/lib/utils"

interface ProjectAvatarProps {
  project: Project
  className?: string
}

export function ProjectAvatar({ project, className }: ProjectAvatarProps) {
  const { src } = useProjectAvatar(project)

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("shrink-0 rounded-[20%] object-cover", className)}
      />
    )
  }

  const letter = (project.name[0] ?? "?").toUpperCase()
  const bg = getAvatarColorForSeed(project.avatarSeed)

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[20%] font-semibold text-white",
        className,
      )}
      style={{ backgroundColor: bg, fontSize: "45%" }}
    >
      {letter}
    </div>
  )
}
