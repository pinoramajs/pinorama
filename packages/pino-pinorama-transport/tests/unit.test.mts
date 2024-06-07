import { PinoramaClient } from "pinorama-client"
import { afterEach, describe, expect, it, vi } from "vitest"
import pinoramaTransport, { filterOptions } from "../src/lib.mts"

vi.mock("pinorama-client", async (importOriginal) => {
  const mod = await importOriginal<typeof import("pinorama-client")>()
  return {
    ...mod,
    PinoramaClient: vi.fn(function () {
      this.isFlushed = false
      this.bulkInsert = vi.fn(() => {
        return {
          flush: () => {
            this.isFlushed = true
          }
        }
      })
    })
  }
})

const exampleOptions = {
  url: "http://example.com",
  maxRetries: 3,
  backoff: 500,
  backoffFactor: 2,
  backoffMax: 10000,
  adminSecret: "secret123",
  batchSize: 50, // not a client option
  flushInterval: 2000 // not a client option
}

describe("pinoramaTransport", () => {
  const mockedClient = vi.mocked(PinoramaClient)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should initialize client with correct filtered options", async () => {
    pinoramaTransport(exampleOptions)

    expect(PinoramaClient).toHaveBeenCalledWith({
      url: "http://example.com",
      maxRetries: 3,
      backoff: 500,
      backoffFactor: 2,
      backoffMax: 10000,
      adminSecret: "secret123"
    })
  })

  it("should properly call the bulkInsert client function", async () => {
    const stream = pinoramaTransport(exampleOptions)

    expect(mockedClient.mock.instances[0].bulkInsert).toHaveBeenCalledWith(
      stream,
      {
        batchSize: exampleOptions.batchSize,
        flushInterval: exampleOptions.flushInterval
      }
    )
  })

  it("should call the flush client function on destroy stream", async () => {
    const stream = pinoramaTransport(exampleOptions)

    stream.write('{"msg":"hello world"}\n')
    stream.destroy()

    expect(mockedClient.mock.instances[0].isFlushed).toBe(true)
  })
})

describe("filterOptions", () => {
  it("should return an object with only specified keys", async () => {
    const filtered = filterOptions(exampleOptions, [
      "url",
      "maxRetries",
      "backoff"
    ])

    expect(filtered).toEqual({
      url: exampleOptions.url,
      maxRetries: exampleOptions.maxRetries,
      backoff: exampleOptions.backoff
    })
  })

  it("should not modify the original options object", async () => {
    const originalOptions = { ...exampleOptions }
    filterOptions(exampleOptions, ["url"])

    expect(exampleOptions).toEqual(originalOptions)
  })
})
