---
outline: deep
---

# Overview

**Pinorama** is a suite of tools for storing, exploring, and analyzing logs from Node.js applications using [Pino Logger](http://getpino.io/).

::: tip
**Need a Quick Start?**

Head to [Quick Start](/guide/quick-start) to get up and running in minutes with Pinorama Studio.
:::

## Understanding the Suite

Pinorama consists of 5 key components, each with a specific role:

### 1. Pinorama Studio

A web app and CLI for viewing, filtering, and analyzing logs with minimal setup. Pipe logs from any Node.js process and get a full-featured log explorer in your browser. Pinorama Studio can also function as a server when launched with the `--server` option, making it ideal for live log streaming during development.

### 2. Pinorama Client

An isomorphic HTTP client that works in both Node.js and the browser. It provides methods for inserting, searching, and querying logs from Pinorama Server. Pinorama Client is used internally by Pinorama Studio and Pinorama Transport, but you can use it directly for custom integrations.

### 3. Pinorama Server

A Fastify plugin that exposes a REST API for storing and retrieving logs via [Orama](https://askorama.ai/). It supports custom schemas, authentication, persistence to disk, and auto-save. Pinorama Server can run standalone or integrate into an existing Fastify application.

### 4. Pinorama Transport

A [Pino transport](https://getpino.io/#/docs/transports) layer that streams logs to Pinorama Server. It buffers logs in batches with configurable flush intervals and retries failed inserts with exponential backoff. Available as a programmatic API or a `pino-pinorama` CLI.

### 5. Pinorama MCP

An [MCP](https://modelcontextprotocol.io/) integration that exposes the log database to AI assistants. Ask questions in natural language — the AI reads the schema, picks the right tools, and queries your logs. Runs standalone (stdio) or embedded inside Pinorama Server (HTTP/SSE).

## How It Works

Here is how the different components fit together:

1. **Generate Logs** — [Pino Logger](https://getpino.io/) creates structured JSON logs as your Node.js application runs.

2. **Stream Logs** — Pinorama Transport buffers these logs and sends them in batches to Pinorama Server via Pinorama Client.

3. **Store and Index** — Pinorama Server stores the logs in-memory using Orama, making them searchable via its REST API.

4. **Explore Logs** — Pinorama Studio connects to Pinorama Server and displays logs in a filterable, searchable table with keyboard navigation and live refresh.

5. **AI Analysis** *(optional)* — Pinorama MCP connects AI assistants to the log database for natural-language queries, error investigation, and performance analysis.

## When to Use

::: tip
**Development and debugging** — Pinorama is ideal for local development, offering tools for live log streaming, post-mortem analysis, and AI-powered log investigation.
:::

::: warning
**Production considerations** — Pinorama Server stores logs in-memory, which limits capacity to available RAM. For production use, consider enabling persistence (`dbPath`) and auto-save (`autoSaveInterval`) to protect against data loss. The MCP integration provides additional value for production log analysis through AI assistants.

```js
app.register(pinoramaServer, {
  introspection: preset.introspection,
  adminSecret: "my-secret",            // [!code ++]
  dbPath: "./data/logs.msp",           // [!code ++]
  autoSaveInterval: 60_000             // [!code ++]
})
```
:::
