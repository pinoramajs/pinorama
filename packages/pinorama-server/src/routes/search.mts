import { search } from "@orama/orama"
import type { FastifyInstance } from "fastify"

export async function searchRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/search",
    method: "post",
    handler: async (req, res) => {
      try {
        const result = await search(fastify.pinoramaDb, req.body as any)
        res.code(200).send(result)
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to search data" })
      }
    }
  })
}
