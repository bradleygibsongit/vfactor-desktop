import { readdir } from "node:fs/promises"
import path from "node:path"

async function collectTestFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "out") {
          return []
        }

        return collectTestFiles(entryPath)
      }

      return entry.isFile() && entry.name.endsWith(".test.ts") ? [entryPath] : []
    })
  )

  return files.flat()
}

const testFiles = (await collectTestFiles(process.cwd())).sort()

if (testFiles.length === 0) {
  console.log("No test files found.")
  process.exit(0)
}

for (const testFile of testFiles) {
  const relativePath = path.relative(process.cwd(), testFile)
  console.log(`\n==> ${relativePath}`)

  const proc = Bun.spawnSync(["bun", "test", relativePath], {
    stdout: "inherit",
    stderr: "inherit",
  })

  if (proc.exitCode !== 0) {
    process.exit(proc.exitCode)
  }
}
