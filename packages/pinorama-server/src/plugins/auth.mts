import type { FastifyInstance } from "fastify"

export async function authHook(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (req, res) => {
    const { adminSecret } = fastify.pinoramaOpts

    if (adminSecret && req.headers["x-pinorama-admin-secret"] !== adminSecret) {
      res.code(401).send({ error: "unauthorized" })
      throw new Error("unauthorized")
    }
  })
}
