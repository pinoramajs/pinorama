import Fastify from "fastify"
import { createServer } from "../../packages/pinorama-server"

const pinoramaServer = createServer({
  filePath: "./db.msp"
})

pinoramaServer.listen({ port: 3001 }, (err, address) => {
  if (err) throw err
  console.log(`Pinorama server is listening on ${address}`)
})

const genericServer = Fastify({
  logger: {
    transport: {
      targets: [
        {
          target: "../../packages/pino-pinorama",
          options: {
            url: "http://localhost:3001",
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

genericServer.post("/logs", async function handler(req: any) {
  req.log.info(req.body.message)
  return req.body.message
})

genericServer.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Generic server is listening on ${address}`)
})
