import type { FastifyInstance } from "fastify"
import { generateCSS } from "../utils/styles.mjs"

const CSS_MIME_TYPE = "text/css"

export async function stylesRoute(fastify: FastifyInstance) {
  const css = generateCSS(fastify.pinoramaOpts?.ui?.styles)

  fastify.route({
    url: "/styles.css",
    method: "get",
    handler: (req, res) => {
      res.type(CSS_MIME_TYPE).send(css)
    }
  })
}
