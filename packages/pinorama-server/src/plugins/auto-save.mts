import { persistToFile } from "@orama/plugin-data-persistence/server"
import type { FastifyInstance } from "fastify"

export async function autoSavePlugin(fastify: FastifyInstance) {
  const { autoSaveInterval, dbPath, dbFormat } = fastify.pinorama.opts
  if (!autoSaveInterval || !dbPath) return

  const intervalId = setInterval(async () => {
    try {
      await persistToFile(fastify.pinorama.db, dbFormat, dbPath)
    } catch (error) {
      fastify.log.error(`Auto-save failed: ${error}`)
    }
  }, autoSaveInterval)

  fastify.addHook("onClose", async () => {
    clearInterval(intervalId)
  })
}
