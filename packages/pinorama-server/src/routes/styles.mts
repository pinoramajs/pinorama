import type { FastifyInstance } from "fastify"
import { generateCSS } from "../utils/styles.mjs"

const CSS_MIME_TYPE = "text/css"

export async function stylesRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/styles.css",
    method: "get",
    handler: (req, res) => {
      const styles = fastify.pinoramaOpts?.ui?.styles

      if (!styles || Object.keys(styles).length === 0) {
        res.type(CSS_MIME_TYPE).send("")
      }

      const css = generateCSS(styles)
      res.type(CSS_MIME_TYPE).send(css)
    }
  })
}
