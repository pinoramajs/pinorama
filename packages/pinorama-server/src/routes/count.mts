import { count } from "@orama/orama"
import type { FastifyInstance } from "fastify"

export async function countRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/count",
    method: "get",
    handler: async (req, res) => {
      try {
        const totalCount = await count(fastify.pinoramaDb)
        res.code(200).send(totalCount)
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to search data" })
      }
    }
  })
}
