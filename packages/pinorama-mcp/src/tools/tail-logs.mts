/**
 * Tool: tail_logs
 *
 * Convenience wrapper over search_logs that always sorts by ingestion
 * time (newest first). This is the "what just happened?" tool — the
 * LLM's equivalent of `tail -f` on a log file.
 *
 * Uses `_pinorama.createdAt` (server ingestion timestamp) rather than
 * `time` (pino's client-side timestamp) because createdAt is always
 * present and monotonically increasing, even when logs arrive out of order.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { PinoramaClient } from "pinorama-client/node"
import { z } from "zod"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatSearchResults, formatToolError } from "../utils/format.mjs"

export function registerTailLogs(
  server: McpServer,
  client: PinoramaClient<any>
) {
  server.registerTool(
    "tail_logs",
    {
      title: "Tail Logs",
      description:
        'Get the most recent logs, ordered by time (newest first). Shortcut for search with time-based sorting. Use \'where\' to filter (e.g., { "level": { "in": [50, 60] } } for errors and fatals). Note: "level" is an enum field — use "eq" or "in", not range operators like "gte".',
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Number of recent logs to return (1-100, default: 20)"),
        where: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Orama where clause for filtering")
      },
      annotations: READONLY_ANNOTATIONS
    },
    async (params) => {
      try {
        const searchParams: Record<string, unknown> = {
          limit: params.limit,
          sortBy: {
            property: "_pinorama.createdAt",
            order: "DESC"
          }
        }

        if (params.where) {
          searchParams.where = params.where
        }

        const result = await client.search(searchParams as any)

        const text = formatSearchResults(result.hits as any, result.count, 0)

        return {
          content: [{ type: "text" as const, text }]
        }
      } catch (error) {
        return formatToolError(error)
      }
    }
  )
}
