import { timingSafeEqual } from "node:crypto"
import type { FastifyInstance } from "fastify"

export async function authHook(fastify: FastifyInstance) {
  const { adminSecret } = fastify.pinorama.opts
  if (!adminSecret) return

  fastify.addHook("preHandler", async (req, res) => {
    const provided = req.headers["x-pinorama-admin-secret"]
    if (
      typeof provided !== "string" ||
      provided.length !== adminSecret.length ||
      !timingSafeEqual(Buffer.from(provided), Buffer.from(adminSecret))
    ) {
      return res.code(401).send({ error: "unauthorized" })
    }
  })
}
