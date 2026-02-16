import { count } from "@orama/orama"
import type { FastifyInstance } from "fastify"

export async function healthRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/health",
    method: "get",
    handler: async () => {
      const memoryUsage = process.memoryUsage()

      return {
        status: "ok",
        uptime: process.uptime(),
        totalDocs: count(fastify.pinorama.db),
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          rss: memoryUsage.rss
        }
      }
    }
  })
}
