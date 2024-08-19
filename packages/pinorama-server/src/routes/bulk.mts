import { insertMultiple } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import { withPinoramaValue } from "../utils/metadata.js"

export async function bulkRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/bulk",
    method: "post",
    handler: async (req, res) => {
      try {
        await insertMultiple(
          fastify.pinoramaDb,
          (req.body as any).map(withPinoramaValue)
        )
        res.code(201).send({ success: true })
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to insert data" })
      }
    }
  })
}
