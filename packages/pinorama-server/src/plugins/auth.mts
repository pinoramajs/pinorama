import { timingSafeEqual } from "node:crypto"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

async function authHookPlugin(fastify: FastifyInstance) {
  const { adminSecret } = fastify.pinorama.opts
  if (!adminSecret) return

  fastify.addHook("preHandler", async (req, res) => {
    const url = req.routeOptions.url
    if (url?.endsWith("/health")) return
    if (url?.endsWith("/mcp/status") && req.method === "GET") return
    if (url?.endsWith("/mcp") && !url.endsWith("/mcp/status")) return

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
