/**
 * Tool: get_stats
 *
 * Returns a quick overview of the log database: document count, memory
 * usage, and the time range of stored logs. Useful for the LLM to
 * understand the dataset size before deciding on query strategies
 * (e.g., whether to paginate, how far back logs go).
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { PinoramaClient } from "pinorama-client/node"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatTimestamp, formatToolError } from "../utils/format.mjs"

export function registerGetStats(
  server: McpServer,
  client: PinoramaClient<any>
) {
  server.registerTool(
    "get_stats",
    {
      title: "Get Database Stats",
      description:
        "Get an overview of the log database: total documents, memory usage, and time range of stored logs.",
      inputSchema: {},
      annotations: READONLY_ANNOTATIONS
    },
    async () => {
      try {
        const stats = await client.stats()

        const memoryMB = (stats.memoryUsage / 1024 / 1024).toFixed(2)

        const lines: string[] = [
          "# Database Stats",
          "",
          `- **Total documents:** ${stats.totalDocs}`,
          `- **Memory usage:** ${memoryMB} MB`
        ]

        if (stats.oldestTimestamp !== null) {
          lines.push(
            `- **Oldest log:** ${formatTimestamp(stats.oldestTimestamp)}`
          )
        }

        if (stats.newestTimestamp !== null) {
          lines.push(
            `- **Newest log:** ${formatTimestamp(stats.newestTimestamp)}`
          )
        }

        if (stats.oldestTimestamp !== null && stats.newestTimestamp !== null) {
          const spanMs = stats.newestTimestamp - stats.oldestTimestamp
          const spanHours = (spanMs / 1000 / 60 / 60).toFixed(1)
          lines.push(`- **Time span:** ${spanHours} hours`)
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
