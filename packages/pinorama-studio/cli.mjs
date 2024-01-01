#! /usr/bin/env node

import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import minimist from "minimist"
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

  const app = createServer()

  if (opts.server) {
    app.register(fastifyPinoramaServer)
  }

  const localUrl = `http://localhost:${opts.port}`

  app.listen({ port: opts.port }, async (err) => {
    if (err) throw err
    console.log(`Pinorama Studio is up to ${localUrl}`)
    await open(localUrl)
  })

  if (isPiped) {
    const stream = pinoPinorama({
      url: `${localUrl}/pinorama`,
      batchSize: 1000
    })

    stream.on("error", (error) => {
      console.error(error)
    })

    pipeline(process.stdin, stream)
  }
}

function createServer() {
  const app = fastify()

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
      port: "p",
      server: "s"
    },
    default: {
      port: 5000
    }
  })
)
