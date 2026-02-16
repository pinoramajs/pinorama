import { createServer } from "pinorama-server"
import { beforeEach, describe, expect, it } from "vitest"

describe("server auth", () => {
  let server: ReturnType<typeof createServer>

  beforeEach(async () => {
    server = createServer({ adminSecret: "test-secret" })
    await server.ready()

    return async () => {
      await server.close()
    }
  })

  it("returns 401 for POST /search without header", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/search",
      payload: {}
    })
    expect(res.statusCode).toBe(401)
  })

  it("returns 401 for POST /search with wrong token", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/search",
      payload: {},
      headers: { "x-pinorama-admin-secret": "wrong-token" }
    })
    expect(res.statusCode).toBe(401)
  })

  it("returns 200 for POST /search with correct token", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/search",
      payload: {},
      headers: { "x-pinorama-admin-secret": "test-secret" }
    })
    expect(res.statusCode).toBe(200)
  })

  it("returns 200 for GET /health without token (bypasses auth)", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/health"
    })
    expect(res.statusCode).toBe(200)
  })
})
