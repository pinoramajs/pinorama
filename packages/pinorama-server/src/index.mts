import fs from "node:fs"
import path from "node:path"
import Fastify from "fastify"
import fp from "fastify-plugin"
import { create, insertMultiple, search } from "@orama/orama"
import {
  persistToFile,
  restoreFromFile
} from "@orama/plugin-data-persistence/server"

import type { FastifyPluginAsync, FastifyServerOptions } from "fastify"

// TODO: add orama plugin-data-persistence
// TODO: delete "any"
// TODO: add request validation
// TODO: possibility to extend orama schema

type PinoramaServerOptions = {
  filePath?: string
  prefix?: string
}

const fastifyPinoramaServer: FastifyPluginAsync<PinoramaServerOptions> = async (
  fastify,
  options
) => {
  const dbSchema = {
    level: "number",
    time: "number",
    msg: "string",
    pid: "number",
    hostname: "string"
  }

  const dbFormat = "json"

  const dbFilePath = path.resolve(options.filePath || "./pinorama.msp")
  const dbExists = fs.existsSync(dbFilePath)

  const db: any = dbExists
    ? await restoreFromFile(dbFormat, dbFilePath)
    : await create({ schema: dbSchema })

  fastify.register(
    async (app) => {
      app.post("/bulk", { logLevel: "silent" }, async (req, res) => {
        try {
          await insertMultiple(db, req.body as any)
          res.code(201).send({ success: true })
        } catch (e) {
          req.log.error(e)
          res.code(500).send({ error: "failed to insert data" })
        }
      })

      app.post("/search", async (req, res) => {
        try {
          const result = await search(db, req.body as any)
          res.code(200).send(result)
        } catch (e) {
          req.log.error(e)
          res.code(500).send({ error: "failed to search data" })
        }
      })

      app.post("/persist", async (req, res) => {
        try {
          await persistToFile(db, dbFormat, dbFilePath)
          res.code(204).send()
        } catch (e) {
          req.log.error(e)
          res.code(500).send({ error: "failed to persist data" })
        }
      })

      app.addHook("onClose", async (req) => {
        try {
          const savedPath = await persistToFile(db, dbFormat, dbFilePath)
          req.log.info(`database saved to ${savedPath}`)
        } catch (error) {
          req.log.error(`failed to save database: ${error}`)
        }
      })
    },
    { prefix: options.prefix || "pinorama" }
  )
}

function createServer(
  pinoramaOptions: PinoramaServerOptions,
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