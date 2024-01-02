#! /usr/bin/env node

import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import minimist from "minimist"
import c from "chalk"
import open from "open"
import pinoPinorama from "pino-pinorama"
import { fastifyPinoramaServer } from "pinorama-server"

async function start(opts) {
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
    default: {
      host: "localhost",
      port: 6200,
      open: false,
      logger: false,
      server: false,
      "server-prefix": "/pinorama",
      "server-db-file": path.resolve(os.tmpdir(), "pinorama.msp")
    }
  })
)
