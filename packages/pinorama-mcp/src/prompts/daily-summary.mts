/**
 * Prompt: daily_summary
 *
 * Guides the LLM through producing a daily log summary:
 * overall stats, log level distribution, active endpoints, notable errors.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

export function registerDailySummaryPrompt(server: McpServer) {
  server.registerPrompt(
    "daily_summary",
    {
      title: "Daily Summary",
      description:
        "Generate a summary of log activity for a given day. Defaults to today.",
      argsSchema: {
        date: z
          .string()
          .optional()
          .describe("Date in YYYY-MM-DD format (defaults to today)")
      }
    },
    (args) => {
      const dateStr = args.date ?? new Date().toISOString().split("T")[0]

      const text = `Generate a daily log summary for ${dateStr}. Follow these steps:

1. **Database overview**: Call get_stats to get the total document count and time range.

2. **Log level distribution**: Use get_field_values on the "level" field to see the breakdown of log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL). Note any unusual proportions of errors or warnings.

3. **Active endpoints**: Use aggregate_by_field grouped by "req.url" to identify the most active endpoints. If a response time field is available, include the avg metric on "responseTime".

4. **Error summary**: Use search_logs with a where clause for level in [50, 60] to find the most recent errors. Look for recurring patterns or clusters.

5. **Final report**: Compile a concise daily summary including:
   - Total log volume and time span
   - Log level breakdown with percentages
   - Top 5 most active endpoints
   - Notable errors and their frequency
   - Any anomalies or concerns`

      return {
        messages: [{ role: "user" as const, content: { type: "text", text } }]
      }
    }
  )
}
