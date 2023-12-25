import Fastify from "fastify"
import { fastifyPinoramaServer } from "pinorama-server"

const fastify = Fastify({
  logger: {
    transport: {
      targets: [
        {
          target: "../../packages/pino-pinorama/dist/esm/index.js",
          options: {
            url: "http://localhost:3000/pinorama"
          }
        },
        { target: "pino-pretty" }
      ]
    }
  }
})

fastify.register(fastifyPinoramaServer, {
  prefix: "/pinorama",
  filePath: "./db.msp"
})

fastify.post("/logs", async function handler(req: any) {
  req.log.info(req.body.message)
  return req.body.message
})

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Fastify server is listening on ${address}`)
})
