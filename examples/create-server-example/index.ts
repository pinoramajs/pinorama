import Fastify from "fastify"
import { createServer } from "pinorama-server"

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
          target: "pino-pinorama",
          options: {
            url: "http://localhost:3001"
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
