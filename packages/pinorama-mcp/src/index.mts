/**
 * pinorama-mcp — MCP (Model Context Protocol) server for Pinorama.
 *
 * Exposes Pinorama's log search and analytics capabilities as MCP tools,
 * resources, and prompts, allowing AI assistants (Claude, Copilot, etc.)
 * to query and analyze pino logs through a standardized protocol.
 *
 * Two usage modes:
 *
 * 1. **Standalone CLI** (`bin.mjs`):
 *    AI client ↔ stdio ↔ pinorama-mcp process ↔ HTTP ↔ pinorama-server
 *    Uses StdioServerTransport. The AI spawns this as a subprocess.
 *
 * 2. **Embedded in pinorama-server** (via `plugins/mcp.mts`):
 *    AI client ↔ HTTP/SSE ↔ pinorama-server /mcp ↔ loopback ↔ server routes
 *    Uses StreamableHTTPServerTransport. No extra process needed.
 *
 * In both modes the tool/resource/prompt logic is identical — only the
 * transport differs. `registerAll` is the shared entry point that both
 * modes use.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { McpServer as McpServerImpl } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import type { PinoramaClient } from "pinorama-client/node"
import { PinoramaClient as PinoramaClientImpl } from "pinorama-client/node"
import { registerDailySummaryPrompt } from "./prompts/daily-summary.mjs"
import { registerInvestigateErrorPrompt } from "./prompts/investigate-error.mjs"
import { registerPerformanceReportPrompt } from "./prompts/performance-report.mjs"
import { registerSchemaResource } from "./resources/schema.mjs"
import { registerAggregateByField } from "./tools/aggregate-by-field.mjs"
import { registerComparePeriods } from "./tools/compare-periods.mjs"
import { registerCountLogs } from "./tools/count-logs.mjs"
import { registerGetFieldValues } from "./tools/get-field-values.mjs"
import { registerGetLogContext } from "./tools/get-log-context.mjs"
import { registerGetSchema } from "./tools/get-schema.mjs"
import { registerGetStats } from "./tools/get-stats.mjs"
import { registerSearchLogs } from "./tools/search-logs.mjs"
import { registerTailLogs } from "./tools/tail-logs.mjs"
import { createIntrospectionCache } from "./utils/introspection.mjs"

/**
 * Registers all Pinorama MCP tools on the given server.
 *
 * Exported separately from `createMcpServer` so that the server-side
 * embedded mode can call it with its own transport and loopback client,
 * without going through the stdio-based `createMcpServer` factory.
 */
export function registerAllTools(
  server: McpServer,
  client: PinoramaClient<any>
) {
  const getIntrospection = createIntrospectionCache(client)

  // Schema/introspection — should be called first by the LLM to
  // discover available fields before querying.
  registerGetSchema(server, getIntrospection)

  // Core search tools — cover the most common log exploration flows.
  registerSearchLogs(server, client)
  registerTailLogs(server, client)
  registerGetLogContext(server, client)
  registerCountLogs(server, client)

  // Analytics tools — for deeper analysis and pattern discovery.
  registerGetFieldValues(server, client, getIntrospection)
  registerAggregateByField(server, client, getIntrospection)
  registerComparePeriods(server, client)

  // System info
  registerGetStats(server, client)
}

/**
 * Registers all Pinorama MCP resources on the given server.
 */
export function registerAllResources(
  server: McpServer,
  client: PinoramaClient<any>
) {
  const getIntrospection = createIntrospectionCache(client)
  registerSchemaResource(server, getIntrospection)
}

/**
 * Registers all Pinorama MCP prompts on the given server.
 */
export function registerAllPrompts(server: McpServer) {
  registerInvestigateErrorPrompt(server)
  registerDailySummaryPrompt(server)
  registerPerformanceReportPrompt(server)
}

/**
 * Registers all Pinorama MCP capabilities (tools, resources, prompts).
 */
export function registerAll(server: McpServer, client: PinoramaClient<any>) {
  registerAllTools(server, client)
  registerAllResources(server, client)
  registerAllPrompts(server)
}

/**
 * Creates a standalone MCP server with stdio transport.
 * Used by the CLI entry point (`bin.mjs`) when running as a subprocess.
 */
export async function createMcpServer(options: {
  url: string
  adminSecret?: string
}) {
  const client = new PinoramaClientImpl(options)

  const server = new McpServerImpl({
    name: "pinorama",
    version: "1.0.0"
  })

  registerAll(server, client)

  // Stdio transport: the AI client communicates via the process's
  // stdin/stdout streams (standard MCP subprocess model).
  const transport = new StdioServerTransport()
  await server.connect(transport)

  return server
}
