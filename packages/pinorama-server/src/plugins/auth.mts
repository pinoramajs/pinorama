import { timingSafeEqual } from "node:crypto"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

async function authHookPlugin(fastify: FastifyInstance) {
  const { adminSecret } = fastify.pinorama.opts
  if (!adminSecret) return

  fastify.addHook("preHandler", async (req, res) => {
    if (req.routeOptions.url?.endsWith("/health")) return

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

export const authHook = fp(authHookPlugin)
