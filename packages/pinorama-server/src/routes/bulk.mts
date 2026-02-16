import { insertMultiple } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import { serializeError } from "serialize-error"
import { withPinoramaMetadataValue } from "../utils/metadata.mjs"

export async function bulkRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/bulk",
    method: "post",
    schema: {
      body: {
        type: "array",
        minItems: 1,
        items: { type: "object" }
      }
    },
    handler: async (req, res) => {
      try {
        await insertMultiple(
          fastify.pinorama.db,
          (req.body as any).map(withPinoramaMetadataValue)
        )
        res.code(201).send({ success: true })
      } catch (e) {
        req.log.error(e)
        res.code(500).send({
          error: "failed to insert data",
          details: serializeError(e)
        })
      }
    }
  })
}
