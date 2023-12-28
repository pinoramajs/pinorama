#! /usr/bin/env node

import { pipeline } from "node:stream"
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
    console.log(fs.readFileSync("./usage.txt", "utf8"))
    return
  }

  if (opts.version) {
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"))
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
    },
    default: {
      url: "http://localhost:6200"
    }
  })
)
