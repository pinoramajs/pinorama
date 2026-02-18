/**
 * Shared constants for MCP tool/resource registrations.
 */

/**
 * All Pinorama MCP tools are read-only queries against the log database.
 * This annotation set is shared across every tool registration.
 */
export const READONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
} as const
