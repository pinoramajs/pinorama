/**
 * Tool: get_log_context
 *
 * Shows logs before and after a specific point in time. Essential for
 * root-cause analysis: once the LLM finds an error via search, it can
 * use this tool to see what happened around that moment.
 *
 * Delegates to the server's `/context` endpoint which runs two ranged
 * queries (before + after) in a single roundtrip.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { PinoramaClient } from "pinorama-client/node"
import { z } from "zod"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatLogEntry, formatToolError } from "../utils/format.mjs"

export function registerGetLogContext(
  server: McpServer,
  client: PinoramaClient<any>
) {
  server.registerTool(
    "get_log_context",
    {
      title: "Get Log Context",
      description:
        "Get logs surrounding a specific timestamp. Shows what happened before and after a point in time. Useful for investigating errors by seeing the full context.",
      inputSchema: {
        timestamp: z
          .number()
          .describe("The timestamp (Unix ms) to center the context around"),
        before: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Number of log entries to show before the timestamp"),
        after: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Number of log entries to show after the timestamp"),
        where: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Orama where clause for filtering")
      },
      annotations: READONLY_ANNOTATIONS
    },
    async (params) => {
      try {
        const result = await client.context({
          timestamp: params.timestamp,
          before: params.before,
          after: params.after,
          where: params.where
        })

        // Format with visual separators so the LLM can clearly distinguish
        // the "before" and "after" sections relative to the target timestamp.
        const lines: string[] = []

        if (result.before.length > 0) {
          lines.push(`--- ${result.before.length} logs BEFORE timestamp ---`)
          for (const hit of result.before) {
            lines.push(formatLogEntry(hit.document as Record<string, unknown>))
          }
        }

        lines.push("")
        lines.push(
          `--- TIMESTAMP: ${new Date(params.timestamp).toISOString()} ---`
        )
        lines.push("")

        if (result.after.length > 0) {
          lines.push(`--- ${result.after.length} logs AFTER timestamp ---`)
          for (const hit of result.after) {
            lines.push(formatLogEntry(hit.document as Record<string, unknown>))
          }
        }

        if (result.before.length === 0 && result.after.length === 0) {
          lines.push("No logs found around this timestamp.")
        }

        return {
          content: [{ type: "text" as const, text: lines.join("\n") }]
        }
      } catch (error) {
        return formatToolError(error)
      }
    }
  )
}
