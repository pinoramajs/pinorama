import type { FastifyInstance } from "fastify"
import { generateCSS } from "../utils/styles.mjs"

export async function stylesRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/styles.css",
    method: "get",
    handler: async (req, res) => {
      const styles = fastify.pinoramaOpts?.ui?.styles

      if (!styles || Object.keys(styles).length === 0) {
        res.type("text/css").send("")
      }

      const css = generateCSS(styles)
      res.type("text/css").send(css)
    }
  })
}
