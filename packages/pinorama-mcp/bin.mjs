#!/usr/bin/env node

/**
 * CLI entry point for pinorama-mcp.
 *
 * Usage:
 *   pinorama-mcp [url]
 *
 * Configuration:
 *   - URL: first CLI argument, or PINORAMA_URL env var (default: http://localhost:6200)
 *   - Auth: PINORAMA_ADMIN_SECRET env var (optional, for protected servers)
 *
 * Example (Claude Code):
 *   claude mcp add --transport stdio pinorama -- npx pinorama-mcp http://localhost:6200
 */

import { createMcpServer } from "./dist/index.mjs"

const url =
  process.argv[2] || process.env.PINORAMA_URL || "http://localhost:6200"
const adminSecret = process.env.PINORAMA_ADMIN_SECRET

createMcpServer({ url, adminSecret })
