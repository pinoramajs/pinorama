import { count } from "@orama/orama"
import type { FastifyInstance } from "fastify"

export async function statsRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/stats",
    method: "get",
    handler: async () => {
      return {
        totalDocs: count(fastify.pinoramaDb),
        memoryUsage: process.memoryUsage().heapUsed
      }
    }
  })
}
