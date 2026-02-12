import type { FastifyInstance } from "fastify"

export async function introspectionRoute(fastify: FastifyInstance) {
  const { introspection } = fastify.pinorama.opts

  fastify.route({
    url: "/introspection",
    method: "get",
    handler: async () => {
      return introspection
    }
  })
}
