/**
 * Resource: pinorama://schema
 *
 * Static resource that exposes the database schema (introspection).
 * The LLM loads this automatically into its context without needing
 * to call the `get_schema` tool explicitly.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { formatSchema } from "../utils/format.mjs"
import type { GetIntrospection } from "../utils/introspection.mjs"

export function registerSchemaResource(
  server: McpServer,
  getIntrospection: GetIntrospection
) {
  server.registerResource(
    "schema",
    "pinorama://schema",
    {
      description:
        "Database schema including field names, types, searchable and filterable fields. Read this to understand the data structure before querying.",
      mimeType: "text/markdown"
    },
    async () => {
      const introspection = await getIntrospection()
      const text = formatSchema(introspection)

      return {
        contents: [
          {
            uri: "pinorama://schema",
            mimeType: "text/markdown",
            text
          }
        ]
      }
    }
  )
}
