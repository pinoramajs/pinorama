#! /usr/bin/env node

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import fastifyCors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import c from "chalk"
import fastify from "fastify"
import minimist from "minimist"
import open from "open"
import * as pinoramaPresets from "pinorama-presets"
import { fastifyPinoramaServer } from "pinorama-server"
import pinoramaTransport from "pinorama-transport"

const defaultOptions = {
  host: "localhost",
  port: 6200,
  open: false,
  logger: false,
  server: false,
  "server-prefix": "/pinorama",
  "server-db-path": undefined,
  "server-url": undefined,
  "admin-secret": undefined,
  preset: "pino",
  "batch-size": 10,
  "flush-interval": 100
}

async function start(options) {
  const opts = { ...defaultOptions, ...options }

  const pj = fileURLToPath(new URL("./package.json", import.meta.url))
  const { version } = JSON.parse(readFileSync(pj, "utf8"))

  if (opts.help) {
    console.log(`
  pinorama v${version}

  Description:
    A CLI tool to start the Pinorama Studio tool chain.

  Usage:
    pinorama [options]

  Options:
    -h, --help                 Display this help message and exit.
    -v, --version              Show application version.
    -H, --host                 Set web server host (default: ${defaultOptions.host}).
    -P, --port                 Set web server port (default: ${defaultOptions.port}).
    -o, --open                 Open Pinorama Studio (default: ${defaultOptions.open}).
    -l, --logger               Enable logging (default: ${defaultOptions.logger}).
    -s, --server               Start Pinorama Server (default: ${defaultOptions.server}).
    -e, --server-prefix        Set Pinorama Server endpoint (default: ${defaultOptions["server-prefix"]}).
    -f, --server-db-path       Save Pinorama Server db to this file on exit (disabled by default).
    -k, --server-admin-secret  Set Pinorama Server admin secret key (disabled by default).
    -u, --server-url           Connect to an existing Pinorama Server instead of starting one.
    -p, --preset               Use a predefined config preset (default: ${defaultOptions.preset}).
    -b, --batch-size           Set batch size for transport (default: ${defaultOptions["batch-size"]}).
    -f, --flush-interval       Set flush wait time in ms (default: ${defaultOptions["flush-interval"]}).

  Examples:
    pinorama --open
    node app.js | pinorama
    cat logs | pinorama --batch-size 1000 --flush-interval 5000
    pinorama --host 192.168.1.1 --port 8080
    pinorama --server --logger
    pinorama --open --server-url http://localhost:3000/pinorama
    node app.js | pinorama --open --preset fastify
`)
    return
  }

  if (opts.version) {
    console.log(version)
    return
  }

  if (opts["server-url"]) {
    if (opts.server) {
      console.error(c.red("--server and --server-url cannot be used together"))
      process.exit(1)
    }

    if (!URL.canParse(opts["server-url"])) {
      console.error(c.red(`Invalid server URL: ${opts["server-url"]}`))
      process.exit(1)
    }
  }

  const isPiped = !process.stdin.isTTY
  opts.server = !opts["server-url"] && (isPiped || opts.server)

  const app = createServer(opts)

  if (opts.server) {
    const preset = pinoramaPresets[opts.preset]

    if (!preset?.schema || !preset?.introspection) {
      console.error(c.red(`Invalid preset: ${opts.preset}`))
      process.exit(1)
    }

    app.register(fastifyPinoramaServer, {
      adminSecret: opts["admin-secret"],
      dbPath: opts["server-db-path"],
      prefix: opts["server-prefix"],
      dbSchema: preset.schema,
      introspection: preset.introspection
    })
  }

  const studioUrl = `http://${opts.host}:${opts.port}`
  const serverUrl = opts["server-url"] || `${studioUrl}${opts["server-prefix"]}`

  await app.listen({ host: opts.host, port: opts.port })

  const msg = [`${"Pinorama Studio Web:"} ${c.dim(studioUrl)}`]

  if (opts.server || opts["server-url"]) {
    msg.push(`${"Pinorama Server API:"} ${c.dim(serverUrl)}`)
  }

  if (opts.server && opts["server-db-path"]) {
    msg.push(`${"Server DB File Path:"} ${c.dim(opts["server-db-path"])}`)
  }

  console.log(msg.join("\n"))

  if (opts.open) {
    await open(`${studioUrl}?serverUrl=${serverUrl}&liveMode=true`)
  }

  let stream

  if (isPiped) {
    console.log(
      c.yellow(
        opts.server
          ? "Detected piped output. Server mode activated by default."
          : "Detected piped output. Logs are sent to the existing server."
      )
    )

    stream = pinoramaTransport({
      url: serverUrl,
      adminSecret: opts["admin-secret"],
      batchSize: opts["batch-size"],
      flushInterval: opts["flush-interval"]
    })

    stream.on("error", (error) => {
      console.error(error)
    })

    await app.ready()
    process.stdin.pipe(stream)
  }

  let closing = false

  const shutdown = async () => {
    // second signal: quit without waiting
    if (closing) process.exit(1)
    closing = true

    try {
      if (stream && !stream.closed) {
        // stop reading stdin and deliver what is buffered before the server goes away
        process.stdin.unpipe(stream)
        stream.end()
        await new Promise((resolve) => stream.once("close", resolve))
      }

      // closing the server saves the db when --server-db-path is set
      await app.close()
      process.exit(0)
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

function createServer(opts) {
  const app = fastify({
    logger: opts.logger
      ? {
          transport: {
            target: "@fastify/one-line-logger",
            options: {
              colorize: true
            }
          }
        }
      : false
  })

  app.register(fastifyCors)

  app.register(fastifyStatic, {
    root: fileURLToPath(new URL("dist", import.meta.url))
  })

  return app
}

start(
  minimist(process.argv.slice(2), {
    alias: {
      help: "h",
      version: "v",
      host: "H",
      port: "P",
      open: "o",
      logger: "l",
      server: "s",
      "server-prefix": "e",
      "server-db-path": "f",
      "server-url": "u",
      "admin-secret": "k",
      preset: "p",
      "batch-size": "b",
      "flush-interval": "f"
    },
    boolean: ["server", "open"],
    string: ["server-url"],
    default: defaultOptions
  })
)
