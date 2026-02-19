# pinorama-transport

A [Pino transport](https://getpino.io/#/docs/transports) that streams logs to [Pinorama Server](https://pinorama.dev/packages/server). Buffers logs in batches and retries failed inserts with exponential backoff.

## Installation

```sh
npm i pinorama-transport
```

## Usage

```js
import pino from "pino"

const logger = pino({
  transport: {
    target: "pinorama-transport",
    options: {
      url: "http://localhost:6200/pinorama"
    }
  }
})
```

### CLI

```sh
node app.js | pino-pinorama --url http://localhost:6200/pinorama
```

## Documentation

Full documentation at **[pinorama.dev/packages/transport](https://pinorama.dev/packages/transport)**.

## License

[MIT](https://github.com/pinoramajs/pinorama/blob/main/LICENSE)
