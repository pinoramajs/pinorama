import fs from "node:fs"
import type { AnyOrama, AnySchema } from "@orama/orama"
import { create } from "@orama/orama"
import { restoreFromFile } from "@orama/plugin-data-persistence/server"
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRegisterOptions,
  FastifyServerOptions,
  LogLevel,
  RegisterOptions
} from "fastify"
import Fastify from "fastify"
import fp from "fastify-plugin"
import { pino as defaultPreset } from "pinorama-presets"
import type { PinoramaIntrospection } from "pinorama-types"
import * as plugins from "./plugins/index.mjs"
import * as routes from "./routes/index.mjs"
import { withPinoramaMetadataSchema } from "./utils/metadata.mjs"

declare module "fastify" {
  interface FastifyInstance {
    pinorama: { db: AnyOrama; opts: PinoramaServerOptions }
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
  autoSaveInterval?: number
  introspection: PinoramaIntrospection<any>
}

export const defaultOptions: PinoramaServerOptions = {
  adminSecret: process.env.PINORAMA_SERVER_ADMIN_SECRET,
  dbFormat: "json",
  dbSchema: defaultPreset.schema,
  introspection: defaultPreset.introspection
}

const fastifyPinoramaServer: FastifyPluginAsync<PinoramaServerOptions> = async (
  fastify,
  options
) => {
  const opts = { ...defaultOptions, ...options }

  let db: AnyOrama
  if (opts.dbPath && fs.existsSync(opts.dbPath)) {
    try {
      db = await restoreFromFile(opts.dbFormat, opts.dbPath)
    } catch (error) {
      fastify.log.error(
        `Failed to restore database from ${opts.dbPath}, creating fresh instance: ${error}`
      )
      db = create({ schema: withPinoramaMetadataSchema(opts.dbSchema) })
    }
  } else {
    db = create({ schema: withPinoramaMetadataSchema(opts.dbSchema) })
  }

  fastify.decorate("pinorama", { db, opts })

  const registerOpts: RegisterOptions = {}

  if (opts.prefix) {
    registerOpts.prefix = opts.prefix
  }

  if (opts.logLevel) {
    registerOpts.logLevel = opts.logLevel
  }

  fastify.register(routes.healthRoute, registerOpts)

  fastify.register(plugins.authHook)

  fastify.register(routes.bulkRoute, registerOpts)
  fastify.register(routes.clearRoute, registerOpts)
  fastify.register(routes.introspectionRoute, registerOpts)
  fastify.register(routes.persistRoute, registerOpts)
  fastify.register(routes.searchRoute, registerOpts)
  fastify.register(routes.statsRoute, registerOpts)
  fastify.register(routes.stylesRoute, registerOpts)

  fastify.register(plugins.gracefulSaveHook)
  fastify.register(plugins.autoSavePlugin)
}

function createServer(
  pinoramaOptions: FastifyRegisterOptions<PinoramaServerOptions>,
  fastifyOptions?: FastifyServerOptions
): FastifyInstance {
  const fastify = Fastify(fastifyOptions)
  fastify.register(fastifyPinoramaServer, pinoramaOptions)
  return fastify
}

const plugin = fp(fastifyPinoramaServer, {
  fastify: "5.x",
  name: "fastify-pinorama-server"
})

export default plugin
export { fastifyPinoramaServer, createServer }
