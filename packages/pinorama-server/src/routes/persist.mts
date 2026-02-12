import { persistToFile } from "@orama/plugin-data-persistence/server"
import type { FastifyInstance } from "fastify"

export async function persistRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/persist",
    method: "post",
    handler: async (req, res) => {
      try {
        await persistToFile(
          fastify.pinorama.db,
          fastify.pinorama.opts.dbFormat,
          fastify.pinorama.opts.dbPath
        )
        res.code(204).send()
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to persist data" })
      }
    }
  })
}
