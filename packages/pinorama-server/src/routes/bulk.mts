import { insertMultiple } from "@orama/orama"
import type { FastifyInstance } from "fastify"

export default async function bulkRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/bulk",
    method: "post",
    handler: async (req, res) => {
      try {
        await insertMultiple(fastify.pinoramaDb, req.body as any)
        res.code(201).send({ success: true })
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to insert data" })
      }
    }
  })
}
