import { setTimeout } from "node:timers/promises"
import { pino } from "pino"
import { PinoramaClient } from "pinorama-client"
import { createServer } from "pinorama-server"
import { beforeEach, describe, expect, it } from "vitest"
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

  it("should store a log line to pinorama server", async () => {
    const transport = pinoramaTransport({ url: pinoramaServerUrl })
    const log = pino(transport)

    // act
    log.info("hello world")

    setImmediate(() => transport.end())
    await setTimeout(100)

    const response = await pinoramaClientInstance.search({})
    expect(response.hits.length).toBe(1)
    expect(response.hits[0].document.msg).toBe("hello world")
  })

  it("should store a deeply nested log line to pinorama server", async () => {
    const transport = pinoramaTransport({ url: pinoramaServerUrl })
    const log = pino(transport)

    // act
    log.info({
      deeply: {
        nested: {
          hello: "world"
        }
      }
    })

    setImmediate(() => transport.end())
    await setTimeout(100)

    const response = await pinoramaClientInstance.search({})
    expect(response.hits.length).toBe(1)
    expect(response.hits[0].document.deeply.nested.hello).toBe("world")
  })

  it("should store log lines in bulk", async () => {
    const transport = pinoramaTransport({ url: pinoramaServerUrl })
    const log = pino(transport)

    // act
    log.info("hello world")
    log.info("hello world")
    log.info("hello world")
    log.info("hello world")
    log.info("hello world")

    setImmediate(() => transport.end())
    await setTimeout(100)

    const response = await pinoramaClientInstance.search({})
    expect(response.hits.length).toBe(5)
    for (const hit of response.hits) {
      expect(hit.document.msg).toBe("hello world")
    }
  })

  it("should ignore all values except non-empty plain objects", async () => {
    const transport = pinoramaTransport({ url: pinoramaServerUrl })

    // act
    transport.write("true\n")
    transport.write("null\n")
    transport.write("12\n")
    transport.write("{}\n")

    setImmediate(() => transport.end())
    await setTimeout(100)

    const response = await pinoramaClientInstance.search({})
    expect(response.hits.length).toBe(0)
  })
})
