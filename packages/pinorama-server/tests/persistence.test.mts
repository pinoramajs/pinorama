import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { createServer } from "pinorama-server"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

describe("persistence on close", () => {
  let dir: string
  let cwd: string

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "pinorama-persistence-"))
    cwd = process.cwd()
    process.chdir(dir)
  })

  afterEach(() => {
    process.chdir(cwd)
    rmSync(dir, { recursive: true, force: true })
  })

  it("saves the database to dbPath", async () => {
    const dbPath = path.join(dir, "db.msp")
    const server = createServer({ dbPath })
    await server.ready()
    await server.inject({
      method: "POST",
      url: "/bulk",
      payload: [{ msg: "hello", level: 30 }]
    })

    await server.close()

    expect(existsSync(dbPath)).toBe(true)
  })

  it("does not write any file when dbPath is not set", async () => {
    const server = createServer({})
    await server.ready()
    await server.inject({
      method: "POST",
      url: "/bulk",
      payload: [{ msg: "hello", level: 30 }]
    })

    await server.close()

    expect(readdirSync(dir)).toEqual([])
  })
})
