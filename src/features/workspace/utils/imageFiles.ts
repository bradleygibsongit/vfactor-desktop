export const SUPPORTED_IMAGE_FILE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"] as const

const IMAGE_MIME_TYPES: Record<(typeof SUPPORTED_IMAGE_FILE_EXTENSIONS)[number], string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
}

export function getImageFileExtension(path: string): string | null {
  const sanitizedPath = path.split(/[?#]/)[0] ?? path
  const dotIndex = sanitizedPath.lastIndexOf(".")

  if (dotIndex === -1 || dotIndex === sanitizedPath.length - 1) {
    return null
  }

  return sanitizedPath.slice(dotIndex + 1).toLowerCase()
}

export function isSupportedImageFilePath(path: string): boolean {
  const extension = getImageFileExtension(path)
  return extension != null && extension in IMAGE_MIME_TYPES
}

export function getImageMimeType(path: string): string | null {
  const extension = getImageFileExtension(path)

  if (!extension || !(extension in IMAGE_MIME_TYPES)) {
    return null
  }

  return IMAGE_MIME_TYPES[extension as keyof typeof IMAGE_MIME_TYPES]
}

export function isDirectImageUrl(path: string): boolean {
  return /^(https?:|data:|blob:|asset:)/.test(path)
}
