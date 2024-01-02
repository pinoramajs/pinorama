#! /usr/bin/env node

import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import { readFileSync } from "node:fs"
import minimist from "minimist"
import pinoPinorama, { defaultOptions } from "./lib.mjs"

import type { PinoramaTransportOptions } from "./lib.mts"

type PinoramaCliOptions = PinoramaTransportOptions & {
  help: string
  version: string
}

async function start(opts: PinoramaCliOptions) {
  const pj = fileURLToPath(new URL("../package.json", import.meta.url))
  const { version } = JSON.parse(readFileSync(pj, "utf8"))

  if (opts.help) {
    console.log(`
  pino-pinorama v${version} 

  Description:
    A tool for send pino logs to Pinorama server.

  Usage:
    pino-pinorama [options]

  Options:
    -h, --help                 Display this help message and exit.
    -v, --version              Show application version.
    -u, --url <url>            Set Pinorama server URL.
    -b, --batch-size <size>    Define logs per bulk insert (default: ${defaultOptions.batchSize}).
    -f, --flush-interval <ms>  Set flush wait time in ms (default: ${defaultOptions.flushInterval}).
    -m, --max-retries <num>    Max retry attempts for requests (default: ${defaultOptions.maxRetries}).
    -r, --retry-interval <ms>  Interval between retries in ms (default: ${defaultOptions.retryInterval}).

  Example:
    cat logs | pino-pinorama --url http://localhost:6200
`)
    return
  }

  if (opts.version) {
    console.log(version)
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
