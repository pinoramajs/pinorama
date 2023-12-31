import { FastifyInstance } from "fastify"

export default async function authHook(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (req, res) => {
    const { adminSecret } = fastify.pinoramaOpts

    if (req.headers["x-pinorama-admin-secret"] !== adminSecret) {
      res.code(401).send({ error: "unauthorized" })
      throw new Error("unauthorized")
    }
  })
}
