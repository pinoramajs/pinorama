import { count } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import { serializeError } from "serialize-error"

export async function statsRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/stats",
    method: "get",
    handler: async (req, res) => {
      try {
        return {
          totalDocs: count(fastify.pinorama.db),
          memoryUsage: process.memoryUsage().heapUsed
        }
      } catch (e) {
        req.log.error(e)
        res.code(500).send({
          error: "failed to get stats",
          details: serializeError(e)
        })
      }
    }
  })
}
