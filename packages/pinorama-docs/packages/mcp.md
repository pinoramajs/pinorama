---
outline: deep
---

# MCP

**Pinorama MCP** exposes your log database to AI assistants via the [Model Context Protocol](https://modelcontextprotocol.io/). Ask questions in natural language — the AI reads the schema, picks the right tools, and queries your logs.

Two deployment modes are available:

- **Standalone** — Runs as a stdio process. Connect it from Claude Desktop, VS Code, or any MCP-compatible client.
- **Embedded** — Runs inside Pinorama Server over HTTP/SSE. Enable it from Pinorama Studio or via the REST API.

## Installation

::: code-group

```sh [npm]
npm i pinorama-mcp
```

```sh [pnpm]
pnpm i pinorama-mcp
```

```sh [yarn]
yarn add pinorama-mcp
```

:::

## Standalone Mode (stdio)

Standalone mode starts a stdio-based MCP server that connects to a running Pinorama Server.

```sh
pinorama-mcp http://localhost:6200/pinorama
```

### Claude Desktop Setup

Add the following to your Claude Desktop config file:

::: code-group

```json {4-10} [macOS]
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "pinorama": {
      "command": "npx",
      "args": [
        "pinorama-mcp",
        "http://localhost:6200/pinorama"
      ]
    }
  }
}
```

```json {4-10} [Windows]
// %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "pinorama": {
      "command": "npx",
      "args": [
        "pinorama-mcp",
        "http://localhost:6200/pinorama"
      ]
    }
  }
}
```

:::

### Claude Code Setup

```sh
claude mcp add pinorama -- npx pinorama-mcp http://localhost:6200/pinorama
```

### VS Code Setup

Add to your User Settings JSON (`Ctrl+Shift+P` / `Cmd+Shift+P`):

```json
{
  "mcp": {
    "servers": {
      "pinorama": {
        "command": "npx",
        "args": [
          "pinorama-mcp",
          "--url", "http://localhost:6200/pinorama"
        ]
      }
    }
  }
}
```

### Cursor Setup

Go to Cursor Settings > MCP and add a new server:

```json
{
  "command": "npx",
  "args": [
    "pinorama-mcp",
    "--url", "http://localhost:6200/pinorama"
  ]
}
```

## Embedded Mode (HTTP/SSE)

Pinorama Server includes a built-in MCP server that exposes the protocol over HTTP. No extra process is needed — AI clients connect directly to the server's `/mcp` endpoint.

### Enable via REST API

```sh {4}
curl -X POST http://localhost:6200/pinorama/mcp/status \
  -H "Content-Type: application/json" \
  -H "x-pinorama-admin-secret: my-secret" \
  -d '{"enabled": true}'
```

### Enable from Pinorama Studio

Open the MCP panel in Pinorama Studio and click **Enable**. The panel shows connection instructions for Claude Code, VS Code, Cursor, and other clients.

### Check Status

```sh
curl http://localhost:6200/pinorama/mcp/status
# {"enabled": false}
```

The `GET /mcp/status` endpoint does not require authentication.

## Tools

Pinorama MCP provides 9 tools. All tools are read-only.

| Tool | Description |
| --- | --- |
| `get_schema` | Get the database schema: field names, types, searchable and filterable fields |
| `search_logs` | Search logs with full-text search, field filters, sorting, and pagination |
| `tail_logs` | Get the most recent logs, ordered by time (newest first) |
| `count_logs` | Count logs matching filters without returning documents |
| `get_field_values` | Get the distribution of values for a field (e.g. how many logs per level) |
| `aggregate_by_field` | Group logs by a field and compute metrics (count, avg, min, max) |
| `get_log_context` | Get logs surrounding a specific timestamp (before and after) |
| `compare_periods` | Compare log counts and distributions between two time periods |
| `get_stats` | Get database overview: total documents, memory usage, time range |

## Prompts

Three pre-built prompts guide the AI through common analysis workflows.

| Prompt | Description |
| --- | --- |
| `investigate_error` | Find recent errors, examine their context, identify patterns, and summarize findings |
| `daily_summary` | Generate a daily report: log volume, level distribution, active endpoints, notable errors |
| `performance_report` | Analyze endpoint response times, identify slowest routes, compare trends |

## Resources

| Resource | URI | Description |
| --- | --- | --- |
| Schema | `pinorama://schema` | Database schema in Markdown format. Loaded automatically into the AI context. |

## Example Queries

Once connected, ask your AI assistant questions in natural language:

::: details Sample queries
- "Show me the last 20 errors"
- "What are the slowest endpoints?"
- "Compare error rates between the last hour and the hour before"
- "How many logs per level do we have?"
- "Show me what happened around this timestamp: 1700000000000"
- "Which endpoints have the highest error rate?"
- "Give me a daily summary of today's logs"
:::

## Security

- **Authentication** — In standalone mode, set the `PINORAMA_ADMIN_SECRET` environment variable if the server requires it. In embedded mode, the MCP endpoints (`POST/GET/DELETE /mcp`) do not require authentication, but `POST /mcp/status` (to toggle MCP on/off) does.
- **Read-only** — All MCP tools are read-only. They query the database but never modify it.
- **Network exposure** — In embedded mode, the MCP endpoint is available on the same host and port as Pinorama Server. Restrict network access accordingly in non-local environments.
