import Fastify from "fastify"
import { fastifyPinoramaServer } from "pinorama-server"
const fastify = Fastify({
  logger: {
    transport: {
      targets: [
        {
          target: "pino-pinorama",
          options: {
            url: "http://localhost:3000/my_pinorama_server"
          }
        },
        { target: "@fastify/one-line-logger" }
      ]
    }
  }
})

fastify.register(fastifyPinoramaServer, {
  prefix: "/my_pinorama_server",
  filePath: "./db.msp",
  logLevel: "silent" // need to avoid loop
})

fastify.post("/logs", async function handler(req) {
  req.log.info(req.body.message)
  return req.body.message
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err
})
