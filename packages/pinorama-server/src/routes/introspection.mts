import type { FastifyInstance } from "fastify"

export async function introspectionRoute(fastify: FastifyInstance) {
  const { dbSchema, ui } = fastify.pinoramaOpts

  fastify.route({
    url: "/introspection",
    method: "get",
    handler: async () => {
      return {
        dbSchema,
        ui
      }
    }
  })
}
