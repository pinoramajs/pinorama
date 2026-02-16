#! /usr/bin/env node

import { readFileSync } from "node:fs"
import type { Transform } from "node:stream"
import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import minimist from "minimist"
import { defaultClientOptions } from "pinorama-client"
import type { PinoramaTransportOptions } from "./lib.mjs"
import pinoramaTransport, { defaultBulkOptions } from "./lib.mjs"

type PinoramaCliOptions = PinoramaTransportOptions & {
  version: string
  help: string
}

/**
 * Entry function to start the CLI application.
 *
 * @param {Partial<PinoramaCliOptions>} argv - The set of CLI options.
 */
async function main(argv: Partial<PinoramaCliOptions>) {
  const pj = fileURLToPath(new URL("../package.json", import.meta.url))
  const { version } = JSON.parse(readFileSync(pj, "utf8"))

  if (argv.help) {
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
    -k, --adminSecret       Secret key for authentication.
    -b, --batchSize         Define logs per bulk insert (default: ${defaultBulkOptions.batchSize}).
    -f, --flushInterval     Set flush wait time in ms (default: ${defaultBulkOptions.flushInterval}).
    -m, --maxRetries        Max retry attempts for requests (default: ${defaultClientOptions.maxRetries}).
    -i, --backoff           Initial backoff time in ms for retries (default: ${defaultClientOptions.backoff}).
    -d, --backoffFactor     Backoff factor for exponential increase (default: ${defaultClientOptions.backoffFactor}).
    -x, --backoffMax        Maximum backoff time in ms (default: ${defaultClientOptions.backoffMax}).
    -s, --maxBufferSize     Max buffer size before dropping old logs (default: ${defaultBulkOptions.maxBufferSize}).

  Example:
    cat logs | pino-pinorama --url http://localhost:6200
`)
    process.exit()
  }

  if (argv.version) {
    console.log(version)
    process.exit()
  }

  if (!argv.url) {
    console.error(
      "Error: missing required argument '--url'.\n" +
        "For more information, use the '--help' argument."
    )
    process.exit(1)
  }

  let transport: Transform

  try {
    transport = pinoramaTransport({
      url: argv.url,
      adminSecret: argv.adminSecret,
      batchSize: argv.batchSize,
      flushInterval: argv.flushInterval,
      maxRetries: argv.maxRetries,
      backoff: argv.backoff,
      backoffFactor: argv.backoffFactor,
      backoffMax: argv.backoffMax,
      maxBufferSize: argv.maxBufferSize
    })
  } catch (e: any) {
    console.error(`Error: ${e.message}`)
    process.exit(1)
  }

  transport.on("error", (error) => {
    console.error("pinoramaTransport error:", error)
  })

  try {
    await pipeline(process.stdin, transport)
  } catch (error) {
    console.error("pipeline error:", error)
    process.exit(1)
  }
}

const cliOptions = minimist<PinoramaCliOptions>(process.argv.slice(2), {
  alias: {
    v: "version",
    h: "help",
    k: "adminSecret",
    u: "url",
    b: "batchSize",
    f: "flushInterval",
    m: "maxRetries",
    i: "backoff",
    d: "backoffFactor",
    x: "backoffMax",
    s: "maxBufferSize"
  },
  default: {
    batchSize: defaultBulkOptions.batchSize,
    flushInterval: defaultBulkOptions.flushInterval,
    maxBufferSize: defaultBulkOptions.maxBufferSize,
    maxRetries: defaultClientOptions.maxRetries,
    backoff: defaultClientOptions.backoff,
    backoffFactor: defaultClientOptions.backoffFactor,
    backoffMax: defaultClientOptions.backoffMax
  },
  boolean: ["version", "help"],
  string: ["adminSecret", "url"]
})

main(cliOptions)
