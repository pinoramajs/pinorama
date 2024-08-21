import type { FastifyInstance } from "fastify"
import type { IntrospectionStyle } from "pinorama-types"
import { generateCSS } from "../utils/styles.mjs"

const CSS_MIME_TYPE = "text/css"

export async function stylesRoute(fastify: FastifyInstance) {
  const styles = fastify.pinoramaOpts?.introspection?.styles as
    | Record<string, IntrospectionStyle>
    | undefined

  let css = ""
  if (styles) {
    css = generateCSS(styles)
  }

  fastify.route({
    url: "/styles.css",
    method: "get",
    handler: (req, res) => {
      if (!css) {
        req.log.warn("no styles found")
      }
      res.type(CSS_MIME_TYPE).send(css)
    }
  })
}
