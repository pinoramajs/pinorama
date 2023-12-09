import Fastify from "fastify"
import pinorama from "./plugin.js"
import type { PinoramaServerOptions } from "./types.js"

export function createServer(options: PinoramaServerOptions) {
  const fastify = Fastify()
  fastify.register(pinorama, options)
  return fastify
}
