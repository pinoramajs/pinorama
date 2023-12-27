#! /usr/bin/env node

import fs from "node:fs"
import path from "node:path"
// import { createRequire } from "node:module"
import { pipeline } from "node:stream"
import minimist from "minimist"
import pinoPinorama from "./lib.js"
// import packageJson from "../package.json" assert { type: "json" }

import type { PinoramaTransportOptions } from "./lib.ts"

// const require = createRequire(import.meta.url)

type PinoramaCliOptions = PinoramaTransportOptions & {
  help: string
  version: string
}

function start(opts: PinoramaCliOptions) {
  if (opts.help) {
    console.log(fs.readFileSync(path.join(__dirname, "./usage.txt"), "utf8"))
    return
  }

  if (opts.version) {
    import("../package.json").then((packageJson) => {
      console.log("pino-elasticsearch", packageJson.default())
    })
    return
  }

  const stream = pinoPinorama(opts)

  stream.on("error", (error) => {
    console.error("Pinorama Client error:", error)
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
