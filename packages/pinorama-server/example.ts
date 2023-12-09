import { createServer } from "./src/server.js"

const server = createServer({})

server.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Pinorama server is listening on ${address}`)
})
