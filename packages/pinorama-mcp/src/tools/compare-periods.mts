/**
 * Tool: compare_periods
 *
 * Compares log volume (and optionally field distributions) between two
 * time windows. Runs two search queries in parallel for efficiency.
 *
 * Typical use cases:
 * - "Are there more errors today than yesterday?"
 * - "Is the error rate increasing?" (compare last hour vs previous hour)
 * - "How did the deploy affect response times?" (before vs after)
 *
 * When `field` is provided, the tool also shows a side-by-side breakdown
 * of value distributions (e.g., error count per level in each period).
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { PinoramaClient } from "pinorama-client/node"
import { z } from "zod"
import { READONLY_ANNOTATIONS } from "../utils/constants.mjs"
import { formatToolError } from "../utils/format.mjs"

const periodSchema = z.object({
  from: z.number().describe("Start timestamp (Unix ms)"),
  to: z.number().describe("End timestamp (Unix ms)")
})

export function registerComparePeriods(
  server: McpServer,
  client: PinoramaClient<any>
) {
  server.registerTool(
    "compare_periods",
    {
      title: "Compare Periods",
      description:
        "Compare log counts and distributions between two time periods. Useful for questions like 'Are there more errors today than yesterday?' or 'Is performance degrading?'.",
      inputSchema: {
        periodA: periodSchema.describe("First time period to compare"),
        periodB: periodSchema.describe("Second time period to compare"),
        field: z
          .string()
          .optional()
          .describe(
            "Optional field for distribution comparison (e.g., 'level' to compare error rates)"
          ),
        where: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Orama where clause for additional filtering")
      },
      annotations: READONLY_ANNOTATIONS
    },
    async (params) => {
      try {
        const buildSearchParams = (period: { from: number; to: number }) => {
          const searchParams: Record<string, unknown> = {
            // limit=0 + preflight=true: only need counts and facets,
            // not actual documents.
            limit: 0,
            preflight: true,
            where: {
              ...params.where,
              // Filter by server ingestion timestamp to bound each period.
              "_pinorama.createdAt": {
                between: [period.from, period.to]
              }
            }
          }

          if (params.field) {
            searchParams.facets = {
              [params.field]: { limit: 50, order: "DESC" }
            }
          }

          return searchParams
        }

        // Run both queries in parallel — they're independent.
        const [resultA, resultB] = await Promise.all([
          client.search(buildSearchParams(params.periodA) as any),
          client.search(buildSearchParams(params.periodB) as any)
        ])

        const countA = resultA.count
        const countB = resultB.count
        const diff = countB - countA
        const pctChange =
          countA > 0 ? ((diff / countA) * 100).toFixed(1) : "N/A"

        const lines: string[] = [
          "# Period Comparison",
          "",
          `**Period A:** ${new Date(params.periodA.from).toISOString()} → ${new Date(params.periodA.to).toISOString()}`,
          `**Period B:** ${new Date(params.periodB.from).toISOString()} → ${new Date(params.periodB.to).toISOString()}`,
          "",
          "## Counts",
          `- Period A: ${countA}`,
          `- Period B: ${countB}`,
          `- Difference: ${diff >= 0 ? "+" : ""}${diff} (${pctChange}%)`
        ]

        // If a field was specified, show a side-by-side value distribution
        // so the LLM can see what changed (e.g., more 500 errors in period B).
        if (params.field) {
          const distA = (resultA as any).facets?.[params.field]?.values ?? {}
          const distB = (resultB as any).facets?.[params.field]?.values ?? {}

          // Merge keys from both periods to catch values that appear
          // in only one of the two windows.
          const allKeys = new Set([
            ...Object.keys(distA as Record<string, number>),
            ...Object.keys(distB as Record<string, number>)
          ])

          lines.push("")
          lines.push(`## Distribution by "${params.field}"`)
          lines.push("")
          lines.push(
            `${"Value".padEnd(20)} ${"Period A".padStart(10)} ${"Period B".padStart(10)} ${"Diff".padStart(10)}`
          )
          lines.push("-".repeat(52))

          for (const key of allKeys) {
            const valA = (distA as Record<string, number>)[key] ?? 0
            const valB = (distB as Record<string, number>)[key] ?? 0
            const d = valB - valA
            const sign = d >= 0 ? "+" : ""
            lines.push(
              `${key.padEnd(20)} ${String(valA).padStart(10)} ${String(valB).padStart(10)} ${(sign + d).padStart(10)}`
            )
          }
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
