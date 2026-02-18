/**
 * Tool: get_field_values
 *
 * Shows the distribution of values for a given field (e.g., how many
 * logs per level, per hostname, per HTTP method). Uses Orama's faceted
 * search with `preflight: true` and `limit: 0` to skip returning actual
 * documents — we only need the facet counts.
 *
 * Output includes an ASCII bar chart for visual proportion comparison.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { PinoramaClient } from "pinorama-client/node"
import { z } from "zod"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatBar, formatToolError } from "../utils/format.mjs"
import {
  type GetIntrospection,
  validateFacetField
} from "../utils/introspection.mjs"

export function registerGetFieldValues(
  server: McpServer,
  client: PinoramaClient<any>,
  getIntrospection: GetIntrospection
) {
  server.registerTool(
    "get_field_values",
    {
      title: "Get Field Values",
      description:
        "Get the distribution of values for a specific field. Shows unique values with their counts, ordered by frequency. Use get_schema first to discover available fields.",
      inputSchema: {
        field: z
          .string()
          .describe(
            "The field to get value distribution for (e.g., 'level', 'hostname', 'req.method')"
          ),
        term: z
          .string()
          .optional()
          .describe("Optional search term to filter logs before aggregating"),
        where: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Orama where clause for filtering"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(50)
          .describe("Maximum number of distinct values to return")
      },
      annotations: READONLY_ANNOTATIONS
    },
    async (params) => {
      try {
        const introspection = await getIntrospection()
        const error = validateFacetField(introspection, params.field)
        if (error) return error

        // limit=0 + preflight=true: tells Orama to compute facets without
        // returning any documents. This is much cheaper than a full search
        // when we only need the value distribution.
        const searchParams: Record<string, unknown> = {
          limit: 0,
          preflight: true,
          facets: {
            [params.field]: {
              limit: params.limit,
              order: "DESC"
            }
          }
        }

        if (params.term) {
          searchParams.term = params.term
        }

        if (params.where) {
          searchParams.where = params.where
        }

        const result = await client.search(searchParams as any)

        const facetData = (result as any).facets?.[params.field]
        if (!facetData?.values || Object.keys(facetData.values).length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No values found for field "${params.field}".`
              }
            ]
          }
        }

        // Sort by count descending — Orama may not guarantee order.
        const values = Object.entries(
          facetData.values as Record<string, number>
        ).sort(([, a], [, b]) => (b as number) - (a as number))

        const maxCount = values[0]?.[1] as number
        const lines: string[] = [
          `Value distribution for "${params.field}" (${values.length} distinct values):`,
          ""
        ]

        for (const [value, count] of values) {
          const bar = formatBar(count as number, maxCount)
          lines.push(`${String(value).padEnd(20)} ${bar} ${count}`)
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
