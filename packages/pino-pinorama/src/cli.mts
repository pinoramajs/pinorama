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
    -h, --help              Display this help message and exit.
    -v, --version           Show application version.
    -u, --url               Set Pinorama server URL.
    -b, --batch-size        Define logs per bulk insert (default: ${defaultOptions.batchSize}).
    -f, --flush-interval    Set flush wait time in ms (default: ${defaultOptions.flushInterval}).
    -m, --max-retries       Max retry attempts for requests (default: ${defaultOptions.maxRetries}).
    -i, --backoff           Initial backoff time in ms for retries (default: ${defaultOptions.backoff}).
    -d, --backoff-factor    Backoff factor for exponential increase (default: ${defaultOptions.backoffFactor}).
    -x, --backoff-max       Maximum backoff time in ms (default: ${defaultOptions.backoffMax}).

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
      "batch-size": "b",
      "flush-interval": "f",
      "max-retries": "m",
      backoff: "i",
      "backoff-factor": "d",
      "backoff-max": "x"
    }
  })
)
