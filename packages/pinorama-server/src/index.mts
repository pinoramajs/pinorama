import fs from "node:fs"
import { create } from "@orama/orama"
import { restoreFromFile } from "@orama/plugin-data-persistence/server"
import Fastify from "fastify"
import fp from "fastify-plugin"

import * as plugins from "./plugins/index.mjs"
import * as routes from "./routes/index.mjs"

import type { AnyOrama, AnySchema } from "@orama/orama"
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRegisterOptions,
  FastifyServerOptions,
  LogLevel,
  RegisterOptions
} from "fastify"

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
  ui: any
}

export const defaultOptions: PinoramaServerOptions = {
  adminSecret: process.env.PINORAMA_SERVER_ADMIN_SECRET,
  dbFormat: "json",
  dbSchema: {
    level: "enum",
    time: "number",
    msg: "string",
    pid: "enum",
    hostname: "string"
  },
  ui: {
    labels: {
      level: [
        "Level",
        {
          10: "TRACE",
          20: "DEBUG",
          30: "INFO",
          40: "WARN",
          50: "ERROR",
          60: "FATAL"
        }
      ],
      time: "Time",
      msg: "Message",
      pid: "PID",
      hostname: "Host"
    },
    formatters: {
      time: "timestamp"
    },
    styles: {
      time: {
        opacity: "0.5"
      },
      level: [
        {},
        {
          10: { color: "var(--color-gray-500)" },
          20: { color: "var(--color-purple-500)" },
          30: { color: "var(--color-lime-500)" },
          40: { color: "var(--color-yellow-500)" },
          50: { color: "var(--color-red-500)" },
          60: { color: "var(--color-red-500)" }
        }
      ]
    }
  }
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

  fastify.register(routes.bulkRoute, registerOpts)
  fastify.register(routes.introspectionRoute, registerOpts)
  fastify.register(routes.persistRoute, registerOpts)
  fastify.register(routes.searchRoute, registerOpts)
  fastify.register(routes.stylesRoute, registerOpts)

  fastify.register(plugins.gracefulSaveHook)
  fastify.register(plugins.authHook)
}

function createServer(
  pinoramaOptions?: FastifyRegisterOptions<PinoramaServerOptions>,
  fastifyOptions?: FastifyServerOptions
): FastifyInstance {
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
