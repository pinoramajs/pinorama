---
outline: deep
---

# Quick Start

Get up and running with Pinorama Studio in minutes.

## Prerequisites

- [Node.js](https://nodejs.org/) version 20 or higher
- A terminal for running the CLI

## Installation

Install Pinorama Studio globally:

::: code-group

```sh [npm]
npm i -g pinorama-studio
```

```sh [pnpm]
pnpm i -g pinorama-studio
```

```sh [yarn]
yarn global add pinorama-studio
```

:::

## Quick Setup

Create a minimal Fastify application with Pinorama Studio for log viewing:

1. Create a new directory:

   ```sh
   mkdir pinorama-demo && cd pinorama-demo
   ```

2. Install Fastify:

   ::: code-group

   ```sh [npm]
   npm add fastify
   ```

   ```sh [pnpm]
   pnpm add fastify
   ```

   ```sh [yarn]
   yarn add fastify
   ```

   :::

3. Create an `index.js` file:

   ```javascript {2}
   const fastify = require("fastify")({
     logger: true // needed for piping logs to Pinorama
   })

   fastify.get("/", async (request, reply) => {
     request.log.info("Pinorama is awesome!")
     return { hello: "world" }
   })

   fastify.listen({ port: 3000 })
   ```

4. Run your application and pipe the output to Pinorama Studio:

   ```sh
   node index.js | pinorama --open
   ```

This starts your Fastify application, pipes its logs to Pinorama Studio, and opens the web interface in your default browser.

## Next Steps

- [Pinorama Studio](/packages/studio) — Keyboard shortcuts, Live Mode, Details panel, and all CLI options
- [Pinorama Server](/packages/server) — Run a standalone server with authentication and persistence
- [Pinorama MCP](/packages/mcp) — Connect AI assistants to your log database
- [Presets](/advanced/presets) — Customize schemas, columns, facets, and styles
- [Persistence](/advanced/persistence) — Save logs to disk and restore on startup
