import { persistToFile } from "@orama/plugin-data-persistence/server"
import type { FastifyInstance } from "fastify"

export async function gracefulSaveHook(fastify: FastifyInstance) {
  const { dbPath, dbFormat } = fastify.pinorama.opts
  // without a path persistToFile would dump the db to `orama_bump_*` in cwd
  if (!dbPath) return

  fastify.addHook("onClose", async () => {
    try {
      const savedPath = await persistToFile(
        fastify.pinorama.db,
        dbFormat,
        dbPath
      )
      fastify.log.info(`database saved to ${savedPath}`)
    } catch (error) {
      fastify.log.error(`failed to save database: ${error}`)
    }
  })
}
