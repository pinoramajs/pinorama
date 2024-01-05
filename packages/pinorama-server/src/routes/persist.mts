import { persistToFile } from "@orama/plugin-data-persistence"
import type { FastifyInstance } from "fastify"

export default async function persistRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/persist",
    method: "post",
    handler: async (req, res) => {
      try {
        await persistToFile(
          fastify.pinoramaDb,
          fastify.pinoramaOpts.dbFormat,
          fastify.pinoramaOpts.dbPath
        )
        res.code(204).send()
      } catch (e) {
        req.log.error(e)
        res.code(500).send({ error: "failed to persist data" })
      }
    }
  })
}
