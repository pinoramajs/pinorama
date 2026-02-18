import { type AnyOrama, type Results, search } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import type { PinoramaDocument } from "pinorama-types"
import { serializeError } from "serialize-error"

export async function contextRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/context",
    method: "post",
    schema: {
      body: {
        type: "object",
        required: ["timestamp"],
        properties: {
          timestamp: { type: "number" },
          before: { type: "number", default: 10 },
          after: { type: "number", default: 10 },
          where: { type: "object" }
        }
      }
    },
    handler: async (req, res) => {
      try {
        const {
          timestamp,
          before = 10,
          after = 10,
          where
        } = req.body as {
          timestamp: number
          before?: number
          after?: number
          where?: Record<string, unknown>
        }

        const baseParams = where ? { where } : {}

        const [beforeResults, afterResults] = (await Promise.all([
          search(fastify.pinorama.db, {
            ...baseParams,
            limit: before,
            where: {
              ...where,
              "_pinorama.createdAt": { lte: timestamp }
            },
            sortBy: {
              property: "_pinorama.createdAt",
              order: "DESC"
            }
          } as any),
          search(fastify.pinorama.db, {
            ...baseParams,
            limit: after,
            where: {
              ...where,
              "_pinorama.createdAt": { gt: timestamp }
            },
            sortBy: {
              property: "_pinorama.createdAt",
              order: "ASC"
            }
          } as any)
        ])) as [
          Results<PinoramaDocument<AnyOrama>>,
          Results<PinoramaDocument<AnyOrama>>
        ]

        const beforeHits = [...beforeResults.hits].reverse()
        const afterHits = afterResults.hits

        res.code(200).send({
          before: beforeHits,
          after: afterHits,
          timestamp
        })
      } catch (e) {
        req.log.error(e)
        res.code(500).send({
          error: "failed to get context",
          details: serializeError(e)
        })
      }
    }
  })
}
