/**
 * Prompt: performance_report
 *
 * Guides the LLM through a performance analysis:
 * aggregate by endpoint, identify slowest routes, compare with prior period.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

export function registerPerformanceReportPrompt(server: McpServer) {
  server.registerPrompt(
    "performance_report",
    {
      title: "Performance Report",
      description:
        "Analyze endpoint performance: response times, slowest routes, and trends."
    },
    () => {
      const text = `Generate a performance report for the application. Follow these steps:

1. **Endpoint response times**: Use aggregate_by_field grouped by "req.url" with a metric of avg on "responseTime" to find average response times per endpoint. Request the top 20 endpoints.

2. **Slowest endpoints**: From the aggregation results, identify the top 5 slowest endpoints. For each, use aggregate_by_field with max on "responseTime" to find peak response times.

3. **Period comparison**: Use get_stats to determine the time range of available data. Then use compare_periods to compare the first half vs the second half of the available time range, with the field "req.url" to see if traffic patterns shifted.

4. **Error correlation**: Use count_logs with a where clause for level in [50, 60] to check the overall error rate. Then use aggregate_by_field on "req.url" filtered to level in [50, 60] to see if slow endpoints also have high error rates.

5. **Final report**: Compile a performance report including:
   - Top 10 endpoints by average response time
   - Slowest endpoints with peak response times
   - Traffic and performance trends over time
   - Correlation between slow endpoints and error rates
   - Recommendations for optimization`

      return {
        messages: [{ role: "user" as const, content: { type: "text", text } }]
      }
    }
  )
}
