import Fastify from "fastify"
import { fastifyPinoramaServer } from "../../packages/pinorama-server"

const fastify = Fastify({
  logger: {
    transport: {
      targets: [
        {
          target: "../../packages/pino-pinorama",
          options: {
            url: "http://localhost:3000",
            batchSize: 10, // default: 10
            flushInterval: 5000, // default: 5000 (ms)
            maxRetries: 5, // default: 5
            retryInterval: 1000 // default: 1000
          }
        }
      ]
    }
  }
})

fastify.register(fastifyPinoramaServer, {
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
