import { describe, expect, it } from "vitest"
import { PinoramaError } from "../src/index.js"

describe("PinoramaError", () => {
  it("preserves status, message, and errorDetails", () => {
    const details = { error: "bad request", details: { foo: "bar" } }
    const err = new PinoramaError(400, "insert failed", details)

    expect(err.status).toBe(400)
    expect(err.message).toBe("insert failed")
    expect(err.errorDetails).toEqual(details)
  })

  it("is instanceof Error", () => {
    const err = new PinoramaError(500, "server error")
    expect(err).toBeInstanceOf(Error)
  })

  it('has name "PinoramaError"', () => {
    const err = new PinoramaError(401, "unauthorized")
    expect(err.name).toBe("PinoramaError")
  })
})
