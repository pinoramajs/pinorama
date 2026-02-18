/**
 * Tool: count_logs
 *
 * Returns the count of logs matching the given filters without returning
 * any documents. Uses Orama's `preflight: true` with `limit: 0` — the
 * same lightweight technique used by `get_field_values`.
 *
 * Lighter than `search_logs` when the LLM only needs "how many?".
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { PinoramaClient } from "pinorama-client/node"
import { z } from "zod"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatToolError } from "../utils/format.mjs"

export function registerCountLogs(
  server: McpServer,
  client: PinoramaClient<any>
) {
  server.registerTool(
    "count_logs",
    {
      title: "Count Logs",
      description:
        "Count logs matching the given filters without returning documents. More efficient than search_logs when you only need the count.",
      inputSchema: {
        term: z
          .string()
          .optional()
          .describe("Full-text search term to match against searchable fields"),
        where: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            'Orama where clause for field filtering. Example: { "level": { "eq": 50 } }'
          )
      },
      annotations: READONLY_ANNOTATIONS
    },
    async (params) => {
      try {
        const searchParams: Record<string, unknown> = {
          limit: 0,
          preflight: true
        }

        if (params.term) {
          searchParams.term = params.term
        }

        if (params.where) {
          searchParams.where = params.where
        }

        const result = await client.search(searchParams as any)

        return {
          content: [
            {
              type: "text" as const,
              text: `Count: ${result.count}`
            }
          ]
        }
      } catch (error) {
        return formatToolError(error)
      }
    }
  )
}
