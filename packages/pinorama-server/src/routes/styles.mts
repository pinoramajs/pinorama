import type { FastifyInstance } from "fastify"
import { generateCSS } from "../utils/styles.mjs"

export async function stylesRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/styles.css",
    method: "get",
    handler: async (req, res) => {
      const columns = fastify.pinoramaOpts?.ui?.columns

      if (!columns || columns?.length === 0) {
        res.type("text/css").send("")
      }

      const css = generateCSS(columns)
      res.type("text/css").send(css)
    }
  })
}
