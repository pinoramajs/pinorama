/**
 * MCP plugin for pinorama-server (embedded mode).
 *
 * Exposes the MCP protocol directly over HTTP, so AI clients can connect
 * without spawning a separate pinorama-mcp subprocess. The server manages
 * MCP sessions internally — each session gets its own transport and
 * loopback PinoramaClient that calls back into the server's own routes.
 *
 * Endpoints:
 *   GET  /mcp/status  → check if MCP is enabled
 *   POST /mcp/status  → toggle MCP on/off
 *   POST /mcp         → JSON-RPC messages (tool calls, initialize)
 *   GET  /mcp         → SSE stream for server→client notifications
 *   DELETE /mcp       → terminate a session
 *
 * Session lifecycle:
 *   1. Client sends POST /mcp without a session ID → new session created
 *   2. Transport assigns a UUID via `onsessioninitialized` callback
 *   3. Client includes `mcp-session-id` header in subsequent requests
 *   4. Client sends DELETE /mcp to clean up, or server cleans up on close
 */

import { randomUUID } from "node:crypto"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import type { FastifyInstance } from "fastify"
import { PinoramaClient } from "pinorama-client"
import { registerAll } from "pinorama-mcp"

type McpSession = {
  transport: StreamableHTTPServerTransport
  server: McpServer
}

export async function mcpPlugin(fastify: FastifyInstance) {
  let enabled = false
  const sessions = new Map<string, McpSession>()

  /**
   * Creates a PinoramaClient that connects back to this same server
   * via localhost. This avoids duplicating route logic — the MCP tools
   * call the same REST endpoints that the studio UI and external clients use.
   */
  function createLoopbackClient() {
    const addr = fastify.server.address()
    const port = typeof addr === "object" && addr ? addr.port : 6200
    const prefix = fastify.pinorama.opts.prefix ?? ""
    return new PinoramaClient({
      url: `http://localhost:${port}${prefix}`,
      adminSecret: fastify.pinorama.opts.adminSecret
    })
  }

  /**
   * Creates a new MCP session with its own transport and server instance.
   * Each session is independent — multiple AI clients can connect concurrently.
   * The session is stored in the map once the transport emits `onsessioninitialized`.
   */
  async function createSession(): Promise<McpSession> {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        sessions.set(sessionId, { transport, server })
      }
    })

    const server = new McpServer({
      name: "pinorama",
      version: "1.0.0"
    })

    const client = createLoopbackClient()
    registerAll(server, client)

    await server.connect(transport)
    return { transport, server }
  }

  // --- Status endpoints ---

  fastify.route({
    url: "/mcp/status",
    method: "GET",
    handler: async () => ({ enabled })
  })

  fastify.route({
    url: "/mcp/status",
    method: "POST",
    handler: async (req) => {
      const body = req.body as { enabled?: boolean }
      if (typeof body.enabled === "boolean") {
        enabled = body.enabled
      }
      return { enabled }
    }
  })

  // --- MCP protocol endpoints ---

  // POST /mcp: handles JSON-RPC messages (initialize, tool calls, etc.).
  // Uses reply.hijack() to hand raw socket control to the MCP transport,
  // which manages its own response format (JSON-RPC over HTTP).
  fastify.route({
    url: "/mcp",
    method: "POST",
    config: { rawBody: true },
    handler: async (req, reply) => {
      if (!enabled) {
        return reply.code(503).send({ error: "MCP server is disabled" })
      }

      const sessionId = req.headers["mcp-session-id"] as string | undefined
      let session: McpSession

      if (sessionId && sessions.has(sessionId)) {
        session = sessions.get(sessionId) as McpSession
      } else {
        // First request from a new client — create session.
        // The session ID will be assigned by the transport via the
        // `onsessioninitialized` callback and returned in the response.
        session = await createSession()
      }

      reply.hijack()
      await session.transport.handleRequest(req.raw, reply.raw, req.body)
    }
  })

  // GET /mcp: SSE (Server-Sent Events) stream for server→client push
  // notifications. Requires an existing session — the client must have
  // already established one via POST.
  fastify.route({
    url: "/mcp",
    method: "GET",
    handler: async (req, reply) => {
      if (!enabled) {
        return reply.code(503).send({ error: "MCP server is disabled" })
      }

      const sessionId = req.headers["mcp-session-id"] as string | undefined
      if (!sessionId || !sessions.has(sessionId)) {
        return reply.code(404).send({ error: "Session not found" })
      }

      const session = sessions.get(sessionId) as McpSession
      reply.hijack()
      await session.transport.handleRequest(req.raw, reply.raw)
    }
  })

  // DELETE /mcp: explicit session termination by the client.
  // Lets the transport handle the response, then removes the session
  // from our tracking map.
  fastify.route({
    url: "/mcp",
    method: "DELETE",
    handler: async (req, reply) => {
      const sessionId = req.headers["mcp-session-id"] as string | undefined
      if (!sessionId || !sessions.has(sessionId)) {
        return reply.code(404).send({ error: "Session not found" })
      }

      const session = sessions.get(sessionId) as McpSession
      reply.hijack()
      await session.transport.handleRequest(req.raw, reply.raw)
      sessions.delete(sessionId)
    }
  })

  // Clean up all sessions when the server shuts down to avoid
  // dangling connections and resource leaks.
  fastify.addHook("onClose", async () => {
    for (const [id, session] of sessions) {
      await session.transport.close()
      sessions.delete(id)
    }
  })
}
