import { insertMultiple } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import { withPinoramaMetadataValue } from "../utils/metadata.mjs"

export async function bulkRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/bulk",
    method: "post",
    handler: async (req, res) => {
      try {
        await insertMultiple(
          fastify.pinorama.db,
          (req.body as any).map(withPinoramaMetadataValue)
        )
        res.code(201).send({ success: true })
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to insert data" })
      }
    }
  })
}
