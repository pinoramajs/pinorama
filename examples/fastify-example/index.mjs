import path from "node:path"
import fastifyCors from "@fastify/cors"
import Fastify from "fastify"
import { fastifyPinoramaServer } from "pinorama-server"

const fastify = Fastify({
  logger: {
    transport: {
      targets: [
        {
          target: "pinorama-transport",
          options: {
            url: "http://localhost:6200/my_pinorama_server"
          }
        },
        { target: "@fastify/one-line-logger" }
      ]
    }
  }
})

fastify.register(fastifyCors)

fastify.register(fastifyPinoramaServer, {
  prefix: "/my_pinorama_server",
  dbPath: path.resolve("./db.msp"),
  logLevel: "silent" // need to avoid loop
})

fastify.post("/docs", async function handler(req) {
  req.log.info(req.body.message)
  return req.body.message
})

fastify.listen({ port: 6200 }, (err) => {
  if (err) throw err
})
