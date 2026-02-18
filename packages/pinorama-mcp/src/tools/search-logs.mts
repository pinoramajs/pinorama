/**
 * Tool: search_logs
 *
 * The primary search tool — supports full-text search, field filters,
 * sorting, and offset-based pagination. Maps directly to Orama's search
 * API via the Pinorama client.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { PinoramaClient } from "pinorama-client/node"
import { z } from "zod"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatSearchResults, formatToolError } from "../utils/format.mjs"

export function registerSearchLogs(
  server: McpServer,
  client: PinoramaClient<any>
) {
  server.registerTool(
    "search_logs",
    {
      title: "Search Logs",
      description:
        "Search logs with full-text search, filters, sorting, and pagination. Use 'term' for text search, 'where' for field filters (e.g., { \"level\": { \"eq\": 50 } } for errors), 'sortBy' to sort results, and 'limit'/'offset' for pagination.",
      inputSchema: {
        term: z
          .string()
          .optional()
          .describe("Full-text search term to match against searchable fields"),
        // The `where` clause uses Orama's filter syntax. We accept an opaque
        // record here because the filter shape depends on field types
        // (eq/gt/lt for numbers, eq for strings, between for ranges, etc.).
        where: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            'Orama where clause for field filtering. Example: { "level": { "eq": 50 } }'
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Maximum results to return (1-100, default: 20)"),
        offset: z
          .number()
          .int()
          .min(0)
          .default(0)
          .describe("Number of results to skip for pagination"),
        sortBy: z
          .string()
          .optional()
          .describe("Field to sort by (e.g., '_pinorama.createdAt', 'level')"),
        sortOrder: z
          .enum(["ASC", "DESC"])
          .default("DESC")
          .describe("Sort direction: ASC or DESC (default: DESC)")
      },
      annotations: READONLY_ANNOTATIONS
    },
    async (params) => {
      try {
        const searchParams: Record<string, unknown> = {
          limit: params.limit,
          offset: params.offset
        }

        if (params.term) {
          searchParams.term = params.term
        }

        if (params.where) {
          searchParams.where = params.where
        }

        // Orama's sortBy expects `{ property, order }` — we split it into
        // two user-facing params for clarity in the tool's input schema.
        if (params.sortBy) {
          searchParams.sortBy = {
            property: params.sortBy,
            order: params.sortOrder
          }
        }

        const result = await client.search(searchParams as any)

        const text = formatSearchResults(
          result.hits as any,
          result.count,
          params.offset
        )

        return {
          content: [{ type: "text" as const, text }]
        }
      } catch (error) {
        return formatToolError(error)
      }
    }
  )
}
