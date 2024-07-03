import type { FastifyInstance } from "fastify"

export async function introspectionRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/introspection",
    method: "get",
    handler: async () => {
      const { dbSchema, ui } = fastify.pinoramaOpts

      return {
        dbSchema,
        ui
      }
    }
  })
}
