import { beforeEach, describe, expect, it } from "vitest"

import { setTimeout } from "node:timers/promises"
import { pino } from "pino"
import { PinoramaClient } from "pinorama-client"
import { createServer } from "pinorama-server"
import pinoramaTransport from "../src/lib.mjs"

describe("pinoramaTransport", async () => {
  let pinoramaClientInstance: PinoramaClient
  let pinoramaServerUrl: string

  beforeEach(async () => {
    const pinoramaServerInstance = createServer()

    await pinoramaServerInstance.listen()
    await pinoramaServerInstance.ready()

    const address = pinoramaServerInstance.server.address()
    const port = typeof address === "string" ? address : address?.port

    pinoramaServerUrl = `http://localhost:${port}`
    pinoramaClientInstance = new PinoramaClient({ url: pinoramaServerUrl })

    return async () => {
      await pinoramaServerInstance.close()
    }
  })

  it("should store a log line to orama", async () => {
    const transport = pinoramaTransport({ url: pinoramaServerUrl })
    const log = pino(transport)

    // act
    log.info("hello world")
    setImmediate(() => transport.end())

    await setTimeout(500)
    const response = await pinoramaClientInstance.search({})
    expect(response.hits.length).toBe(1)
    expect(response.hits[0].document.msg).toBe("hello world")
  })
})
