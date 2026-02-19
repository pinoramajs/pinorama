# pinorama-presets

Schema and introspection presets for [Pinorama](https://pinorama.dev). Presets define how logs are indexed, displayed, filtered, and styled.

This package ships with Pinorama Server. You only need to install it directly if you are building a custom preset.

## Built-in Presets

- **`pino`** — Default preset for standard Pino logs (time, level, msg, pid, hostname)
- **`fastify`** — Extended preset for Fastify apps (adds reqId, req.method, req.url, res.statusCode, responseTime)

## Custom Presets

```js
import { createPreset } from "pinorama-presets"

const myPreset = createPreset(schema, introspection)
```

## Documentation

Full documentation at **[pinorama.dev/advanced/presets](https://pinorama.dev/advanced/presets)**.

## License

[MIT](https://github.com/pinoramajs/pinorama/blob/main/LICENSE)
