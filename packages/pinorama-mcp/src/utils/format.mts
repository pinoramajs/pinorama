/**
 * Text formatting utilities for MCP tool output.
 *
 * All MCP tool responses are plain text (not JSON) because LLMs process
 * natural-language output more efficiently than raw JSON. The formatting
 * prioritizes readability: timestamps are human-friendly, log levels are
 * named, and distributions use ASCII bar charts.
 */

import { PinoramaError } from "pinorama-client/node"

// Standard pino log levels — values are multiples of 10 by convention,
// matching pino's numeric level system.
const LEVEL_MAP: Record<number, string> = {
  10: "TRACE",
  20: "DEBUG",
  30: "INFO",
  40: "WARN",
  50: "ERROR",
  60: "FATAL"
}

/**
 * Converts a Unix-ms timestamp to a readable ISO-like format.
 * Strips the "T" separator and trailing "Z" for compactness in log output.
 */
export function formatTimestamp(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").replace("Z", "")
}

/**
 * Maps numeric pino levels to human-readable names.
 * Falls back to "LVL{n}" for custom levels outside the standard range.
 */
export function formatLevel(level: number): string {
  return LEVEL_MAP[level] ?? `LVL${level}`
}

/**
 * Formats a single log document into a concise text representation.
 *
 * Output format:
 *   [timestamp] LEVEL  message
 *      extra.field=value  another=value
 *
 * The "skip" set excludes fields already shown in the header line
 * and internal metadata (`_pinorama`) that isn't useful for analysis.
 * Nested objects are flattened one level deep (e.g., `req.method=GET`).
 */
export function formatLogEntry(
  doc: Record<string, unknown>,
  index?: number
): string {
  const time = doc.time as number | undefined
  const level = doc.level as number | undefined
  const msg = doc.msg as string | undefined
  const meta = doc._pinorama as { createdAt?: number } | undefined

  // Prefer the original pino timestamp; fall back to the server-assigned
  // ingestion timestamp if the log was received without `time`.
  const ts = time ?? meta?.createdAt ?? 0
  const prefix = index !== undefined ? `${index}. ` : ""
  const levelStr =
    level !== undefined ? `${formatLevel(level).padEnd(5)}  ` : ""

  const line = `${prefix}[${formatTimestamp(ts)}] ${levelStr}${msg ?? ""}`

  // Fields already rendered in the header line or internal to Pinorama
  const skip = new Set(["time", "level", "msg", "pid", "hostname", "_pinorama"])
  const extras: string[] = []

  for (const [key, val] of Object.entries(doc)) {
    if (skip.has(key)) continue
    if (typeof val === "object" && val !== null) {
      // Flatten one level — covers pino's req/res objects without
      // deep-recursing into large nested structures.
      for (const [subKey, subVal] of Object.entries(
        val as Record<string, unknown>
      )) {
        extras.push(`${key}.${subKey}=${subVal}`)
      }
    } else {
      extras.push(`${key}=${val}`)
    }
  }

  if (extras.length > 0) {
    return `${line}\n   ${extras.join("  ")}`
  }

  return line
}

/**
 * Formats a page of search results with pagination hints.
 * The "N more results available" footer guides the LLM to use
 * offset-based pagination for large result sets.
 */
export function formatSearchResults(
  hits: Array<{ document: Record<string, unknown> }>,
  total: number,
  offset: number
): string {
  if (hits.length === 0) {
    return "No results found."
  }

  const lines: string[] = [
    `Found ${total} results (showing ${offset + 1}-${offset + hits.length}):`,
    ""
  ]

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i]
    if (hit) {
      lines.push(formatLogEntry(hit.document, offset + i + 1))
    }
  }

  const remaining = total - offset - hits.length
  if (remaining > 0) {
    lines.push("")
    lines.push(
      `${remaining} more results available (use offset: ${offset + hits.length})`
    )
  }

  return lines.join("\n")
}

/**
 * Renders a proportional ASCII bar using block characters (█).
 * Width is capped to keep output compact in the LLM context window.
 */
export function formatBar(value: number, maxValue: number, width = 16): string {
  const filled = Math.round((value / maxValue) * width)
  return "\u2588".repeat(filled)
}

/**
 * Formats introspection data (schema) as a readable markdown document.
 *
 * Shared between the `get_schema` tool and the `pinorama://schema` resource
 * so that both produce identical output.
 */
export function formatSchema(introspection: Record<string, any>): string {
  const lines: string[] = ["# Log Schema", ""]

  if (introspection.searchProperties?.length) {
    lines.push(
      `**Searchable fields:** ${introspection.searchProperties.join(", ")}`
    )
    lines.push("")
  }

  if (introspection.facets) {
    lines.push("## Filterable Fields")
    lines.push("")
    for (const [field, type] of Object.entries(introspection.facets)) {
      lines.push(`- **${field}** (${type})`)
    }
    lines.push("")
  }

  if (introspection.columns) {
    lines.push("## Available Columns")
    lines.push("")
    for (const [field, config] of Object.entries(introspection.columns)) {
      const col = config as { visible: boolean; size?: number }
      const visibility = col.visible ? "visible" : "hidden"
      lines.push(`- **${field}** (${visibility})`)
    }
    lines.push("")
  }

  if (introspection.labels) {
    lines.push("## Field Labels")
    lines.push("")
    for (const [field, label] of Object.entries(introspection.labels)) {
      if (typeof label === "string") {
        lines.push(`- **${field}**: ${label}`)
      } else if (Array.isArray(label)) {
        const [name, valueMap] = label as [string, Record<string, string>]
        const mappings = Object.entries(valueMap)
          .map(([k, v]) => `${k}=${v}`)
          .join(", ")
        lines.push(`- **${field}**: ${name} (${mappings})`)
      }
    }
  }

  return lines.join("\n")
}

/**
 * Builds an MCP-compliant error response from any caught error.
 *
 * Preserves full diagnostic info from PinoramaError (HTTP status + server
 * response body) so the LLM can reason about the failure cause.
 * For unknown errors, falls back to the message string.
 */
export function formatToolError(error: unknown) {
  let text: string

  if (error instanceof PinoramaError) {
    // Include HTTP status and the full server error response so the LLM
    // (and the user reviewing tool output) gets maximum diagnostic info.
    const parts = [`Error (HTTP ${error.status}): ${error.message}`]
    if (error.errorDetails) {
      parts.push(`Details: ${JSON.stringify(error.errorDetails)}`)
    }
    text = parts.join("\n")
  } else {
    text = `Error: ${error instanceof Error ? error.message : String(error)}`
  }

  return {
    isError: true as const,
    content: [{ type: "text" as const, text }]
  }
}
