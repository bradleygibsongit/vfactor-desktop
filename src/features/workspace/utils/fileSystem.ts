import { readDir } from "@tauri-apps/plugin-fs"

interface FileTreeItem {
  name: string
  children?: string[]
}

/**
 * Directories to skip when reading project files.
 * These are typically hidden, cache, or build directories that:
 * - Users don't need to see
 * - May have permission issues
 * - Can be very large and slow down the tree
 */
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".svn",
  ".hg",
  "node_modules",
  ".ruff_cache",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".tox",
  ".venv",
  "venv",
  ".env",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".output",
  ".turbo",
  ".cache",
  ".parcel-cache",
  "coverage",
  ".nyc_output",
  "target", // Rust
  ".cargo",
])

/**
 * Check if a file/directory should be ignored.
 */
function shouldIgnore(name: string): boolean {
  // Ignore entries in the ignore list
  if (IGNORED_DIRECTORIES.has(name)) {
    return true
  }
  // Ignore hidden files/folders starting with . (except common config files)
  if (name.startsWith(".") && !isCommonConfigFile(name)) {
    return true
  }
  return false
}

/**
 * Common config files that start with . but should be visible.
 */
function isCommonConfigFile(name: string): boolean {
  const commonConfigs = [
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".gitignore",
    ".dockerignore",
    ".editorconfig",
    ".prettierrc",
    ".eslintrc",
    ".eslintrc.js",
    ".eslintrc.json",
    ".babelrc",
    ".npmrc",
    ".nvmrc",
    ".python-version",
    ".ruby-version",
    ".tool-versions",
  ]
  return commonConfigs.includes(name) || name.startsWith(".env")
}

/**
 * Reads a project directory and returns data in FileTreeViewer format.
 * The format is a flat record where keys are unique IDs and values contain
 * the item name and optional children IDs.
 */
export async function readProjectFiles(
  projectPath: string
): Promise<Record<string, FileTreeItem>> {
  const result: Record<string, FileTreeItem> = {}

  async function processDirectory(dirPath: string, parentId: string | null) {
    let entries
    try {
      entries = await readDir(dirPath)
    } catch (error) {
      // Silently skip directories we can't read (permissions, etc.)
      // This prevents one bad directory from breaking the whole tree
      console.warn(`Skipping unreadable directory ${dirPath}`)
      return
    }

    // Filter out ignored entries, then sort: directories first, then files, alphabetically
    const filtered = entries.filter((e) => !shouldIgnore(e.name))
    const sorted = filtered.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    const childIds: string[] = []

    for (const entry of sorted) {
      // Create unique ID using full path
      const entryPath = `${dirPath}/${entry.name}`
      const id = entryPath

      childIds.push(id)

      if (entry.isDirectory) {
        // Process directory recursively
        result[id] = {
          name: entry.name,
          children: [], // Will be populated by recursive call
        }
        await processDirectory(entryPath, id)
      } else {
        // File entry (no children)
        result[id] = {
          name: entry.name,
        }
      }
    }

    // Update parent's children if it exists
    if (parentId && result[parentId]) {
      result[parentId].children = childIds
    } else if (!parentId) {
      // This is the root - create root entry
      result["root"] = {
        name: projectPath.split("/").pop() || "root",
        children: childIds,
      }
    }
  }

  await processDirectory(projectPath, null)

  return result
}
