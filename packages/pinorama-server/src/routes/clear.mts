import fs from "node:fs"
import { create } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import { withPinoramaMetadataSchema } from "../utils/metadata.mjs"

export async function clearRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/clear",
    method: "post",
    handler: async (req, res) => {
      try {
        fastify.pinorama.db = create({
          schema: withPinoramaMetadataSchema(fastify.pinorama.opts.dbSchema)
        })

        const { dbPath } = fastify.pinorama.opts
        if (dbPath && fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath)
        }

        global.gc?.()

        res.code(204).send()
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to clear data" })
      }
    }
  })
}
