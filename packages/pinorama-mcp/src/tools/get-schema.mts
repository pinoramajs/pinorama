/**
 * Tool: get_schema
 *
 * Returns the database schema — fields, types, facets, columns, labels.
 * This is designed to be the LLM's first call: the description explicitly
 * says "use this first" so the model knows what fields exist before
 * attempting search or filter queries.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatSchema, formatToolError } from "../utils/format.mjs"
import type { GetIntrospection } from "../utils/introspection.mjs"

export function registerGetSchema(
  server: McpServer,
  getIntrospection: GetIntrospection
) {
  server.registerTool(
    "get_schema",
    {
      title: "Get Log Schema",
      description:
        "Get the schema of the log database, including field names, types, and which fields are searchable or filterable. Use this first to understand the data structure before querying.",
      inputSchema: {},
      annotations: READONLY_ANNOTATIONS
    },
    async () => {
      try {
        const introspection = await getIntrospection()
        const text = formatSchema(introspection)

        return {
          content: [{ type: "text" as const, text }]
        }
      } catch (error) {
        return formatToolError(error)
      }
    }
  )
}
