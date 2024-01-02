#! /usr/bin/env node

import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import { readFileSync } from "node:fs"
import path from "node:path"
import os from "node:os"
import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import minimist from "minimist"
import c from "chalk"
import open from "open"
import pinoPinorama from "pino-pinorama"
import { fastifyPinoramaServer } from "pinorama-server"

const defaultOptions = {
  host: "localhost",
  port: 6200,
  open: false,
  logger: false,
  server: false,
  "server-prefix": "/pinorama",
  "server-db-file": path.resolve(os.tmpdir(), "pinorama.msp")
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
    -h, --help              Display this help message and exit.
    -v, --version           Show application version.
    -H, --host              Set server host (default: ${defaultOptions.host}).
    -P, --port              Set server port (default: ${defaultOptions.port}).
    -o, --open              Open Pinorama Studio (default: ${defaultOptions.open}).
    -l, --logger            Enable logging (default: ${defaultOptions.logger}).
    -s, --server            Start server (default: ${defaultOptions.server}).
    -p, --server-prefix     Set server path prefix (default: ${defaultOptions["server-prefix"]}).
    -f, --server-db-file    Set server database file (default: ${defaultOptions["server-db-file"]}).

  Examples:
    pinorama --open
    node app.js | pinorama
    cat logs | pinorama -l -o
    pinorama --host 192.168.1.1 --port 8080
    pinorama --server --logger
`)
    return
  }

  if (opts.version) {
    console.log(version)
    return
  }

  const isPiped = !process.stdin.isTTY
  opts.server = isPiped || opts.server

  const app = createServer(opts)

  if (opts.server) {
    app.register(fastifyPinoramaServer, {
      prefix: opts["server-prefix"],
      filePath: opts["server-db-file"]
    })
  }

  const studioUrl = `http://${opts.host}:${opts.port}`
  const serverUrl = `${studioUrl}${opts["server-prefix"]}`

  app.listen({ host: opts.host, port: opts.port }, async (err) => {
    if (err) throw err

    const msg = [`${"Pinorama Studio Web:"} ${c.dim(studioUrl)}`]

    if (opts.server) {
      msg.push(`${"Pinorama Server API:"} ${c.dim(serverUrl)}`)
      msg.push(`${"Server DB File Path:"} ${c.dim(opts["server-db-file"])}`)
    }

    console.log(msg.join("\n"))

    opts.open && (await open(studioUrl))
  })

  if (isPiped) {
    console.log(
      c.yellow("Detected piped output. Server mode activated by default.")
    )

    const stream = pinoPinorama({
      url: serverUrl,
      batchSize: 1000
    })

    stream.on("error", (error) => {
      console.error(error)
    })

    await app.ready()
    pipeline(process.stdin, stream)
  }
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
      port: "p",
      open: "o",
      logger: "l",
      server: "s",
      "server-prefix": "e",
      "server-db-file": "f"
    },
    boolean: ["server", "open"],
    default: defaultOptions
  })
)
