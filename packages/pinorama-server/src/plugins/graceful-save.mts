import { persistToFile } from "@orama/plugin-data-persistence/server"
import type { FastifyInstance } from "fastify"

export async function gracefulSaveHook(fastify: FastifyInstance) {
  fastify.addHook("onClose", async () => {
    try {
      const savedPath = await persistToFile(
        fastify.pinorama.db,
        fastify.pinorama.opts.dbFormat,
        fastify.pinorama.opts.dbPath
      )
      fastify.log.info(`database saved to ${savedPath}`)
    } catch (error) {
      fastify.log.error(`failed to save database: ${error}`)
    }
  })
}
