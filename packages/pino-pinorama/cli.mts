#! /usr/bin/env node

import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import minimist from "minimist"
import pinoPinorama from "./lib.mjs"

import type { PinoramaTransportOptions } from "./lib.mts"

type PinoramaCliOptions = PinoramaTransportOptions & {
  help: string
  version: string
}

async function start(opts: PinoramaCliOptions) {
  if (opts.help) {
    const filepath = fileURLToPath(new URL("usage.txt", import.meta.url))
    console.log(fs.readFileSync(filepath, "utf8"))
    return
  }

  if (opts.version) {
    const filepath = fileURLToPath(new URL("package.json", import.meta.url))
    const packageJson = JSON.parse(fs.readFileSync(filepath, "utf8"))
    console.log(packageJson.version)
    return
  }

  const stream = pinoPinorama(opts)

  stream.on("error", (error) => {
    console.error("PinoramaClient error:", error)
  })

  pipeline(process.stdin, stream)
}

start(
  minimist<PinoramaCliOptions>(process.argv.slice(2), {
    alias: {
      version: "v",
      help: "h",
      url: "u",
      batchSize: "b",
      flushInterval: "f",
      maxRetries: "m",
      retryInterval: "r"
    }
  })
)
