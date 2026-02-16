import { createServer } from "pinorama-server"
import { beforeEach, describe, expect, it } from "vitest"

describe("server routes", () => {
  let server: ReturnType<typeof createServer>

  beforeEach(async () => {
    server = createServer({})
    await server.ready()

    return async () => {
      await server.close()
    }
  })

  describe("POST /bulk", () => {
    it("returns 400 for non-array body", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/bulk",
        payload: { foo: "bar" }
      })
      expect(res.statusCode).toBe(400)
    })

    it("returns 400 for empty array", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/bulk",
        payload: []
      })
      expect(res.statusCode).toBe(400)
    })

    it("returns 201 for valid array", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/bulk",
        payload: [{ msg: "hello", level: 30 }]
      })
      expect(res.statusCode).toBe(201)
    })
  })

  describe("POST /search", () => {
    it("returns 400 for non-object body", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/search",
        headers: { "content-type": "application/json" },
        payload: JSON.stringify("not an object")
      })
      expect(res.statusCode).toBe(400)
    })

    it("returns 200 for valid object", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/search",
        payload: {}
      })
      expect(res.statusCode).toBe(200)
    })
  })

  describe("GET /health", () => {
    it("returns 200 with status ok and totalDocs 0", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/health"
      })
      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.status).toBe("ok")
      expect(body.totalDocs).toBe(0)
    })
  })
})
