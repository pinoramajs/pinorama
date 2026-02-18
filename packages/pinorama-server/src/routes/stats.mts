import { count, search } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import { serializeError } from "serialize-error"

export async function statsRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/stats",
    method: "get",
    handler: async (req, res) => {
      try {
        const totalDocs = count(fastify.pinorama.db)

        let oldestTimestamp: number | null = null
        let newestTimestamp: number | null = null

        if (totalDocs > 0) {
          const [oldest, newest] = await Promise.all([
            search(fastify.pinorama.db, {
              limit: 1,
              sortBy: {
                property: "_pinorama.createdAt",
                order: "ASC"
              }
            }),
            search(fastify.pinorama.db, {
              limit: 1,
              sortBy: {
                property: "_pinorama.createdAt",
                order: "DESC"
              }
            })
          ])

          const oldestHit = oldest.hits[0]
          if (oldestHit) {
            oldestTimestamp = (oldestHit.document as any)._pinorama.createdAt
          }
          const newestHit = newest.hits[0]
          if (newestHit) {
            newestTimestamp = (newestHit.document as any)._pinorama.createdAt
          }
        }

        return {
          totalDocs,
          memoryUsage: process.memoryUsage().heapUsed,
          oldestTimestamp,
          newestTimestamp
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
