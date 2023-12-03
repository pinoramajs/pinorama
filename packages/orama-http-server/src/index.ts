import { AnyOrama } from "@orama/orama"
import { FastifyPluginAsync } from "fastify"

type OramaHttpServerOptions = {
  orama: AnyOrama | AnyOrama[]
}

// REMINDER: see where to save the orama instances (fastify decorator? Map?)
// REMINDER: see how to validate http request at runtime (zod?)
// REMINDER: see there is a need to move into cjs

const oramaHttpServer: FastifyPluginAsync<OramaHttpServerOptions> = async (
  fastify,
  options
) => {
  // if (fastify.pinorama) {
  //   throw new Error("@pinorama/orama-http-server is already registered")
  // }

  const orama = Array.isArray(options.orama) ? options.orama : [options.orama]

  fastify.post("/", async () => {})
  fastify.post("/:orama", async () => {})
  fastify.get("/:orama/:docId", async () => {})
  fastify.put("/:orama/:docId", async () => {})
  fastify.delete("/:orama/:docId", async () => {})
}

export default oramaHttpServer
