import { readdirSync, readFileSync } from "node:fs"
import { isBuiltin } from "node:module"
import { describe, expect, it } from "vitest"

const packageRoot = new URL("../", import.meta.url)
const srcDir = new URL("src/", packageRoot)

const packageJson = JSON.parse(
  readFileSync(new URL("package.json", packageRoot), "utf8")
)

// captures the specifier of every import statement, except `import type`
const importRegex = /^import\s+(?!type\s)[^"']*["']([^"']+)["']/gm

function getRuntimeImports() {
  const packages = new Set<string>()

  const files = readdirSync(srcDir, { recursive: true, encoding: "utf8" })
  for (const file of files.filter((file) => file.endsWith(".mts"))) {
    const source = readFileSync(new URL(file, srcDir), "utf8")

    for (const match of source.matchAll(importRegex)) {
      const specifier = match[1]
      if (!specifier || specifier.startsWith(".") || isBuiltin(specifier)) {
        continue
      }

      const [scope, name] = specifier.split("/")
      packages.add(specifier.startsWith("@") ? `${scope}/${name}` : `${scope}`)
    }
  }

  return [...packages]
}

describe("package.json", () => {
  it("should declare every package imported at runtime as a dependency", () => {
    const declared = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.peerDependencies
    })

    const undeclared = getRuntimeImports().filter(
      (name) => !declared.includes(name)
    )

    expect(undeclared).toEqual([])
  })
})
