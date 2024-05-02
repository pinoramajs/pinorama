import { describe, expect, it, vi } from "vitest"

import { defaultClientOptions } from "pinorama-client"
import type { PinoramaTransportOptions } from "../src/lib.mts"
import pinoramaTransport from "../src/lib.mts"

const mocks = vi.hoisted(() => ({
  PinoramaClient: vi.fn().mockImplementation(() => ({
    bulk: vi.fn(),
    flush: vi.fn()
  }))
}))

vi.mock("pinorama-client", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    PinoramaClient: mocks.PinoramaClient
  }
})

describe("pinoramaTransport", () => {
  it("should correctly merge user options with default options", () => {
    const userOptions: Partial<PinoramaTransportOptions> = {
      url: "http://localhost:6200",
      maxRetries: 5,
      backoff: 500,
      backoffMax: 60000,
      backoffFactor: 3
    }

    pinoramaTransport(userOptions)

    expect(mocks.PinoramaClient).toBeCalledWith(userOptions)
  })

  // it("should validate options using the zod schema and throw an error if invalid", () => {})
  // it("should instantiate PinoramaClient with the correct parameters from options", () => {})
  // it("should handle retry and backoff logic correctly on request failures", () => {})
  // it("should call bulk with correct batchSize and flushInterval", () => {})
  // it("should call flush when the transport is closed", () => {})
  // it("should queue logs and send them in batches", () => {})
  // it("should send logs after the specified flushInterval", () => {})
  // it("should parse a valid JSON string into an object using parseLineFn", () => {})
  // it("should throw an error if parseLineFn receives invalid input", () => {})
  // it("should complete pending operations and flush data when closing the transport", () => {})
})
