import { createServer } from "pinorama-server"
import { beforeAll, describe, expect, it } from "vitest"

describe("server endpoints", () => {
  let server: ReturnType<typeof createServer>

  const now = Date.now()
  const testLogs = [
    { level: 30, msg: "info message one", time: now - 60000 },
    { level: 30, msg: "info message two", time: now - 50000 },
    { level: 40, msg: "warn message", time: now - 40000 },
    { level: 50, msg: "error: connection timeout", time: now - 30000 },
    { level: 50, msg: "error: disk full", time: now - 20000 },
    { level: 30, msg: "info message three", time: now - 10000 },
    { level: 60, msg: "fatal crash", time: now }
  ]

  beforeAll(async () => {
    server = createServer({})
    await server.ready()

    await server.inject({
      method: "POST",
      url: "/bulk",
      payload: testLogs
    })

    return async () => {
      await server.close()
    }
  })

  describe("GET /stats (enhanced)", () => {
    it("should return totalDocs and timestamps", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/stats"
      })
      expect(res.statusCode).toBe(200)

      const body = res.json()
      expect(body.totalDocs).toBe(7)
      expect(body.memoryUsage).toBeGreaterThan(0)
      expect(body.oldestTimestamp).toBeTypeOf("number")
      expect(body.newestTimestamp).toBeTypeOf("number")
      expect(body.newestTimestamp).toBeGreaterThanOrEqual(body.oldestTimestamp)
    })
  })

  describe("POST /search", () => {
    it("should find logs by term", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/search",
        payload: { term: "error" }
      })
      expect(res.statusCode).toBe(200)

      const body = res.json()
      expect(body.count).toBeGreaterThanOrEqual(2)
    })

    it("should support sortBy", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/search",
        payload: {
          limit: 1,
          sortBy: {
            property: "_pinorama.createdAt",
            order: "DESC"
          }
        }
      })
      expect(res.statusCode).toBe(200)

      const body = res.json()
      expect(body.hits.length).toBe(1)
      expect(body.hits[0].document.msg).toBe("fatal crash")
    })
  })

  describe("POST /context", () => {
    it("should return logs around a timestamp", async () => {
      // Use a future timestamp so all docs are "before" it
      const futureTs = Date.now() + 60000
      const res = await server.inject({
        method: "POST",
        url: "/context",
        payload: {
          timestamp: futureTs,
          before: 3,
          after: 3
        }
      })
      expect(res.statusCode).toBe(200)

      const body = res.json()
      expect(body.timestamp).toBe(futureTs)
      // All docs have createdAt <= futureTs, so "before" should have results
      expect(body.before.length).toBeGreaterThan(0)
      // No docs after futureTs
      expect(body.after.length).toBe(0)
    })
  })

  describe("POST /aggregate/field", () => {
    it("should aggregate by level", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/aggregate/field",
        payload: {
          field: "level",
          limit: 10
        }
      })
      expect(res.statusCode).toBe(200)

      const body = res.json()
      expect(body.values).toBeInstanceOf(Array)
      expect(body.values.length).toBeGreaterThan(0)

      const levelValues = body.values.map((v: { value: string }) => v.value)
      expect(levelValues).toContain("30")
    })
  })
})
