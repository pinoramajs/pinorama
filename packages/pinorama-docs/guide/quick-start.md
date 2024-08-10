---
outline: deep
---

# Quick Start

Get up and running with **Pinorama Studio** in minutes! This guide will walk you through the process of installing Pinorama Studio and integrating it with a simple Node.js application.

## Prerequisites

- [Node.js](https://nodejs.org/) version 20 or higher.
- Terminal for starting the Pinorama Studio CLI.

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

Let's set up a minimal Fastify application with Pinorama Studio for log viewing:

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

3. Create an `index.js` file with the following content:

   ```javascript
   const fastify = require("fastify")({
     logger: true, // needed for piping logs to Pinorama!
   });

   fastify.get("/", async (request, reply) => {
     request.log.info("Pinorama is awesome! 🚀");
     return { hello: "world" };
   });

   fastify.listen({ port: 3000 });
   ```

4. Run your application and pipe the output to Pinorama Studio:

   ```sh
   node index.js | pinorama --open
   ```

This command will start your Fastify application, pipe its logs to Pinorama Studio, and open the Pinorama web interface in your default browser.

## Next Steps

Check out the full Pinorama documentation for information on customizing your logging setup and using other Pinorama components.

Happy logging with Pinorama!
