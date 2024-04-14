import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import url from "node:url"
import FastifyAutoload from "@fastify/autoload"
import { create } from "@orama/orama"
import { restoreFromFile } from "@orama/plugin-data-persistence/server"
import Fastify from "fastify"
import fp from "fastify-plugin"

import type { AnyOrama, AnySchema } from "@orama/orama"
import type {
  FastifyPluginAsync,
  FastifyRegisterOptions,
  FastifyServerOptions,
  LogLevel,
  RegisterOptions
} from "fastify"

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

declare module "fastify" {
  interface FastifyInstance {
    pinoramaDb: AnyOrama
    pinoramaOpts: PinoramaServerOptions
  }
}

type PersistenceFormat = "json" | "dpack" | "binary" // orama does not export this type

type PinoramaServerOptions = {
  adminSecret?: string
  dbSchema?: AnySchema
  dbPath?: string
  dbFormat?: PersistenceFormat
  prefix?: string
  logLevel?: LogLevel
}

export const defaultOptions: PinoramaServerOptions = {
  adminSecret: process.env.PINORAMA_SERVER_ADMIN_SECRET || "your-secret",
  dbSchema: {
    level: "number",
    time: "number",
    msg: "string",
    pid: "number",
    hostname: "string"
  },
  dbPath: path.join(os.tmpdir(), "pinorama.msp"),
  dbFormat: "json"
}

const fastifyPinoramaServer: FastifyPluginAsync<PinoramaServerOptions> = async (
  fastify,
  options
) => {
  const opts = { ...defaultOptions, ...options }

  const db = fs.existsSync(opts.dbPath as string)
    ? await restoreFromFile(opts.dbFormat, opts.dbPath)
    : await create({ schema: opts.dbSchema })

  fastify.decorate("pinoramaOpts", opts)
  fastify.decorate("pinoramaDb", db)

  const registerOpts: RegisterOptions = {}

  if (opts.prefix) {
    registerOpts.prefix = opts.prefix
  }

  if (opts.logLevel) {
    registerOpts.logLevel = opts.logLevel
  }

  fastify.register(async () => {
    fastify.register(FastifyAutoload, {
      dir: path.join(__dirname, "routes"),
      options: registerOpts
    })

    fastify.register(FastifyAutoload, {
      dir: path.join(__dirname, "plugins"),
      encapsulate: false
    })
  })
}

function createServer(
  pinoramaOptions: FastifyRegisterOptions<PinoramaServerOptions>,
  fastifyOptions?: FastifyServerOptions
) {
  const fastify = Fastify(fastifyOptions)
  fastify.register(fastifyPinoramaServer, pinoramaOptions)
  return fastify
}

const plugin = fp(fastifyPinoramaServer, {
  fastify: "4.x",
  name: "fastify-pinorama-server"
})

export default plugin
export { fastifyPinoramaServer, createServer }
