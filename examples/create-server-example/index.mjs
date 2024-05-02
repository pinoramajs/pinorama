import path from "node:path"
import Fastify from "fastify"
import { createServer } from "pinorama-server"

const pinoramaServer = createServer(
  {
    // prefix: "/my_pinorama_server",
    dbPath: path.resolve("./db.msp")
  },
  {
    logger: {
      transport: {
        targets: [
          { target: "@fastify/one-line-logger", options: { colorize: true } }
        ]
      }
    }
  }
)

pinoramaServer.listen({ port: 6200 }, (err, address) => {
  if (err) throw err
  console.log(`Pinorama server listening at ${address}`)
})

const genericServer = Fastify({
  logger: {
    transport: {
      targets: [
        {
          target: "pino-pinorama-transport",
          options: {
            // url: "http://localhost:6200/my_pinorama_server"
            url: "http://localhost:6200"
          }
        },
        { target: "@fastify/one-line-logger" }
      ]
    }
  }
})

genericServer.post("/logs", async function handler(req) {
  req.log.info(req.body.message)
  return req.body.message
})

genericServer.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Generic server listening at ${address}`)
})
