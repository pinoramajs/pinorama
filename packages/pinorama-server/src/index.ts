import fs from "node:fs"
import path from "node:path"
import Fastify from "fastify"
import fp from "fastify-plugin"
import { create, insertMultiple, search } from "@orama/orama"
import {
  persistToFile,
  restoreFromFile
} from "@orama/plugin-data-persistence/server"

import type { FastifyPluginAsync } from "fastify"

// TODO: delete "any"
// TODO: requests validation
// TODO: extends orama schema

type PinoramaServerOptions = {
  filePath?: string
}

const fastifyPinoramaServer: FastifyPluginAsync<PinoramaServerOptions> = async (
  fastify,
  options
) => {
  const dbSchema = {
    level: "string",
    time: "string",
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

  fastify.post("/bulk", async (req, res) => {
    try {
      await insertMultiple(db, req.body as any)
      res.code(201).send({ success: true })
    } catch (e) {
      req.log.error(e)
      res.code(500).send({ error: "failed to insert data" })
    }
  })

  fastify.post("/search", async (req, res) => {
    try {
      const result = await search(db, req.body as any)
      res.code(200).send(result)
    } catch (e) {
      req.log.error(e)
      res.code(500).send({ error: "failed to search data" })
    }
  })

  fastify.post("/persist", async (req, res) => {
    try {
      await persistToFile(db, dbFormat, dbFilePath)
      res.code(204).send()
    } catch (e) {
      req.log.error(e)
      res.code(500).send({ error: "failed to persist data" })
    }
  })

  fastify.addHook("onClose", async (instance) => {
    try {
      const savedPath = await persistToFile(db, dbFormat, dbFilePath)
      instance.log.info(`database saved to ${savedPath}`)
    } catch (error) {
      instance.log.error(`failed to save database: ${error}`)
    }
  })
}

function createServer(options: PinoramaServerOptions) {
  const fastify = Fastify()
  fastify.register(fastifyPinoramaServer, options)
  return fastify
}

const plugin = fp(fastifyPinoramaServer, {
  fastify: "4.x",
  name: "fastify-pinorama-server"
})

export default plugin
export { fastifyPinoramaServer, createServer }
