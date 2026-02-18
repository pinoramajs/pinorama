/**
 * Prompt: investigate_error
 *
 * Guides the LLM through an error investigation workflow:
 * search for recent errors, examine their context, and identify patterns.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

export function registerInvestigateErrorPrompt(server: McpServer) {
  server.registerPrompt(
    "investigate_error",
    {
      title: "Investigate Error",
      description:
        "Investigate recent errors in the logs. Optionally filter by error message.",
      argsSchema: {
        message: z
          .string()
          .optional()
          .describe("Error message or keyword to search for")
      }
    },
    (args) => {
      const messageFilter = args.message
        ? `Search for errors containing "${args.message}" using the search_logs tool with a term filter and where clause for level in [50, 60].`
        : "Search for recent errors using tail_logs with a where clause filtering for level in [50, 60] (ERROR and FATAL)."

      const text = `Investigate errors in the log database. Follow these steps:

1. **Find errors**: ${messageFilter}

2. **Examine context**: For each significant error found, use get_log_context with the error's timestamp to see what happened immediately before and after.

3. **Identify patterns**: Use get_field_values on relevant fields (e.g., "req.url", "hostname") filtered to level in [50, 60] to see if errors concentrate on specific endpoints or hosts.

4. **Summarize findings**: Report the errors found, their frequency, temporal patterns, and likely root causes based on the surrounding context.`

      return {
        messages: [{ role: "user" as const, content: { type: "text", text } }]
      }
    }
  )
}
