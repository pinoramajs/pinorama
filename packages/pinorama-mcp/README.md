# pinorama-mcp

A [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes your log database to AI assistants. Ask questions in natural language — the AI reads the schema, picks the right tools, and queries your logs.

## Installation

```sh
npm i pinorama-mcp
```

## Standalone Mode

```sh
pinorama-mcp http://localhost:6200/pinorama
```

### Claude Desktop

```json
{
  "mcpServers": {
    "pinorama": {
      "command": "npx",
      "args": ["pinorama-mcp", "http://localhost:6200/pinorama"]
    }
  }
}
```

### Claude Code

```sh
claude mcp add pinorama -- npx pinorama-mcp http://localhost:6200/pinorama
```

## Tools

`get_schema` · `search_logs` · `tail_logs` · `count_logs` · `get_field_values` · `aggregate_by_field` · `get_log_context` · `compare_periods` · `get_stats`

## Documentation

Full documentation at **[pinorama.dev/packages/mcp](https://pinorama.dev/packages/mcp)**.

## License

[MIT](https://github.com/pinoramajs/pinorama/blob/main/LICENSE)
