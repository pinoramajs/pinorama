#! /usr/bin/env node

import { readFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { pipeline } from "node:stream/promises"
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
  "server-db-path": path.resolve(os.tmpdir(), "pinorama.msp"),
  "admin-secret": "your-secret",
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
    -f, --server-db-path       Set Pinorama Server db filepath (default: TMPDIR/pinorama.msp).
    -k, --server-admin-secret  Set Pinorama Server admin secret key (default: ${defaultOptions["admin-secret"]}). 
    -p, --preset               Use a predefined config preset (default: ${defaultOptions.preset}).
    -b, --batch-size           Set batch size for transport (default: ${defaultOptions.batchSize}).
    -f, --flush-interval       Set flush wait time in ms (default: ${defaultOptions.flushInterval}).

  Examples:
    pinorama --open
    node app.js | pinorama
    cat logs | pinorama --batch-size 1000 --flush-interval 5000
    pinorama --host 192.168.1.1 --port 8080
    pinorama --server --logger
    node app.js | pinorama --open --preset fastify
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
    if (!Object.keys(pinoramaPresets).includes(opts.preset)) {
      console.error(c.red(`Invalid preset: ${opts.preset}`))
      process.exit(1)
    }

    app.register(fastifyPinoramaServer, {
      adminSecret: opts["admin-secret"],
      dbPath: opts["server-db-path"],
      prefix: opts["server-prefix"],
      dbSchema: pinoramaPresets[opts.preset].schema,
      introspection: pinoramaPresets[opts.preset].introspection
    })
  }

  const studioUrl = `http://${opts.host}:${opts.port}`
  const serverUrl = `${studioUrl}${opts["server-prefix"]}`

  app.listen({ host: opts.host, port: opts.port }, async (err) => {
    if (err) throw err

    const msg = [`${"Pinorama Studio Web:"} ${c.dim(studioUrl)}`]

    if (opts.server) {
      msg.push(`${"Pinorama Server API:"} ${c.dim(serverUrl)}`)
      msg.push(`${"Server DB File Path:"} ${c.dim(opts["server-db-path"])}`)
    }

    console.log(msg.join("\n"))

    opts.open &&
      (await open(`${studioUrl}?connectionUrl=${serverUrl}&liveMode=true`))
  })

  if (isPiped) {
    console.log(
      c.yellow("Detected piped output. Server mode activated by default.")
    )

    const stream = pinoramaTransport({
      url: serverUrl,
      adminSecret: opts["admin-secret"],
      batchSize: opts["batch-size"],
      flushInterval: opts["flush-interval"]
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
      "admin-secret": "k",
      preset: "p",
      "batch-size": "b",
      "flush-interval": "f"
    },
    boolean: ["server", "open"],
    default: defaultOptions
  })
)
