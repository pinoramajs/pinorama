#! /usr/bin/env node

import { readFileSync } from "node:fs"
import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import minimist from "minimist"
import pinoramaTransport, { type PinoramaTransportOptions, defaultOptions } from "./lib.mjs"

type PinoramaCliOptions = {
  version: string
  help: string
  url: string
  "admin-secret": string
  "batch-size": number
  "flush-interval": number
  "max-retries": number
  backoff: number
  "backoff-factor": number
  "backoff-max": number
}

/**
 * Converts CLI options to Pinorama Transport options.
 *
 * @param {Partial<PinoramaCliOptions>} cliOptions - The CLI options provided by the user.
 * @returns {Partial<PinoramaTransportOptions>} The Pinorama Transport options.
 */
function convertToTransportOptions(
  cliOptions: Partial<PinoramaCliOptions>
): Partial<PinoramaTransportOptions> {
  const transportOptions: Partial<PinoramaTransportOptions> = {}

  const keyMap: Record<
    Exclude<keyof PinoramaCliOptions, "version" | "help">,
    keyof PinoramaTransportOptions
  > = {
    url: "url",
    "admin-secret": "adminSecret",
    "batch-size": "batchSize",
    "flush-interval": "flushInterval",
    "max-retries": "maxRetries",
    backoff: "backoff",
    "backoff-factor": "backoffFactor",
    "backoff-max": "backoffMax"
  }

  for (const key of Object.keys(cliOptions)) {
    const castedKey = key as keyof typeof keyMap
    const newKey = keyMap[castedKey]
    if (newKey) {
      transportOptions[newKey] = cliOptions[castedKey] as any
    }
  }

  return transportOptions
}

/**
 * Entry function to start the CLI application.
 *
 * @param {Partial<PinoramaCliOptions>} argv - The set of CLI options.
 */
async function start(argv: Partial<PinoramaCliOptions>) {
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
    -k, --admin-secret      Secret key for authentication.
    -b, --batch-size        Define logs per bulk insert (default: ${defaultOptions.batchSize}).
    -f, --flush-interval    Set flush wait time in ms (default: ${defaultOptions.flushInterval}).
    -m, --max-retries       Max retry attempts for requests (default: ${defaultOptions.maxRetries}).
    -i, --backoff           Initial backoff time in ms for retries (default: ${defaultOptions.backoff}).
    -d, --backoff-factor    Backoff factor for exponential increase (default: ${defaultOptions.backoffFactor}).
    -x, --backoff-max       Maximum backoff time in ms (default: ${defaultOptions.backoffMax}).

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
    console.error(`Error: the '--url' parameter is required.`)
    process.exit(1)
  }

  const options = convertToTransportOptions(argv)
  const transport = pinoramaTransport(options)

  transport.on("error", (error) => {
    console.error("pinoramaTransport error:", error)
  })

  pipeline(process.stdin, transport)
}

const cliOptions = minimist<PinoramaCliOptions>(process.argv.slice(2), {
  alias: {
    v: "version",
    h: "help",
    k: "admin-secret",
    u: "url",
    b: "batch-size",
    f: "flush-interval",
    m: "max-retries",
    i: "backoff",
    d: "backoff-factor",
    x: "backoff-max"
  },
  default: {
    url: defaultOptions.url,
    "batch-size": defaultOptions.batchSize,
    "flush-interval": defaultOptions.flushInterval,
    "max-retries": defaultOptions.maxRetries,
    backoff: defaultOptions.backoff,
    "backoff-factor": defaultOptions.backoffFactor,
    "backoff-max": defaultOptions.backoffMax
  },
  boolean: ["version", "help"],
  string: ["admin-secret", "url"]
})

start(cliOptions)
