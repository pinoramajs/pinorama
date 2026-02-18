/**
 * Tool: aggregate_by_field
 *
 * Groups logs by a field and optionally computes a metric (count, avg,
 * min, max) on a numeric field per group. Delegates to the server's
 * `/aggregate/field` endpoint which performs the grouping in Orama.
 *
 * Typical use cases:
 * - "Which endpoints are slowest?" → group by req.url, metric avg on responseTime
 * - "Group errors by hostname" → group by hostname, where level in [50, 60]
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

export function registerAggregateByField(
  server: McpServer,
  client: PinoramaClient<any>,
  getIntrospection: GetIntrospection
) {
  server.registerTool(
    "aggregate_by_field",
    {
      title: "Aggregate By Field",
      description:
        "Group logs by a field and optionally compute metrics (avg, min, max) on a numeric field. Useful for questions like 'Which endpoints are slowest?' or 'Group errors by hostname'.",
      inputSchema: {
        field: z
          .string()
          .describe(
            "The field to group by (e.g., 'req.url', 'hostname', 'level')"
          ),
        metric: z
          .object({
            field: z
              .string()
              .describe(
                "Numeric field to compute metric on (e.g., 'responseTime')"
              ),
            fn: z
              .enum(["count", "avg", "min", "max"])
              .describe("Aggregation function to apply")
          })
          .optional()
          .describe("Optional metric to compute for each group"),
        where: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Orama where clause for filtering"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Maximum number of groups to return")
      },
      annotations: READONLY_ANNOTATIONS
    },
    async (params) => {
      try {
        const introspection = await getIntrospection()
        const error = validateFacetField(introspection, params.field)
        if (error) return error

        const result = await client.aggregateByField({
          field: params.field,
          metric: params.metric,
          where: params.where,
          limit: params.limit
        })

        if (result.values.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No data found for field "${params.field}".`
              }
            ]
          }
        }

        const maxCount = Math.max(...result.values.map((v) => v.count))
        const lines: string[] = [
          `Top ${result.values.length} values for "${params.field}":`,
          ""
        ]

        for (const entry of result.values) {
          const bar = formatBar(entry.count, maxCount)
          let line = `${String(entry.value).padEnd(20)} ${bar} ${entry.count}`
          // Append the computed metric (e.g., avg responseTime) if present.
          if (entry.metric !== undefined && params.metric) {
            line += `  (${params.metric.fn}: ${entry.metric.toFixed(2)})`
          }
          lines.push(line)
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
