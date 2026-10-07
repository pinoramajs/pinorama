import { spawn } from "node:child_process"
import { once } from "node:events"
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs"
import net from "node:net"
import os from "node:os"
import path from "node:path"
import { setTimeout as sleep } from "node:timers/promises"
import { fileURLToPath } from "node:url"
import { PinoramaClient } from "pinorama-client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

const cliPath = fileURLToPath(new URL("../cli.mjs", import.meta.url))

const logs = [
  { level: 30, time: 1, msg: "one" },
  { level: 30, time: 2, msg: "two" },
  { level: 30, time: 3, msg: "three" }
]

async function freePort() {
  const server = net.createServer().listen(0)
  await once(server, "listening")
  const { port } = server.address()
  server.close()
  return port
}

async function waitFor(fn, timeout = 10_000) {
  const start = Date.now()
  let lastError
  while (Date.now() - start < timeout) {
    try {
      const result = await fn()
      if (result) return result
    } catch (error) {
      lastError = error
    }
    await sleep(50)
  }
  throw new Error(`timeout${lastError ? `: ${lastError.message}` : ""}`)
}

describe("cli shutdown", () => {
  let tmp
  let port
  let url
  let children

  beforeEach(async () => {
    tmp = mkdtempSync(path.join(os.tmpdir(), "pinorama-cli-"))
    port = await freePort()
    url = `http://localhost:${port}/pinorama`
    children = []
  })

  afterEach(async () => {
    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGKILL")
        await once(child, "exit")
      }
    }
    rmSync(tmp, { recursive: true, force: true })
  })

  function start(args) {
    const child = spawn(process.execPath, [cliPath, "--port", port, ...args], {
      cwd: tmp,
      env: { ...process.env, TMPDIR: tmp },
      stdio: ["pipe", "pipe", "pipe"]
    })
    child.output = ""
    child.stdout.on("data", (chunk) => {
      child.output += chunk
    })
    child.stderr.on("data", (chunk) => {
      child.output += chunk
    })
    children.push(child)
    return child
  }

  async function stop(child, signal) {
    child.kill(signal)
    const [code, sig] = await once(child, "exit")
    return { code, signal: sig }
  }

  for (const signal of ["SIGINT", "SIGTERM"]) {
    it(`saves the database to --server-db-path on ${signal}`, async () => {
      const dbPath = path.join(tmp, "db.msp")
      const child = start(["--server", "--server-db-path", dbPath])
      child.stdin.end()
      const client = new PinoramaClient({ url })
      await waitFor(() => client.introspection())
      await client.insert(logs)

      expect(await stop(child, signal)).toEqual({ code: 0, signal: null })
      expect(existsSync(dbPath), child.output).toBe(true)

      const restarted = start(["--server", "--server-db-path", dbPath])
      restarted.stdin.end()
      await waitFor(() => client.introspection())
      expect((await client.search({})).count).toBe(logs.length)
    })
  }

  it("delivers piped logs still in the transport buffer before saving", async () => {
    const dbPath = path.join(tmp, "db.msp")
    const child = start([
      "--server-db-path",
      dbPath,
      "--batch-size",
      "1000",
      "--flush-interval",
      "60000"
    ])
    const client = new PinoramaClient({ url })
    await waitFor(() => client.introspection())
    child.stdin.write(`${logs.map((log) => JSON.stringify(log)).join("\n")}\n`)
    await sleep(300)
    expect((await client.search({})).count).toBe(0)

    expect(await stop(child, "SIGINT")).toEqual({ code: 0, signal: null })

    const restarted = start(["--server", "--server-db-path", dbPath])
    restarted.stdin.end()
    await waitFor(() => client.introspection())
    expect((await client.search({})).count).toBe(logs.length)
  })

  it("writes no file when --server-db-path is not set", async () => {
    const child = start(["--server"])
    child.stdin.end()
    const client = new PinoramaClient({ url })
    await waitFor(() => client.introspection())
    await client.insert(logs)

    expect(await stop(child, "SIGINT")).toEqual({ code: 0, signal: null })
    expect(readdirSync(tmp)).toEqual([])
  })
})
