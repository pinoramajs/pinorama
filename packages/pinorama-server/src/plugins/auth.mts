import type { FastifyInstance } from "fastify"

export async function authHook(fastify: FastifyInstance) {
  const { adminSecret } = fastify.pinoramaOpts

  fastify.addHook("preHandler", async (req, res) => {
    if (adminSecret && req.headers["x-pinorama-admin-secret"] !== adminSecret) {
      res.code(401).send({ error: "unauthorized" })
      throw new Error("unauthorized")
    }
  })
}
